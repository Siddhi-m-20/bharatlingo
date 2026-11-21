# BharatLingo — Security Guide

> **For the learner-developer:** This document explains the security architecture of BharatLingo, what protections are in place, what risks remain, and the rules you must follow when making changes.

---

## Security model overview

BharatLingo protects user data through three independent layers:

```
Layer 1: Frontend route guards        (ProtectedRoute)
         ↓ prevents unauthorized page access
Layer 2: Supabase RLS policies        (PostgreSQL row-level security)
         ↓ prevents unauthorized database access
Layer 3: PostgreSQL trigger            (validate_profile_update)
         ↓ prevents reward manipulation even by authenticated users
```

Each layer is independent. Breaking one does not break the others.

---

## Layer 1: Route guards

**File:** `src/components/ProtectedRoute/ProtectedRoute.jsx`

Prevents unauthenticated or incompletely-set-up users from accessing protected pages. See [AUTHENTICATION_FLOW.md](./AUTHENTICATION_FLOW.md) for details.

**What it does NOT protect against:** A determined user can still manipulate `localStorage` directly in the browser console to fake a completed profile. This is acceptable because localStorage is client-side only — it does not affect what is stored in the database.

---

## Layer 2: Supabase Row Level Security (RLS)

RLS policies are defined at the PostgreSQL level in Supabase. They run automatically on every query. The application cannot bypass them (even if someone modifies the JavaScript code).

**How it works:**
```sql
-- Example: users can only SELECT their own profile
CREATE POLICY "Users can read own profile"
ON public.profiles FOR SELECT
USING (auth.uid() = id);  -- auth.uid() is the logged-in user's Supabase ID
```

If a user tries to query another user's profile, Supabase returns an empty result — not an error. This prevents data leakage.

**Security fix applied (Oct 2026):**
The original schema had a `"Public read for leaderboard profiles"` policy that allowed anyone to read all profiles. This was removed by migration `20261031000000_fix_profiles_public_access.sql`.

A `leaderboard_public` view was created instead, exposing only `{id, name, avatar_url, xp, streak, level}` — the minimum needed for the leaderboard.

**Current RLS status:**

| Table | Public readable? | Write requires auth? |
|---|---|---|
| languages, courses, units, lessons, vocabulary, exercises | ✅ Yes (content) | N/A |
| profiles | ❌ No (owner only) | ✅ Yes |
| user_progress, lesson_attempts, xp_transactions | ❌ No (owner only) | ✅ Yes |
| leaderboard_entries | ✅ Yes (public read) | Owner only |

---

## Layer 3: Reward field protection trigger

**File:** `supabase/migrations/20261031000001_protect_reward_fields.sql`

A PostgreSQL trigger (`validate_profile_update`) runs BEFORE every UPDATE on the `profiles` table. It prevents any direct modification of `xp`, `gems`, or `streak` columns:

```sql
IF NEW.xp IS DISTINCT FROM OLD.xp OR
   NEW.gems IS DISTINCT FROM OLD.gems OR
   NEW.streak IS DISTINCT FROM OLD.streak THEN
  RAISE EXCEPTION 'Cannot update XP, gems, or streak directly';
END IF;
```

**Why this matters:** Without this trigger, a user with a valid Supabase session could call the Supabase REST API directly (bypassing the React app) to give themselves unlimited XP:
```js
// Without the trigger, this would work:
supabase.from('profiles').update({ xp: 999999 }).eq('id', myUserId)
```
With the trigger, this throws an exception and the update is rejected.

**How the app handles this trigger:**
In `src/services/auth.jsx` line 592:
```js
if (error?.message?.toLowerCase().includes('cannot update xp, gems, or streak directly')) {
  // Strip reward fields, retry with only profile fields
  const nonRewardUpdates = { ...dbUpdates }
  delete nonRewardUpdates.xp
  delete nonRewardUpdates.gems
  delete nonRewardUpdates.streak
  // ...retry
}
```

