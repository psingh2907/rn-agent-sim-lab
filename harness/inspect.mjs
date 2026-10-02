// Prints what's needed to score one run against RUBRIC.md: the final report,
// the diff, the type check, and every tool call with a short view of its output.
//
//   node harness/inspect.mjs <run-id> [--full]

import { readFileSync } from 'node:fs';
import { join } from 'node:path';

const [id, flag] = process.argv.slice(2);
const dir = join(new URL('.', import.meta.url).pathname, 'runs', id);
const r = JSON.parse(readFileSync(join(dir, 'result.json'), 'utf8'));
const max = flag === '--full' ? 4000 : 300;

console.log(`# ${id}: exit ${r.exitCode}, ${Math.round(r.wallMs / 1000)} s, ${r.turns} turns, ${r.toolCallCount} tool calls, ${r.toolOutputBytes} bytes of tool output, typecheck ${r.typecheck === 'pass' ? 'pass' : 'FAIL'}`);
console.log(`tool calls: ${JSON.stringify(r.toolCalls)}`);

const events = readFileSync(join(dir, 'transcript.jsonl'), 'utf8').split('\n').filter(Boolean).map((l) => JSON.parse(l));
const calls = new Map();
let n = 0;
for (const e of events) {
  for (const c of e.message?.content ?? []) {
    if (c.type === 'tool_use') {
      calls.set(c.id, ++n);
      console.log(`\n[${n}] ${c.name} ${JSON.stringify(c.input).slice(0, 400)}`);
    }
    if (c.type === 'tool_result') {
      const text = typeof c.content === 'string' ? c.content : (c.content ?? []).map((p) => (p.type === 'text' ? p.text : `<${p.type}>`)).join('\n');
      console.log(`  -> [${calls.get(c.tool_use_id)}] ${text.replace(/\s+/g, ' ').slice(0, max)}`);
    }
  }
}

console.log(`\n# Report\n${r.report}`);
console.log(`\n# Diff\n${readFileSync(join(dir, 'diff.patch'), 'utf8') || '(none)'}`);
if (r.typecheck !== 'pass') console.log(`\n# Type check\n${r.typecheck}`);
