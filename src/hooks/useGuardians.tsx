import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

export interface Guardian {
  id: string;
  user_id: string;
  site_id: string;
  created_at: string;
  profile?: {
    id: string;
    first_name: string;
    last_name: string;
    email: string;
    phone: string | null;
  };
}

export function useGuardians() {
  const [guardians, setGuardians] = useState<Guardian[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchGuardians = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('guardians')
        .select(`
          id,
          user_id,
          site_id,
          created_at
        `)
        .order('created_at', { ascending: false });

      if (error) throw error;

      // Fetch profiles for guardians
      if (data && data.length > 0) {
        const userIds = data.map(g => g.user_id);
        const { data: profiles, error: profilesError } = await supabase
          .from('profiles')
          .select('id, first_name, last_name, email, phone')
          .in('id', userIds);

        if (profilesError) throw profilesError;

        const guardiansWithProfiles = data.map(guardian => ({
          ...guardian,
          profile: profiles?.find(p => p.id === guardian.user_id)
        }));

        setGuardians(guardiansWithProfiles);
      } else {
        setGuardians([]);
      }
    } catch (error) {
      console.error('Error fetching guardians:', error);
      toast.error('Erreur lors du chargement des gardiens');
    } finally {
      setLoading(false);
    }
  };

  const createGuardian = async (data: {
    email: string;
    password: string;
    firstName: string;
    lastName: string;
    phone?: string;
    siteId: string;
  }) => {
    try {
      // Create user account
      const { data: authData, error: authError } = await supabase.auth.signUp({
        email: data.email,
        password: data.password,
        options: {
          data: {
            first_name: data.firstName,
            last_name: data.lastName,
          }
        }
      });

      if (authError) throw authError;
      if (!authData.user) throw new Error('Échec de création du compte');

      // Update profile with phone
      if (data.phone) {
        await supabase
          .from('profiles')
          .update({ phone: data.phone })
          .eq('id', authData.user.id);
      }

      // Create guardian record
      const { error: guardianError } = await supabase
        .from('guardians')
        .insert({
          user_id: authData.user.id,
          site_id: data.siteId
        });

      if (guardianError) throw guardianError;

      // Assign guardian role
      const { error: roleError } = await supabase
        .from('user_roles')
        .insert({
          user_id: authData.user.id,
          role: 'guardian'
        });

      if (roleError) throw roleError;

      toast.success('Gardien créé avec succès');
      fetchGuardians();
      return true;
    } catch (error: any) {
      console.error('Error creating guardian:', error);
      toast.error(error.message || 'Erreur lors de la création du gardien');
      return false;
    }
  };

  const deleteGuardian = async (guardianId: string, userId: string) => {
    try {
      // Delete guardian record
      const { error: guardianError } = await supabase
        .from('guardians')
        .delete()
        .eq('id', guardianId);

      if (guardianError) throw guardianError;

      // Delete role
      const { error: roleError } = await supabase
        .from('user_roles')
        .delete()
        .eq('user_id', userId)
        .eq('role', 'guardian');

      if (roleError) throw roleError;

      toast.success('Gardien supprimé avec succès');
      fetchGuardians();
      return true;
    } catch (error) {
      console.error('Error deleting guardian:', error);
      toast.error('Erreur lors de la suppression du gardien');
      return false;
    }
  };

  useEffect(() => {
    fetchGuardians();
  }, []);

  return { guardians, loading, fetchGuardians, createGuardian, deleteGuardian };
}
