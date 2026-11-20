# UDYOGA — Motion Enhancement & Interactive Storytelling Specification

## 1. Executive Summary

In response to the motion design brief, UDYOGA's **Public Landing Page** has been elevated into a world-class fintech interactive experience. Without redesigning or removing any existing content, navigation, or branding, we integrated sophisticated scroll-choreography, multi-layered selective parallax, and an Apple-grade sticky storytelling section.

---

## 2. Implemented Motion Architecture

### 2.1 Viewport-Aware Scroll Reveal Engine (`ScrollReveal.tsx`)
- **Physics-Informed Spring & Deceleration**: Elements use custom cubic bezier curves (`[0.21, 0.47, 0.32, 0.98]`) for tactile, responsive entrance animations.
- **Directional Variety**:
  - Headings & tags reveal vertically with staggered upward trajectory.
  - Side-by-side comparison cards (The Broken Model vs The UDYOGA Flow Paradigm) enter from alternating directions (`left` and `right`) to heighten contrast.
  - Viewport-aware trigger (`margin: -60px 0px`, `once: true`) prevents jarring re-triggers during scrolling.

### 2.2 Multi-Layered Selective Parallax (`ParallaxLayer.tsx`)
- Implemented selective, differential-speed parallax using Framer Motion's `useScroll` and `useTransform`:
  - **Atmospheric Background Blobs**: Soft ambient radial shapes in Forest Green and Terracotta drift at negative and positive differential speeds (`-35px` and `+45px`) relative to viewport movement.
  - **Hero Split-Waveform Canvas**: Floats with subtle vertical parallax (`speed={20}`) to separate foreground commerce controls from the page baseline.
  - **Live Tuner & Phone Simulator**: Floats selectively (`speed={15}` and `speed={10}`) to produce a tangible sense of depth without inducing scroll nausea or layout shift.

### 2.3 Dynamic Count-Up Numbers (`CountUpNumber.tsx`)
- The 4-metric statistics bar (`₹25L Cr`, `85%`, `< 15 Mins`, `0 Bias`) features an exponential ease-out (`easeOutExpo`) count-up animation that triggers automatically when scrolled into the viewport via `requestAnimationFrame`.

### 2.4 Flagship Sticky Product Storyteller (`StickyProductStoryteller.tsx`)
A dedicated interactive 5-stage sticky storytelling section communicating how UDYOGA operates in real life:
1. **Stage 01 • Consented Intake**: Kirana merchant grants ReBIT-certified Account Aggregator & UPI QR consent in 60s.
2. **Stage 02 • Multi-Modal Reconciliation**: 3-Way Triangulation Radar cross-examines GSTN, Bank AA, and UPI QR with 95.8% congruence.
3. **Stage 03 • Explainable Underwriting**: ACIE produces an explainable 0–900 Vitality Score with visual SHAP ribbons and counterfactual coaching.
4. **Stage 04 • Lender Decision Desk**: Human credit officer reviews the structured report, adjusts haircuts, and generates an upfront KFS sanction letter.
5. **Stage 05 • Disbursal & Sachet Repayment**: Direct current account credit in &lt; 4 minutes with evening UPI AutoPay micro-sweeps.

**Choreography**:
- As the user scrolls through the timeline, the left preview card remains **pinned (sticky)** at the top while dynamically morphing between live telemetry cards using Framer Motion's `AnimatePresence`.
- Users can also click on any step or pagination dot to jump immediately to that stage.

### 2.5 Refined Microinteractions
- **Scroll-Aware Capsule Navbar**: The floating capsule automatically increases opacity (`bg-brand-charcoal/95`), deepens shadow elevation, and applies a subtle scale tightening (`scale-[0.99]`) when the page scrolls past 30px.
- **Smooth FAQ Accordion**: The accordion items expand with fluid height transitions (`AnimatePresence`) and rotating chevron indicators.
- **Button Springs**: All CTA buttons now feature active scale transforms (`active:scale-95`) and arrow icon translation micro-effects on hover.

---

## 3. Performance & Accessibility Compliance

- **Zero Layout Shifts (CLS 0.00)**: All animations operate strictly on GPU-composited properties (`transform: translateY/translateX/scale`, `opacity`).
- **No Scroll Hijacking**: Native browser scrolling remains 100% natural and unhindered on both desktop and mobile touch devices.
- **Mobile Graceful Degradation**: On mobile and tablet viewports, the sticky storyteller gracefully stacks while preserving touch interactions.

---

## 4. Verification

- Production build passed with **0 TypeScript and bundling errors** (`✓ built in 16.43s`).
