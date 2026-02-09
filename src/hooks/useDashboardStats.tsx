import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from './useAuth';
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

  return useQuery({
    queryKey: ['dashboard-stats', user?.id],
    queryFn: async (): Promise<DashboardStats> => {
      const today = new Date();
      const startOfToday = startOfDay(today).toISOString();
      const endOfToday = endOfDay(today).toISOString();

      // Get user role and related site/company info if needed
      const { data: userRoleData } = await supabase
        .from('user_roles')
        .select('role')
        .eq('user_id', user?.id)
        .maybeSingle();

      const role = userRoleData?.role;

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

      // Apply role-based filtering
      if (role === 'manager') {
        const { data: managedSites } = await supabase
          .from('sites')
          .select('id')
          .eq('manager_id', user?.id);

        const siteIds = managedSites?.map(s => s.id) || [];

        if (siteIds.length > 0) {
          sitesQuery = sitesQuery.in('id', siteIds);
          employeesQuery = employeesQuery.in('company_id', (await supabase.from('companies').select('id').in('site_id', siteIds)).data?.map(c => c.id) || []);
          accessLogQuery = accessLogQuery.in('site_id', siteIds);
          // For invitations, we need to filter by employees who belong to companies in these sites
          const { data: companies } = await supabase.from('companies').select('id').in('site_id', siteIds);
          const companyIds = companies?.map(c => c.id) || [];
          const { data: emps } = await supabase.from('employees').select('id').in('company_id', companyIds);
          const empIds = emps?.map(e => e.id) || [];
          invitationsQuery = invitationsQuery.in('employee_id', empIds);
          weeklyQuery = weeklyQuery.in('site_id', siteIds);
        } else {
          // No sites managed, return empty stats
          return {
            sitesCount: 0,
            usersCount: 0,
            todayAccessCount: 0,
            activeInvitationsCount: 0,
            weeklyAccessData: []
          };
        }
      } else if (role === 'company_admin') {
        const { data: company } = await supabase
          .from('companies')
          .select('id, site_id')
          .eq('admin_id', user?.id)
          .maybeSingle();

        if (company) {
          sitesQuery = sitesQuery.eq('id', company.site_id);
          employeesQuery = employeesQuery.eq('company_id', company.id);
          accessLogQuery = accessLogQuery.eq('site_id', company.site_id); // Tentative, might need more filtering
          const { data: emps } = await supabase.from('employees').select('id').eq('company_id', company.id);
          const empIds = emps?.map(e => e.id) || [];
          invitationsQuery = invitationsQuery.in('employee_id', empIds);
          weeklyQuery = weeklyQuery.eq('site_id', company.site_id);
        }
      } else if (role === 'guardian') {
        const { data: guardian } = await supabase
          .from('guardians')
          .select('site_id')
          .eq('user_id', user?.id)
          .maybeSingle();

        if (guardian) {
          sitesQuery = sitesQuery.eq('id', guardian.site_id);
          // Guardians probably don't need to see total employee count of the whole system
          employeesQuery = employeesQuery.in('company_id', (await supabase.from('companies').select('id').eq('site_id', guardian.site_id)).data?.map(c => c.id) || []);
          accessLogQuery = accessLogQuery.eq('site_id', guardian.site_id);
          weeklyQuery = weeklyQuery.eq('site_id', guardian.site_id);
          // Invitations for this site
          const { data: companies } = await supabase.from('companies').select('id').eq('site_id', guardian.site_id);
          const companyIds = companies?.map(c => c.id) || [];
          const { data: emps } = await supabase.from('employees').select('id').in('company_id', companyIds);
          const empIds = emps?.map(e => e.id) || [];
          invitationsQuery = invitationsQuery.in('employee_id', empIds);
        }
      }

      // Fetch filtered stats in parallel
      const [sitesResult, employeesResult, todayAccessResult, invitationsResult, weeklyAccessResult] = await Promise.all([
        sitesQuery,
        employeesQuery,
        accessLogQuery,
        invitationsQuery,
        weeklyQuery
      ]);

      // Process weekly data
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
            if (log.action_type === 'entry') {
              current.entries++;
            } else if (log.action_type === 'exit') {
              current.exits++;
            }
          }
        });
      }

      const weeklyAccessData = Array.from(weeklyMap.entries()).map(([date, data]) => ({
        date: format(new Date(date), 'EEE'),
        ...data
      }));

      return {
        sitesCount: sitesResult.count || 0,
        usersCount: employeesResult.count || 0,
        todayAccessCount: todayAccessResult.count || 0,
        activeInvitationsCount: invitationsResult.count || 0,
        weeklyAccessData
      };
    },
    enabled: !!user,
    refetchInterval: 30000 // Refresh every 30 seconds
  });
}
