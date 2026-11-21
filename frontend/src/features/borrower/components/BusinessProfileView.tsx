import React, { useState, useEffect } from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { PersonaProfile } from '@/types';
import { apiService } from '@/services/apiService';
import { Building2, MapPin, Calendar, CheckCircle2, ShieldCheck, FileCheck, Edit3, X, Save } from 'lucide-react';
import { toast } from 'sonner';

export const BusinessProfileView: React.FC<{ activePersona: PersonaProfile }> = ({ activePersona }) => {
  const [biz, setBiz] = useState(activePersona.business);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isSaving, setIsSaving] = useState(false);

  // Form State
  const [tradeName, setTradeName] = useState(biz?.tradeName || 'Sri Balaji Provisions');
  const [legalName, setLegalName] = useState(biz?.legalName || activePersona.name);
  const [constitution, setConstitution] = useState(biz?.constitution || 'PROPRIETORSHIP');
  const [sector, setSector] = useState(biz?.industrySector || 'RETAIL_KIRANA');
  const [monthlyTurnover, setMonthlyTurnover] = useState(285000);
  const [existingEmi, setExistingEmi] = useState(4500);
  const [udyamReg, setUdyamReg] = useState(biz?.udyamRegistrationNumber || 'UDYAM-KR-03-0048921');
  const [gstin, setGstin] = useState(biz?.gstin || '');

  // Synchronize on mount if backend profile exists
  useEffect(() => {
    const bizId = biz?.id || 'msme_kirana_kanpur_001';
    apiService.getBusinessProfile(bizId)
      .then((bp) => {
        if (bp) {
          setTradeName(bp.trade_name || tradeName);
          setLegalName(bp.legal_name || legalName);
          setMonthlyTurnover(Number(bp.declared_monthly_turnover) || 285000);
          setExistingEmi(Number(bp.declared_existing_monthly_emi) || 4500);
          if (bp.udyam_reg_number) setUdyamReg(bp.udyam_reg_number);
          if (bp.gstin) setGstin(bp.gstin);
          setBiz((prev) => prev ? {
            ...prev,
            tradeName: bp.trade_name || prev.tradeName,
            legalName: bp.legal_name || prev.legalName,
          } : prev);
        }
      })
      .catch(() => {});
  }, [biz?.id]);

  const handleSaveProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!tradeName.trim()) {
      toast.error('Trade name cannot be empty.');
      return;
    }
    if (monthlyTurnover < 0 || existingEmi < 0) {
      toast.error('Turnover and EMI must be non-negative values.');
      return;
    }

    setIsSaving(true);
    const bizId = biz?.id || 'msme_kirana_kanpur_001';
    try {
      const updated = await apiService.updateBusinessProfile(bizId, {
        trade_name: tradeName,
        legal_name: legalName,
        declared_monthly_turnover: monthlyTurnover,
        declared_existing_monthly_emi: existingEmi,
        udyam_reg_number: udyamReg,
        gstin: gstin || undefined,
        has_gstin: Boolean(gstin),
      });

      setBiz((prev) => prev ? {
        ...prev,
        tradeName: updated.trade_name,
        legalName: updated.legal_name,
        udyamRegistrationNumber: updated.udyam_reg_number || prev.udyamRegistrationNumber,
        gstin: updated.gstin || undefined,
      } : prev);

      if (updated.declared_monthly_turnover) {
        setMonthlyTurnover(Number(updated.declared_monthly_turnover));
      }
      if (updated.declared_existing_monthly_emi) {
        setExistingEmi(Number(updated.declared_existing_monthly_emi));
      }

      toast.success('Business profile updated and persisted to SQLite database!');
      setIsEditModalOpen(false);
    } catch (err: any) {
      toast.error(err.message || 'Failed to update business profile');
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="space-y-6 max-w-4xl mx-auto animate-in fade-in duration-300">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <span className="text-xs font-mono uppercase tracking-wider text-brand-forest font-bold">
            Official Entity Records
          </span>
          <h2 className="text-2xl font-display font-bold text-brand-charcoal mt-1">
            Business Profile & Verified Credentials
          </h2>
          <p className="text-xs text-brand-charcoal/60 mt-0.5">
            Government verified metadata synchronized via Udyam and Ministry of Corporate Affairs.
          </p>
        </div>

        <Button
          variant="outline"
          size="sm"
          onClick={() => setIsEditModalOpen(true)}
          className="gap-1.5 border-brand-forest/20 text-brand-forest hover:bg-brand-forest/10"
        >
          <Edit3 className="w-3.5 h-3.5" />
          <span>Edit Profile</span>
        </Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        
        {/* Entity Card */}
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle className="text-lg">Commercial Registration</CardTitle>
              <Badge variant="mint">Verified</Badge>
            </div>
          </CardHeader>
          <CardContent className="space-y-4 text-xs">
            <div>
              <span className="text-brand-charcoal/50 block">Trade Name</span>
              <strong className="text-sm text-brand-charcoal block">{biz?.tradeName || 'Sri Balaji Provisions'}</strong>
            </div>
            <div>
              <span className="text-brand-charcoal/50 block">Legal Entity Name</span>
              <span className="text-brand-charcoal font-medium">{biz?.legalName || activePersona.name}</span>
            </div>
            <div className="grid grid-cols-2 gap-2 pt-2 border-t border-brand-forest/10">
              <div>
                <span className="text-brand-charcoal/50 block">Constitution</span>
                <span className="font-semibold text-brand-forest">{biz?.constitution || 'PROPRIETORSHIP'}</span>
              </div>
              <div>
                <span className="text-brand-charcoal/50 block">Enterprise Class</span>
                <span className="font-semibold text-brand-forest">{biz?.enterpriseClass || 'MICRO'}</span>
              </div>
            </div>
            <div className="pt-2 border-t border-brand-forest/10">
              <span className="text-brand-charcoal/50 block">Declared Monthly Turnover</span>
              <span className="font-mono font-bold text-brand-forest">₹{monthlyTurnover.toLocaleString('en-IN')}</span>
            </div>
          </CardContent>
        </Card>

        {/* Tax & Identification */}
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle className="text-lg">Statutory Identifiers</CardTitle>
              <Badge variant="forest">Active</Badge>
            </div>
          </CardHeader>
          <CardContent className="space-y-4 text-xs">
            <div>
              <span className="text-brand-charcoal/50 block">Udyam Registration</span>
              <span className="font-mono font-bold text-brand-forest block">{biz?.udyamRegistrationNumber || 'UDYAM-KR-03-0048921'}</span>
            </div>
            <div>
              <span className="text-brand-charcoal/50 block">Permanent Account Number (PAN)</span>
              <span className="font-mono font-bold text-brand-charcoal block">{biz?.pan || 'BPLPK8912M'}</span>
            </div>
            {biz?.gstin && (
              <div>
                <span className="text-brand-charcoal/50 block">GSTIN</span>
                <span className="font-mono font-bold text-brand-forest block">{biz.gstin}</span>
              </div>
            )}
            <div className="pt-2 border-t border-brand-forest/10">
              <span className="text-brand-charcoal/50 block">Declared Existing EMI</span>
              <span className="font-mono font-bold text-brand-terracotta">₹{existingEmi.toLocaleString('en-IN')} / month</span>
            </div>
          </CardContent>
        </Card>

      </div>

      {/* Operating Location Card */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Geotagged Establishment Address</CardTitle>
        </CardHeader>
        <CardContent className="text-xs space-y-2">
          <div className="flex items-start gap-2.5">
            <MapPin className="w-4 h-4 text-brand-forest shrink-0 mt-0.5" />
            <div>
              <p className="text-brand-charcoal font-medium">
                {biz?.operatingAddress?.street || '14 Market Road, Gandhi Nagar'}, {biz?.operatingAddress?.city || 'Hubli'}, {biz?.operatingAddress?.state || 'Karnataka'} — {biz?.operatingAddress?.pincode || '580020'}
              </p>
              <span className="text-[10px] text-brand-charcoal/50 font-mono block mt-1">
                Tier: {biz?.operatingAddress?.tier || 'TIER_2'} · Geolocation Lat/Long: 15.3647° N, 75.1240° E (Accuracy ~4m)
              </span>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Edit Profile Modal */}
      {isEditModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-brand-charcoal/60 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="w-full max-w-lg bg-white rounded-3xl border border-brand-forest/20 shadow-elevated p-6 space-y-4 text-brand-charcoal">
            <div className="flex items-center justify-between pb-3 border-b border-brand-forest/10">
              <div className="flex items-center gap-2">
                <Building2 className="w-5 h-5 text-brand-forest" />
                <h3 className="font-display font-bold text-base">Edit Business Profile</h3>
              </div>
              <button
                onClick={() => setIsEditModalOpen(false)}
                className="w-8 h-8 rounded-full bg-brand-forest/10 hover:bg-brand-forest/20 flex items-center justify-center text-brand-charcoal"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleSaveProfile} className="space-y-3.5 text-xs">
              <div>
                <label className="font-semibold block mb-1">Trade Name *</label>
                <Input
                  value={tradeName}
                  onChange={(e) => setTradeName(e.target.value)}
                  placeholder="e.g. Sri Balaji Provisions"
                  required
                />
              </div>

              <div>
                <label className="font-semibold block mb-1">Legal Entity Name</label>
                <Input
                  value={legalName}
                  onChange={(e) => setLegalName(e.target.value)}
                  placeholder="e.g. Ramesh Kumar"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="font-semibold block mb-1">Declared Monthly Turnover (₹) *</label>
                  <Input
                    type="number"
                    min="0"
                    value={monthlyTurnover}
                    onChange={(e) => setMonthlyTurnover(Number(e.target.value))}
                    required
                  />
                </div>
                <div>
                  <label className="font-semibold block mb-1">Declared Existing EMI (₹) *</label>
                  <Input
                    type="number"
                    min="0"
                    value={existingEmi}
                    onChange={(e) => setExistingEmi(Number(e.target.value))}
                    required
                  />
                </div>
              </div>

              <div>
                <label className="font-semibold block mb-1">Udyam Registration Number</label>
                <Input
                  value={udyamReg}
                  onChange={(e) => setUdyamReg(e.target.value)}
                  placeholder="UDYAM-XX-00-0000000"
                />
              </div>

              <div>
                <label className="font-semibold block mb-1">GSTIN (Optional)</label>
                <Input
                  value={gstin}
                  onChange={(e) => setGstin(e.target.value)}
                  placeholder="e.g. 29ABCDE1234F1Z5"
                />
              </div>

              <div className="flex justify-end gap-2 pt-3 border-t border-brand-forest/10">
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => setIsEditModalOpen(false)}
                >
                  Cancel
                </Button>
                <Button
                  type="submit"
                  variant="primary"
                  size="sm"
                  disabled={isSaving}
                  className="gap-1.5 bg-brand-forest text-white"
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
