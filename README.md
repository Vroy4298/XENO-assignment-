# Xeno Mini CRM — Drape Fashion Label

## Overview
An AI-native Mini CRM for Drape, a D2C fashion brand. One sharp end-to-end flow:

> Marketer types intent → AI creates segment → AI drafts message → Campaign fires → Stats come back via callbacks

## Architecture

```
xeno-crm/
  frontend/       → React (Vite) + Tailwind CSS + Recharts
  backend/        → Node.js, Express, MongoDB (Mongoose)
  channel-stub/   → Fake messaging service with async callbacks
```

## Quick Start (All 3 Services)

### 1. Backend
```bash
cd backend
cp .env.example .env   # Fill in your values
npm install
npm run seed           # Seed 50 Drape customers + orders
npm run dev            # Runs on :5000
```

### 2. Channel Stub
```bash
cd channel-stub
cp .env.example .env
npm install
npm run dev            # Runs on :4000
```

### 3. Frontend
```bash
cd frontend
npm install
npm run dev            # Runs on :3000 — open http://localhost:3000
```

## The Callback Loop

1. `POST /api/campaigns/:id/send` — CRM fires campaign
2. For each recipient, CRM calls `POST http://localhost:4000/send`
3. Channel stub waits 2–10s, then calls `POST /api/receipt` with status
4. CRM atomically updates `Campaign.stats` and `CommunicationLog`
5. Analytics page auto-refreshes every 5s to show live stats

## AI Features

- **Segmentation**: `POST /api/segments/generate` — natural language → MongoDB filter
- **Message Draft**: `POST /api/segments/draft-message` — segment description → campaign copy
- Without `OPENAI_API_KEY`, a smart keyword-based mock handles both

## Environment Variables

See `.env.example` in each service folder.

## Deployment

- **Frontend** → Vercel (`npm run build`, set `VITE_API_BASE_URL`)
- **Backend** → Render (set all env vars, update `CHANNEL_STUB_URL`)
- **Channel Stub** → Render (set `CRM_RECEIPT_URL` to deployed backend URL)
