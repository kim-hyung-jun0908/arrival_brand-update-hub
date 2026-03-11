# ARRIVAL Daily Update + SendGrid Notification

## What this does
- Every day at 21:00 (`Asia/Seoul` default), run `npm run notify:once` via `launchd`
- `npm run fetch` runs first and updates `index.html` data files
- If new items exist, send `New Arrival_(MMDD)`
- If no new items exist, send `최신 상품 업데이트가 없습니다.`

## Required environment variables
- `SENDGRID_API_KEY`
- `SENDGRID_FROM_EMAIL` (인증된 sender)
- `SENDGRID_TO_EMAIL` (수신자, 예: `fapeo16@gmail.com`)

## Optional environment variables
- `ARRIVAL_NOTIFY_TIMEZONE` (default: `Asia/Seoul`)
- `ARRIVAL_NOTIFY_HOUR` (default: `21`)
- `ARRIVAL_NOTIFY_MINUTE` (default: `0`)
- `ARRIVAL_NOTIFY_ON_FIRST_RUN` (`1`이면 첫 실행에도 메일 발송)

## Commands
- One-time check now: `npm run notify:once`
- `launchd` execution wrapper: `scripts/run-notify-once.sh`

## Important
- `launchd/com.arrival.notify.plist` is configured for one run per day at 21:00
- SendGrid의 Sender Identity 검증이 선행되어야 발송됩니다
- env vars가 없으면 업데이트 체크는 실행되지만 메일 발송은 스킵됩니다
