# [agent] Firebase Hosting config
labels: phase-3-deploy

### Goal
Get the frontend ready to deploy on Firebase Hosting's free tier, talking to the API on Cloud Run.

### Acceptance criteria
- [ ] `firebase.json` at the repo root serves `web/dist` as a single-page app (all routes rewrite to `index.html`)
- [ ] Static assets get long cache headers; `index.html` does not
- [ ] `web/.env.example` documents `VITE_API_URL` (the Cloud Run URL)
- [ ] README has a "Deploy the frontend" section: build with `VITE_API_URL` set, then `firebase deploy --only hosting`

### Where to look
Repo root, `web/`

### Out of scope
Creating the Firebase project, CI deploy workflows.

### Size
Small
