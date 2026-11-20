import React, { useState } from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { UploadCloud, FileText, CheckCircle2, Lock, AlertCircle, Trash2 } from 'lucide-react';
import { toast } from 'sonner';

interface MockDocument {
  id: string;
  name: string;
  size: string;
  type: string;
  status: 'VERIFIED' | 'UPLOADING';
  progress?: number;
}

export const DocumentUploadView: React.FC = () => {
  const [documents, setDocuments] = useState<MockDocument[]>([
    { id: 'doc_1', name: 'PAN_Card_SriBalaji.pdf', size: '1.2 MB', type: 'PAN_CARD', status: 'VERIFIED' },
    { id: 'doc_2', name: 'Udyam_Registration_Certificate.pdf', size: '850 KB', type: 'UDYAM', status: 'VERIFIED' },
    { id: 'doc_3', name: 'Shop_Establishment_License.jpg', size: '2.1 MB', type: 'LICENSE', status: 'VERIFIED' },
  ]);
  const [isUploading, setIsUploading] = useState<boolean>(false);
  const [uploadProgress, setUploadProgress] = useState<number>(0);

  const handleSimulateUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
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
            type: 'ADDITIONAL_DOC',
            status: 'VERIFIED',
          };
          setDocuments((d) => [newDoc, ...d]);
          toast.success(`${file.name} uploaded and encrypted via AES-256.`);
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
          Encrypted Storage
        </span>
        <h2 className="text-2xl font-display font-bold text-brand-charcoal mt-1">
          Document Vault & KYC Artifacts
        </h2>
        <p className="text-xs text-brand-charcoal/60 mt-0.5">
          All files are client-side verified and encrypted with AES-256 before mock ingestion.
        </p>
      </div>

      {/* Upload Dropzone */}
      <div className="p-8 rounded-3xl bg-white border-2 border-dashed border-brand-forest/25 hover:border-brand-forest transition-colors text-center relative overflow-hidden">
        <input 
          type="file"
          accept=".pdf,.png,.jpg,.jpeg"
          onChange={handleSimulateUpload}
          disabled={isUploading}
          className="absolute inset-0 opacity-0 cursor-pointer"
        />
        <div className="w-12 h-12 rounded-2xl bg-brand-forest/10 text-brand-forest flex items-center justify-center mx-auto mb-3">
          <UploadCloud className="w-6 h-6" />
        </div>
        <h4 className="font-display font-bold text-sm text-brand-charcoal">
          Click or drag files to upload
        </h4>
        <p className="text-xs text-brand-charcoal/50 mt-1">
          Supported: PDF, JPG, PNG (Max 5MB per file)
        </p>

        {isUploading && (
          <div className="mt-4 max-w-xs mx-auto space-y-1">
            <div className="flex justify-between text-[10px] text-brand-charcoal/60">
              <span>Encrypting and uploading...</span>
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

      {/* Document Vault List */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="text-lg">Verified Enterprise Documents ({documents.length})</CardTitle>
            <span className="text-xs text-brand-forest font-medium flex items-center gap-1">
              <Lock className="w-3.5 h-3.5 text-brand-mint" />
              AES-256 Storage
            </span>
          </div>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {documents.map((doc) => (
              <div key={doc.id} className="flex items-center justify-between p-3.5 rounded-2xl bg-brand-ivory border border-brand-forest/10 text-xs">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-full bg-brand-forest/10 text-brand-forest flex items-center justify-center">
                    <FileText className="w-4 h-4" />
                  </div>
                  <div>
                    <strong className="text-brand-charcoal block">{doc.name}</strong>
                    <span className="text-[10px] text-brand-charcoal/50">{doc.size} · {doc.type}</span>
                  </div>
                </div>

                <div className="flex items-center gap-3">
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
