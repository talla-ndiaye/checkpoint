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
  const isCompanyAdmin = userRole === 'company_admin';

  // Helper to get allowed site IDs
  const { data: allowedSiteIds } = useQuery({
    queryKey: ['allowed-sites', user?.id, userRole],
    queryFn: async () => {
      // SuperAdmin sees all
      if (isSuperAdmin) return null;

      if (isManager) {
        const { data: sites } = await supabase
          .from('sites')
          .select('id')
          .eq('manager_id', user?.id);
        return (sites || []).map(s => s.id);
      }

      if (isCompanyAdmin) {
        // Find company_id from employees table
        const query = (supabase as any)
          .from('employees')
          .select('company_id')
          .eq('user_id', user?.id);

        const { data: employeeData } = await query.maybeSingle();

        if (employeeData?.company_id) {
          const sitesQuery = (supabase as any)
            .from('sites')
            .select('id')
            .eq('company_id', employeeData.company_id);

          const { data: sites } = await sitesQuery;
          return (sites || []).map((s: any) => s.id);
        }
        return [];
      }

      return [];
    },
    enabled: !!user
  });

  // Fetch hourly distribution for today
  const { data: hourlyData, isLoading: isLoadingHourly } = useQuery({
    queryKey: ['analytics-hourly', user?.id, allowedSiteIds],
    queryFn: async () => {
      const today = new Date();
      const startOfToday = startOfDay(today).toISOString();
      const endOfToday = endOfDay(today).toISOString();

      // If manager/admin and no sites allowed, return empty
      if (!isSuperAdmin && allowedSiteIds && allowedSiteIds.length === 0) return [];

      let query = supabase
        .from('access_logs')
        .select('timestamp, action_type')
        .gte('timestamp', startOfToday)
        .lte('timestamp', endOfToday);

      if (allowedSiteIds) {
        query = query.in('site_id', allowedSiteIds);
      }

      const { data: logs, error } = await query;
      if (error) throw error;

      // Group by hour
      const hourlyMap = new Map<number, { entries: number; exits: number }>();
      for (let i = 0; i < 24; i++) hourlyMap.set(i, { entries: 0, exits: 0 });

      logs?.forEach(log => {
        const hour = getHours(new Date(log.timestamp));
        const current = hourlyMap.get(hour) || { entries: 0, exits: 0 };
        if (log.action_type === 'entry') current.entries++;
        else current.exits++;
        hourlyMap.set(hour, current);
      });

      return Array.from(hourlyMap.entries()).map(([hour, value]) => ({
        hour,
        entries: value.entries,
        exits: value.exits,
        total: value.entries + value.exits
      })).sort((a, b) => a.hour - b.hour);
    },
    enabled: !!user && allowedSiteIds !== undefined
  });

  // Fetch daily trends
  const { data: dailyData, isLoading: isLoadingDaily } = useQuery({
    queryKey: ['analytics-daily', dateRange, user?.id, allowedSiteIds],
    queryFn: async () => {
      const endDate = new Date();
      const startDate = subDays(endDate, dateRange);

      if (!isSuperAdmin && allowedSiteIds && allowedSiteIds.length === 0) return [];

      let query = supabase
        .from('access_logs')
        .select('timestamp, action_type, user_id, invitation_id, site_id')
        .gte('timestamp', startDate.toISOString())
        .lte('timestamp', endDate.toISOString());

      if (allowedSiteIds) {
        query = query.in('site_id', allowedSiteIds);
      }

      const { data: logs, error } = await query;
      if (error) throw error;

      const dailyMap = new Map<string, { entries: number; exits: number; employees: number; visitors: number }>();

      logs?.forEach(log => {
        const dateKey = format(new Date(log.timestamp), 'yyyy-MM-dd');
        const current = dailyMap.get(dateKey) || { entries: 0, exits: 0, employees: 0, visitors: 0 };

        if (log.action_type === 'entry') current.entries++;
        else current.exits++;

        if (log.user_id) current.employees++;
        else if (log.invitation_id) current.visitors++;

        dailyMap.set(dateKey, current);
      });

      return Array.from(dailyMap.entries()).map(([date, value]) => ({
        date,
        ...value
      })).sort((a, b) => a.date.localeCompare(b.date));
    },
    enabled: !!user && allowedSiteIds !== undefined
  });

  // Fetch site comparison
  const { data: siteComparison, isLoading: isLoadingSites } = useQuery({
    queryKey: ['analytics-sites', dateRange, user?.id, allowedSiteIds],
    queryFn: async () => {
      const endDate = new Date();
      const startDate = subDays(endDate, dateRange);

      if (!isSuperAdmin && allowedSiteIds && allowedSiteIds.length === 0) return [];

      // Get site names
      let siteNamesQuery = supabase.from('sites').select('id, name');
      if (allowedSiteIds) {
        siteNamesQuery = siteNamesQuery.in('id', allowedSiteIds);
      }
      const { data: sites } = await siteNamesQuery;
      if (!sites) return [];

      // Get logs
      let logsQuery = supabase
        .from('access_logs')
        .select('site_id, action_type, user_id, invitation_id')
        .gte('timestamp', startDate.toISOString())
        .lte('timestamp', endDate.toISOString());

      if (allowedSiteIds) {
        logsQuery = logsQuery.in('site_id', allowedSiteIds);
      }

      const { data: logs, error } = await logsQuery;
      if (error) throw error;

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
          if (log.action_type === 'entry') site.entries++;
          else site.exits++;
          if (log.user_id) site.employeeAccess++;
          else if (log.invitation_id) site.visitorAccess++;
        }
      });

      return Array.from(siteMap.values()).sort((a, b) => b.totalAccess - a.totalAccess);
    },
    enabled: !!user && allowedSiteIds !== undefined && (isSuperAdmin || isManager || isCompanyAdmin)
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
    isLoading: isLoadingHourly || isLoadingDaily || isLoadingSites || allowedSiteIds === undefined
  };
}
