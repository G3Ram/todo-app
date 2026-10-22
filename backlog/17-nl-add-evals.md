# [agent] Eval set for natural-language add
labels: testing,phase-4-agentic

### Goal
Measure how well natural-language add parses text, so prompt or model changes can be judged by numbers instead of vibes. Unit tests prove the code works; evals prove the model output is good.

Depends on the natural-language add issue (backlog 10).

### Acceptance criteria
- [ ] `api/evals/nl_add_cases.jsonl` with at least 30 cases: input text, a fixed "today" date, expected title, expected due date (or null)
- [ ] Cases cover: no date, absolute dates, relative dates ("tomorrow", "next Tuesday", "in 2 weeks"), dates at month and year boundaries, messy input (typos, all caps, emoji), and text that looks like a date but isn't
- [ ] `uv run --directory api python -m evals.run_nl_add` calls the real parser, then prints per-case pass/fail and an overall score (due date exact match, title match after normalizing case and whitespace)
- [ ] Exits non-zero if the score is below a threshold set in the script (start at 90% for due dates)
- [ ] Not part of the normal test run or CI (it calls a paid model). README explains when to run it: before merging any prompt or model change
- [ ] A small unit test runs the eval harness itself against the fake parser, so the harness code stays covered

### Where to look
`api/app/` (the parser from issue 10), new `api/evals/`

### Out of scope
LLM-as-judge scoring, a dashboard, running evals on a schedule.

### Size
Medium
