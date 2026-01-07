import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

export interface Manager {
  id: string;
  first_name: string;
  last_name: string;
  email: string;
  phone?: string | null;
}

export interface CreateManagerData {
  email: string;
  password: string;
  first_name: string;
  last_name: string;
  phone?: string;
}

export function useManagers() {
  const [managers, setManagers] = useState<Manager[]>([]);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

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
        .select('id, first_name, last_name, email, phone')
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

  const createManager = async (data: CreateManagerData) => {
    try {
      // Create user account
      const { data: authData, error: authError } = await supabase.auth.signUp({
        email: data.email,
        password: data.password,
        options: {
          data: {
            first_name: data.first_name,
            last_name: data.last_name,
          },
        },
      });

      if (authError) throw authError;
      if (!authData.user) throw new Error('Échec de création du compte');

      // Wait for profile trigger
      await new Promise(resolve => setTimeout(resolve, 1000));

      // Update phone if provided
      if (data.phone) {
        await supabase
          .from('profiles')
          .update({ phone: data.phone })
          .eq('id', authData.user.id);
      }

      // Assign manager role
      const { error: roleError } = await supabase
        .from('user_roles')
        .insert({
          user_id: authData.user.id,
          role: 'manager',
        });

      if (roleError) throw roleError;

      toast({
        title: 'Succès',
        description: 'Gestionnaire créé avec succès',
      });

      await fetchManagers();
      return { data: authData.user, error: null };
    } catch (error: any) {
      toast({
        title: 'Erreur',
        description: error.message || 'Impossible de créer le gestionnaire',
        variant: 'destructive',
      });
      return { data: null, error };
    }
  };

  useEffect(() => {
    fetchManagers();
  }, []);

  return { managers, loading, fetchManagers, createManager };
}
