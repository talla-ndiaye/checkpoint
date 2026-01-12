import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from './useAuth';
import { startOfDay, endOfDay, subDays, format } from 'date-fns';

// Stats for Manager role
interface ManagerStats {
  companiesCount: number;
  employeesCount: number;
  guardiansCount: number;
  todayAccessCount: number;
  weeklyAccessData: { date: string; entries: number; exits: number }[];
}

export function useManagerStats() {
  const { user } = useAuth();

  return useQuery({
    queryKey: ['manager-stats', user?.id],
    queryFn: async (): Promise<ManagerStats> => {
      const today = new Date();
      const startOfToday = startOfDay(today).toISOString();
      const endOfToday = endOfDay(today).toISOString();

      // Get manager's site
      const { data: site } = await supabase
        .from('sites')
        .select('id')
        .eq('manager_id', user!.id)
        .single();

      if (!site) {
        return {
          companiesCount: 0,
          employeesCount: 0,
          guardiansCount: 0,
          todayAccessCount: 0,
          weeklyAccessData: []
        };
      }

      const [companiesResult, guardiansResult, todayAccessResult, weeklyAccessResult] = await Promise.all([
        supabase.from('companies').select('id', { count: 'exact', head: true }).eq('site_id', site.id),
        supabase.from('guardians').select('id', { count: 'exact', head: true }).eq('site_id', site.id),
        supabase.from('access_logs')
          .select('id', { count: 'exact', head: true })
          .eq('site_id', site.id)
          .gte('timestamp', startOfToday)
          .lte('timestamp', endOfToday),
        supabase.from('access_logs')
          .select('timestamp, action_type')
          .eq('site_id', site.id)
          .gte('timestamp', subDays(today, 7).toISOString())
          .order('timestamp', { ascending: true })
      ]);

      // Count employees from companies in the site
      const { data: companies } = await supabase
        .from('companies')
        .select('id')
        .eq('site_id', site.id);

      let employeesCount = 0;
      if (companies && companies.length > 0) {
        const companyIds = companies.map(c => c.id);
        const { count } = await supabase
          .from('employees')
          .select('id', { count: 'exact', head: true })
          .in('company_id', companyIds);
        employeesCount = count || 0;
      }

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
            if (log.action_type === 'entry') current.entries++;
            else if (log.action_type === 'exit') current.exits++;
          }
        });
      }

      const weeklyAccessData = Array.from(weeklyMap.entries()).map(([date, data]) => ({
        date: format(new Date(date), 'EEE'),
        ...data
      }));

      return {
        companiesCount: companiesResult.count || 0,
        employeesCount,
        guardiansCount: guardiansResult.count || 0,
        todayAccessCount: todayAccessResult.count || 0,
        weeklyAccessData
      };
    },
    enabled: !!user,
    refetchInterval: 30000
  });
}

// Stats for Company Admin role
interface CompanyAdminStats {
  employeesCount: number;
  activeInvitationsCount: number;
  todayAccessCount: number;
  weeklyInvitationsData: { date: string; created: number; used: number }[];
}

export function useCompanyAdminStats() {
  const { user } = useAuth();

  return useQuery({
    queryKey: ['company-admin-stats', user?.id],
    queryFn: async (): Promise<CompanyAdminStats> => {
      const today = new Date();
      const startOfToday = startOfDay(today).toISOString();
      const endOfToday = endOfDay(today).toISOString();

      // Get company where user is admin
      const { data: company } = await supabase
        .from('companies')
        .select('id')
        .eq('admin_id', user!.id)
        .single();

      if (!company) {
        return {
          employeesCount: 0,
          activeInvitationsCount: 0,
          todayAccessCount: 0,
          weeklyInvitationsData: []
        };
      }

      // Get employees in this company
      const { data: employees } = await supabase
        .from('employees')
        .select('id, user_id')
        .eq('company_id', company.id);

      const employeeIds = employees?.map(e => e.id) || [];
      const employeeUserIds = employees?.map(e => e.user_id) || [];

      const [activeInvitationsResult, todayAccessResult, weeklyInvitationsResult] = await Promise.all([
        employeeIds.length > 0
          ? supabase.from('invitations')
              .select('id', { count: 'exact', head: true })
              .in('employee_id', employeeIds)
              .eq('status', 'pending')
          : { count: 0 },
        employeeUserIds.length > 0
          ? supabase.from('access_logs')
              .select('id', { count: 'exact', head: true })
              .in('user_id', employeeUserIds)
              .gte('timestamp', startOfToday)
              .lte('timestamp', endOfToday)
          : { count: 0 },
        employeeIds.length > 0
          ? supabase.from('invitations')
              .select('created_at, status')
              .in('employee_id', employeeIds)
              .gte('created_at', subDays(today, 7).toISOString())
          : { data: [] }
      ]);

      // Process weekly invitations data
      const weeklyMap = new Map<string, { created: number; used: number }>();
      for (let i = 6; i >= 0; i--) {
        const date = format(subDays(today, i), 'yyyy-MM-dd');
        weeklyMap.set(date, { created: 0, used: 0 });
      }

      if (weeklyInvitationsResult.data) {
        weeklyInvitationsResult.data.forEach(inv => {
          const date = format(new Date(inv.created_at), 'yyyy-MM-dd');
          const current = weeklyMap.get(date);
          if (current) {
            current.created++;
            if (inv.status === 'used') current.used++;
          }
        });
      }

      const weeklyInvitationsData = Array.from(weeklyMap.entries()).map(([date, data]) => ({
        date: format(new Date(date), 'EEE'),
        ...data
      }));

      return {
        employeesCount: employees?.length || 0,
        activeInvitationsCount: (activeInvitationsResult as any).count || 0,
        todayAccessCount: (todayAccessResult as any).count || 0,
        weeklyInvitationsData
      };
    },
    enabled: !!user,
    refetchInterval: 30000
  });
}

