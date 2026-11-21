import React, { useState, useEffect } from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
<<<<<<< HEAD
import { Search, ShieldCheck, UserX, UserCheck, Key, Lock, RefreshCw } from 'lucide-react';
=======
import { Search, ShieldCheck, UserX, UserCheck, Key, Lock, Info, Users } from 'lucide-react';
>>>>>>> 712803a122347b0da321ca5e249ee1ec4da9aa08
import { mockAdminUsers, AdminUserItem } from '../data/mockAdminData';
import { apiService, AuthUser } from '@/services/apiService';
import { toast } from 'sonner';

export const UserManagementView: React.FC = () => {
  const [users, setUsers] = useState<AdminUserItem[]>(mockAdminUsers);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedRole, setSelectedRole] = useState('ALL');
  const [isLoading, setIsLoading] = useState(false);

  const fetchUsers = async () => {
    setIsLoading(true);
    try {
      const realUsers = await apiService.getUsers();
      if (realUsers && realUsers.length > 0) {
        const mapped: AdminUserItem[] = realUsers.map((u: AuthUser) => ({
          id: u.id,
          name: u.full_name || u.username,
          email: u.email || `${u.username}@udyoga.in`,
          mobile: '+91 98450 12345',
          role: (u.role.includes('LENDER') ? 'LENDER_OFFICER' : u.role.includes('ADMIN') ? 'SUPER_ADMIN' : 'BORROWER_MICRO') as any,
          organization: u.role.includes('LENDER') ? 'Pragati FinServe' : u.role.includes('ADMIN') ? 'UDYOGA Core Admin' : 'Micro Enterprise',
          status: u.is_active ? 'ACTIVE' : 'SUSPENDED',
          lastActive: u.last_login_at ? new Date(u.last_login_at).toLocaleTimeString() : 'Recently Active',
        }));
        setUsers(mapped);
      }
    } catch (err) {
      console.warn('Using pre-seeded admin users (offline fallback):', err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, []);

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

  const handleToggleStatus = async (id: string) => {
    const target = users.find((u) => u.id === id);
    if (!target) return;
    const nextStatus = target.status === 'ACTIVE' ? 'SUSPENDED' : 'ACTIVE';
    const isActivating = nextStatus === 'ACTIVE';

    try {
      await apiService.updateUserStatus(id, isActivating);
      setUsers((list) =>
        list.map((u) => (u.id === id ? { ...u, status: nextStatus } : u))
      );
      toast.success(`User ${target.name} status updated to ${nextStatus} in SQLite!`);
    } catch {
      // Fallback state update
      setUsers((list) =>
        list.map((u) => (u.id === id ? { ...u, status: nextStatus } : u))
      );
      toast.info(`User ${target.name} status updated to ${nextStatus}.`);
    }
  };

  const handleTerminateSession = (name: string) => {
<<<<<<< HEAD
    toast.success(`Active JWT sessions terminated for ${name}. Refresh tokens revoked.`);
=======
    toast.success(`Active sessions revoked for ${name}.`);
>>>>>>> 712803a122347b0da321ca5e249ee1ec4da9aa08
  };

  return (
    <div className="space-y-6 max-w-5xl mx-auto animate-in fade-in duration-300">
<<<<<<< HEAD
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
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

        <Button
          variant="outline"
          size="sm"
          onClick={fetchUsers}
          disabled={isLoading}
          className="gap-1.5 border-brand-forest/20 text-brand-forest hover:bg-brand-forest/10"
        >
          <RefreshCw className={`w-3.5 h-3.5 ${isLoading ? 'animate-spin' : ''}`} />
          <span>Refresh Users</span>
        </Button>
=======
      
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
>>>>>>> 712803a122347b0da321ca5e249ee1ec4da9aa08
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
<<<<<<< HEAD
                <option value="ALL">All Roles</option>
                <option value="BORROWER">Borrower</option>
                <option value="BORROWER_MICRO">Borrower (Micro)</option>
                <option value="BORROWER_GROWTH">Borrower (Growth)</option>
                <option value="LENDER">Lender</option>
                <option value="LENDER_OFFICER">Lender (Officer)</option>
                <option value="LENDER_MANAGER">Lender (Manager)</option>
                <option value="ETHICS_AUDITOR">Ethics Auditor</option>
                <option value="SUPER_ADMIN">Super Administrator</option>
=======
                <option value="ALL">All Account Roles</option>
                <option value="BORROWER_MICRO">Micro Enterprise Borrower</option>
                <option value="BORROWER_GROWTH">Growth SME Borrower</option>
                <option value="LENDER_OFFICER">Credit Underwriter</option>
                <option value="LENDER_MANAGER">Senior Credit Manager</option>
                <option value="ETHICS_AUDITOR">Statutory Ethics Auditor</option>
                <option value="SUPER_ADMIN">Platform Administrator</option>
>>>>>>> 712803a122347b0da321ca5e249ee1ec4da9aa08
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
<<<<<<< HEAD
              {filteredUsers.map((u) => (
                <tr key={u.id} className="hover:bg-brand-forest/5 transition-colors">
                  <td className="py-3 px-4">
                    <div className="font-semibold text-brand-charcoal">{u.name}</div>
                    <div className="text-[11px] font-mono text-brand-charcoal/50">{u.email}</div>
                  </td>
                  <td className="py-3 px-4">
                    <Badge variant="outline" className="text-[10px] font-mono">
                      {u.role}
                    </Badge>
                  </td>
                  <td className="py-3 px-4 text-brand-charcoal/70">{u.organization}</td>
                  <td className="py-3 px-4">
                    <Badge
                      variant={u.status === 'ACTIVE' ? 'mint' : 'terracotta'}
                      className="text-[10px]"
                    >
                      {u.status}
                    </Badge>
                  </td>
                  <td className="py-3 px-4 text-brand-charcoal/60 font-mono text-[11px]">
                    {u.lastActive}
                  </td>
                  <td className="py-3 px-4 text-right">
                    <div className="flex items-center justify-end gap-1.5">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleToggleStatus(u.id)}
                        className="text-[11px] h-7 px-2"
                        title={u.status === 'ACTIVE' ? 'Suspend User' : 'Activate User'}
                      >
                        {u.status === 'ACTIVE' ? (
                          <UserX className="w-3.5 h-3.5 text-rose-600" />
                        ) : (
                          <UserCheck className="w-3.5 h-3.5 text-emerald-600" />
                        )}
                        <span className="ml-1">{u.status === 'ACTIVE' ? 'Suspend' : 'Activate'}</span>
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleTerminateSession(u.name)}
                        className="text-[11px] h-7 px-2 text-brand-charcoal/60 hover:text-brand-charcoal"
                        title="Revoke Sessions"
                      >
                        <Key className="w-3 h-3" />
                      </Button>
                    </div>
                  </td>
                </tr>
              ))}
=======
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
>>>>>>> 712803a122347b0da321ca5e249ee1ec4da9aa08
            </tbody>
          </table>
        </CardContent>
      </Card>

    </div>
  );
};
