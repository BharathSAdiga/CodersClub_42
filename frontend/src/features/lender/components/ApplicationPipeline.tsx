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
  ShieldAlert,
  Info,
  HelpCircle,
  FileCheck,
  Clock,
  ArrowRight
} from 'lucide-react';
import { mockPipelineApplications, PipelineItem } from '../data/mockPipeline';

interface ApplicationPipelineProps {
  onSelectApplication: (id: string) => void;
}

export type PipelineCategoryFilter = 
  | 'ALL'
  | 'READY_FOR_REVIEW'
  | 'MORE_INFO_NEEDED'
  | 'REQUIRES_ATTENTION'
  | 'UNDER_ASSESSMENT'
  | 'DECISION_RECORDED';

export const ApplicationPipeline: React.FC<ApplicationPipelineProps> = ({
  onSelectApplication,
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<PipelineCategoryFilter>('ALL');
  const [selectedRisk, setSelectedRisk] = useState<string>('ALL');
  const [sortBy, setSortBy] = useState<'SCORE' | 'AMOUNT' | 'DATE'>('DATE');
  const [sortOrder, setSortOrder] = useState<'ASC' | 'DESC'>('DESC');
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 6;

  // Filter & Search Logic
  const filteredItems = useMemo(() => {
    return mockPipelineApplications.filter((item) => {
      const matchesSearch =
        item.businessName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        item.applicantName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        item.id.toLowerCase().includes(searchTerm.toLowerCase()) ||
        item.sector.toLowerCase().includes(searchTerm.toLowerCase()) ||
        item.city.toLowerCase().includes(searchTerm.toLowerCase());

      const matchesRisk = selectedRisk === 'ALL' || item.riskTier === selectedRisk;

      // Category matching
      let matchesCategory = true;
      if (selectedCategory === 'READY_FOR_REVIEW') {
        matchesCategory = item.status === 'UNDERWRITING_REVIEW' && item.riskTier === 'LOW';
      } else if (selectedCategory === 'MORE_INFO_NEEDED') {
        matchesCategory = item.status === 'SUBMITTED';
      } else if (selectedCategory === 'REQUIRES_ATTENTION') {
        matchesCategory = item.riskTier === 'ELEVATED' || item.riskTier === 'HIGH' || item.congruenceScore < 90;
      } else if (selectedCategory === 'UNDER_ASSESSMENT') {
        matchesCategory = item.status === 'SUBMITTED' || (item.status === 'UNDERWRITING_REVIEW' && item.congruenceScore >= 90 && item.riskTier === 'MODERATE');
      } else if (selectedCategory === 'DECISION_RECORDED') {
        matchesCategory = item.status === 'SANCTIONED' || item.status === 'CONDITIONALLY_APPROVED' || item.status === 'DECLINED';
      }

      return matchesSearch && matchesRisk && matchesCategory;
    });
  }, [searchTerm, selectedRisk, selectedCategory]);

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

  const getRiskDisplay = (tier: string) => {
    switch (tier) {
      case 'LOW':
        return (
          <span className="inline-flex items-center gap-1 font-semibold text-emerald-800 bg-emerald-50 border border-emerald-200/80 px-2 py-0.5 rounded-full text-[10px]">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-600" />
            Prime (Low Risk)
          </span>
        );
      case 'MODERATE':
        return (
          <span className="inline-flex items-center gap-1 font-semibold text-amber-800 bg-amber-50 border border-amber-200/80 px-2 py-0.5 rounded-full text-[10px]">
            <span className="w-1.5 h-1.5 rounded-full bg-amber-600" />
            Moderate Risk
          </span>
        );
      case 'ELEVATED':
        return (
          <span className="inline-flex items-center gap-1 font-semibold text-orange-900 bg-orange-50 border border-orange-200/80 px-2 py-0.5 rounded-full text-[10px]">
            <span className="w-1.5 h-1.5 rounded-full bg-orange-600" />
            Elevated Risk
          </span>
        );
      case 'HIGH':
        return (
          <span className="inline-flex items-center gap-1 font-bold text-rose-800 bg-rose-50 border border-rose-200/80 px-2 py-0.5 rounded-full text-[10px]">
            <span className="w-1.5 h-1.5 rounded-full bg-rose-600" />
            Attention Flag
          </span>
        );
      default:
        return null;
    }
  };

  const getStatusDisplay = (status: string, riskTier: string) => {
    switch (status) {
      case 'SANCTIONED':
        return (
          <span className="inline-flex items-center gap-1 font-bold text-emerald-800 bg-emerald-100/90 border border-emerald-300 px-2.5 py-1 rounded-full text-[11px]">
            <CheckCircle2 className="w-3 h-3 text-emerald-700" />
            Sanction Approved
          </span>
        );
      case 'CONDITIONALLY_APPROVED':
        return (
          <span className="inline-flex items-center gap-1 font-bold text-blue-800 bg-blue-100/90 border border-blue-300 px-2.5 py-1 rounded-full text-[11px]">
            <Info className="w-3 h-3 text-blue-700" />
            Conditional Offer
          </span>
        );
      case 'UNDERWRITING_REVIEW':
        if (riskTier === 'LOW') {
          return (
            <span className="inline-flex items-center gap-1 font-bold text-emerald-800 bg-emerald-50 border border-emerald-300 px-2.5 py-1 rounded-full text-[11px]">
              <CheckCircle2 className="w-3 h-3 text-emerald-600" />
              Ready for Decision
            </span>
          );
        }
        return (
          <span className="inline-flex items-center gap-1 font-bold text-amber-900 bg-amber-100/90 border border-amber-300 px-2.5 py-1 rounded-full text-[11px]">
            <Clock className="w-3 h-3 text-amber-700" />
            Review Needed
          </span>
        );
      case 'DECLINED':
        return (
          <span className="inline-flex items-center gap-1 font-bold text-rose-800 bg-rose-100/90 border border-rose-300 px-2.5 py-1 rounded-full text-[11px]">
            <AlertTriangle className="w-3 h-3 text-rose-700" />
            Sanction Declined
          </span>
        );
      case 'SUBMITTED':
        return (
          <span className="inline-flex items-center gap-1 font-bold text-purple-800 bg-purple-100/90 border border-purple-300 px-2.5 py-1 rounded-full text-[11px]">
            <Clock className="w-3 h-3 text-purple-700" />
            Data Ingestion
          </span>
        );
      default:
        return <span className="text-[11px] font-medium text-gray-700">{status}</span>;
    }
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-300">
      
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-2">
        <div>
          <span className="text-xs font-mono uppercase tracking-wider text-brand-forest font-bold">
            Application Pipeline
          </span>
          <h2 className="text-2xl font-display font-bold text-brand-charcoal mt-0.5">
            Institutional Underwriting Queue
          </h2>
          <p className="text-xs text-brand-charcoal/65 mt-0.5">
            Organised by credit readiness and evidence completeness. Click any file to open the 8-tab Underwriting Workbench.
          </p>
        </div>
      </div>

      {/* 5 Clear Priority Category Quick-Pills */}
      <div className="flex flex-wrap gap-2 p-1.5 bg-brand-charcoal/5 rounded-2xl">
        <button
          onClick={() => { setSelectedCategory('ALL'); setCurrentPage(1); }}
          className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition-all ${
            selectedCategory === 'ALL'
              ? 'bg-brand-charcoal text-white shadow-sm'
              : 'text-brand-charcoal/70 hover:text-brand-charcoal hover:bg-white/60'
          }`}
        >
          All Applications ({mockPipelineApplications.length})
        </button>

        <button
          onClick={() => { setSelectedCategory('READY_FOR_REVIEW'); setCurrentPage(1); }}
          className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition-all flex items-center gap-1.5 ${
            selectedCategory === 'READY_FOR_REVIEW'
              ? 'bg-brand-forest text-white shadow-sm'
              : 'text-brand-charcoal/70 hover:text-brand-charcoal hover:bg-white/60'
          }`}
        >
          <CheckCircle2 className="w-3 h-3 text-emerald-400" />
          <span>Ready for Review</span>
        </button>

        <button
          onClick={() => { setSelectedCategory('REQUIRES_ATTENTION'); setCurrentPage(1); }}
          className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition-all flex items-center gap-1.5 ${
            selectedCategory === 'REQUIRES_ATTENTION'
              ? 'bg-amber-600 text-white shadow-sm'
              : 'text-brand-charcoal/70 hover:text-brand-charcoal hover:bg-white/60'
          }`}
        >
          <AlertTriangle className="w-3 h-3 text-amber-300" />
          <span>Requires Attention</span>
        </button>

        <button
          onClick={() => { setSelectedCategory('MORE_INFO_NEEDED'); setCurrentPage(1); }}
          className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition-all flex items-center gap-1.5 ${
            selectedCategory === 'MORE_INFO_NEEDED'
              ? 'bg-blue-700 text-white shadow-sm'
              : 'text-brand-charcoal/70 hover:text-brand-charcoal hover:bg-white/60'
          }`}
        >
          <HelpCircle className="w-3 h-3 text-blue-300" />
          <span>More Information Needed</span>
        </button>

        <button
          onClick={() => { setSelectedCategory('UNDER_ASSESSMENT'); setCurrentPage(1); }}
          className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition-all flex items-center gap-1.5 ${
            selectedCategory === 'UNDER_ASSESSMENT'
              ? 'bg-purple-700 text-white shadow-sm'
              : 'text-brand-charcoal/70 hover:text-brand-charcoal hover:bg-white/60'
          }`}
        >
          <span>Under Assessment</span>
        </button>

        <button
          onClick={() => { setSelectedCategory('DECISION_RECORDED'); setCurrentPage(1); }}
          className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition-all flex items-center gap-1.5 ${
            selectedCategory === 'DECISION_RECORDED'
              ? 'bg-slate-700 text-white shadow-sm'
              : 'text-brand-charcoal/70 hover:text-brand-charcoal hover:bg-white/60'
          }`}
        >
          <FileCheck className="w-3 h-3 text-slate-300" />
          <span>Decision Recorded</span>
        </button>
      </div>

      {/* Filter & Search Bar */}
      <Card className="border-brand-forest/15 shadow-soft">
        <CardContent className="p-4 space-y-3">
          <div className="grid grid-cols-1 md:grid-cols-12 gap-3">
            
            {/* Search Input */}
            <div className="md:col-span-6 relative">
              <Search className="w-4 h-4 text-brand-charcoal/40 absolute left-3.5 top-3.5" />
              <Input
                placeholder="Search by business name, applicant, reference ID, or city..."
                value={searchTerm}
                onChange={(e) => {
                  setSearchTerm(e.target.value);
                  setCurrentPage(1);
                }}
                className="pl-10 text-xs h-10 rounded-xl"
              />
            </div>

            {/* Risk Filter */}
            <div className="md:col-span-3">
              <select
                value={selectedRisk}
                onChange={(e) => {
                  setSelectedRisk(e.target.value);
                  setCurrentPage(1);
                }}
                className="w-full h-10 px-3 text-xs rounded-xl border border-brand-forest/20 bg-brand-ivory text-brand-charcoal focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-forest"
              >
                <option value="ALL">All Risk Levels</option>
                <option value="LOW">Low Risk (Score &gt; 700)</option>
                <option value="MODERATE">Moderate Risk (620–699)</option>
                <option value="ELEVATED">Elevated Risk (550–619)</option>
                <option value="HIGH">High Risk (&lt; 550 / Flagged)</option>
              </select>
            </div>

            {/* Sort Toggle */}
            <div className="md:col-span-3 flex items-center gap-1.5">
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value as any)}
                className="w-full h-10 px-3 text-xs rounded-xl border border-brand-forest/20 bg-brand-ivory text-brand-charcoal focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-forest"
              >
                <option value="DATE">Sort by: Submission Date</option>
                <option value="SCORE">Sort by: Vitality Score</option>
                <option value="AMOUNT">Sort by: Loan Amount</option>
              </select>
              <button
                onClick={() => setSortOrder(sortOrder === 'ASC' ? 'DESC' : 'ASC')}
                className="h-10 px-3 rounded-xl border border-brand-forest/20 bg-brand-ivory text-brand-charcoal hover:bg-brand-forest/10 transition-colors shrink-0"
                title={`Currently sorted ${sortOrder === 'ASC' ? 'ascending' : 'descending'}`}
              >
                <ArrowUpDown className="w-4 h-4" />
              </button>
            </div>

          </div>
        </CardContent>
      </Card>

      {/* Main Pipeline Table */}
      <Card className="border-brand-forest/15 shadow-soft overflow-hidden">
        <CardContent className="p-0 overflow-x-auto">
          <table className="w-full text-left border-collapse text-xs">
            <thead>
              <tr className="border-b border-brand-forest/10 bg-brand-forest/5 text-brand-charcoal/70 uppercase font-mono text-[10px]">
                <th className="py-3 px-4 font-semibold">Reference ID</th>
                <th className="py-3 px-4 font-semibold">Business & Applicant</th>
                <th className="py-3 px-4 font-semibold">Location</th>
                <th className="py-3 px-4 font-semibold">Requested Loan</th>
                <th className="py-3 px-4 font-semibold">Financial Vitality</th>
                <th className="py-3 px-4 font-semibold">Data Match</th>
                <th className="py-3 px-4 font-semibold">Action Status</th>
                <th className="py-3 px-4 font-semibold text-right">Review</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-brand-forest/10">
              {paginatedItems.length > 0 ? (
                paginatedItems.map((item) => (
                  <tr 
                    key={item.id} 
                    className="hover:bg-brand-forest/5 transition-colors cursor-pointer group"
                    onClick={() => onSelectApplication(item.id)}
                  >
                    <td className="py-3.5 px-4 font-mono font-bold text-brand-forest">
                      {item.id}
                    </td>

                    <td className="py-3.5 px-4">
                      <div className="font-display font-bold text-brand-charcoal text-sm group-hover:text-brand-forest transition-colors">
                        {item.businessName}
                      </div>
                      <span className="text-[11px] text-brand-charcoal/65">
                        {item.applicantName} · <span className="font-medium">{item.sector}</span>
                      </span>
                    </td>

                    <td className="py-3.5 px-4">
                      <span className="text-brand-charcoal font-medium">{item.city}</span>
                      <span className="text-[10px] text-brand-charcoal/50 block">{item.state}</span>
                    </td>

                    <td className="py-3.5 px-4 font-mono">
                      <strong className="text-brand-charcoal block text-xs">{formatINR(item.requestedAmount)}</strong>
                      <span className="text-[10px] text-brand-charcoal/60">
                        {item.tenorDays}d · {item.repaymentFrequency === 'DAILY_SWEEP' ? 'Daily UPI' : 'Monthly EMI'}
                      </span>
                    </td>

                    <td className="py-3.5 px-4">
                      <div className="flex items-center gap-2">
                        <span className="font-mono font-bold text-sm text-brand-forest">{item.acieScore}</span>
                        {getRiskDisplay(item.riskTier)}
                      </div>
                      {item.hasAnomalies && (
                        <span
                          className="text-[10px] text-rose-700 font-semibold flex items-center gap-1 mt-0.5"
                          title="Sales reported on GST and bank credits show mismatch > 10%. Verify customer collection timing."
                        >
                          <AlertTriangle className="w-3 h-3 text-rose-600" />
                          Needs Document Check
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
                        <span className="text-[10px] text-brand-charcoal/60">cross-verified</span>
                      </div>
                    </td>

                    <td className="py-3.5 px-4">
                      {getStatusDisplay(item.status, item.riskTier)}
                    </td>

                    <td className="py-3.5 px-4 text-right">
                      <Button
                        variant="primary"
                        size="sm"
                        onClick={(e) => {
                          e.stopPropagation();
                          onSelectApplication(item.id);
                        }}
                        className="text-xs h-8 px-3.5 gap-1.5 rounded-xl font-semibold"
                      >
                        <Eye className="w-3.5 h-3.5" />
                        <span>Open File</span>
                      </Button>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={8} className="py-12 text-center text-brand-charcoal/60 space-y-2">
                    <p className="font-semibold text-sm">No applications found in this category.</p>
                    <p className="text-xs text-brand-charcoal/50">Try selecting another priority filter or clearing search terms.</p>
                    <Button 
                      variant="outline" 
                      size="sm" 
                      onClick={() => { setSelectedCategory('ALL'); setSelectedRisk('ALL'); setSearchTerm(''); }}
                      className="mt-2 text-xs"
                    >
                      Reset All Filters
                    </Button>
                  </td>
                </tr>
              )}
            </tbody>
          </table>

          {/* Pagination Footer */}
          <div className="p-4 border-t border-brand-forest/10 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs text-brand-charcoal/70">
            <span>
              Showing {sortedItems.length > 0 ? (currentPage - 1) * itemsPerPage + 1 : 0} to{' '}
              {Math.min(currentPage * itemsPerPage, sortedItems.length)} of {sortedItems.length} applications
            </span>

            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                size="sm"
                disabled={currentPage === 1}
                onClick={() => setCurrentPage(currentPage - 1)}
                className="h-8 px-2 text-xs"
              >
                <ChevronLeft className="w-4 h-4 mr-1" />
                <span>Previous</span>
              </Button>

              <span className="font-mono font-semibold px-2">
                Page {currentPage} of {totalPages}
              </span>

              <Button
                variant="outline"
                size="sm"
                disabled={currentPage >= totalPages}
                onClick={() => setCurrentPage(currentPage + 1)}
                className="h-8 px-2 text-xs"
              >
                <span>Next</span>
                <ChevronRight className="w-4 h-4 ml-1" />
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

    </div>
  );
};
