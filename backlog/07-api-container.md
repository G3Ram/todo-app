# [agent] Container for the API
labels: phase-3-deploy

### Goal
Package the API so Cloud Run can run it.

### Acceptance criteria
- [ ] `api/Dockerfile` builds a small image using uv (multi-stage, slim Python base, no dev dependencies)
- [ ] The container listens on the port in the `PORT` env var (Cloud Run sets it), defaulting to 8080
- [ ] `api/.dockerignore` excludes `.venv`, caches, and tests
- [ ] Runs as a non-root user
- [ ] README has a "Run in Docker" section with the build and run commands

### Where to look
`api/`

### Out of scope
CI deploy workflows, GCP setup.

### Size
Small
