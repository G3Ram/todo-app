#!/usr/bin/env bash
# Totals agent usage across runs, from the "agent-usage" artifacts the workflows upload.
#
# Usage: ./scripts/usage-report.sh [days]     (default: 30)
# Needs: gh (logged in), jq, unzip
set -euo pipefail
cd "$(dirname "$0")/.."

DAYS="${1:-30}"
REPO=$(gh repo view --json nameWithOwner --jq .nameWithOwner)
SINCE=$(date -u -d "-$DAYS days" +%Y-%m-%dT%H:%M:%SZ 2>/dev/null || date -u -v-"$DAYS"d +%Y-%m-%dT%H:%M:%SZ)
TMP=$(mktemp -d)
trap 'rm -rf "$TMP"' EXIT

echo "Agent usage for $REPO, last $DAYS days"
echo

gh api --paginate "repos/$REPO/actions/artifacts?name=agent-usage&per_page=100" \
  --jq ".artifacts[] | select(.expired == false and .created_at >= \"$SINCE\") | .id" > "$TMP/ids"

if [ ! -s "$TMP/ids" ]; then
  echo "No usage data yet. It's recorded from the first agent run after the usage step was added."
  exit 0
fi

while read -r id; do
  gh api "repos/$REPO/actions/artifacts/$id/zip" > "$TMP/$id.zip"
  unzip -p "$TMP/$id.zip" agent-usage.json >> "$TMP/all.jsonl" 2>/dev/null || true
  echo >> "$TMP/all.jsonl"
done < "$TMP/ids"

jq -rs '
  map(select(type == "object")) as $runs |
  def money: . * 100 | round / 100 | tostring | "$" + .;
  def k: if . >= 1000000 then (. / 100000 | round / 10 | tostring) + "M"
         elif . >= 1000 then (. / 100 | round / 10 | tostring) + "k"
         else tostring end;

  "Runs: \($runs | length)   Est. cost: \([$runs[].est_cost_usd] | add | money)   (estimate at API prices)",
  "",
  "By role:",
  ($runs | group_by(.role)[] |
    "  \(.[0].role | . + "              " | .[0:14]) runs \(length | tostring | . + "    " | .[0:4])  turns \([.[].turns] | add | tostring | . + "      " | .[0:6])  est. \([.[].est_cost_usd] | add | money)"),
  "",
  "By model:",
  ([$runs[].models[]] | group_by(.model)[] |
    "  \(.[0].model | . + "                        " | .[0:24]) in \([.[].input] | add | k)  out \([.[].output] | add | k)  cache read \([.[].cache_read] | add | k)  est. \([.[].est_cost_usd] | add | money)"),
  "",
  "Most expensive implement runs:",
  ([$runs[] | select(.role == "implement")] | sort_by(-.est_cost_usd) | .[0:5][] |
    "  #\(.issue)  \(.main_model)  \(.turns) turns  \(.est_cost_usd | money)  \(.result)  \(.run_url)")
' "$TMP/all.jsonl"
