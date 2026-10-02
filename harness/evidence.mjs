// Scoring aid: for each tool call in a run, which rubric-relevant strings
// appeared in its output. Doesn't score anything by itself.
//   node harness/evidence.mjs <run-id>
import { readFileSync } from 'node:fs';
const id = process.argv[2];
const ev = readFileSync(new URL(`./runs/${id}/transcript.jsonl`, import.meta.url), 'utf8').split('\n').filter(Boolean).map((l) => JSON.parse(l));
const checks = {
  longButtons: /(yes|no) for (Are the customer|Is the area behind)/g,
  longText: /"(Are the customer|Is the area behind)/g,
  shortButtons: /(yes|no) for (Floors clean|Bins emptied|Trolley bay tidy|Entrance mats clean)/g,
  selected: /\[selected\]|selected[=:]\s*true/g,
  renderNumbers: /(render|commit)[^\n]{0,60}\d+(\.\d+)?\s*(ms|x|times|renders)/gi,
};
let n = 0;
const ids = {};
for (const e of ev) for (const c of e.message?.content ?? []) {
  if (c.type === 'tool_use') ids[c.id] = `[${++n}] ${c.name} ${JSON.stringify(c.input).slice(0, 120)}`;
  if (c.type === 'tool_result') {
    const t = typeof c.content === 'string' ? c.content : (c.content ?? []).map((p) => (p.type === 'image' ? '<image>' : p.text ?? '')).join(' ');
    const hits = Object.entries(checks).map(([k, re]) => [k, (t.match(re) ?? []).length]).filter(([, v]) => v);
    if (hits.length || t.includes('<image>')) console.log(ids[c.tool_use_id], '=>', hits.map(([k, v]) => `${k}:${v}`).join(' '), t.includes('<image>') ? '+image' : '');
  }
}
