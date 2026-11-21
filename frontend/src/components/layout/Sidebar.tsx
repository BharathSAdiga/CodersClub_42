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

export const Sidebar: React.FC<SidebarProps> = ({
  currentRole,
  activePath,
  onNavigate,
  businessName = 'Sri Balaji Provisions',
  onLogout,
}) => {
  const isBorrower = currentRole.startsWith('BORROWER');
  const isLender = currentRole.startsWith('LENDER');

  // Necessary pages for MSME Borrower (Clear, comprehensive, matches all user testing steps)
  const borrowerItems = [
    { id: '/borrower/dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { id: '/borrower/profile', label: 'Business Profile', icon: Building2 },
    { id: '/borrower/health', label: 'Financial DNA & Cashflow', icon: Activity },
    { id: '/borrower/insights', label: 'What-If Simulator', icon: Sparkles },
    { id: '/borrower/assessment', label: 'Underwriting Report (CAM)', icon: FileText },
    { id: '/borrower/apply', label: 'Apply for Credit', icon: Wallet },
    { id: '/borrower/consent', label: 'DPDP Consent', icon: ShieldCheck },
    { id: '/borrower/documents', label: 'Documents & Bank Data', icon: Sliders },
  ];

  const lenderItems = [
    { id: '/lender/dashboard', label: 'Overview', icon: LayoutDashboard },
    { id: '/lender/pipeline', label: 'Applications', icon: FileText },
  ];

  const adminItems = [
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
        <div className="flex items-center gap-2.5 mb-8">
          <div className="w-9 h-9 rounded-2xl bg-white/15 flex items-center justify-center border border-white/20">
            <span className="font-display font-black text-brand-mint text-base">U</span>
          </div>
          <div>
            <span className="font-display font-bold text-lg text-white tracking-tight">UDYOGA</span>
            <span className="text-[10px] text-white/50 block font-mono">
              {isBorrower ? 'Borrower Portal' : isLender ? 'Lender Workbench' : 'Admin & Audit'}
            </span>
          </div>
        </div>

        {/* Business / User Badge */}
        <div className="p-3.5 rounded-2xl bg-white/[0.08] backdrop-blur-sm border border-white/15 mb-6">
          <span className="text-[10px] uppercase font-mono tracking-wider text-emerald-300 font-bold block">
            Active Entity
          </span>
          <h4 className="font-display font-semibold text-xs text-white truncate mt-0.5">
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
                className={`w-full flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-xs font-medium transition-all ${active
                  ? 'bg-brand-mint text-brand-charcoal font-bold shadow-sm'
                  : 'text-white/80 hover:bg-white/10 hover:text-white'
                  }`}
              >
                <Icon className={`w-4 h-4 ${active ? 'text-brand-charcoal' : 'text-brand-mint'}`} />
                <span>{item.label}</span>
              </button>
            );
          })}
        </nav>

        {onLogout && (
          <button
            onClick={onLogout}
            className="w-full mt-4 flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-xs font-medium text-white/70 hover:bg-white/10 hover:text-white transition-colors"
          >
            <LogOut className="w-4 h-4 text-brand-terracotta" />
            <span>Sign Out Session</span>
          </button>
        )}
      </div>

      {/* Footer Info */}
      <div className="pt-6 border-t border-white/10 text-xs text-white/50">
        <div className="flex items-center gap-2">
          <div className="w-2 h-2 rounded-full bg-brand-mint animate-pulse" />
          <span>India Stack DPI Active</span>
        </div>
      </div>
    </aside>
  );
};
