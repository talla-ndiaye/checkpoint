import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { UserRole } from '@/lib/types';

export interface UserProfile {
    id: string;
    email: string;
    first_name: string;
    last_name: string;
    phone: string | null;
    created_at: string;
    roles: UserRole[];
    site_id?: string;
    site_name?: string;
    company_id?: string;
    company_name?: string;
}

export function useUsers(options?: { siteId?: string; role?: UserRole; companyId?: string }) {
    const [users, setUsers] = useState<UserProfile[]>([]);
    const [loading, setLoading] = useState(true);

    const fetchUsers = async () => {
        try {
            setLoading(true);

            // Basic profile query
            let query = supabase.from('profiles').select(`
        id,
        email,
        first_name,
        last_name,
        phone,
        created_at,
        user_roles (role)
      `);

            // If siteId is provided, we need to filter profiles that are linked to this site via guardians, companies or employees
            if (options?.siteId) {
                // This is complex for a direct SQL query via PostgREST without custom RPC or views
                // We might need to fetch IDs first or use a more complex join if available

                // For now, let's fetch all and filter client-side or do multiple lookups
                // Better: Fetch IDs from sub-tables
                const [
                    { data: guardians },
                    { data: companies }
                ] = await Promise.all([
                    supabase.from('guardians').select('user_id').eq('site_id', options.siteId),
                    supabase.from('companies').select('id, admin_id').eq('site_id', options.siteId)
                ]);

                const companyIds = options.companyId ? [options.companyId] : (companies?.map(c => c.id) || []);
                const { data: employees } = await supabase.from('employees').select('user_id').in('company_id', companyIds);

                const permittedUserIds = new Set([
                    ...(guardians?.map(g => g.user_id) || []),
                    ...(companies?.map(c => c.admin_id).filter(id => id !== null) as string[] || []),
                    ...(employees?.map(e => e.user_id) || [])
                ]);

                query = query.in('id', Array.from(permittedUserIds));
            } else if (options?.companyId) {
                const { data: employees } = await supabase.from('employees').select('user_id').eq('company_id', options.companyId);
                const { data: company } = await supabase.from('companies').select('admin_id').eq('id', options.companyId).maybeSingle();

                const permittedUserIds = new Set([
                    ...(employees?.map(e => e.user_id) || []),
                    ...(company?.admin_id ? [company.admin_id] : [])
                ]);
                query = query.in('id', Array.from(permittedUserIds));
            }

            const { data, error } = await query.order('created_at', { ascending: false });

            if (error) throw error;

            const formattedUsers: UserProfile[] = (data || []).map(p => ({
                ...p,
                roles: ((p.user_roles as any) || []).map((r: any) => r.role as UserRole)
            }));

            // Role filter
            const finalUsers = options?.role
                ? formattedUsers.filter(u => u.roles.includes(options.role!))
                : formattedUsers;

            setUsers(finalUsers);
        } catch (error: any) {
            console.error('Error fetching users:', error);
            toast.error('Erreur lors du chargement des utilisateurs');
        } finally {
            setLoading(false);
        }
    };

    const deleteUser = async (userId: string) => {
        try {
            // In a real app, you'd want a secure edge function to delete from auth.users too
            // For now, we'associated records will be deleted via CASCADE or manually

            const { error } = await supabase.from('profiles').delete().eq('id', userId);
            if (error) throw error;

            toast.success('Utilisateur supprimé');
            fetchUsers();
            return true;
        } catch (error: any) {
            toast.error('Erreur lors de la suppression : ' + error.message);
            return false;
        }
    };

    const updateUser = async (userId: string, data: { firstName?: string; lastName?: string; phone?: string; password?: string }) => {
        try {
            const { data: sessionData } = await supabase.auth.getSession();
            const token = sessionData.session?.access_token;

            if (!token) throw new Error('Session expirée');

            const { data: result, error: functionError } = await supabase.functions.invoke('update-user', {
                body: {
                    userId,
                    ...data
                }
            });

            if (functionError) throw functionError;

            toast.success('Utilisateur mis à jour');
            fetchUsers();
            return true;
        } catch (error: any) {
            toast.error(error.message);
            return false;
        }
    };

    useEffect(() => {
        fetchUsers();
    }, [options?.siteId, options?.role, options?.companyId]);

    return { users, loading, fetchUsers, deleteUser, updateUser };
}
