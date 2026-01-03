import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';

export interface Manager {
  id: string;
  first_name: string;
  last_name: string;
  email: string;
}

export function useManagers() {
  const [managers, setManagers] = useState<Manager[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchManagers = async () => {
    try {
      setLoading(true);
      // Get users with manager role
      const { data: roleData, error: roleError } = await supabase
        .from('user_roles')
        .select('user_id')
        .eq('role', 'manager');

      if (roleError) throw roleError;

      if (!roleData || roleData.length === 0) {
        setManagers([]);
        return;
      }

      const managerIds = roleData.map(r => r.user_id);

      const { data: profilesData, error: profilesError } = await supabase
        .from('profiles')
        .select('id, first_name, last_name, email')
        .in('id', managerIds);

      if (profilesError) throw profilesError;
      setManagers(profilesData || []);
    } catch (error) {
      console.error('Error fetching managers:', error);
      setManagers([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchManagers();
  }, []);

  return { managers, loading, fetchManagers };
}
