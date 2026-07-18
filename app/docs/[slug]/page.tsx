import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";

import { ImageServiceComparison } from "@/components/docs/ImageServiceComparison";
import { DOC_CATALOG } from "@/lib/docs/catalog";
import { DOCS, getDoc } from "@/lib/docs/content";
import { buildPageMetadata } from "@/lib/seo/metadata";

type Props = { params: Promise<{ slug: string }> };

export function generateStaticParams() {
  return DOC_CATALOG.map(({ slug }) => ({ slug }));
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const doc = getDoc(slug);
  if (!doc) return {};

  return buildPageMetadata({
    title: `${doc.title} | ImageForge CLI`,
    description: doc.description,
    path: `/docs/${doc.slug}`,
  });
}

export default async function DocPage({ params }: Props) {
  const { slug } = await params;
  const doc = getDoc(slug);
  if (!doc) notFound();

  const index = DOCS.findIndex((entry) => entry.slug === slug);
  const previous = index > 0 ? DOCS[index - 1] : null;
  const next = index < DOCS.length - 1 ? DOCS[index + 1] : null;

  return (
    <article>
      <p className="font-mono text-xs tracking-[0.14em] text-emerald-300 uppercase">
        {doc.label}
      </p>
      <h1 className="mt-4 text-4xl leading-tight font-semibold tracking-tight text-zinc-100 md:text-5xl">
        {doc.title}
      </h1>
      <p className="mt-5 text-base leading-relaxed text-zinc-300 md:text-lg">
        {doc.intent}
      </p>

      <div className="mt-12 space-y-12">
        {doc.sections.map((section) => (
          <section key={section.heading}>
            <h2 className="text-2xl font-semibold text-zinc-100">
              {section.heading}
            </h2>
            <div className="mt-4 space-y-4 text-base leading-7 text-zinc-300">
              {section.body.map((paragraph) => (
                <p key={paragraph}>{paragraph}</p>
              ))}
            </div>
            {section.bullets ? (
              <ul className="mt-4 list-disc space-y-2 pl-5 text-sm leading-6 text-zinc-300 marker:text-emerald-300">
                {section.bullets.map((bullet) => (
                  <li key={bullet}>{bullet}</li>
                ))}
              </ul>
            ) : null}
            {section.links ? (
              <ul className="mt-4 space-y-2 text-sm leading-6">
                {section.links.map((link) => (
                  <li key={link.url}>
                    <a
                      href={link.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="ui-interact-link ui-focus-ring text-emerald-300 underline decoration-emerald-300/40 underline-offset-4 hover:text-emerald-200"
                    >
                      {link.label}
                      <span className="sr-only"> (opens in a new tab)</span>
                    </a>
                  </li>
                ))}
              </ul>
            ) : null}
            {section.code ? (
              <pre className="panel-card-strong mt-5 max-w-full overflow-x-auto p-5 font-mono text-sm leading-6 text-zinc-100">
                <code>{section.code}</code>
              </pre>
            ) : null}
          </section>
        ))}
      </div>

      {doc.slug === "image-service-comparison" ? (
        <ImageServiceComparison />
      ) : null}

      <nav
        aria-label="Adjacent documentation"
        className="mt-14 flex flex-wrap justify-between gap-4 border-t border-white/10 pt-8 text-sm"
      >
        {previous ? (
          <Link
            href={`/docs/${previous.slug}`}
            className="ui-interact-link ui-focus-ring text-zinc-300 hover:text-emerald-200"
          >
            ← {previous.label}
          </Link>
        ) : (
          <span />
        )}
        {next ? (
          <Link
            href={`/docs/${next.slug}`}
            className="ui-interact-link ui-focus-ring text-zinc-300 hover:text-emerald-200"
          >
            {next.label} →
          </Link>
        ) : null}
      </nav>
    </article>
  );
}
