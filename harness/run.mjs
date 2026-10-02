// Runs one headless Claude Code session against the app with exactly one
// simulator tool available, and saves everything needed to score it.
//
//   node harness/run.mjs <argent|agent-device> <reproduce|fix-verify|performance> <rep>
//
// Must be started from a normal terminal, not from inside another Claude Code
// session. Results go to harness/runs/<tool>-<task>-<rep>/.

import { execFileSync, execSync, spawn } from 'node:child_process';
import { existsSync, mkdirSync, readFileSync, rmSync, writeFileSync } from 'node:fs';
import { homedir } from 'node:os';
import { join } from 'node:path';

const [tool, task, rep] = process.argv.slice(2);
const H = new URL('.', import.meta.url).pathname;
const WS = join(homedir(), 'Desktop/Projects/agentlab-ws');
const UDID = '22AD1763-1F47-4D6F-B93D-740B32B0D940';
const BUNDLE = 'org.reactjs.native.example.RNUpgradeLab';
// Pinned: on Claude Code 2.1.42 the 'sonnet' alias resolves to an older model.
const MODEL = 'claude-sonnet-5-5';
const TIMEOUT_MS = 25 * 60 * 1000;

const tasks = JSON.parse(readFileSync(join(H, 'tasks.json'), 'utf8'));
// "probe" checks isolation: what the session can see, without doing anything.
tasks.tasks.probe =
  'Do not run any commands. List every tool you have, every MCP server, every skill, and quote any instructions you were given about simulators, devices or apps.';
if (!['argent', 'agent-device'].includes(tool) || !tasks.tasks[task] || !rep) {
  console.error('usage: node harness/run.mjs <argent|agent-device> <reproduce|fix-verify|performance> <rep>');
  process.exit(1);
}
const id = `${tool}-${task}-${rep}`;
const out = join(H, 'runs', id);
if (existsSync(join(out, 'result.json'))) {
  console.log(`${id}: already done, skipping`);
  process.exit(0);
}
rmSync(out, { recursive: true, force: true });
mkdirSync(out, { recursive: true });

const sh = (cmd, opts = {}) => execSync(cmd, { stdio: 'pipe', encoding: 'utf8', ...opts });
const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

// 1. Reset the workspace to the planted state.
sh('git reset -q --hard && git clean -qfd -e node_modules', { cwd: WS });
// Agents may install packages temporarily (agent-device's React DevTools setup
// does); remove anything not in the lockfile so every run starts identical.
sh('npm prune --no-audit --no-fund && find node_modules -mindepth 1 -maxdepth 1 -type d -empty -delete', { cwd: WS });

// 2. Fresh Metro with an empty cache, and the app closed.
try { sh('pkill -f "react-native start"'); } catch {}
try { sh(`xcrun simctl terminate ${UDID} ${BUNDLE}`); } catch {}
await sleep(1000);
const metro = spawn('npx', ['react-native', 'start', '--port', '8081', '--reset-cache'], {
  cwd: WS,
  detached: true,
  stdio: ['ignore', 'ignore', 'ignore'],
});
for (let i = 0; i < 60; i++) {
  try {
    if (sh('curl -s localhost:8081/status').includes('running')) break;
  } catch {}
  await sleep(1000);
}

// 3. Only this tool: its MCP config, its skills (as a plugin), its own rules,
//    and the other tool's CLI shadowed on PATH.
const arm = join(H, 'arms', tool);
const shadow = join(out, 'shadow-bin');
mkdirSync(shadow);
const other = tool === 'argent' ? 'agent-device' : 'argent';
writeFileSync(join(shadow, other), `#!/bin/sh\necho "${other}: command not found" >&2\nexit 127\n`, { mode: 0o755 });
const pathParts = [shadow];
if (tool === 'agent-device') pathParts.push(join(H, 'tools/node_modules/.bin'));
const env = { ...process.env, PATH: `${pathParts.join(':')}:${process.env.PATH}` };
delete env.CLAUDECODE;
// --setting-sources keeps out user settings but not ~/.claude/CLAUDE.md, rules
// or memory, which on this machine include Argent's rules. Turn those off too.
env.CLAUDE_CODE_DISABLE_CLAUDE_MDS = '1';
env.CLAUDE_CODE_DISABLE_AUTO_MEMORY = '1';

