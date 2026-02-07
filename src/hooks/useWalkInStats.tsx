import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from './useAuth';
import { startOfDay, endOfDay, differenceInMinutes } from 'date-fns';

interface WalkInStats {
  todayEntries: number;
  todayExits: number;
  pendingExits: number;
  averageStayMinutes: number | null;
}

export function useWalkInStats() {
  const { user } = useAuth();

  return useQuery({
    queryKey: ['walk-in-stats', user?.id],
    queryFn: async (): Promise<WalkInStats> => {
      const today = new Date();
      const start = startOfDay(today).toISOString();
      const end = endOfDay(today).toISOString();

      // Get today's walk-in visitors
      const { data: todayVisitors, error } = await supabase
        .from('walk_in_visitors')
        .select('id, created_at, exit_validated, exit_at')
        .gte('created_at', start)
        .lte('created_at', end);

      if (error) throw error;

      const visitors = todayVisitors || [];
      const todayEntries = visitors.length;
      const todayExits = visitors.filter(v => v.exit_validated).length;
      const pendingExits = todayEntries - todayExits;

      // Calculate average stay duration for visitors who have exited
      const exitedVisitors = visitors.filter(v => v.exit_validated && v.exit_at);
      let averageStayMinutes: number | null = null;

      if (exitedVisitors.length > 0) {
        const totalMinutes = exitedVisitors.reduce((sum, v) => {
          return sum + differenceInMinutes(new Date(v.exit_at!), new Date(v.created_at));
        }, 0);
        averageStayMinutes = Math.round(totalMinutes / exitedVisitors.length);
      }

      return { todayEntries, todayExits, pendingExits, averageStayMinutes };
    },
    enabled: !!user,
    refetchInterval: 30000
  });
}
