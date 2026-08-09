# LernexAI — Core Project Brief & Audit Report

**Audit date:** 4 August 2026  
**Repository:** `Lernexai-SaaS`  
**Package name:** `lernexai-landing` (v0.0.0)  
**Deploy target:** Vercel (`dist/public`, SPA rewrites)

---

## 1. Executive summary

LernexAI is a **React + TypeScript SaaS learning platform** (Vite) that combines a **marketing site** with a **protected learner app**. Backend is **Supabase** (Auth, Postgres, RLS, Edge Functions). Monetization uses **Razorpay** (Pro upgrade + paid certificates). The **AI tutor** is **Groq-backed** via an Edge Function with lesson context, chat history, and usage limits.

| Area | Status |
|------|--------|
| Auth, browse, enroll, learning workspace | **Strong — production-ready core** |
| Module quizzes & final exam | **Strong — server-backed logic** |
| AI tutor | **Functional — minor prod logging** |
| Razorpay (Pro) | **Strong — server verify + payments table** |
| Certificates | **Improved — DB-backed; trust gaps remain** |
| Build / perf | **Passes build; ~974 kB JS bundle (high)** |
| Automated tests | **Minimal (1 Vitest file; no npm test script)** |

**Bottom line:** The product’s **learn → quiz → exam → tutor → pay** loop is real and wired. **Certificate issuance** moved toward Supabase but still relies on **client-supplied exam scores** and **client inserts** without a single server gate. **Release blockers** for a trustworthy certificate product: server-authoritative completion + issuance, route cleanup, and bundle splitting.

---

## 2. Product & user journey

**Flagship course focus:** Microsoft Excel Essentials (schema and copy still Excel-leaning in places).

**Public:** `/`, `/privacy`, `/terms`, `/contact`, `/about-founder`, `/auth`, `/auth/callback`

**Protected:** `/dashboard`, `/browse`, `/course/:id`, `/my-learning`, `/learning/:courseId`, `/final-exam/:courseId`, `/upgrade`, `/certificate`, `/certificate/:courseId`

**Typical flow:**

1. Land on marketing → sign up (email or Google OAuth).
2. Browse catalog → enroll on course detail.
3. Learning workspace: modules, lessons, progress, AI tutor panel.
4. Module quizzes → final exam (timed, graded).
5. On pass → redirect to certificate checkout with query params.
6. Pay ₹99 (9900 paise) via Razorpay → record purchase in DB → download HTML certificate.
7. Optional Pro upgrade via Razorpay on `/upgrade`.

**Not routed (dead / orphan UI):**

- `src/pages/Player.tsx` — no route in `App.tsx`
- `src/pages/CertificatePage.tsx` — no route in `App.tsx`
- `src/components/AITutor.tsx` — unused; live tutor is `AIChatPanel.tsx` + `aiTutor.ts`

**Extra repo folder:** `tutor/` — standalone embed/widget prototype; not the main app path.

---

## 3. Architecture snapshot

```
┌─────────────────────────────────────────────────────────────┐
│  React 19 + TS + Vite 7 + Tailwind 4 + Wouter + React Query │
│  Radix UI + Framer Motion + Lucide                          │
└───────────────────────────┬─────────────────────────────────┘
                            │
        ┌───────────────────┼───────────────────┐
        ▼                   ▼                   ▼
  Supabase Auth      Supabase Postgres      Edge Functions
  (session/JWT)      (RLS policies)         ├── ai-tutor (Groq)
                                           ├── create-razorpay-order
                                           ├── verify-razorpay-payment
                                           └── final-exam
        │
        └── Client libs: course.ts, finalExam.ts, razorpay.ts,
            aiTutor.ts, certificates.ts, certificate.ts
```

**Scale (approx.):** 19 pages, 23 feature components + 55 `components/ui` primitives, 10 `src/lib` modules, 4 Edge Functions, 10+ SQL maintenance files.

---

## 4. Feature inventory (condensed)

