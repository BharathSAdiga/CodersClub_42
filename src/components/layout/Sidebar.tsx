import React from 'react';
import { 
  LayoutDashboard, 
  Wallet, 
  FileText, 
  ShieldCheck, 
  Sliders, 
  Activity, 
  Scale, 
  Settings, 
  LogOut,
  Sparkles
} from 'lucide-react';
import { UserRole } from '@/types';

interface SidebarProps {
  currentRole: UserRole;
  activePath: string;
  onNavigate: (path: string) => void;
  businessName?: string;
}

export const Sidebar: React.FC<SidebarProps> = ({
  currentRole,
  activePath,
  onNavigate,
  businessName = 'Sri Balaji Provisions',
}) => {
  const isBorrower = currentRole.startsWith('BORROWER');
  const isLender = currentRole.startsWith('LENDER');
  const isAdminOrAuditor = currentRole === 'SUPER_ADMIN' || currentRole === 'ETHICS_AUDITOR';

  const borrowerItems = [
    { id: '/borrower/dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { id: '/borrower/health', label: 'Cashflow Mirror', icon: Activity },
    { id: '/borrower/assessment', label: 'What-If Simulator', icon: Sparkles },
    { id: '/borrower/apply', label: 'Apply for Credit', icon: Wallet },
    { id: '/borrower/consent', label: 'DPDP Consent', icon: ShieldCheck },
    { id: '/borrower/documents', label: 'Document Vault', icon: FileText },
  ];

  const lenderItems = [
    { id: '/lender/dashboard', label: 'Portfolio Cockpit', icon: LayoutDashboard },
    { id: '/lender/pipeline', label: 'Application Queue', icon: FileText },
    { id: '/lender/triangulation', label: 'Triangulation Radar', icon: Activity },
    { id: '/lender/risk', label: 'Anomaly Matrix', icon: ShieldCheck },
    { id: '/lender/decision', label: 'Sanction Notes', icon: Wallet },
  ];

  const adminItems = [
    { id: '/admin/overview', label: 'System Overview', icon: LayoutDashboard },
    { id: '/admin/fairness', label: 'Fairness Console', icon: Scale },
    { id: '/admin/audit-logs', label: 'Audit Trail', icon: FileText },
    { id: '/admin/system', label: 'Connector Telemetry', icon: Settings },
  ];

  const items = isBorrower ? borrowerItems : isLender ? lenderItems : adminItems;

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
        <div className="p-3.5 rounded-2xl bg-white/10 border border-white/10 mb-6">
          <span className="text-[10px] uppercase font-mono tracking-wider text-brand-mint block">
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
            const isActive = activePath === item.id;
            return (
              <button
                key={item.id}
                onClick={() => onNavigate(item.id)}
                className={`w-full flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-xs font-medium transition-all ${
                  isActive
                    ? 'bg-brand-mint text-brand-charcoal font-bold shadow-sm'
                    : 'text-white/80 hover:bg-white/10 hover:text-white'
                }`}
              >
                <Icon className={`w-4 h-4 ${isActive ? 'text-brand-charcoal' : 'text-brand-mint'}`} />
                <span>{item.label}</span>
              </button>
            );
          })}
        </nav>
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
