# UDYOGA: Frontend System Architecture & Technical Blueprint

**Project:** UDYOGA – Beyond Credit. Beyond Barriers.  
**Phase:** Phase 3 — System Architecture & Contracts  
**Hackathon Track:** The Big Hack 2.0 — Finance Track (F2: Credit for the Credit-Invisible)  
**Author:** Senior Frontend Architect (Enterprise FinTech)  
**Branch:** `feature/phase-3-architecture`

---

## 1. Architectural Philosophy & Technology Stack

UDYOGA is engineered as a high-performance, modular, accessible enterprise Single Page Application (SPA). The frontend is completely decoupled from backend persistence, communicating via strictly typed REST/JSON endpoints, with a zero-friction fallback to an in-memory Mock Service Worker / Service Layer during independent frontend development and offline judging.

```
┌────────────────────────────────────────────────────────────────────────┐
│                        UDYOGA APPLICATION STACK                        │
├────────────────────────────────────────────────────────────────────────┤
│  UI Framework         React 18 / 19 + TypeScript 5 (Strict Mode)       │
│  Build Tool           Vite 6 (Fast HMR, optimized chunking)            │
│  Styling & Motion     Tailwind CSS v3/4 + Framer Motion (60fps springs)│
│  Component Primitives shadcn/ui (Radix UI headless primitives)         │
│  Icons                Lucide React                                     │
│  Data Visualizations  Recharts (Responsive waveforms, radar, bars)     │
│  Forms & Validation   React Hook Form + Zod (Strict schema validation) │
│  Server State / Async TanStack Query v5 (React Query)                  │
│  Client Routing       React Router v6/7 (Data routers, RBAC guards)    │
│  Mock Service Layer   Centralized typed Mock Client (with latency sim) │
└────────────────────────────────────────────────────────────────────────┘
```

---

## 2. Role-Based Access Control (RBAC) & Route Guards

UDYOGA enforces strict client-side route access based on authenticated user tokens, while respecting the backend's ultimate authority on resource authorization.

### 2.1 Role Hierarchy Matrix

```
                          ┌─────────────┐
                          │ SUPER_ADMIN │
                          └──────┬──────┘
                                 │
                 ┌───────────────┴───────────────┐
                 ▼                               ▼
       ┌───────────────────┐           ┌───────────────────┐
       │  LENDER_MANAGER   │           │  ETHICS_AUDITOR   │
       └─────────┬─────────┘           └───────────────────┘
                 ▼
       ┌───────────────────┐
       │  LENDER_OFFICER   │
       └───────────────────┘
                 │
                 ▼
       ┌───────────────────┐
       │  BORROWER_GROWTH  │ (GSTN + AA)
       └─────────┬─────────┘
                 ▼
       ┌───────────────────┐
       │  BORROWER_MICRO   │ (AA + UPI QR)
       └───────────────────┘
```

### 2.2 Client Route Guard Architecture

```typescript
// src/routes/RoleGuard.tsx
export interface RoleGuardProps {
  allowedRoles: UserRole[];
  children: React.ReactNode;
  fallbackRoute?: string;
}

export const RoleGuard: React.FC<RoleGuardProps> = ({
  allowedRoles,
  children,
  fallbackRoute = '/auth',
}) => {
  const { user, isAuthenticated, isLoading } = useAuth();

  if (isLoading) {
    return <FullScreenPulseLoader message="Verifying security credentials..." />;
  }

  if (!isAuthenticated || !user) {
    return <Navigate to={fallbackRoute} replace state={{ from: location.pathname }} />;
  }

  if (!allowedRoles.includes(user.role)) {
    return <AccessDeniedScreen requiredRoles={allowedRoles} currentRole={user.role} />;
  }

  return <>{children}</>;
};
```

---

## 3. Data Flow & Server State Architecture (TanStack Query)

```
[UI Component / Screen]
         │  (Triggers mutation / subscribes to query)
         ▼
[Feature Hook] (e.g. useCreditHealth, useUnderwriterPipeline)
         │  (Calls typed query/mutation with Zod validation)
         ▼
[API Client Layer] (Axios/Fetch Wrapper with Interceptors)
         │  (Checks `VITE_USE_MOCK_SERVICES` flag)
   ┌─────┴────────────────────────┐
   ▼                              ▼
[Live Backend API]      [Centralized Mock Service Layer]
(Teammate Server)       (Latency sim: 300ms, Persona stores)
```

### 3.1 Cache Management & Invalidation Strategy
- **Query Stale Times:**
  - Borrower Profile & Static Metadata: `staleTime: 10 * 60 * 1000` (10 minutes).
  - Financial Waveforms & ACIE Scoring: `staleTime: 60 * 1000` (1 minute).
  - Lender Pipeline & Ingestion Queue: `staleTime: 15 * 1000` (15 seconds, with SSE or refetch on window focus).
- **Optimistic Updates:**
  - Loan configuration sliders and consent revocation execute immediate optimistic UI updates, automatically rolling back if API returns 4xx/5xx.

---

## 4. Design System & Component Library Guidelines

### 4.1 Visual Tokens (Faithful to Reference Video Analysis)
- **Palette:**
  - `canvas-cream`: `#FBF8F3` (Warm primary surface).
  - `canvas-dark`: `#121212` / `#18181B` (Deep charcoal contrast surface).
  - `accent-green`: `#22C55E` / `#34D399` (Electric spring green for primary CTA pills, active waveforms, and score boosts).
  - `muted-green`: `#DCFCE7` (Subtle message bubble and positive tag backgrounds).
  - `brand-navy`: `#16202C` (Deep blue hero card surfaces).
- **Geometry:**
  - Ultra-soft card curvature: `rounded-3xl` (`24px`) and `rounded-[32px]`.
  - Floating pill navigation bar with backdrop blur (`backdrop-blur-md bg-stone-900/80`).
- **Typography:**
  - Display & Headings: Modern geometric sans-serif (Inter Display / Satoshi / Plus Jakarta Sans) with generous tracking and tight leading (`tracking-tight leading-none`).
  - Numerals: Tabular figures (`font-mono` / `tabular-nums`) for currency, APRs, and timers.

### 4.2 Interactive Motion Principles
- **Framer Motion Presets:**
  - Spring transitions: `type: "spring", stiffness: 350, damping: 28`.
  - Enter/Exit staggered reveals for cards and chat bubbles.
  - Interactive split slider transition for the "They Speak / You Read" visualizer adapting to "Daily Commerce / Credit Power".

---

## 5. Resilience, Error Boundaries & Accessibility

1. **Global Error Boundary:** Wraps the entire route tree, catching uncaught rendering errors without white-screening. Provides user-friendly recovery with a "Reload Workspace" action.
2. **Accessible Form Handling:** All inputs use React Hook Form + Zod, with `aria-invalid`, `aria-describedby`, and high-contrast focus rings (`focus-visible:ring-2 focus-visible:ring-emerald-500`).
3. **Responsive Breakpoints:**
   - Mobile-First: Seamless vertical single-column card flows for `320px–640px`.
   - Tablet / Desktop: Two-column split visualizers and multi-column lender workbenches for `768px–1920px`.
