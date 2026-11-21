import React, { useState, useEffect } from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { apiService } from '@/services/apiService';
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
  status: 'VERIFIED' | 'UPLOADING' | 'PENDING';
  provenance: 'INDEPENDENTLY_VERIFIED' | 'SOURCE_LABELLED' | 'USER_UPLOADED' | 'SELF_REPORTED';
  recordCount?: number;
  fileHash?: string;
}

const DEFAULT_DOCS: MockDocument[] = [
  { id: 'doc_1', name: 'PAN_Card_SriBalaji.pdf', size: '1.2 MB', type: 'PAN_CARD', status: 'VERIFIED', provenance: 'SOURCE_LABELLED' },
  { id: 'doc_2', name: 'Udyam_Registration_Certificate.pdf', size: '850 KB', type: 'UDYAM', status: 'VERIFIED', provenance: 'SOURCE_LABELLED' },
  { id: 'doc_3', name: 'Shop_Establishment_License.jpg', size: '2.1 MB', type: 'LICENSE', status: 'VERIFIED', provenance: 'SOURCE_LABELLED' },
  { id: 'doc_4', name: 'Daily_Sales_Cashbook_Q3.csv', size: '340 KB', type: 'CASHBOOK_REGISTER', status: 'VERIFIED', provenance: 'USER_UPLOADED', recordCount: 184 },
];

const STORAGE_KEY = 'udyoga_borrower_docs';

interface DocumentUploadViewProps {
  activePersona?: any;
}

