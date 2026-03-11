# ARRIVAL GitHub Actions Setup

## What this does
- Runs every day at 21:00 Korea time (`12:00 UTC`)
- Updates product data with `npm run notify:once`
- Sends email whether or not there are updates
- Commits updated `data/` and `screenshots/` back to the repository

## Required GitHub repository secrets
- `SENDGRID_API_KEY`
- `SENDGRID_FROM_EMAIL`
- `SENDGRID_TO_EMAIL`

## Workflow file
- `.github/workflows/arrival-daily.yml`

## Notes
- This project must be pushed to a GitHub repository for Actions to run.
- The repository needs `Actions` enabled and must allow workflow write access to contents.
- Local `launchd` scheduling should be disabled to avoid duplicate emails.
