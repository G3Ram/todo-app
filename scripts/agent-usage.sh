#!/usr/bin/env bash
# Summarizes one Claude run: model, turns, tokens, estimated cost.
# Called from the workflows after the Claude step. Reads only the final
# "result" and "init" messages from the execution file, so no code, tool
# output, or secrets ever leave the runner.
#
# Usage: scripts/agent-usage.sh <execution-file> <role> [issue-number]
#   role: implement | helper | orchestrator
# Writes:
#   - a table to the job summary ($GITHUB_STEP_SUMMARY)
#   - agent-usage.json (numbers only) for the workflow to upload as an artifact
#   - with an issue number: a comment on the agent's PR (or the issue if no PR)
set -euo pipefail

EXEC_FILE="${1:-}"
ROLE="${2:-unknown}"
ISSUE="${3:-}"
OUT="${USAGE_OUT:-agent-usage.json}"
SUMMARY="${GITHUB_STEP_SUMMARY:-/dev/stdout}"
RUN_URL="${RUN_URL:-}"

if [ -z "$EXEC_FILE" ] || [ ! -s "$EXEC_FILE" ]; then
  echo "No execution file (the Claude step didn't get far enough to write one)."
  echo "### Agent usage ($ROLE)" >> "$SUMMARY"
  echo "No usage data: the Claude step stopped before finishing." >> "$SUMMARY"
  exit 0
fi

jq --arg role "$ROLE" --arg issue "$ISSUE" \
   --arg run_id "${GITHUB_RUN_ID:-}" --arg run_url "$RUN_URL" '
  ([.[] | select(.type == "system" and .subtype == "init")] | first) as $init |
  ([.[] | select(.type == "result")] | last) as $r |
  ($r.modelUsage // {}) as $mu |
  {
    role: $role,
    issue: ($issue | if . == "" then null else tonumber end),
    run_id: $run_id,
    run_url: $run_url,
    date: (now | todate),
    main_model: ($init.model // "unknown"),
    result: ($r.subtype // "unknown"),
    is_error: ($r.is_error // false),
    turns: ($r.num_turns // 0),
    duration_s: ((($r.duration_ms // 0) / 1000) | floor),
    est_cost_usd: ($r.total_cost_usd // 0),
    models: [ $mu | to_entries[] | {
      model: .key,
      input: (.value.inputTokens // 0),
      output: (.value.outputTokens // 0),
      cache_read: (.value.cacheReadInputTokens // 0),
      cache_write: (.value.cacheCreationInputTokens // 0),
      est_cost_usd: (.value.costUSD // 0)
    } ]
  }
  | .totals = {
      input: ([.models[].input] | add // 0),
      output: ([.models[].output] | add // 0),
      cache_read: ([.models[].cache_read] | add // 0),
      cache_write: ([.models[].cache_write] | add // 0)
    }
' "$EXEC_FILE" > "$OUT"

# Markdown table, shared by the job summary and the PR comment.
TABLE=$(jq -r --arg reason "${MODEL_REASON:-}" '
  # 1234567 -> "1,234,567"
  def fmt: floor | tostring | [scan(".")] | reverse
    | [range(0; length; 3) as $i | .[$i:$i+3] | reverse | join("")]
    | reverse | join(",");
  "**Model:** `\(.main_model)`\(if $reason != "" then " (picked by \($reason))" else "" end) | **Result:** \(.result) | **Turns:** \(.turns) | **Time:** \(.duration_s / 60 | floor)m \(.duration_s % 60)s | **Est. cost:** $\(.est_cost_usd * 100 | round / 100)\n",
  "| Model | Input | Output | Cache read | Cache write | Est. cost |",
  "|---|---:|---:|---:|---:|---:|",
  (.models[] | "| `\(.model)` | \(.input | fmt) | \(.output | fmt) | \(.cache_read | fmt) | \(.cache_write | fmt) | $\(.est_cost_usd * 100 | round / 100) |"),
  "",
  "<sub>Cost is an estimate at API prices. On a Claude subscription token, runs count against your plan usage instead of being billed.</sub>"
' "$OUT")

{
  echo "### Agent usage ($ROLE)"
  echo
  echo "$TABLE"
} >> "$SUMMARY"

# Comment on the agent's PR if there is one, otherwise on the issue.
if [ -n "$ISSUE" ] && command -v gh >/dev/null 2>&1; then
  PR=$(gh pr list --head "agent/issue-$ISSUE" --state open --json number --jq '.[0].number // empty' 2>/dev/null || true)
  BODY=$(printf '<details><summary>Agent usage for this run</summary>\n\n%s\n\n[Run log](%s)\n</details>' "$TABLE" "$RUN_URL")
  if [ -n "$PR" ]; then
    gh pr comment "$PR" --body "$BODY" >/dev/null || echo "Couldn't comment on PR #$PR"
  else
    gh issue comment "$ISSUE" --body "$BODY" >/dev/null || echo "Couldn't comment on issue #$ISSUE"
  fi
fi

cat "$OUT"
