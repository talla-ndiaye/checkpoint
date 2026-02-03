import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { startOfDay, endOfDay, subDays, format, startOfHour, getHours } from 'date-fns';

interface HourlyData {
  hour: number;
  entries: number;
  exits: number;
  total: number;
}

interface DailyData {
  date: string;
  entries: number;
  exits: number;
  employees: number;
  visitors: number;
}

interface SiteComparison {
  siteId: string;
  siteName: string;
  totalAccess: number;
  entries: number;
  exits: number;
  employeeAccess: number;
  visitorAccess: number;
}

interface PeakHour {
  hour: number;
  count: number;
  label: string;
}

export function useAdvancedAnalytics(dateRange: number = 7) {
  const { user, userRole } = useAuth();
  const isSuperAdmin = userRole === 'super_admin';
  const isManager = userRole === 'manager';

  // Fetch hourly distribution for today
  const { data: hourlyData, isLoading: isLoadingHourly } = useQuery({
    queryKey: ['analytics-hourly', user?.id],
    queryFn: async () => {
      const today = new Date();
      const startOfToday = startOfDay(today).toISOString();
      const endOfToday = endOfDay(today).toISOString();

      let query = supabase
        .from('access_logs')
        .select('timestamp, action_type')
        .gte('timestamp', startOfToday)
        .lte('timestamp', endOfToday);

      // Apply site filter for managers
      if (isManager && !isSuperAdmin) {
        const { data: sites } = await supabase
          .from('sites')
          .select('id')
          .eq('manager_id', user?.id);
        
        if (sites && sites.length > 0) {
          query = query.in('site_id', sites.map(s => s.id));
        }
      }

      const { data: logs, error } = await query;
      if (error) throw error;

      // Group by hour
      const hourlyMap = new Map<number, { entries: number; exits: number }>();
      
      for (let i = 0; i < 24; i++) {
        hourlyMap.set(i, { entries: 0, exits: 0 });
      }

      logs?.forEach(log => {
        const hour = getHours(new Date(log.timestamp));
        const current = hourlyMap.get(hour) || { entries: 0, exits: 0 };
        if (log.action_type === 'entry') {
          current.entries++;
        } else {
          current.exits++;
        }
        hourlyMap.set(hour, current);
      });

      const result: HourlyData[] = [];
      hourlyMap.forEach((value, hour) => {
        result.push({
          hour,
          entries: value.entries,
          exits: value.exits,
          total: value.entries + value.exits
        });
      });

      return result.sort((a, b) => a.hour - b.hour);
    },
    enabled: !!user
  });

  // Fetch daily trends
  const { data: dailyData, isLoading: isLoadingDaily } = useQuery({
    queryKey: ['analytics-daily', dateRange, user?.id],
    queryFn: async () => {
      const endDate = new Date();
      const startDate = subDays(endDate, dateRange);

      let query = supabase
        .from('access_logs')
        .select('timestamp, action_type, user_id, invitation_id, site_id')
        .gte('timestamp', startDate.toISOString())
        .lte('timestamp', endDate.toISOString());

      // Apply site filter for managers
      if (isManager && !isSuperAdmin) {
        const { data: sites } = await supabase
          .from('sites')
          .select('id')
          .eq('manager_id', user?.id);
        
        if (sites && sites.length > 0) {
          query = query.in('site_id', sites.map(s => s.id));
        }
      }

      const { data: logs, error } = await query;
      if (error) throw error;

      // Group by date
      const dailyMap = new Map<string, { entries: number; exits: number; employees: number; visitors: number }>();

      logs?.forEach(log => {
        const dateKey = format(new Date(log.timestamp), 'yyyy-MM-dd');
        const current = dailyMap.get(dateKey) || { entries: 0, exits: 0, employees: 0, visitors: 0 };
        
        if (log.action_type === 'entry') {
          current.entries++;
        } else {
          current.exits++;
        }
        
        if (log.user_id) {
          current.employees++;
        } else if (log.invitation_id) {
          current.visitors++;
        }
        
        dailyMap.set(dateKey, current);
      });

      const result: DailyData[] = [];
      dailyMap.forEach((value, date) => {
        result.push({
          date,
          ...value
        });
      });

      return result.sort((a, b) => a.date.localeCompare(b.date));
    },
    enabled: !!user
  });

  // Fetch site comparison (super admin / manager only)
  const { data: siteComparison, isLoading: isLoadingSites } = useQuery({
    queryKey: ['analytics-sites', dateRange, user?.id],
    queryFn: async () => {
      const endDate = new Date();
      const startDate = subDays(endDate, dateRange);

      // First get sites the user can access
      let sitesQuery = supabase.from('sites').select('id, name');
      
      if (isManager && !isSuperAdmin) {
        sitesQuery = sitesQuery.eq('manager_id', user?.id);
      }

      const { data: sites, error: sitesError } = await sitesQuery;
      if (sitesError) throw sitesError;

      if (!sites || sites.length === 0) return [];

      // Get access logs for these sites
      const { data: logs, error: logsError } = await supabase
        .from('access_logs')
        .select('site_id, action_type, user_id, invitation_id')
        .in('site_id', sites.map(s => s.id))
        .gte('timestamp', startDate.toISOString())
        .lte('timestamp', endDate.toISOString());

      if (logsError) throw logsError;

      // Group by site
      const siteMap = new Map<string, SiteComparison>();

      sites.forEach(site => {
        siteMap.set(site.id, {
          siteId: site.id,
          siteName: site.name,
          totalAccess: 0,
          entries: 0,
          exits: 0,
          employeeAccess: 0,
          visitorAccess: 0
        });
      });

      logs?.forEach(log => {
        const site = siteMap.get(log.site_id);
        if (site) {
          site.totalAccess++;
          if (log.action_type === 'entry') {
            site.entries++;
          } else {
            site.exits++;
          }
          if (log.user_id) {
            site.employeeAccess++;
          } else if (log.invitation_id) {
            site.visitorAccess++;
          }
        }
      });

      return Array.from(siteMap.values()).sort((a, b) => b.totalAccess - a.totalAccess);
    },
    enabled: !!user && (isSuperAdmin || isManager)
  });

  // Calculate peak hours
  const peakHours: PeakHour[] = hourlyData 
    ? hourlyData
        .filter(h => h.total > 0)
        .sort((a, b) => b.total - a.total)
        .slice(0, 3)
        .map(h => ({
          hour: h.hour,
          count: h.total,
          label: `${h.hour.toString().padStart(2, '0')}:00 - ${(h.hour + 1).toString().padStart(2, '0')}:00`
        }))
    : [];

  return {
    hourlyData,
    dailyData,
    siteComparison,
    peakHours,
    isLoading: isLoadingHourly || isLoadingDaily || isLoadingSites
  };
}
