import React from 'react';
import {
  LayoutDashboard,
  Wallet,
  FileText,
  Activity,
  Building2,
  Users,
  Server,
  Scale,
  ShieldCheck,
  Sparkles,
  Sliders,
  LogOut
} from 'lucide-react';
import { UserRole } from '@/types';

interface SidebarProps {
  currentRole: UserRole;
  activePath: string;
  onNavigate: (path: string) => void;
  businessName?: string;
  onLogout?: () => void;
}

interface NavItem {
  id: string;
  label: string;
  icon: React.ComponentType<{ className?: string }>;
  badge?: string;
}

export const Sidebar: React.FC<SidebarProps> = ({
  currentRole,
  activePath,
  onNavigate,
  businessName = 'Sri Balaji Provisions',
  onLogout,
}) => {
  const isBorrower = currentRole.startsWith('BORROWER');
  const isLender = currentRole.startsWith('LENDER');

  // Necessary pages for MSME Borrower (Clear, professional, perfectly aligned)
  const borrowerItems: NavItem[] = [
    { id: '/borrower/dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { id: '/borrower/profile', label: 'Business Profile', icon: Building2 },
    { id: '/borrower/health', label: 'Cash Flow & Health', icon: Activity },
    { id: '/borrower/insights', label: 'What-If Simulator', icon: Sparkles },
    { id: '/borrower/assessment', label: '7-Agent Underwriting', badge: 'CAM', icon: Sparkles },
    { id: '/borrower/apply', label: 'Apply for Credit', icon: Wallet },
    { id: '/borrower/consent', label: 'DPDP Consent', icon: ShieldCheck },
    { id: '/borrower/documents', label: 'Documents & Data', icon: Sliders },
  ];

  const lenderItems: NavItem[] = [
    { id: '/lender/dashboard', label: 'Overview', icon: LayoutDashboard },
    { id: '/lender/pipeline', label: 'Applications', icon: FileText },
  ];

  const adminItems: NavItem[] = [
    { id: '/admin/overview', label: 'Overview', icon: LayoutDashboard },
    { id: '/admin/users', label: 'Users', icon: Users },
    { id: '/admin/businesses', label: 'Businesses', icon: Building2 },
    { id: '/admin/applications', label: 'Applications', icon: FileText },
    { id: '/admin/system', label: 'System Health', icon: Server },
    { id: '/admin/fairness', label: 'Fairness & Reports', icon: Scale },
    { id: '/admin/audit-logs', label: 'Activity History', icon: ShieldCheck },
  ];

  const items = isBorrower ? borrowerItems : isLender ? lenderItems : adminItems;

  const isItemActive = (itemId: string) => {
    if (activePath === itemId) return true;
    if (itemId === '/borrower/apply' && activePath === '/borrower/tracking') return true;
    return false;
  };

  return (
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
              {isBorrower ? 'Borrower Portal' : isLender ? 'Lender Workbench' : 'Admin & Audit'}
            </span>
          </div>
        </div>

        {/* Business / User Badge */}
        <div className="p-3.5 rounded-2xl bg-white/[0.08] backdrop-blur-sm border border-white/15 mb-6">
          <span className="text-xs uppercase font-mono tracking-wider text-emerald-300 font-bold block">
            Active Entity
          </span>
          <h4 className="font-display font-semibold text-sm text-white truncate mt-1">
            {businessName}
          </h4>
        </div>

        {/* Navigation Items */}
        <nav className="space-y-1.5">
          {items.map((item) => {
            const Icon = item.icon;
            const active = isItemActive(item.id);
            return (
              <button
                key={item.id}
                onClick={() => onNavigate(item.id)}
                className={`w-full flex items-center justify-between text-left gap-2.5 px-3.5 py-2.5 rounded-xl text-sm font-medium transition-all ${
                  active
                    ? 'bg-brand-mint text-brand-charcoal font-bold shadow-sm'
                    : 'text-white/85 hover:bg-white/10 hover:text-white'
                }`}
              >
                <div className="flex items-center gap-3 min-w-0">
                  <Icon className={`w-4 h-4 shrink-0 ${active ? 'text-brand-charcoal' : 'text-brand-mint'}`} />
                  <span className="text-left min-w-0 truncate">{item.label}</span>
                </div>
                {item.badge && (
                  <span
                    className={`text-[10px] font-mono px-1.5 py-0.5 rounded shrink-0 uppercase tracking-wider font-bold ${
                      active
                        ? 'bg-brand-charcoal/15 text-brand-charcoal'
                        : 'bg-white/10 text-brand-mint border border-brand-mint/30'
                    }`}
                  >
                    {item.badge}
                  </span>
                )}
              </button>
            );
          })}
        </nav>

        {onLogout && (
          <button
            onClick={onLogout}
            className="w-full mt-4 flex items-center justify-start text-left gap-3 px-3.5 py-2.5 rounded-xl text-sm font-medium text-white/75 hover:bg-white/10 hover:text-white transition-colors"
          >
            <LogOut className="w-4 h-4 shrink-0 text-brand-terracotta" />
            <span className="text-left">Sign Out Session</span>
          </button>
        )}
      </div>

      {/* Footer Info */}
      <div className="pt-6 border-t border-white/10 text-xs text-white/70 font-medium">
        <div className="flex items-center gap-2">
          <div className="w-2 h-2 rounded-full bg-brand-mint animate-pulse" />
          <span>India Stack DPI Active</span>
        </div>
      </div>
    </aside>
  );
};
