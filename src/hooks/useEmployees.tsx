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

  const generateUniqueCode = () => {
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
    let result = '';
    for (let i = 0; i < 6; i++) {
      result += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    return result;
  };

  const generateQRCode = () => {
    return `EMP-${Date.now()}-${Math.random().toString(36).substring(2, 9).toUpperCase()}`;
  };

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
      // First, create the user account
      const { data: authData, error: authError } = await supabase.auth.signUp({
        email: employeeData.email,
        password: generateUniqueCode() + generateUniqueCode(), // Temporary password
        options: {
          data: {
            first_name: employeeData.first_name,
            last_name: employeeData.last_name,
          },
          emailRedirectTo: `${window.location.origin}/auth`,
        },
      });

      if (authError) throw authError;
      if (!authData.user) throw new Error('Erreur lors de la création du compte');

      // Wait for profile to be created by trigger
      await new Promise(resolve => setTimeout(resolve, 1000));

      // Update phone if provided
      if (employeeData.phone) {
        await supabase
          .from('profiles')
          .update({ phone: employeeData.phone })
          .eq('id', authData.user.id);
      }

      // Create employee record
      const { data: empData, error: empError } = await supabase
        .from('employees')
        .insert([{
          user_id: authData.user.id,
          company_id: employeeData.company_id,
          qr_code: generateQRCode(),
          unique_code: generateUniqueCode(),
        }])
        .select()
        .single();

      if (empError) throw empError;

      // Add employee role
      await supabase.from('user_roles').insert([{
        user_id: authData.user.id,
        role: 'employee',
      }]);

      toast({
        title: 'Succès',
        description: 'Employé créé avec succès. Un email lui a été envoyé.',
      });

      await fetchEmployees();
      return { data: empData, error: null };
    } catch (error: any) {
      toast({
        title: 'Erreur',
        description: error.message || 'Impossible de créer l\'employé',
        variant: 'destructive',
      });
      return { data: null, error };
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
    deleteEmployee,
  };
}
