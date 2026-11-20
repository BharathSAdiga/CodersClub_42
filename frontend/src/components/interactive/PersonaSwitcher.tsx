import React, { useState } from 'react';
import { mockPersonas } from '@/mocks/data/personas';
import { mockService } from '@/mocks/mockService';
import { PersonaProfile, UserRole } from '@/types';
import { Check, User, Building, Landmark, Shield, BarChart3, Wrench, X, Plus, Filter, Sparkles } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface PersonaSwitcherProps {
  isOpen: boolean;
  onClose: () => void;
  activePersonaId: string;
  onSelectPersona: (personaId: string) => void;
}

type CategoryTab = 'ALL' | 'BORROWERS' | 'LENDERS' | 'GOVERNANCE';

export const PersonaSwitcher: React.FC<PersonaSwitcherProps> = ({
  isOpen,
  onClose,
  activePersonaId,
  onSelectPersona,
}) => {
  const [activeTab, setActiveTab] = useState<CategoryTab>('ALL');
  const [isAddingNew, setIsAddingNew] = useState<boolean>(false);

  // New Persona Form State
  const [newName, setNewName] = useState('');
  const [newRole, setNewRole] = useState<UserRole>('BORROWER_MICRO');
  const [newBadge, setNewBadge] = useState('');
  const [newTagline, setNewTagline] = useState('');
  const [newCity, setNewCity] = useState('');
  const [newSector, setNewSector] = useState('');

  if (!isOpen) return null;

  const personas = mockService.getAllPersonas();

  const getCategory = (role: UserRole): 'BORROWERS' | 'LENDERS' | 'GOVERNANCE' => {
    if (role === 'BORROWER_MICRO' || role === 'BORROWER_GROWTH') return 'BORROWERS';
    if (role === 'LENDER_OFFICER' || role === 'LENDER_MANAGER') return 'LENDERS';
    return 'GOVERNANCE';
  };

  const filteredPersonas = personas.filter((p) => {
    if (activeTab === 'ALL') return true;
    return getCategory(p.role) === activeTab;
  });

  const getRoleIcon = (role: UserRole) => {
    switch (role) {
      case 'BORROWER_MICRO':
      case 'BORROWER_GROWTH':
        return <Building className="w-4 h-4 text-brand-forest" />;
      case 'LENDER_OFFICER':
      case 'LENDER_MANAGER':
        return <Landmark className="w-4 h-4 text-brand-terracotta" />;
      case 'ETHICS_AUDITOR':
        return <BarChart3 className="w-4 h-4 text-emerald-600" />;
      case 'SUPER_ADMIN':
        return <Wrench className="w-4 h-4 text-blue-600" />;
      default:
        return <User className="w-4 h-4 text-gray-500" />;
    }
  };

  const handleCreatePersona = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newName.trim() || !newBadge.trim()) return;

    const id = `PERSONA_CUSTOM_${Date.now()}`;
    const customProfile: PersonaProfile = {
      id,
      name: newName.trim(),
      role: newRole,
      badge: newBadge.trim(),
      tagline: newTagline.trim() || `Custom ${newBadge.trim()} on UDYOGA`,
      user: {
        id: `usr_${Date.now()}`,
        fullName: newName.trim(),
        mobile: '+91 98920 11029',
        role: newRole,
        preferredLanguage: 'en',
        createdAt: new Date().toISOString(),
        lastLoginAt: new Date().toISOString(),
      },
      business: {
        id: `biz_${Date.now()}`,
        userId: `usr_${Date.now()}`,
        tradeName: `${newName.trim()} Enterprises`,
        legalName: newName.trim(),
        constitution: 'PROPRIETORSHIP',
        enterpriseClass: newRole === 'BORROWER_GROWTH' ? 'SMALL' : 'MICRO',
        pan: 'ABCDE1234F',
        industrySector: newSector.trim() || 'Retail & Trade Commerce',
        operatingAddress: {
          street: 'Main Bazaar Road',
          city: newCity.trim() || 'Pune',
          state: 'Maharashtra',
          pincode: '411001',
          tier: 'TIER_2',
        },
        yearsInOperation: 4,
        verifiedAt: new Date().toISOString(),
      },
      financials: {
        businessId: `biz_${Date.now()}`,
        accounts: [
          {
            bankName: 'HDFC Bank',
            accountNumberMasked: '•••• 7712',
            ifscCode: 'HDFC0001234',
            accountType: 'CURRENT',
            aaLinked: true,
            averageDailyBalance: 32500,
            monthlyInflowAvg: 720000,
            monthlyOutflowAvg: 640000,
            bounceCount90Days: 0,
          },
        ],
        upiMerchants: [
          {
            vpaMasked: `${newName.toLowerCase().replace(/\s+/g, '')}***@upi`,
            aggregator: 'PHONEPE',
            dailyAverageTransactions: 165,
            monthlyAverageVolume: 640000,
            ticketSizeAverage: 140,
            activeSinceDays: 520,
          },
        ],
        cashFlowWaveform: Array.from({ length: 30 }, (_, i) => ({
          date: `Day ${i + 1}`,
          inflow: Math.round(24000 + Math.sin(i / 2) * 5000),
          outflow: Math.round(20000 + Math.sin(i / 3) * 4000),
          netBalance: Math.round(30000 + Math.sin(i / 4) * 6000),
        })),
      },
      acieReport: {
        id: `acie_${Date.now()}`,
        applicationId: `app_${Date.now()}`,
        creditVitalityScore: 768,
        scoreBand: 'PRIME',
        modelConfidenceScore: 0.95,
        evaluatedAt: new Date().toISOString(),
        isSparseDataProgressiveMode: false,
        topDrivers: [
          {
            featureKey: 'CONSISTENT_DAILY_UPI',
            displayName: 'Daily Merchant QR Velocity',
            impactDirection: 'POSITIVE',
            weightPoints: 58,
            explanationPlainLanguage: 'Sustained daily QR collections demonstrate verifiable commerce footfall.',
          },
          {
            featureKey: 'AA_ACCOUNT_CONGRUENCE',
            displayName: 'Bank Account Triangulation',
            impactDirection: 'POSITIVE',
            weightPoints: 44,
            explanationPlainLanguage: 'Multi-stream bank deposit congruence verifies genuine sales volume.',
          },
        ],
        counterfactuals: [
          {
            parameterName: 'AVERAGE_DAILY_BALANCE',
            currentValue: 32500,
            suggestedTargetValue: 45000,
            unlockedCreditIncrease: 150000,
            unlockedAprDiscount: 0.6,
            timelineDays: 14,
          },
        ],
      },
    };

    mockService.registerCustomPersona(customProfile);
    setIsAddingNew(false);
    onSelectPersona(customProfile.id);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-brand-charcoal/60 backdrop-blur-sm animate-in fade-in duration-200">
      <div 
        className="w-full max-w-2xl bg-brand-ivory rounded-3xl border border-brand-forest/20 shadow-elevated overflow-hidden text-brand-charcoal"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="p-6 border-b border-brand-forest/10 flex items-center justify-between bg-white/60">
          <div>
            <div className="flex items-center gap-2">
              <h3 className="font-display font-bold text-lg text-brand-charcoal">Select Demo Persona</h3>
              <span className="text-[10px] font-mono font-bold bg-brand-forest/10 text-brand-forest px-2 py-0.5 rounded-full">
                {personas.length} PROFILES
              </span>
            </div>
            <p className="text-xs text-brand-charcoal/60 mt-0.5">
              Instantly toggle platform state across real MSME, Lender, and Audit profiles.
            </p>
          </div>
          
          <div className="flex items-center gap-2">
            {!isAddingNew && (
              <Button
                variant="outline"
                size="sm"
                onClick={() => setIsAddingNew(true)}
                className="h-8 text-xs font-semibold rounded-full border-brand-forest/30 text-brand-forest hover:bg-brand-forest/10 flex items-center gap-1.5"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>Add Persona</span>
              </Button>
            )}
            <button 
              onClick={onClose}
              className="w-8 h-8 rounded-full bg-brand-forest/10 hover:bg-brand-forest/20 flex items-center justify-center text-brand-charcoal transition-colors"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Categories Bar */}
        {!isAddingNew && (
          <div className="px-6 pt-4 pb-2 flex items-center justify-between border-b border-brand-forest/10 bg-brand-forest/[0.02]">
            <div className="flex items-center gap-1.5">
              <button
                onClick={() => setActiveTab('ALL')}
                className={`text-xs px-3 py-1 rounded-full font-semibold transition-all ${
                  activeTab === 'ALL'
                    ? 'bg-brand-forest text-brand-ivory shadow-sm'
                    : 'text-brand-charcoal/70 hover:bg-white/80'
                }`}
              >
                All ({personas.length})
              </button>
              <button
                onClick={() => setActiveTab('BORROWERS')}
                className={`text-xs px-3 py-1 rounded-full font-semibold transition-all ${
                  activeTab === 'BORROWERS'
                    ? 'bg-brand-forest text-brand-ivory shadow-sm'
                    : 'text-brand-charcoal/70 hover:bg-white/80'
                }`}
              >
                MSME Borrowers ({personas.filter(p => getCategory(p.role) === 'BORROWERS').length})
              </button>
              <button
                onClick={() => setActiveTab('LENDERS')}
                className={`text-xs px-3 py-1 rounded-full font-semibold transition-all ${
                  activeTab === 'LENDERS'
                    ? 'bg-brand-forest text-brand-ivory shadow-sm'
                    : 'text-brand-charcoal/70 hover:bg-white/80'
                }`}
              >
                Lenders ({personas.filter(p => getCategory(p.role) === 'LENDERS').length})
              </button>
              <button
                onClick={() => setActiveTab('GOVERNANCE')}
                className={`text-xs px-3 py-1 rounded-full font-semibold transition-all ${
                  activeTab === 'GOVERNANCE'
                    ? 'bg-brand-forest text-brand-ivory shadow-sm'
                    : 'text-brand-charcoal/70 hover:bg-white/80'
                }`}
              >
                Auditors & Admin ({personas.filter(p => getCategory(p.role) === 'GOVERNANCE').length})
              </button>
            </div>
          </div>
        )}

        {/* Modal Body: Either Category List OR Add New Form */}
        {isAddingNew ? (
          <form onSubmit={handleCreatePersona} className="p-6 max-h-[480px] overflow-y-auto space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-brand-forest/10">
              <div className="flex items-center gap-2">
                <Sparkles className="w-4 h-4 text-brand-forest" />
                <h4 className="font-display font-bold text-sm text-brand-charcoal">Create New Custom Persona</h4>
              </div>
              <button
                type="button"
                onClick={() => setIsAddingNew(false)}
                className="text-xs text-brand-charcoal/60 hover:text-brand-charcoal underline"
              >
                Back to list
              </button>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="text-xs font-semibold text-brand-charcoal/80 block mb-1">
                  Full Name *
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Meera Nambiar"
                  value={newName}
                  onChange={(e) => setNewName(e.target.value)}
                  className="w-full text-xs px-3 py-2 rounded-xl bg-white border border-brand-forest/20 focus:outline-none focus:border-brand-forest"
                />
              </div>

              <div>
                <label className="text-xs font-semibold text-brand-charcoal/80 block mb-1">
                  Category & Role *
                </label>
                <select
                  value={newRole}
                  onChange={(e) => setNewRole(e.target.value as UserRole)}
                  className="w-full text-xs px-3 py-2 rounded-xl bg-white border border-brand-forest/20 focus:outline-none focus:border-brand-forest"
                >
                  <option value="BORROWER_MICRO">MSME Borrower: Micro Enterprise</option>
                  <option value="BORROWER_GROWTH">MSME Borrower: Growth Enterprise</option>
                  <option value="LENDER_OFFICER">Lender: Senior Credit Analyst</option>
                  <option value="LENDER_MANAGER">Lender: Chief Risk Officer</option>
                  <option value="ETHICS_AUDITOR">Auditor: Independent Ethics Auditor</option>
                  <option value="SUPER_ADMIN">System: Platform Administrator</option>
                </select>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="text-xs font-semibold text-brand-charcoal/80 block mb-1">
                  Badge Label *
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Spices Exporter (Kochi)"
                  value={newBadge}
                  onChange={(e) => setNewBadge(e.target.value)}
                  className="w-full text-xs px-3 py-2 rounded-xl bg-white border border-brand-forest/20 focus:outline-none focus:border-brand-forest"
                />
              </div>

              <div>
                <label className="text-xs font-semibold text-brand-charcoal/80 block mb-1">
                  Industry / Business Sector
                </label>
                <input
                  type="text"
                  placeholder="e.g. Agro-Processing & Spices"
                  value={newSector}
                  onChange={(e) => setNewSector(e.target.value)}
                  className="w-full text-xs px-3 py-2 rounded-xl bg-white border border-brand-forest/20 focus:outline-none focus:border-brand-forest"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="text-xs font-semibold text-brand-charcoal/80 block mb-1">
                  City / District
                </label>
                <input
                  type="text"
                  placeholder="e.g. Kochi, Kerala"
                  value={newCity}
                  onChange={(e) => setNewCity(e.target.value)}
                  className="w-full text-xs px-3 py-2 rounded-xl bg-white border border-brand-forest/20 focus:outline-none focus:border-brand-forest"
                />
              </div>

              <div>
                <label className="text-xs font-semibold text-brand-charcoal/80 block mb-1">
                  Tagline / Use Case Summary
                </label>
                <input
                  type="text"
                  placeholder="e.g. Scaling export volumes with seasonal crop working capital"
                  value={newTagline}
                  onChange={(e) => setNewTagline(e.target.value)}
                  className="w-full text-xs px-3 py-2 rounded-xl bg-white border border-brand-forest/20 focus:outline-none focus:border-brand-forest"
                />
              </div>
            </div>

            <div className="pt-3 border-t border-brand-forest/10 flex justify-end gap-2">
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => setIsAddingNew(false)}
                className="text-xs"
              >
                Cancel
              </Button>
              <Button
                type="submit"
                variant="primary"
                size="sm"
                className="bg-brand-forest hover:bg-brand-forest/90 text-white text-xs px-5 rounded-full"
              >
                Save & Switch to Persona
              </Button>
            </div>
          </form>
        ) : (
          <div className="p-6 max-h-[480px] overflow-y-auto space-y-3">
            {filteredPersonas.map((p) => {
              const isSelected = p.id === activePersonaId;
              return (
                <div
                  key={p.id}
                  onClick={() => {
                    onSelectPersona(p.id);
                    onClose();
                  }}
                  className={`p-4 rounded-2xl cursor-pointer transition-all border flex items-center justify-between ${
                    isSelected
                      ? 'bg-brand-forest text-brand-ivory border-brand-forest shadow-md'
                      : 'bg-white hover:bg-white/80 border-brand-forest/10 text-brand-charcoal hover:border-brand-forest/30'
                  }`}
                >
                  <div className="flex items-start gap-3.5">
                    <div className={`w-10 h-10 rounded-2xl flex items-center justify-center shrink-0 ${
                      isSelected ? 'bg-white/20 text-white' : 'bg-brand-forest/10'
                    }`}>
                      {getRoleIcon(p.role)}
                    </div>
                    <div>
                      <div className="flex items-center gap-2 flex-wrap">
                        <h4 className="font-display font-bold text-sm">{p.name}</h4>
                        <span className={`text-[10px] px-2 py-0.5 rounded-full font-medium ${
                          isSelected ? 'bg-brand-mint text-brand-charcoal' : 'bg-brand-forest/10 text-brand-forest'
                        }`}>
                          {p.badge}
                        </span>
                      </div>
                      <p className={`text-xs mt-1 leading-snug ${isSelected ? 'text-white/80' : 'text-brand-charcoal/60'}`}>
                        {p.tagline}
                      </p>
                    </div>
                  </div>

                  {isSelected && (
                    <div className="w-6 h-6 rounded-full bg-brand-mint text-brand-charcoal flex items-center justify-center shrink-0 ml-3">
                      <Check className="w-3.5 h-3.5 stroke-[3]" />
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}

        {/* Footer */}
        <div className="p-4 bg-brand-forest/5 border-t border-brand-forest/10 text-center text-xs text-brand-charcoal/60">
          Switching persona updates mock session storage, role permissions, and financial telemetry in real time.
        </div>
      </div>
    </div>
  );
};