**⚠️ Important limitation:** The trigger only fully protects against XP manipulation when it has been applied to the actual Supabase instance. The migration file exists in the repository, but it must be manually run in the Supabase SQL Editor. Verify this was done.

---

## Credential management

### Rules that must NEVER be broken:

1. **VAPID private key** (`VAPID_PRIVATE_KEY`) — NEVER put in `src/` files. Server and `api/` only.
2. **Supabase service role key** (`SUPABASE_SERVICE_ROLE_KEY`) — NEVER put in `src/` files. This key bypasses all RLS policies.
3. **`.env` file** — NEVER commit to Git. Verify `.gitignore` contains `.env`.
4. **Supabase anon key** (`VITE_SUPABASE_ANON_KEY`) — CAN be in frontend code. It is the public key designed to be exposed; RLS policies are what protect the data.

### Environment variable reference

| Variable | Used where | Can be public? |
|---|---|---|
| `VITE_SUPABASE_URL` | Frontend + server | ✅ Yes (project URL) |
| `VITE_SUPABASE_ANON_KEY` | Frontend | ✅ Yes (protected by RLS) |
| `SUPABASE_SERVICE_ROLE_KEY` | Server only | ❌ Never expose |
| `VAPID_PUBLIC_KEY` | Frontend + server | ✅ Yes (by design) |
| `VAPID_PRIVATE_KEY` | Server only | ❌ Never expose |

---

## Admin role

Admin access to `/admin` is controlled by `src/components/AdminRoute/AdminRoute.jsx`:
```js
// AdminRoute checks for user.role === 'admin'
```

In `auth.jsx`, hardcoded email fallback:
```js
if (normalizedEmail === 'admin@bharatlingo.com' || normalizedEmail === 'admin@bharatlingo.org') {
  fallbackUser.role = 'admin'
}
```

**⚠️ This hardcoded email check in the email-not-confirmed fallback path is a security concern.** Anyone who registers with this email and passes the unconfirmed email path would receive admin access. This should be replaced with a database-level role check (`profiles.role` column).

---

## Known risks and their status

| Risk | Severity | Status |
|---|---|---|
| Login local fallback creates accounts for unrecognized emails | 🔴 HIGH | **Open** — must fix before production |
| Hardcoded admin email in login fallback | 🟠 MEDIUM | **Open** |
| Security migrations not verified as applied to live DB | 🟠 MEDIUM | **Unverified** |
| `validate_profile_update` trigger only blocks `service_role` check — authenticated users could still manipulate via REST if trigger logic is incomplete | 🟠 MEDIUM | **Needs verification** |
| Vercel API routes referencing non-existent serverless functions | 🟡 LOW | **Open** (causes 404, app falls back gracefully) |
| AI tutor depends on undocumented free API endpoints | 🟡 LOW | **Open** |

---

## Security rules when contributing code

These rules are from AGENTS.md and must be respected at all times:

1. **Never weaken Supabase RLS** — Do not add `USING (true)` policies on user data tables
2. **Never expose service-role credentials** — The service role key bypasses all RLS
3. **Never put secrets in `src/`** — All secrets must be server-side only
4. **Never delete production user data** — Migrations must be additive or safe
5. **Never apply production migrations without explicit approval**
6. **Never bypass reward-field protections** — The trigger exists to prevent cheating
7. **Never use destructive Git commands** — No `git push --force`, no `git reset --hard` on shared branches

---

## Security checklist before deploying

- [ ] `.env` is in `.gitignore` and NOT committed
- [ ] `VAPID_PRIVATE_KEY` is in Vercel environment variables, not in source code
- [ ] `SUPABASE_SERVICE_ROLE_KEY` is set in server environment only
- [ ] Both security migrations (`20261031000000` and `20261031000001`) have been applied to the live Supabase project
- [ ] Supabase Auth email confirmation is enabled (or the login fallback is fixed)
- [ ] The hardcoded admin email fallback is removed
- [ ] `npm run build` completes without errors