const prompt = `${tasks.context}\n\n${tasks.tasks[task]}`;
const args = [
  '-p', prompt,
  '--model', MODEL,
  '--output-format', 'stream-json', '--verbose',
  '--setting-sources', 'project',
  '--strict-mcp-config', '--mcp-config', join(arm, 'mcp.json'),
  '--plugin-dir', join(arm, 'plugin'),
  '--append-system-prompt', readFileSync(join(arm, 'rules.md'), 'utf8'),
  '--permission-mode', 'dontAsk',
  '--allowedTools', 'Bash Read Edit Write Glob Grep Task TodoWrite mcp__argent',
  '--no-session-persistence',
];
writeFileSync(join(out, 'command.json'), JSON.stringify({ tool, task, rep, model: MODEL, prompt, args: args.filter((a) => a !== prompt) }, null, 2));

const started = Date.now();
console.log(`${id}: running (timeout ${TIMEOUT_MS / 60000} min)`);
const transcript = join(out, 'transcript.jsonl');
const code = await new Promise((resolve) => {
  const child = spawn('claude', args, { cwd: WS, env, stdio: ['ignore', 'pipe', 'pipe'] });
  const chunks = [];
  child.stdout.on('data', (d) => chunks.push(d));
  child.stderr.on('data', (d) => writeFileSync(join(out, 'stderr.log'), d, { flag: 'a' }));
  const timer = setTimeout(() => child.kill('SIGTERM'), TIMEOUT_MS);
  child.on('close', (c) => {
    clearTimeout(timer);
    writeFileSync(transcript, Buffer.concat(chunks));
    resolve(c);
  });
});
const wallMs = Date.now() - started;

// 4. Save the evidence: the diff, a type check, and the summary numbers.
writeFileSync(join(out, 'diff.patch'), sh('git add -A && git diff --cached', { cwd: WS }));
let typecheck = 'pass';
try { sh('npx tsc --noEmit', { cwd: WS }); } catch (e) { typecheck = (e.stdout || '').slice(0, 2000) || 'fail'; }

const events = readFileSync(transcript, 'utf8').split('\n').filter(Boolean).map((l) => { try { return JSON.parse(l); } catch { return null; } }).filter(Boolean);
const toolCalls = {};
let toolOutputBytes = 0;
for (const e of events) {
  for (const c of e.message?.content ?? []) {
    if (c.type === 'tool_use') toolCalls[c.name] = (toolCalls[c.name] ?? 0) + 1;
    if (c.type === 'tool_result') toolOutputBytes += Buffer.byteLength(JSON.stringify(c.content ?? ''));
  }
}
const result = events.findLast((e) => e.type === 'result') ?? {};
const init = events.find((e) => e.type === 'system' && e.subtype === 'init') ?? {};
const summary = {
  id, tool, task, rep: Number(rep), exitCode: code, wallMs,
  timedOut: wallMs >= TIMEOUT_MS,
  turns: result.num_turns, durationMs: result.duration_ms, costUsd: result.total_cost_usd, usage: result.usage,
  toolCalls, toolCallCount: Object.values(toolCalls).reduce((a, b) => a + b, 0), toolOutputBytes,
  typecheck,
  loaded: { tools: init.tools, mcpServers: init.mcp_servers, skills: init.skills, plugins: init.plugins, model: init.model },
  report: result.result,
};
writeFileSync(join(out, 'result.json'), JSON.stringify(summary, null, 2));
console.log(`${id}: done in ${Math.round(wallMs / 1000)} s, ${summary.toolCallCount} tool calls, ${toolOutputBytes} bytes of tool output, exit ${code}`);

try { process.kill(-metro.pid); } catch {}
try { sh(`xcrun simctl terminate ${UDID} ${BUNDLE}`); } catch {}
