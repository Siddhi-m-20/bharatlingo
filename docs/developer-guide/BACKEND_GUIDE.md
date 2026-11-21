# BharatLingo — Backend Guide

> **For the learner-developer:** This document explains the Express API server — what it does, what routes exist, how to call them, and how they relate to the frontend.

---

## What the backend does (and what it doesn't do)

**The Express server handles:**
- Text-to-speech (TTS) audio generation for Indian languages
- Translation proxying
- Indic NLP (natural language processing) for script analysis
- Web Push notification delivery (streak reminders)

**The Express server does NOT handle:**
- User authentication (that is entirely Supabase's job)
- Storing user progress (that goes directly from frontend → Supabase)
- Serving the frontend (Vite handles that in dev; Vercel handles it in production)

This separation is a deliberate design. By keeping user data out of the Express server, the app remains stateless — the server can be restarted at any time without losing data.

---

## Two deployment modes

### Local development
```bash
npm run dev
# starts:
#   - Vite dev server on http://localhost:5173  (frontend)
#   - Express server on http://localhost:5000   (API)
```
The two run concurrently using the `concurrently` package.

### Production (Vercel)
In production, the Express routes are replicated as individual **serverless functions** in the `api/` directory:
- `api/tts.js` → handles `/api/tts`
- `api/push.js` → handles `/api/push`

Serverless functions run on demand — Vercel spins up a container for each request and disposes of it. This is cheaper than running a persistent server.

---

## Entry point: `server/index.js`

```js
import express from 'express'
import cors from 'cors'
import dotenv from 'dotenv'

const app = express()
const PORT = process.env.PORT || 5000

// CORS: only allow requests from approved origins
app.use(cors({ origin: allowedOrigins, credentials: true }))
app.use(express.json())  // parse JSON request bodies

// Routes
app.use('/api', translationRoutes)
app.use('/api', speechRoutes)
app.use('/api', lessonsRoutes)
app.use('/api', ttsRoutes)
app.use('/api', indicNlpRoutes)
app.use('/api', pushRoutes)
```

**CORS** (Cross-Origin Resource Sharing) is a browser security feature. When the frontend on port 5173 calls the API on port 5000, the browser first asks the server: "Are you OK with requests from that origin?" The server must explicitly allow it. In production, only the `FRONTEND_URL` environment variable origin is allowed.

---

## API routes reference

### `POST /api/tts` — Text-to-speech
**File:** `server/routes/tts.js`

Converts a text string into audio. The frontend uses this to pronounce words during exercises.

**Request body:**
```json
{
  "text": "नमस्ते",
  "language": "hi",
  "rate": 1.0
}
```

**Response:** Raw audio buffer (`audio/mpeg` or `audio/wav`)

**Caching:** The server sets `Cache-Control: public, max-age=86400` so the browser caches audio for 24 hours. The same word won't be fetched twice.

**Response headers:**
- `X-TTS-Provider` — which TTS engine generated the audio
- `X-TTS-Cached` — `1` if served from cache, `0` if freshly generated

---

### `GET /api/tts` — TTS (GET variant)
Same as POST but via query string: `/api/tts?text=नमस्ते&lang=hi`

Used when embedding audio in `<audio>` elements by URL.

---

### `GET /api/push/public-key` — Get VAPID public key
**File:** `server/routes/push.js`

Returns the VAPID public key needed by the browser to subscribe to push notifications. VAPID (Voluntary Application Server Identification) is the security protocol for Web Push.

**Response:**
```json
{ "success": true, "publicKey": "BNjQ..." }
```

---

### `POST /api/push/send-test` — Send a test push notification
Rate-limited to 10 requests per minute per IP. Used during development to verify push is working.

**Request body:**
```json
{ "subscription": { "endpoint": "...", "keys": {...} }, "token": "supabase-jwt" }
```

Requires a valid Supabase JWT token (`token`) to prevent abuse. The server verifies the token against Supabase before sending.

---

### `GET /api/health` — Health check
Returns `{ "status": "ok" }`. Used by monitoring tools to verify the server is alive.

---

## Environment variables

The server reads these from `.env`:

| Variable | Used by | Purpose |
|---|---|---|
| `VITE_SUPABASE_URL` | Frontend + server | Supabase project URL |
| `VITE_SUPABASE_ANON_KEY` | Frontend | Public Supabase key |
| `SUPABASE_SERVICE_ROLE_KEY` | Server only | Admin-level Supabase key (never sent to browser) |
| `VAPID_PUBLIC_KEY` | Server + frontend | Web Push public key |
| `VAPID_PRIVATE_KEY` | Server only | Web Push private key (keep secret) |
| `VAPID_EMAIL` | Server only | Contact email for push provider |
| `PORT` | Server | Port to listen on (default 5000) |
| `FRONTEND_URL` | Server | Allowed CORS origin in production |

**Security rule:** Keys that end in `SERVICE_ROLE_KEY` or `PRIVATE_KEY` must NEVER be exposed to the browser. They are only used in `server/` and `api/` files, never in `src/`.

---

## Rate limiting on push routes

The push route implements simple in-memory rate limiting:

```js
const rateLimitStore = new Map()  // IP address → timestamps[]
const RATE_LIMIT_WINDOW = 60000   // 1 minute
const RATE_LIMIT_MAX = 10         // max requests per minute

function rateLimit(req, res, next) {
  // counts requests from this IP in the last minute
  // returns 429 Too Many Requests if over the limit
}
```

**What is a Map?** A JavaScript `Map` is like a dictionary — it stores key-value pairs. Here the keys are IP addresses and the values are arrays of timestamps (when each request came in).

**Why in-memory and not a database?** For a development-stage app, in-memory is fine. In production with multiple server instances, you would use Redis to share the rate limit state.

---

## How the frontend calls the backend

The `src/services/audio/` directory contains helper functions that call `/api/tts`:

```js
const response = await fetch('/api/tts', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({ text: word, language: langCode }),
})
const audioBlob = await response.blob()
const audioUrl = URL.createObjectURL(audioBlob)
new Audio(audioUrl).play()
```

The frontend never hardcodes `http://localhost:5000` — it uses a relative path `/api/...`. Vite's dev server proxies `/api` requests to port 5000. In production, Vercel routes `/api` to serverless functions.

---

## Adding a new API route

1. Create `server/routes/myFeature.js`
2. Register it in `server/index.js`: `app.use('/api', myFeatureRoutes)`
3. Create the matching Vercel function in `api/myFeature.js` for production
4. Add any secrets to `.env` and document them above
