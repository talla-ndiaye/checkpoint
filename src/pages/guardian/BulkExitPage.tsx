import { useState, useCallback } from 'react';
import { Scanner, IDetectedBarcode } from '@yudiel/react-qr-scanner';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import {
  LogOut,
  Plus,
  Trash2,
  CheckCircle,
  Loader2,
  Camera,
  Keyboard,
  Users,
  AlertTriangle,
} from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';
import { useNavigate } from 'react-router-dom';
import { useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

interface PendingReceipt {
  code: string;
  visitorName: string;
  visitorId: string;
  alreadyValidated: boolean;
}

export default function BulkExitPage() {
  const navigate = useNavigate();
  const { user, loading } = useAuth();
  const [receipts, setReceipts] = useState<PendingReceipt[]>([]);
  const [currentCode, setCurrentCode] = useState('');
  const [loadingCode, setLoadingCode] = useState(false);
  const [processing, setProcessing] = useState(false);
  const [inputMode, setInputMode] = useState<'camera' | 'manual'>('manual');

  const addReceiptByCode = async (code: string) => {
    const cleanCode = code.toUpperCase().trim();
    if (!cleanCode) return;
    if (receipts.some(r => r.code === cleanCode)) {
      toast.error('Ce code est déjà dans la liste');
      return;
    }

    setLoadingCode(true);
    try {
      // Try parsing JSON from QR code
      let codeToSearch = cleanCode;
      try {
        const parsed = JSON.parse(code);
        if (parsed.code && parsed.type === 'walk_in_receipt') {
          codeToSearch = parsed.code;
        }
      } catch {
        // Not JSON, use as-is
      }

      const { data: visitor, error } = await supabase
        .from('walk_in_visitors')
        .select('id, first_name, last_name, exit_validated, receipt_code')
        .eq('receipt_code', codeToSearch)
        .maybeSingle();

      if (error) throw error;
      if (!visitor) {
        toast.error('Code de reçu non reconnu');
        setLoadingCode(false);
        return;
      }

      setReceipts(prev => [...prev, {
        code: visitor.receipt_code || codeToSearch,
        visitorName: `${visitor.first_name} ${visitor.last_name}`,
        visitorId: visitor.id,
        alreadyValidated: !!visitor.exit_validated
      }]);
      setCurrentCode('');
    } catch {
      toast.error('Erreur lors de la recherche');
    }
    setLoadingCode(false);
  };

  const handleScan = useCallback((result: IDetectedBarcode[]) => {
    if (result.length > 0 && !loadingCode) {
      const code = result[0].rawValue;
      addReceiptByCode(code);
    }
  }, [loadingCode, receipts]);

  const removeReceipt = (code: string) => {
    setReceipts(prev => prev.filter(r => r.code !== code));
  };

  const validateAll = async () => {
    const validReceipts = receipts.filter(r => !r.alreadyValidated);
    if (validReceipts.length === 0) {
      toast.error('Aucun reçu valide à traiter');
      return;
    }

    setProcessing(true);
    try {
      const { data: { user: authUser } } = await supabase.auth.getUser();
      if (!authUser) throw new Error('Non authentifié');

      const { data: guardian } = await supabase
        .from('guardians')
        .select('site_id')
        .eq('user_id', authUser.id)
        .single();

      if (!guardian) throw new Error('Gardien non trouvé');

      let successCount = 0;
      for (const receipt of validReceipts) {
        const { error: updateError } = await supabase
          .from('walk_in_visitors')
          .update({ exit_validated: true, exit_at: new Date().toISOString() })
          .eq('id', receipt.visitorId);

        if (updateError) continue;

        const { error: logError } = await supabase
          .from('access_logs')
          .insert({
            site_id: guardian.site_id,
            scanned_by: authUser.id,
            action_type: 'exit',
            walk_in_visitor_id: receipt.visitorId
          });

        if (!logError) successCount++;
      }

      toast.success(`${successCount} sortie(s) validée(s) sur ${validReceipts.length}`);
      setReceipts([]);
    } catch {
      toast.error('Erreur lors de la validation groupée');
    }
    setProcessing(false);
  };

  const validCount = receipts.filter(r => !r.alreadyValidated).length;

  return (
    <DashboardLayout>
      <div className="max-w-xl mx-auto space-y-8 animate-fade-in">
        {/* Header */}
        <div className="text-center space-y-2">
          <div className="inline-flex items-center justify-center p-3 rounded-2xl bg-warning/10 mb-2">
            <LogOut className="h-8 w-8 text-warning" />
          </div>
          <h1 className="text-3xl font-bold tracking-tight text-foreground">
            Sorties groupées
          </h1>
          <p className="text-muted-foreground">
            Scannez ou saisissez plusieurs codes pour valider les sorties en lot
          </p>
        </div>

        {/* Mode Toggle - Animated */}
        <div className="mode-toggle sticky top-0 z-10 mx-4 md:mx-0">
          <div
            className="mode-toggle-indicator w-1/2"
            style={{ left: inputMode === 'camera' ? '6px' : 'calc(50% - 0px)' }}
          />
          <button
            onClick={() => setInputMode('camera')}
            className={`mode-toggle-btn ${inputMode === 'camera' ? 'text-primary-foreground' : 'text-muted-foreground hover:text-foreground'}`}
          >
            <Camera className="h-4 w-4" />
            Scanner QR
          </button>
          <button
            onClick={() => setInputMode('manual')}
            className={`mode-toggle-btn ${inputMode === 'manual' ? 'text-primary-foreground' : 'text-muted-foreground hover:text-foreground'}`}
          >
            <Keyboard className="h-4 w-4" />
            Saisie manuelle
          </button>
        </div>

        {/* QR Scanner with overlay */}
        {inputMode === 'camera' && (
          <div className="relative rounded-3xl overflow-hidden shadow-2xl ring-4 ring-black/5 bg-black aspect-square max-w-sm mx-auto animate-scale-in">
            <Scanner
              onScan={handleScan}
              formats={['qr_code']}
              allowMultiple={true}
              scanDelay={1000}
              components={{ torch: true }}
              styles={{
                container: { height: '100%' },
                video: { objectFit: 'cover' }
              }}
            />
            {/* Scanner Overlay */}
            <div className="absolute inset-0 pointer-events-none">
              <div className="absolute inset-0 border-[30px] border-black/40" />
              <div className="absolute inset-8 border-2 border-white/30 rounded-2xl">
                <div className="absolute top-0 left-0 w-8 h-8 border-t-4 border-l-4 border-warning rounded-tl-xl" />
                <div className="absolute top-0 right-0 w-8 h-8 border-t-4 border-r-4 border-warning rounded-tr-xl" />
                <div className="absolute bottom-0 left-0 w-8 h-8 border-b-4 border-l-4 border-warning rounded-bl-xl" />
                <div className="absolute bottom-0 right-0 w-8 h-8 border-b-4 border-r-4 border-warning rounded-br-xl" />
                <div className="absolute top-0 left-0 right-0 h-0.5 bg-warning shadow-[0_0_20px_rgba(245,158,11,0.8)] animate-scan-beam" />
              </div>
              <div className="absolute bottom-8 left-0 right-0 text-center">
                <span className="bg-black/80 text-white/90 text-sm px-4 py-2 rounded-full">
                  Scannez un reçu de sortie
                </span>
              </div>
            </div>
          </div>
        )}

        {/* Manual input - Glass card */}
        {inputMode === 'manual' && (
          <div className="glass-card rounded-3xl p-8 max-w-sm mx-auto shadow-xl animate-scale-in">
            <div className="space-y-4">
              <div className="text-center">
                <p className="text-sm font-medium text-muted-foreground">Code du reçu visiteur</p>
              </div>
              <div className="flex gap-3">
                <div className="relative flex-1">
                  <Input
                    placeholder="ABC-123"
                    value={currentCode}
                    onChange={(e) => setCurrentCode(e.target.value.toUpperCase())}
                    onKeyDown={(e) => e.key === 'Enter' && addReceiptByCode(currentCode)}
                    className="text-center text-2xl tracking-[0.15em] font-mono h-14 uppercase bg-background border-2 focus:border-warning/50"
                    maxLength={8}
                  />
                </div>
                <Button
                  onClick={() => addReceiptByCode(currentCode)}
                  disabled={loadingCode || !currentCode.trim()}
                  size="icon"
                  className="h-14 w-14 rounded-xl bg-warning hover:bg-warning/90 transition-all shrink-0 shadow-md"
                >
                  {loadingCode ? <Loader2 className="h-5 w-5 animate-spin" /> : <Plus className="h-5 w-5" />}
                </Button>
              </div>
            </div>
          </div>
        )}

        {/* Receipt list */}
        {receipts.length > 0 && (
          <div className="space-y-4 animate-slide-up">
            {/* List header */}
            <div className="flex items-center justify-between px-1">
              <div className="flex items-center gap-2">
                <Users className="h-5 w-5 text-muted-foreground" />
                <h3 className="text-lg font-bold">Reçus en attente</h3>
                <span className="inline-flex items-center justify-center h-6 w-6 rounded-full bg-primary/10 text-primary text-xs font-bold">
                  {receipts.length}
                </span>
              </div>
              {validCount > 0 && (
                <span className="text-sm text-muted-foreground">
                  {validCount} à valider
                </span>
              )}
            </div>

            {/* Receipt cards */}
            <div className="space-y-2">
              {receipts.map((receipt, index) => (
                <div
                  key={receipt.code}
                  className={`receipt-card ${receipt.alreadyValidated ? 'receipt-card-invalid' : ''}`}
                  style={{ animationDelay: `${index * 50}ms` }}
                >
                  <div className="flex items-center gap-3 min-w-0">
                    <div className={`h-10 w-10 rounded-xl flex items-center justify-center shrink-0 ${receipt.alreadyValidated
                      ? 'bg-destructive/10'
                      : 'bg-warning/10'
                      }`}>
                      {receipt.alreadyValidated
                        ? <AlertTriangle className="h-4 w-4 text-destructive" />
                        : <LogOut className="h-4 w-4 text-warning" />
                      }
                    </div>
                    <div className="min-w-0">
                      <div className="flex items-center gap-2">
                        <span className="font-mono text-sm font-bold tracking-wider">{receipt.code}</span>
                        {receipt.alreadyValidated && (
                          <Badge variant="destructive" className="text-[10px] px-1.5 py-0">Déjà validé</Badge>
                        )}
                      </div>
                      <span className="text-sm text-muted-foreground truncate block">{receipt.visitorName}</span>
                    </div>
                  </div>
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => removeReceipt(receipt.code)}
                    className="h-8 w-8 rounded-lg text-muted-foreground hover:text-destructive hover:bg-destructive/10 transition-colors shrink-0"
                  >
                    <Trash2 className="h-3.5 w-3.5" />
                  </Button>
                </div>
              ))}
            </div>

            {/* Validate button */}
            <Button
              size="lg"
              className={`w-full h-16 text-lg font-bold gap-3 rounded-2xl transition-all ${validCount > 0
                ? 'bg-warning hover:bg-warning/90 shadow-lg'
                : ''
                }`}
              onClick={validateAll}
              disabled={processing || validCount === 0}
            >
              {processing ? (
                <Loader2 className="h-5 w-5 animate-spin" />
              ) : (
                <CheckCircle className="h-5 w-5" />
              )}
              Valider {validCount} sortie{validCount > 1 ? 's' : ''}
            </Button>
          </div>
        )}

        {/* Empty state */}
        {receipts.length === 0 && (
          <div className="text-center py-8 animate-fade-in">
            <div className="inline-flex items-center justify-center h-16 w-16 rounded-2xl bg-muted/50 mb-4">
              <LogOut className="h-7 w-7 text-muted-foreground/40" />
            </div>
            <p className="text-muted-foreground text-sm">
              Scannez ou saisissez des codes de reçu pour commencer
            </p>
          </div>
        )}
      </div>
    </DashboardLayout>
  );
}
