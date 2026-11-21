# BharatLingo — Deployment Guide

> **For the learner-developer:** This document explains how BharatLingo is deployed, what the production infrastructure looks like, and how to verify a deployment is working correctly.

---

## Production infrastructure

```
Vercel (hosting)
  ├── Static files: React SPA (HTML, JS, CSS, images)
  │     Served from Vite build output (dist/)
  │
  ├── API routes: Vercel Serverless Functions
  │     api/tts.js       → /api/tts
  │     api/push.js      → /api/push/*
  │     api/lessons.js   → /api/lessons/*
  │     api/translate.js → /api/translate
  │     (others referenced in vercel.json)
  │
  └── Service Worker: public/sw.js
        Served with no-cache headers (vercel.json)

Supabase (database + auth)
  ├── PostgreSQL database (18 tables)
  ├── Supabase Auth (user accounts + sessions)
  └── Row Level Security (enforced at DB level)
```

---

## Vercel routing (`vercel.json`)

```json
{
  "rewrites": [
    { "source": "/api/tts", "destination": "/api/tts.js" },
    { "source": "/api/push/:path*", "destination": "/api/push.js" },
    { "source": "/api/lessons/:path*", "destination": "/api/lessons.js" },
    { "source": "/api/translate", "destination": "/api/translate.js" },
    { "source": "/api/assessment/questions", "destination": "/api/assessment-questions.js" },
    { "source": "/((?!api/).*)", "destination": "/index.html" }
  ]
}
```

The last rewrite (`/((?!api/).*) → /index.html`) is the **SPA catch-all**. It routes all non-API URLs to `index.html`, which lets React Router handle the navigation client-side.

**⚠️ Known issue:** `vercel.json` references these serverless functions that do not exist in the `api/` directory:
- `api/assessment-questions.js`
- `api/learning-plan.js`
- `api/speech-to-text.js`

These routes will return 404 in production. The app falls back to client-side generation gracefully, but these should either be created or removed from `vercel.json`.

---

## Environment variables in Vercel

Set these in the Vercel dashboard under Project → Settings → Environment Variables:

| Variable | Required | Notes |
|---|---|---|
| `VITE_SUPABASE_URL` | ✅ Yes | Your Supabase project URL |
| `VITE_SUPABASE_ANON_KEY` | ✅ Yes | Public anon key |
| `VAPID_PUBLIC_KEY` | For push notifications | Generate with `web-push generate-vapid-keys` |
| `VAPID_PRIVATE_KEY` | For push notifications | Keep secret — server only |
| `VAPID_SUBJECT` | For push notifications | `mailto:support@bharatlingo.in` |
| `VITE_VAPID_PUBLIC_KEY` | For push notifications | Same as VAPID_PUBLIC_KEY (frontend needs it) |
| `FRONTEND_URL` | For CORS | Your Vercel domain |

Variables prefixed with `VITE_` are **embedded into the frontend bundle at build time**. They must be set before building.
Variables without `VITE_` are **only available at runtime** in serverless functions — they are never sent to the browser.

---

## Production build

```bash
npm run build
```

Vite compiles the React application into `dist/`:
```
dist/
  index.html
  assets/
    index-[hash].js    ← All JS bundled
    index-[hash].css   ← All CSS bundled
```

**Common build failures:**
- Missing environment variable → check Vite requires `VITE_` prefix
- Import path errors → check for case-sensitive paths (Windows vs Linux)
- JSX syntax errors → fix before deploying

**Always run `npm run build` locally before pushing to production.**

---

## Supabase setup (first time)

1. Create a Supabase project at https://supabase.com
2. Copy the Project URL and Anon Key from Settings → API
3. Open the SQL Editor in Supabase
4. Run each migration file in order:
   ```
   supabase/migrations/20260901000000_init_schema.sql
   supabase/migrations/20260907000001_add_learning_state.sql
   supabase/migrations/20260907000002_remove_hearts_system.sql
   supabase/migrations/20260909000000_add_user_spaced_repetition.sql
   supabase/migrations/20261031000000_fix_profiles_public_access.sql  ← IMPORTANT
   supabase/migrations/20261031000001_protect_reward_fields.sql       ← IMPORTANT
   ```
5. Under Authentication → Settings: Configure email confirmation settings
6. Set environment variables in Vercel

---

## PWA and Service Worker

**Service worker:** `public/sw.js`

The service worker enables:
- Offline use of previously visited pages
- Background push notification delivery
- "Add to Home Screen" functionality

Vercel is configured to serve `sw.js` with no-cache headers:
```json
{
  "source": "/sw.js",
  "headers": [
    { "key": "Cache-Control", "value": "public, max-age=0, must-revalidate" },
    { "key": "Service-Worker-Allowed", "value": "/" }
  ]
}
```

This ensures users always get the latest service worker version.

**Testing PWA locally:**
```bash
npm run build
npm run preview
# Visit http://localhost:4173
# Chrome DevTools → Application → Service Workers
```

---

## Verifying a deployment

After deploying, check these in order:

```
1. Visit the site — does the Welcome page load?
2. Click Get Started → Sign Up with a new email
3. Complete onboarding (4 steps)
4. Complete assessment (15 questions)
5. Land on dashboard — are lessons visible?
6. Start a lesson — do exercises load and work?
7. Complete the lesson — does XP increase?
8. Check /api/tts?text=Hello&lang=en — does it return audio?
9. Check /api/push/public-key — does it return the VAPID key?
10. Verify localStorage shows bharatlingo_user is populated
```

---

## Local development

```bash
# Install dependencies
npm install

# Start development (both servers)
npm run dev
# Vite frontend: http://localhost:5173
# Express API: http://localhost:5000

# Frontend only (if you don't need the API)
npm run dev:client

# API only
npm run dev:server
```

Vite proxies `/api` requests to Express automatically — you do not need to configure this.

---

## Deployment checklist

Before every deployment:

- [ ] `npm run build` completes without errors or warnings
- [ ] All `VITE_` environment variables are set in Vercel
- [ ] All server-side environment variables are set
- [ ] Security migrations have been applied to Supabase
- [ ] `.env` is NOT committed to Git
- [ ] Push notification VAPID keys are rotated if previously exposed
- [ ] Supabase Auth email confirmation is configured as intended
