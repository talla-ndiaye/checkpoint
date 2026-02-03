import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

interface ScheduledReport {
  id: string;
  user_id: string;
  site_id: string | null;
  report_type: 'daily' | 'weekly' | 'monthly';
  format: 'pdf' | 'csv' | 'excel';
  email: string;
  is_active: boolean;
  last_sent_at: string | null;
  next_send_at: string;
  created_at: string;
}

interface CreateReportInput {
  site_id?: string;
  report_type: 'daily' | 'weekly' | 'monthly';
  format: 'pdf' | 'csv' | 'excel';
  email: string;
}

export function useScheduledReports() {
  const queryClient = useQueryClient();
  const [isLoading, setIsLoading] = useState(false);

  // Fetch scheduled reports
  const { data: reports, isLoading: isLoadingReports } = useQuery({
    queryKey: ['scheduled-reports'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('scheduled_reports')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;
      return data as ScheduledReport[];
    }
  });

  // Calculate next send date based on report type
  const calculateNextSendDate = (reportType: string): Date => {
    const now = new Date();
    switch (reportType) {
      case 'daily':
        now.setDate(now.getDate() + 1);
        now.setHours(8, 0, 0, 0);
        break;
      case 'weekly':
        now.setDate(now.getDate() + (7 - now.getDay() + 1)); // Next Monday
        now.setHours(8, 0, 0, 0);
        break;
      case 'monthly':
        now.setMonth(now.getMonth() + 1, 1); // First of next month
        now.setHours(8, 0, 0, 0);
        break;
    }
    return now;
  };

  // Create scheduled report
  const createReport = useMutation({
    mutationFn: async (input: CreateReportInput) => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('Non authentifié');

      const nextSendAt = calculateNextSendDate(input.report_type);

      const { data, error } = await supabase
        .from('scheduled_reports')
        .insert({
          user_id: user.id,
          site_id: input.site_id || null,
          report_type: input.report_type,
          format: input.format,
          email: input.email,
          next_send_at: nextSendAt.toISOString(),
        })
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['scheduled-reports'] });
      toast.success('Rapport planifié créé avec succès');
    },
    onError: (error: Error) => {
      toast.error(`Erreur: ${error.message}`);
    }
  });

  // Toggle report active status
  const toggleReport = useMutation({
    mutationFn: async ({ id, isActive }: { id: string; isActive: boolean }) => {
      const { error } = await supabase
        .from('scheduled_reports')
        .update({ is_active: isActive })
        .eq('id', id);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['scheduled-reports'] });
      toast.success('Statut mis à jour');
    }
  });

  // Delete scheduled report
  const deleteReport = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase
        .from('scheduled_reports')
        .delete()
        .eq('id', id);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['scheduled-reports'] });
      toast.success('Rapport supprimé');
    }
  });

  // Send report immediately
  const sendReportNow = async (params: {
    siteId?: string;
    format: 'pdf' | 'csv' | 'excel';
    dateFrom: string;
    dateTo: string;
    email: string;
  }) => {
    setIsLoading(true);
    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) throw new Error('Non authentifié');

      const response = await supabase.functions.invoke('send-report', {
        body: params
      });

      if (response.error) throw new Error(response.error.message);
      
      toast.success('Rapport envoyé avec succès');
      return response.data;
    } catch (error: any) {
      toast.error(`Erreur: ${error.message}`);
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  return {
    reports,
    isLoadingReports,
    isLoading,
    createReport,
    toggleReport,
    deleteReport,
    sendReportNow
  };
}
