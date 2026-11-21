# BharatLingo — Development Changelog

> This document records significant changes to BharatLingo. Each entry describes what changed, which files were affected, why the change was made, and any risks introduced or resolved. Update this document every time a meaningful change is made.

---

## Format

```
## [YYYY-MM-DD] — Short description

### What changed
Brief explanation.

### Files modified
- `path/to/file.js` — what changed in that file

### Why
The reason for the change.

### Impact
What this affects for users and developers.

### Risks resolved / introduced
Any security, stability, or behavioral changes.
```

---

## [2026-10-31] — Security hardening: reward field protection and profile access fix

### What changed
Two security migration files were added to protect against unauthorized data manipulation.

### Files modified
- `supabase/migrations/20261031000000_fix_profiles_public_access.sql` — Drops `"Public read for leaderboard profiles"` policy; creates `leaderboard_public` view exposing only `{id, name, avatar_url, xp, streak, level}`
- `supabase/migrations/20261031000001_protect_reward_fields.sql` — Adds `validate_profile_update` trigger preventing direct XP/gems/streak updates; adds `update_user_rewards` server-side function
- `src/services/auth.jsx` — Added retry logic: when reward field trigger blocks an update, strips XP/gems/streak and retries with profile-only fields
- `server/services/pushAuth.js` — New file: bearer token validation, rate limiting, subscription ownership checks
- `src/services/notificationService.js` — Rewrote to use explicit user auth tokens; removed any hardcoded fallback keys
- `api/push.js` — Removed hardcoded VAPID key fallbacks; now fails securely if env vars missing
- `tests/pushAuth.test.mjs` — 7 unit tests for push authentication

### Why
Audit (`AUDIT_REPORT.md`) identified that any authenticated user could call the Supabase REST API directly to increase their own XP/gems/streak. The public profiles read policy exposed all user profile data for leaderboard purposes.

### Impact
- Users: No visible change. XP, gems, and streak continue working normally.
- Developers: `updateUser()` calls that include XP/gems/streak fields will now trigger the retry path in `auth.jsx` lines 592–607.

### Risks resolved
- Reward manipulation via direct API calls
- Public exposure of all profile fields for leaderboard

### Risks introduced
- Security migrations must be manually applied to live Supabase instance. If not applied, the trigger and view do not exist.

---

## [2026-10-30] — Audit report and security verification

### What changed
Three audit documents were created after a comprehensive security and production readiness review.

### Files created
- `AUDIT_REPORT.md` — Full security and functional audit findings
- `PRODUCTION_READINESS_REPORT.md` — Production deployment checklist
- `SECURITY_VERIFICATION_REPORT.md` — Security fix verification status

### Why
The project needed a systematic audit before production deployment.

### Risks identified
See `AUDIT_REPORT.md` for the full list. Critical items: hardcoded VAPID keys (now fixed), public profile access (now fixed), login fallback creating accounts for unrecognized emails (still open).

---

## [2026-09-09] — Added spaced repetition cloud sync

### What changed
User spaced repetition (SM-2) decks can now be synced to and from Supabase.

### Files modified
- `supabase/migrations/20260909000000_add_user_spaced_repetition.sql` — New `user_spaced_repetition` table
- `src/services/dbService.js` — Added `syncSpacedRepetitionItem()`, `syncSpacedRepetitionBatch()`, `fetchUserSpacedRepetition()`, `mapSM2ItemToRow()`, `mapRowToSM2Item()`
- `src/services/spacedRepetition.js` — Added `hydrateSM2FromCloud()`, user-scoped storage keys (`bharatlingo_sm2_items_{userId}`)
- `src/services/auth.jsx` — Added `syncUserSpacedRepetition()` called on login

### Why
SM-2 data was previously only stored in localStorage. Switching devices or browsers lost all spaced repetition progress.

### Impact
Users: Spaced repetition deck is now preserved across devices.
Developers: SM-2 data is now dual-stored (localStorage + Supabase).

---

## [2026-09-07] — Learning state enhancements + hearts removal

### What changed
Added learning activity tracking table; removed the hearts (lives) mechanic.

### Files modified
- `supabase/migrations/20260907000001_add_learning_state.sql` — Added `learning_activity` table for daily activity tracking
- `supabase/migrations/20260907000002_remove_hearts_system.sql` — Removed hearts column from profiles

### Why
Learning activity data was needed for the Dashboard activity chart. Hearts were removed in favour of a no-penalty learning approach (Duolingo's current model).

---

## [2026-09-01] — Initial schema

### What changed
Complete Supabase database schema created.

### Files created
- `supabase/migrations/20260901000000_init_schema.sql` — 18 tables, RLS policies, triggers

### Tables created
languages, courses, units, lessons, vocabulary, exercises, question_options, profiles, user_progress, lesson_attempts, exercise_attempts, xp_transactions, streaks, daily_goals, achievements, user_achievements, leaderboard_entries, notifications

### Triggers created
- `on_auth_user_created` → auto-creates profiles and streaks rows on signup
- `tr_profiles_updated_at` → auto-updates `updated_at` timestamp

---

## [Session: 2026+] — Developer handbook created

### What changed
Full developer handbook created under `docs/developer-guide/`.

### Files created
- `docs/developer-guide/PROJECT_OVERVIEW.md`
- `docs/developer-guide/SYSTEM_ARCHITECTURE.md`
- `docs/developer-guide/FRONTEND_GUIDE.md`
- `docs/developer-guide/BACKEND_GUIDE.md`
- `docs/developer-guide/DATABASE_GUIDE.md`
- `docs/developer-guide/AUTHENTICATION_FLOW.md`
- `docs/developer-guide/LEARNING_ENGINE.md`
- `docs/developer-guide/LOCALIZATION_GUIDE.md`
- `docs/developer-guide/TESTING_GUIDE.md`
- `docs/developer-guide/SECURITY_GUIDE.md`
- `docs/developer-guide/DEPLOYMENT_GUIDE.md`
- `docs/developer-guide/GLOSSARY.md`
- `docs/developer-guide/DEVELOPMENT_CHANGELOG.md` (this file)

### Why
To support the developer-owner learning objective: building accurate architectural knowledge of the codebase alongside development work.

### Based on
Full read-only audit of the actual source code — not assumptions or generic descriptions.

---

## How to update this changelog

After every meaningful change:

1. Add a new entry at the **top** (most recent first)
2. Include: date, description, files modified, reason, user impact, risks
3. Be specific — link to actual file paths and function names
4. Distinguish between: bug fixes, feature additions, security fixes, refactors, documentation

**What counts as "meaningful":**
- Any change to `src/services/auth.jsx` or `src/services/authUtils.js`
- Any new Supabase migration
- Any security fix
- Any new page or major component
- Any change to `src/services/uiTranslations.js`
- Any new test
- Any deployment configuration change
