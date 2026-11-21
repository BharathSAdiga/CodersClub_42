import React, { useState } from 'react';
import { PersonaProfile } from '@/types';
import {
  LayoutDashboard,
  Users,
  Building2,
  FileText,
  Server,
  Scale,
  ShieldCheck,
  ArrowLeft,
  User,
  Wrench,
  CheckCircle2,
  LogOut,
  Menu,
  X
} from 'lucide-react';

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
  const [mobileSidebarOpen, setMobileSidebarOpen] = useState(false);
  const isAuditor = activePersona.role === 'ETHICS_AUDITOR';

  // Simplified 7-item navigation (Model Stability removed as requested)
  const navItems = [
    { id: '/admin/overview', label: 'Overview', icon: LayoutDashboard },
    { id: '/admin/users', label: 'Users', icon: Users },
    { id: '/admin/businesses', label: 'Businesses', icon: Building2 },
    { id: '/admin/applications', label: 'Applications', icon: FileText },
    { id: '/admin/system', label: 'System Health', icon: Server },
    { id: '/admin/fairness', label: 'Fairness & Reports', icon: Scale },
    { id: '/admin/audit-logs', label: 'Activity History', icon: ShieldCheck },
  ];

  const adminSidebarContent = (
    <aside className="w-64 min-h-screen bg-brand-forest text-brand-ivory p-6 flex flex-col justify-between border-r border-white/10 select-none">
      <div>
        {/* Brand Header */}
        <div className="flex items-center gap-3 mb-8">
          <div className="w-10 h-10 rounded-2xl bg-white/15 flex items-center justify-center border border-white/20 shrink-0">
            <span className="font-display font-black text-brand-mint text-lg">U</span>
          </div>
          <div>
            <span className="font-display font-bold text-xl text-white tracking-tight block leading-tight">UDYOGA</span>
            <span className="text-xs text-white/70 block font-mono mt-0.5">
              {isAuditor ? 'Ethics & Audit Desk' : 'Admin & Governance'}
            </span>
          </div>
        </div>

        {/* Active Authority Badge */}
        <div className="p-3.5 rounded-2xl bg-white/[0.08] backdrop-blur-sm border border-white/15 mb-6">
          <span className="text-xs uppercase font-mono tracking-wider text-emerald-300 font-bold block">
            Active Authority
          </span>
          <h4 className="font-display font-semibold text-sm text-white truncate mt-1">
            {isAuditor ? 'Fair Lending Council' : 'Platform Administration'}
          </h4>
          <span className="text-xs text-white/70 block font-mono mt-0.5">
            {isAuditor ? 'Statutory Auditor Access' : 'Super Administrator'}
          </span>
        </div>

        {/* Vertical Navigation Items (Just like MSME Side Navbar) */}
        <nav className="space-y-1.5">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = currentView === item.id;
            return (
              <button
                key={item.id}
                onClick={() => {
                  onNavigate(item.id);
                  setMobileSidebarOpen(false);
                }}
                className={`w-full flex items-center justify-start text-left gap-3 px-3.5 py-2.5 rounded-xl text-sm font-medium transition-all ${isActive
                    ? 'bg-brand-mint text-brand-charcoal font-bold shadow-sm'
                    : 'text-white/85 hover:bg-white/10 hover:text-white'
                  }`}
              >
                <Icon className={`w-4 h-4 shrink-0 ${isActive ? 'text-brand-charcoal' : 'text-brand-mint'}`} />
                <span className="text-left min-w-0 flex-1 truncate">{item.label}</span>
              </button>
            );
          })}
        </nav>
      </div>

      {/* Footer Controls */}
      <div className="pt-6 border-t border-white/10">
        {onLogout && (
          <button
            onClick={onLogout}
            className="w-full flex items-center justify-start text-left gap-3 px-3.5 py-2.5 rounded-xl text-sm font-medium text-white/75 hover:bg-white/10 hover:text-white transition-colors mb-3"
          >
            <LogOut className="w-4 h-4 shrink-0 text-brand-terracotta" />
            <span className="text-left">Sign Out Session</span>
          </button>
        )}

        <div className="flex items-center gap-2 text-xs text-white/70 font-medium">
          <div className="w-2 h-2 rounded-full bg-brand-mint animate-pulse" />
          <span>DPDP & RBI DLG Monitored</span>
        </div>
      </div>
    </aside>
  );

  return (
    <div className="min-h-screen bg-brand-ivory text-brand-charcoal flex selection:bg-brand-forest selection:text-white">

      {/* Desktop Vertical Sidebar (Just like MSME) */}
      <div className="hidden lg:block shrink-0 sticky top-0 h-screen">
        {adminSidebarContent}
      </div>

      {/* Mobile Drawer */}
      {mobileSidebarOpen && (
        <div className="fixed inset-0 z-50 lg:hidden flex">
          <div className="w-64 bg-brand-forest h-full">
            {adminSidebarContent}
          </div>
          <div
            className="flex-1 bg-black/50 backdrop-blur-xs"
            onClick={() => setMobileSidebarOpen(false)}
          />
        </div>
      )}

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col min-w-0">

        {/* Top Header */}
        <header className="h-16 px-4 sm:px-8 bg-white border-b border-brand-forest/10 flex items-center justify-between sticky top-0 z-30 shadow-xs">
          <div className="flex items-center gap-3">
            <button
              onClick={() => setMobileSidebarOpen(true)}
              className="lg:hidden p-2 rounded-xl bg-brand-forest/10 text-brand-forest"
              aria-label="Open sidebar menu"
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
            {/* Persona Switcher Pill */}
            <button
              onClick={onOpenPersonaModal}
              className="flex items-center gap-2 py-1 px-3 rounded-full bg-brand-forest text-white text-xs hover:bg-brand-forest/90 transition-all active:scale-95 shadow-xs"
            >
              <User className="w-3.5 h-3.5 text-brand-mint" />
              <span className="font-semibold">{activePersona.name}</span>
              <span className="text-[10px] text-white/60 font-mono hidden sm:inline">
                ({isAuditor ? 'Auditor' : 'Admin'})
              </span>
            </button>
          </div>
        </header>

        {/* View Canvas */}
        <main className="p-4 sm:p-8 max-w-7xl w-full mx-auto flex-1">
          {children}
        </main>

        {/* Bottom Status Footer */}
        <footer className="py-4 px-8 border-t border-brand-forest/10 bg-white/50 text-[11px] text-brand-charcoal/50 flex flex-col sm:flex-row justify-between items-center gap-2">
          <span>UDYOGA Central Administration & Governance Desk · ISO 27001 & DPDP Act 2023 Compliant</span>
          <span className="font-mono">Security Audit Hash: sha256_891e48bc0 · Zero Client Tamper Mode</span>
        </footer>

      </div>

    </div>
  );
};
