import React, { useState } from 'react';
import { Navbar } from '@/components/layout/Navbar';
import { SplitWaveformHero } from '@/components/interactive/SplitWaveformHero';
import { LiveTunerWidget } from '@/components/interactive/LiveTunerWidget';
import { PhoneSimulator } from '@/components/interactive/PhoneSimulator';
import { PersonaSwitcher } from '@/components/interactive/PersonaSwitcher';
import { StickyProductStoryteller } from '@/components/interactive/StickyProductStoryteller';
import { ScrollReveal } from '@/components/interactive/ScrollReveal';
import { ParallaxLayer } from '@/components/interactive/ParallaxLayer';
import { CountUpNumber } from '@/components/interactive/CountUpNumber';
import { MovingStatsTicker } from '@/components/interactive/MovingStatsTicker';
import { ProblemSolution } from '@/features/public/components/ProblemSolution';
import { HowItWorks } from '@/features/public/components/HowItWorks';
import { AcieExplanation } from '@/features/public/components/AcieExplanation';
import { BenefitsSection } from '@/features/public/components/BenefitsSection';
import { TrustSafetySection } from '@/features/public/components/TrustSafetySection';
import { FaqSection } from '@/features/public/components/FaqSection';
import { ContactSection } from '@/features/public/components/ContactSection';
import { AuthModal } from '@/features/public/components/AuthModal';

import { BorrowerLayout } from '@/features/borrower/layout/BorrowerLayout';
import { BorrowerDashboard } from '@/features/borrower/components/BorrowerDashboard';
import { OnboardingWizard } from '@/features/borrower/components/OnboardingWizard';
import { BusinessProfileView } from '@/features/borrower/components/BusinessProfileView';
import { FinancialsView } from '@/features/borrower/components/FinancialsView';
import { DocumentUploadView } from '@/features/borrower/components/DocumentUploadView';
import { ConsentManagementView } from '@/features/borrower/components/ConsentManagementView';
import { ApplicationCreationView } from '@/features/borrower/components/ApplicationCreationView';
import { ApplicationTrackingView } from '@/features/borrower/components/ApplicationTrackingView';
import { FinancialHealthView } from '@/features/borrower/components/FinancialHealthView';
import { AssessmentReportView } from '@/features/borrower/components/AssessmentReportView';
import { WhatIfSimulatorView } from '@/features/borrower/components/WhatIfSimulatorView';

import { LenderLayout } from '@/features/lender/layout/LenderLayout';
import { LenderDashboard } from '@/features/lender/components/LenderDashboard';
import { ApplicationPipeline } from '@/features/lender/components/ApplicationPipeline';
import { ApplicantDetailWorkbench } from '@/features/lender/components/ApplicantDetailWorkbench';

import { AdminLayout } from '@/features/admin/layout/AdminLayout';
import { AdminDashboard } from '@/features/admin/components/AdminDashboard';
import { FairnessMonitoringView } from '@/features/admin/components/FairnessMonitoringView';
import { UserManagementView } from '@/features/admin/components/UserManagementView';
import { ApplicationMasterLedger } from '@/features/admin/components/ApplicationMasterLedger';
import { AssessmentMonitoringView } from '@/features/admin/components/AssessmentMonitoringView';
import { DataQualityMonitoringView } from '@/features/admin/components/DataQualityMonitoringView';
import { AuditLogsView } from '@/features/admin/components/AuditLogsView';
import { SystemTelemetryView } from '@/features/admin/components/SystemTelemetryView';
import { ReportsExportsView } from '@/features/admin/components/ReportsExportsView';

import { mockService } from '@/mocks/mockService';
import { PersonaProfile } from '@/types';
import { CheckCircle2, ShieldCheck, ArrowRight, Sparkles, Building2, Wallet, Scale, ShieldAlert } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { toast } from 'sonner';

