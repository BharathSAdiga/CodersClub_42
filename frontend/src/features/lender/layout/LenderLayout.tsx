import React, { useState } from 'react';
import { PersonaProfile } from '@/types';
import {
  LayoutDashboard,
  FileText,
  Activity,
  ShieldAlert,
  ArrowLeft,
  Landmark,
  User,
  Menu,
  X,
  Search,
  Bell,
  Sparkles,
  Sliders,
  LogOut
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { motion } from 'framer-motion';

import { mockPipelineApplications } from '../data/mockPipeline';

interface LenderLayoutProps {
  activePersona: PersonaProfile;
  currentView: string;
  onNavigate: (view: string) => void;
  onReturnToPublic: () => void;
  onOpenPersonaModal: () => void;
  onLogout?: () => void;
  children: React.ReactNode;
}

export const LenderLayout: React.FC<LenderLayoutProps> = ({
  activePersona,
  currentView,
  onNavigate,
  onReturnToPublic,
  onOpenPersonaModal,
  onLogout,
  children,
}) => {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const navItems = [
    { id: '/lender/dashboard', label: 'Overview', icon: LayoutDashboard },
    { id: '/lender/pipeline', label: `Applications (${mockPipelineApplications.length})`, icon: FileText },
  ];

  return (
    <div className="min-h-screen bg-brand-ivory text-brand-charcoal flex flex-col selection:bg-brand-forest selection:text-white">

      {/* Liquid Glass Institutional Header */}
      <header className="h-16 px-4 sm:px-8 bg-brand-charcoal/90 backdrop-blur-md text-white flex items-center justify-between sticky top-0 z-40 border-b border-white/10 shadow-elevated">
        <div className="flex items-center gap-4">
          <button
            onClick={onReturnToPublic}
            className="flex items-center gap-1.5 text-xs text-white/70 hover:text-white transition-all py-1.5 px-3 rounded-full hover:bg-white/10 active:scale-95"
            title="Return to Public Landing Page"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            <span className="hidden sm:inline font-medium">Exit to Public</span>
          </button>

          <div className="h-5 w-px bg-white/15 hidden sm:block" />

          {/* Institutional Badge */}
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-brand-forest/80 backdrop-blur-sm flex items-center justify-center border border-white/20 shadow-sm">
              <Landmark className="w-4 h-4 text-brand-mint" />
            </div>
            <div>
              <span className="font-display font-bold text-base tracking-tight text-white block">
                {activePersona.user.organization || 'Pragati FinServe NBFC'}
              </span>
              <span className="text-xs text-white/70 block font-mono mt-0.5">
                Institutional Underwriting Console · RBI Regulated
              </span>
            </div>
          </div>
        </div>

        {/* Center / Right Controls */}
        <div className="flex items-center gap-3">
          {/* Active Navigation Pills with Liquid Glass Capsule */}
          <div className="hidden md:flex items-center gap-1.5 bg-white/5 backdrop-blur-md p-1 rounded-full border border-white/10">
            {navItems.map((item) => {
              const Icon = item.icon;
              const isActive = currentView.startsWith(item.id);
              return (
                <button
                  key={item.id}
                  onClick={() => onNavigate(item.id)}
                  className={`relative flex items-center gap-2 px-4 py-2 rounded-full text-sm font-semibold transition-all duration-200 ${isActive
                      ? 'text-brand-charcoal'
                      : 'text-white/80 hover:text-white hover:bg-white/5'
                    }`}
                >
                  {isActive && (
                    <motion.div
                      layoutId="lenderNavActivePill"
                      className="absolute inset-0 bg-brand-mint rounded-full shadow-sm"
                      transition={{ type: 'spring', stiffness: 350, damping: 30 }}
                    />
                  )}
                  <Icon className="w-4 h-4 relative z-10" />
                  <span className="relative z-10">{item.label}</span>
                </button>
              );
            })}
          </div>

          {/* Persona Switcher Pill */}
          <button
            onClick={onOpenPersonaModal}
            className="flex items-center gap-2 py-1.5 px-3.5 rounded-full bg-white/5 hover:bg-white/10 border border-white/10 text-xs transition-all active:scale-95"
          >
            <div className="w-6 h-6 rounded-full bg-brand-mint text-brand-charcoal flex items-center justify-center font-bold text-xs">
              {activePersona.name.charAt(0)}
            </div>
            <div className="text-left hidden lg:block">
              <div className="text-xs font-semibold text-white leading-tight">{activePersona.name}</div>
              <div className="text-[11px] text-white/70 font-mono">{activePersona.badge.split(' ')[0]}</div>
            </div>
          </button>

          {onLogout && (
            <button
              onClick={onLogout}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-brand-terracotta/20 hover:bg-brand-terracotta text-white border border-brand-terracotta/40 text-xs transition-colors"
              title="Sign out of current institutional session"
            >
              <LogOut className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Sign Out</span>
            </button>
          )}
        </div>
      </header>

      {/* Main Page Workspace Container */}
      <main className="flex-1 p-4 sm:p-8 max-w-7xl mx-auto w-full">
        {children}
      </main>

      {/* Institutional Sub-Footer */}
      <footer className="h-12 border-t border-brand-forest/10 px-4 sm:px-8 flex items-center justify-between text-[11px] text-brand-charcoal/50 bg-brand-ivory font-mono">
        <div>
          <span>UDYOGA Institutional Lending Rail · ACIE v2.4</span>
        </div>
        <div className="flex items-center gap-4">
          <span>DPDP Act 2023 Compliant</span>
          <span>•</span>
          <span>Orchard Cyprus-1 Anchor Active</span>
        </div>
      </footer>
    </div>
  );
};
