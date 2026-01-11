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

      let query = supabase.from('employees').select('*').order('created_at', { ascending: false });

      if (companyId) {
        query = query.eq('company_id', companyId);
      }

      const { data: employeesData, error: employeesError } = await query;

      if (employeesError) throw employeesError;

      // Fetch related data
      const employeesWithDetails: Employee[] = await Promise.all(
        (employeesData || []).map(async (employee) => {
          // Get profile info
          const { data: profileData } = await supabase
            .from('profiles')
            .select('id, first_name, last_name, email, phone')
            .eq('id', employee.user_id)
            .maybeSingle();

          // Get company info
          const { data: companyData } = await supabase
            .from('companies')
            .select('id, name')
            .eq('id', employee.company_id)
            .maybeSingle();

          return {
            ...employee,
            profile: profileData,
            company: companyData,
          };
        })
      );

      setEmployees(employeesWithDetails);
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

      // Generate a temporary password for the employee
      const tempPassword = Math.random().toString(36).substring(2, 10) + Math.random().toString(36).substring(2, 10).toUpperCase();

      const response = await fetch(
        `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/create-user`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`,
          },
          body: JSON.stringify({
            email: employeeData.email,
            password: tempPassword,
            firstName: employeeData.first_name,
            lastName: employeeData.last_name,
            phone: employeeData.phone,
            role: 'employee',
            companyId: employeeData.company_id,
          }),
        }
      );

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.error || 'Erreur lors de la création');
      }

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
    data: { first_name: string; last_name: string; email: string; phone?: string }
  ) => {
    try {
      const { error } = await supabase
        .from('profiles')
        .update({
          first_name: data.first_name,
          last_name: data.last_name,
          email: data.email,
          phone: data.phone || null,
        })
        .eq('id', userId);

      if (error) throw error;

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
