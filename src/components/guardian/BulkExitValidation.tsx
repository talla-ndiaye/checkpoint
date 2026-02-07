import { useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { CheckCircle, Plus, Trash2, LogOut, Loader2 } from 'lucide-react';

interface PendingReceipt {
  code: string;
  visitorName: string;
  visitorId: string;
  alreadyValidated: boolean;
}

export function BulkExitValidation() {
  const [receipts, setReceipts] = useState<PendingReceipt[]>([]);
  const [currentCode, setCurrentCode] = useState('');
  const [loading, setLoading] = useState(false);
  const [processing, setProcessing] = useState(false);

  const addReceipt = async () => {
    const code = currentCode.toUpperCase().trim();
    if (!code) return;
    if (receipts.some(r => r.code === code)) {
      toast.error('Ce code est déjà dans la liste');
      return;
    }

    setLoading(true);
    try {
      const { data: visitor, error } = await supabase
        .from('walk_in_visitors')
        .select('id, first_name, last_name, exit_validated, receipt_code')
        .eq('receipt_code', code)
        .maybeSingle();

      if (error) throw error;
      if (!visitor) {
        toast.error('Code de reçu non reconnu');
        setLoading(false);
        return;
      }

      setReceipts(prev => [...prev, {
        code: visitor.receipt_code || code,
        visitorName: `${visitor.first_name} ${visitor.last_name}`,
        visitorId: visitor.id,
        alreadyValidated: !!visitor.exit_validated
      }]);
      setCurrentCode('');
    } catch {
      toast.error('Erreur lors de la recherche');
    }
    setLoading(false);
  };

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
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('Non authentifié');

      const { data: guardian } = await supabase
        .from('guardians')
        .select('site_id')
        .eq('user_id', user.id)
        .single();

      if (!guardian) throw new Error('Gardien non trouvé');

      let successCount = 0;
      for (const receipt of validReceipts) {
        const { error: updateError } = await supabase
          .from('walk_in_visitors')
          .update({ exit_validated: true, exit_at: new Date().toISOString() })
          .eq('id', receipt.visitorId);

        if (updateError) {
          console.error(`Error validating ${receipt.code}:`, updateError);
          continue;
        }

        const { error: logError } = await supabase
          .from('access_logs')
          .insert({
            site_id: guardian.site_id,
            scanned_by: user.id,
            action_type: 'exit',
            walk_in_visitor_id: receipt.visitorId
          });

        if (logError) {
          console.error(`Error logging ${receipt.code}:`, logError);
          continue;
        }

        successCount++;
      }

      toast.success(`${successCount} sortie(s) validée(s) sur ${validReceipts.length}`);
      setReceipts([]);
    } catch (error) {
      console.error('Bulk validation error:', error);
      toast.error('Erreur lors de la validation groupée');
    }
    setProcessing(false);
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-lg flex items-center gap-2">
          <LogOut className="h-5 w-5" />
          Validation groupée des sorties
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex gap-2">
          <Input
            placeholder="Code du reçu..."
            value={currentCode}
            onChange={(e) => setCurrentCode(e.target.value.toUpperCase())}
            onKeyDown={(e) => e.key === 'Enter' && addReceipt()}
            className="font-mono tracking-wider"
            maxLength={8}
          />
          <Button onClick={addReceipt} disabled={loading || !currentCode.trim()} size="icon">
            {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Plus className="h-4 w-4" />}
          </Button>
        </div>

        {receipts.length > 0 && (
          <div className="space-y-2">
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
          </div>
        )}

        {receipts.length > 0 && (
          <Button
            className="w-full gap-2"
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
        )}
      </CardContent>
    </Card>
  );
}