export function App() {
  const [appMode, setAppMode] = useState<'PUBLIC' | 'BORROWER_PORTAL' | 'LENDER_PORTAL' | 'ADMIN_PORTAL'>('PUBLIC');
  const [borrowerView, setBorrowerView] = useState<string>('/borrower/dashboard');
  const [lenderView, setLenderView] = useState<string>('/lender/dashboard');
  const [adminView, setAdminView] = useState<string>('/admin/overview');
  const [selectedAppId, setSelectedAppId] = useState<string>('APP-2026-0891');
  const [activePersona, setActivePersona] = useState<PersonaProfile>(mockService.getActivePersona());
  const [isPersonaModalOpen, setIsPersonaModalOpen] = useState<boolean>(false);
  const [isAuthModalOpen, setIsAuthModalOpen] = useState<boolean>(false);

  const handleSelectPersona = (id: string) => {
    const updated = mockService.setActivePersona(id);
    setActivePersona({ ...updated });
    if (updated.role.startsWith('BORROWER')) {
      setAppMode('BORROWER_PORTAL');
    } else if (updated.role.startsWith('LENDER')) {
      setAppMode('LENDER_PORTAL');
      setLenderView('/lender/dashboard');
    } else if (updated.role === 'SUPER_ADMIN' || updated.role === 'ETHICS_AUDITOR') {
      setAppMode('ADMIN_PORTAL');
      setAdminView(updated.role === 'ETHICS_AUDITOR' ? '/admin/fairness' : '/admin/overview');
    }
  };

  const handleAuthSuccess = (personaKey: string) => {
    const p = mockService.setActivePersona(personaKey);
    setActivePersona({ ...p });
    if (p.role.startsWith('LENDER')) {
      setAppMode('LENDER_PORTAL');
      setLenderView('/lender/dashboard');
    } else if (p.role === 'SUPER_ADMIN' || p.role === 'ETHICS_AUDITOR') {
      setAppMode('ADMIN_PORTAL');
      setAdminView(p.role === 'ETHICS_AUDITOR' ? '/admin/fairness' : '/admin/overview');
    } else {
      setAppMode('BORROWER_PORTAL');
      setBorrowerView('/borrower/dashboard');
    }
  };

  const handleScrollTo = (sectionId: string) => {
    if (appMode !== 'PUBLIC') {
      setAppMode('PUBLIC');
      setTimeout(() => {
        document.getElementById(sectionId)?.scrollIntoView({ behavior: 'smooth' });
      }, 100);
      return;
    }
    document.getElementById(sectionId)?.scrollIntoView({ behavior: 'smooth' });
  };

  // If in Admin & Auditor Portal mode
  if (appMode === 'ADMIN_PORTAL') {
    return (
      <AdminLayout
        activePersona={activePersona}
        currentView={adminView}
        onNavigate={(v) => setAdminView(v)}
        onReturnToPublic={() => setAppMode('PUBLIC')}
        onOpenPersonaModal={() => setIsPersonaModalOpen(true)}
      >
        {adminView === '/admin/overview' && (
          <AdminDashboard onNavigate={(v) => setAdminView(v)} />
        )}
        {adminView === '/admin/fairness' && (
          <FairnessMonitoringView />
        )}
        {adminView === '/admin/users' && (
          <UserManagementView />
        )}
        {adminView === '/admin/applications' && (
          <ApplicationMasterLedger />
        )}
        {adminView === '/admin/assessments' && (
          <AssessmentMonitoringView />
        )}
        {adminView === '/admin/data-quality' && (
          <DataQualityMonitoringView />
        )}
        {adminView === '/admin/audit-logs' && (
          <AuditLogsView />
        )}
        {adminView === '/admin/system' && (
          <SystemTelemetryView />
        )}
        {adminView === '/admin/reports' && (
          <ReportsExportsView />
        )}

        <PersonaSwitcher
          isOpen={isPersonaModalOpen}
          onClose={() => setIsPersonaModalOpen(false)}
          activePersonaId={activePersona.id}
          onSelectPersona={handleSelectPersona}
        />
      </AdminLayout>
    );
  }

  // If in Lender Portal mode
  if (appMode === 'LENDER_PORTAL') {
    return (
      <LenderLayout
        activePersona={activePersona}
        currentView={lenderView}
        onNavigate={(v) => setLenderView(v)}
        onReturnToPublic={() => setAppMode('PUBLIC')}
        onOpenPersonaModal={() => setIsPersonaModalOpen(true)}
      >
        {lenderView === '/lender/dashboard' && (
          <LenderDashboard
            onSelectApplication={(id) => {
              setSelectedAppId(id);
              setLenderView('/lender/workbench');
            }}
            onNavigateToPipeline={() => setLenderView('/lender/pipeline')}
          />
        )}
        {lenderView === '/lender/pipeline' && (
          <ApplicationPipeline
            onSelectApplication={(id) => {
              setSelectedAppId(id);
              setLenderView('/lender/workbench');
            }}
          />
        )}
        {lenderView === '/lender/workbench' && (
          <ApplicantDetailWorkbench
            applicationId={selectedAppId}
            onBackToPipeline={() => setLenderView('/lender/pipeline')}
          />
        )}

        <PersonaSwitcher
          isOpen={isPersonaModalOpen}
          onClose={() => setIsPersonaModalOpen(false)}
          activePersonaId={activePersona.id}
          onSelectPersona={handleSelectPersona}
        />
      </LenderLayout>
    );
  }

  // If in Borrower Portal mode, render the complete multi-screen borrower portal
  if (appMode === 'BORROWER_PORTAL') {
    return (
      <BorrowerLayout
        activePersona={activePersona}
        currentView={borrowerView}
        onNavigate={(v) => setBorrowerView(v)}
        onReturnToPublic={() => setAppMode('PUBLIC')}
        onOpenPersonaModal={() => setIsPersonaModalOpen(true)}
      >
        {borrowerView === '/borrower/dashboard' && (
          <BorrowerDashboard
            activePersona={activePersona}
            onNavigate={(v) => setBorrowerView(v)}
          />
        )}
        {borrowerView === '/borrower/apply' && (
          <ApplicationCreationView
            onComplete={() => setBorrowerView('/borrower/tracking')}
          />
        )}
        {borrowerView === '/borrower/onboarding' && (
          <OnboardingWizard
            onComplete={() => setBorrowerView('/borrower/dashboard')}
          />
        )}
        {borrowerView === '/borrower/profile' && (
          <BusinessProfileView activePersona={activePersona} />
        )}
        {borrowerView === '/borrower/financials' && (
          <FinancialsView activePersona={activePersona} />
        )}
        {borrowerView === '/borrower/documents' && (
          <DocumentUploadView />
        )}
        {borrowerView === '/borrower/consent' && (
          <ConsentManagementView />
        )}
        {borrowerView === '/borrower/tracking' && (
          <ApplicationTrackingView activePersona={activePersona} />
        )}
        {borrowerView === '/borrower/health' && (
          <FinancialHealthView activePersona={activePersona} />
        )}
        {borrowerView === '/borrower/assessment' && (
          <AssessmentReportView activePersona={activePersona} />
        )}
        {borrowerView === '/borrower/insights' && (
          <WhatIfSimulatorView />
        )}

        <PersonaSwitcher
          isOpen={isPersonaModalOpen}
          onClose={() => setIsPersonaModalOpen(false)}
          activePersonaId={activePersona.id}
          onSelectPersona={handleSelectPersona}
        />
      </BorrowerLayout>
    );
  }

  // ==========================================
  // PUBLIC MARKETING & CONVERSION WEBSITE
  // ==========================================
  return (
    <div className="min-h-screen bg-brand-ivory text-brand-charcoal flex flex-col justify-between selection:bg-brand-forest selection:text-white">

      {/* Floating Capsule Navbar (Faithful to reference video) */}
      <Navbar
        activePersonaName={`${activePersona.name} (${activePersona.badge.split(' ')[0]})`}
        onOpenPersonaModal={() => setIsPersonaModalOpen(true)}
        isAuthenticated={false}
        onOpenAuthModal={() => setIsAuthModalOpen(true)}
        onNavigate={(sec) => {
          if (sec === 'how-it-works') handleScrollTo('how-it-works-sec');
          if (sec === 'stories') handleScrollTo('stories-sec');
          if (sec === 'for-businesses') handleScrollTo('problem-sec');
          if (sec === 'for-lenders') {
            setAppMode('LENDER_PORTAL');
            setLenderView('/lender/dashboard');
          }
          if (sec === 'fairness') {
            setAppMode('ADMIN_PORTAL');
            setAdminView('/admin/fairness');
          }
          if (sec === 'apply') {
            setAppMode('BORROWER_PORTAL');
            setBorrowerView('/borrower/apply');
          }
          if (sec === 'home') handleScrollTo('hero-sec');
        }}
      />

      {/* Hero Section with Parallax Background Atmosphere */}
      <section id="hero-sec" className="relative pt-32 pb-20 md:pt-40 md:pb-28 overflow-hidden">

        {/* Editorial Parallax Atmospheric Floating Gradient Blobs & Soft Vignettes */}
        <div className="absolute inset-0 pointer-events-none overflow-hidden select-none">
          <ParallaxLayer speed={-25} className="absolute -top-24 -left-20 w-[500px] h-[500px] bg-brand-forest/[0.08] rounded-full blur-[120px]" />
          <ParallaxLayer speed={35} className="absolute top-1/4 -right-24 w-[550px] h-[550px] bg-brand-terracotta/[0.08] rounded-full blur-[140px]" />
          <ParallaxLayer speed={-15} className="absolute bottom-10 left-1/3 w-[600px] h-[350px] bg-brand-mint/[0.05] rounded-full blur-[100px]" />
        </div>

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <div className="text-center max-w-4xl mx-auto mb-16">

            {/* Display Heading with Staggered Entrance */}
            <ScrollReveal direction="up" delay={0.1} duration={0.8}>
              <h1 className="text-5xl sm:text-6xl md:text-7xl lg:text-8xl font-display font-black tracking-tight text-brand-charcoal leading-[1.02] mb-6">
                Beyond credit. <br />
                <span className="text-brand-forest italic font-serif">Beyond barriers.</span>
              </h1>
            </ScrollReveal>

            {/* Subheading */}
            <ScrollReveal direction="up" delay={0.2} duration={0.7}>
              <p className="text-lg sm:text-xl text-brand-charcoal/80 max-w-2xl mx-auto leading-relaxed mb-10 font-normal">
                Financial visibility for growing Indian businesses. Turn your real daily sales and transaction history into verified credit eligibility—without physical property collateral.
              </p>
            </ScrollReveal>

            {/* Call to Actions with slight stagger */}
            <ScrollReveal direction="up" delay={0.3} duration={0.7}>
              <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
                <Button
                  variant="primary"
                  size="lg"
                  onClick={() => {
                    setAppMode('BORROWER_PORTAL');
                    setBorrowerView('/borrower/apply');
                  }}
                  className="w-full sm:w-auto px-8 py-4 text-base shadow-elevated bg-brand-forest hover:bg-brand-forest/90 text-white rounded-full flex items-center justify-center gap-2 group transition-all duration-200 active:scale-95"
                >
                  <span>Check Loan Eligibility</span>
                  <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                </Button>

                <Button
                  variant="outline"
                  size="lg"
                  onClick={() => {
                    setAppMode('LENDER_PORTAL');
                    setLenderView('/lender/dashboard');
                  }}
                  className="w-full sm:w-auto px-8 py-4 text-base border-brand-charcoal/20 hover:border-brand-charcoal hover:bg-brand-charcoal/5 rounded-full transition-all duration-200 active:scale-95"
                >
                  Lender Underwriting Desk
                </Button>

                <Button
                  variant="outline"
                  size="lg"
                  onClick={() => {
                    setAppMode('ADMIN_PORTAL');
                    setAdminView('/admin/fairness');
                  }}
                  className="w-full sm:w-auto px-6 py-4 text-sm border-brand-forest/30 text-brand-forest hover:bg-brand-forest/5 rounded-full flex items-center gap-2 transition-all duration-200 active:scale-95"
                >
                  <Scale className="w-4 h-4" />
                  <span>Fair Lending & Governance</span>
                </Button>
              </div>
            </ScrollReveal>
          </div>

          {/* Interactive Flagship: Split Waveform Comparison with Controlled Parallax */}
          <ParallaxLayer speed={20} className="mb-20">
            <SplitWaveformHero
              onClaim={() => {
                setAppMode('BORROWER_PORTAL');
                setBorrowerView('/borrower/apply');
              }}
            />
          </ParallaxLayer>

          {/* Key Value Statistics Bar with Live Moving Text Animation */}
          <ScrollReveal direction="up" delay={0.1} duration={0.8}>
            <MovingStatsTicker />
          </ScrollReveal>
        </div>
      </section>

      {/* Sticky Product Storytelling Walkthrough */}
      <div id="stories-sec">
        <StickyProductStoryteller />
      </div>

      {/* Problem & Solution Comparison Section */}
      <div id="problem-sec" className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <ProblemSolution />
      </div>

      {/* How it Works / Workflow Walkthrough */}
      <div id="how-it-works-sec" className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <HowItWorks />
      </div>

      {/* Interactive Feature Flagship: Live Accessibility / Tuner Widget */}
      <section className="py-20 bg-brand-charcoal text-white overflow-hidden relative">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <ScrollReveal direction="up" duration={0.6}>
            <div className="text-center max-w-3xl mx-auto mb-16">
              <Badge variant="mint-pill" className="text-xs mb-4">
                INTERACTIVE DEMONSTRATION
              </Badge>
              <h2 className="text-3xl sm:text-5xl font-display font-bold tracking-tight text-white mb-4">
                Calculate your borrowing capacity.
              </h2>
              <p className="text-white/70 text-sm sm:text-base leading-relaxed">
                See how your daily digital transactions translate into manageable working capital. Adjust loan size, tenor, and repayment cadence to fit your business cash flow.
              </p>
            </div>
          </ScrollReveal>

          <ParallaxLayer speed={15}>
            <LiveTunerWidget
              onApply={() => {
                setAppMode('BORROWER_PORTAL');
                setBorrowerView('/borrower/apply');
              }}
            />
          </ParallaxLayer>
        </div>
      </section>

      {/* ACIE Engine Deep Dive Section */}
      <div id="ocie-sec" className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <AcieExplanation />
      </div>

      {/* Interactive Phone Experience: WhatsApp / Voice Assisted Flow */}
      <section className="py-24 bg-brand-ivory overflow-hidden">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <ParallaxLayer speed={10}>
            <PhoneSimulator
              onOpenDemo={() => setIsAuthModalOpen(true)}
            />
          </ParallaxLayer>
        </div>
      </section>

      {/* Benefits for Borrowers and Lenders */}
      <div id="benefits-sec" className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <BenefitsSection />
      </div>

      {/* Trust, Responsible Lending, and DPDP Compliance */}
      <div id="trust-sec" className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <TrustSafetySection />
      </div>

      {/* Frequently Asked Questions */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <FaqSection />
      </div>

      {/* Contact & Support Section */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <ContactSection />
      </div>

      {/* Full-width Brand Footer */}
      <footer className="w-full bg-brand-charcoal text-white pt-16 pb-12 overflow-hidden border-t border-white/10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col justify-between min-h-[400px]">

          {/* Top navigation row */}
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-8 pb-12 border-b border-white/10">
            <div>
              <div className="flex items-center gap-2 mb-2">
                <span className="w-3 h-3 rounded-full bg-brand-mint inline-block" />
                <span className="font-display font-bold text-xl tracking-tight text-white">UDYOGA</span>
              </div>
              <p className="text-xs text-white/60 max-w-xs">
                Beyond Credit. Beyond Barriers. Empowering 63 million Indian MSMEs through verifiable cash-flow intelligence.
              </p>
            </div>

            <div className="flex flex-wrap items-center gap-3">
              <Button
                variant="outline"
                size="sm"
                onClick={() => {
                  setAppMode('BORROWER_PORTAL');
                  setBorrowerView('/borrower/dashboard');
                }}
                className="text-white border-white/20 hover:bg-white/10"
              >
                Borrower Portal
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => {
                  setAppMode('LENDER_PORTAL');
                  setLenderView('/lender/dashboard');
                }}
                className="text-brand-mint border-brand-mint/40 hover:bg-brand-mint/10"
              >
                Lender Underwriting Console
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => {
                  setAppMode('ADMIN_PORTAL');
                  setAdminView('/admin/fairness');
                }}
                className="text-brand-terracotta border-brand-terracotta/40 hover:bg-brand-terracotta/10"
              >
                Governance & Auditor Portal
              </Button>
              <Button
                variant="accent"
                size="sm"
                onClick={() => setIsAuthModalOpen(true)}
              >
                Sign In
              </Button>
            </div>
          </div>

          {/* Massive Brand Name (Faithful to reference video) */}
          <div className="my-auto py-8">
            <h2 className="text-6xl sm:text-8xl md:text-9xl font-display font-black tracking-tighter text-white/90">
              UDYOGA
            </h2>
          </div>

          {/* Bottom Copyright & Regulatory Disclosure */}
          <div className="pt-6 border-t border-white/10 flex flex-col sm:flex-row justify-between items-start sm:items-center text-xs text-white/50 gap-4">
            <p>© 2026 UDYOGA Technologies Pvt. Ltd. All rights reserved.</p>
            <div className="flex gap-6">
              <button onClick={() => handleScrollTo('trust-sec')} className="hover:text-white transition-colors cursor-pointer">
                RBI Compliance
              </button>
              <button onClick={() => handleScrollTo('trust-sec')} className="hover:text-white transition-colors cursor-pointer">
                DPDP Policy
              </button>
              <button onClick={() => handleScrollTo('how-it-works-sec')} className="hover:text-white transition-colors cursor-pointer">
                Account Aggregator
              </button>
            </div>
          </div>
        </div>
      </footer>

      {/* Persona Switcher Modal */}
      <PersonaSwitcher
        isOpen={isPersonaModalOpen}
        onClose={() => setIsPersonaModalOpen(false)}
        activePersonaId={activePersona.id}
        onSelectPersona={handleSelectPersona}
      />

      {/* Auth Modal */}
      <AuthModal
        isOpen={isAuthModalOpen}
        onClose={() => setIsAuthModalOpen(false)}
        onLoginSuccess={handleAuthSuccess}
      />

    </div>
  );
}

export default App;
