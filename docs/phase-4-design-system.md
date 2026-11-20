# UDYOGA: Design System & Frontend Foundation Specification

**Project:** UDYOGA – Beyond Credit. Beyond Barriers.  
**Phase:** Phase 4 — Design System & Project Scaffold  
**Hackathon Track:** The Big Hack 2.0 — Finance Track (F2: Credit for the Credit-Invisible)  
**Author:** Senior Frontend Architect & World-Class FinTech UI/UX Designer  
**Branch:** `feature/phase-4-design-system`

---

## 1. Design System Philosophy & Reference Video Translation

In direct response to our frame-by-frame analysis of the attached reference video, UDYOGA rejects generic SaaS templates and adopts a **calm, high-craft, editorial-grade FinTech visual language**:

```
REFERENCE VIDEO ANATOMY                         UDYOGA BRAND TRANSLATION
┌─────────────────────────────────────────┐     ┌─────────────────────────────────────────┐
│ Dark capsule top nav with blur          │ ──► │ Floating capsule nav (#1A1A1A / blur)   │
│ Oversized sans-serif typography         │ ──► │ Manrope Display + Inter (tight leading) │
│ Light & Dark transitions (Ivory/Slate)  │ ──► │ Warm Ivory (#F7F4EC) / Forest (#173F35) │
│ Split "They speak" / "You read" card    │ ──► │ Split "Daily Commerce" / "Credit Power" │
│ Live sliders with instant text reaction │ ──► │ "Credit, calibrated your way" Tuner     │
│ Mobile call simulator with transcript   │ ──► │ Interactive Underwriting Phone Mockup   │
│ Massive full-width typographic footer   │ ──► │ Full-width "UDYOGA" brand footer        │
└─────────────────────────────────────────┘     └─────────────────────────────────────────┘
```

---

## 2. UDYOGA Brand Identity & Color Tokens

| Token Name | Hex Code | HSL / CSS Variable | Semantic Usage |
| :--- | :--- | :--- | :--- |
| **Forest Green (Primary)** | `#173F35` | `165 46% 17%` | Core brand identity, primary buttons, deep card backgrounds, trust anchors. |
| **Warm Ivory (Canvas)** | `#F7F4EC` | `44 38% 95%` | Primary background canvas, soft card surfaces, editorial calm. |
| **Terracotta (Accent)** | `#C96B4B` | `15 54% 54%` | High-conversion CTA pill buttons, active interactive focus, key highlights. |
| **Deep Charcoal** | `#1A1A1A` | `0 0% 10%` | High-contrast hero containers, floating capsule navbar, brand footer. |
| **Electric Mint** | `#34D399` | `158 64% 52%` | Positive ACIE score drivers, verified badges, live equalizer waveform pulses. |
| **Off-White / Cream** | `#FAFAF7` | `44 28% 98%` | Form input backgrounds, speech bubbles, card inner containers. |

---

## 3. Typography Architecture

- **Headings & Display:** `Manrope` (`font-display`, weights 600, 700, 800) with `-0.03em` tracking and `leading-[1.08]`.
- **Body & Prose:** `Inter` (`font-sans`, weights 400, 500, 600) with `cv02`, `cv03`, `cv04` OpenType features for maximum legibility on mobile screens.
- **Numbers & Metrics:** `font-mono` / `tabular-nums` for currency (`₹`), APRs, interest calculations, and timer countdowns to prevent tabular layout shifts.

---

## 4. Shared Component Library

1. **Buttons (`src/components/ui/button.tsx`):**
   - `primary` (Forest Green with soft shadow).
   - `accent` / `pill-terracotta` (Terracotta pill button with spring active state).
   - `secondary` (Ivory with subtle forest border).
   - `outline` & `ghost`.
2. **Cards (`src/components/ui/card.tsx`):**
   - `Card` (Warm ivory surface, `rounded-3xl`, `shadow-soft`).
   - `DarkCard` (Charcoal surface, `shadow-elevated`).
3. **Floating Capsule Navbar (`src/components/layout/Navbar.tsx`):**
   - Fixed top-4 centered pill with `backdrop-blur-md` and quick persona switch pill.
4. **Interactive Split Waveform Hero (`src/components/interactive/SplitWaveformHero.tsx`):**
   - 50/50 split container: Charcoal left side with animated equalizer bars connected to daily volume slider; Forest green right side with dynamic pre-approved credit line emerging across the seam.
5. **Live Tuner Widget (`src/components/interactive/LiveTunerWidget.tsx`):**
   - Amount slider, tenor slider, sweep frequency toggle (Daily vs Weekly), and display contrast mode toggle with live calculation of installment and APR.
6. **Phone Simulator (`src/components/interactive/PhoneSimulator.tsx`):**
   - Realistic mobile caller interface simulating live Account Aggregator telemetry and underwriter conversation.
7. **States & Skeletons:**
   - `Skeleton` & `CardSkeleton` for zero cumulative layout shift (CLS).
   - `EmptyState` with illustration and action pill.
   - `ErrorState` with retry trigger.

---

## 5. Centralized Mock Service Layer & Seven Persona Profiles

The mock service layer (`src/mocks/mockService.ts`) provides simulated asynchronous APIs (300ms latency) and holds data for all **7 personas**:
1. `PERSONA_RAMESH`: Micro Kirana proprietor, Hubli, Karnataka. ₹1.5L working capital.
2. `PERSONA_PRIYA`: Small textile studio, Jaipur, Rajasthan. ₹5L GSTN-boosted credit line.
3. `PERSONA_MUTHUVEL`: Brass foundry artisan, Madurai, Tamil Nadu. Tamil vernacular mode.
4. `PERSONA_VIKRAM`: Senior credit analyst, Pragati FinServe NBFC.
5. `PERSONA_ANANYA`: Chief Risk Officer, Utkarsh Small Finance Bank.
6. `PERSONA_RAJIV`: DevOps & platform administrator.
7. `PERSONA_SUNITA`: Ethics and algorithmic fairness auditor.

---

## 6. Verification & Build Confirmation

- **TypeScript Typecheck:** `tsc -b` passed with 0 errors.
- **Vite Production Build:** `vite build` completed in 8.08s with optimized production bundles.
- **Runtime Verification:** Live interactive playground active in `src/App.tsx`.
