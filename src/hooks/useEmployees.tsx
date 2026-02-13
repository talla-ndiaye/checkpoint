import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { usePermissions } from './usePermissions';

export interface Employee {
  id: string;
  user_id: string;
  company_id: string;
  qr_code: string;
  unique_code: string;
  created_at: string;
  profile?: {
    id: string;
    first_name: string;
    last_name: string;
    email: string;
    phone: string | null;
  };
  company?: {
    id: string;
    name: string;
  };
}

export interface CreateEmployeeData {
  first_name: string;
  last_name: string;
  email: string;
  phone?: string;
  company_id: string;
}


export function useEmployees(companyId?: string) {
  const queryClient = useQueryClient();
  const { data: permissions } = usePermissions();

  const fetchEmployeesQuery = useQuery({
    queryKey: ['employees', companyId, permissions?.allowedSiteIds],
    queryFn: async (): Promise<Employee[]> => {
      if (!permissions) return [];

      let query = supabase
        .from('employees')
        .select(`
          *,
          profile:profiles!employees_profiles_user_id_fkey (
            id,
            first_name,
            last_name,
            email,
            phone
          ),
          company:companies (
            id,
            name
          )
        `);

      // Role-based filtering
      if (!permissions.isSuperAdmin) {
        if (permissions.isCompanyAdmin && permissions.companyId) {
          query = query.eq('company_id', permissions.companyId);
        } else if (permissions.allowedSiteIds) {
          const { data: siteCompanies } = await supabase.from('companies').select('id').in('site_id', permissions.allowedSiteIds);
          const compIds = siteCompanies?.map(c => c.id) || [];
          query = query.in('company_id', compIds);
        }
      }

      // Explicit filter
      if (companyId) {
        query = query.eq('company_id', companyId);
      }

      const { data, error } = await query.order('created_at', { ascending: false });
      if (error) throw error;

      return (data as any) || [];
    },
    enabled: !!permissions,
  });

  const createEmployeeMutation = useMutation({
    mutationFn: async (data: any) => {
      const { data: result, error } = await supabase.functions.invoke('create-user', {
        body: {
          ...data,
          role: 'employee',
        },
      });
      if (error) throw error;
      if (result.error) throw new Error(result.error);
      return result;
    },
    onSuccess: () => {
      toast.success('Employé créé avec succès');
      queryClient.invalidateQueries({ queryKey: ['employees'] });
    },
    onError: (error: any) => {
      toast.error(error.message || 'Erreur lors de la création');
    },
  });

  const deleteEmployeeMutation = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from('employees').delete().eq('id', id);
      if (error) throw error;
    },
    onSuccess: () => {
      toast.success('Employé supprimé');
      queryClient.invalidateQueries({ queryKey: ['employees'] });
    },
    onError: (error: any) => {
      toast.error('Erreur lors de la suppression');
    },
  });

  const updateEmployeeMutation = useMutation({
    mutationFn: async ({ id, userId, data }: { id: string; userId: string; data: any }) => {
      const { data: result, error } = await supabase.functions.invoke('update-user', {
        body: {
          userId,
          ...data,
        },
      });
      if (error) throw error;
      return result;
    },
    onSuccess: () => {
      toast.success('Employé mis à jour');
      queryClient.invalidateQueries({ queryKey: ['employees'] });
    },
    onError: (error: any) => {
      toast.error(error.message || 'Erreur lors de la mise à jour');
    },
  });


  return {
    employees: fetchEmployeesQuery.data || [],
    loading: fetchEmployeesQuery.isLoading,
    createEmployee: (data: any) => createEmployeeMutation.mutateAsync(data),
    updateEmployee: (id: string, userId: string, data: any) => updateEmployeeMutation.mutateAsync({ id, userId, data }),
    deleteEmployee: (id: string) => deleteEmployeeMutation.mutateAsync(id),
    fetchEmployees: fetchEmployeesQuery.refetch,
  };
}
