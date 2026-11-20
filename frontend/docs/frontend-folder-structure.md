# UDYOGA: Feature-Based Frontend Folder Structure

**Project:** UDYOGA – Beyond Credit. Beyond Barriers.  
**Phase:** Phase 3 — System Architecture & Contracts  
**Framework:** React 18/19 + TypeScript + Vite + Tailwind CSS + shadcn/ui  
**Author:** Senior Frontend Architect (Enterprise FinTech)  
**Branch:** `feature/phase-3-architecture`

---

## 1. Directory Tree Overview

```text
src/
├── assets/                       # Static SVGs, logos, audio snippets, branding
├── components/                   # Shared presentation & atom/molecule components
│   ├── common/                   # Global recurring UI (Spinners, Breadcrumbs, Badges, Modals)
│   ├── layout/                   # Global headers, footers, sidebars, floating capsule nav
│   ├── motion/                   # Framer Motion transitions, animated springs, wrappers
│   ├── states/                   # Reusable Empty, Loading, and Error state components
│   └── ui/                       # shadcn/ui primitives (Button, Dialog, Slider, Card, Tabs, etc.)
│
├── config/                       # Environment configuration, constants, navigation routes
├── features/                     # Feature-Driven Modular Architecture
│   ├── auth/                     # Authentication modal, OTP login, demo persona switcher
│   ├── public/                   # Public landing, marketing pages, split waveform visualizer
│   ├── borrower/                 # Borrower portal: Health mirror, sachet customizer, onboarding
│   ├── lender/                   # Underwriting workbench, pipeline grid, triangulation radar
│   ├── admin/                    # Admin cockpit, algorithmic fairness console, connector telemetry
│   └── acie/                     # Alternative Credit Engine UI: SHAP ribbon, What-If simulator
│
├── hooks/                        # Global custom utility hooks (useDebounce, useMediaQuery, useAudio)
├── lib/                          # Utility functions (cn, formatCurrency, dateHelpers, math)
├── mocks/                        # Centralized Mock Service Layer & Persona Profiles
│   ├── data/                     # Persona-specific datasets (Ramesh, Priya, Muthuvel, etc.)
│   ├── handlers/                 # Mock endpoint handlers matching API contracts
│   └── mockService.ts            # Dynamic mock client with configurable network latency
│
├── routes/                       # React Router configuration & RoleGuard protections
├── services/                     # Typed API client layer (Axios/Fetch instance, interceptors)
├── stores/                       # Client state stores (AuthStore, PersonaStore, ThemeStore)
└── types/                        # Pure TypeScript domain interfaces and API payload types
```

---

## 2. Granular Module Breakdown

