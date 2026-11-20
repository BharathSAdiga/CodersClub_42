import React, { useState } from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { 
  UploadCloud, 
  FileText, 
  CheckCircle2, 
  Lock, 
  AlertCircle, 
  Trash2, 
  FileSpreadsheet, 
  ShieldAlert,
  Info
} from 'lucide-react';
import { toast } from 'sonner';

interface MockDocument {
  id: string;
  name: string;
  size: string;
  type: string;
  status: 'VERIFIED' | 'UPLOADING';
  provenance: 'INDEPENDENTLY_VERIFIED' | 'SOURCE_LABELLED' | 'SELF_REPORTED';
  recordCount?: number;
}

export const DocumentUploadView: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'REGULATORY' | 'CSV_CASHBOOK'>('REGULATORY');
  const [documents, setDocuments] = useState<MockDocument[]>([
    { id: 'doc_1', name: 'PAN_Card_SriBalaji.pdf', size: '1.2 MB', type: 'PAN_CARD', status: 'VERIFIED', provenance: 'INDEPENDENTLY_VERIFIED' },
    { id: 'doc_2', name: 'Udyam_Registration_Certificate.pdf', size: '850 KB', type: 'UDYAM', status: 'VERIFIED', provenance: 'INDEPENDENTLY_VERIFIED' },
    { id: 'doc_3', name: 'Shop_Establishment_License.jpg', size: '2.1 MB', type: 'LICENSE', status: 'VERIFIED', provenance: 'INDEPENDENTLY_VERIFIED' },
    { id: 'doc_4', name: 'Daily_Sales_Cashbook_Q3.csv', size: '340 KB', type: 'CASHBOOK_REGISTER', status: 'VERIFIED', provenance: 'SELF_REPORTED', recordCount: 184 },
  ]);
  const [isUploading, setIsUploading] = useState<boolean>(false);
  const [uploadProgress, setUploadProgress] = useState<number>(0);

  const handleSimulateUpload = (e: React.ChangeEvent<HTMLInputElement>, isCsv = false) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.size > 5 * 1024 * 1024) {
      toast.error('File size exceeds 5MB limit.');
      return;
    }

    setIsUploading(true);
    setUploadProgress(20);

    const interval = setInterval(() => {
      setUploadProgress((prev) => {
        if (prev >= 100) {
          clearInterval(interval);
          setIsUploading(false);
          const newDoc: MockDocument = {
            id: `doc_${Date.now()}`,
            name: file.name,
            size: `${(file.size / 1024 / 1024).toFixed(2)} MB`,
            type: isCsv ? 'CASHBOOK_REGISTER' : 'ADDITIONAL_DOC',
            status: 'VERIFIED',
            provenance: isCsv ? 'SELF_REPORTED' : 'SOURCE_LABELLED',
            recordCount: isCsv ? Math.floor(Math.random() * 200) + 50 : undefined,
          };
          setDocuments((d) => [newDoc, ...d]);
          toast.success(
            isCsv 
              ? `${file.name} ingested as self-reported offline transactions (${newDoc.recordCount} rows).` 
              : `${file.name} uploaded and encrypted via AES-256.`
          );
          return 100;
        }
        return prev + 30;
      });
    }, 250);
  };

  const handleDelete = (id: string) => {
    setDocuments((d) => d.filter((item) => item.id !== id));
    toast.info('Document deleted from encrypted storage.');
  };

  return (
    <div className="space-y-6 max-w-4xl mx-auto animate-in fade-in duration-300">
      <div>
        <span className="text-xs font-mono uppercase tracking-wider text-brand-forest font-bold">
          Encrypted Storage & Evidence Provenance
        </span>
        <h2 className="text-2xl font-display font-bold text-brand-charcoal mt-1">
          Document Vault & Transaction CSV Ingestion
        </h2>
        <p className="text-xs text-brand-charcoal/60 mt-0.5">
          All files are client-side verified and encrypted with AES-256. Data provenance is tracked per RBI Fair Practices.
        </p>
      </div>

      {/* Tab Switcher: Regulatory KYC vs CSV Cashbook */}
      <div className="flex gap-2 p-1 bg-brand-charcoal/5 rounded-2xl w-fit">
        <button
          onClick={() => setActiveTab('REGULATORY')}
          className={`px-4 py-2 rounded-xl text-xs font-semibold transition-all ${
            activeTab === 'REGULATORY'
              ? 'bg-white text-brand-charcoal shadow-sm'
              : 'text-brand-charcoal/60 hover:text-brand-charcoal'
          }`}
        >
          <FileText className="w-3.5 h-3.5 inline mr-1.5" />
          KYC & Licenses
        </button>
        <button
          onClick={() => setActiveTab('CSV_CASHBOOK')}
          className={`px-4 py-2 rounded-xl text-xs font-semibold transition-all ${
            activeTab === 'CSV_CASHBOOK'
              ? 'bg-white text-brand-forest shadow-sm'
              : 'text-brand-charcoal/60 hover:text-brand-charcoal'
          }`}
        >
          <FileSpreadsheet className="w-3.5 h-3.5 inline mr-1.5" />
          Offline Sales Register & Cashbook CSV
        </button>
      </div>

      {/* Upload Dropzone */}
      <div className="p-8 rounded-3xl bg-white border-2 border-dashed border-brand-forest/25 hover:border-brand-forest transition-colors text-center relative overflow-hidden">
        <input 
          type="file"
          accept={activeTab === 'CSV_CASHBOOK' ? '.csv,.xlsx,.txt' : '.pdf,.png,.jpg,.jpeg'}
          onChange={(e) => handleSimulateUpload(e, activeTab === 'CSV_CASHBOOK')}
          disabled={isUploading}
          className="absolute inset-0 opacity-0 cursor-pointer"
        />
        <div className="w-12 h-12 rounded-2xl bg-brand-forest/10 text-brand-forest flex items-center justify-center mx-auto mb-3">
          {activeTab === 'CSV_CASHBOOK' ? (
            <FileSpreadsheet className="w-6 h-6 text-brand-forest" />
          ) : (
            <UploadCloud className="w-6 h-6" />
          )}
        </div>
        <h4 className="font-display font-bold text-sm text-brand-charcoal">
          {activeTab === 'CSV_CASHBOOK'
            ? 'Upload Offline Sales Register or Cashbook (CSV)'
            : 'Click or drag files to upload KYC & Entity Proofs'}
        </h4>
        <p className="text-xs text-brand-charcoal/50 mt-1">
          {activeTab === 'CSV_CASHBOOK'
            ? 'Format: Date, Amount, Description, Counterparty (Max 5MB)'
            : 'Supported: PDF, JPG, PNG (Max 5MB per file)'}
        </p>

        {isUploading && (
          <div className="mt-4 max-w-xs mx-auto space-y-1">
            <div className="flex justify-between text-[10px] text-brand-charcoal/60">
              <span>Encrypting and validating schema...</span>
              <span className="font-mono">{uploadProgress}%</span>
            </div>
            <div className="w-full bg-brand-forest/10 h-2 rounded-full overflow-hidden">
              <div 
                className="bg-brand-mint h-full transition-all duration-200"
                style={{ width: `${uploadProgress}%` }}
              />
            </div>
          </div>
        )}
      </div>

      {/* Data Provenance Transparency Notice */}
      <div className="p-3.5 rounded-2xl bg-amber-50/70 border border-amber-200 text-xs text-amber-900 flex items-start gap-2.5">
        <Info className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
        <p className="text-[11px] leading-relaxed">
          <strong>Evidence Classification Notice:</strong> Offline CSV cashbooks are ingested as <em>Self-Reported Unverified</em> data. For maximum credit vitality and lowest APR, connect your Account Aggregator (AA) and merchant UPI QR stream for <em>Independently Verified</em> provenance.
        </p>
      </div>

      {/* Document Vault List with Provenance Badges */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="text-lg">Ingested Evidence Artifacts ({documents.length})</CardTitle>
            <span className="text-xs text-brand-forest font-medium flex items-center gap-1">
              <Lock className="w-3.5 h-3.5 text-brand-mint" />
              AES-256 Storage
            </span>
          </div>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {documents.map((doc) => (
              <div key={doc.id} className="flex flex-col sm:flex-row sm:items-center justify-between p-3.5 rounded-2xl bg-brand-ivory border border-brand-forest/10 text-xs gap-3">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-full bg-brand-forest/10 text-brand-forest flex items-center justify-center shrink-0">
                    {doc.type === 'CASHBOOK_REGISTER' ? (
                      <FileSpreadsheet className="w-4 h-4 text-brand-terracotta" />
                    ) : (
                      <FileText className="w-4 h-4" />
                    )}
                  </div>
                  <div>
                    <strong className="text-brand-charcoal block">{doc.name}</strong>
                    <span className="text-[10px] text-brand-charcoal/50">
                      {doc.size} · {doc.type} {doc.recordCount ? `(${doc.recordCount} records)` : ''}
                    </span>
                  </div>
                </div>

                <div className="flex items-center gap-2 sm:gap-3 self-end sm:self-center">
                  <Badge 
                    variant="outline" 
                    className={`text-[10px] ${
                      doc.provenance === 'INDEPENDENTLY_VERIFIED'
                        ? 'bg-emerald-50 text-emerald-700 border-emerald-300'
                        : doc.provenance === 'SOURCE_LABELLED'
                        ? 'bg-blue-50 text-blue-700 border-blue-300'
                        : 'bg-amber-50 text-amber-800 border-amber-300'
                    }`}
                  >
                    {doc.provenance.replace('_', ' ')}
                  </Badge>

                  <span className="flex items-center gap-1 text-emerald-700 font-semibold text-[11px]">
                    <CheckCircle2 className="w-3.5 h-3.5" />
                    Verified
                  </span>

                  <button 
                    onClick={() => handleDelete(doc.id)}
                    className="p-1.5 rounded-lg text-brand-charcoal/40 hover:text-red-600 hover:bg-red-50 transition-colors"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};
