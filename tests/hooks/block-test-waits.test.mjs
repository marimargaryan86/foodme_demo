// Run: node --test "tests/hooks/*.test.mjs"   (Node 22+ treats a bare directory argument as a file)
import { test } from "node:test";
import assert from "node:assert/strict";
import { spawnSync } from "node:child_process";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const HOOK = join(dirname(fileURLToPath(import.meta.url)), "..", "..", ".agents", "hooks", "block-test-waits.mjs");
const ROOT = "/repo/";

function run(input) {
  const r = spawnSync(process.execPath, [HOOK], {
    input: typeof input === "string" ? input : JSON.stringify(input),
    encoding: "utf8",
  });
  return { status: r.status, stderr: r.stderr };
}
const write = (file, content) => ({ tool_name: "Write", tool_input: { file_path: ROOT + file, content } });
const edit = (file, new_string) => ({ tool_name: "Edit", tool_input: { file_path: ROOT + file, old_string: "x", new_string } });

const WEB = "apps/web/e2e/storefront-flows.spec.ts";

test("blocks: Write adding page.waitForTimeout(2000) to a web spec", () => {
  const r = run(write(WEB, "test('x', async ({ page }) => {\n  await page.waitForTimeout(2000);\n});\n"));
  assert.equal(r.status, 2);
  assert.match(r.stderr, /waitForTimeout\(/);
  assert.match(r.stderr, /storefront-flows\.spec\.ts/);
  assert.match(r.stderr, /web-first assertion/);
});

test("blocks: Edit adding page.waitForTimeout(2000) to a web spec", () => {
  const r = run(edit(WEB, "  await page.waitForTimeout(2000);"));
  assert.equal(r.status, 2);
  assert.match(r.stderr, /waitForTimeout\(/);
});

test("blocks: setTimeout in an admin spec", () => {
  const r = run(edit("apps/admin/e2e/admin-flows.spec.ts", "  await new Promise((r) => setTimeout(r, 500));"));
  assert.equal(r.status, 2);
  assert.match(r.stderr, /setTimeout/);
  assert.match(r.stderr, /admin-flows\.spec\.ts/);
});

test("blocks: MultiEdit where only the 2nd edit adds a wait", () => {
  const r = run({
    tool_name: "MultiEdit",
    tool_input: {
      file_path: ROOT + WEB,
      edits: [
        { old_string: "a", new_string: "await expect(page.getByRole('heading')).toBeVisible();" },
        { old_string: "b", new_string: "await sleep(1000);" },
      ],
    },
  });
  assert.equal(r.status, 2);
  assert.match(r.stderr, /sleep\(/);
  assert.match(r.stderr, /edit 2/);
});

test("allows: an edit adding expect(...).toBeVisible({ timeout: 15000 })", () => {
  assert.equal(run(edit(WEB, "  await expect(page.getByText('Order placed!')).toBeVisible({ timeout: 15000 });")).status, 0);
});

test("allows: a wait added to apps/web/e2e/flake-dish-modal.spec.ts", () => {
  assert.equal(run(edit("apps/web/e2e/flake-dish-modal.spec.ts", "  await page.waitForTimeout(300);")).status, 0);
});

test("allows: setTimeout in apps/web/src/...", () => {
  assert.equal(run(edit("apps/web/src/components/sections/dish-modal.tsx", "window.setTimeout(close, 350);")).status, 0);
});

test("allows: a wait inside a // comment", () => {
  assert.equal(run(edit(WEB, "  // never use page.waitForTimeout(2000) here\n  await expect(page).toHaveURL(/explore/);")).status, 0);
});

test("allows: malformed JSON", () => {
  assert.equal(run("{not json").status, 0);
});
