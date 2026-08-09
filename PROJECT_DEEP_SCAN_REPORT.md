# LernexAI Deep Scan Report
Updated: 27 July 2026

## Scope
Static review of the main app routes, core UI components, Supabase SQL, and edge functions. UI notes below are code-informed; this is not a pixel-by-pixel screenshot audit.

## Executive Summary
- The core product is functional and the main flows are wired end to end: auth, browse, learn, quiz, final exam, payment, and AI tutor.
- The strongest areas are the learning flow, lesson-aware Groq tutor integration, protected routing, and server-side Razorpay verification.
- The main weaknesses are certificate flow integrity, heavy client-side state assumptions, dense UI on important screens, build-size pressure, and some legacy or duplicate code paths.

## Architecture Snapshot
- Frontend: React 19, TypeScript, Vite, Tailwind CSS 4, Wouter, Framer Motion, Radix UI, Lucide icons.
- State and data: Supabase Auth, Postgres, Row Level Security, React Query, local UI state.
- Payments: Razorpay Checkout plus Supabase Edge Functions for order creation and verification.
- Tutor stack: `src/lib/aiTutor.ts` talks to `supabase/functions/ai-tutor/index.ts`, which is lesson-aware and quota-limited.

## What Looks Solid
- Protected routing is cleanly separated in `src/App.tsx`.
- `src/pages/Learning.tsx` integrates the main learning shell with sidebar, lesson content, and AI panel.
- Course and progress data are persisted through Supabase-backed flows.
- The tutor backend checks lesson context, enrollment, chat history, and usage limits.
- Final exam logic is explicit and not purely client-only.
- The app has already passed typecheck and production build at last verification.

## Confirmed Bugs / Glitches / Risky Behaviors

| Severity | Area | Finding | Why it matters | Files |
| --- | --- | --- | --- | --- |
| High | Certificate trust model | Certificate purchase and completion state is stored in `localStorage` and read back from the client | This is not server-authoritative, can desync across devices, and is easy to tamper with for UI state | `src/pages/CertificateCheckoutPage.tsx`, `src/pages/Certificates.tsx`, `src/pages/Dashboard.tsx` |
| High | Completion flow | The final-exam-to-certificate handoff is still incomplete | The learner journey stops short of a clean certificate issuance or download path | `src/pages/FinalExam.tsx`, `src/pages/Certificates.tsx`, `src/pages/CertificateCheckoutPage.tsx`, `src/pages/CertificatePage.tsx` |
| Medium | Bundle size | Vite build warns that the minified JS chunk is above 500 kB | Slower first load, especially on mobile or weaker connections | App shell and route chunks |
| Medium | Build hygiene | Sourcemap warning tied to `src/components/ui/tooltip.tsx` | Build noise and possible packaging cleanup needed | `src/components/ui/tooltip.tsx` |
| Medium | Legacy UI | `src/pages/Player.tsx` is not routed from `src/App.tsx` | Dead code increases maintenance surface and can confuse future work | `src/pages/Player.tsx`, `src/App.tsx` |
| Medium | Legacy tutor component | `src/components/AITutor.tsx` exists but is not imported anywhere | Duplicate tutor UI path adds clutter and can drift from the real implementation | `src/components/AITutor.tsx` |
| Medium | Schema drift risk | Multiple SQL files define overlapping quiz logic and setup steps | Easy to get migrations out of sync or accidentally seed duplicate behavior | `supabase/quiz_attempts.sql`, `supabase/module_quizzes.sql`, `supabase/module_quiz_setup.sql` |
| Medium | Operational hygiene | The AI tutor edge function contains debug logging | Fine during debugging, but noisy logs or leaked context are undesirable in production | `supabase/functions/ai-tutor/index.ts` |
| Low | Type safety | Some error handlers still use `catch (err: any)` | Weakens compile-time safety and can hide structured error details | `src/pages/Auth.tsx`, `src/pages/Upgrade.tsx` |
| Low | Scalability | Several flows still feel Excel-first rather than course-agnostic | Adding more flagship courses will require more abstraction work | `src/lib/course.ts`, `src/lib/finalExam.ts`, `supabase/final_exam.sql` |

## UI / UX Audit

### 1) Dashboard
- The dashboard is information-dense: latest course, progress, CTA blocks, and additional status sections compete for attention.
- The layout likely feels busy on smaller screens because many cards are stacked vertically with different visual priorities.
- Modal or wizard-style interactions add friction when the main goal should be quick re-entry into learning.
Files: `src/pages/Dashboard.tsx`, `src/components/ContinueLearningCard.tsx`, `src/components/CourseProgressBar.tsx`

