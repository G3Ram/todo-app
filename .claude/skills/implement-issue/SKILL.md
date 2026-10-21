---
name: implement-issue
description: Implement a GitHub issue end to end and open a pull request. Use when asked to implement, build, or fix issue #N, or when called with an issue number.
argument-hint: <issue-number>
allowed-tools: Read, Edit, Write, Glob, Grep, Bash(git:*), Bash(gh issue view:*), Bash(gh issue comment:*), Bash(gh pr create:*), Bash(gh pr list:*), Bash(npm:*), Bash(npx:*), Bash(uv:*)
---

# Implement issue $ARGUMENTS and open a PR

Works the same in CI and on your laptop (`/implement-issue 42`).

## 1. Understand the task
- Run `gh issue view $ARGUMENTS --comments`.
- Read the Goal, Acceptance criteria, Where to look, and Out of scope sections.
- If the acceptance criteria are missing or contradict each other, stop. Comment on the issue with `gh issue comment $ARGUMENTS` explaining what you need, and do nothing else.
- If `gh pr list --search "#$ARGUMENTS in:body"` shows an open PR for this issue already, comment with its link and stop.

## 2. Branch
```bash
git checkout -b agent/issue-$ARGUMENTS
```

## 3. Build it
- Follow AGENTS.md.
- Change only what the issue asks for. Respect Out of scope.
- Add or update tests that prove each acceptance criterion.

## 4. Verify
- Run every command in the Commands section of AGENTS.md.
- If something fails, fix the cause and rerun. Never skip, delete, or loosen a test to get green.
- Give it at most 3 fix attempts. If it's still failing, go to step 5 and open the PR as a draft.

## 5. Commit, push, open the PR
```bash
git add -A
git commit -m "<short summary> (#$ARGUMENTS)"
git push -u origin agent/issue-$ARGUMENTS
```

Then create the PR. Add `--draft` only if checks were still failing in step 4.

```bash
gh pr create --base main --title "<short summary>" --body "<body>"
```

The PR body must contain:
- `Closes #$ARGUMENTS`
- **What changed** - a few bullets
- **Acceptance criteria** - each one from the issue, checked off, with the test that covers it
- **How I tested it** - commands you ran and their result
- **Unsure about** - anything you guessed at, or "Nothing"
- If draft: what's still failing and what you tried

## 6. Report back
Comment on the issue with the PR link and one line on its state (ready for review, or draft and why).
