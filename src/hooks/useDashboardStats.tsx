import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from './useAuth';
import { usePermissions } from './usePermissions';
import { startOfDay, endOfDay, subDays, format } from 'date-fns';

interface DashboardStats {
  sitesCount: number;
  usersCount: number;
  todayAccessCount: number;
  activeInvitationsCount: number;
  weeklyAccessData: { date: string; entries: number; exits: number }[];
}

export function useDashboardStats() {
  const { user } = useAuth();
  const { data: permissions } = usePermissions();

  return useQuery({
    queryKey: ['dashboard-stats', user?.id, permissions?.allowedSiteIds],
    queryFn: async (): Promise<DashboardStats> => {
      if (!permissions) throw new Error("Permissions not loaded");

      const today = new Date();
      const startOfToday = startOfDay(today).toISOString();
      const endOfToday = endOfDay(today).toISOString();

      // Base queries
      let sitesQuery = supabase.from('sites').select('id', { count: 'exact', head: true });
      let employeesQuery = supabase.from('employees').select('id', { count: 'exact', head: true });
      let accessLogQuery = supabase.from('access_logs')
        .select('id', { count: 'exact', head: true })
        .gte('timestamp', startOfToday)
        .lte('timestamp', endOfToday);
      let invitationsQuery = supabase.from('invitations')
        .select('id', { count: 'exact', head: true })
        .eq('status', 'pending');
      let weeklyQuery = supabase.from('access_logs')
        .select('timestamp, action_type, site_id')
        .gte('timestamp', subDays(today, 7).toISOString())
        .order('timestamp', { ascending: true });

      // Apply centralized permissions
      if (!permissions.isSuperAdmin) {
        if (permissions.allowedSiteIds && permissions.allowedSiteIds.length > 0) {
          sitesQuery = sitesQuery.in('id', permissions.allowedSiteIds);
          accessLogQuery = accessLogQuery.in('site_id', permissions.allowedSiteIds);
          weeklyQuery = weeklyQuery.in('site_id', permissions.allowedSiteIds);

          const siteCompaniesQuery = await supabase.from('companies').select('id').in('site_id', permissions.allowedSiteIds);
          const companyIds = siteCompaniesQuery.data?.map(c => c.id) || [];

          if (permissions.isCompanyAdmin && permissions.companyId) {
            employeesQuery = employeesQuery.eq('company_id', permissions.companyId);
            const { data: emps } = await supabase.from('employees').select('id').eq('company_id', permissions.companyId);
            invitationsQuery = invitationsQuery.in('employee_id', emps?.map(e => e.id) || []);
          } else {
            employeesQuery = employeesQuery.in('company_id', companyIds);
            const { data: emps } = await supabase.from('employees').select('id').in('company_id', companyIds);
            invitationsQuery = invitationsQuery.in('employee_id', emps?.map(e => e.id) || []);
          }
        } else {
          return { sitesCount: 0, usersCount: 0, todayAccessCount: 0, activeInvitationsCount: 0, weeklyAccessData: [] };
        }
      }

      const [sitesResult, employeesResult, todayAccessResult, invitationsResult, weeklyAccessResult] = await Promise.all([
        sitesQuery,
        employeesQuery,
        accessLogQuery,
        invitationsQuery,
        weeklyQuery
      ]);

      const weeklyMap = new Map<string, { entries: number; exits: number }>();
      for (let i = 6; i >= 0; i--) {
        const date = format(subDays(today, i), 'yyyy-MM-dd');
        weeklyMap.set(date, { entries: 0, exits: 0 });
      }

      if (weeklyAccessResult.data) {
        weeklyAccessResult.data.forEach(log => {
          const date = format(new Date(log.timestamp), 'yyyy-MM-dd');
          const current = weeklyMap.get(date);
          if (current) {
            if (log.action_type === 'entry') current.entries++;
            else if (log.action_type === 'exit') current.exits++;
          }
        });
      }

      return {
        sitesCount: sitesResult.count || 0,
        usersCount: employeesResult.count || 0,
        todayAccessCount: todayAccessResult.count || 0,
        activeInvitationsCount: invitationsResult.count || 0,
        weeklyAccessData: Array.from(weeklyMap.entries()).map(([date, data]) => ({
          date: format(new Date(date), 'EEE'),
          ...data
        }))
      };
    },
    enabled: !!user && !!permissions,
    refetchInterval: 30000
  });
}
