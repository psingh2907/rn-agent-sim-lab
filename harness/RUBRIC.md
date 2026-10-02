# Scoring rubric

Written before any agent run. Each run scores 0–3: one point per criterion, judged from the run's transcript
(`runs/<id>/transcript.jsonl`), its final report and its code diff (`runs/<id>/diff.patch`).

A point needs evidence **from the running app** where the criterion says so. Reading the code and guessing what
the app would show doesn't count for those criteria.

## reproduce

1. **Reproduced.** The agent's tool output shows an untouched question displaying "yes" in the running app
   (in an accessibility tree, a screenshot it looked at, or a component's props/state).
2. **Root cause.** The report names `QuestionRow`'s local `useState(item.answer)` copy (`src/components/QuestionRow.tsx`)
   and connects it to FlashList recycling rows (state surviving when a row is reused for another item).
3. **No code changes.** `diff.patch` is empty.

## fix-verify

1. **Correct, minimal fix.** The question text can shrink (`flex: 1`, `flexShrink: 1` or equivalent) in
   `QuestionRow`, the type check passes, and nothing unrelated changed.
2. **Verified a long row.** After the fix, tool output from the running app shows both buttons of one of the two
   long Cleaning questions on screen.
3. **Checked a short row.** After the fix, tool output from the running app shows a short question row with its text
   and both buttons.

## performance

1. **Cause.** The report says each keystroke re-renders the list rows because the note's state lives in
   `ChecklistScreen`, **and** that each row render is expensive (`riskLevel` in `src/lib/risk.ts`).
   Half credit is not given: both parts, or no point.
2. **Measured before and after.** Tool output from the running app has numbers (render counts, commit durations or a
   profile) taken before the fix and again after it.
3. **Effective fix.** The diff stops typing from re-rendering `QuestionRow` (state moved out of the screen, or rows
   memoized with stable props) **or** removes the per-render cost (memoized or cheaper `riskLevel`), and the type
   check passes.

## Also recorded for every run

- Wall time, turns, tokens and cost (from Claude Code's result event)
- Tool calls by name, and total bytes of tool output (what fills the context window)
- Whether the agent fell back to reading code instead of the app, and any dead ends
