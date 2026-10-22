# [agent] Post-deploy smoke test script
labels: testing,phase-3-deploy

### Goal
A 10-second check that the live app works after a deploy, so a broken deploy is caught right away instead of by users.

Depends on the API container issue (backlog 07).

### Acceptance criteria
- [ ] `scripts/smoke.sh <api-base-url>` runs these checks in order, printing one line per check:
  - `GET /health` returns 200 and `{"status":"ok"}`
  - `POST /todos` with a unique title like `smoke-<timestamp>` returns 201
  - `GET /todos` includes that todo
  - `DELETE` removes it again (so smoke runs don't pile up data)
- [ ] Exits non-zero on the first failure, with a clear message saying which check failed
- [ ] Uses only `curl` and `jq`; every request has a timeout (for example `--max-time 10`)
- [ ] Doesn't print secrets or full response bodies on success
- [ ] Tested against the local API: README shows `./scripts/smoke.sh http://localhost:8000`
- [ ] README's deploy section says to run it right after `gcloud run deploy`

### Where to look
`scripts/`, README

### Out of scope
Running it automatically in a deploy workflow (that comes with the deploy automation).

### Size
Small
