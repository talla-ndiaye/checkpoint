import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

export interface Site {
  id: string;
  name: string;
  address: string;
  manager_id: string | null;
  created_at: string;
  updated_at: string;
  manager?: {
    id: string;
    first_name: string;
    last_name: string;
    email: string;
  } | null;
}

export interface CreateSiteData {
  name: string;
  address: string;
  manager_id?: string | null;
}

export function useSites() {
  const [sites, setSites] = useState<Site[]>([]);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  const fetchSites = async () => {
    try {
      setLoading(true);
      // First get sites
      const { data: sitesData, error: sitesError } = await supabase
        .from('sites')
        .select('*')
        .order('created_at', { ascending: false });

      if (sitesError) throw sitesError;

      // Then get manager profiles for each site
      const sitesWithManagers: Site[] = await Promise.all(
        (sitesData || []).map(async (site) => {
          if (site.manager_id) {
            const { data: managerData } = await supabase
              .from('profiles')
              .select('id, first_name, last_name, email')
              .eq('id', site.manager_id)
              .maybeSingle();
            return { ...site, manager: managerData };
          }
          return { ...site, manager: null };
        })
      );

      setSites(sitesWithManagers);
    } catch (error: any) {
      toast({
        title: 'Erreur',
        description: 'Impossible de charger les sites',
        variant: 'destructive',
      });
      console.error('Error fetching sites:', error);
    } finally {
      setLoading(false);
    }
  };

  const createSite = async (siteData: CreateSiteData) => {
    try {
      const { data: result, error } = await supabase.functions.invoke('manage-site', {
        body: {
          action: 'create',
          name: siteData.name,
          address: siteData.address,
          manager_id: siteData.manager_id,
        },
      });

      if (error) throw error;
      if (result.error) throw new Error(result.error);

      toast({
        title: 'Succès',
        description: 'Site créé avec succès',
      });

      await fetchSites();
      return { data: result.site, error: null };
    } catch (error: unknown) {
      const message = error instanceof Error ? error.message : 'Impossible de créer le site';
      toast({
        title: 'Erreur',
        description: message,
        variant: 'destructive',
      });
      return { data: null, error };
    }
  };

  const updateSite = async (id: string, siteData: Partial<CreateSiteData>) => {
    try {
      const { data: result, error } = await supabase.functions.invoke('manage-site', {
        body: {
          action: 'update',
          id,
          name: siteData.name,
          address: siteData.address,
          manager_id: siteData.manager_id,
        },
      });

      if (error) throw error;
      if (result.error) throw new Error(result.error);

      toast({
        title: 'Succès',
        description: 'Site mis à jour avec succès',
      });

      await fetchSites();
      return { data: result.site, error: null };
    } catch (error: unknown) {
      const message = error instanceof Error ? error.message : 'Impossible de mettre à jour le site';
      toast({
        title: 'Erreur',
        description: message,
        variant: 'destructive',
      });
      return { data: null, error };
    }
  };

  const deleteSite = async (id: string) => {
    try {
      const { data: result, error } = await supabase.functions.invoke('manage-site', {
        body: { action: 'delete', id },
      });

      if (error) throw error;
      if (result.error) throw new Error(result.error);

      toast({
        title: 'Succès',
        description: 'Site supprimé avec succès',
      });

      await fetchSites();
      return { error: null };
    } catch (error: unknown) {
      const message = error instanceof Error ? error.message : 'Impossible de supprimer le site';
      toast({
        title: 'Erreur',
        description: message,
        variant: 'destructive',
      });
      return { error };
    }
  };

  useEffect(() => {
    fetchSites();
  }, []);

  return {
    sites,
    loading,
    fetchSites,
    createSite,
    updateSite,
    deleteSite,
  };
}
