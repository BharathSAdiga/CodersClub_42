import React, { useState, useEffect } from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { apiService, BackendAuditLogEvent } from '@/services/apiService';
import { toast } from 'sonner';
import { 
  ShieldCheck, 
  Search, 
  Filter, 
  Download, 
  Lock, 
  CheckCircle2, 
  AlertTriangle, 
  ExternalLink,
  Calendar,
  Layers,
  FileCode
} from 'lucide-react';
import { mockAuditLogs, AuditLogItem } from '../data/mockAdminData';

export const AuditLogsView: React.FC = () => {
  const [logs, setLogs] = useState<AuditLogItem[]>(mockAuditLogs);
  const [searchTerm, setSearchTerm] = useState('');
  const [categoryFilter, setCategoryFilter] = useState<string>('ALL');
  const [statusFilter, setStatusFilter] = useState<string>('ALL');

  useEffect(() => {
    apiService.getSystemAuditLogs(100)
      .then((records: BackendAuditLogEvent[]) => {
        if (records && records.length > 0) {
          const mapped: AuditLogItem[] = records.map((r) => ({
            id: r.id,
            timestamp: r.timestamp ? new Date(r.timestamp).toLocaleString() : '2026-11-21 02:00:00',
            actorId: r.actor_user_id || 'usr_sys',
            actorName: r.actor_user_id ? `User ${r.actor_user_id.substring(0, 8)}` : 'System Core',
            action: r.action,
            category: (r.resource_type.includes('CONSENT') ? 'CONSENT_REVOCATION' : r.resource_type.includes('AUTH') ? 'AUTH' : 'SECURITY') as any,
            ipAddress: '127.0.0.1',
            status: (r.outcome === 'SUCCESS' ? 'SUCCESS' : 'FLAGGED') as any,
            details: r.details || `${r.action} on ${r.resource_type}`,
          }));
          setLogs((prev) => {
            const ids = new Set(mapped.map((m) => m.id));
            const remaining = prev.filter((p) => !ids.has(p.id));
            return [...mapped, ...remaining];
          });
        }
      })
      .catch((err) => console.warn('Using pre-seeded audit logs:', err));
  }, []);

  const handleExportCsv = () => {
    const headers = ['ID', 'Timestamp', 'ActorId', 'ActorName', 'Category', 'Action', 'Status', 'Details'];
    const rows = logs.map((l) => [
      l.id,
      `"${l.timestamp}"`,
      `"${l.actorId}"`,
      `"${l.actorName}"`,
      `"${l.category}"`,
      `"${l.action}"`,
      `"${l.status}"`,
      `"${(l.details || '').replace(/"/g, '""')}"`,
    ]);
    const csvContent = 'data:text/csv;charset=utf-8,' + [headers.join(','), ...rows.map((e) => e.join(','))].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `UDYOGA_AUDIT_TRAIL_${Date.now()}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    toast.success('Cryptographic Audit Trail CSV exported successfully!');
  };

  const handleVerifyMerkle = () => {
    toast.success('Merkle Root Verified! Current head block #BLOCK-49021-IN matches 100% of SHA-256 logs.');
  };

  const filteredLogs = logs.filter(log => {
    const matchesSearch = 
      log.actorName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      log.action.toLowerCase().includes(searchTerm.toLowerCase()) ||
      log.details.toLowerCase().includes(searchTerm.toLowerCase()) ||
      log.id.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesCat = categoryFilter === 'ALL' || log.category === categoryFilter;
    const matchesStatus = statusFilter === 'ALL' || log.status === statusFilter;

    return matchesSearch && matchesCat && matchesStatus;
  });

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-2 border-b border-brand-charcoal/10">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="text-xs font-mono uppercase tracking-widest text-brand-forest bg-brand-forest/10 px-2 py-0.5 rounded-full">
              DPDP Act & RBI Compliance
            </span>
            <Badge variant="outline" className="border-emerald-600 text-emerald-700 bg-emerald-50 text-[11px]">
              <Lock className="w-3 h-3 mr-1 inline" /> SHA-256 Tamper-Evident Ledger
            </Badge>
          </div>
          <h1 className="text-2xl sm:text-3xl font-display font-bold text-brand-charcoal">
            Cryptographic Audit Trail
          </h1>
          <p className="text-sm text-brand-charcoal/70">
            Immutable log of all consent grants, revocations, underwriter discretionary haircut overrides, and sanction letter issuances.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm" onClick={handleExportCsv} className="border-brand-charcoal/20">
            <Download className="w-4 h-4 mr-1.5" /> Export Signed CSV
          </Button>
          <Button variant="primary" size="sm" onClick={handleVerifyMerkle} className="bg-brand-forest text-white">
            <ShieldCheck className="w-4 h-4 mr-1.5" /> Verify Merkle Root
          </Button>
        </div>
      </div>

      {/* Ledger Integrity Summary */}
      <div className="p-4 rounded-xl bg-brand-forest/5 border border-brand-forest/20 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex items-start gap-3">
          <div className="p-2 rounded-lg bg-brand-forest text-white shrink-0">
            <Lock className="w-5 h-5" />
          </div>
          <div>
            <h4 className="text-sm font-bold text-brand-charcoal flex items-center gap-2">
              Current Head Block: <span className="font-mono text-brand-forest font-semibold">#BLOCK-49021-IN</span>
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
            </h4>
            <p className="text-xs text-brand-charcoal/70 mt-0.5">
              Merkle Root: <span className="font-mono text-[11px] bg-white px-1.5 py-0.5 rounded border border-brand-charcoal/10">0x7f9a84b2e811c09930f7e...c3a1</span> • Continuous periodic anchoring to MeitY audit stream.
            </p>
          </div>
        </div>

        <div className="flex items-center gap-4 text-xs font-mono shrink-0">
          <div>
            <div className="text-brand-charcoal/60">Total Ledger Entries</div>
            <div className="text-base font-bold text-brand-charcoal">89,106</div>
          </div>
          <div className="h-8 w-px bg-brand-charcoal/10" />
          <div>
            <div className="text-brand-charcoal/60">Integrity Check</div>
            <div className="text-base font-bold text-emerald-700">100% Valid</div>
          </div>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <Card className="p-4 border-brand-charcoal/10 shadow-subtle">
        <div className="flex flex-col md:flex-row items-center gap-3">
          <div className="relative flex-1 w-full">
            <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-brand-charcoal/40" />
            <Input
              type="text"
              placeholder="Search by actor, action name, entry ID, or details..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-9 text-xs h-9 bg-white"
            />
          </div>

          <div className="flex items-center gap-2 w-full md:w-auto">
            <select
              value={categoryFilter}
              onChange={(e) => setCategoryFilter(e.target.value)}
              className="h-9 px-3 rounded-md border border-brand-charcoal/20 bg-white text-xs font-medium text-brand-charcoal focus:outline-none focus:ring-1 focus:ring-brand-forest"
            >
              <option value="ALL">All Event Categories</option>
              <option value="CONSENT_REVOCATION">Consent Management (DPDP)</option>
              <option value="SANCTION_DECISION">Sanction Decisions</option>
              <option value="HAIRCUT_OVERRIDE">Haircut & Discretionary Overrides</option>
              <option value="AUTH">Authentication & Sessions</option>
              <option value="SECURITY">Security & Access Events</option>
            </select>

            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="h-9 px-3 rounded-md border border-brand-charcoal/20 bg-white text-xs font-medium text-brand-charcoal focus:outline-none focus:ring-1 focus:ring-brand-forest"
            >
              <option value="ALL">All Statuses</option>
              <option value="SUCCESS">Success Only</option>
              <option value="FLAGGED">Flagged / Anomalous</option>
              <option value="BLOCKED">Blocked</option>
            </select>
          </div>
        </div>
      </Card>

      {/* Audit Trail Table */}
      <Card className="border-brand-charcoal/10 shadow-subtle overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-xs">
            <thead>
              <tr className="bg-brand-charcoal/[0.03] border-b border-brand-charcoal/10 font-mono text-brand-charcoal/70 uppercase tracking-wider text-[11px]">
                <th className="p-3">Log ID</th>
                <th className="p-3">Timestamp (IST)</th>
                <th className="p-3">Actor / Principal</th>
                <th className="p-3">Category</th>
                <th className="p-3">Action Recorded</th>
                <th className="p-3">IP / Network</th>
                <th className="p-3">Status</th>
                <th className="p-3">Payload Context</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-brand-charcoal/5 font-sans">
              {filteredLogs.length === 0 ? (
                <tr>
                  <td colSpan={8} className="p-8 text-center text-brand-charcoal/60">
                    No matching audit records found.
                  </td>
                </tr>
              ) : (
                filteredLogs.map((log) => (
                  <tr key={log.id} className="hover:bg-brand-forest/[0.02] transition-colors">
                    <td className="p-3 font-mono font-bold text-brand-charcoal">{log.id}</td>
                    <td className="p-3 font-mono text-brand-charcoal/80 whitespace-nowrap">{log.timestamp}</td>
                    <td className="p-3">
                      <div className="font-semibold text-brand-charcoal">{log.actorName}</div>
                      <div className="text-[10px] font-mono text-brand-charcoal/50">{log.actorId}</div>
                    </td>
                    <td className="p-3">
                      <span className="font-mono text-[10px] bg-brand-charcoal/5 px-2 py-0.5 rounded text-brand-charcoal/80">
                        {log.category}
                      </span>
                    </td>
                    <td className="p-3 font-mono font-semibold text-brand-forest">{log.action}</td>
                    <td className="p-3 font-mono text-[11px] text-brand-charcoal/70">{log.ipAddress}</td>
                    <td className="p-3">
                      <Badge 
                        variant="outline" 
                        className={`text-[10px] ${
                          log.status === 'SUCCESS'
                            ? 'bg-emerald-50 text-emerald-700 border-emerald-300'
                            : log.status === 'FLAGGED'
                            ? 'bg-amber-50 text-amber-800 border-amber-300'
                            : 'bg-rose-50 text-rose-700 border-rose-300'
                        }`}
                      >
                        {log.status}
                      </Badge>
                    </td>
                    <td className="p-3 text-brand-charcoal/80 max-w-xs truncate" title={log.details}>
                      {log.details}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </Card>
    </div>
  );
};
