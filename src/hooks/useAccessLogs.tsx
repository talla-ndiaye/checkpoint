import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from './useAuth';

export interface AccessLog {
  id: string;
  timestamp: string;
  action_type: string;
  site_id: string;
  user_id: string | null;
  invitation_id: string | null;
  scanned_by: string | null;
  site?: { name: string };
  user_profile?: { first_name: string; last_name: string } | null;
  invitation?: { visitor_name: string } | null;
}

interface UseAccessLogsOptions {
  startDate?: Date;
  endDate?: Date;
  actionType?: 'entry' | 'exit' | 'all';
}

export function useAccessLogs(options: UseAccessLogsOptions = {}) {
  const { user } = useAuth();
  const { startDate, endDate, actionType = 'all' } = options;

  return useQuery({
    queryKey: ['access-logs', user?.id, startDate?.toISOString(), endDate?.toISOString(), actionType],
    queryFn: async (): Promise<AccessLog[]> => {
      let query = supabase
        .from('access_logs')
        .select(`
          *,
          site:sites(name),
          invitation:invitations(visitor_name)
        `)
        .order('timestamp', { ascending: false })
        .limit(100);

      if (startDate) {
        query = query.gte('timestamp', startDate.toISOString());
      }

      if (endDate) {
        query = query.lte('timestamp', endDate.toISOString());
      }

      if (actionType !== 'all') {
        query = query.eq('action_type', actionType);
      }

      const { data, error } = await query;

      if (error) throw error;

      // Fetch user profiles separately for access logs with user_id
      const logsWithProfiles = await Promise.all(
        (data || []).map(async (log) => {
          let user_profile = null;
          if (log.user_id) {
            const { data: profile } = await supabase
              .from('profiles')
              .select('first_name, last_name')
              .eq('id', log.user_id)
              .maybeSingle();
            user_profile = profile;
          }
          return { ...log, user_profile };
        })
      );

      return logsWithProfiles;
    },
    enabled: !!user
  });
}

export function useRecentActivity(limit = 5) {
  const { user } = useAuth();

  return useQuery({
    queryKey: ['recent-activity', user?.id, limit],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('access_logs')
        .select(`
          *,
          site:sites(name),
          invitation:invitations(visitor_name)
        `)
        .order('timestamp', { ascending: false })
        .limit(limit);

      if (error) throw error;

      // Fetch user profiles separately
      const logsWithProfiles = await Promise.all(
        (data || []).map(async (log) => {
          let user_profile = null;
          if (log.user_id) {
            const { data: profile } = await supabase
              .from('profiles')
              .select('first_name, last_name')
              .eq('id', log.user_id)
              .maybeSingle();
            user_profile = profile;
          }
          return { ...log, user_profile };
        })
      );

      return logsWithProfiles;
    },
    enabled: !!user,
    refetchInterval: 10000 // Refresh every 10 seconds for real-time feel
  });
}
