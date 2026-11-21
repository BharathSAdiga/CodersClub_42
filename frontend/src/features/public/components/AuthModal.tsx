import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { X, Lock, Sparkles, User, Mail, ShieldCheck, LogIn, UserPlus } from 'lucide-react';
import { toast } from 'sonner';
import { apiService } from '@/services/apiService';
import { mockService } from '@/mocks/mockService';

interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
  onLoginSuccess: (personaKey: string) => void;
}

export const AuthModal: React.FC<AuthModalProps> = ({
  isOpen,
  onClose,
  onLoginSuccess,
}) => {
  const [authTab, setAuthTab] = useState<'LOGIN' | 'REGISTER' | 'DEMO'>('LOGIN');

  // Login State
  const [loginUsername, setLoginUsername] = useState('');
  const [loginPassword, setLoginPassword] = useState('');
  const [isLoggingIn, setIsLoggingIn] = useState(false);

  // Register State
  const [regFullName, setRegFullName] = useState('');
  const [regUsername, setRegUsername] = useState('');
  const [regEmail, setRegEmail] = useState('');
  const [regPassword, setRegPassword] = useState('');
  const [regRole, setRegRole] = useState<'BORROWER' | 'LENDER' | 'ADMIN'>('BORROWER');
  const [isRegistering, setIsRegistering] = useState(false);

  if (!isOpen) return null;

  const handleStandardLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!loginUsername || !loginPassword) {
      toast.error('Please enter both username/email and password.');
      return;
    }
    setIsLoggingIn(true);
    try {
      const resp = await apiService.login(loginUsername, loginPassword);
      toast.success(`Welcome back, ${resp.full_name || resp.username}!`);

      // Determine mapped persona or role
      let personaKey = 'PERSONA_RAMESH';
      if (resp.role.includes('LENDER')) {
        personaKey = 'PERSONA_VIKRAM';
      } else if (resp.role.includes('ADMIN') || resp.role.includes('AUDITOR')) {
        personaKey = 'SUPER_ADMIN';
      } else if (resp.username === 'priya' || resp.username?.toLowerCase().includes('priya')) {
        personaKey = 'PERSONA_PRIYA';
      } else if (resp.username === 'ramesh' || resp.username?.toLowerCase().includes('ramesh')) {
        personaKey = 'PERSONA_RAMESH';
      } else {
        const userId = resp.user?.id || `usr_${resp.username}`;
        const customId = `CUSTOM_${userId}`;
        const newPersona: any = {
          id: customId,
          name: resp.full_name || resp.username,
          role: resp.role || 'BORROWER_MICRO',
          tagline: `${resp.full_name || resp.username} — Registered MSME Profile`,
          user: {
            id: userId,
            mobile: '+91 98765 43210',
            fullName: resp.full_name || resp.username,
            role: resp.role || 'BORROWER_MICRO',
            preferredLanguage: 'en',
            createdAt: new Date().toISOString(),
            lastLoginAt: new Date().toISOString(),
          },
          business: {
            id: resp.business_id || `biz_${resp.username}`,
            userId: userId,
            tradeName: `${resp.full_name || resp.username} Enterprises`,
            legalName: `${resp.full_name || resp.username} Pvt Ltd`,
            constitution: 'PROPRIETORSHIP',
            enterpriseClass: 'MICRO',
            udyamRegistrationNumber: 'UDYAM-KA-03-0091823',
            pan: 'AABCP1234K',
            gstin: '29AABCP1234K1Z5',
            industrySector: 'Retail & General Trade',
            operatingAddress: {
              street: '12 Commercial Road',
              city: 'Bengaluru',
              state: 'Karnataka',
              pincode: '560001',
              tier: 'TIER_1',
            },
            yearsInOperation: 3,
            verifiedAt: new Date().toISOString(),
          },
          financials: {
            businessId: resp.business_id || `biz_${resp.username}`,
            accounts: [],
            turnoverHistory: [],
            operatingSurplus: { monthlyAverage: 45000, marginPct: 18.5, trend: 'STABLE' },
            existingDebt: { totalOutstanding: 50000, monthlyServiceCost: 4500, activeFacilitiesCount: 1 },
            syntheticMetadata: { isSynthetic: false, dataQualityScore: 92, evidenceCount: 3, verifiedClaimsCount: 3, unverifiedClaimsCount: 0 }
          }
        };
        mockService.registerCustomPersona(newPersona);
        personaKey = customId;
      }
      onLoginSuccess(personaKey);
      onClose();
    } catch (err: any) {
      toast.error(err.message || 'Login failed. Please verify credentials.');
    } finally {
      setIsLoggingIn(false);
    }
  };

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!regUsername || !regEmail || !regPassword || !regFullName) {
      toast.error('Please fill in all required registration fields.');
      return;
    }
    if (regPassword.length < 8) {
      toast.error('Password must be at least 8 characters long.');
      return;
    }
    setIsRegistering(true);
    try {
      const resp = await apiService.register({
        username: regUsername,
        email: regEmail,
        full_name: regFullName,
        password: regPassword,
        role: regRole,
      });
      toast.success(`Account registered successfully as ${resp.role}!`);

      let personaKey = 'PERSONA_RAMESH';
      if (resp.role === 'LENDER') {
        personaKey = 'PERSONA_VIKRAM';
      } else if (resp.role === 'ADMIN') {
        personaKey = 'SUPER_ADMIN';
      } else {
        const userId = resp.user?.id || `usr_${resp.username}`;
        const customId = `CUSTOM_${userId}`;
        const newPersona: any = {
          id: customId,
          name: resp.full_name || regFullName,
          role: resp.role || 'BORROWER_MICRO',
          tagline: `${resp.full_name || regFullName} — Registered MSME Profile`,
          user: {
            id: userId,
            mobile: '+91 98765 43210',
            fullName: resp.full_name || regFullName,
            role: resp.role || 'BORROWER_MICRO',
            preferredLanguage: 'en',
            createdAt: new Date().toISOString(),
            lastLoginAt: new Date().toISOString(),
          },
          business: {
            id: resp.business_id || `biz_${resp.username}`,
            userId: userId,
            tradeName: `${regFullName} Enterprises`,
            legalName: `${regFullName} Pvt Ltd`,
            constitution: 'PROPRIETORSHIP',
            enterpriseClass: 'MICRO',
            udyamRegistrationNumber: 'UDYAM-KA-03-0091823',
            pan: 'AABCP1234K',
            gstin: '29AABCP1234K1Z5',
            industrySector: 'Retail & General Trade',
            operatingAddress: {
              street: '12 Commercial Road',
              city: 'Bengaluru',
              state: 'Karnataka',
              pincode: '560001',
              tier: 'TIER_1',
            },
            yearsInOperation: 3,
            verifiedAt: new Date().toISOString(),
          },
          financials: {
            businessId: resp.business_id || `biz_${resp.username}`,
            accounts: [],
            turnoverHistory: [],
            operatingSurplus: { monthlyAverage: 45000, marginPct: 18.5, trend: 'STABLE' },
            existingDebt: { totalOutstanding: 50000, monthlyServiceCost: 4500, activeFacilitiesCount: 1 },
            syntheticMetadata: { isSynthetic: false, dataQualityScore: 92, evidenceCount: 3, verifiedClaimsCount: 3, unverifiedClaimsCount: 0 }
          }
        };
        mockService.registerCustomPersona(newPersona);
        personaKey = customId;
      }

      onLoginSuccess(personaKey);
      onClose();
    } catch (err: any) {
      toast.error(err.message || 'Registration failed.');
    } finally {
      setIsRegistering(false);
    }
  };

  const handleQuickDemoLogin = async (personaKey: string) => {
    try {
      await apiService.demoLogin(personaKey);
      toast.success('Instant demo persona session initialized.');
      onLoginSuccess(personaKey);
      onClose();
    } catch {
      // Fallback to client mock
      toast.success('Instant demo login active (offline fallback).');
      onLoginSuccess(personaKey);
      onClose();
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-brand-charcoal/60 backdrop-blur-sm animate-in fade-in duration-200">
      <div
        className="w-full max-w-md bg-brand-ivory rounded-3xl border border-brand-forest/20 shadow-elevated overflow-hidden text-brand-charcoal"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="p-6 border-b border-brand-forest/10 flex items-center justify-between bg-white/70">
          <div className="flex items-center gap-2">
            <div className="w-7 h-7 rounded-full bg-brand-forest flex items-center justify-center text-brand-mint text-xs font-bold">
              U
            </div>
            <h3 className="font-display font-bold text-base text-brand-charcoal">
              UDYOGA Access Gateway
            </h3>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-full bg-brand-forest/10 hover:bg-brand-forest/20 flex items-center justify-center text-brand-charcoal transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Auth Mode Tabs */}
        <div className="flex border-b border-brand-forest/10 bg-brand-forest/5 text-xs font-semibold">
          <button
            onClick={() => setAuthTab('LOGIN')}
            className={`flex-1 py-3 text-center transition-colors flex items-center justify-center gap-1.5 ${authTab === 'LOGIN'
              ? 'bg-white text-brand-forest border-b-2 border-brand-forest font-bold'
              : 'text-brand-charcoal/60 hover:text-brand-forest'
              }`}
          >
            <LogIn className="w-3.5 h-3.5" />
            Sign In
          </button>
          <button
            onClick={() => setAuthTab('REGISTER')}
            className={`flex-1 py-3 text-center transition-colors flex items-center justify-center gap-1.5 ${authTab === 'REGISTER'
              ? 'bg-white text-brand-forest border-b-2 border-brand-forest font-bold'
              : 'text-brand-charcoal/60 hover:text-brand-forest'
              }`}
          >
            <UserPlus className="w-3.5 h-3.5" />
            Register
          </button>
          <button
            onClick={() => setAuthTab('DEMO')}
            className={`flex-1 py-3 text-center transition-colors flex items-center justify-center gap-1.5 ${authTab === 'DEMO'
              ? 'bg-white text-brand-forest border-b-2 border-brand-forest font-bold'
              : 'text-brand-charcoal/60 hover:text-brand-forest'
              }`}
          >
            <Sparkles className="w-3.5 h-3.5 text-brand-terracotta" />
            Demo Roles
          </button>
        </div>

        {/* Body */}
        <div className="p-6 space-y-5">

          {/* TAB 1: STANDARD LOGIN */}
          {authTab === 'LOGIN' && (
            <form onSubmit={handleStandardLogin} className="space-y-4">
              <div>
                <label className="text-xs font-semibold text-brand-charcoal block mb-1">
                  Username or Email
                </label>
                <div className="relative">
                  <User className="w-4 h-4 text-brand-charcoal/40 absolute left-3.5 top-3.5" />
                  <Input
                    type="text"
                    placeholder="e.g. ramesh or ramesh.kumar@kirana.udyoga.in"
                    value={loginUsername}
                    onChange={(e) => setLoginUsername(e.target.value)}
                    className="pl-10 text-xs"
                    required
                  />
                </div>
              </div>

              <div>
                <label className="text-xs font-semibold text-brand-charcoal block mb-1">
                  Password
                </label>
                <div className="relative">
                  <Lock className="w-4 h-4 text-brand-charcoal/40 absolute left-3.5 top-3.5" />
                  <Input
                    type="password"
                    placeholder="Enter account password"
                    value={loginPassword}
                    onChange={(e) => setLoginPassword(e.target.value)}
                    className="pl-10 text-xs"
                    required
                  />
                </div>
              </div>

              <Button
                type="submit"
                variant="primary"
                size="lg"
                className="w-full text-xs font-bold"
                disabled={isLoggingIn}
              >
                {isLoggingIn ? 'Authenticating...' : 'Sign In with JWT'}
              </Button>

              <div className="pt-2 text-center text-[11px] text-brand-charcoal/60">
                Demo accounts: <span className="font-mono text-brand-forest font-semibold">ramesh</span> / <span className="font-mono text-brand-forest font-semibold">password123</span>
              </div>
            </form>
          )}

          {/* TAB 2: REGISTRATION */}
          {authTab === 'REGISTER' && (
            <form onSubmit={handleRegister} className="space-y-3.5">
              <div>
                <label className="text-xs font-semibold text-brand-charcoal block mb-1">
                  Full Legal Name
                </label>
                <Input
                  type="text"
                  placeholder="e.g. Anand Murthy"
                  value={regFullName}
                  onChange={(e) => setRegFullName(e.target.value)}
                  className="text-xs"
                  required
                />
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="text-xs font-semibold text-brand-charcoal block mb-1">
                    Username
                  </label>
                  <Input
                    type="text"
                    placeholder="anand_msme"
                    value={regUsername}
                    onChange={(e) => setRegUsername(e.target.value)}
                    className="text-xs"
                    required
                  />
                </div>
                <div>
                  <label className="text-xs font-semibold text-brand-charcoal block mb-1">
                    Role
                  </label>
                  <select
                    value={regRole}
                    onChange={(e) => setRegRole(e.target.value as any)}
                    className="w-full h-10 px-3 rounded-xl border border-brand-forest/20 bg-white text-xs text-brand-charcoal font-medium focus:ring-2 focus:ring-brand-forest"
                  >
                    <option value="BORROWER">MSME Borrower</option>
                    <option value="LENDER">Credit Officer / Lender</option>
                    <option value="ADMIN">System Auditor / Admin</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="text-xs font-semibold text-brand-charcoal block mb-1">
                  Email Address
                </label>
                <div className="relative">
                  <Mail className="w-4 h-4 text-brand-charcoal/40 absolute left-3.5 top-3.5" />
                  <Input
                    type="email"
                    placeholder="anand@murthytextiles.in"
                    value={regEmail}
                    onChange={(e) => setRegEmail(e.target.value)}
                    className="pl-10 text-xs"
                    required
                  />
                </div>
              </div>

              <div>
                <label className="text-xs font-semibold text-brand-charcoal block mb-1">
                  Password (min 8 chars, 1 letter & 1 digit)
                </label>
                <div className="relative">
                  <Lock className="w-4 h-4 text-brand-charcoal/40 absolute left-3.5 top-3.5" />
                  <Input
                    type="password"
                    placeholder="Min 8 characters"
                    value={regPassword}
                    onChange={(e) => setRegPassword(e.target.value)}
                    className="pl-10 text-xs"
                    required
                  />
                </div>
              </div>

              <Button
                type="submit"
                variant="accent"
                size="lg"
                className="w-full text-xs font-bold mt-2"
                disabled={isRegistering}
              >
                {isRegistering ? 'Registering...' : 'Create Account & Enter'}
              </Button>
            </form>
          )}

          {/* TAB 3: QUICK DEMO PERSONAS */}
          {authTab === 'DEMO' && (
            <div className="space-y-4">
              <div className="p-3.5 rounded-2xl bg-brand-forest/5 border border-brand-forest/10 space-y-2">
                <span className="text-[10px] uppercase font-mono tracking-wider text-brand-forest font-bold flex items-center gap-1.5">
                  <ShieldCheck className="w-3.5 h-3.5 text-brand-forest" />
                  One-Click Pre-Seeded Hackathon Personas:
                </span>
                <p className="text-[11px] text-brand-charcoal/70 leading-relaxed">
                  Instantly authenticate as verified MSME owners, senior underwriters, or ethical fair-lending auditors with deterministic test data.
                </p>
              </div>

              <div className="grid grid-cols-2 gap-2 text-xs">
                <button
                  onClick={() => handleQuickDemoLogin('PERSONA_RAMESH')}
                  className="p-3 rounded-2xl bg-white hover:bg-brand-forest hover:text-white border border-brand-forest/15 text-left font-medium transition-colors shadow-xs"
                >
                  <div className="font-bold">🏬 Ramesh Kumar</div>
                  <div className="text-[10px] opacity-75">Kirana • Micro Borrower</div>
                </button>
                <button
                  onClick={() => handleQuickDemoLogin('PERSONA_PRIYA')}
                  className="p-3 rounded-2xl bg-white hover:bg-brand-forest hover:text-white border border-brand-forest/15 text-left font-medium transition-colors shadow-xs"
                >
                  <div className="font-bold">🧵 Priya Patel</div>
                  <div className="text-[10px] opacity-75">Textiles • Growth Borrower</div>
                </button>
                <button
                  onClick={() => handleQuickDemoLogin('PERSONA_VIKRAM')}
                  className="p-3 rounded-2xl bg-white hover:bg-brand-forest hover:text-white border border-brand-forest/15 text-left font-medium transition-colors shadow-xs"
                >
                  <div className="font-bold">🏦 Vikram Malhotra</div>
                  <div className="text-[10px] opacity-75">Senior Credit Officer • Lender</div>
                </button>
                <button
                  onClick={() => handleQuickDemoLogin('PERSONA_SUNITA')}
                  className="p-3 rounded-2xl bg-white hover:bg-brand-forest hover:text-white border border-brand-forest/15 text-left font-medium transition-colors shadow-xs"
                >
                  <div className="font-bold">⚖️ Dr. Sunita / Ananya</div>
                  <div className="text-[10px] opacity-75">Fair-Lending & Ethics Auditor</div>
                </button>
              </div>
            </div>
          )}

        </div>
      </div>
    </div>
  );
};
