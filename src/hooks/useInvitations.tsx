import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

export interface Invitation {
  id: string;
  employee_id: string;
  visitor_name: string;
  visitor_phone: string;
  visit_date: string;
  visit_time: string;
  qr_code: string;
  alpha_code: string;
  status: string;
  created_at: string;
}

interface CreateInvitationData {
  visitor_name: string;
  visitor_phone: string;
  visit_date: string;
  visit_time: string;
}

function generateAlphaCode(): string {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
  let result = '';
  for (let i = 0; i < 6; i++) {
    result += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return result;
}

function generateQRCodeData(invitationId: string, alphaCode: string): string {
  return JSON.stringify({
    type: 'invitation',
    id: invitationId,
    code: alphaCode,
    timestamp: Date.now(),
  });
}

export function useInvitations() {
  const queryClient = useQueryClient();

  const { data: employeeData } = useQuery({
    queryKey: ['current-employee'],
    queryFn: async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return null;

      const { data, error } = await supabase
        .from('employees')
        .select('id, company_id, unique_code, qr_code')
        .eq('user_id', user.id)
        .single();

      if (error) throw error;
      return data;
    },
  });

  const { data: invitations = [], isLoading, error } = useQuery({
    queryKey: ['invitations', employeeData?.id],
    queryFn: async () => {
      if (!employeeData?.id) return [];

      const { data, error } = await supabase
        .from('invitations')
        .select('*')
        .eq('employee_id', employeeData.id)
        .order('created_at', { ascending: false });

      if (error) throw error;
      return data as Invitation[];
    },
    enabled: !!employeeData?.id,
  });

  const createInvitation = useMutation({
    mutationFn: async (invitationData: CreateInvitationData) => {
      if (!employeeData?.id) throw new Error('Employee not found');

      const alphaCode = generateAlphaCode();
      const tempId = crypto.randomUUID();
      const qrCode = generateQRCodeData(tempId, alphaCode);

      const { data, error } = await supabase
        .from('invitations')
        .insert({
          employee_id: employeeData.id,
          visitor_name: invitationData.visitor_name,
          visitor_phone: invitationData.visitor_phone,
          visit_date: invitationData.visit_date,
          visit_time: invitationData.visit_time,
          alpha_code: alphaCode,
          qr_code: qrCode,
          status: 'pending',
        })
        .select()
        .single();

      if (error) throw error;
      return data as Invitation;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['invitations'] });
      toast.success('Invitation créée avec succès');
    },
    onError: (error: Error) => {
      toast.error(`Erreur: ${error.message}`);
    },
  });

  const cancelInvitation = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase
        .from('invitations')
        .update({ status: 'cancelled' })
        .eq('id', id);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['invitations'] });
      toast.success('Invitation annulée');
    },
    onError: (error: Error) => {
      toast.error(`Erreur: ${error.message}`);
    },
  });

  const shareViaWhatsApp = (invitation: Invitation) => {
    const message = encodeURIComponent(
      `Bonjour ${invitation.visitor_name},\n\n` +
      `Vous êtes invité(e) à nous rendre visite.\n\n` +
      `📅 Date: ${new Date(invitation.visit_date).toLocaleDateString('fr-FR')}\n` +
      `🕐 Heure: ${invitation.visit_time}\n` +
      `🔑 Code d'accès: ${invitation.alpha_code}\n\n` +
      `Présentez ce code au gardien à votre arrivée.\n\n` +
      `À bientôt !`
    );
    
    const phoneNumber = invitation.visitor_phone.replace(/\D/g, '');
    const whatsappUrl = `https://wa.me/${phoneNumber}?text=${message}`;
    window.open(whatsappUrl, '_blank');
  };

  return {
    invitations,
    isLoading,
    error,
    employeeData,
    createInvitation,
    cancelInvitation,
    shareViaWhatsApp,
  };
}
