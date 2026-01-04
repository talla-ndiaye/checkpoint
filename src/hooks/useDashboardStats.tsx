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

      // Fetch all stats in parallel
      const [sitesResult, employeesResult, todayAccessResult, invitationsResult, weeklyAccessResult] = await Promise.all([
        supabase.from('sites').select('id', { count: 'exact', head: true }),
        supabase.from('employees').select('id', { count: 'exact', head: true }),
        supabase.from('access_logs')
          .select('id', { count: 'exact', head: true })
          .gte('timestamp', startOfToday)
          .lte('timestamp', endOfToday),
        supabase.from('invitations')
          .select('id', { count: 'exact', head: true })
          .eq('status', 'pending'),
        // Get last 7 days of access data
        supabase.from('access_logs')
          .select('timestamp, action_type')
          .gte('timestamp', subDays(today, 7).toISOString())
          .order('timestamp', { ascending: true })
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
