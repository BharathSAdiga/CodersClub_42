import React, { useState, useMemo } from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { formatINR } from '@/lib/utils';
import { 
  Search, 
  Filter, 
  ArrowUpDown, 
  ChevronLeft, 
  ChevronRight, 
  AlertTriangle, 
  CheckCircle2, 
  Eye, 
  ShieldAlert 
} from 'lucide-react';
import { mockPipelineApplications, PipelineItem } from '../data/mockPipeline';

interface ApplicationPipelineProps {
  onSelectApplication: (id: string) => void;
}

export const ApplicationPipeline: React.FC<ApplicationPipelineProps> = ({
  onSelectApplication,
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedRisk, setSelectedRisk] = useState<string>('ALL');
  const [selectedStatus, setSelectedStatus] = useState<string>('ALL');
  const [sortBy, setSortBy] = useState<'SCORE' | 'AMOUNT' | 'DATE'>('DATE');
  const [sortOrder, setSortOrder] = useState<'ASC' | 'DESC'>('DESC');
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 5;

  // Filter & Search Logic
  const filteredItems = useMemo(() => {
    return mockPipelineApplications.filter((item) => {
      const matchesSearch =
        item.businessName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        item.applicantName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        item.id.toLowerCase().includes(searchTerm.toLowerCase()) ||
        item.sector.toLowerCase().includes(searchTerm.toLowerCase());

      const matchesRisk = selectedRisk === 'ALL' || item.riskTier === selectedRisk;
      const matchesStatus = selectedStatus === 'ALL' || item.status === selectedStatus;

      return matchesSearch && matchesRisk && matchesStatus;
    });
  }, [searchTerm, selectedRisk, selectedStatus]);

  // Sort Logic
  const sortedItems = useMemo(() => {
    return [...filteredItems].sort((a, b) => {
      let comparison = 0;
      if (sortBy === 'SCORE') comparison = a.acieScore - b.acieScore;
      else if (sortBy === 'AMOUNT') comparison = a.requestedAmount - b.requestedAmount;
      else if (sortBy === 'DATE') comparison = new Date(a.submittedAt).getTime() - new Date(b.submittedAt).getTime();
      return sortOrder === 'DESC' ? -comparison : comparison;
    });
  }, [filteredItems, sortBy, sortOrder]);

  // Pagination Logic
  const totalPages = Math.ceil(sortedItems.length / itemsPerPage) || 1;
  const paginatedItems = sortedItems.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  const getRiskBadge = (tier: string) => {
    switch (tier) {
      case 'LOW':
        return <Badge variant="mint" className="text-[10px]">Low Risk</Badge>;
      case 'MODERATE':
        return <Badge variant="outline" className="text-[10px] text-amber-700 border-amber-300 bg-amber-50">Moderate</Badge>;
      case 'ELEVATED':
        return <Badge variant="terracotta" className="text-[10px]">Elevated</Badge>;
      case 'HIGH':
        return <Badge variant="outline" className="text-[10px] text-rose-700 border-rose-300 bg-rose-50 font-bold">High Risk</Badge>;
      default:
        return null;
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'SANCTIONED':
        return <span className="text-[10px] font-bold text-emerald-800 bg-emerald-100 px-2.5 py-0.5 rounded-full">Sanctioned</span>;
      case 'CONDITIONALLY_APPROVED':
        return <span className="text-[10px] font-bold text-blue-800 bg-blue-100 px-2.5 py-0.5 rounded-full">Conditional</span>;
      case 'UNDERWRITING_REVIEW':
        return <span className="text-[10px] font-bold text-amber-800 bg-amber-100 px-2.5 py-0.5 rounded-full">In Review</span>;
      case 'DECLINED':
        return <span className="text-[10px] font-bold text-rose-800 bg-rose-100 px-2.5 py-0.5 rounded-full">Declined</span>;
      default:
        return <span className="text-[10px] font-bold text-gray-700 bg-gray-100 px-2.5 py-0.5 rounded-full">{status}</span>;
    }
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-300">
      
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <span className="text-xs font-mono uppercase tracking-wider text-brand-forest font-bold">
            Live Application Pipeline
          </span>
          <h2 className="text-2xl font-display font-bold text-brand-charcoal mt-0.5">
            Institutional Underwriting Queue
          </h2>
          <p className="text-xs text-brand-charcoal/60">
            Search, filter, and review cash-flow verified MSME working capital applications.
          </p>
        </div>
      </div>

      {/* Filter & Search Bar */}
      <Card>
        <CardContent className="p-4 space-y-3">
          <div className="grid grid-cols-1 md:grid-cols-12 gap-3">
            
            {/* Search Input */}
            <div className="md:col-span-5 relative">
              <Search className="w-4 h-4 text-brand-charcoal/40 absolute left-3.5 top-4" />
              <Input
                placeholder="Search by business name, applicant, ID..."
                value={searchTerm}
                onChange={(e) => {
                  setSearchTerm(e.target.value);
                  setCurrentPage(1);
                }}
                className="pl-10 text-xs h-11"
              />
            </div>

            {/* Risk Tier Filter */}
            <div className="md:col-span-3">
              <select
                value={selectedRisk}
                onChange={(e) => {
                  setSelectedRisk(e.target.value);
                  setCurrentPage(1);
                }}
                className="w-full h-11 px-3 text-xs rounded-2xl border border-brand-forest/20 bg-brand-ivory text-brand-charcoal focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-forest"
              >
                <option value="ALL">All Risk Tiers</option>
                <option value="LOW">Tier 1: Low Risk (Prime)</option>
                <option value="MODERATE">Tier 2: Moderate Risk</option>
                <option value="ELEVATED">Tier 3: Elevated Risk</option>
                <option value="HIGH">Tier 4: High Risk / Anomaly</option>
              </select>
            </div>

            {/* Status Filter */}
            <div className="md:col-span-2">
              <select
                value={selectedStatus}
                onChange={(e) => {
                  setSelectedStatus(e.target.value);
                  setCurrentPage(1);
                }}
                className="w-full h-11 px-3 text-xs rounded-2xl border border-brand-forest/20 bg-brand-ivory text-brand-charcoal focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-forest"
              >
                <option value="ALL">All Statuses</option>
                <option value="UNDERWRITING_REVIEW">In Review</option>
                <option value="CONDITIONALLY_APPROVED">Conditional</option>
                <option value="SANCTIONED">Sanctioned</option>
                <option value="DECLINED">Declined</option>
              </select>
            </div>

            {/* Sort Toggle */}
            <div className="md:col-span-2 flex items-center gap-1.5">
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value as any)}
                className="w-full h-11 px-3 text-xs rounded-2xl border border-brand-forest/20 bg-brand-ivory text-brand-charcoal focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-forest"
              >
                <option value="DATE">Sort: Date</option>
                <option value="SCORE">Sort: Score</option>
                <option value="AMOUNT">Sort: Amount</option>
              </select>
              <button
                onClick={() => setSortOrder(sortOrder === 'ASC' ? 'DESC' : 'ASC')}
                className="h-11 px-3 rounded-2xl border border-brand-forest/20 bg-brand-ivory text-brand-charcoal hover:bg-brand-forest/10 transition-colors"
                title="Toggle sort direction"
              >
                <ArrowUpDown className="w-4 h-4" />
              </button>
            </div>

          </div>
        </CardContent>
      </Card>

      {/* Main Pipeline Table */}
      <Card>
        <CardContent className="p-0 overflow-x-auto">
          <table className="w-full text-left border-collapse text-xs">
            <thead>
              <tr className="border-b border-brand-forest/10 bg-brand-forest/5 text-brand-charcoal/70 uppercase font-mono text-[10px]">
                <th className="py-3.5 px-4 font-semibold">Ref ID</th>
                <th className="py-3.5 px-4 font-semibold">Business & Sector</th>
                <th className="py-3.5 px-4 font-semibold">Location</th>
                <th className="py-3.5 px-4 font-semibold">Sanction Request</th>
                <th className="py-3.5 px-4 font-semibold">ACIE Score / Risk</th>
                <th className="py-3.5 px-4 font-semibold">Triangulation</th>
                <th className="py-3.5 px-4 font-semibold">Status</th>
                <th className="py-3.5 px-4 font-semibold text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-brand-forest/10">
              {paginatedItems.length > 0 ? (
                paginatedItems.map((item) => (
                  <tr 
                    key={item.id} 
                    className="hover:bg-brand-forest/5 transition-colors cursor-pointer"
                    onClick={() => onSelectApplication(item.id)}
                  >
                    <td className="py-3.5 px-4 font-mono font-bold text-brand-forest">
                      {item.id}
                    </td>

                    <td className="py-3.5 px-4">
                      <div className="font-display font-bold text-brand-charcoal text-sm">
                        {item.businessName}
                      </div>
                      <span className="text-[10px] text-brand-charcoal/60">
                        {item.applicantName} · {item.sector}
                      </span>
                    </td>

                    <td className="py-3.5 px-4">
                      <span className="text-brand-charcoal font-medium">{item.city}</span>
                      <span className="text-[10px] text-brand-charcoal/50 block">{item.state}</span>
                    </td>

                    <td className="py-3.5 px-4 font-mono">
                      <strong className="text-brand-charcoal block text-xs">{formatINR(item.requestedAmount)}</strong>
                      <span className="text-[10px] text-brand-charcoal/50">{item.tenorDays}d · {item.repaymentFrequency.replace('_', ' ')}</span>
                    </td>

                    <td className="py-3.5 px-4">
                      <div className="flex items-center gap-2">
                        <span className="font-mono font-bold text-brand-forest">{item.acieScore}</span>
                        {getRiskBadge(item.riskTier)}
                      </div>
                      {item.hasAnomalies && (
                        <span className="text-[10px] text-rose-700 font-semibold flex items-center gap-1 mt-0.5">
                          <AlertTriangle className="w-3 h-3 text-rose-600" />
                          Anomaly Flag
                        </span>
                      )}
                    </td>

                    <td className="py-3.5 px-4">
                      <div className="flex items-center gap-1.5">
                        <span className={`font-mono font-bold ${
                          item.congruenceScore > 90 ? 'text-emerald-700' : 'text-amber-700'
                        }`}>
                          {item.congruenceScore}%
                        </span>
                        <span className="text-[10px] text-brand-charcoal/50">match</span>
                      </div>
                    </td>

                    <td className="py-3.5 px-4">
                      {getStatusBadge(item.status)}
                    </td>

                    <td className="py-3.5 px-4 text-right">
                      <Button
                        variant="primary"
                        size="sm"
                        onClick={(e) => {
                          e.stopPropagation();
                          onSelectApplication(item.id);
                        }}
                        className="text-[11px] h-8 px-3 gap-1 rounded-xl"
                      >
                        <Eye className="w-3.5 h-3.5" />
                        <span>Underwrite</span>
                      </Button>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={8} className="py-12 text-center text-brand-charcoal/50">
                    No applications match the active filters or search query.
                  </td>
                </tr>
              )}
            </tbody>
          </table>

          {/* Pagination Footer */}
          <div className="p-4 border-t border-brand-forest/10 flex items-center justify-between text-xs text-brand-charcoal/60">
            <span>
              Showing {sortedItems.length > 0 ? (currentPage - 1) * itemsPerPage + 1 : 0} to{' '}
              {Math.min(currentPage * itemsPerPage, sortedItems.length)} of {sortedItems.length} records
            </span>
            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                size="sm"
                disabled={currentPage <= 1}
                onClick={() => setCurrentPage((p) => p - 1)}
                className="h-8 px-2.5 rounded-lg"
              >
                <ChevronLeft className="w-4 h-4" />
              </Button>
              <span className="font-mono font-semibold">
                Page {currentPage} of {totalPages}
              </span>
              <Button
                variant="outline"
                size="sm"
                disabled={currentPage >= totalPages}
                onClick={() => setCurrentPage((p) => p + 1)}
                className="h-8 px-2.5 rounded-lg"
              >
                <ChevronRight className="w-4 h-4" />
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

    </div>
  );
};