| Feature | Implementation | Notes |
|---------|----------------|-------|
| Marketing | `Home.tsx` + `src/components/landing/*` | Conversion-oriented sections |
| i18n hook | `LanguageContext` | Present; not full i18n product |
| Auth | `AuthContext`, protected routes | Loading gate + redirect |
| Courses | `course.ts` + Supabase | Enrollments, modules, lessons, progress |
| Learning UI | `Learning.tsx`, sidebar, lesson content | Three-panel desktop layout |
| Quizzes | `QuizSection.tsx` + SQL | Attempts persisted |
| Final exam | `FinalExam.tsx`, `finalExam.ts`, edge fn | Pass → certificate URL |
| AI tutor | `AIChatPanel`, `ai-tutor` function | Quotas, history in DB |
| Pro pay | `Upgrade.tsx`, Razorpay EF | Signature verify server-side |
| Certificates | `Certificates.tsx`, `CertificateCheckoutPage.tsx`, `certificates.sql` | Purchases + download log in DB |

---

## 5. Validation run (this audit)

| Check | Result |
|-------|--------|
| `npm run typecheck` | **Pass** |
| `npm run build` | **Pass** |
| Main JS chunk | **974.11 kB** minified (gzip ~276 kB) — **above 500 kB warning** |
| CSS | ~178 kB |
| Build noise | Sourcemap warning on `tooltip.tsx`; Vite note on mixed static/dynamic import of `certificates.ts` |

---

## 6. Risks, bugs & technical debt

### High

| Issue | Detail |
|-------|--------|
| **Certificate score trust** | Checkout reads `score` from **URL query**; `CertificateCheckoutPage` does **not** call `fetchFinalExamStatus`. A user could open `/certificate/:id?score=100` without passing the exam. |
| **Certificate write path** | After Razorpay verify, **`createCertificatePurchase` runs from the browser** via RLS INSERT. Payment is verified server-side, but **exam pass is not enforced** on insert. |
| **Verify URL on certificate** | Download HTML references `https://lernexai.com/verify/{certId}` — **no in-repo verify route/API** found for public validation. |

### Medium

| Issue | Detail |
|-------|--------|
| **Bundle size** | Single large chunk (~974 kB); no route-level code splitting in `App.tsx` (all pages statically imported). |
| **Legacy / duplicate code** | `Player.tsx`, `CertificatePage.tsx`, `AITutor.tsx` unused |
| **SQL sprawl** | Overlapping quiz SQL files (`quiz_attempts`, `module_quizzes`, `module_quiz_setup`) — migration drift risk |
| **Debug logging** | `CertificateCheckoutPage` console logs; `ai-tutor` edge function logs save operations |
| **Certificate ID consistency** | ID generated in client (`createCertificatePurchase` + download HTML) — must match DB row exactly for download tracking |

### Low

| Issue | Detail |
|-------|--------|
| **Type safety** | `catch (err: any)` in `Auth.tsx`, `Upgrade.tsx` |
| **Multi-course scale** | Course/exam SQL and helpers still Excel-first |
| **Tests** | `certificate.test.ts` uses Vitest but **no `test` script** in `package.json` |
| **Typo duplicate doc** | `PROJECT_BREIF.txt` vs `PROJECT_BRIEF.txt` |

### Improved since earlier audits (July 2026)

- **No `localStorage` usage** in `src/` for certificate state (grep clean).
- **`certificate_purchases` / `certificate_downloads`** schema + RLS in `supabase/certificates.sql`.
- **`src/lib/certificates.ts`** centralizes fetch/create/download audit.
- **Final exam → checkout redirect** implemented in `FinalExam.tsx`.

---

## 7. UI / UX (code-informed)

