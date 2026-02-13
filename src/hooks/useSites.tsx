import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { usePermissions } from './usePermissions';

export interface Site {
  id: string;
  name: string;
  address: string;
  manager_id: string | null;
  created_at: string;
  manager?: {
    id: string;
    first_name: string;
    last_name: string;
    email: string;
  };
}

export function useSites() {
  const queryClient = useQueryClient();
  const { data: permissions } = usePermissions();

  const fetchSitesQuery = useQuery({
    queryKey: ['sites', permissions?.allowedSiteIds],
    queryFn: async (): Promise<Site[]> => {
      if (!permissions) return [];

      let query = supabase
        .from('sites')
        .select(`
          *,
          manager:profiles!sites_manager_id_fkey (
            id,
            first_name,
            last_name,
            email
          )
        `);

      // Role-based filtering
      if (!permissions.isSuperAdmin) {
        if (permissions.allowedSiteIds) {
          query = query.in('id', permissions.allowedSiteIds);
        }
      }

      const { data, error } = await query.order('created_at', { ascending: false });
      if (error) throw error;

      return (data as any) || [];
    },
    enabled: !!permissions,
  });

  const manageSiteMutation = useMutation({
    mutationFn: async ({ action, id, data }: { action: 'create' | 'update' | 'delete', id?: string, data?: any }) => {
      const { data: result, error } = await supabase.functions.invoke('manage-site', {
        body: { action, id, ...data }
      });
      if (error) throw error;
      if (result.error) throw new Error(result.error);
      return result;
    },
    onSuccess: (_, variables) => {
      const actionLabels = { create: 'créé', update: 'mis à jour', delete: 'supprimé' };
      toast.success(`Site ${actionLabels[variables.action]} avec succès`);
      queryClient.invalidateQueries({ queryKey: ['sites'] });
    },
    onError: (error: any) => {
      toast.error(error.message || 'Une erreur est survenue');
    },
  });

  return {
    sites: fetchSitesQuery.data || [],
    loading: fetchSitesQuery.isLoading,
    createSite: (data: { name: string; address: string; manager_id?: string }) =>
      manageSiteMutation.mutateAsync({ action: 'create', data }),
    updateSite: (id: string, data: { name?: string; address?: string; manager_id?: string | null }) =>
      manageSiteMutation.mutateAsync({ action: 'update', id, data }),
    deleteSite: (id: string) =>
      manageSiteMutation.mutateAsync({ action: 'delete', id }),
    fetchSites: fetchSitesQuery.refetch,
  };
}
