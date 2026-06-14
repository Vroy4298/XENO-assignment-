# Backend — Xeno CRM API

## Run Locally
```bash
cp .env.example .env    # Add your MongoDB URI and optionally OpenAI key
npm install
npm run seed            # Seeds 50 Drape customers + ~109 orders
npm run dev             # nodemon — auto-restarts on change
```

## API Endpoints

| Method | Path | Description |
|--------|------|-------------|
| GET | `/api/customers` | List all customers (supports ?city=, ?minSpend=, ?search=) |
| GET | `/api/customers/:id` | Customer detail + order history |
| GET | `/api/orders` | All orders |
| POST | `/api/segments/generate` | NL query → MongoDB filter + matched customers |
| POST | `/api/segments/draft-message` | Segment description → AI message draft |
| GET | `/api/segments` | List saved segments |
| POST | `/api/segments` | Save a segment |
| POST | `/api/campaigns` | Create campaign |
| GET | `/api/campaigns` | List all campaigns |
| GET | `/api/campaigns/:id` | Campaign detail + logs |
| POST | `/api/campaigns/:id/send` | Fire campaign to channel stub |
| POST | `/api/receipt` | Callback from channel stub (status update) |
| GET | `/api/analytics/:campaignId` | Full analytics for a campaign |

## Folder Structure
```
config/       → MongoDB connection
controllers/  → Route handlers (business logic)
models/       → Mongoose schemas
routes/       → Express router definitions
services/     → AI service (GPT-4 + mock fallback)
scripts/      → seed.js
```
