excluded: argent-performance-2 (ABORTED at 122 s: the Claude account hit its usage limit (resets 1:50pm). Had profiled (before) and applied a fix (memo rows + faster riskLevel + screen changes); no after-measurement or report. Excluded from totals.)

## reproduce
| tool | runs | score (of 3 each) | median wall time | median tool calls | median text output | median screenshots | median tokens | total cost |
| --- | --- | --- | --- | --- | --- | --- | --- | --- |
| argent | 2 | 6 / 6 | 138 s | 32 | 59 KB | 11 | 1473k | $1.83 |
| agent-device | 2 | 6 / 6 | 93 s | 14.5 | 15 KB | 0.5 | 281k | $0.37 |

## fix-verify
| tool | runs | score (of 3 each) | median wall time | median tool calls | median text output | median screenshots | median tokens | total cost |
| --- | --- | --- | --- | --- | --- | --- | --- | --- |
| argent | 2 | 6 / 6 | 112 s | 32.5 | 45 KB | 11 | 1737k | $1.75 |
| agent-device | 2 | 6 / 6 | 105 s | 16 | 12 KB | 2 | 416k | $0.47 |

## performance
| tool | runs | score (of 3 each) | median wall time | median tool calls | median text output | median screenshots | median tokens | total cost |
| --- | --- | --- | --- | --- | --- | --- | --- | --- |
| argent | 1 | 3 / 3 | 195 s | 58 | 110 KB | 13 | 3819k | $1.85 |
| agent-device | 2 | 6 / 6 | 407 s | 43.5 | 43 KB | 0 | 923k | $1.61 |

## all
| tool | runs | score (of 3 each) | median wall time | median tool calls | median text output | median screenshots | median tokens | total cost |
| --- | --- | --- | --- | --- | --- | --- | --- | --- |
| argent | 5 | 15 / 15 | 129 s | 32 | 58 KB | 12 | 1585k | $5.43 |
| agent-device | 6 | 18 / 18 | 108 s | 16.5 | 17 KB | 0.5 | 338k | $2.45 |

## Per run
agent-device-fix-verify-1: 3/3 [fix long-row-verified short-row-checked], 99 s, 14 calls, 8 KB text, 2 images (flex:1; edited before looking at the app (never saw the bug); verified after via snapshot + 2 screenshots)
agent-device-fix-verify-2: 3/3 [fix long-row-verified short-row-checked], 111 s, 18 calls, 16 KB text, 2 images (flex:1; edited before looking at the app again; snapshot after fix shows all 4 long-row buttons + short rows; tapped both long rows)
agent-device-performance-1: 3/3 [cause measured fix], 296 s, 53 calls, 55 KB text, 0 images (React DevTools profile: 396 QuestionRow renders, ChecklistScreen 153 ms avg per keystroke -> NotesInput 0.9 ms; fixed both causes (state + precompiled regex, equivalence-checked); had to install agent-react-devtools + init (patches index.js/metro.config) on RN 0.87, then reverted)
agent-device-performance-2: 3/3 [cause measured fix], 517 s, 34 calls, 32 KB text, 0 images (329 components / ~145 ms per keystroke -> 12 / ~1 ms; NotesFooter; ~2 min lost to a hung react-devtools wait plus agent-react-devtools setup (npm install --save-dev, reverted); final message was a reply to a late background-task notice, real report is the previous message)
agent-device-reproduce-1: 3/3 [reproduced cause no-changes], 104 s, 14 calls, 17 KB text, 0 images (snapshot text showed [selected] on untouched row; first snapshot said AX unavailable (bridge preparing) then worked)
agent-device-reproduce-2: 3/3 [reproduced cause no-changes], 83 s, 15 calls, 14 KB text, 1 images ([selected] in snapshot on Entrance mats clean and Break room clean; needed 2 retries while bundle loaded)
argent-fix-verify-1: 3/3 [fix long-row-verified short-row-checked], 121 s, 36 calls, 51 KB text, 14 images (flexShrink:1; tree before had no long-row buttons, after had all four; also spotted the recycled-row bug unprompted)
argent-fix-verify-2: 3/3 [fix long-row-verified short-row-checked], 102 s, 29 calls, 39 KB text, 8 images (flexShrink:1; saw the bug first (long text, no buttons), after fix tree has all 4 long-row buttons + short rows; one swipe with a mistyped UDID)
argent-performance-1: 3/3 [cause measured fix], 195 s, 58 calls, 110 KB text, 13 images (React profiler + CPU samples: 162 QuestionRow renders, 155-177 ms commits per keystroke -> 0 rows, all <16 ms; NotesFooter component)
argent-reproduce-1: 3/3 [reproduced cause no-changes], 146 s, 32 calls, 58 KB text, 12 images (saw 2 wrong rows via screenshots/tree; read code early)
argent-reproduce-2: 3/3 [reproduced cause no-changes], 129 s, 32 calls, 60 KB text, 10 images (saw Break room clean yes in screenshots; noted selected state is not in Argent describe tree)
