import React, { useState } from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { formatINR } from '@/lib/utils';
import { 
  Building2, 
  Search, 
  MapPin, 
  CheckCircle2, 
  AlertCircle, 
  ExternalLink, 
  Filter,
  FileText,
  Briefcase
} from 'lucide-react';
import { mockPipelineApplications } from '@/features/lender/data/mockPipeline';

export interface BusinessItem {
  id: string;
  tradeName: string;
  legalOwner: string;
  sector: string;
  city: string;
  state: string;
  enterpriseClass: 'MICRO' | 'SMALL';
  monthlyTurnover: number;
  udyamStatus: 'VERIFIED' | 'PENDING';
  applicationId: string;
  requestedAmount: number;
  status: 'ACTIVE' | 'UNDER_REVIEW' | 'FLAGGED';
}

export const mockBusinessesList: BusinessItem[] = [
  {
    id: 'biz_01',
    tradeName: 'Sri Balaji Provisions',
    legalOwner: 'Ramesh Kumar',
    sector: 'Retail Grocery & FMCG',
    city: 'Hubli',
    state: 'Karnataka',
    enterpriseClass: 'MICRO',
    monthlyTurnover: 584000,
    udyamStatus: 'VERIFIED',
    applicationId: 'APP-2026-0891',
    requestedAmount: 150000,
    status: 'ACTIVE',
  },
  {
    id: 'biz_02',
    tradeName: 'ArtisanKraft Studio',
    legalOwner: 'Priya Sharma',
    sector: 'Textiles & Handicrafts',
    city: 'Jaipur',
    state: 'Rajasthan',
    enterpriseClass: 'SMALL',
    monthlyTurnover: 850000,
    udyamStatus: 'VERIFIED',
    applicationId: 'APP-2026-0892',
    requestedAmount: 500000,
    status: 'ACTIVE',
  },
  {
    id: 'biz_03',
    tradeName: 'Pandian Brass Works',
    legalOwner: 'Muthuvel Pandian',
    sector: 'Artisanal Metal Casting',
    city: 'Madurai',
    state: 'Tamil Nadu',
    enterpriseClass: 'MICRO',
    monthlyTurnover: 240000,
    udyamStatus: 'VERIFIED',
    applicationId: 'APP-2026-0893',
    requestedAmount: 75000,
    status: 'ACTIVE',
  },
  {
    id: 'biz_04',
    tradeName: 'Singh Agro Tools & Spares',
    legalOwner: 'Gurpreet Singh',
    sector: 'Agricultural Equipment',
    city: 'Ludhiana',
    state: 'Punjab',
    enterpriseClass: 'SMALL',
    monthlyTurnover: 620000,
    udyamStatus: 'VERIFIED',
    applicationId: 'APP-2026-0894',
    requestedAmount: 350000,
    status: 'ACTIVE',
  },
  {
    id: 'biz_05',
    tradeName: 'Sai Samarth Electricals',
    legalOwner: 'Anil Kulkarni',
    sector: 'Electrical Wholesale',
    city: 'Solapur',
    state: 'Maharashtra',
    enterpriseClass: 'MICRO',
    monthlyTurnover: 390000,
    udyamStatus: 'PENDING',
    applicationId: 'APP-2026-0895',
    requestedAmount: 200000,
    status: 'FLAGGED',
  },
  {
    id: 'biz_06',
    tradeName: 'Verma Sweet Emporium',
    legalOwner: 'Deepak Verma',
    sector: 'Food & Confectionery',
    city: 'Varanasi',
    state: 'Uttar Pradesh',
    enterpriseClass: 'MICRO',
    monthlyTurnover: 490000,
    udyamStatus: 'VERIFIED',
    applicationId: 'APP-2026-0896',
    requestedAmount: 180000,
    status: 'ACTIVE',
  },
  {
    id: 'biz_07',
    tradeName: 'Ahmed Leather Crafts',
    legalOwner: 'Tariq Ahmed',
    sector: 'Leather Goods',
    city: 'Kanpur',
    state: 'Uttar Pradesh',
    enterpriseClass: 'SMALL',
    monthlyTurnover: 310000,
    udyamStatus: 'VERIFIED',
    applicationId: 'APP-2026-0897',
    requestedAmount: 450000,
    status: 'FLAGGED',
  },
  {
    id: 'biz_08',
    tradeName: 'Maa Durga Handlooms',
    legalOwner: 'Sunita Das',
    sector: 'Handloom Weaving',
    city: 'Nadia',
    state: 'West Bengal',
    enterpriseClass: 'MICRO',
    monthlyTurnover: 280000,
    udyamStatus: 'VERIFIED',
    applicationId: 'APP-2026-0898',
    requestedAmount: 120000,
    status: 'ACTIVE',
  },
];

interface BusinessDirectoryViewProps {
  onNavigateToApplication?: (appId: string) => void;
}