// Stats for Employee role
interface EmployeeStats {
  myInvitationsCount: number;
  pendingInvitationsCount: number;
  usedInvitationsCount: number;
  myAccessCount: number;
  recentInvitations: { visitorName: string; visitDate: string; status: string }[];
}

export function useEmployeeStats() {
  const { user } = useAuth();

  return useQuery({
    queryKey: ['employee-stats', user?.id],
    queryFn: async (): Promise<EmployeeStats> => {
      // Get employee record
      const { data: employee } = await supabase
        .from('employees')
        .select('id')
        .eq('user_id', user!.id)
        .single();

      if (!employee) {
        return {
          myInvitationsCount: 0,
          pendingInvitationsCount: 0,
          usedInvitationsCount: 0,
          myAccessCount: 0,
          recentInvitations: []
        };
      }

      const [invitationsResult, pendingResult, usedResult, accessResult, recentResult] = await Promise.all([
        supabase.from('invitations')
          .select('id', { count: 'exact', head: true })
          .eq('employee_id', employee.id),
        supabase.from('invitations')
          .select('id', { count: 'exact', head: true })
          .eq('employee_id', employee.id)
          .eq('status', 'pending'),
        supabase.from('invitations')
          .select('id', { count: 'exact', head: true })
          .eq('employee_id', employee.id)
          .eq('status', 'used'),
        supabase.from('access_logs')
          .select('id', { count: 'exact', head: true })
          .eq('user_id', user!.id),
        supabase.from('invitations')
          .select('visitor_name, visit_date, status')
          .eq('employee_id', employee.id)
          .order('created_at', { ascending: false })
          .limit(5)
      ]);

      const recentInvitations = (recentResult.data || []).map(inv => ({
        visitorName: inv.visitor_name,
        visitDate: inv.visit_date,
        status: inv.status
      }));

      return {
        myInvitationsCount: invitationsResult.count || 0,
        pendingInvitationsCount: pendingResult.count || 0,
        usedInvitationsCount: usedResult.count || 0,
        myAccessCount: accessResult.count || 0,
        recentInvitations
      };
    },
    enabled: !!user,
    refetchInterval: 30000
  });
}

// Stats for Guardian role
interface GuardianStats {
  todayScansCount: number;
  todayEntriesCount: number;
  todayExitsCount: number;
  weeklyScansData: { date: string; scans: number }[];
}

export function useGuardianStats() {
  const { user } = useAuth();

  return useQuery({
    queryKey: ['guardian-stats', user?.id],
    queryFn: async (): Promise<GuardianStats> => {
      const today = new Date();
      const startOfToday = startOfDay(today).toISOString();
      const endOfToday = endOfDay(today).toISOString();

      // Get guardian's site
      const { data: guardian } = await supabase
        .from('guardians')
        .select('site_id')
        .eq('user_id', user!.id)
        .single();

      if (!guardian) {
        return {
          todayScansCount: 0,
          todayEntriesCount: 0,
          todayExitsCount: 0,
          weeklyScansData: []
        };
      }

      const [todayLogsResult, weeklyLogsResult] = await Promise.all([
        supabase.from('access_logs')
          .select('action_type')
          .eq('scanned_by', user!.id)
          .gte('timestamp', startOfToday)
          .lte('timestamp', endOfToday),
        supabase.from('access_logs')
          .select('timestamp')
          .eq('scanned_by', user!.id)
          .gte('timestamp', subDays(today, 7).toISOString())
      ]);

      let todayEntriesCount = 0;
      let todayExitsCount = 0;
      if (todayLogsResult.data) {
        todayLogsResult.data.forEach(log => {
          if (log.action_type === 'entry') todayEntriesCount++;
          else if (log.action_type === 'exit') todayExitsCount++;
        });
      }

      // Process weekly data
      const weeklyMap = new Map<string, number>();
      for (let i = 6; i >= 0; i--) {
        const date = format(subDays(today, i), 'yyyy-MM-dd');
        weeklyMap.set(date, 0);
      }

      if (weeklyLogsResult.data) {
        weeklyLogsResult.data.forEach(log => {
          const date = format(new Date(log.timestamp), 'yyyy-MM-dd');
          const current = weeklyMap.get(date);
          if (current !== undefined) {
            weeklyMap.set(date, current + 1);
          }
        });
      }

      const weeklyScansData = Array.from(weeklyMap.entries()).map(([date, scans]) => ({
        date: format(new Date(date), 'EEE'),
        scans
      }));

      return {
        todayScansCount: todayLogsResult.data?.length || 0,
        todayEntriesCount,
        todayExitsCount,
        weeklyScansData
      };
    },
    enabled: !!user,
    refetchInterval: 30000
  });
}
