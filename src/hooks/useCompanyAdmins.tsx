import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

export interface CompanyAdmin {
  id: string;
  user_id: string;
  company_id: string;
  role: string;
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

export function useCompanyAdmins(siteId?: string) {
  const [admins, setAdmins] = useState<CompanyAdmin[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchAdmins = async () => {
    try {
      setLoading(true);
      
      // First get companies, optionally filtered by siteId
      let companiesQuery = supabase
        .from('companies')
        .select('id, name, admin_id, site_id')
        .not('admin_id', 'is', null);

      if (siteId) {
        companiesQuery = companiesQuery.eq('site_id', siteId);
      }

      const { data: companiesData, error: companiesError } = await companiesQuery;
      if (companiesError) throw companiesError;

      if (!companiesData || companiesData.length === 0) {
        setAdmins([]);
        return;
      }

      // Get admin user IDs from companies
      const adminUserIds = companiesData
        .filter(c => c.admin_id)
        .map(c => c.admin_id!);

      if (adminUserIds.length === 0) {
        setAdmins([]);
        return;
      }

      // Get roles for these admins
      const { data: roleData, error: roleError } = await supabase
        .from('user_roles')
        .select('user_id, role, created_at')
        .eq('role', 'company_admin')
        .in('user_id', adminUserIds);

      if (roleError) throw roleError;

      // Get profiles
      const { data: profiles, error: profilesError } = await supabase
        .from('profiles')
        .select('id, first_name, last_name, email, phone')
        .in('id', adminUserIds);

      if (profilesError) throw profilesError;

      // Build admin objects
      const adminsList: CompanyAdmin[] = companiesData
        .filter(c => c.admin_id)
        .map(company => {
          const roleInfo = roleData?.find(r => r.user_id === company.admin_id);
          const profile = profiles?.find(p => p.id === company.admin_id);
          
          return {
            id: `${company.admin_id}-${company.id}`,
            user_id: company.admin_id!,
            company_id: company.id,
            role: 'company_admin',
            created_at: roleInfo?.created_at || '',
            profile,
            company: {
              id: company.id,
              name: company.name
            }
          };
        });

      setAdmins(adminsList);
    } catch (error) {
      console.error('Error fetching company admins:', error);
      toast.error('Erreur lors du chargement des administrateurs');
    } finally {
      setLoading(false);
    }
  };

  const createCompanyAdmin = async (data: {
    email: string;
    password: string;
    firstName: string;
    lastName: string;
    phone?: string;
    companyId: string;
  }) => {
    try {
      const { data: sessionData } = await supabase.auth.getSession();
      const token = sessionData.session?.access_token;
      
      if (!token) {
        toast.error('Session expirée, veuillez vous reconnecter');
        return false;
      }

      const response = await fetch(
        `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/create-user`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`,
          },
          body: JSON.stringify({
            email: data.email,
            password: data.password,
            firstName: data.firstName,
            lastName: data.lastName,
            phone: data.phone,
            role: 'company_admin',
            companyId: data.companyId,
          }),
        }
      );

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.error || 'Erreur lors de la création');
      }

      toast.success('Administrateur créé avec succès');
      fetchAdmins();
      return true;
    } catch (error: any) {
      console.error('Error creating company admin:', error);
      toast.error(error.message || 'Erreur lors de la création');
      return false;
    }
  };

  const removeCompanyAdmin = async (userId: string, companyId: string) => {
    try {
      // Remove admin from company
      const { error: companyError } = await supabase
        .from('companies')
        .update({ admin_id: null })
        .eq('id', companyId);

      if (companyError) throw companyError;

      // Check if user is admin of other companies
      const { data: otherCompanies } = await supabase
        .from('companies')
        .select('id')
        .eq('admin_id', userId);

      // If no other companies, remove role
      if (!otherCompanies || otherCompanies.length === 0) {
        await supabase
          .from('user_roles')
          .delete()
          .eq('user_id', userId)
          .eq('role', 'company_admin');
      }

      toast.success('Administrateur retiré avec succès');
      fetchAdmins();
      return true;
    } catch (error) {
      console.error('Error removing company admin:', error);
      toast.error('Erreur lors de la suppression');
      return false;
    }
  };

  useEffect(() => {
    fetchAdmins();
  }, [siteId]);

  return { admins, loading, fetchAdmins, createCompanyAdmin, removeCompanyAdmin };
}
