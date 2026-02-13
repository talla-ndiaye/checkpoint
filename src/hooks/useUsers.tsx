import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { UserRole } from '@/lib/types';
import { usePermissions } from './usePermissions';

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
    const queryClient = useQueryClient();
    const { data: permissions } = usePermissions();

    const fetchUsersQuery = useQuery({
        queryKey: ['users', options, permissions?.allowedSiteIds],
        queryFn: async (): Promise<UserProfile[]> => {
            if (!permissions) return [];

            let query = supabase.from('profiles').select(`
                id,
                email,
                first_name,
                last_name,
                phone,
                created_at,
                user_roles (role)
            `);

            // Apply broad permissions first
            if (!permissions.isSuperAdmin) {
                if (permissions.allowedSiteIds) {
                    const [
                        { data: guardians },
                        { data: companies }
                    ] = await Promise.all([
                        supabase.from('guardians').select('user_id').in('site_id', permissions.allowedSiteIds),
                        supabase.from('companies').select('id, admin_id').in('site_id', permissions.allowedSiteIds)
                    ]);

                    const compIdsForEmp = permissions.allowedCompanyIds || (companies?.map(c => c.id) || []);
                    const { data: employees } = await supabase.from('employees').select('user_id').in('company_id', compIdsForEmp);

                    const permittedUserIds = new Set([
                        ...(guardians?.map(g => g.user_id) || []),
                        ...(companies?.map(c => c.admin_id).filter(id => id !== null) as string[] || []),
                        ...(employees?.map(e => e.user_id) || [])
                    ]);

                    query = query.in('id', Array.from(permittedUserIds));
                }
            }

            if (options?.siteId) {
                // Additional filter if needed, though permissions might already cover it
                const { data: siteUsers } = await (supabase.rpc as any)('get_site_user_ids', { p_site_id: options.siteId });
                if (Array.isArray(siteUsers)) {
                    query = query.in('id', siteUsers.map((u: any) => u.user_id));
                }
            }

            const { data, error } = await query.order('created_at', { ascending: false });
            if (error) throw error;

            const formattedUsers: UserProfile[] = (data || []).map(p => ({
                ...p,
                roles: ((p.user_roles as any) || []).map((r: any) => r.role as UserRole)
            }));

            // Final functional filter for roles
            const finalUsers = options?.role
                ? formattedUsers.filter(u => u.roles.includes(options.role!))
                : formattedUsers;

            return finalUsers;
        },
        enabled: !!permissions,
    });

    const updateUserMutation = useMutation({
        mutationFn: async ({ userId, data }: { userId: string, data: any }) => {
            const { data: result, error } = await supabase.functions.invoke('update-user', {
                body: { userId, ...data }
            });
            if (error) throw error;
            return true;
        },
        onSuccess: () => {
            toast.success('Utilisateur mis à jour');
            queryClient.invalidateQueries({ queryKey: ['users'] });
        },
        onError: (error: any) => {
            toast.error(error.message);
        }
    });

    const deleteUserMutation = useMutation({
        mutationFn: async (userId: string) => {
            const { error } = await supabase.from('profiles').delete().eq('id', userId);
            if (error) throw error;
        },
        onSuccess: () => {
            toast.success('Utilisateur supprimé');
            queryClient.invalidateQueries({ queryKey: ['users'] });
        },
        onError: (error: any) => {
            toast.error('Erreur lors de la suppression : ' + error.message);
        }
    });

    return {
        users: fetchUsersQuery.data || [],
        loading: fetchUsersQuery.isLoading,
        fetchUsers: fetchUsersQuery.refetch,
        updateUser: (userId: string, data: any) => updateUserMutation.mutateAsync({ userId, data }),
        deleteUser: (userId: string) => deleteUserMutation.mutateAsync(userId)
    };
}
