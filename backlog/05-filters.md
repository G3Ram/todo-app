# [agent] Filters and remaining count
labels: phase-1-core

### Goal
Make the list easier to scan as it grows.

### Acceptance criteria
- [ ] Filter buttons: All, Active, Done. The selected one is marked with `aria-pressed`
- [ ] A count shows how many active todos are left ("1 item left" / "3 items left")
- [ ] A "Clear done" button deletes all done todos (calls the existing DELETE endpoint for each)
- [ ] Filtering happens in the frontend. No new API endpoints
- [ ] Frontend tests cover each filter, the count wording, and clear done

### Where to look
`web/src/App.tsx`

### Out of scope
Search, sorting options, saving the filter in the URL.

### Size
Small
