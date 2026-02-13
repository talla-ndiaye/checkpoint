import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from './useAuth';

export interface ManagerSite {
  id: string;
  name: string;
  address: string;
}

export function useManagerSite() {
  const { user } = useAuth();
  const [sites, setSites] = useState<ManagerSite[]>([]);
  const [site, setSite] = useState<ManagerSite | null>(null); // Keep for backward compatibility
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchManagerSites = async () => {
      if (!user) {
        setLoading(false);
        return;
      }

      try {
        setLoading(true);
        // Get all sites where this user is manager
        const { data, error } = await supabase
          .from('sites')
          .select('id, name, address')
          .eq('manager_id', user.id);

        if (error) throw error;
        setSites(data || []);
        setSite(data?.[0] || null);
      } catch (error) {
        console.error('Error fetching manager sites:', error);
        setSites([]);
        setSite(null);
      } finally {
        setLoading(false);
      }
    };

    fetchManagerSites();
  }, [user]);

  return { sites, site, loading };
}
