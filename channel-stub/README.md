# Channel Stub — Fake Messaging Service

## What it does
Simulates a real messaging provider (WhatsApp/SMS/Email).

1. Receives `POST /send` from CRM with `{ messageId, recipient, message, channel }`
2. Immediately ACKs with `{ accepted: true }`
3. After a random delay (2–5s), asynchronously POSTs back to CRM:
   - `delivered` (85% of messages)
   - `failed` (15% of messages)
   - `opened` (70% of delivered)
   - `clicked` (40% of opened)

## Run Locally
```bash
cp .env.example .env
npm install
npm run dev    # Runs on :4000
```

## Why a separate service?
This mirrors real architecture — messaging providers (WhatsApp Business API, Twilio) are external services that deliver messages and send webhook callbacks. Decoupling lets you swap providers without touching CRM code.
