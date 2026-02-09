import { useState, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

interface ScanResult {
  type: 'employee' | 'visitor';
  walkInReceiptCode?: string;
  walkInVisitorId?: string;
  name: string;
  code: string;
  companyName?: string;
  visitorInfo?: {
    visitDate: string;
    visitTime: string;
    hostName: string;
  };
  isWalkInExit?: boolean;
  exitAlreadyValidated?: boolean;
}

export function useQRScanner() {
  const [scanning, setScanning] = useState(false);
  const [lastScan, setLastScan] = useState<ScanResult | null>(null);

  const validateCode = useCallback(async (rawCode: string): Promise<ScanResult | null> => {
    try {
      // Try to parse JSON QR code data
      let codeToSearch = rawCode;
      let parsedType: 'employee' | 'invitation' | 'walk_in_receipt' | null = null;

      try {
        const parsed = JSON.parse(rawCode);
        if (parsed.code) {
          codeToSearch = parsed.code;
          parsedType = parsed.type === 'employee' ? 'employee' :
            parsed.type === 'invitation' ? 'invitation' :
              parsed.type === 'walk_in_receipt' ? 'walk_in_receipt' : null;
        }
      } catch {
        // Not JSON, use raw code (manual entry case)
        codeToSearch = rawCode.toUpperCase().trim();
      }

      // If we know it's an employee from QR data, search employees only
      if (parsedType === 'employee' || !parsedType) {
        const { data: employee, error: empError } = await supabase
          .from('employees')
          .select(`
            id,
            unique_code,
            user_id,
            company_id
          `)
          .eq('unique_code', codeToSearch)
          .maybeSingle();

        if (empError) throw empError;

        if (employee) {
          // Get profile and company info
          const [profileRes, companyRes] = await Promise.all([
            supabase.from('profiles').select('first_name, last_name').eq('id', employee.user_id).single(),
            supabase.from('companies').select('name').eq('id', employee.company_id).single()
          ]);

          return {
            type: 'employee',
            name: `${profileRes.data?.first_name || ''} ${profileRes.data?.last_name || ''}`.trim() || 'Inconnu',
            code: employee.unique_code,
            companyName: companyRes.data?.name
          };
        }
      }

      // If we know it's an invitation from QR data, or employee not found
      if (parsedType === 'invitation' || parsedType === 'walk_in_receipt' || !parsedType) {
        // First, check for walk-in visitor receipt
        const { data: walkInVisitor, error: walkInError } = await supabase
          .from('walk_in_visitors')
          .select('id, first_name, last_name, id_card_number, exit_validated, created_at, receipt_code')
          .eq('receipt_code', codeToSearch)
          .maybeSingle();

        if (walkInError) throw walkInError;

        if (walkInVisitor) {

          if (walkInVisitor.exit_validated) {
            toast.error('Ce reçu a déjà été utilisé pour une sortie');
            return {
              type: 'visitor' as const,
              name: `${walkInVisitor.first_name} ${walkInVisitor.last_name}`,
              code: walkInVisitor.receipt_code || codeToSearch,
              walkInReceiptCode: walkInVisitor.receipt_code || undefined,
              walkInVisitorId: walkInVisitor.id,
              isWalkInExit: true,
              exitAlreadyValidated: true
            };
          }

          return {
            type: 'visitor' as const,
            name: `${walkInVisitor.first_name} ${walkInVisitor.last_name}`,
            code: walkInVisitor.receipt_code || codeToSearch,
            walkInReceiptCode: walkInVisitor.receipt_code || undefined,
            walkInVisitorId: walkInVisitor.id,
            isWalkInExit: true,
            exitAlreadyValidated: false
          };
        }

        const { data: invitation, error: invError } = await supabase
          .from('invitations')
          .select(`
            id,
            alpha_code,
            visitor_name,
            visit_date,
            visit_time,
            status,
            employee_id
          `)
          .eq('alpha_code', codeToSearch)
          .maybeSingle();

        if (invError) throw invError;

        if (invitation) {
          if (invitation.status !== 'pending' && invitation.status !== 'approved') {
            toast.error('Cette invitation a déjà été utilisée ou annulée');
            return null;
          }

          // Get host info
          const { data: empData, error: empLookupError } = await supabase
            .from('employees')
            .select('user_id')
            .eq('id', invitation.employee_id)
            .single();

          let hostName = 'Inconnu';
          if (empData) {
            const { data: profile, error: profileError } = await supabase
              .from('profiles')
              .select('first_name, last_name')
              .eq('id', empData.user_id)
              .single();
            if (profile) {
              hostName = `${profile.first_name} ${profile.last_name}`;
            }
          }

          return {
            type: 'visitor',
            name: invitation.visitor_name,
            code: invitation.alpha_code,
            visitorInfo: {
              visitDate: invitation.visit_date,
              visitTime: invitation.visit_time,
              hostName
            }
          };
        }
      }

      toast.error('Code non reconnu');
      return null;
    } catch (error) {
      console.error('Error validating code:', error);
      toast.error('Erreur lors de la validation');
      return null;
    }
  }, []);

  const recordAccess = useCallback(async (
    scanResult: ScanResult,
    actionType: 'entry' | 'exit'
  ): Promise<boolean> => {
    try {
      // Get guardian's site
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('Non authentifié');

      const { data: guardian } = await supabase
        .from('guardians')
        .select('site_id')
        .eq('user_id', user.id)
        .single();

      if (!guardian) throw new Error('Gardien non trouvé');

      // Find user_id or invitation_id based on type
      let userId: string | null = null;
      let invitationId: string | null = null;

      if (scanResult.type === 'employee') {
        const { data: emp } = await supabase
          .from('employees')
          .select('user_id')
          .eq('unique_code', scanResult.code)
          .single();
        userId = emp?.user_id || null;
      } else {
        const { data: inv } = await supabase
          .from('invitations')
          .select('id')
          .eq('alpha_code', scanResult.code)
          .single();
        invitationId = inv?.id || null;

        // Mark invitation as used
        if (invitationId && actionType === 'entry') {
          await supabase
            .from('invitations')
            .update({ status: 'used' })
            .eq('id', invitationId);
        }
      }

      // Handle walk-in visitor exit
      let walkInVisitorId: string | null = null;
      if (scanResult.walkInVisitorId && actionType === 'exit') {
        walkInVisitorId = scanResult.walkInVisitorId;

        // Mark walk-in visitor exit as validated
        const { error: updateError } = await supabase
          .from('walk_in_visitors')
          .update({
            exit_validated: true,
            exit_at: new Date().toISOString()
          })
          .eq('id', walkInVisitorId);

        if (updateError) {
          console.error('Error updating walk-in visitor exit:', updateError);
          throw new Error('Erreur lors de la validation de la sortie');
        }
      }

      // Record access log
      const { error } = await supabase
        .from('access_logs')
        .insert({
          site_id: guardian.site_id,
          scanned_by: user.id,
          action_type: actionType,
          user_id: userId,
          invitation_id: invitationId,
          walk_in_visitor_id: walkInVisitorId
        });

      if (error) throw error;

      toast.success(`${actionType === 'entry' ? 'Entrée' : 'Sortie'} enregistrée`);
      return true;
    } catch (error) {
      console.error('Error recording access:', error);
      toast.error('Erreur lors de l\'enregistrement');
      return false;
    }
  }, []);

  return {
    scanning,
    setScanning,
    lastScan,
    setLastScan,
    validateCode,
    recordAccess
  };
}
