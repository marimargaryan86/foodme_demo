#!/usr/bin/env node
// PreToolUse hook (Write | Edit | MultiEdit): blocks fixed waits in e2e specs.
//
// .agents/rules/e2e-tests.md forbids page.waitForTimeout, setTimeout and sleeps in
// apps/web/e2e/ and apps/admin/e2e/: they make specs slow and flaky against the deployed
// app's 200-1500 ms simulated latency. This hook enforces that rule on the text an edit adds.
// The deliberately flaky apps/*/e2e/flake-*.spec.ts files are exempt.
//
// Protocol: hook JSON on stdin; exit 2 + reason on stderr blocks the tool call, exit 0 allows it.
// Malformed input exits 0, so a hook problem never blocks normal work. No dependencies.
//
// Limitation: only Write/Edit/MultiEdit are checked. Edits made through Bash (sed, echo >>)
// are not.

const FIX =
  "Use a web-first assertion, e.g. await expect(locator).toBeVisible({ timeout: 15000 }); see .agents/rules/e2e-tests.md";

// Checked in order; the first match is reported.
const PATTERNS = [
  { name: "new Promise(... setTimeout ...)", re: /new\s+Promise\s*\([\s\S]*?\bsetTimeout\s*\(/ },
  { name: "waitForTimeout(", re: /\bwaitForTimeout\s*\(/ },
  { name: "setTimeout(", re: /\bsetTimeout\s*\(/ },
  { name: "sleep(", re: /\bsleep\s*\(/ },
  { name: "delay(", re: /\bdelay\s*\(/ },
];

function isCheckedFile(filePath) {
  if (typeof filePath !== "string") return false;
  const p = filePath.replace(/\\/g, "/");
  if (!/(^|\/)apps\/(web|admin)\/e2e\//.test(p)) return false;
  if (!/\.(ts|js)$/.test(p)) return false;
  const base = p.slice(p.lastIndexOf("/") + 1);
  return !/^flake-.*\.spec\.ts$/.test(base);
}

// Drops `// ...` line comments. A `//` right after `:` (e.g. https://) is kept as code.
function stripLineComments(text) {
  return text
    .split("\n")
    .map((line) => {
      const m = line.match(/(^|[^:])\/\//);
      return m ? line.slice(0, m.index + m[1].length) : line;
    })
    .join("\n");
}

function addedTexts(toolName, input) {
  if (toolName === "Write") return [input?.content];
  if (toolName === "Edit") return [input?.new_string];
  if (toolName === "MultiEdit") return (input?.edits ?? []).map((e) => e?.new_string);
  return [];
}

export function check(payload) {
  const input = payload?.tool_input;
  if (!isCheckedFile(input?.file_path)) return null;
  const texts = addedTexts(payload?.tool_name, input);
  for (const [i, text] of texts.entries()) {
    if (typeof text !== "string") continue;
    const code = stripLineComments(text);
    const hit = PATTERNS.find((p) => p.re.test(code));
    if (hit) {
      const where = payload.tool_name === "MultiEdit" ? ` (edit ${i + 1})` : "";
      return `Blocked: fixed wait \`${hit.name}\` added to ${input.file_path}${where}. ${FIX}`;
    }
  }
  return null;
}

async function main() {
  let raw = "";
  for await (const chunk of process.stdin) raw += chunk;
  let payload;
  try {
    payload = JSON.parse(raw);
  } catch {
    process.exit(0);
  }
  const reason = check(payload);
  if (reason) {
    process.stderr.write(reason + "\n");
    process.exit(2);
  }
  process.exit(0);
}

main();