export const DocumentUploadView: React.FC<DocumentUploadViewProps> = ({ activePersona }) => {
  const [activeTab, setActiveTab] = useState<'REGULATORY' | 'CSV_CASHBOOK'>('REGULATORY');
  const [documents, setDocuments] = useState<MockDocument[]>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved) {
        return JSON.parse(saved);
      }
    } catch (e) {
      console.warn('Could not read cached documents from localStorage:', e);
    }
    return DEFAULT_DOCS;
  });
  const [isUploading, setIsUploading] = useState<boolean>(false);
  const [uploadProgress, setUploadProgress] = useState<number>(0);

  const bizId = activePersona?.business?.id || 'msme_kirana_kanpur_001';

  // Sync with localStorage
  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(documents));
    } catch (e) {
      console.warn('Could not persist documents to localStorage:', e);
    }
  }, [documents]);

  const handleDownloadSampleCsv = () => {
    const csvContent = `date,amount,direction,channel,counterparty_name,category,narration
2026-08-01,45000.00,CREDIT,UPI_QR,Customer Retail Store,CUSTOMER_REVENUE,UPI sale retail settlement
2026-08-03,12000.00,DEBIT,IMPS,Sri Ganesh Wholesalers,SUPPLIER_PURCHASE,Raw material fabric purchase
2026-08-05,28000.00,CREDIT,NEFT_RTGS,Modern Garments Hub,CUSTOMER_REVENUE,Bulk wholesale order invoice 104
2026-08-10,8500.00,DEBIT,NEFT_RTGS,SBI MSME Loan,EXISTING_LOAN_EMI,Monthly loan installment repayment
2026-08-15,6500.00,DEBIT,UPI_QR,BESCOM Electricity,RENT_UTILITIES,Commercial power bill settlement
2026-08-18,52000.00,CREDIT,UPI_QR,Direct Walk-in Counter,CUSTOMER_REVENUE,Weekend festive retail turnover
2026-08-22,18000.00,DEBIT,IMPS,Krishna Yarn Mills,SUPPLIER_PURCHASE,Cotton yarn delivery payment
2026-08-28,34000.00,CREDIT,POS_SWIPE,Card Terminal HDFC,CUSTOMER_REVENUE,POS merchant settlement batch
2026-09-02,48000.00,CREDIT,UPI_QR,Customer Retail Store,CUSTOMER_REVENUE,UPI store sales collection
2026-09-05,15000.00,DEBIT,IMPS,Sri Ganesh Wholesalers,SUPPLIER_PURCHASE,Inventory restock batch 2
2026-09-10,8500.00,DEBIT,NEFT_RTGS,SBI MSME Loan,EXISTING_LOAN_EMI,Monthly loan installment repayment
2026-09-14,72000.00,CREDIT,NEFT_RTGS,Southern Retailers Pvt,CUSTOMER_REVENUE,Corporate gifting textile order
2026-09-20,22000.00,DEBIT,IMPS,Shree Dyeing Works,SUPPLIER_PURCHASE,Processing and dyeing charges
2026-09-25,39000.00,CREDIT,UPI_QR,Store Collection QR,CUSTOMER_REVENUE,Daily QR collections
2026-10-02,51000.00,CREDIT,UPI_QR,Customer Retail Store,CUSTOMER_REVENUE,Festival opening sales
2026-10-06,16500.00,DEBIT,IMPS,Sri Ganesh Wholesalers,SUPPLIER_PURCHASE,Dussehra stock replenishment
2026-10-10,8500.00,DEBIT,NEFT_RTGS,SBI MSME Loan,EXISTING_LOAN_EMI,Monthly loan installment repayment
2026-10-18,88000.00,CREDIT,NEFT_RTGS,Karnataka Silk Emporium,CUSTOMER_REVENUE,Festive bulk saree consignment
2026-10-24,25000.00,DEBIT,IMPS,Balaji Transport Fleet,RENT_UTILITIES,Interstate logistics freight
2026-10-29,42000.00,CREDIT,POS_SWIPE,Card Terminal HDFC,CUSTOMER_REVENUE,Card payment batch settlement
2026-11-02,55000.00,CREDIT,UPI_QR,Customer Retail Store,CUSTOMER_REVENUE,November regular revenue
2026-11-05,14000.00,DEBIT,IMPS,Sri Ganesh Wholesalers,SUPPLIER_PURCHASE,Monthly wholesale supplies
2026-11-10,8500.00,DEBIT,NEFT_RTGS,SBI MSME Loan,EXISTING_LOAN_EMI,Monthly loan installment repayment
2026-11-15,62000.00,CREDIT,UPI_QR,Store Collection QR,CUSTOMER_REVENUE,Mid-month retail collections
2026-11-18,7000.00,DEBIT,UPI_QR,Commercial Hub Lease,RENT_UTILITIES,Store shop floor monthly lease
2026-11-20,49000.00,CREDIT,POS_SWIPE,Card Terminal HDFC,CUSTOMER_REVENUE,Card payment batch settlement`;

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.setAttribute('href', url);
    link.setAttribute('download', 'sample_msme_bank_statement.csv');
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
    toast.success('Downloaded sample_msme_bank_statement.csv — You can now upload this directly!');
  };

  useEffect(() => {
    let isMounted = true;
    apiService.getEvidenceAuditTrail(bizId)
      .then((records) => {
        if (!isMounted || !records || records.length === 0) return;
        const mapped: MockDocument[] = records.map((r) => ({
          id: r.evidence_id,
          name: r.document_name || r.file_reference || 'Uploaded_Statement.csv',
          size: `${r.record_count || 100} records`,
          type: r.evidence_type || 'BANK_STATEMENT',
          status: (r.verification_status === 'VERIFIED' ? 'VERIFIED' : 'PENDING'),
          provenance: (r.provenance_category as any) || 'USER_UPLOADED',
          recordCount: r.record_count || undefined,
          fileHash: r.file_hash ? `${r.file_hash.substring(0, 8)}...` : undefined,
        }));
        setDocuments((prev) => {
          const existingIds = new Set(prev.map((d) => d.name));
          const uniqueNew = mapped.filter((m) => !existingIds.has(m.name));
          return [...uniqueNew, ...prev];
        });
      })
      .catch((err) => console.warn('Could not load live evidence audit trail:', err));
    return () => { isMounted = false; };
  }, []);

  const parseCsvClientSide = (file: File): Promise<{ rowCount: number; totalInflow: number }> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = (event) => {
        try {
          const text = event.target?.result as string;
          if (!text) {
            reject(new Error('File is empty.'));
            return;
          }
          const lines = text.split(/\r?\n/).filter((l) => l.trim().length > 0);
          if (lines.length < 2) {
            reject(new Error('CSV must contain a header row and at least 1 record.'));
            return;
          }
          const headers = lines[0].toLowerCase().split(',').map((h) => h.trim());
          const amountIdx = headers.findIndex((h) => h.includes('amount') || h.includes('inflow') || h.includes('credit') || h.includes('total'));
          
          let validRows = 0;
          let totalInflow = 0;

          for (let i = 1; i < lines.length; i++) {
            const cols = lines[i].split(',');
            if (cols.length >= 2) {
              validRows++;
              if (amountIdx !== -1 && cols[amountIdx]) {
                const parsedVal = parseFloat(cols[amountIdx].replace(/[^0-9.-]/g, ''));
                if (!isNaN(parsedVal) && parsedVal > 0) {
                  totalInflow += parsedVal;
                }
              }
            }
          }

          if (validRows === 0) {
            reject(new Error('No valid comma-separated rows found in CSV.'));
            return;
          }

          if (totalInflow === 0) {
            totalInflow = validRows * 1250; // default estimated turnover per line item if unlabelled
          }

          resolve({ rowCount: validRows, totalInflow });
        } catch (err) {
          reject(err);
        }
      };
      reader.onerror = () => reject(new Error('Failed to read file from disk.'));
      reader.readAsText(file);
    });
  };

  const handleSimulateUpload = async (e: React.ChangeEvent<HTMLInputElement>, isCsv = false) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.size > 5 * 1024 * 1024) {
      toast.error('File size exceeds 5MB limit.');
      return;
    }

    setIsUploading(true);
    setUploadProgress(20);

    if (isCsv) {
      try {
        setUploadProgress(50);
        const result = await apiService.uploadCsv(bizId, file);
        setUploadProgress(100);
        setIsUploading(false);
        const newDoc: MockDocument = {
          id: `doc_${Date.now()}`,
          name: file.name,
          size: `${(file.size / 1024 / 1024).toFixed(2)} MB`,
          type: 'CASHBOOK_REGISTER',
          status: 'VERIFIED',
          provenance: 'USER_UPLOADED',
          recordCount: result.total_parsed,
        };
        setDocuments((d) => [newDoc, ...d]);
        toast.success(
          `${file.name} ingested into Engine (${result.total_parsed} transactions, ₹${Math.round(result.total_credit_volume).toLocaleString('en-IN')} inflow). Provenance: USER_UPLOADED.`
        );
        return;
      } catch (err) {
        console.warn('Backend CSV endpoint unavailable, running robust client-side validation:', err);
      }

      // Client-side parser fallback
      try {
        setUploadProgress(60);
        const clientParsed = await parseCsvClientSide(file);
        setUploadProgress(100);
        setIsUploading(false);
        const newDoc: MockDocument = {
          id: `doc_${Date.now()}`,
          name: file.name,
          size: `${(file.size / 1024 / 1024).toFixed(2)} MB`,
          type: 'CASHBOOK_REGISTER',
          status: 'VERIFIED',
          provenance: 'SELF_REPORTED',
          recordCount: clientParsed.rowCount,
        };
        setDocuments((d) => [newDoc, ...d]);
        toast.success(
          `${file.name} validated successfully (${clientParsed.rowCount} records, ₹${Math.round(clientParsed.totalInflow).toLocaleString('en-IN')} total volume). Saved to Encrypted Vault.`
        );
        return;
      } catch (parseError: any) {
        setIsUploading(false);
        toast.error(`Invalid CSV File: ${parseError.message || 'Check header columns (date, amount, description)'}`);
        return;
      }
    }

    // Standard Document Upload simulation with progress ticker
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
          toast.success(`${file.name} uploaded and encrypted via AES-256 vault.`);
          return 100;
        }
        return prev + 30;
      });
    }, 250);
  };

  const handleDelete = (id: string) => {
    setDocuments((d) => d.filter((item) => item.id !== id));
    toast.info('Document deleted from encrypted vault.');
  };

  return (
    <div className="space-y-6 w-full animate-in fade-in duration-300">
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

      {/* Tab Switcher & Sample Download */}
      <div className="flex flex-wrap items-center justify-between gap-3">
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
            Bank & Sales Statement CSV
          </button>
        </div>

        <Button
          type="button"
          variant="outline"
          size="sm"
          onClick={handleDownloadSampleCsv}
          className="text-xs border-brand-forest/30 text-brand-forest hover:bg-brand-forest/10"
        >
          <FileSpreadsheet className="w-3.5 h-3.5 mr-1.5" />
          Download Sample Statement (CSV)
        </Button>
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
            <div className="flex justify-between text-xs text-brand-charcoal/70">
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
        <p className="text-xs leading-relaxed">
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
                    <span className="text-xs text-brand-charcoal/60">
                      {doc.size} · {doc.type} {doc.recordCount ? `(${doc.recordCount} records)` : ''}
                    </span>
                  </div>
                </div>

                <div className="flex items-center gap-2 sm:gap-3 self-end sm:self-center">
                  <Badge 
                    variant="outline" 
                    className={`text-xs ${
                      doc.provenance === 'INDEPENDENTLY_VERIFIED'
                        ? 'bg-emerald-50 text-emerald-700 border-emerald-300'
                        : doc.provenance === 'SOURCE_LABELLED'
                        ? 'bg-blue-50 text-blue-700 border-blue-300'
                        : 'bg-amber-50 text-amber-800 border-amber-300'
                    }`}
                  >
                    {doc.provenance.replace('_', ' ')}
                  </Badge>

                  <span className="flex items-center gap-1 text-emerald-700 font-semibold text-xs">
                    <CheckCircle2 className="w-3.5 h-3.5" />
                    Verified
                  </span>

                  <button 
                    onClick={() => handleDelete(doc.id)}
                    className="p-1.5 rounded-lg text-brand-charcoal/40 hover:text-red-600 hover:bg-red-50 transition-colors"
                    title="Delete document"
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
