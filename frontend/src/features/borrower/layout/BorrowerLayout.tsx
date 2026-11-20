import React, { useState } from 'react';
import { Sidebar } from '@/components/layout/Sidebar';
import { PersonaProfile, UserRole } from '@/types';
import { Menu, X, ArrowLeft, User, ShieldCheck, Sparkles, Building2 } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface BorrowerLayoutProps {
  activePersona: PersonaProfile;
  currentView: string;
  onNavigate: (viewId: string) => void;
  onReturnToPublic: () => void;
  onOpenPersonaModal: () => void;
  children: React.ReactNode;
}

export const BorrowerLayout: React.FC<BorrowerLayoutProps> = ({
  activePersona,
  currentView,
  onNavigate,
  onReturnToPublic,
  onOpenPersonaModal,
  children,
}) => {
  const [mobileSidebarOpen, setMobileSidebarOpen] = useState(false);

  return (
    <div className="min-h-screen bg-brand-ivory text-brand-charcoal flex">
      
      {/* Desktop Sidebar */}
      <div className="hidden lg:block shrink-0 sticky top-0 h-screen">
        <Sidebar
          currentRole={activePersona.role}
          activePath={currentView}
          onNavigate={onNavigate}
          businessName={activePersona.business?.tradeName || activePersona.name}
        />
      </div>

      {/* Mobile Drawer */}
      {mobileSidebarOpen && (
        <div className="fixed inset-0 z-50 lg:hidden flex">
          <div className="w-64 bg-brand-forest h-full">
            <Sidebar
              currentRole={activePersona.role}
              activePath={currentView}
              onNavigate={(v) => {
                onNavigate(v);
                setMobileSidebarOpen(false);
              }}
              businessName={activePersona.business?.tradeName || activePersona.name}
            />
          </div>
          <div 
            className="flex-1 bg-black/50 backdrop-blur-xs"
            onClick={() => setMobileSidebarOpen(false)}
          />
        </div>
      )}

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col min-w-0">
        
        {/* Top Operational Bar */}
        <header className="h-16 px-6 bg-white border-b border-brand-forest/10 flex items-center justify-between sticky top-0 z-30">
          <div className="flex items-center gap-3">
            <button
              onClick={() => setMobileSidebarOpen(true)}
              className="lg:hidden p-2 rounded-xl bg-brand-forest/10 text-brand-forest"
            >
              <Menu className="w-5 h-5" />
            </button>
            <button
              onClick={onReturnToPublic}
              className="flex items-center gap-1.5 text-xs font-semibold text-brand-charcoal/70 hover:text-brand-forest transition-colors py-1.5 px-3 rounded-full hover:bg-brand-forest/5"
            >
              <ArrowLeft className="w-4 h-4" />
              <span>Exit to Public Site</span>
            </button>
          </div>

          <div className="flex items-center gap-3">
            {/* Simulated Banner Pill */}
            <div className="hidden sm:flex items-center gap-1.5 px-3 py-1 rounded-full bg-amber-100 text-amber-800 border border-amber-300 text-[11px] font-mono font-medium">
              <span className="w-1.5 h-1.5 rounded-full bg-amber-500 animate-pulse" />
              <span>Simulated Sandbox Environment</span>
            </div>

            {/* Persona Switcher Pill */}
            <button
              onClick={onOpenPersonaModal}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-brand-forest text-brand-ivory text-xs font-medium hover:bg-brand-forest-hover transition-colors"
            >
              <User className="w-3.5 h-3.5 text-brand-mint" />
              <span className="max-w-[120px] truncate">{activePersona.name}</span>
            </button>
          </div>
        </header>

        {/* View Canvas */}
        <main className="p-4 sm:p-8 max-w-6xl w-full mx-auto flex-1">
          {children}
        </main>
      </div>

    </div>
  );
};
