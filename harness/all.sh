#!/bin/sh
# All 18 scored runs, interleaved; which tool goes first alternates each round.
# Re-running skips runs that already have a result.json.
cd "$(dirname "$0")/.." || exit 1
for rep in 1 2 3; do
  for task in reproduce fix-verify performance; do
    if [ $((rep % 2)) -eq 1 ]; then order="argent agent-device"; else order="agent-device argent"; fi
    for tool in $order; do
      node harness/run.mjs "$tool" "$task" "$rep"
    done
  done
done
echo "ALL RUNS FINISHED"