```text
src/
├── features/
│   ├── public/
│   │   ├── components/
│   │   │   ├── FloatingCapsuleNav.tsx     # Blurred capsule navigation bar (from reference video)
│   │   │   ├── SplitWaveformVisualizer.tsx# "Daily Commerce" vs "Credit Power" interactive split
│   │   │   ├── EligibilityTeaser.tsx      # Real-time slider calculating estimated loan limit
│   │   │   ├── PhoneCallSimulator.tsx     # Interactive iOS/Android phone mockup with live status
│   │   │   ├── AccessibilityTuner.tsx     # Live text size, weight & contrast tuner widget
│   │   │   ├── ScenarioCarousel.tsx       # Horizontal card gallery ("At the counter", "At clinic")
│   │   │   ├── TestimonialMasonry.tsx     # 5-star artisan review masonry
│   │   │   └── BrandFooter.tsx            # Giant typographic full-width footer
│   │   ├── pages/
│   │   │   ├── HomePage.tsx
│   │   │   ├── AboutPage.tsx
│   │   │   ├── HowItWorksPage.tsx
│   │   │   ├── ForBusinessesPage.tsx
│   │   │   ├── ForLendersPage.tsx
│   │   │   ├── TrustSafetyPage.tsx
│   │   │   └── ContactPage.tsx
│   │   └── hooks/
│   │       └── usePublicTeaser.ts
│   │
│   ├── borrower/
│   │   ├── components/
│   │   │   ├── HealthWaveformChart.tsx    # 90-day cash-flow fluid area chart (Recharts)
│   │   │   ├── SachetLoanSlider.tsx       # Interactive loan amount and daily/weekly sweep slider
│   │   │   ├── OnboardingWizard/          # 4-Step progressive onboarding workflow
│   │   │   │   ├── Step1BusinessIdentity.tsx
│   │   │   │   ├── Step2AccountAggregator.tsx
│   │   │   │   ├── Step3AlternativeData.tsx
│   │   │   │   └── Step4LoanCustomizer.tsx
│   │   │   ├── ConsentDrawer.tsx          # DPDP consent review and one-tap revocation toggle
│   │   │   ├── KeyFactStatementModal.tsx  # RBI DLG transparent APR breakdown modal
│   │   │   └── ApplicationTimeline.tsx    # Live step tracker with ETA countdown
│   │   └── pages/
│   │       ├── BorrowerDashboardPage.tsx
│   │       ├── BusinessProfilePage.tsx
│   │       ├── FinancialsPage.tsx
│   │       ├── DocumentsVaultPage.tsx
│   │       ├── ConsentManagementPage.tsx
│   │       ├── ApplyCreditPage.tsx
│   │       ├── TrackingPage.tsx
│   │       ├── FinancialHealthPage.tsx
│   │       └── AssessmentReportPage.tsx
│   │
│   ├── lender/
│   │   ├── components/
│   │   │   ├── TriangulationRadar.tsx     # 3-way Bank vs GST vs UPI congruence radar chart
│   │   │   ├── AnomalyHeatmap.tsx         # Circular loop and spike velocity alert cards
│   │   │   ├── PipelineDataGrid.tsx       # Searchable, filterable risk-tiered table
│   │   │   ├── UnderwriterWorksheet.tsx   # Haircut sliders and DSCR covenant builder
│   │   │   └── SanctionNoteModal.tsx      # Formal sanction generation with digital signature
│   │   └── pages/
│   │       ├── LenderDashboardPage.tsx
│   │       ├── ApplicationPipelinePage.tsx
│   │       ├── ApplicantDetailPage.tsx
│   │       ├── FinancialTriangulationPage.tsx
│   │       ├── CreditReportPage.tsx
│   │       ├── RiskIndicatorsPage.tsx
│   │       ├── DocumentRequestsPage.tsx
│   │       └── DecisionWorkflowPage.tsx
│   │
│   ├── admin/
│   │   ├── components/
│   │   │   ├── DisparateImpactDial.tsx    # 80% Rule (Four-Fifths) compliance gauge
│   │   │   ├── DemographicParityChart.tsx # Gender & geographic approval distribution
│   │   │   ├── ConnectorTelemetryCard.tsx # Third-party API uptime, latency & circuit breaker
│   │   │   └── SecurityAuditTable.tsx     # Cryptographic immutable audit trace viewer
│   │   └── pages/
│   │       ├── AdminOverviewPage.tsx
│   │       ├── UsersManagementPage.tsx
│   │       ├── MasterApplicationsPage.tsx
│   │       ├── AssessmentDriftPage.tsx
│   │       ├── FairnessConsolePage.tsx
│   │       ├── DataQualityPage.tsx
│   │       ├── AuditLogsPage.tsx
│   │       └── SystemTelemetryPage.tsx
│   │
│   └── acie/
│       ├── components/
│       │   ├── ShapRibbon.tsx             # Bi-directional horizontal waterfall (+/- feature impact)
│       │   ├── WhatIfSimulator.tsx        # Counterfactual interactive dual-slider widget
│       │   ├── CreditVitalityDial.tsx     # 0-900 speedometer dial with color spectrum
│       │   └── SparseDataAlert.tsx        # Thin-file confidence calibration notice
│       └── hooks/
│           └── useAcieSimulator.ts
│
├── mocks/
│   ├── data/
│   │   ├── personaRamesh.ts               # Persona 1: Micro Kirana Proprietor
│   │   ├── personaPriya.ts                # Persona 2: Thin-File Textile Exporter
│   │   ├── personaMuthuvel.ts             # Persona 3: Digitally Inexperienced Foundry
│   │   ├── personaVikram.ts               # Persona 4: Lender Credit Analyst
│   │   ├── personaAnanya.ts               # Persona 5: Lender Chief Risk Officer
│   │   ├── personaRajiv.ts                # Persona 6: System Administrator
│   │   └── personaDrSunita.ts             # Persona 7: Ethics & Fairness Auditor
│   ├── handlers/                          # Mock handlers mirroring REST endpoints
│   └── mockService.ts                     # In-memory service with configurable delay
```
