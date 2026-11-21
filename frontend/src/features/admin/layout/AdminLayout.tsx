import React from 'react';
import { PersonaProfile } from '@/types';
import {
  LayoutDashboard,
  Users,
  FileText,
  Activity,
  Scale,
  ShieldCheck,
  Settings,
  Download,
  ArrowLeft,
  User,
  Wrench,
  CheckCircle2,
  Database,
  LogOut
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';

interface AdminLayoutProps {
  activePersona: PersonaProfile;
  currentView: string;
  onNavigate: (view: string) => void;
  onReturnToPublic: () => void;
  onOpenPersonaModal: () => void;
  onLogout?: () => void;
  children: React.ReactNode;
}

export const AdminLayout: React.FC<AdminLayoutProps> = ({
  activePersona,
  currentView,
  onNavigate,
  onReturnToPublic,
  onOpenPersonaModal,
  onLogout,
  children,
}) => {
  const isAuditor = activePersona.role === 'ETHICS_AUDITOR';

  const navItems = [
    { id: '/admin/overview', label: 'Platform Overview', icon: LayoutDashboard },
    { id: '/admin/fairness', label: 'Fair Lending & Bias', icon: Scale },
    { id: '/admin/users', label: 'User Directory', icon: Users },
    { id: '/admin/applications', label: 'All Applications', icon: FileText },
    { id: '/admin/assessments', label: 'Model Stability', icon: Activity },
    { id: '/admin/data-quality', label: 'Data Completeness', icon: Database },
    { id: '/admin/audit-logs', label: 'Activity Log', icon: ShieldCheck },
    { id: '/admin/system', label: 'Integrations Health', icon: Settings },
    { id: '/admin/reports', label: 'Regulatory Reports', icon: Download },
  ];

  return (
    <div className="min-h-screen bg-brand-ivory text-brand-charcoal flex flex-col">

      {/* Top Admin Header */}
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

          {/* Admin Identity */}
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-brand-forest flex items-center justify-center border border-white/20">
              {isAuditor ? <Scale className="w-4 h-4 text-brand-mint" /> : <Wrench className="w-4 h-4 text-brand-mint" />}
            </div>
            <div>
              <span className="font-display font-bold text-sm tracking-tight text-white block">
                {isAuditor ? 'Independent Fair Lending Council' : 'UDYOGA Platform Administration'}
              </span>
              <span className="text-[10px] text-white/50 block font-mono">
                {isAuditor ? 'Algorithmic Fairness & ESG Governance Desk' : 'System Operations & RBAC Governance'}
              </span>
            </div>
          </div>
        </div>

        {/* Right Info */}
        <div className="flex items-center gap-3">
          <div className="hidden sm:flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-emerald-950/60 border border-emerald-500/40 text-[10px] font-mono text-emerald-400">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
            <span>DPDP & RBI DLG Monitored</span>
          </div>

          <button
            onClick={onOpenPersonaModal}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-white/10 hover:bg-white/15 text-xs text-white border border-white/10 transition-colors"
          >
            <User className="w-3.5 h-3.5 text-brand-mint" />
            <span className="max-w-[120px] truncate">{activePersona.name}</span>
          </button>

          {onLogout && (
            <button
              onClick={onLogout}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-rose-950/60 hover:bg-rose-900 text-rose-300 border border-rose-500/40 text-xs transition-colors"
              title="Sign out of administrative session"
            >
              <LogOut className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Sign Out</span>
            </button>
          )}
        </div>
      </header>

      {/* Secondary Horizontal Navigation Bar */}
      <div className="bg-white border-b border-brand-forest/10 px-4 sm:px-8 py-2 overflow-x-auto">
        <div className="flex items-center gap-1 max-w-7xl mx-auto">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = currentView === item.id;
            return (
              <button
                key={item.id}
                onClick={() => onNavigate(item.id)}
                className={`flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl text-xs font-semibold whitespace-nowrap transition-all ${isActive
                  ? 'bg-brand-forest text-white shadow-sm'
                  : 'text-brand-charcoal/70 hover:bg-brand-forest/5 hover:text-brand-charcoal'
                  }`}
              >
                <Icon className={`w-3.5 h-3.5 ${isActive ? 'text-brand-mint' : 'text-brand-charcoal/50'}`} />
                <span>{item.label}</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Main Content View */}
      <main className="p-4 sm:p-8 max-w-7xl w-full mx-auto flex-1">
        {children}
      </main>

      {/* Footer */}
      <footer className="py-4 px-8 border-t border-brand-forest/10 bg-white/50 text-[11px] text-brand-charcoal/50 flex flex-col sm:flex-row justify-between items-center gap-2">
        <span>UDYOGA Central Administration & Governance Desk · ISO 27001 & DPDP Act 2023 Compliant</span>
        <span className="font-mono">Security Audit Hash: sha256_891e48bc0 · Zero Client Tamper Mode</span>
      </footer>

    </div>
  );
};
