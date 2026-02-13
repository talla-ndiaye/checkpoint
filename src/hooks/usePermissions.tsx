import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from './useAuth';

export interface UserPermissions {
    isSuperAdmin: boolean;
    isManager: boolean;
    isCompanyAdmin: boolean;
    isGuardian: boolean;
    allowedSiteIds: string[] | null; // null means all sites (super admin)
    allowedCompanyIds: string[] | null; // null means all companies within allowed sites
    managerSiteId?: string; // If manager, the specific site they manage (legacy support)
    companyId?: string; // If company admin, their company
}

export function usePermissions() {
    const { user, userRole } = useAuth();

    return useQuery({
        queryKey: ['user-permissions', user?.id, userRole],
        queryFn: async (): Promise<UserPermissions> => {
            const isSuperAdmin = userRole === 'super_admin';
            const isManager = userRole === 'manager';
            const isCompanyAdmin = userRole === 'company_admin';
            const isGuardian = userRole === 'guardian';

            let allowedSiteIds: string[] | null = null;
            let allowedCompanyIds: string[] | null = null;
            let managerSiteId: string | undefined;
            let companyId: string | undefined;

            if (!isSuperAdmin) {
                if (isManager) {
                    const { data: sites } = await supabase
                        .from('sites')
                        .select('id')
                        .eq('manager_id', user?.id);
                    allowedSiteIds = (sites || []).map(s => s.id);
                } else if (isCompanyAdmin) {
                    const { data: company } = await supabase
                        .from('companies')
                        .select('id, site_id')
                        .eq('admin_id', user?.id)
                        .maybeSingle();

                    if (company) {
                        allowedSiteIds = [company.site_id];
                        allowedCompanyIds = [company.id];
                        companyId = company.id;
                    } else {
                        allowedSiteIds = [];
                        allowedCompanyIds = [];
                    }
                } else if (isGuardian) {
                    const { data: guardian } = await supabase
                        .from('guardians')
                        .select('site_id')
                        .eq('user_id', user?.id)
                        .maybeSingle();

                    if (guardian) {
                        allowedSiteIds = [guardian.site_id];
                    } else {
                        allowedSiteIds = [];
                    }
                }
            }

            return {
                isSuperAdmin,
                isManager,
                isCompanyAdmin,
                isGuardian,
                allowedSiteIds,
                allowedCompanyIds,
                managerSiteId,
                companyId
            };
        },
        enabled: !!user && !!userRole,
        staleTime: 1000 * 60 * 5, // 5 minutes
    });
}
