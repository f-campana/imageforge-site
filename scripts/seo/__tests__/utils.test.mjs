import assert from "node:assert/strict";
import test from "node:test";

import { extractHrefs } from "../utils.mjs";

test("extractHrefs captures string literal href syntax variants", () => {
  const source = `
    <a href="/docs">Docs</a>
    <a href={'/pricing'}>Pricing</a>
    <a href={"/about"}>About</a>
    <a href={\`/support\`}>Support</a>
  `;

  const hrefs = extractHrefs(source);

  assert.deepEqual(hrefs, ["/docs", "/pricing", "/about", "/support"]);
});

test("extractHrefs ignores template literals with interpolation", () => {
  const source = `<a href={\`/blog/\${slug}\`}>Post</a>`;
  const hrefs = extractHrefs(source);
  assert.deepEqual(hrefs, []);
});
