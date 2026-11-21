import React, { useState, useEffect } from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { PersonaProfile } from '@/types';
import { apiService } from '@/services/apiService';
import { 
  Building2, 
  MapPin, 
  Calendar, 
  CheckCircle2, 
  ShieldCheck, 
  FileCheck, 
  Edit3, 
  Save, 
  X,
  AlertCircle,
  IndianRupee,
  TrendingUp,
  Receipt
} from 'lucide-react';
import { toast } from 'sonner';

export const BusinessProfileView: React.FC<{ activePersona: PersonaProfile }> = ({ activePersona }) => {
  const user = apiService.getCurrentUser();
  const bizId = activePersona?.business?.id || user?.business_id || 'biz_artisan_02';
  const storageKey = `udyoga_borrower_profile_${activePersona.id}_${bizId}`;
  const initialBiz = activePersona.business;

  // Persistent profile state initialized from localStorage or persona defaults
  const [profile, setProfile] = useState(() => {
    try {
      const saved = localStorage.getItem(storageKey);
      if (saved) {
        return JSON.parse(saved);
      }
    } catch (e) {
      console.warn('Failed to parse saved business profile:', e);
    }
    const isPriya = activePersona.id.includes('priya') || bizId.includes('artisan') || bizId.includes('surat');
    return {
      tradeName: initialBiz?.tradeName || (isPriya ? 'ArtisanKraft Studio' : 'Sri Balaji Provisions'),
      legalName: initialBiz?.legalName || activePersona.name,
      constitution: initialBiz?.constitution || (isPriya ? 'LLP' : 'PROPRIETORSHIP'),
      enterpriseClass: initialBiz?.enterpriseClass || (isPriya ? 'SMALL' : 'MICRO'),
      udyamRegistrationNumber: initialBiz?.udyamRegistrationNumber || (isPriya ? 'UDYAM-RJ-10-0081290' : 'UDYAM-KR-03-0048921'),
      pan: initialBiz?.pan || (isPriya ? 'AABCA9104M' : 'BPLPK8912M'),
      gstin: initialBiz?.gstin || (isPriya ? '08AABCU9603R1ZM' : '29AABCS1429B1Z2'),
      yearsInOperation: initialBiz?.yearsInOperation || (isPriya ? 4 : 7),
      monthlyTurnover: isPriya ? 250000 : 285000,
      existingEmi: isPriya ? 8500 : 4500,
      street: initialBiz?.operatingAddress.street || 'Shop 14, APMC Market Yard',
      city: initialBiz?.operatingAddress.city || 'Bangalore',
      state: initialBiz?.operatingAddress.state || 'Karnataka',
      pincode: initialBiz?.operatingAddress.pincode || '560022',
      tier: initialBiz?.operatingAddress.tier || 'TIER_1',
    };
  });

  // Edit Modal State
  const [isEditing, setIsEditing] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [formData, setFormData] = useState(profile);
  const [validationErrors, setValidationErrors] = useState<Record<string, string>>({});

  // Synchronize on mount from backend SQLite database
  useEffect(() => {
    let isMounted = true;
    apiService.getBusinessProfile(bizId)
      .then((bp) => {
        if (bp && isMounted) {
          setProfile((prev: any) => {
            const next = {
              ...prev,
              tradeName: bp.trade_name || prev.tradeName,
              legalName: bp.legal_name || prev.legalName,
              udyamRegistrationNumber: bp.udyam_reg_number || prev.udyamRegistrationNumber,
              gstin: bp.gstin || prev.gstin,
              monthlyTurnover: bp.declared_monthly_turnover != null ? Number(bp.declared_monthly_turnover) : prev.monthlyTurnover,
              existingEmi: bp.declared_existing_monthly_emi != null ? Number(bp.declared_existing_monthly_emi) : prev.existingEmi,
              yearsInOperation: bp.vintage_months ? Math.round(bp.vintage_months / 12) : prev.yearsInOperation,
            };
            try {
              localStorage.setItem(storageKey, JSON.stringify(next));
            } catch (_) {}
            return next;
          });
        }
      })
      .catch((err) => {
        console.warn('Backend business profile sync notice:', err);
      });

    return () => {
      isMounted = false;
    };
  }, [bizId, storageKey]);

  useEffect(() => {
    setFormData(profile);
  }, [profile]);

  const handleOpenEdit = () => {
    setFormData(profile);
    setValidationErrors({});
    setIsEditing(true);
  };

  const handleValidate = () => {
    const errors: Record<string, string> = {};
    if (!formData.tradeName.trim()) {
      errors.tradeName = 'Trade name is required.';
    }
    if (!formData.legalName.trim()) {
      errors.legalName = 'Legal entity name is required.';
    }
    if (Number(formData.monthlyTurnover) < 0 || Number(formData.existingEmi) < 0) {
      errors.financials = 'Turnover and EMI must be non-negative values.';
    }
    if (formData.pincode && !/^\d{6}$/.test(formData.pincode.trim())) {
      errors.pincode = 'PIN Code must be exactly 6 digits.';
    }
    if (Number(formData.yearsInOperation) < 1 || isNaN(Number(formData.yearsInOperation))) {
      errors.yearsInOperation = 'Vintage must be at least 1 year.';
    }
    setValidationErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Explicit check for negative turnover or EMI (Test 2.1 validation requirement)
    if (Number(formData.monthlyTurnover) < 0 || Number(formData.existingEmi) < 0) {
      toast.error('Turnover and EMI must be non-negative values.');
      return;
    }

    if (!formData.tradeName.trim()) {
      toast.error('Trade name cannot be empty.');
      return;
    }

    if (!handleValidate()) {
      toast.error('Please resolve validation errors before saving.');
      return;
    }

    setIsSaving(true);
    try {
      const updatedBackend = await apiService.updateBusinessProfile(bizId, {
        trade_name: formData.tradeName,
        legal_name: formData.legalName,
        declared_monthly_turnover: Number(formData.monthlyTurnover),
        declared_existing_monthly_emi: Number(formData.existingEmi),
        udyam_reg_number: formData.udyamRegistrationNumber,
        gstin: formData.gstin || undefined,
        has_gstin: Boolean(formData.gstin),
        vintage_months: Number(formData.yearsInOperation) * 12,
      });

      const updated = {
        ...formData,
        tradeName: updatedBackend.trade_name || formData.tradeName,
        legalName: updatedBackend.legal_name || formData.legalName,
        monthlyTurnover: Number(updatedBackend.declared_monthly_turnover ?? formData.monthlyTurnover),
        existingEmi: Number(updatedBackend.declared_existing_monthly_emi ?? formData.existingEmi),
        yearsInOperation: Number(formData.yearsInOperation),
      };

      setProfile(updated);
      try {
        localStorage.setItem(storageKey, JSON.stringify(updated));
      } catch (err) {
        console.warn('Failed to save to localStorage:', err);
      }

      setIsEditing(false);
      toast.success('Business profile updated and persisted to SQLite database!');
    } catch (err: any) {
      console.error('Failed to update business profile:', err);
      toast.error(err.message || 'Failed to update business profile');
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="space-y-6 w-full animate-in fade-in duration-300">
      
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-brand-forest/10">
        <div>
          <span className="text-xs font-mono uppercase tracking-wider text-brand-forest font-bold">
            Official Entity Records
          </span>
          <h2 className="text-2xl font-display font-bold text-brand-charcoal mt-1">
            Business Profile & Verified Credentials
          </h2>
          <p className="text-xs text-brand-charcoal/60 mt-0.5">
            Government verified metadata synchronized via Udyam, GSTN, and persistent SQLite database.
          </p>
        </div>

        <Button
          variant="primary"
          size="sm"
          onClick={handleOpenEdit}
          className="gap-2 text-xs font-semibold rounded-full bg-brand-forest text-white hover:bg-brand-forest/90 shrink-0"
        >
          <Edit3 className="w-3.5 h-3.5" />
          <span>Edit Business Profile</span>
        </Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        
        {/* Commercial Registration Card */}
        <Card className="border-brand-forest/15 shadow-soft">
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle className="text-lg font-display font-bold text-brand-charcoal">Commercial Registration</CardTitle>
              <Badge variant="mint">Verified</Badge>
            </div>
          </CardHeader>
          <CardContent className="space-y-4 text-xs">
            <div>
              <span className="text-brand-charcoal/50 block">Trade Name</span>
              <strong className="text-sm text-brand-charcoal block">{profile.tradeName}</strong>
            </div>
            <div>
              <span className="text-brand-charcoal/50 block">Legal Entity Name</span>
              <span className="text-brand-charcoal font-medium">{profile.legalName}</span>
            </div>
            <div className="grid grid-cols-2 gap-2 pt-2 border-t border-brand-forest/10">
              <div>
                <span className="text-brand-charcoal/50 block">Constitution</span>
                <span className="font-semibold text-brand-forest">{profile.constitution}</span>
              </div>
              <div>
                <span className="text-brand-charcoal/50 block">Enterprise Class</span>
                <span className="font-semibold text-brand-forest">{profile.enterpriseClass}</span>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Statutory Identifiers Card */}
        <Card className="border-brand-forest/15 shadow-soft">
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle className="text-lg font-display font-bold text-brand-charcoal">Statutory Identifiers</CardTitle>
              <Badge variant="forest">Active</Badge>
            </div>
          </CardHeader>
          <CardContent className="space-y-4 text-xs">
            <div>
              <span className="text-brand-charcoal/50 block">Udyam Registration</span>
              <span className="font-mono font-bold text-brand-forest block">{profile.udyamRegistrationNumber}</span>
            </div>
            <div>
              <span className="text-brand-charcoal/50 block">Permanent Account Number (PAN)</span>
              <span className="font-mono font-bold text-brand-charcoal block">{profile.pan}</span>
            </div>
            {profile.gstin && (
              <div>
                <span className="text-brand-charcoal/50 block">GSTIN</span>
                <span className="font-mono font-bold text-brand-forest block">{profile.gstin}</span>
              </div>
            )}
            <div className="pt-2 border-t border-brand-forest/10">
              <span className="text-brand-charcoal/50 block">Operating Vintage</span>
              <span className="font-semibold text-brand-charcoal">{profile.yearsInOperation} Years in Commercial Operation</span>
            </div>
          </CardContent>
        </Card>

      </div>

      {/* Declared Baseline Financials Card */}
      <Card className="border-brand-forest/15 shadow-soft bg-gradient-to-br from-white to-brand-forest/5">
        <CardHeader>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Receipt className="w-5 h-5 text-brand-forest" />
              <CardTitle className="text-lg font-display font-bold text-brand-charcoal">Declared Baseline Financials</CardTitle>
            </div>
            <Badge variant="outline" className="border-brand-forest/30 text-brand-forest text-xs font-semibold">
              Self-Reported & Verified
            </Badge>
          </div>
        </CardHeader>
        <CardContent className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
          <div className="p-4 rounded-2xl bg-white border border-brand-forest/10 space-y-1">
            <span className="text-brand-charcoal/70 block font-medium">Declared Monthly Turnover</span>
            <div className="flex items-center gap-1.5">
              <span className="text-xl font-display font-bold text-brand-forest">
                ₹{Number(profile.monthlyTurnover || 0).toLocaleString('en-IN')}
              </span>
              <span className="text-xs text-brand-charcoal/60 font-mono">/ month</span>
            </div>
            <p className="text-xs text-brand-charcoal/65 pt-1">
              Used as upper baseline benchmark for working capital calibration.
            </p>
          </div>

          <div className="p-4 rounded-2xl bg-white border border-brand-forest/10 space-y-1">
            <span className="text-brand-charcoal/70 block font-medium">Declared Existing Monthly EMI</span>
            <div className="flex items-center gap-1.5">
              <span className="text-xl font-display font-bold text-brand-charcoal">
                ₹{Number(profile.existingEmi || 0).toLocaleString('en-IN')}
              </span>
              <span className="text-xs text-brand-charcoal/60 font-mono">/ month</span>
            </div>
            <p className="text-xs text-brand-charcoal/65 pt-1">
              Factored into Debt Service Coverage Ratio (DSCR) calculations.
            </p>
          </div>
        </CardContent>
      </Card>

      {/* Geotagged Operating Location Card */}
      <Card className="border-brand-forest/15 shadow-soft">
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="text-lg font-display font-bold text-brand-charcoal">Geotagged Establishment Address</CardTitle>
            <span className="text-xs text-brand-forest font-semibold flex items-center gap-1">
              <CheckCircle2 className="w-3.5 h-3.5" /> Registry Confirmed
            </span>
          </div>
        </CardHeader>
        <CardContent className="text-xs space-y-2">
          <div className="flex items-start gap-2.5">
            <MapPin className="w-4 h-4 text-brand-forest shrink-0 mt-0.5" />
            <div>
              <p className="text-brand-charcoal font-medium">
                {profile.street}, {profile.city}, {profile.state} — {profile.pincode}
              </p>
              <span className="text-[10px] text-brand-charcoal/50 font-mono block mt-1">
                Classification: {profile.tier} Cluster · Verification: Digital Public Registry Match
              </span>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Edit Profile Modal */}
      {isEditing && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-brand-charcoal/60 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="w-full max-w-lg bg-white rounded-3xl border border-brand-forest/20 shadow-elevated p-6 sm:p-8 space-y-5 max-h-[90vh] overflow-y-auto">
            
            <div className="flex items-center justify-between pb-3 border-b border-brand-forest/10">
              <div>
                <h3 className="font-display font-bold text-lg text-brand-charcoal">
                  Edit Business Profile
                </h3>
                <p className="text-xs text-brand-charcoal/60">
                  Update your official trade registration, declared financials, and establishment address.
                </p>
              </div>
              <button
                onClick={() => setIsEditing(false)}
                className="w-7 h-7 rounded-full bg-brand-charcoal/10 hover:bg-brand-charcoal/20 flex items-center justify-center text-brand-charcoal"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleSave} className="space-y-4 text-xs">
              
              {/* Trade Name */}
              <div className="space-y-1">
                <label className="font-semibold text-brand-charcoal block">Trade Name *</label>
                <Input
                  value={formData.tradeName}
                  onChange={(e) => setFormData({ ...formData, tradeName: e.target.value })}
                  placeholder="e.g. Kavitha Handloom & Silks"
                  className="text-xs h-9 rounded-xl"
                  required
                />
                {validationErrors.tradeName && (
                  <span className="text-[11px] text-rose-600 flex items-center gap-1 mt-0.5">
                    <AlertCircle className="w-3 h-3" /> {validationErrors.tradeName}
                  </span>
                )}
              </div>

              {/* Legal Name */}
              <div className="space-y-1">
                <label className="font-semibold text-brand-charcoal block">Legal Entity Name</label>
                <Input
                  value={formData.legalName}
                  onChange={(e) => setFormData({ ...formData, legalName: e.target.value })}
                  placeholder="e.g. ArtisanKraft Crafts LLP"
                  className="text-xs h-9 rounded-xl"
                />
                {validationErrors.legalName && (
                  <span className="text-[11px] text-rose-600 flex items-center gap-1 mt-0.5">
                    <AlertCircle className="w-3 h-3" /> {validationErrors.legalName}
                  </span>
                )}
              </div>

              {/* Declared Monthly Turnover & Existing EMI */}
              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="font-semibold text-brand-charcoal block">Declared Monthly Turnover (₹) *</label>
                  <Input
                    type="number"
                    value={formData.monthlyTurnover}
                    onChange={(e) => setFormData({ ...formData, monthlyTurnover: Number(e.target.value) })}
                    placeholder="250000"
                    className="text-xs h-9 rounded-xl"
                    required
                  />
                </div>

                <div className="space-y-1">
                  <label className="font-semibold text-brand-charcoal block">Declared Existing EMI (₹) *</label>
                  <Input
                    type="number"
                    value={formData.existingEmi}
                    onChange={(e) => setFormData({ ...formData, existingEmi: Number(e.target.value) })}
                    placeholder="8500"
                    className="text-xs h-9 rounded-xl"
                    required
                  />
                </div>
              </div>
              {validationErrors.financials && (
                <span className="text-[11px] text-rose-600 flex items-center gap-1 mt-0.5">
                  <AlertCircle className="w-3 h-3" /> {validationErrors.financials}
                </span>
              )}

              {/* Udyam Registration & GSTIN */}
              <div className="space-y-1">
                <label className="font-semibold text-brand-charcoal block">Udyam Registration Number</label>
                <Input
                  value={formData.udyamRegistrationNumber}
                  onChange={(e) => setFormData({ ...formData, udyamRegistrationNumber: e.target.value })}
                  placeholder="UDYAM-RJ-10-0081290"
                  className="text-xs h-9 rounded-xl font-mono"
                />
              </div>

              <div className="space-y-1">
                <label className="font-semibold text-brand-charcoal block">GSTIN (Optional)</label>
                <Input
                  value={formData.gstin}
                  onChange={(e) => setFormData({ ...formData, gstin: e.target.value })}
                  placeholder="08AABCU9603R1ZM"
                  className="text-xs h-9 rounded-xl font-mono"
                />
              </div>

              {/* Constitution & Enterprise Class */}
              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="font-semibold text-brand-charcoal block">Constitution</label>
                  <select
                    value={formData.constitution}
                    onChange={(e) => setFormData({ ...formData, constitution: e.target.value as any })}
                    className="w-full h-9 px-3 rounded-xl border border-brand-forest/20 bg-brand-ivory text-xs text-brand-charcoal"
                  >
                    <option value="PROPRIETORSHIP">Proprietorship</option>
                    <option value="PARTNERSHIP">Partnership</option>
                    <option value="PRIVATE_LIMITED">Private Limited</option>
                    <option value="LLP">Limited Liability Partnership (LLP)</option>
                  </select>
                </div>

                <div className="space-y-1">
                  <label className="font-semibold text-brand-charcoal block">Enterprise Class</label>
                  <select
                    value={formData.enterpriseClass}
                    onChange={(e) => setFormData({ ...formData, enterpriseClass: e.target.value as any })}
                    className="w-full h-9 px-3 rounded-xl border border-brand-forest/20 bg-brand-ivory text-xs text-brand-charcoal"
                  >
                    <option value="MICRO">Micro (&lt; ₹1 Cr)</option>
                    <option value="SMALL">Small (₹1 Cr – ₹10 Cr)</option>
                    <option value="MEDIUM">Medium (&gt; ₹10 Cr)</option>
                  </select>
                </div>
              </div>

              {/* Vintage */}
              <div className="space-y-1">
                <label className="font-semibold text-brand-charcoal block">Operating Vintage (Years in Business) *</label>
                <Input
                  type="number"
                  min="1"
                  max="60"
                  value={formData.yearsInOperation}
                  onChange={(e) => setFormData({ ...formData, yearsInOperation: Number(e.target.value) })}
                  className="text-xs h-9 rounded-xl"
                  required
                />
                {validationErrors.yearsInOperation && (
                  <span className="text-[11px] text-rose-600 flex items-center gap-1 mt-0.5">
                    <AlertCircle className="w-3 h-3" /> {validationErrors.yearsInOperation}
                  </span>
                )}
              </div>

              {/* Establishment Address */}
              <div className="space-y-2 pt-2 border-t border-brand-forest/10">
                <span className="font-semibold text-brand-charcoal block">Establishment Address</span>
                
                <div className="space-y-1">
                  <label className="text-brand-charcoal/70 block text-[11px]">Street & Landmark</label>
                  <Input
                    value={formData.street}
                    onChange={(e) => setFormData({ ...formData, street: e.target.value })}
                    placeholder="Shop number, Street, Market"
                    className="text-xs h-9 rounded-xl"
                  />
                </div>

                <div className="grid grid-cols-3 gap-2">
                  <div className="space-y-1">
                    <label className="text-brand-charcoal/70 block text-[11px]">City</label>
                    <Input
                      value={formData.city}
                      onChange={(e) => setFormData({ ...formData, city: e.target.value })}
                      className="text-xs h-9 rounded-xl"
                    />
                  </div>
                  <div className="space-y-1">
                    <label className="text-brand-charcoal/70 block text-[11px]">State</label>
                    <Input
                      value={formData.state}
                      onChange={(e) => setFormData({ ...formData, state: e.target.value })}
                      className="text-xs h-9 rounded-xl"
                    />
                  </div>
                  <div className="space-y-1">
                    <label className="text-brand-charcoal/70 block text-[11px]">PIN Code</label>
                    <Input
                      value={formData.pincode}
                      onChange={(e) => setFormData({ ...formData, pincode: e.target.value })}
                      maxLength={6}
                      className="text-xs h-9 rounded-xl"
                    />
                  </div>
                </div>
                {validationErrors.pincode && (
                  <span className="text-[11px] text-rose-600 flex items-center gap-1 mt-0.5">
                    <AlertCircle className="w-3 h-3" /> {validationErrors.pincode}
                  </span>
                )}
              </div>

              {/* Modal Buttons */}
              <div className="flex justify-end gap-2.5 pt-3 border-t border-brand-forest/10">
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => setIsEditing(false)}
                  className="rounded-full text-xs"
                >
                  Cancel
                </Button>
                <Button
                  type="submit"
                  variant="primary"
                  size="sm"
                  disabled={isSaving}
                  className="rounded-full text-xs font-semibold px-5 bg-brand-forest text-white hover:bg-brand-forest/90 gap-1.5"
                >
                  <Save className="w-3.5 h-3.5" />
                  <span>{isSaving ? 'Saving...' : 'Save & Persist'}</span>
                </Button>
              </div>

            </form>

          </div>
        </div>
      )}

    </div>
  );
};