export const BusinessDirectoryView: React.FC<BusinessDirectoryViewProps> = ({
  onNavigateToApplication,
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedClass, setSelectedClass] = useState<'ALL' | 'MICRO' | 'SMALL'>('ALL');

  const filteredBusinesses = mockBusinessesList.filter((b) => {
    const matchesSearch =
      b.tradeName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      b.legalOwner.toLowerCase().includes(searchTerm.toLowerCase()) ||
      b.city.toLowerCase().includes(searchTerm.toLowerCase()) ||
      b.sector.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesClass = selectedClass === 'ALL' || b.enterpriseClass === selectedClass;
    return matchesSearch && matchesClass;
  });

  return (
    <div className="space-y-6 max-w-6xl mx-auto animate-in fade-in duration-300">
      
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-brand-charcoal/10">
        <div>
          <span className="text-xs font-mono uppercase tracking-wider text-brand-forest font-bold">
            MSME Directory
          </span>
          <h2 className="text-2xl font-display font-bold text-brand-charcoal mt-0.5">
            Registered Businesses
          </h2>
          <p className="text-xs text-brand-charcoal/65 mt-0.5">
            Overview of all micro and small enterprises registered on UDYOGA with active business records.
          </p>
        </div>

        <Badge variant="mint" className="text-xs font-semibold self-start sm:self-center">
          <Building2 className="w-3.5 h-3.5 mr-1 inline" /> {mockBusinessesList.length} Registered Enterprises
        </Badge>
      </div>

      {/* Filter and Search Bar */}
      <Card className="border-brand-forest/15 shadow-soft">
        <CardContent className="p-4">
          <div className="grid grid-cols-1 md:grid-cols-12 gap-3">
            <div className="md:col-span-8 relative">
              <Search className="w-4 h-4 text-brand-charcoal/40 absolute left-3.5 top-3.5" />
              <Input
                placeholder="Search business name, owner, sector, or city..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10 text-xs h-10 rounded-xl"
              />
            </div>
            <div className="md:col-span-4">
              <select
                value={selectedClass}
                onChange={(e) => setSelectedClass(e.target.value as any)}
                className="w-full h-10 px-3 text-xs rounded-xl border border-brand-forest/20 bg-brand-ivory text-brand-charcoal focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-forest"
              >
                <option value="ALL">All Enterprise Sizes</option>
                <option value="MICRO">Micro Enterprises</option>
                <option value="SMALL">Small Enterprises</option>
              </select>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Businesses Table */}
      <Card className="border-brand-forest/15 shadow-soft overflow-hidden">
        <CardContent className="p-0 overflow-x-auto">
          <table className="w-full text-left border-collapse text-xs">
            <thead>
              <tr className="border-b border-brand-forest/10 bg-brand-forest/5 text-brand-charcoal/70 uppercase font-mono text-[10px]">
                <th className="py-3 px-4 font-semibold">Business & Owner</th>
                <th className="py-3 px-4 font-semibold">Industry Sector</th>
                <th className="py-3 px-4 font-semibold">Location</th>
                <th className="py-3 px-4 font-semibold">Class</th>
                <th className="py-3 px-4 font-semibold">Monthly Turnover</th>
                <th className="py-3 px-4 font-semibold">Udyam Registration</th>
                <th className="py-3 px-4 font-semibold text-right">Loan File</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-brand-forest/10">
              {filteredBusinesses.map((b) => (
                <tr key={b.id} className="hover:bg-brand-forest/5 transition-colors">
                  <td className="py-3.5 px-4">
                    <strong className="text-brand-charcoal block text-sm font-display font-bold">
                      {b.tradeName}
                    </strong>
                    <span className="text-[11px] text-brand-charcoal/60">
                      Owner: {b.legalOwner}
                    </span>
                  </td>
                  <td className="py-3.5 px-4 text-brand-charcoal font-medium">
                    {b.sector}
                  </td>
                  <td className="py-3.5 px-4 text-brand-charcoal/75">
                    <div className="flex items-center gap-1">
                      <MapPin className="w-3.5 h-3.5 text-brand-forest shrink-0" />
                      <span>{b.city}, {b.state}</span>
                    </div>
                  </td>
                  <td className="py-3.5 px-4">
                    <Badge variant="outline" className="text-[10px] font-mono">
                      {b.enterpriseClass}
                    </Badge>
                  </td>
                  <td className="py-3.5 px-4 font-mono font-semibold text-brand-charcoal">
                    {formatINR(b.monthlyTurnover)} / mo
                  </td>
                  <td className="py-3.5 px-4">
                    {b.udyamStatus === 'VERIFIED' ? (
                      <span className="inline-flex items-center gap-1 text-[11px] text-emerald-800 font-semibold bg-emerald-50 border border-emerald-200 px-2 py-0.5 rounded-full">
                        <CheckCircle2 className="w-3 h-3 text-emerald-600" /> Verified
                      </span>
                    ) : (
                      <span className="inline-flex items-center gap-1 text-[11px] text-amber-800 font-semibold bg-amber-50 border border-amber-200 px-2 py-0.5 rounded-full">
                        <AlertCircle className="w-3 h-3 text-amber-600" /> Pending Check
                      </span>
                    )}
                  </td>
                  <td className="py-3.5 px-4 text-right">
                    <span className="font-mono text-[11px] text-brand-forest font-bold block">
                      {b.applicationId}
                    </span>
                    <span className="text-[10px] text-brand-charcoal/50">
                      {formatINR(b.requestedAmount)}
                    </span>
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
