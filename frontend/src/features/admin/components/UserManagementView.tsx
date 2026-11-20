import React, { useState } from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Search, ShieldCheck, UserX, UserCheck, Key, Lock } from 'lucide-react';
import { mockAdminUsers, AdminUserItem } from '../data/mockAdminData';
import { toast } from 'sonner';

export const UserManagementView: React.FC = () => {
  const [users, setUsers] = useState<AdminUserItem[]>(mockAdminUsers);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedRole, setSelectedRole] = useState('ALL');

  const filteredUsers = users.filter((u) => {
    const matchesSearch = u.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
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
    toast.success(`Active JWT sessions terminated for ${name}.`);
  };

  return (
    <div className="space-y-6 max-w-5xl mx-auto animate-in fade-in duration-300">
      <div>
        <span className="text-xs font-mono uppercase tracking-wider text-brand-forest font-bold">
          Role-Based Access Control
        </span>
        <h2 className="text-2xl font-display font-bold text-brand-charcoal mt-0.5">
          User & Identity Management
        </h2>
        <p className="text-xs text-brand-charcoal/60">
          Enforce institutional RBAC access policies across MSME borrowers, institutional credit officers, and auditors.
        </p>
      </div>

      {/* Filter Bar */}
      <Card>
        <CardContent className="p-4">
          <div className="grid grid-cols-1 md:grid-cols-12 gap-3">
            <div className="md:col-span-8 relative">
              <Search className="w-4 h-4 text-brand-charcoal/40 absolute left-3.5 top-4" />
              <Input
                placeholder="Search user by name, email, organization..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10 text-xs h-11"
              />
            </div>
            <div className="md:col-span-4">
              <select
                value={selectedRole}
                onChange={(e) => setSelectedRole(e.target.value)}
                className="w-full h-11 px-3 text-xs rounded-2xl border border-brand-forest/20 bg-brand-ivory text-brand-charcoal focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-forest"
              >
                <option value="ALL">All Roles</option>
                <option value="BORROWER_MICRO">Borrower (Micro)</option>
                <option value="BORROWER_GROWTH">Borrower (Growth)</option>
                <option value="LENDER_OFFICER">Lender (Officer)</option>
                <option value="LENDER_MANAGER">Lender (Manager)</option>
                <option value="ETHICS_AUDITOR">Ethics Auditor</option>
                <option value="SUPER_ADMIN">Super Administrator</option>
              </select>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Users Table */}
      <Card>
        <CardContent className="p-0 overflow-x-auto">
          <table className="w-full text-left border-collapse text-xs">
            <thead>
              <tr className="border-b border-brand-forest/10 bg-brand-forest/5 text-brand-charcoal/70 uppercase font-mono text-[10px]">
                <th className="py-3 px-4 font-semibold">User / Identity</th>
                <th className="py-3 px-4 font-semibold">Role</th>
                <th className="py-3 px-4 font-semibold">Organization</th>
                <th className="py-3 px-4 font-semibold">Status</th>
                <th className="py-3 px-4 font-semibold">Last Active</th>
                <th className="py-3 px-4 font-semibold text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-brand-forest/10">
              {filteredUsers.map((u) => (
                <tr key={u.id} className="hover:bg-brand-forest/5 transition-colors">
                  <td className="py-3 px-4">
                    <strong className="text-brand-charcoal block text-sm">{u.name}</strong>
                    <span className="text-[10px] text-brand-charcoal/50 font-mono">{u.email} · {u.mobile}</span>
                  </td>
                  <td className="py-3 px-4">
                    <Badge variant={u.role.startsWith('LENDER') ? 'terracotta' : u.role.startsWith('BORROWER') ? 'forest' : 'mint'} className="text-[10px]">
                      {u.role.replace('_', ' ')}
                    </Badge>
                  </td>
                  <td className="py-3 px-4 text-brand-charcoal font-medium">
                    {u.organization}
                  </td>
                  <td className="py-3 px-4">
                    <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                      u.status === 'ACTIVE' ? 'bg-emerald-100 text-emerald-800' : 'bg-rose-100 text-rose-800'
                    }`}>
                      {u.status}
                    </span>
                  </td>
                  <td className="py-3 px-4 text-brand-charcoal/60">
                    {u.lastActive}
                  </td>
                  <td className="py-3 px-4 text-right space-x-1.5">
                    <button
                      onClick={() => handleToggleStatus(u.id)}
                      className="p-1.5 rounded-lg border border-brand-forest/10 hover:bg-brand-forest/10 transition-colors text-brand-charcoal"
                      title={u.status === 'ACTIVE' ? 'Suspend User' : 'Activate User'}
                    >
                      {u.status === 'ACTIVE' ? <UserX className="w-3.5 h-3.5 text-rose-600" /> : <UserCheck className="w-3.5 h-3.5 text-emerald-600" />}
                    </button>
                    <button
                      onClick={() => handleTerminateSession(u.name)}
                      className="p-1.5 rounded-lg border border-brand-forest/10 hover:bg-brand-forest/10 transition-colors text-brand-charcoal"
                      title="Terminate Session"
                    >
                      <Lock className="w-3.5 h-3.5 text-amber-600" />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </CardContent>
      </Card>
    </div>
  );
};