### 2) Learning workspace
- This is the most feature-rich screen, but it is also the easiest place for clutter to appear.
- The three-panel layout is powerful on desktop, yet on medium and small screens the sidebar, lesson content, and AI panel can fight for space.
- This is a likely source of scroll fatigue and cramped reading width.
Files: `src/pages/Learning.tsx`, `src/components/ModuleSidebar.tsx`, `src/components/LessonContent.tsx`, `src/components/AIChatPanel.tsx`

### 3) Certificate screens
- Certificate checkout, certificate browsing, and certificate rendering are split across separate screens and states.
- Because the purchase state is client-derived, the UI can feel optimistic without enough proof of actual entitlement.
- These pages need stronger hierarchy, clearer status messaging, and cleaner trust cues.
Files: `src/pages/Certificates.tsx`, `src/pages/CertificateCheckoutPage.tsx`, `src/pages/CertificatePage.tsx`

### 4) Browse and course detail
- These screens are structurally fine but likely card-heavy and repetitive.
- They can benefit from stronger typographic hierarchy and better spacing between metadata, CTA blocks, and content sections.
Files: `src/pages/Browse.tsx`, `src/pages/CourseDetail.tsx`

### 5) Landing and marketing pages
- The marketing site is polished, but it is long-form and section-heavy.
- If the goal is conversion, some sections could be tightened so the hero, value proposition, and CTA remain dominant.
Files: landing components under `src/components/landing`

### 6) Mobile polish
- The codebase already includes mobile-safe work, but the densest screens still need another pass.
- Highest risk areas are dashboard, learning workspace, certificate pages, and long landing sections.
- Expect the biggest payoff from simplifying layout stacks rather than adding more content.
Files: `src/pages/Dashboard.tsx`, `src/pages/Learning.tsx`, `src/pages/Certificates.tsx`, landing components

## Data and Backend Observations
- `supabase/learning_rls.sql` and `supabase/fix_learning_foreign_keys.sql` show good attention to database integrity.
- `supabase/ai_tutor.sql` supports tutor history and daily usage tracking, which is a solid pattern.
- The product would benefit from fewer client-truth fallbacks and more server-truth checks for purchase and completion state.
- The payment stack is well separated, but the UI should be tighter about reflecting authoritative backend results.

## Technical Debt Summary
- Dead or legacy files: `src/components/AITutor.tsx`, `src/pages/Player.tsx`
- Overlapping SQL scripts increase schema maintenance cost
- Client-side state is used where persistent server state would be safer
- More route-level code splitting would likely help the build-size warning
- Error handling is still inconsistent across some pages

## Validation Status
- Last known `npm run typecheck`: pass
- Last known `npm run build`: pass
- Build warnings: large chunk above 500 kB, plus sourcemap warning from `src/components/ui/tooltip.tsx`
- This report did not modify application logic

## Priority Fix Order
1. Move certificate ownership and completion state to server-side persistence.
2. Finish the final exam to certificate and download handoff.
3. Remove dead tutor and player code paths and consolidate the remaining tutor flow.
4. Split large route bundles and reduce the initial JS payload.
5. Rework the dashboard and learning layouts for clearer hierarchy on smaller screens.
6. Normalize error handling and reduce debug logging for production.

## Files Reviewed
`src/App.tsx`
`src/context/AuthContext.tsx`
`src/lib/course.ts`
`src/lib/finalExam.ts`
`src/lib/razorpay.ts`
`src/lib/aiTutor.ts`
`src/pages/Auth.tsx`
`src/pages/AuthCallback.tsx`
`src/pages/Home.tsx`
`src/pages/Browse.tsx`
`src/pages/CourseDetail.tsx`
`src/pages/MyLearning.tsx`
`src/pages/FinalExam.tsx`
`src/pages/Upgrade.tsx`
`src/pages/Certificates.tsx`
`src/pages/CertificateCheckoutPage.tsx`
`src/pages/CertificatePage.tsx`
`src/pages/Player.tsx`
`src/components/AIChatPanel.tsx`
`src/components/LessonContent.tsx`
`src/components/ModuleSidebar.tsx`
`src/components/QuizSection.tsx`
`src/components/CourseProgressBar.tsx`
`src/components/ContinueLearningCard.tsx`
`src/components/landing/*`
`supabase/ai_tutor.sql`
`supabase/learning_rls.sql`
`supabase/fix_learning_foreign_keys.sql`
`supabase/quiz_attempts.sql`
`supabase/module_quizzes.sql`
`supabase/module_quiz_setup.sql`
`supabase/final_exam.sql`
`supabase/payments_table.sql`
`supabase/functions/ai-tutor/index.ts`

End of report.
