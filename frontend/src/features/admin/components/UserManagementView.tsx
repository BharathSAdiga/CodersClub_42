import React, { useState } from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Search, ShieldCheck, UserX, UserCheck, Key, Lock, Info, Users } from 'lucide-react';
import { mockAdminUsers, AdminUserItem } from '../data/mockAdminData';
import { toast } from 'sonner';

export const UserManagementView: React.FC = () => {
  const [users, setUsers] = useState<AdminUserItem[]>(mockAdminUsers);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedRole, setSelectedRole] = useState('ALL');

  const getRoleLabel = (role: string) => {
    switch (role) {
      case 'BORROWER_MICRO':
        return { title: 'Micro Enterprise Borrower', scope: 'Access to business profile & loan application' };
      case 'BORROWER_GROWTH':
        return { title: 'Growth SME Borrower', scope: 'Access to multi-account financial dashboard' };
      case 'LENDER_OFFICER':
        return { title: 'Credit Underwriter', scope: 'Review files & formulate sanction notes' };
      case 'LENDER_MANAGER':
        return { title: 'Senior Credit Manager', scope: 'Final signoff authority on sanction letters' };
      case 'ETHICS_AUDITOR':
        return { title: 'Statutory Ethics Auditor', scope: 'Inspect algorithmic fairness & compliance logs' };
      case 'SUPER_ADMIN':
        return { title: 'Platform Administrator', scope: 'System configuration & integration controls' };
      default:
        return { title: role.replace('_', ' '), scope: 'Standard access' };
    }
  };

  const filteredUsers = users.filter((u) => {
    const matchesSearch = 
      u.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      u.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
      u.organization.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesRole = selectedRole === 'ALL' || u.role === selectedRole;
    return matchesSearch && matchesRole;
  });

  const handleToggleStatus = (id: string) => {
    setUsers((list) =>
      list.map((u) => {
        if (u.id === id) {
          const next = u.status === 'ACTIVE' ? 'SUSPENDED' : 'ACTIVE';
          toast.info(`User ${u.name} status updated to ${next}.`);
          return { ...u, status: next };
        }
        return u;
      })
    );
  };

  const handleTerminateSession = (name: string) => {
    toast.success(`Active sessions revoked for ${name}.`);
  };

  return (
    <div className="space-y-6 max-w-5xl mx-auto animate-in fade-in duration-300">
      
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-brand-charcoal/10">
        <div>
          <span className="text-xs font-mono uppercase tracking-wider text-brand-forest font-bold">
            User Access & Permissions
          </span>
          <h2 className="text-2xl font-display font-bold text-brand-charcoal mt-0.5">
            User Directory & Access Controls
          </h2>
          <p className="text-xs text-brand-charcoal/65 mt-0.5">
            Manage who can view applications, approve loans, inspect audit logs, and configure integrations.
          </p>
        </div>

        <Badge variant="mint" className="text-xs font-semibold self-start sm:self-center">
          <ShieldCheck className="w-3.5 h-3.5 mr-1 inline" /> {users.filter(u => u.status === 'ACTIVE').length} Active Accounts
        </Badge>
      </div>

      {/* Filter & Search Bar */}
      <Card className="border-brand-forest/15 shadow-soft">
        <CardContent className="p-4">
          <div className="grid grid-cols-1 md:grid-cols-12 gap-3">
            <div className="md:col-span-8 relative">
              <Search className="w-4 h-4 text-brand-charcoal/40 absolute left-3.5 top-3.5" />
              <Input
                placeholder="Search user by name, email, or organization..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10 text-xs h-10 rounded-xl"
              />
            </div>
            <div className="md:col-span-4">
              <select
                value={selectedRole}
                onChange={(e) => setSelectedRole(e.target.value)}
                className="w-full h-10 px-3 text-xs rounded-xl border border-brand-forest/20 bg-brand-ivory text-brand-charcoal focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-forest"
              >
                <option value="ALL">All Account Roles</option>
                <option value="BORROWER_MICRO">Micro Enterprise Borrower</option>
                <option value="BORROWER_GROWTH">Growth SME Borrower</option>
                <option value="LENDER_OFFICER">Credit Underwriter</option>
                <option value="LENDER_MANAGER">Senior Credit Manager</option>
                <option value="ETHICS_AUDITOR">Statutory Ethics Auditor</option>
                <option value="SUPER_ADMIN">Platform Administrator</option>
              </select>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Users Table */}
      <Card className="border-brand-forest/15 shadow-soft overflow-hidden">
        <CardContent className="p-0 overflow-x-auto">
          <table className="w-full text-left border-collapse text-xs">
            <thead>
              <tr className="border-b border-brand-forest/10 bg-brand-forest/5 text-brand-charcoal/70 uppercase font-mono text-[10px]">
                <th className="py-3 px-4 font-semibold">User Identity</th>
                <th className="py-3 px-4 font-semibold">Role & Permissions</th>
                <th className="py-3 px-4 font-semibold">Organization</th>
                <th className="py-3 px-4 font-semibold">Status</th>
                <th className="py-3 px-4 font-semibold">Last Active</th>
                <th className="py-3 px-4 font-semibold text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-brand-forest/10">
              {filteredUsers.map((u) => {
                const roleInfo = getRoleLabel(u.role);
                return (
                  <tr key={u.id} className="hover:bg-brand-forest/5 transition-colors">
                    <td className="py-3.5 px-4">
                      <strong className="text-brand-charcoal block text-sm">{u.name}</strong>
                      <span className="text-[11px] text-brand-charcoal/60 font-mono">{u.email} · {u.mobile}</span>
                    </td>
                    <td className="py-3.5 px-4">
                      <strong className="text-brand-forest block font-semibold">{roleInfo.title}</strong>
                      <span className="text-[10px] text-brand-charcoal/50 block leading-tight">{roleInfo.scope}</span>
                    </td>
                    <td className="py-3.5 px-4 text-brand-charcoal font-medium">
                      {u.organization}
                    </td>
                    <td className="py-3.5 px-4">
                      <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                        u.status === 'ACTIVE' ? 'bg-emerald-100 text-emerald-800' : 'bg-rose-100 text-rose-800'
                      }`}>
                        {u.status === 'ACTIVE' ? 'Active' : 'Suspended'}
                      </span>
                    </td>
                    <td className="py-3.5 px-4 text-brand-charcoal/65 font-mono text-[11px]">
                      {u.lastActive}
                    </td>
                    <td className="py-3.5 px-4 text-right space-x-1.5">
                      <button
                        onClick={() => handleToggleStatus(u.id)}
                        className="p-1.5 rounded-lg border border-brand-forest/15 hover:bg-brand-forest/10 transition-colors text-brand-charcoal"
                        title={u.status === 'ACTIVE' ? 'Suspend User Access' : 'Reactivate User'}
                      >
                        {u.status === 'ACTIVE' ? <UserX className="w-3.5 h-3.5 text-rose-600" /> : <UserCheck className="w-3.5 h-3.5 text-emerald-600" />}
                      </button>
                      <button
                        onClick={() => handleTerminateSession(u.name)}
                        className="p-1.5 rounded-lg border border-brand-forest/15 hover:bg-brand-forest/10 transition-colors text-brand-charcoal"
                        title="Revoke Active Sessions"
                      >
                        <Lock className="w-3.5 h-3.5 text-amber-600" />
                      </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </CardContent>
      </Card>

    </div>
  );
};
