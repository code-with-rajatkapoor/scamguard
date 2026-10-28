# ScamGuard — AI Phishing & Scam Text Detector

Paste any email, SMS, WhatsApp message, or chat text and ScamGuard scores it for
phishing and scam indicators: urgency pressure, threats, credential harvesting,
typosquatted brand domains, fake links, romance/romance-fraud patterns, and more.

## What's inside

- **Rule-based scanner** — a deterministic engine that runs locally in the browser.
  No data leaves your device for the base detection pass.
- **AI verdict (optional)** — calls a configured Gemini model (`/api/analyze`) to
  add a one-line `status` + `confidence` + `reason` verdict.
- **Scan history** — Supabase-backed history so you can revisit past audits.
- **In-text threat highlighting** — hover/tap a flagged phrase to see why it was
  flagged, plus per-indicator cards, a threat-category breakdown, and a risk meter.
- **Share / export PDF report** — copy a markdown summary or download an A4 PDF.

## Prerequisites

- Node.js 18+
- A [Supabase](https://supabase.com) project (for history storage)
- A [Gemini API key](https://aistudio.google.com/apikey) (optional, only needed
  for the AI verdict)

## Getting started

```bash
cp .env.example .env   # then edit .env
npm install
npm run dev            # starts Vite on :5173 + Express API on :3000
```

Open http://localhost:5173.

### Environment variables

| Variable | Required | Purpose |
| --- | --- | --- |
| `VITE_SUPABASE_URL` | yes | Supabase project URL |
| `VITE_SUPABASE_ANON_KEY` | yes | Supabase anon/publishable key |
| `GEMINI_API_KEY` | no | Gemini key for the AI verdict |
| `GEMINI_MODEL` | no | Model to call (default `gemini-3.8-flash`) |
| `FRONTEND_URL` | no | Comma-separated CORS origins; empty = allow all locally |
| `VITE_AI_ENABLED` | no | Set to `false` to disable the AI verdict |

## Scripts

| Command | What it does |
| --- | --- |
| `npm run dev` | Starts the Vite frontend and Express API together |
| `npm run dev:frontend` | Vite frontend only |
| `npm run dev:backend` | Express API only |
| `npm run build` | Production build to `dist/` |
| `npm run lint` | ESLint |
| `npm run preview` | Preview the production build |
| `npm run typecheck` | TypeScript check |

## Deployment

- **Frontend**: deploy `dist/` to Vercel/Netlify/Fly. The `vercel.json` rewrite
  points every route to the SPA.
- **API**: the Express server is a standalone process. For Vercel you'll want a
  serverless wrapper (e.g. Vercel Function) that runs `server.js`. In dev, Vite
  proxies `/api` to `http://localhost:3000` via `vite.config.js`.

## Security notes

- Supabase policies are intentionally open (`USING (true)` / `WITH CHECK (true)`)
  for a no-auth shared demo. For a real deployment, scope history to user
  accounts and treat scan text as sensitive data.
- The Gemini key lives on the backend (`server.js`), never in the browser bundle.
- Scam detection is heuristic and can miss novel scams — always verify through
  official channels.
