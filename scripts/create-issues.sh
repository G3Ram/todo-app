#!/usr/bin/env bash
# Creates GitHub issues from backlog/NN-*.md files.
# Usage: ./scripts/create-issues.sh [NN ...]
# Each file: first line "# Title", second line "labels: a,b", then a blank line, then the body.
set -euo pipefail
cd "$(dirname "$0")/.."

# Labels (no-op if they exist already)
for spec in "phase-1-core:0e8a16" "phase-2-database:1d76db" "phase-3-deploy:fbca04" \
            "phase-4-agentic:d93f0b" "human:b60205" "agent-ready:7057ff"; do
  gh label create "${spec%%:*}" --color "${spec##*:}" 2>/dev/null || true
done

if [ $# -eq 0 ]; then
  files=(backlog/[0-9][0-9]-*.md)
else
  files=()
  for n in "$@"; do files+=(backlog/"$n"-*.md); done
fi

for f in "${files[@]}"; do
  title=$(sed -n '1s/^# //p' "$f")
  labels=$(sed -n '2s/^labels: //p' "$f")
  body=$(tail -n +4 "$f")
  url=$(gh issue create --title "$title" --label "$labels" --body "$body")
  echo "$(basename "$f") -> $url"
done
