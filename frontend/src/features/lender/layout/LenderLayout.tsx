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
  Bell
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';

interface LenderLayoutProps {
  activePersona: PersonaProfile;
  currentView: string;
  onNavigate: (view: string) => void;
  onReturnToPublic: () => void;
  onOpenPersonaModal: () => void;
  children: React.ReactNode;
}

export const LenderLayout: React.FC<LenderLayoutProps> = ({
  activePersona,
  currentView,
  onNavigate,
  onReturnToPublic,
  onOpenPersonaModal,
  children,
}) => {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const navItems = [
    { id: '/lender/dashboard', label: 'Executive Cockpit', icon: LayoutDashboard },
    { id: '/lender/pipeline', label: 'Underwriting Queue (42)', icon: FileText },
  ];

  return (
    <div className="min-h-screen bg-brand-ivory text-brand-charcoal flex flex-col">
      
      {/* Institutional Top Navbar */}
      <header className="h-16 px-4 sm:px-8 bg-brand-charcoal text-white flex items-center justify-between sticky top-0 z-40 border-b border-white/10 shadow-elevated">
        <div className="flex items-center gap-4">
          <button
            onClick={onReturnToPublic}
            className="flex items-center gap-1.5 text-xs text-white/70 hover:text-white transition-colors py-1 px-2.5 rounded-full hover:bg-white/10"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Exit to Public</span>
          </button>

          <div className="h-5 w-px bg-white/20 hidden sm:block" />

          {/* Institutional Badge */}
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-brand-forest flex items-center justify-center border border-white/20">
              <Landmark className="w-4 h-4 text-brand-mint" />
            </div>
            <div>
              <span className="font-display font-bold text-sm tracking-tight text-white block">
                {activePersona.user.organization || 'Pragati FinServe NBFC'}
              </span>
              <span className="text-[10px] text-white/50 block font-mono">
                Institutional Underwriting Console · RBI Regulated
              </span>
            </div>
          </div>
        </div>

        {/* Center / Right Controls */}
        <div className="flex items-center gap-3">
          {/* Active Navigation Pills */}
          <div className="hidden md:flex items-center gap-2 bg-white/10 p-1 rounded-full border border-white/10">
            {navItems.map((item) => {
              const Icon = item.icon;
              const isActive = currentView.startsWith(item.id);
              return (
                <button
                  key={item.id}
                  onClick={() => onNavigate(item.id)}
                  className={`flex items-center gap-1.5 px-3.5 py-1.5 rounded-full text-xs font-medium transition-all ${
                    isActive
                      ? 'bg-brand-mint text-brand-charcoal font-bold shadow-sm'
                      : 'text-white/80 hover:text-white'
                  }`}
                >
                  <Icon className="w-3.5 h-3.5" />
                  <span>{item.label}</span>
                </button>
              );
            })}
          </div>

          {/* Persona Switcher Pill */}
          <button
            onClick={onOpenPersonaModal}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-white/10 hover:bg-white/15 text-xs text-white border border-white/10 transition-colors"
          >
            <User className="w-3.5 h-3.5 text-brand-mint" />
            <span className="max-w-[120px] truncate">{activePersona.name}</span>
          </button>
        </div>
      </header>

      {/* Main Content Area */}
      <main className="p-4 sm:p-8 max-w-7xl w-full mx-auto flex-1">
        {children}
      </main>

      {/* Footer */}
      <footer className="py-4 px-8 border-t border-brand-forest/10 bg-white/50 text-[11px] text-brand-charcoal/50 flex flex-col sm:flex-row justify-between items-center gap-2">
        <span>Pragati FinServe Underwriting Console · ACIE Integration V1.4</span>
        <span className="font-mono">Audit Log Session: sec_789128 · Encrypted TLS 1.3</span>
      </footer>

    </div>
  );
};
