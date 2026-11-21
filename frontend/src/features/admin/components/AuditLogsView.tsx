import React, { useState } from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
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
  FileCode,
  ChevronDown,
  ChevronUp,
  Info
} from 'lucide-react';
import { mockAuditLogs, AuditLogItem } from '../data/mockAdminData';

export const AuditLogsView: React.FC = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [categoryFilter, setCategoryFilter] = useState<string>('ALL');
  const [statusFilter, setStatusFilter] = useState<string>('ALL');
  const [expandedLogId, setExpandedLogId] = useState<string | null>(null);

  const filteredLogs = mockAuditLogs.filter(log => {
    const matchesSearch = 
      log.actorName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      log.action.toLowerCase().includes(searchTerm.toLowerCase()) ||
      log.details.toLowerCase().includes(searchTerm.toLowerCase()) ||
      log.id.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesCat = categoryFilter === 'ALL' || log.category === categoryFilter;
    const matchesStatus = statusFilter === 'ALL' || log.status === statusFilter;

    return matchesSearch && matchesCat && matchesStatus;
  });

  const getReadableActionSummary = (log: AuditLogItem) => {
    switch (log.action) {
      case 'SANCTION_APPROVED':
        return `Underwriter ${log.actorName} issued loan sanction`;
      case 'DPDP_CONSENT_GRANTED':
        return `Borrower ${log.actorName} granted Account Aggregator consent`;
      case 'DPDP_CONSENT_REVOKED':
        return `Borrower ${log.actorName} revoked data sharing consent`;
      case 'FAIRNESS_AUDIT_EXPORT':
        return `Auditor ${log.actorName} generated fair lending audit report`;
      case 'HAIRCUT_MODIFIED':
        return `Credit Officer ${log.actorName} adjusted loan limit buffer`;
      case 'RATE_LIMIT_BURST':
        return `Security Gateway blocked repeated authentication requests`;
      default:
        return `${log.actorName} performed ${log.action.replace(/_/g, ' ').toLowerCase()}`;
    }
  };

  return (
    <div className="space-y-6 max-w-6xl mx-auto animate-in fade-in duration-300">
      
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-brand-charcoal/10">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="text-xs font-mono uppercase tracking-widest text-brand-forest bg-brand-forest/10 px-2.5 py-0.5 rounded-full font-bold">
              DPDP Act & RBI Compliance
            </span>
            <Badge variant="mint" className="text-xs font-semibold">
              <Lock className="w-3 h-3 mr-1 inline" /> SHA-256 Tamper-Evident Ledger
            </Badge>
          </div>
          <h1 className="text-2xl sm:text-3xl font-display font-bold text-brand-charcoal">
            System Activity Log & Audit Trail
          </h1>
          <p className="text-xs text-brand-charcoal/65 mt-0.5">
            Readable chronological record of critical actions: consent grants, revocations, underwriter haircut modifications, and loan sanctions.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm" className="border-brand-charcoal/20 text-xs h-9">
            <Download className="w-3.5 h-3.5 mr-1.5" /> Export Audit CSV
          </Button>
          <Button variant="primary" size="sm" className="bg-brand-forest text-white text-xs h-9 font-semibold">
            <ShieldCheck className="w-3.5 h-3.5 mr-1.5" /> Verify Ledger Integrity
          </Button>
        </div>
      </div>

      {/* Ledger Integrity Summary Card */}
      <div className="p-4 rounded-2xl bg-brand-forest/5 border border-brand-forest/15 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex items-start gap-3">
          <div className="p-2 rounded-xl bg-brand-forest text-white shrink-0">
            <Lock className="w-5 h-5" />
          </div>
          <div>
            <h4 className="text-xs font-bold text-brand-charcoal flex items-center gap-2">
              Current Head Block: <span className="font-mono text-brand-forest font-semibold">#BLOCK-49021-IN</span>
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
            </h4>
            <p className="text-[11px] text-brand-charcoal/70 mt-0.5">
              Merkle Root: <span className="font-mono text-[10px] bg-white px-1.5 py-0.5 rounded border border-brand-charcoal/10">0x7f9a84b2e811c09930f7e...c3a1</span> · Cryptographically anchored every 60 minutes.
            </p>
          </div>
        </div>

        <div className="flex items-center gap-4 text-xs font-mono shrink-0">
          <div>
            <div className="text-brand-charcoal/60 text-[10px] uppercase">Ledger Entries</div>
            <div className="text-base font-bold text-brand-charcoal">89,106</div>
          </div>
          <div className="h-7 w-px bg-brand-charcoal/10" />
          <div>
            <div className="text-brand-charcoal/60 text-[10px] uppercase">Integrity Status</div>
            <div className="text-base font-bold text-emerald-700">100% Valid</div>
          </div>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <Card className="border-brand-charcoal/10 shadow-soft">
        <CardContent className="p-4">
          <div className="flex flex-col md:flex-row items-center gap-3">
            <div className="relative flex-1 w-full">
              <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-brand-charcoal/40" />
              <Input
                type="text"
                placeholder="Search by person name, action summary, entry ID, or details..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10 text-xs h-10 bg-white rounded-xl"
              />
            </div>

            <div className="flex items-center gap-2 w-full md:w-auto">
              <select
                value={categoryFilter}
                onChange={(e) => setCategoryFilter(e.target.value)}
                className="h-10 px-3 rounded-xl border border-brand-forest/20 bg-brand-ivory text-xs font-medium text-brand-charcoal focus:outline-none focus:ring-1 focus:ring-brand-forest"
              >
                <option value="ALL">All Event Types</option>
                <option value="CONSENT_REVOCATION">Consent Management (DPDP)</option>
                <option value="SANCTION_DECISION">Sanction Decisions</option>
                <option value="HAIRCUT_OVERRIDE">Limit & Haircut Modifications</option>
                <option value="AUTH">Sign-In & Session Events</option>
                <option value="SECURITY">Security & Access Events</option>
              </select>

              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="h-10 px-3 rounded-xl border border-brand-forest/20 bg-brand-ivory text-xs font-medium text-brand-charcoal focus:outline-none focus:ring-1 focus:ring-brand-forest"
              >
                <option value="ALL">All Outcomes</option>
                <option value="SUCCESS">Success Only</option>
                <option value="FLAGGED">Attention / Flagged</option>
                <option value="BLOCKED">Blocked by Security</option>
              </select>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Audit Trail List with Expandable Technical Metadata */}
      <Card className="border-brand-charcoal/10 shadow-soft overflow-hidden">
        <CardContent className="p-0">
          <div className="divide-y divide-brand-forest/10">
            {filteredLogs.length === 0 ? (
              <div className="p-12 text-center text-brand-charcoal/60 space-y-2">
                <p className="font-semibold text-sm">No audit events match your search criteria.</p>
                <Button variant="outline" size="sm" onClick={() => { setSearchTerm(''); setCategoryFilter('ALL'); setStatusFilter('ALL'); }}>
                  Reset Filters
                </Button>
              </div>
            ) : (
              filteredLogs.map((log) => (
                <div 
                  key={log.id} 
                  className="p-4 hover:bg-brand-forest/[0.02] transition-colors"
                >
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                    <div className="space-y-1">
                      <div className="flex items-center gap-2">
                        <span className="font-display font-bold text-sm text-brand-charcoal">
                          {getReadableActionSummary(log)}
                        </span>
                        <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                          log.status === 'SUCCESS'
                            ? 'bg-emerald-50 text-emerald-800 border border-emerald-200'
                            : log.status === 'FLAGGED'
                            ? 'bg-amber-50 text-amber-900 border border-amber-300'
                            : 'bg-rose-50 text-rose-800 border border-rose-300'
                        }`}>
                          {log.status === 'SUCCESS' ? 'Success' : log.status === 'FLAGGED' ? 'Flagged' : 'Blocked'}
                        </span>
                      </div>
                      
                      <p className="text-xs text-brand-charcoal/75 leading-relaxed">
                        {log.details}
                      </p>
                    </div>

                    <div className="flex items-center gap-3 self-end sm:self-center shrink-0">
                      <div className="text-right text-[11px] font-mono text-brand-charcoal/60">
                        <span>{log.timestamp}</span>
                      </div>

                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => setExpandedLogId(expandedLogId === log.id ? null : log.id)}
                        className="text-xs h-7 px-2.5 gap-1"
                      >
                        <span>{expandedLogId === log.id ? 'Hide Details' : 'Inspect'}</span>
                        {expandedLogId === log.id ? <ChevronUp className="w-3 h-3" /> : <ChevronDown className="w-3 h-3" />}
                      </Button>
                    </div>
                  </div>

                  {/* Expandable Technical Detail Drawer */}
                  {expandedLogId === log.id && (
                    <div className="mt-3 p-3.5 rounded-xl bg-brand-ivory border border-brand-forest/15 text-xs space-y-2 animate-in fade-in duration-150">
                      <div className="flex items-center justify-between border-b border-brand-forest/10 pb-1.5">
                        <span className="font-mono text-brand-forest font-bold text-[11px]">
                          Cryptographic Event Metadata ({log.id})
                        </span>
                        <span className="text-[10px] text-brand-charcoal/50 font-mono">
                          Category: {log.category}
                        </span>
                      </div>

                      <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 text-[11px] font-mono text-brand-charcoal/80">
                        <div>
                          <span className="text-brand-charcoal/50 block text-[10px]">Actor Identifier:</span>
                          <strong>{log.actorId} ({log.actorName})</strong>
                        </div>
                        <div>
                          <span className="text-brand-charcoal/50 block text-[10px]">Origin IP Address:</span>
                          <strong>{log.ipAddress}</strong>
                        </div>
                        <div>
                          <span className="text-brand-charcoal/50 block text-[10px]">Statutory Compliance:</span>
                          <span className="text-emerald-700 font-bold">RBI DLG v1.3 / DPDP Rule 5</span>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              ))
            )}
          </div>
        </CardContent>
      </Card>

    </div>
  );
};
