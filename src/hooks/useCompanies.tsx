import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { usePermissions } from './usePermissions';

export interface Company {
  id: string;
  name: string;
  site_id: string;
  admin_id: string | null;
  created_at: string;
  site?: {
    id: string;
    name: string;
  };
  admin?: {
    id: string;
    first_name: string;
    last_name: string;
    email: string;
  };
}

export function useCompanies(siteId?: string) {
  const queryClient = useQueryClient();
  const { data: permissions } = usePermissions();

  const fetchCompaniesQuery = useQuery({
    queryKey: ['companies', siteId, permissions?.allowedSiteIds],
    queryFn: async (): Promise<Company[]> => {
      if (!permissions) return [];

      let query = supabase
        .from('companies')
        .select(`
          *,
          site:sites (
            id,
            name
          ),
          admin:profiles!companies_admin_id_fkey (
            id,
            first_name,
            last_name,
            email
          )
        `);

      // Role-based filtering
      if (!permissions.isSuperAdmin) {
        if (permissions.allowedSiteIds) {
          query = query.in('site_id', permissions.allowedSiteIds);
        }
      }

      if (siteId) {
        query = query.eq('site_id', siteId);
      }

      const { data, error } = await query.order('created_at', { ascending: false });
      if (error) throw error;

      return (data as any) || [];
    },
    enabled: !!permissions,
  });

  const createCompanyMutation = useMutation({
    mutationFn: async (data: { name: string; site_id: string }) => {
      const { data: result, error } = await supabase
        .from('companies')
        .insert(data)
        .select()
        .single();
      if (error) throw error;
      return result;
    },
    onSuccess: () => {
      toast.success('Entreprise créée');
      queryClient.invalidateQueries({ queryKey: ['companies'] });
    },
    onError: (error: any) => {
      toast.error('Erreur : ' + error.message);
    }
  });

  const updateCompanyMutation = useMutation({
    mutationFn: async ({ id, data }: { id: string, data: any }) => {
      const { data: result, error } = await supabase
        .from('companies')
        .update(data)
        .eq('id', id)
        .select()
        .single();
      if (error) throw error;
      return result;
    },
    onSuccess: () => {
      toast.success('Entreprise mise à jour');
      queryClient.invalidateQueries({ queryKey: ['companies'] });
    },
  });

  const deleteCompanyMutation = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from('companies').delete().eq('id', id);
      if (error) throw error;
    },
    onSuccess: () => {
      toast.success('Entreprise supprimée');
      queryClient.invalidateQueries({ queryKey: ['companies'] });
    },
  });

  return {
    companies: fetchCompaniesQuery.data || [],
    loading: fetchCompaniesQuery.isLoading,
    createCompany: (data: any) => createCompanyMutation.mutateAsync(data),
    updateCompany: (id: string, data: any) => updateCompanyMutation.mutateAsync({ id, data }),
    deleteCompany: (id: string) => deleteCompanyMutation.mutateAsync(id),
    fetchCompanies: fetchCompaniesQuery.refetch,
  };
}
