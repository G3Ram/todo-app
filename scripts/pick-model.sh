#!/usr/bin/env bash
# Picks the Claude model for an implement run.
#
# Order of precedence:
#   1. A "model:<name>" label on the issue      (model:haiku, model:sonnet, model:opus)
#   2. The issue's Size field from the template (Small, Medium, Large)
#   3. The default
#
# Defaults can be changed without editing code, with repo variables:
#   gh variable set MODEL_SMALL  --body sonnet
#   gh variable set MODEL_MEDIUM --body sonnet
#   gh variable set MODEL_LARGE  --body opus
#   gh variable set MODEL_DEFAULT --body sonnet
#
# Inputs (env): ISSUE_LABELS (JSON array of names), ISSUE_BODY, MODEL_* vars.
# Output: "model=<name>" and "reason=<why>" appended to $GITHUB_OUTPUT.
set -euo pipefail

SMALL="${MODEL_SMALL:-sonnet}"
MEDIUM="${MODEL_MEDIUM:-sonnet}"
LARGE="${MODEL_LARGE:-opus}"
DEFAULT="${MODEL_DEFAULT:-sonnet}"

model=""
reason=""

label=$(printf '%s' "${ISSUE_LABELS:-[]}" | jq -r '[.[] | select(startswith("model:"))] | last // empty')
if [ -n "$label" ]; then
  model="${label#model:}"
  reason="label $label"
else
  # The issue template renders the dropdown as "### Size" followed by the chosen option.
  size=$(printf '%s\n' "${ISSUE_BODY:-}" | awk '
    /^###[[:space:]]+Size[[:space:]]*$/ { grab = 1; next }
    grab && NF { print tolower($1); exit }
  ')
  case "$size" in
    small)  model="$SMALL";  reason="size Small" ;;
    medium) model="$MEDIUM"; reason="size Medium" ;;
    large)  model="$LARGE";  reason="size Large" ;;
    *)      model="$DEFAULT"; reason="default (no size on the issue)" ;;
  esac
fi

# Only allow known aliases or full Claude model IDs, so a label can't inject CLI flags.
if ! printf '%s' "$model" | grep -Eq '^(haiku|sonnet|opus|claude-[a-z0-9.-]+)$'; then
  echo "::warning::Ignoring unknown model '$model' ($reason), using $DEFAULT"
  model="$DEFAULT"
  reason="default (unknown model requested)"
fi

echo "Model: $model ($reason)"
{
  echo "model=$model"
  echo "reason=$reason"
} >> "${GITHUB_OUTPUT:-/dev/stdout}"
