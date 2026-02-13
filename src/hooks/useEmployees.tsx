import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

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
  } | null;
  company?: {
    id: string;
    name: string;
  } | null;
}

export interface CreateEmployeeData {
  email: string;
  password: string;
  first_name: string;
  last_name: string;
  phone?: string;
  company_id: string;
}

export function useEmployees(companyId?: string) {
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  const fetchEmployees = async () => {
    try {
      setLoading(true);

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
        `)
        .order('created_at', { ascending: false });

      if (companyId) {
        query = query.eq('company_id', companyId);
      }

      const { data: employeesData, error: employeesError } = await query;

      if (employeesError) throw employeesError;

      setEmployees((employeesData as any) || []);
    } catch (error: any) {
      toast({
        title: 'Erreur',
        description: 'Impossible de charger les employés',
        variant: 'destructive',
      });
      console.error('Error fetching employees:', error);
    } finally {
      setLoading(false);
    }
  };

  const createEmployee = async (employeeData: CreateEmployeeData) => {
    try {
      const { data: sessionData } = await supabase.auth.getSession();
      const token = sessionData.session?.access_token;

      if (!token) {
        toast({
          title: 'Erreur',
          description: 'Session expirée, veuillez vous reconnecter',
          variant: 'destructive',
        });
        return { data: null, error: new Error('Session expirée') };
      }

      const { data: result, error: functionError } = await supabase.functions.invoke('create-user', {
        body: {
          email: employeeData.email,
          password: employeeData.password,
          firstName: employeeData.first_name,
          lastName: employeeData.last_name,
          phone: employeeData.phone,
          role: 'employee',
          companyId: employeeData.company_id,
        }
      });

      if (functionError) throw functionError;

      toast({
        title: 'Succès',
        description: 'Employé créé avec succès',
      });

      await fetchEmployees();
      return { data: result, error: null };
    } catch (error: any) {
      toast({
        title: 'Erreur',
        description: error.message || 'Impossible de créer l\'employé',
        variant: 'destructive',
      });
      return { data: null, error };
    }
  };

  const updateEmployee = async (
    employeeId: string,
    userId: string,
    data: { first_name?: string; last_name?: string; email?: string; phone?: string; password?: string }
  ) => {
    try {
      const { data: sessionData } = await supabase.auth.getSession();
      const token = sessionData.session?.access_token;
      if (!token) throw new Error('Session expirée');

      const { data: result, error: functionError } = await supabase.functions.invoke('update-user', {
        body: {
          userId,
          firstName: data.first_name,
          lastName: data.last_name,
          phone: data.phone,
          password: data.password
        }
      });

      if (functionError) throw functionError;

      toast({
        title: 'Succès',
        description: 'Employé mis à jour avec succès',
      });

      await fetchEmployees();
      return { error: null };
    } catch (error: any) {
      toast({
        title: 'Erreur',
        description: error.message || 'Impossible de mettre à jour l\'employé',
        variant: 'destructive',
      });
      return { error };
    }
  };

  const deleteEmployee = async (id: string) => {
    try {
      const { error } = await supabase.from('employees').delete().eq('id', id);

      if (error) throw error;

      toast({
        title: 'Succès',
        description: 'Employé supprimé avec succès',
      });

      await fetchEmployees();
      return { error: null };
    } catch (error: any) {
      toast({
        title: 'Erreur',
        description: error.message || 'Impossible de supprimer l\'employé',
        variant: 'destructive',
      });
      return { error };
    }
  };

  useEffect(() => {
    fetchEmployees();
  }, [companyId]);

  return {
    employees,
    loading,
    fetchEmployees,
    createEmployee,
    updateEmployee,
    deleteEmployee,
  };
}
