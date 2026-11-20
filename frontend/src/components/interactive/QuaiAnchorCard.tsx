import React, { useState, useEffect } from 'react';
import { quaiService, QuaiAnchorReceipt, QUAI_NETWORK_CONFIG } from '@/services/quaiService';
import { ShieldCheck, ExternalLink, Link2, CheckCircle2, Copy, Sparkles, Layers } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';

interface QuaiAnchorCardProps {
  applicationId: string;
  vitalityScore?: number;
  scoreBand?: string;
  className?: string;
}

export const QuaiAnchorCard: React.FC<QuaiAnchorCardProps> = ({
  applicationId,
  vitalityScore = 742,
  scoreBand = 'PRIME',
  className = '',
}) => {
  const [receipt, setReceipt] = useState<QuaiAnchorReceipt | null>(null);
  const [isCopied, setIsCopied] = useState<boolean>(false);
  const [pelagusAccount, setPelagusAccount] = useState<string | null>(null);

  useEffect(() => {
    let mounted = true;
    quaiService.getAnchorReceipt(applicationId, vitalityScore, scoreBand).then((r) => {
      if (mounted) setReceipt(r);
    });
    return () => {
      mounted = false;
    };
  }, [applicationId, vitalityScore, scoreBand]);

  const handleCopy = (text: string, label: string) => {
    navigator.clipboard.writeText(text);
    setIsCopied(true);
    toast.success(`${label} copied to clipboard`);
    setTimeout(() => setIsCopied(false), 2000);
  };

  const handleConnectPelagus = async () => {
    const acc = await quaiService.connectPelagus();
    if (acc) {
      setPelagusAccount(acc);
      toast.success(`Connected Pelagus Wallet: ${acc.substring(0, 6)}...${acc.substring(acc.length - 4)}`);
    } else {
      toast.info('Pelagus Wallet extension not detected or connection cancelled.');
    }
  };

  if (!receipt) return null;

  return (
    <div className={`p-4 rounded-2xl bg-brand-forest/[0.04] border border-brand-forest/20 space-y-3.5 ${className}`}>
      {/* Top Banner */}
      <div className="flex items-center justify-between pb-3 border-b border-brand-forest/10">
        <div className="flex items-center gap-2">
          <div className="w-6 h-6 rounded-lg bg-brand-forest text-brand-ivory flex items-center justify-center font-bold text-xs">
            Q
          </div>
          <div>
            <div className="flex items-center gap-1.5">
              <span className="font-display font-bold text-xs text-brand-charcoal">
                Quai Network Trust Anchor
              </span>
              <Badge variant="outline" className="border-emerald-600/40 text-emerald-800 bg-emerald-50 text-[10px] py-0 px-1.5">
                Cyprus-1 • Chain ID 15000
              </Badge>
            </div>
            <p className="text-[11px] text-brand-charcoal/60">
              Immutable SHA-256 credit assessment digest confirmed on Quai Orchard testnet.
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          {quaiService.isPelagusAvailable() && !pelagusAccount && (
            <Button
              variant="outline"
              size="sm"
              onClick={handleConnectPelagus}
              className="h-7 text-[11px] px-2 rounded-lg border-brand-forest/30 text-brand-forest hover:bg-brand-forest/10"
            >
              Connect Pelagus
            </Button>
          )}
          {pelagusAccount && (
            <span className="text-[10px] font-mono bg-brand-forest/10 text-brand-forest px-2 py-0.5 rounded-full font-semibold">
              {pelagusAccount.substring(0, 6)}...{pelagusAccount.substring(pelagusAccount.length - 4)}
            </span>
          )}
        </div>
      </div>

      {/* Grid of cryptographic proofs */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
        {/* SHA-256 Digest */}
        <div className="p-2.5 rounded-xl bg-white border border-brand-forest/10 space-y-1">
          <div className="flex items-center justify-between text-[11px] text-brand-charcoal/60">
            <span>Assessment SHA-256 Digest</span>
            <button
              onClick={() => handleCopy(receipt.digestHash, 'Digest')}
              className="hover:text-brand-forest transition-colors"
              title="Copy Digest"
            >
              <Copy className="w-3 h-3" />
            </button>
          </div>
          <div className="font-mono text-[11px] text-brand-forest font-semibold truncate">
            {receipt.digestHash}
          </div>
        </div>

        {/* Quai Transaction Hash */}
        <div className="p-2.5 rounded-xl bg-white border border-brand-forest/10 space-y-1">
          <div className="flex items-center justify-between text-[11px] text-brand-charcoal/60">
            <span>Cyprus-1 Transaction Hash</span>
            <a
              href={receipt.explorerUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="text-brand-forest hover:underline flex items-center gap-1"
              title="View on Quaiscan"
            >
              <ExternalLink className="w-3 h-3" />
            </a>
          </div>
          <div className="font-mono text-[11px] text-brand-charcoal font-semibold truncate">
            {receipt.txHash}
          </div>
        </div>
      </div>

      {/* Verification Footer */}
      <div className="flex items-center justify-between pt-1 text-[11px] text-brand-charcoal/70">
        <div className="flex items-center gap-1.5 text-emerald-800 font-medium">
          <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
          <span>Cryptographically Verified (Block #{receipt.blockNumber})</span>
        </div>
        <a
          href={receipt.explorerUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="text-brand-forest hover:underline flex items-center gap-1 font-semibold"
        >
          <span>Verify on Quaiscan</span>
          <ExternalLink className="w-3 h-3" />
        </a>
      </div>
    </div>
  );
};
