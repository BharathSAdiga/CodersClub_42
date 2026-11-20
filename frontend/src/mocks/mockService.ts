import { 
  PersonaProfile, 
  CreditApplication, 
  ConsentArtifact, 
  FairnessMetric,
  UnderwritingDecisionPayload 
} from '@/types';
import { mockPersonas } from './data/personas';

class CentralizedMockService {
  private activePersonaKey: string = 'PERSONA_RAMESH';
  private latencyMs: number = 250;

  constructor() {
    if (typeof window !== 'undefined') {
      try {
        const storedCustom: PersonaProfile[] = JSON.parse(sessionStorage.getItem('udyoga_custom_personas') || '[]');
        storedCustom.forEach((p) => {
          mockPersonas[p.id] = p;
        });
      } catch (e) {
        console.error('Failed to load custom personas from session storage', e);
      }
    }

    const saved = typeof window !== 'undefined' ? sessionStorage.getItem('udyoga_active_persona') : null;
    if (saved && mockPersonas[saved]) {
      this.activePersonaKey = saved;
    }
  }

  private async delay(): Promise<void> {
    return new Promise((resolve) => setTimeout(resolve, this.latencyMs));
  }

  // Persona Management
  public getActivePersona(): PersonaProfile {
    return mockPersonas[this.activePersonaKey] || mockPersonas.PERSONA_RAMESH;
  }

  public setActivePersona(personaKey: string): PersonaProfile {
    if (mockPersonas[personaKey]) {
      this.activePersonaKey = personaKey;
      if (typeof window !== 'undefined') {
        sessionStorage.setItem('udyoga_active_persona', personaKey);
      }
    }
    return this.getActivePersona();
  }

  public getAllPersonas(): PersonaProfile[] {
    return Object.values(mockPersonas);
  }

  public registerCustomPersona(newPersona: PersonaProfile): PersonaProfile {
    mockPersonas[newPersona.id] = newPersona;
    if (typeof window !== 'undefined') {
      try {
        const storedCustom = JSON.parse(sessionStorage.getItem('udyoga_custom_personas') || '[]');
        storedCustom.push(newPersona);
        sessionStorage.setItem('udyoga_custom_personas', JSON.stringify(storedCustom));
      } catch (e) {
        console.error('Failed to persist custom persona to session storage', e);
      }
    }
    return newPersona;
  }

  // Applications
  public async getApplications(): Promise<CreditApplication[]> {
    await this.delay();
    const current = this.getActivePersona();
    return current.application ? [current.application] : [];
  }

  public async submitApplication(data: Partial<CreditApplication>): Promise<CreditApplication> {
    await this.delay();
    const current = this.getActivePersona();
    const newApp: CreditApplication = {
      id: `app_${Date.now()}`,
      businessId: current.business?.id || 'biz_generic',
      requestedAmount: data.requestedAmount || 100000,
      approvedAmount: data.requestedAmount || 100000,
      tenorDays: data.tenorDays || 90,
      repaymentFrequency: data.repaymentFrequency || 'DAILY_SWEEP',
      repaymentAmountPerCycle: Math.round((data.requestedAmount || 100000) / 90 * 1.14),
      apr: 14.2,
      processingFee: 1500,
      netDisbursalAmount: (data.requestedAmount || 100000) - 1500,
      status: 'SUBMITTED',
      submittedAt: new Date().toISOString(),
      disbursalEtaMinutes: 12,
    };
    current.application = newApp;
    return newApp;
  }

  // Consent Management
  public async revokeConsent(consentId: string): Promise<boolean> {
    await this.delay();
    const current = this.getActivePersona();
    if (current.consents) {
      current.consents = current.consents.map((c) =>
        c.id === consentId ? { ...c, status: 'REVOKED', revokedAt: new Date().toISOString() } : c
      );
    }
    return true;
  }

  // Counterfactual Simulator (Live calculation)
  public async simulateWhatIf(admb: number, upiVolume: number): Promise<{
    projectedLimit: number;
    projectedApr: number;
    deltaLimit: number;
  }> {
    await this.delay();
    const baseLimit = 150000;
    const baseApr = 14.5;

    const admbBonus = Math.max(0, (admb - 15000) * 4);
    const upiBonus = Math.max(0, (upiVolume - 300000) * 0.25);
    const totalBonus = Math.min(350000, admbBonus + upiBonus);

    const aprDiscount = Math.min(2.5, (totalBonus / 100000) * 0.4);

    return {
      projectedLimit: Math.round(baseLimit + totalBonus),
      projectedApr: Number((baseApr - aprDiscount).toFixed(1)),
      deltaLimit: Math.round(totalBonus),
    };
  }

  // Fairness Metrics
  public async getFairnessMetrics(): Promise<FairnessMetric[]> {
    await this.delay();
    return [
      {
        attribute: 'GENDER',
        groupA: 'Female-Led MSME',
        groupB: 'Male-Led MSME',
        approvalRateA: 0.732,
        approvalRateB: 0.773,
        disparateImpactRatio: 0.947,
        isCompliantWith80Rule: true,
      },
      {
        attribute: 'GEOGRAPHY_TIER',
        groupA: 'Tier-2 & Tier-3 Districts',
        groupB: 'Tier-1 Metros',
        approvalRateA: 0.684,
        approvalRateB: 0.775,
        disparateImpactRatio: 0.882,
        isCompliantWith80Rule: true,
      },
      {
        attribute: 'ENTERPRISE_CLASS',
        groupA: 'Micro (Turnover < ₹5 Cr)',
        groupB: 'Small & Medium',
        approvalRateA: 0.710,
        approvalRateB: 0.820,
        disparateImpactRatio: 0.865,
        isCompliantWith80Rule: true,
      },
    ];
  }
}

export const mockService = new CentralizedMockService();
