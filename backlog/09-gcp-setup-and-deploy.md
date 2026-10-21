# [human] Set up GCP and deploy
labels: phase-3-deploy,human

### Goal
Create the GCP project and do the first deploy by hand. Don't add `agent-ready` to this one.

### Steps
- [ ] Create a project and link billing. Billing is required even for free-tier usage.
  ```bash
  gcloud projects create todo-factory-<suffix>
  gcloud config set project todo-factory-<suffix>
  gcloud billing projects link todo-factory-<suffix> --billing-account=<ACCOUNT_ID>
  ```
- [ ] Set a small budget alert (for example $1) in Billing > Budgets & alerts, so you hear about any charges right away
- [ ] Enable the APIs
  ```bash
  gcloud services enable run.googleapis.com firestore.googleapis.com \
    cloudbuild.googleapis.com artifactregistry.googleapis.com
  ```
- [ ] Create the default Firestore database (only the default one gets the free quota)
  ```bash
  gcloud firestore databases create --location=us-central1
  ```
- [ ] Deploy the API (uses `api/Dockerfile` from issue 07)
  ```bash
  gcloud run deploy todo-api --source api --region us-central1 --allow-unauthenticated \
    --set-env-vars STORAGE=firestore,ALLOWED_ORIGINS=https://todo-factory-<suffix>.web.app
  ```
- [ ] Add Firebase to the project and deploy the frontend
  ```bash
  npm i -g firebase-tools && firebase login
  firebase projects:addfirebase todo-factory-<suffix>
  VITE_API_URL=<cloud-run-url> npm --prefix web run build
  firebase deploy --only hosting --project todo-factory-<suffix>
  ```
- [ ] Open the site, add a todo, refresh, and confirm it's still there

### Later
Automate deploys with a GitHub Actions workflow using Workload Identity Federation (no service account keys). Write that workflow yourself: agents don't touch `.github/workflows/`.
