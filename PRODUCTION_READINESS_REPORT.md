# BharatLingo Production Readiness Report

**Review date:** 2026-10-31  
**Scope:** Final review after security remediation  
**Production changes:** None. No migrations applied, deployment performed, credentials rotated, commits created, or history rewritten.

## Final Status

# NOT READY — SECURITY ISSUES REMAIN

The production gate is not clear. Local build and automated tests pass, but production push authentication and subscription ownership are not enforced, the database migrations do not provide a complete trusted reward-update design, and 12 dependency vulnerability nodes remain unresolved, including critical findings.

## Confirmed Issues

### CR-1: Push authentication is presence-only and ownership is not enforced

Both push send implementations accept any non-empty `Authorization` header in production; neither validates a Supabase access token, resolves its user, compares the request subscription with that user's stored subscription, or prevents one authenticated user from sending to another user's endpoint.

- [api/push.js](api/push.js#L65-L104) checks only `!authHeader`.
- [server/routes/push.js](server/routes/push.js#L20-L47) has the same behavior.
- [src/services/notificationService.js](src/services/notificationService.js#L218-L239) sends only the subscription and payload, with no authorization header.

**Impact:** A caller can use any arbitrary bearer-like value to invoke production push delivery, and a stolen or supplied subscription can be targeted. Production authentication, unauthorized rejection, subscription ownership, and legitimate end-to-end delivery were not proven.

### CR-2: Reward trigger blocks trusted reward updates

[20261031000001_protect_reward_fields.sql](supabase/migrations/20261031000001_protect_reward_fields.sql#L6-L24) claims to allow service-role or controlled-function updates, but contains no authorization branch. It raises for every change to `xp`, `gems`, or `streak`, including trusted server-side updates. Existing client persistence maps these fields into profile updates in [src/services/auth.jsx](src/services/auth.jsx#L109-L137), so legitimate reward persistence is expected to fail after applying the migration.

The trigger protects only `profiles` updates. Existing client-accessible policies also allow users to manage their own `streaks` row and insert their own `xp_transactions` rows in [20260901000000_init_schema.sql](supabase/migrations/20260901000000_init_schema.sql#L356-L389). Those tables are not a secure replacement for an authoritative reward function.

### CR-3: Public leaderboard view is not demonstrably RLS-safe

[20261031000000_fix_profiles_public_access.sql](supabase/migrations/20261031000000_fix_profiles_public_access.sql#L9-L25) creates a normal view and grants it to `anon` and `authenticated`. The comment says it respects RLS, but the migration does not set `security_invoker = true` or otherwise prove that the view owner cannot bypass `profiles` RLS. It also exposes `created_at`, which is not required by the current leaderboard UI and is not part of a minimal public leaderboard contract.

The separate repair script [fix_database_error_saving_new_user.sql](supabase/fix_database_error_saving_new_user.sql#L97-L108) recreates an unrestricted profile read policy under a different name. If that script has been applied after the base schema, dropping only `Public read for leaderboard profiles` does not remove all unrestricted profile reads.

## Dependency Vulnerabilities

`npm audit --json` exited with code 1 and reported 12 vulnerable package nodes: 3 critical, 4 high, and 5 moderate. The installed dependency inventory was 111 production, 189 development, 52 optional packages.

| Package | Severity | Direct? | Exposure | Advisory / issue | Minimal compatible action |
|---|---:|:---:|---|---|---|
| `concurrently` | Critical | Yes | Development only (`dev` script) | Vulnerable `shell-quote` command injection | Update to the latest compatible 10.x release; rerun audit. |
| `shell-quote` | Critical | No | Development only, through `concurrently` | GHSA-pqg4-j6r4-53mv, command injection | Resolve through a non-major `concurrently` update. |
| `proxy-addr` | Critical | No | Production, through Express | GHSA-jqcg-44mw-7w3h, IPv4-mapped IPv6 trust/IP spoofing | Update Express within the 4.x line or use a reviewed lockfile override that selects `proxy-addr >=2.0.8`; test proxy behavior. |
| `body-parser` | High | No | Production, through Express | GHSA-27r3-jxmh-p828, compressed-request trailing-byte DoS | Select `body-parser >=1.20.9` through a compatible Express/lockfile update. |
| `source-map-js` | High | No | Development/build tooling, through PostCSS | GHSA-68fv-2mgg-jv7q, event-loop DoS | Update to `>=1.2.2` through PostCSS. |
| `vite` | High | Yes | Development/build server | Multiple path traversal, command/editor, and middleware issues | Fix requires Vite `8.3.5` and a major upgrade; approval and migration testing required. |
| `postcss` | High/moderate | Yes | Development/build tooling | XSS and arbitrary `.map` file disclosure/path traversal advisories | Update within the PostCSS 8.x line to a release outside `<=8.5.22`. |
| `qs` | Moderate | No | Production, through Express/body-parser | Three array-limit/stringify/DoS advisories; affected through `<=6.16.0` ranges | Update Express/lockfile to a patched `qs`; verify query parsing compatibility. |
| `react-router-dom` | Moderate | Yes | Frontend production bundle | Open redirect and SSR hydration constructor-injection advisories | Fix requires `7.18.5`; do not force. Approve and test React Router 7 migration, or document risk if the app remains client-only. |
| `react-router` | Moderate | No | Frontend production bundle, through `react-router-dom` | Same two advisories, installed `6.30.6` | Resolve with the approved React Router 7 migration. |
| `esbuild` | Moderate | No | Development/build tooling, through Vite | Dev-server cross-origin request/read issue | Resolve when Vite is upgraded; no production runtime exposure identified. |
| `postcss-selector-parser` | Moderate | No | Development/build tooling, through Tailwind/PostCSS | GHSA-rj75-hqrm-r3gf, quadratic selector parsing DoS | Update to `>=6.1.5` through the compatible PostCSS/Tailwind dependency graph. |

Dependency paths were confirmed from the installed tree: Express -> `body-parser`, `proxy-addr`, `qs`; Vite -> `esbuild`, `postcss`; PostCSS -> `source-map-js`; Tailwind -> `postcss-selector-parser`; concurrently -> `shell-quote`; React Router DOM -> `react-router`.

No major upgrade was applied. Recommended first step is a reviewed non-major `npm audit fix` or targeted lockfile update for Express transitive packages, PostCSS, selector parser, source-map-js, and concurrently. Vite and React Router require explicit compatibility approval.

## Supabase Migration Review

| Check | Result |
|---|---|
| Original unrestricted profile policy removed | **Partial.** The named policy is dropped by the migration, but the repair SQL can recreate unrestricted access under `Public read profiles`. The final database policy inventory must be checked. |
| Leaderboard exposes only intended public fields | **Fail.** `id`, `name`, `avatar_url`, `xp`, `streak`, and `level` are plausible public fields; `created_at` is unnecessary. The view's RLS behavior is not secured with `security_invoker`. |
| Direct XP/gems/streak manipulation blocked | **Partial.** Direct profile changes are blocked by the trigger, but the trigger also blocks trusted updates and does not provide a controlled reward function. Related user-writable reward tables remain. |
| Legitimate trusted reward updates remain possible | **Fail.** No service-role/function authorization path is implemented. |
| Trigger bypass through client functions/alternative paths | **Not proven.** No controlled reward function was found; user-writable `streaks`, `xp_transactions`, and `leaderboard_entries` paths require separate review and must not be treated as authoritative reward state. |

Do not apply either migration to production until the view security mode, public column contract, complete policy inventory, and authoritative reward function design are corrected and tested in a disposable Supabase environment.

## Leaderboard Compatibility

The complete source search found:

- The active [Leaderboard.jsx](src/pages/Leaderboard/Leaderboard.jsx#L95-L151) does not query Supabase. It combines hardcoded demo users with `bharatlingo_users` local storage and the current local user, mapping only name, XP, and streak for registered users.
- The database helper [dbService.js](src/services/dbService.js#L217-L246) queries `leaderboard_entries`, not `profiles` and not `leaderboard_public`.
- No frontend, API, or server direct query to `profiles` was found that serves leaderboard rows.

Therefore no existing leaderboard query needs a mechanical switch to `leaderboard_public`, but the new view is currently unused. Existing visible behavior is preserved by the local/demo implementation. Before enabling a database-backed leaderboard, change it to select explicitly from `leaderboard_public` rather than `profiles` or `select('*')`, and return only the view's approved fields. Also review whether local storage should be allowed to populate a public leaderboard from cached profile records.

## Push Notification Verification

| Requirement | Result |
|---|---|
| Production authentication works | **Fail/unverified.** Code checks header presence only; no token validation. |
| Unauthorized requests fail | **Partial.** Missing header returns 401 in production; invalid/arbitrary headers are accepted. |
| Subscription ownership enforced | **Fail.** No ownership lookup or comparison exists. |
| Legitimate notifications work | **Local unit simulation passes; production delivery unverified.** |
| VAPID variables required/configured | **Partial.** Public and private keys are required for sending; `VAPID_SUBJECT` has a default, so it is not required. The endpoint returns 500 when the public key is missing and sending returns 500 when keys are missing. |

The VAPID private key is not exposed to the client build, and the public key is appropriately public. Production must use server-only `VAPID_PUBLIC_KEY`, `VAPID_PRIVATE_KEY`, and an explicitly configured `VAPID_SUBJECT`; do not rely on the fallback subject for release validation.

## Regression Test Results

### Passed locally

- `npm run build`: **PASS**, Vite production build completed.
- `node scratch/run_all_tests.mjs`: **PASS**, 15/15 test files passed.
- All eight supported languages were exercised by the adaptive, assessment, game, tutor, speaking/audio, localization, and lesson suites.
- Lesson generation, assessment generation, progress state transitions, XP/gems/streak invariants, localization, push subscription shape, VAPID resolution, and simulated expired-subscription handling passed their local tests.
- Local persistence tests passed for signup-like profile mapping, profile merging, XP/gems/streak state transitions, and user isolation.

### Not verified in this environment

- Real Supabase signup/login and trigger-created profile: the live Supabase test was skipped because `SUPABASE_URL`/`VITE_SUPABASE_URL`, anon key, test JWT, and test user ID were unavailable.
- Real profile update and reward persistence against the post-migration schema.
- Real leaderboard loading from Supabase.
- Production push authentication, ownership, subscription registration, and delivery.
- Browser-level notification display and service-worker delivery against real VAPID credentials.

These are environment-gated checks, not passes.

## Git History Review

No tracked `.env` file or credential value was printed. The current tracked tree contains only `.env.example` among environment files. Git history includes prior commits touching the push/security files, and [SECURITY_VERIFICATION_REPORT.md](SECURITY_VERIFICATION_REPORT.md#L15-L24) records that old secrets remain in history.

### Safe history-cleanup plan

1. Treat all historical VAPID and Supabase credentials as compromised; rotate them through the provider/production secret store without rewriting history in this review.
2. Confirm current branches/tags and remote references with the repository owners.
3. Prepare a separate approved maintenance window for history rewriting with `git filter-repo` or the organization's approved secret-removal tooling.
4. Re-scan all refs after rewriting, coordinate force-push protection exceptions, and have every clone re-cloned or carefully re-synced.
5. Revoke old credentials only after replacement deployment is confirmed.

No history rewrite or force-push was performed.

## Remaining Manual Actions

- Implement and test real Supabase bearer-token validation on push send endpoints.
- Store subscriptions in an authoritative per-user table or otherwise validate ownership before sending; add rate limiting and payload limits.
- Redesign rewards around a narrowly authorized server-side/database function or service-role path, with atomic XP/gems/streak updates and no client-writable authoritative reward tables.
- Correct the leaderboard view to expose only approved fields and enforce invoker/RLS behavior; remove every unrestricted profile policy from all applied SQL scripts.
- Apply migrations only in a disposable/staging Supabase project first, then run authenticated and anonymous negative tests.
- Patch all non-major dependency vulnerabilities and obtain approval before Vite or React Router major upgrades.
- Rotate historical VAPID/Supabase credentials through the secret manager; do not put replacement values in Git.
- Run the live regression matrix with test users, valid VAPID configuration, and browser push support.

## Deployment Recommendation

**NOT READY — SECURITY ISSUES REMAIN**

Do not deploy the current revision or apply the migrations to production. Re-review after the push authorization/ownership controls, reward authorization design, complete profile policy inventory, non-major dependency fixes, and live Supabase/push regression evidence are complete.
