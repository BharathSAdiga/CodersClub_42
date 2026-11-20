import React from 'react';
import { mockPersonas } from '@/mocks/data/personas';
import { PersonaProfile, UserRole } from '@/types';
import { Check, User, Building, Landmark, Shield, BarChart3, Wrench, X } from 'lucide-react';

interface PersonaSwitcherProps {
  isOpen: boolean;
  onClose: () => void;
  activePersonaId: string;
  onSelectPersona: (personaId: string) => void;
}

export const PersonaSwitcher: React.FC<PersonaSwitcherProps> = ({
  isOpen,
  onClose,
  activePersonaId,
  onSelectPersona,
}) => {
  if (!isOpen) return null;

  const personas = Object.values(mockPersonas);

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

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-brand-charcoal/60 backdrop-blur-sm animate-in fade-in duration-200">
      <div 
        className="w-full max-w-2xl bg-brand-ivory rounded-3xl border border-brand-forest/20 shadow-elevated overflow-hidden text-brand-charcoal"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="p-6 border-b border-brand-forest/10 flex items-center justify-between bg-white/60">
          <div>
            <h3 className="font-display font-bold text-lg text-brand-charcoal">Select Demo Persona</h3>
            <p className="text-xs text-brand-charcoal/60 mt-0.5">
              Instantly toggle the platform state across 7 real MSME, Lender, and Audit profiles.
            </p>
          </div>
          <button 
            onClick={onClose}
            className="w-8 h-8 rounded-full bg-brand-forest/10 hover:bg-brand-forest/20 flex items-center justify-center text-brand-charcoal transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Persona Cards List */}
        <div className="p-6 max-h-[480px] overflow-y-auto space-y-3">
          {personas.map((p) => {
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
                  <div className={`w-10 h-10 rounded-2xl flex items-center justify-center ${
                    isSelected ? 'bg-white/20 text-white' : 'bg-brand-forest/10'
                  }`}>
                    {getRoleIcon(p.role)}
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
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
                  <div className="w-6 h-6 rounded-full bg-brand-mint text-brand-charcoal flex items-center justify-center shrink-0">
                    <Check className="w-3.5 h-3.5 stroke-[3]" />
                  </div>
                )}
              </div>
            );
          })}
        </div>

        {/* Footer */}
        <div className="p-4 bg-brand-forest/5 border-t border-brand-forest/10 text-center text-xs text-brand-charcoal/60">
          Switching persona updates mock session storage, role permissions, and financial telemetry in real time.
        </div>
      </div>
    </div>
  );
};
