import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

export interface Company {
  id: string;
  name: string;
  site_id: string;
  admin_id: string | null;
  created_at: string;
  updated_at: string;
  site?: {
    id: string;
    name: string;
  } | null;
  admin?: {
    id: string;
    first_name: string;
    last_name: string;
    email: string;
  } | null;
  employee_count?: number;
}

export interface CreateCompanyData {
  name: string;
  site_id: string;
  admin_id?: string | null;
}

export function useCompanies(siteId?: string) {
  const [companies, setCompanies] = useState<Company[]>([]);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  const fetchCompanies = async () => {
    try {
      setLoading(true);
      
      let query = supabase.from('companies').select('*').order('created_at', { ascending: false });
      
      if (siteId) {
        query = query.eq('site_id', siteId);
      }

      const { data: companiesData, error: companiesError } = await query;

      if (companiesError) throw companiesError;

      // Fetch related data
      const companiesWithDetails: Company[] = await Promise.all(
        (companiesData || []).map(async (company) => {
          // Get site info
          const { data: siteData } = await supabase
            .from('sites')
            .select('id, name')
            .eq('id', company.site_id)
            .maybeSingle();

          // Get admin info if exists
          let adminData = null;
          if (company.admin_id) {
            const { data } = await supabase
              .from('profiles')
              .select('id, first_name, last_name, email')
              .eq('id', company.admin_id)
              .maybeSingle();
            adminData = data;
          }

          // Get employee count
          const { count } = await supabase
            .from('employees')
            .select('*', { count: 'exact', head: true })
            .eq('company_id', company.id);

          return {
            ...company,
            site: siteData,
            admin: adminData,
            employee_count: count || 0,
          };
        })
      );

      setCompanies(companiesWithDetails);
    } catch (error: any) {
      toast({
        title: 'Erreur',
        description: 'Impossible de charger les entreprises',
        variant: 'destructive',
      });
      console.error('Error fetching companies:', error);
    } finally {
      setLoading(false);
    }
  };

  const createCompany = async (companyData: CreateCompanyData) => {
    try {
      const { data, error } = await supabase
        .from('companies')
        .insert([companyData])
        .select()
        .single();

      if (error) throw error;

      toast({
        title: 'Succès',
        description: 'Entreprise créée avec succès',
      });

      await fetchCompanies();
      return { data, error: null };
    } catch (error: any) {
      toast({
        title: 'Erreur',
        description: error.message || 'Impossible de créer l\'entreprise',
        variant: 'destructive',
      });
      return { data: null, error };
    }
  };

  const updateCompany = async (id: string, companyData: Partial<CreateCompanyData>) => {
    try {
      const { data, error } = await supabase
        .from('companies')
        .update(companyData)
        .eq('id', id)
        .select()
        .single();

      if (error) throw error;

      toast({
        title: 'Succès',
        description: 'Entreprise mise à jour avec succès',
      });

      await fetchCompanies();
      return { data, error: null };
    } catch (error: any) {
      toast({
        title: 'Erreur',
        description: error.message || 'Impossible de mettre à jour l\'entreprise',
        variant: 'destructive',
      });
      return { data: null, error };
    }
  };

  const deleteCompany = async (id: string) => {
    try {
      const { error } = await supabase.from('companies').delete().eq('id', id);

      if (error) throw error;

      toast({
        title: 'Succès',
        description: 'Entreprise supprimée avec succès',
      });

      await fetchCompanies();
      return { error: null };
    } catch (error: any) {
      toast({
        title: 'Erreur',
        description: error.message || 'Impossible de supprimer l\'entreprise',
        variant: 'destructive',
      });
      return { error };
    }
  };

  useEffect(() => {
    fetchCompanies();
  }, [siteId]);

  return {
    companies,
    loading,
    fetchCompanies,
    createCompany,
    updateCompany,
    deleteCompany,
  };
}
