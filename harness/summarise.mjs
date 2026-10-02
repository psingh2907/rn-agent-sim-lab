// Aggregates every scored run: harness/runs/*/result.json plus the rubric
// scores in harness/scores.json. Prints the tables quoted in the post.
//
//   node harness/summarise.mjs

import { existsSync, readdirSync, readFileSync } from 'node:fs';
import { join } from 'node:path';

const H = new URL('.', import.meta.url).pathname;
const scores = existsSync(join(H, 'scores.json')) ? JSON.parse(readFileSync(join(H, 'scores.json'), 'utf8')) : {};
const runs = readdirSync(join(H, 'runs'))
  .filter((d) => !d.includes('probe') && existsSync(join(H, 'runs', d, 'result.json')))
  .map((d) => JSON.parse(readFileSync(join(H, 'runs', d, 'result.json'), 'utf8')))
  // Runs cut off by something outside the test (a usage limit) are listed but not counted.
  .filter((r) => !scores[r.id]?.aborted || (console.log(`excluded: ${r.id} (${scores[r.id].note})`), false));

const median = (xs) => {
  const s = xs.filter((x) => x != null).sort((a, b) => a - b);
  if (!s.length) return null;
  const m = s.length >> 1;
  return s.length % 2 ? s[m] : (s[m - 1] + s[m]) / 2;
};
const sum = (xs) => xs.reduce((a, b) => a + b, 0);
// Tool output split into text and images: base64 screenshots inflate a byte
// count but cost a roughly fixed number of tokens each.
function context(r) {
  const lines = readFileSync(join(H, 'runs', r.id, 'transcript.jsonl'), 'utf8').split('\n').filter(Boolean);
  let text = 0, images = 0;
  for (const l of lines) {
    let e;
    try { e = JSON.parse(l); } catch { continue; }
    for (const c of e.message?.content ?? []) {
      if (c.type !== 'tool_result') continue;
      for (const p of typeof c.content === 'string' ? [{ type: 'text', text: c.content }] : c.content ?? []) {
        if (p.type === 'image') images++;
        else text += Buffer.byteLength(p.text ?? JSON.stringify(p));
      }
    }
  }
  return { text, images };
}
for (const r of runs) Object.assign(r, { ctx: context(r) });

const tokens = (r) => (r.usage ? r.usage.input_tokens + r.usage.output_tokens + (r.usage.cache_read_input_tokens ?? 0) + (r.usage.cache_creation_input_tokens ?? 0) : null);

for (const task of ['reproduce', 'fix-verify', 'performance', 'all']) {
  console.log(`\n## ${task}`);
  console.log('| tool | runs | score (of 3 each) | median wall time | median tool calls | median text output | median screenshots | median tokens | total cost |');
  console.log('| --- | --- | --- | --- | --- | --- | --- | --- | --- |');
  for (const tool of ['argent', 'agent-device']) {
    const rs = runs.filter((r) => r.tool === tool && (task === 'all' || r.task === task));
    if (!rs.length) continue;
    const pts = rs.map((r) => scores[r.id]?.points).filter((p) => p != null);
    console.log(
      `| ${tool} | ${rs.length} | ${pts.length ? `${sum(pts)} / ${pts.length * 3}` : 'unscored'} | ${Math.round(median(rs.map((r) => r.wallMs)) / 1000)} s | ${median(rs.map((r) => r.toolCallCount))} | ${Math.round(median(rs.map((r) => r.ctx.text)) / 1024)} KB | ${median(rs.map((r) => r.ctx.images))} | ${Math.round(median(rs.map(tokens)) / 1000)}k | $${sum(rs.map((r) => r.costUsd ?? 0)).toFixed(2)} |`,
    );
  }
}

console.log('\n## Per run');
for (const r of runs.sort((a, b) => a.id.localeCompare(b.id))) {
  const s = scores[r.id];
  console.log(`${r.id}: ${s ? `${s.points}/3 [${s.criteria.join(' ')}]` : 'unscored'}, ${Math.round(r.wallMs / 1000)} s, ${r.toolCallCount} calls, ${Math.round(r.ctx.text / 1024)} KB text, ${r.ctx.images} images${r.timedOut ? ', TIMED OUT' : ''}${s?.note ? ` (${s.note})` : ''}`);
}