- **Dashboard:** Dense cards; hierarchy could be simplified on mobile (`Dashboard.tsx`, progress/continue components).
- **Learning:** Richest screen; three panels compete on narrow viewports (`Learning.tsx`, `ModuleSidebar`, `AIChatPanel`).
- **Certificates:** Split across list + per-course checkout; status depends on exam + purchase fetches — clearer “locked / ready / purchased” states would help.
- **Marketing:** Polished but long; hero/CTA could stay dominant above fold.
- **Mobile:** Partial hooks (`use-mobile`); dense pages still need layout pass.

---

## 8. Backend & data assets

**SQL (manual / migration-style):** `learning_rls.sql`, `fix_learning_foreign_keys.sql`, `quiz_attempts.sql`, `module_quizzes.sql`, `module_quiz_setup.sql`, `final_exam.sql`, `payments_table.sql`, `ai_tutor.sql`, `certificates.sql`, `test_course.sql`

**Edge Functions:**

- `ai-tutor` — Groq, enrollment check, usage limits, chat persistence
- `create-razorpay-order` / `verify-razorpay-payment` — orders tied to `payments` table
- `final-exam` — exam grading path (use with `finalExam.ts` on client)

**Env / secrets (expected):** Supabase URL/anon key (client), service role + Razorpay + Groq on Edge Functions.

---

## 9. Release readiness checklist

**Ready for beta on learning + tutor + Pro pay:**

- [x] Typecheck & production build
- [x] Protected routes & OAuth callback
- [x] Progress & quiz persistence pattern
- [x] Server-side payment verification for Razorpay

**Not ready for “trusted certificate” launch:**

- [ ] Server validates final exam pass before checkout or before INSERT
- [ ] Certificate row created only via verified webhook/EF (not client-only trust)
- [ ] Public certificate verification endpoint/page
- [ ] Route or remove orphan pages
- [ ] Code splitting / chunk budget
- [ ] CI test script + critical path tests

---

## 10. Recommended priority order

1. **Certificate authority:** Edge Function or DB trigger — require `final_exam` pass + verified `payments` row before `certificate_purchases` insert; reject client-forged scores.
2. **Checkout UX:** Load score from `fetchFinalExamStatus(courseId)`; ignore or cross-check query param.
3. **Verification:** Implement `/verify/:certificateId` (page or API) against `certificate_purchases`.
4. **Wire or delete** `CertificatePage.tsx`, `Player.tsx`, `AITutor.tsx`.
5. **Lazy-load routes** in `App.tsx` to cut initial JS.
6. **Consolidate quiz SQL** into ordered migrations.
7. **Strip debug logs** from checkout and `ai-tutor`.
8. **Add `npm test`** and wire Vitest for payment/certificate/exam helpers.

---

## 11. Key file map (handoff)

| Layer | Paths |
|-------|--------|
| Routing | `src/App.tsx`, `src/context/AuthContext.tsx` |
| Learning | `src/pages/Learning.tsx`, `src/lib/course.ts` |
| Exam | `src/pages/FinalExam.tsx`, `src/lib/finalExam.ts`, `supabase/functions/final-exam/` |
| Tutor | `src/components/AIChatPanel.tsx`, `src/lib/aiTutor.ts`, `supabase/functions/ai-tutor/` |
| Pay | `src/lib/razorpay.ts`, `supabase/functions/create-razorpay-order/`, `verify-razorpay-payment/` |
| Certificates | `src/pages/Certificates.tsx`, `CertificateCheckoutPage.tsx`, `src/lib/certificates.ts`, `supabase/certificates.sql` |
| Deploy | `vercel.json`, `vite.config.ts` |

---

## 12. Related documents in repo

- **`PROJECT_BRIEF.txt`** — Long-form master audit (July 2026); partially outdated on certificates (`localStorage` finding superseded).
- **`PROJECT_DEEP_SCAN_REPORT.md`** — Deep scan summary (July 2026); same certificate caveat.
- **`whattodo.txt`** — Task/backlog notes.
- **`Lernexai-Certificate.html`** — Standalone certificate HTML reference.

---

*End of core brief report. Generated from full-repo static audit + build verification on 4 Aug 2026.*
