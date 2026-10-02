# Coding agents on a React Native app: Argent vs agent-device

The app, harness and raw results behind the blog post
[Giving your coding agent eyes on a React Native app](https://www.praveensingh.co.in/blog/coding-agents-drive-the-simulator).

Claude Code (2.1.42, headless, `claude-sonnet-5-5`) got the same three bug reports twice: once with only
[Argent](https://argent.swmansion.com/) 0.26.0, once with only [agent-device](https://github.com/callstack/agent-device)
0.21.19. Two runs per tool per task, 12 scored runs, on the iPhone 17 simulator (iOS 26.3) on an Apple M1 with 8 GB.

## Results

| | Argent | agent-device |
| --- | --- | --- |
| Score (3 points per run) | 18 / 18 | 18 / 18 |
| Median time per run | 138 s | 108 s |
| Median tool calls | 34 | 16.5 |
| Median screenshots in the conversation | 11 | 0.5 |
| Median tokens processed | 1.84 M | 0.34 M |
| Total cost, 6 runs | $7.59 | $2.45 |

Per task and per run: [`harness/summary.md`](harness/summary.md). Scores and notes: [`harness/scores.json`](harness/scores.json).

## What's here

- **The app** (`App.tsx`, `src/`): a React Native 0.87.1 store-audit checklist with FlashList.
- **Git tags:** `baseline` is the clean app; `planted` adds the three bugs (see that commit for what and why).
- **[`harness/RUBRIC.md`](harness/RUBRIC.md)**: scoring rules, committed before any scored run.
- **[`harness/tasks.json`](harness/tasks.json)**: the exact prompts.
- **[`harness/run.mjs`](harness/run.mjs)**: runs one session with one tool only, and saves the transcript, diff, type check and numbers.
- **`harness/arms/`**: each tool's MCP config, skills (loaded as a plugin) and rules, exactly as given to the agent.
- **`harness/runs/<tool>-<task>-<round>/`**: every transcript, report and diff. `*-probe-1` are the isolation checks,
  and `argent-performance-2-aborted` is a run cut off by the account's usage limit (re-run, excluded from totals).

## Isolation

Each session saw exactly one tool: `--strict-mcp-config` with that tool's MCP config, its skills via `--plugin-dir`,
its rules via `--append-system-prompt`, `--setting-sources project`, the other tool's CLI shadowed on `PATH`, and
`CLAUDE_CODE_DISABLE_CLAUDE_MDS=1` plus `CLAUDE_CODE_DISABLE_AUTO_MEMORY=1` (without them, global `~/.claude`
instructions still loaded). Agents worked in a separate copy of the app with no git history, reset before every run.

## Run it

Start from a normal terminal, not from inside Claude Code, with the `claude` CLI signed in:

```bash
npm install
cd ios && pod install && cd ..
```

Build and install the app on a simulator once, then copy the `planted` tag into a history-free workspace at
`~/Desktop/Projects/agentlab-ws` (see `run.mjs` for paths and the simulator UDID to change), and:

```bash
./harness/all.sh
```

```bash
node harness/summarise.mjs
```
