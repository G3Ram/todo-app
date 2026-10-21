# [agent] Firestore repository
labels: phase-2-database

### Goal
Store todos in Firestore so they survive restarts, without changing the routes or the existing tests. Firestore's default database is in GCP's always-free tier.

### Acceptance criteria
- [ ] New `FirestoreTodoRepository` in `api/app/repository.py` implements every `TodoRepository` method, using a `todos` collection
- [ ] It takes the Firestore client in its constructor (so tests can pass a fake)
- [ ] `get_repository()` returns the Firestore version when the env var `STORAGE=firestore`, and the in-memory version otherwise (default)
- [ ] `google-cloud-firestore` is added with `uv add`
- [ ] Unit tests for `FirestoreTodoRepository` use a fake or mocked client. No real GCP calls and no credentials needed in CI
- [ ] `list` returns todos oldest first, same as the in-memory version
- [ ] mypy strict still passes. If Google's packages lack types, add a targeted override in `pyproject.toml`, not a global ignore
- [ ] README "Run it locally" explains `STORAGE=firestore` and that it needs `gcloud auth application-default login`

### Where to look
`api/app/repository.py`, `api/app/main.py`, `api/pyproject.toml`

### Out of scope
Deployment, the Firestore emulator, auth or per-user data.

### Size
Medium
