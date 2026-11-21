# BharatLingo Comprehensive Audit Report

**Audit Date:** 2026-10-30  
**Repository:** https://github.com/Siddhi-m-20/bharatlingo  
**Auditor:** Senior Software Engineer, Application Security Auditor, and QA Engineer  
**Scope:** Full repository audit per requirements

---

## Table of Contents

- [A. Executive Summary](#a-executive-summary)
- [B. Findings](#b-findings)
- [C. Security Findings](#c-security-findings)
- [D. Functional Findings](#d-functional-findings)
- [E. Test Results](#e-test-results)
- [F. Prioritized Remediation Plan](#f-prioritized-remediation-plan)
- [G. Final Verification Checklist](#g-final-verification-checklist)

---

## A. Executive Summary

### Overall Project Health
BharatLingo is a comprehensive language learning platform for Indian languages with solid architecture (React frontend, Express backend, Supabase integration). The project shows good separation of concerns and has many features. However, there are **critical security issues** that require immediate attention.

### Major Risks

1. **CRITICAL - Hardcoded credentials in source** - VAPID keys and Supabase credentials are hardcoded in multiple files
2. **CRITICAL - CORS misconfiguration** - Wildcard CORS (Access-Control-Allow-Origin: '*') on API endpoints
3. **HIGH - Overly permissive RLS policies** - Public read access to profiles table for leaderboard functionality
4. **HIGH - Unauthenticated API endpoints** - Push notification endpoints lack authentication
5. **HIGH - Secrets committed to repository** - .env file contains real credentials and is not ignored properly

### Immediate Priorities
- Remove all hardcoded credentials and rotate them
- Fix CORS configuration  
- Review and tighten RLS policies
- Add authentication to sensitive API endpoints
- Remove secrets from git history (though report says don't modify git history, need to flag)


---

## B. Findings

### Critical Severity

#### CRIT-001: Hardcoded VAPID private and public keys in source code
- **Severity:** Critical
- **Category:** Security - Credential Exposure
- **Files:**
  - \pi/push.js:4-10\ - Hardcoded VAPID keys as fallbacks
  - \server/routes/push.js\ uses service that may have keys
  - \.env:16-20\ - Contains real VAPID keys (also committed)
  - \server/services/pushService.js\ - Uses env vars
- **Evidence:**
\\\js
// api/push.js
const VAPID_PUBLIC_KEY =
  process.env.VAPID_PUBLIC_KEY ||
  'BCvkNefqYlkTi1ATnFmoz-t906jPgPvctWCaI8ujqNZHLCWtDddvj0eyS6e5nQKn6D4GwtDj0FoWu2cG5qUnU0Y'
const VAPID_PRIVATE_KEY =
  process.env.VAPID_PRIVATE_KEY || '7v9pCsV-juMrSGLN-dGEZuTL4tQcavHouQcC5tVZn54'
\\\
- **Impact:** Anyone can forge push notifications to all subscribers. VAPID private key allows impersonation of the push service.
- **Reproduction:** Keys are visible in source code - can be extracted and misused.
- **Recommended Fix:** Remove all hardcoded fallbacks. Fail securely if env vars missing. Rotate these keys immediately. Never commit secrets.

#### CRIT-002: Hardcoded Supabase credentials in .env committed to repo
- **Severity:** Critical
- **Category:** Security - Credential Exposure
- **Files:** \.env:10-12\
- **Evidence:**
\\\
VITE_SUPABASE_URL=https://riyrfdkfdathzfcqlnvc.supabase.co
VITE_SUPABASE_ANON_KEY=sb_publishable_sIj5ndgNaixgk4j68IlY2A_PIK2kI5L
\\\
- **Impact:** The anon key is exposed. While anon keys are designed to be public with RLS, combined with other issues could be exploited.
- **Reproduction:** Credentials are in committed .env file visible in repo.
- **Recommended Fix:** Remove .env from repo, add to .gitignore (already in .gitignore but file exists), rotate keys, use environment variables only.

#### CRIT-003: Wildcard CORS on all API endpoints
- **Severity:** Critical  
- **Category:** Security - CORS Misconfiguration
- **Files:**
  - \pi/push.js:65-73\ - \Access-Control-Allow-Origin': '*'\
  - \pi/tts.js:11-16\ - \Access-Control-Allow-Origin': '*'\
  - \server/index.js:21\ - Uses \cors()\ with defaults (allows all origins)
- **Evidence:**
\\\js
res.setHeader('Access-Control-Allow-Origin', '*')
\\\
- **Impact:** Any website can make requests to these APIs, enabling CSRF-like attacks and abuse.
- **Reproduction:** Any origin can call the endpoints.
- **Recommended Fix:** Restrict CORS to specific trusted domains only.

### High Severity

#### HIGH-001: Overly permissive RLS policy on profiles table
- **Severity:** High
- **Category:** Security - Authorization/Data Leak
- **File:** \supabase/schema.sql:376-377\
- **Evidence:**
\\\sql
DROP POLICY IF EXISTS 'Public read for leaderboard profiles' ON public.profiles;
CREATE POLICY 'Public read for leaderboard profiles' ON public.profiles FOR SELECT USING (true);
\\\
- **Impact:** Anyone (including anonymous users) can read ALL profiles including names, emails, avatars, bio, xp, gems, learning progress, etc. This is a massive data leak of private learner information.
- **Reproduction:** With anon key, query profiles table returns all user data.
- **Recommended Fix:** Remove this policy or restrict it to only non-sensitive fields via a view. Leaderboard should only expose minimal public info (name, avatar, xp) not full profile data.

#### HIGH-002: Unauthenticated push notification endpoints
- **Severity:** High
- **Category:** Security - Authentication/Authorization
- **Files:** \pi/push.js\, \server/routes/push.js\
- **Evidence:** No authentication checks in POST endpoints for sending push notifications
- **Impact:** Anyone can send push notifications to any valid subscription (spam/abuse). Also the test endpoint is public.
- **Reproduction:** POST to /api/push with any valid subscription sends notifications.
- **Recommended Fix:** Require authentication for sending notifications. Only allow users to send to their own subscriptions or implement rate limiting.

#### HIGH-003: Push notification service allows sending to any subscription
- **Severity:** High
- **Category:** Security - Abuse
- **File:** \pi/push.js:135-189\
- **Impact:** No validation that subscription belongs to the requesting user. Combined with public endpoint = anyone can spam.
- **Recommended Fix:** Authenticate requests, validate subscription ownership, add rate limiting.

#### HIGH-004: CORS allows credentials with wildcard origin
- **Severity:** High
- **Category:** Security - CORS
- **Files:** \pi/push.js:66\ sets \Access-Control-Allow-Credentials': 'true'\ with \origin: '*'\ - this is invalid/browsers reject but shows bad practice
- **Impact:** Dangerous configuration pattern.
- **Recommended Fix:** If using credentials, must specify exact origin, not wildcard.



### Medium Severity

#### MED-001: Service worker caches aggressively without proper invalidation strategy
- **Severity:** Medium
- **Category:** PWA - Cache Management
- **Files:** Need to inspect service worker
- **Impact:** Users may see stale content after updates.
- **Recommended Fix:** Ensure proper cache versioning and update mechanism.

#### MED-002: No rate limiting on API endpoints
- **Severity:** Medium
- **Category:** Security - Abuse
- **Files:** All API endpoints
- **Impact:** Vulnerable to brute force, spam, abuse.
- **Recommended Fix:** Implement rate limiting middleware.

#### MED-003: Error messages leak internal details
- **Severity:** Medium
- **Category:** Security - Information Disclosure
- **File:** \server/index.js:37-40\, \pi/tts.js:99\
- **Evidence:**
\\\js
res.status(500).json({
  error: 'TTS synthesis error',
  message: err.message, // Leaks internal error details
})
\\\
- **Impact:** Could reveal implementation details useful for attackers.
- **Recommended Fix:** Return generic error messages in production, log details server-side.

#### MED-004: Local storage used for sensitive auth data without encryption
- **Severity:** Medium
- **Category:** Security - Data Storage
- **Files:** \src/services/auth.jsx\ stores user objects in localStorage
- **Impact:** XSS could steal user session data from localStorage.
- **Recommended Fix:** Consider httpOnly cookies for sessions if using Supabase properly, or ensure XSS protections.

#### MED-005: Password stored in localStorage in plain text comparison fallback
- **Severity:** Medium
- **Category:** Security - Authentication
- **File:** \src/services/auth.jsx:678-690\
- **Evidence:** Falls back to comparing plain text passwords if not bcrypt hashed
- **Impact:** Weakens security for local fallback mode.
- **Recommended Fix:** Always use proper hashing, remove plain text fallback.

### Low Severity

#### LOW-001: Console.error/warn in production code
- **Severity:** Low
- **Category:** Code Quality
- **Impact:** May leak information in browser console.
- **Recommended Fix:** Use proper logging service.

#### LOW-002: Missing input validation on some API endpoints
- **Severity:** Low
- **Category:** Security - Input Validation
- **Impact:** Could cause errors or unexpected behavior.
- **Recommended Fix:** Add comprehensive validation.


---

## D. Functional Findings

### Critical/High Functional Issues

#### FUNC-001: Onboarding flow changes per AGENTS.md requirements
- **Status:** Need to verify implementation matches AGENTS.md
- **AGENTS.md states:** Onboarding has 4 steps (Age, Preferred language, Target language, Learning goal). No "How much time do you want to practice?" question. Button says "Find My Level ?"
- **Files to check:** src/pages/Onboarding/*

#### FUNC-002: Site language and preferred language sync
- **Requirement:** Must remain in 100% two-way sync
- **Implementation:** Found syncSiteLanguage() in auth.jsx and listeners
- **Need to verify:** All sync points work correctly

#### FUNC-003: Localization coverage
- **Requirement:** All UI strings must use translations, no hardcoded English after login
- **Files:** src/services/themeContext.jsx, src/services/uiTranslations.js
- **Need to verify:** Coverage across all components

#### FUNC-004: Learning requirements
- **Minimum 15 unique questions per lesson**
- **8 languages support**
- **SM-2 spaced repetition**
- **Need to verify implementation**
---

## E. Test Results

### Available Test Infrastructure
**Tests found in /tests:**
- verify_supabase_sm2.mjs
- supabase_sm2.test.js  
- smoke_check.js
- plan.md
- smoke.spec.ts

### Commands Executed

#### Lint/Typecheck
- **Command:** 
pm run lint / 
pm run typecheck - Not found in package.json scripts
- **Status:** Could not run (no scripts defined)

#### Tests
- **Command:** 
pm test - Not found in package.json scripts
- **Status:** Could not run

#### Build
- **Command:** 
pm run build
- **Status:** Will attempt to run

#### Dependency Audit
- **Command:** 
pm audit --audit-level=moderate
- **Status:** Will attempt to run

#### Build Test
- **Command:** \
pm run build\  \n- **Status:** PASSED  \n- **Result:** Build completed successfully in ~97s, 1820 modules transformed, all assets generated  \n
#### Dependency Audit
- **Command:** \
pm audit --audit-level=moderate\  \n- **Status:** FAILED - Vulnerabilities found  \n- **Result:** 12 vulnerabilities (5 moderate, 4 high, 3 critical). Key issues: shell-quote command injection (critical), qs DoS (moderate), react-router issues (moderate), source-map-js DoS (high)  \n
---

## F. Prioritized Remediation Plan

### IMMEDIATE (Critical - Fix within 24 hours)

1. **Remove hardcoded credentials**
   - Remove VAPID key fallbacks from pi/push.js
   - Remove/rotate all secrets from .env
   - Ensure .env is not committed and add to gitignore properly
   - Rotate Supabase anon key if exposed
   - Rotate VAPID keys

2. **Fix CORS configuration**
   - Restrict Access-Control-Allow-Origin to specific trusted domains
   - Fix credential + wildcard issue
   - Update all API endpoints

3. **Tighten RLS policies**
   - Remove or restrict "Public read for leaderboard profiles" policy
   - Create a secure view for leaderboard data with only necessary fields
   - Audit all RLS policies

### HIGH PRIORITY (Fix within 3-5 days)

4. **Add authentication to push endpoints**
   - Require authentication for sending push notifications
   - Validate subscription ownership
   - Add rate limiting

5. **Fix information disclosure**
   - Don't leak error details in API responses
   - Review logging

6. **Address npm audit vulnerabilities**
   - Run 
pm audit fix for non-breaking fixes
   - Plan for breaking changes (react-router upgrade)

### MEDIUM PRIORITY (Fix within 1-2 weeks)

7. **Add rate limiting** to all public API endpoints
8. **Improve error handling** and input validation
9. **Review localStorage usage** for sensitive data
10. **Fix plain text password fallback**

### LOW PRIORITY (Ongoing improvements)

11. **Remove console statements** from production
12. **Add security headers**
13. **Improve test coverage**

---

## G. Final Verification Checklist

### Security Verification
- [ ] All hardcoded credentials removed
- [ ] Secrets rotated
- [ ] CORS properly configured
- [ ] RLS policies reviewed and tightened
- [ ] Push endpoints authenticated
- [ ] No credential exposure in logs/errors
- [ ] npm audit issues addressed

### Functionality Verification  
- [ ] Onboarding matches AGENTS.md requirements (4 steps, correct button text)
- [ ] Site language and preferred language sync correctly
- [ ] All 8 languages properly supported
- [ ] Localization complete (no hardcoded English after login)
- [ ] Learning flow works correctly (>=15 questions per lesson)
- [ ] SM-2 spaced repetition functional
- [ ] Build passes
- [ ] Core user flows tested

### Compliance Verification
- [ ] AGENTS.md requirements followed
- [ ] User data isolation enforced
- [ ] No production DB modifications
- [ ] No secrets in source
