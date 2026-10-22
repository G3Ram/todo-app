# [agent] Firestore integration tests on the emulator
labels: testing,phase-2-database

### Goal
Prove `FirestoreTodoRepository` behaves exactly like `InMemoryTodoRepository`, against a real Firestore engine, with no GCP account. CI already has an `integration` job waiting; it switches on when `api/tests/integration/` exists, and runs `pytest -m integration` inside `firebase emulators:exec --only firestore --project demo-todo`.

Depends on the Firestore repository issue (backlog 06) and the Firebase Hosting config issue (backlog 08, which creates `firebase.json`).

### Acceptance criteria
- [ ] One shared set of repository contract tests (create, list order, update, delete, not-found behavior) that runs against both implementations:
  - the in-memory version in the normal unit test run
  - the Firestore version in `api/tests/integration/`, marked `@pytest.mark.integration`
- [ ] Integration tests talk to the emulator via `FIRESTORE_EMULATOR_HOST` (set automatically by `emulators:exec`) with project `demo-todo`. They must never reach real GCP: fail fast if `FIRESTORE_EMULATOR_HOST` isn't set
- [ ] Each test starts from an empty collection (clear it in a fixture), so order doesn't matter
- [ ] `firebase.json` gets an `emulators` section: Firestore on port 8080, emulator UI disabled
- [ ] Plain `pytest` still skips integration tests (the `addopts` in `pyproject.toml` already does this)
- [ ] README: how to run them locally (`firebase emulators:exec --only firestore --project demo-todo "uv run --directory api pytest -m integration"`, needs Java 21)

### Where to look
`api/tests/`, `api/app/repository.py`, `api/pyproject.toml`, `firebase.json`

### Out of scope
Security rules testing, performance tests.

### Size
Medium
