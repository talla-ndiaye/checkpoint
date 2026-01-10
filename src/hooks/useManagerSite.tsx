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
  const [site, setSite] = useState<ManagerSite | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchManagerSite = async () => {
      if (!user) {
        setLoading(false);
        return;
      }

      try {
        setLoading(true);
        // Get the site where this user is manager
        const { data, error } = await supabase
          .from('sites')
          .select('id, name, address')
          .eq('manager_id', user.id)
          .maybeSingle();

        if (error) throw error;
        setSite(data);
      } catch (error) {
        console.error('Error fetching manager site:', error);
        setSite(null);
      } finally {
        setLoading(false);
      }
    };

    fetchManagerSite();
  }, [user]);

  return { site, loading };
}
