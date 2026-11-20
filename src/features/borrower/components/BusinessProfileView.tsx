import React from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { PersonaProfile } from '@/types';
import { Building2, MapPin, Calendar, CheckCircle2, ShieldCheck, FileCheck } from 'lucide-react';

export const BusinessProfileView: React.FC<{ activePersona: PersonaProfile }> = ({ activePersona }) => {
  const biz = activePersona.business;

  return (
    <div className="space-y-6 max-w-4xl mx-auto animate-in fade-in duration-300">
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
              <span className="text-brand-charcoal/50 block">Operating Vintage</span>
              <span className="font-semibold text-brand-charcoal">{biz?.yearsInOperation || 7} Years in Commercial Operation</span>
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
                {biz?.operatingAddress.street}, {biz?.operatingAddress.city}, {biz?.operatingAddress.state} — {biz?.operatingAddress.pincode}
              </p>
              <span className="text-[10px] text-brand-charcoal/50 font-mono block mt-1">
                Classification: {biz?.operatingAddress.tier} Cluster · Verification: Digital Public Registry Match
              </span>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};
