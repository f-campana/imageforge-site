import path from "node:path";

import { makeCheck, makeOpportunity } from "./types.mjs";
import {
  extractAltValues,
  extractHrefs,
  extractTargetBlankAnchors,
  fileExists,
  listFilesRecursively,
  readTextOrNull,
} from "./utils.mjs";

const GENERIC_ALT_TEXT = new Set(["image", "photo", "picture", "hero"]);
const EXCLUDED_H1_AUDIT_FILES = new Set([
  "app/opengraph-image.tsx",
  "app/twitter-image.tsx",
  "app/benchmarks/latest/opengraph-image.tsx",
  "app/benchmarks/latest/twitter-image.tsx",
]);
const MODULE_RESOLUTION_EXTENSIONS = [".tsx", ".ts", ".jsx", ".js", ".mjs"];

export function evaluateMetadataFields(layoutSource) {
  const metadataBase = /metadataBase\s*:/.test(layoutSource);
  const canonical = /alternates\s*:\s*{[\s\S]*?canonical\s*:/.test(
    layoutSource,
  );
  const openGraphImage =
    /openGraph\s*:\s*{[\s\S]*?images\s*:\s*\[/.test(layoutSource) &&
    /opengraph-image/.test(layoutSource);
  const twitterImage =
    /twitter\s*:\s*{[\s\S]*?images\s*:\s*\[/.test(layoutSource) &&
    /twitter-image/.test(layoutSource);

  return {
    metadataBase,
    canonical,
    openGraphImage,
    twitterImage,
  };
}

export function evaluateSchemaPresence(pageSource, schemaSource) {
  return {
    jsonLdScript: /application\/ld\+json/.test(pageSource),
    pageUsesHomepageSchemaBuilder: /buildHomepageSchemas\s*\(/.test(pageSource),
    pageUsesJsonLdSerializer: /serializeJsonLd\s*\(/.test(pageSource),
    websiteSchemaBuilder:
      /export\s+function\s+buildWebsiteSchema\s*\(/.test(schemaSource) &&
      /export\s+function\s+buildWebsiteSchema[\s\S]*?["']@type["']\s*:\s*["']WebSite["']/.test(
        schemaSource,
      ),
    softwareApplicationSchemaBuilder:
      /export\s+function\s+buildSoftwareApplicationSchema\s*\(/.test(
        schemaSource,
      ) &&
      /export\s+function\s+buildSoftwareApplicationSchema[\s\S]*?["']@type["']\s*:\s*["']SoftwareApplication["']/.test(
        schemaSource,
      ),
    homepageSchemaIncludesWebsite:
      /export\s+function\s+buildHomepageSchemas[\s\S]*?buildWebsiteSchema\s*\(/.test(
        schemaSource,
      ),
    homepageSchemaIncludesSoftwareApplication:
      /export\s+function\s+buildHomepageSchemas[\s\S]*?buildSoftwareApplicationSchema\s*\(/.test(
        schemaSource,
      ),
  };
}

function resolveRouteFromFile(appDir, absolutePath) {
  const relative = path.relative(appDir, absolutePath).replaceAll("\\", "/");

  if (!relative.endsWith("/page.tsx") && relative !== "page.tsx") {
    return null;
  }

  if (relative === "page.tsx") {
    return "/";
  }

  const withoutPage = relative.slice(0, -"/page.tsx".length);
  const segments = withoutPage
    .split("/")
    .filter(Boolean)
    .filter((segment) => !segment.startsWith("("));

  return `/${segments.join("/")}`;
}

function isInternalHref(href) {
  return href.startsWith("/") && !href.startsWith("//");
}

function normalizeHrefForRoute(href) {
  const [pathOnly] = href.split(/[?#]/, 1);
  if (!pathOnly) {
    return "/";
  }

  return pathOnly.endsWith("/") && pathOnly.length > 1
    ? pathOnly.slice(0, -1)
    : pathOnly;
}

function escapeRegex(input) {
  return input.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

function isDynamicSegment(segment) {
  return /^\[[^/[\]]+\]$/.test(segment);
}

function isCatchAllSegment(segment) {
  return /^\[\.\.\.[^/[\]]+\]$/.test(segment);
}

function isOptionalCatchAllSegment(segment) {
  return /^\[\[\.\.\.[^/[\]]+\]\]$/.test(segment);
}

function isDynamicRoute(route) {
  return route
    .split("/")
    .filter(Boolean)
    .some(
      (segment) =>
        isDynamicSegment(segment) ||
        isCatchAllSegment(segment) ||
        isOptionalCatchAllSegment(segment),
    );
}

function buildDynamicRouteRegex(route) {
  const segments = route.split("/").filter(Boolean);
  if (segments.length === 0) {
    return /^\/$/;
  }

  let pattern = "^";

  for (const segment of segments) {
    if (isOptionalCatchAllSegment(segment)) {
      pattern += "(?:/(?:[^/]+(?:/[^/]+)*))?";
      continue;
    }

    if (isCatchAllSegment(segment)) {
      pattern += "/(?:[^/]+(?:/[^/]+)*)";
      continue;
    }

    if (isDynamicSegment(segment)) {
      pattern += "/[^/]+";
      continue;
    }

    pattern += `/${escapeRegex(segment)}`;
  }

  pattern += "$";

  return new RegExp(pattern);
}

export function findBrokenInternalLinks(hrefs, routes) {
  const normalizedRoutes = routes.map((route) =>
    route.endsWith("/") && route.length > 1 ? route.slice(0, -1) : route,
  );
  const staticRoutes = new Set(
    normalizedRoutes.filter((route) => !isDynamicRoute(route)),
  );
  const dynamicRouteMatchers = normalizedRoutes
    .filter((route) => isDynamicRoute(route))
    .map((route) => ({
      route,
      matcher: buildDynamicRouteRegex(route),
    }));

  return hrefs
    .filter(isInternalHref)
    .map(normalizeHrefForRoute)
    .filter((href) => {
      if (staticRoutes.has(href)) {
        return false;
      }

      return !dynamicRouteMatchers.some((entry) => entry.matcher.test(href));
    });
}

function includeInH1Audit(rootDir, filePath) {
  const relativePath = path.relative(rootDir, filePath).replaceAll("\\", "/");
  return !EXCLUDED_H1_AUDIT_FILES.has(relativePath);
}

function extractModuleSpecifiers(source) {
  const specifiers = [];
  const pattern =
    /(?:^|\s)(?:import|export)\s+(?:[\s\S]*?\s+from\s+)?["']([^"']+)["']/gm;

  for (const match of source.matchAll(pattern)) {
    if (match[1]) {
      specifiers.push(match[1]);
    }
  }

  return specifiers;
}

function resolveModuleFromSpecifier(
  importerPath,
  specifier,
  rootDir,
  knownSourceFiles,
) {
  let unresolvedPath = null;

  if (specifier.startsWith("./") || specifier.startsWith("../")) {
    unresolvedPath = path.resolve(path.dirname(importerPath), specifier);
  } else if (specifier.startsWith("@/")) {
    unresolvedPath = path.resolve(rootDir, specifier.slice(2));
  } else {
    return null;
  }

  if (knownSourceFiles.has(unresolvedPath)) {
    return unresolvedPath;
  }

  if (!path.extname(unresolvedPath)) {
    for (const extension of MODULE_RESOLUTION_EXTENSIONS) {
      const candidate = `${unresolvedPath}${extension}`;
      if (knownSourceFiles.has(candidate)) {
        return candidate;
      }
    }
  }

  for (const extension of MODULE_RESOLUTION_EXTENSIONS) {
    const indexCandidate = path.join(unresolvedPath, `index${extension}`);
    if (knownSourceFiles.has(indexCandidate)) {
      return indexCandidate;
    }
  }

  return null;
}

function collectRouteSourceGraph(entryFilePath, fileContentsByPath, rootDir) {
  const knownSourceFiles = new Set(fileContentsByPath.keys());
  const visited = new Set();
  const queue = [path.resolve(entryFilePath)];

  while (queue.length > 0) {
    const currentPath = queue.pop();
    if (!currentPath || visited.has(currentPath)) {
      continue;
    }

    if (!knownSourceFiles.has(currentPath)) {
      continue;
    }

    visited.add(currentPath);
    const source = fileContentsByPath.get(currentPath) ?? "";

    for (const specifier of extractModuleSpecifiers(source)) {
      const resolved = resolveModuleFromSpecifier(
        currentPath,
        specifier,
        rootDir,
        knownSourceFiles,
      );
      if (resolved && !visited.has(resolved)) {
        queue.push(resolved);
      }
    }
  }

  return [...visited];
}

export function evaluateRouteH1Coverage(routeEntries) {
  if (routeEntries.length === 0) {
    return {
      status: "warn",
      message: "No indexable routes were found for H1 audit.",
      evidence: "No app/**/page.tsx files discovered.",
    };
  }

  const invalidEntries = routeEntries.filter((entry) => entry.h1Count !== 1);
  const evidence = routeEntries
    .map(
      (entry) =>
        `${entry.route}=${entry.h1Count}h1 (source=${entry.sourceFile}, files=${entry.auditedFileCount})`,
    )
    .join("; ");

  if (invalidEntries.length === 0) {
    return {
      status: "pass",
      message: "Each indexable route resolves to exactly one H1.",
      evidence,
    };
  }

  return {
    status: "warn",
    message:
      "Some indexable routes do not resolve to exactly one H1 in audited source.",
    evidence,
  };
}

export async function runTechnicalChecks(config) {
  const layoutPath = path.join(config.appDir, "layout.tsx");
  const pagePath = path.join(config.appDir, "page.tsx");
  const schemaPath = path.join(config.rootDir, "lib", "seo", "schema.ts");
  const robotsPath = path.join(config.appDir, "robots.ts");
  const sitemapPath = path.join(config.appDir, "sitemap.ts");
  const ogImagePath = path.join(config.appDir, "opengraph-image.tsx");
  const twitterImagePath = path.join(config.appDir, "twitter-image.tsx");

  const checks = [];
  const opportunities = [];

  checks.push(
    makeCheck({
      id: "technical.site_url_resolution",
      suite: "technical",
      severity: "critical",
      status: config.site.url ? "pass" : "fail",
      message: config.site.url
        ? `Resolved canonical URL from ${config.site.source}.`
        : "Canonical site URL is unresolved.",
      evidence:
        config.site.url ?? config.site.error ?? "No URL candidate found.",
      fixHint:
        "Set NEXT_PUBLIC_SITE_URL to an absolute URL (for example https://imageforge.dev).",
      file: ".env.example",
    }),
  );

  const layoutSource = (await readTextOrNull(layoutPath)) ?? "";
  const metadata = evaluateMetadataFields(layoutSource);

  checks.push(
    makeCheck({
      id: "technical.metadata_base",
      suite: "technical",
      severity: "critical",
      status: metadata.metadataBase ? "pass" : "fail",
      message: metadata.metadataBase
        ? "`metadataBase` is configured in root metadata."
        : "Missing `metadataBase` in root metadata.",
      evidence: "app/layout.tsx",
      fixHint:
        "Set metadataBase to resolveSiteUrl() so canonical/OG URLs stay consistent.",
      file: "app/layout.tsx",
    }),
  );

  checks.push(
    makeCheck({
      id: "technical.canonical",
      suite: "technical",
      severity: "critical",
      status: metadata.canonical ? "pass" : "fail",
      message: metadata.canonical
        ? "Canonical alternate is configured."
        : "Missing canonical alternate in metadata.",
      evidence: "app/layout.tsx",
      fixHint: "Add alternates.canonical for every indexable route.",
      file: "app/layout.tsx",
    }),
  );

  const robotsExists = await fileExists(robotsPath);
  checks.push(
    makeCheck({
      id: "technical.robots",
      suite: "technical",
      severity: "critical",
      status: robotsExists ? "pass" : "fail",
      message: robotsExists
        ? "robots route exists."
        : "Missing app/robots.ts route.",
      evidence: robotsPath,
      fixHint: "Add app/robots.ts and include a sitemap reference.",
      file: "app/robots.ts",
    }),
  );

  const sitemapExists = await fileExists(sitemapPath);
  checks.push(
    makeCheck({
      id: "technical.sitemap",
      suite: "technical",
      severity: "critical",
      status: sitemapExists ? "pass" : "fail",
      message: sitemapExists
        ? "Sitemap route exists."
        : "Missing app/sitemap.ts route.",
      evidence: sitemapPath,
      fixHint: "Add app/sitemap.ts returning every indexable URL.",
      file: "app/sitemap.ts",
    }),
  );

  const ogExists = await fileExists(ogImagePath);
  const twitterExists = await fileExists(twitterImagePath);

  checks.push(
    makeCheck({
      id: "technical.opengraph_image",
      suite: "technical",
      severity: "critical",
      status: ogExists && metadata.openGraphImage ? "pass" : "fail",
      message:
        ogExists && metadata.openGraphImage
          ? "Open Graph image route and metadata link are configured."
          : "Missing Open Graph image route or metadata image reference.",
      evidence: `${ogImagePath} + app/layout.tsx`,
      fixHint:
        "Add app/opengraph-image.tsx and reference /opengraph-image in metadata.openGraph.images.",
      file: "app/layout.tsx",
    }),
  );

  checks.push(
    makeCheck({
      id: "technical.twitter_image",
      suite: "technical",
      severity: "critical",
      status: twitterExists && metadata.twitterImage ? "pass" : "fail",
      message:
        twitterExists && metadata.twitterImage
          ? "Twitter image route and metadata link are configured."
          : "Missing Twitter image route or metadata image reference.",
      evidence: `${twitterImagePath} + app/layout.tsx`,
      fixHint:
        "Add app/twitter-image.tsx and reference /twitter-image in metadata.twitter.images.",
      file: "app/layout.tsx",
    }),
  );

  const pageSource = (await readTextOrNull(pagePath)) ?? "";
  const schemaSource = (await readTextOrNull(schemaPath)) ?? "";
  const schema = evaluateSchemaPresence(pageSource, schemaSource);

  const schemaPass =
    schema.jsonLdScript &&
    schema.pageUsesHomepageSchemaBuilder &&
    schema.pageUsesJsonLdSerializer &&
    schema.websiteSchemaBuilder &&
    schema.softwareApplicationSchemaBuilder &&
    schema.homepageSchemaIncludesWebsite &&
    schema.homepageSchemaIncludesSoftwareApplication;

  checks.push(
    makeCheck({
      id: "technical.structured_data",
      suite: "technical",
      severity: "critical",
      status: schemaPass ? "pass" : "fail",
      message: schemaPass
        ? "Homepage includes required WebSite and SoftwareApplication JSON-LD."
        : "Missing required homepage JSON-LD wiring or schema builders.",
      evidence: [
        `jsonLdScript=${schema.jsonLdScript}`,
        `pageUsesHomepageSchemaBuilder=${schema.pageUsesHomepageSchemaBuilder}`,
        `pageUsesJsonLdSerializer=${schema.pageUsesJsonLdSerializer}`,
        `websiteSchemaBuilder=${schema.websiteSchemaBuilder}`,
        `softwareApplicationSchemaBuilder=${schema.softwareApplicationSchemaBuilder}`,
        `homepageSchemaIncludesWebsite=${schema.homepageSchemaIncludesWebsite}`,
        `homepageSchemaIncludesSoftwareApplication=${schema.homepageSchemaIncludesSoftwareApplication}`,
      ].join("; "),
      fixHint:
        "Inject application/ld+json scripts on homepage and include WebSite + SoftwareApplication schema definitions.",
      file: "app/page.tsx",
    }),
  );

  const sourceFiles = [
    ...(await listFilesRecursively(config.appDir, (filePath) =>
      /\.(tsx|ts)$/.test(filePath),
    )),
    ...(await listFilesRecursively(config.componentsDir, (filePath) =>
      /\.(tsx|ts)$/.test(filePath),
    )),
  ];

  const fileContents = await Promise.all(
    sourceFiles.map(async (filePath) => ({
      filePath,
      content: (await readTextOrNull(filePath)) ?? "",
    })),
  );
  const fileContentsByPath = new Map(
    fileContents.map((file) => [path.resolve(file.filePath), file.content]),
  );
  const pageFiles = await listFilesRecursively(config.appDir, (filePath) =>
    /page\.tsx$/.test(filePath),
  );
  const routeH1Entries = pageFiles
    .map((pageFilePath) => {
      const route = resolveRouteFromFile(config.appDir, pageFilePath);
      if (!route) {
        return null;
      }

      const routeSourceGraph = collectRouteSourceGraph(
        pageFilePath,
        fileContentsByPath,
        config.rootDir,
      );
      const auditedFiles = routeSourceGraph.filter((sourceFilePath) =>
        includeInH1Audit(config.rootDir, sourceFilePath),
      );
      const h1Count = auditedFiles.reduce(
        (count, sourceFilePath) =>
          count +
          (fileContentsByPath.get(sourceFilePath)?.match(/<h1\b/g)?.length ??
            0),
        0,
      );

      return {
        route,
        h1Count,
        sourceFile: path.relative(config.rootDir, pageFilePath),
        auditedFileCount: auditedFiles.length,
      };
    })
    .filter(Boolean);

  const h1Coverage = evaluateRouteH1Coverage(routeH1Entries);
  checks.push(
    makeCheck({
      id: "technical.heading_h1",
      suite: "technical",
      severity: "high",
      status: h1Coverage.status,
      message: h1Coverage.message,
      evidence: h1Coverage.evidence,
      fixHint: "Ensure each indexable page renders exactly one descriptive H1.",
      file: "app",
    }),
  );

  const hrefs = fileContents.flatMap((file) => extractHrefs(file.content));
  const routes = pageFiles
    .map((filePath) => resolveRouteFromFile(config.appDir, filePath))
    .filter(Boolean);

  const brokenInternalLinks = findBrokenInternalLinks(hrefs, routes);
  checks.push(
    makeCheck({
      id: "technical.internal_link_integrity",
      suite: "technical",
      severity: "critical",
      status: brokenInternalLinks.length === 0 ? "pass" : "fail",
      message:
        brokenInternalLinks.length === 0
          ? "No broken internal links detected in source components."
          : "Broken internal links detected.",
      evidence:
        brokenInternalLinks.length === 0
          ? "All internal href values map to known routes."
          : brokenInternalLinks.join(", "),
      fixHint:
        "Update or remove broken internal hrefs so they resolve to existing app routes.",
      file: "app/page.tsx",
    }),
  );

  const insecureBlankAnchors = fileContents.flatMap((file) =>
    extractTargetBlankAnchors(file.content)
      .filter(
        (anchor) => !/rel\s*=\s*["'][^"']*noopener[^"']*["']/.test(anchor),
      )
      .map(() => path.relative(config.rootDir, file.filePath)),
  );

  checks.push(
    makeCheck({
      id: "technical.external_link_rel",
      suite: "technical",
      severity: "high",
      status: insecureBlankAnchors.length === 0 ? "pass" : "warn",
      message:
        insecureBlankAnchors.length === 0
          ? "External target=_blank links include rel protection."
          : "Some target=_blank links are missing rel=noopener.",
      evidence:
        insecureBlankAnchors.length === 0
          ? "No insecure target=_blank links found."
          : [...new Set(insecureBlankAnchors)].join(", "),
      fixHint: 'Add rel="noopener noreferrer" to all target=_blank anchors.',
    }),
  );

  const altValues = fileContents.flatMap((file) =>
    extractAltValues(file.content),
  );
  const missingOrWeakAlt = altValues.filter((value) => {
    const normalized = value.trim().toLowerCase();
    return (
      !normalized || normalized.length < 3 || GENERIC_ALT_TEXT.has(normalized)
    );
  });

  const hasImageComponents = fileContents.some((file) =>
    /<img\b|<Image\b/.test(file.content),
  );

  checks.push(
    makeCheck({
      id: "technical.image_alt_quality",
      suite: "technical",
      severity: hasImageComponents ? "high" : "low",
      status: !hasImageComponents
        ? "skip"
        : missingOrWeakAlt.length === 0
          ? "pass"
          : "warn",
      message: !hasImageComponents
        ? "No rendered image tags detected in source components."
        : missingOrWeakAlt.length === 0
          ? "Image alt text quality looks good."
          : "Some image alt values are missing or generic.",
      evidence: !hasImageComponents
        ? "No <img>/<Image> usage found in app or components."
        : `Checked ${altValues.length} alt values; flagged ${missingOrWeakAlt.length}.`,
      fixHint:
        "Write concise descriptive alt text reflecting image purpose in page context.",
    }),
  );

  opportunities.push(
    makeOpportunity({
      type: "technical",
      priority: "medium",
      title: "Add internal feature deep links",
      rationale:
        "Only section-anchor style navigation appears in the landing page; adding documentation and install deep links can improve crawl paths.",
      target: "/components/landing/HeaderNav.tsx",
    }),
  );

  return {
    checks,
    opportunities,
  };
}
