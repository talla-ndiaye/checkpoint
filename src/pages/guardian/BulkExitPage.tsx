import { useState, useCallback } from 'react';
import { Scanner, IDetectedBarcode } from '@yudiel/react-qr-scanner';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import {
  QrCode,
  LogOut,
  Plus,
  Trash2,
  CheckCircle,
  Loader2,
  Camera,
  Keyboard,
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

  useEffect(() => {
    if (!loading && !user) {
      navigate('/auth');
    }
  }, [user, loading, navigate]);

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

  return (
    <DashboardLayout>
      <div className="max-w-2xl mx-auto space-y-6">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-foreground flex items-center justify-center gap-2">
            <LogOut className="h-7 w-7 text-primary" />
            Sorties groupées
          </h1>
          <p className="text-muted-foreground mt-1">
            Scannez ou saisissez plusieurs codes de reçu pour valider les sorties
          </p>
        </div>

        {/* Mode toggle */}
        <div className="flex justify-center gap-2">
          <Button
            variant={inputMode === 'camera' ? 'default' : 'outline'}
            onClick={() => setInputMode('camera')}
            className="gap-2"
          >
            <Camera className="h-4 w-4" />
            Scanner QR
          </Button>
          <Button
            variant={inputMode === 'manual' ? 'default' : 'outline'}
            onClick={() => setInputMode('manual')}
            className="gap-2"
          >
            <Keyboard className="h-4 w-4" />
            Saisie manuelle
          </Button>
        </div>

        {/* QR Scanner */}
        {inputMode === 'camera' && (
          <Card>
            <CardContent className="p-0 overflow-hidden rounded-lg">
              <div className="aspect-square max-h-[300px]">
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
              </div>
            </CardContent>
          </Card>
        )}

        {/* Manual input */}
        {inputMode === 'manual' && (
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Saisir le code du reçu</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex gap-2">
                <Input
                  placeholder="Code du reçu..."
                  value={currentCode}
                  onChange={(e) => setCurrentCode(e.target.value.toUpperCase())}
                  onKeyDown={(e) => e.key === 'Enter' && addReceiptByCode(currentCode)}
                  className="font-mono tracking-wider"
                  maxLength={8}
                />
                <Button onClick={() => addReceiptByCode(currentCode)} disabled={loadingCode || !currentCode.trim()} size="icon">
                  {loadingCode ? <Loader2 className="h-4 w-4 animate-spin" /> : <Plus className="h-4 w-4" />}
                </Button>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Receipt list */}
        {receipts.length > 0 && (
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Reçus à valider ({receipts.length})</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              {receipts.map(receipt => (
                <div
                  key={receipt.code}
                  className={`flex items-center justify-between p-3 rounded-lg border ${
                    receipt.alreadyValidated
                      ? 'bg-destructive/5 border-destructive/20'
                      : 'bg-muted/50 border-border'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <span className="font-mono text-sm font-medium">{receipt.code}</span>
                    <span className="text-sm">{receipt.visitorName}</span>
                    {receipt.alreadyValidated && (
                      <Badge variant="destructive" className="text-xs">Déjà validé</Badge>
                    )}
                  </div>
                  <Button variant="ghost" size="icon" onClick={() => removeReceipt(receipt.code)}>
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              ))}

              <Button
                className="w-full gap-2 mt-4"
                onClick={validateAll}
                disabled={processing || receipts.filter(r => !r.alreadyValidated).length === 0}
              >
                {processing ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  <CheckCircle className="h-4 w-4" />
                )}
                Valider {receipts.filter(r => !r.alreadyValidated).length} sortie(s)
              </Button>
            </CardContent>
          </Card>
        )}
      </div>
    </DashboardLayout>
  );
}
