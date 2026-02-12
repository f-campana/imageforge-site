import assert from "node:assert/strict";
import test from "node:test";

import { evaluateBrandPresence } from "../offpage.mjs";

test("evaluateBrandPresence passes when GitHub and npm links are present", () => {
  const result = evaluateBrandPresence(
    [
      "https://github.com/f-campana/imageforge",
      "https://www.npmjs.com/package/@imageforge/cli",
    ],
    [],
  );

  assert.equal(result.status, "pass");
  assert.equal(result.githubFound, true);
  assert.equal(result.npmFound, true);
});

test("evaluateBrandPresence warns when GitHub link is missing", () => {
  const result = evaluateBrandPresence(
    ["https://www.npmjs.com/package/@imageforge/cli"],
    [],
  );

  assert.equal(result.status, "warn");
  assert.equal(result.githubFound, false);
  assert.equal(result.npmFound, true);
});

test("evaluateBrandPresence warns when npm link is missing", () => {
  const result = evaluateBrandPresence(
    ["https://github.com/f-campana/imageforge"],
    [],
  );

  assert.equal(result.status, "warn");
  assert.equal(result.githubFound, true);
  assert.equal(result.npmFound, false);
});
