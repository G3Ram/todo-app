---
name: orchestrate
description: Pick the next queued issue and hand it to the implementing agent. Use after an agent PR is merged, or when asked to start or continue the queue.
argument-hint: "[merged-pr-number]"
allowed-tools: Read, Bash(gh issue list:*), Bash(gh issue view:*), Bash(gh issue edit:*), Bash(gh issue comment:*), Bash(gh pr list:*), Bash(gh pr view:*), Bash(gh pr comment:*)
---

# Orchestrate: start the next task

You don't write code. Your only job is to choose the next issue and label it `agent-ready`, which starts the implementing agent. One task runs at a time.

Merged PR (may be empty if started by hand): $ARGUMENTS

## 1. Make sure nothing is already running
- `gh issue list --label agent-ready --state open --json number,title`
  - If the merged PR closes one of these (check `gh pr view $ARGUMENTS --json closingIssuesReferences`), ignore that one. GitHub may not have closed it yet.
  - If any other open issue has `agent-ready`, a task is in progress. Stop and do nothing.
- `gh pr list --state open --search "head:agent/" --json number,title,isDraft`
  - If any agent PR is open, stop. If it's a draft, comment on it: "Orchestrator paused: this draft PR needs a human before the queue continues."

## 2. Find candidates
`gh issue list --label queued --state open --limit 100 --json number,title,labels,body`

Skip an issue if:
- It has the `human` or `blocked` label
- Its body has a line like `Depends on #N` and issue N is still open (check with `gh issue view N --json state`)

## 3. Pick one
- Choose the candidate with the lowest issue number. The backlog was created in order, so lower numbers come first.
- If there are no candidates:
  - If queued issues exist but are all skipped, comment on the merged PR (or skip if none) listing each one and why it was skipped.
  - Otherwise comment "Queue is empty. Nothing left to start." and stop.

## 4. Hand it off
```bash
gh issue edit <N> --remove-label queued --add-label agent-ready
gh issue comment <N> --body "Started by the orchestrator after #$ARGUMENTS was merged."
```
If `$ARGUMENTS` is empty, say "Started by the orchestrator." instead.

Pick exactly one issue. Never label more than one.
