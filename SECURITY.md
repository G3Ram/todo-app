# Security policy

## Reporting a vulnerability

Please don't open a public issue. Use GitHub's private reporting instead: go to the **Security** tab and click **Report a vulnerability**.

You'll get a reply within a few days.

## What's in place

- **Dependencies:** Dependabot alerts and security updates, `pip-audit` and `npm audit` in CI, and dependency review on every PR
- **Code:** CodeQL (`security-extended` queries) on every PR and weekly
- **Secrets:** GitHub secret scanning with push protection
- **Agents:** coding agents follow the security rules in `AGENTS.md`, every PR is reviewed by an independent model (Codex), and nothing merges to `main` without passing CI and a human merge
