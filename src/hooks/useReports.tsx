import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';

export interface ReportData {
  totalAccess: number;
  totalEntries: number;
  totalExits: number;
  totalVisitors: number;
  totalEmployees: number;
  accessByDay: { date: string; entries: number; exits: number }[];
  accessByHour: { hour: string; count: number }[];
  topCompanies: { name: string; count: number }[];
}

export function useReports(startDate: Date, endDate: Date) {
  const [data, setData] = useState<ReportData | null>(null);
  const [loading, setLoading] = useState(true);

  const fetchReports = async () => {
    try {
      setLoading(true);

      const startStr = startDate.toISOString();
      const endStr = endDate.toISOString();

      // Fetch access logs for the period
      const { data: logs, error } = await supabase
        .from('access_logs')
        .select('*')
        .gte('timestamp', startStr)
        .lte('timestamp', endStr)
        .order('timestamp', { ascending: true });

      if (error) throw error;

      const accessLogs = logs || [];

      // Calculate totals
      const totalEntries = accessLogs.filter(l => l.action_type === 'entry').length;
      const totalExits = accessLogs.filter(l => l.action_type === 'exit').length;
      const totalVisitors = accessLogs.filter(l => l.invitation_id).length;
      const totalEmployees = accessLogs.filter(l => l.user_id).length;

      // Group by day
      const byDay = new Map<string, { entries: number; exits: number }>();
      accessLogs.forEach(log => {
        const day = new Date(log.timestamp).toISOString().split('T')[0];
        const current = byDay.get(day) || { entries: 0, exits: 0 };
        if (log.action_type === 'entry') current.entries++;
        else current.exits++;
        byDay.set(day, current);
      });

      const accessByDay = Array.from(byDay.entries()).map(([date, counts]) => ({
        date,
        ...counts
      }));

      // Group by hour
      const byHour = new Map<string, number>();
      for (let i = 0; i < 24; i++) {
        byHour.set(`${i.toString().padStart(2, '0')}h`, 0);
      }
      accessLogs.forEach(log => {
        const hour = `${new Date(log.timestamp).getHours().toString().padStart(2, '0')}h`;
        byHour.set(hour, (byHour.get(hour) || 0) + 1);
      });

      const accessByHour = Array.from(byHour.entries()).map(([hour, count]) => ({
        hour,
        count
      }));

      // Get top companies by employee access
      const employeeUserIds = accessLogs
        .filter(l => l.user_id)
        .map(l => l.user_id);

      let topCompanies: { name: string; count: number }[] = [];

      if (employeeUserIds.length > 0) {
        const { data: employees } = await supabase
          .from('employees')
          .select('user_id, company_id')
          .in('user_id', employeeUserIds);

        if (employees) {
          const companyIds = [...new Set(employees.map(e => e.company_id))];
          const { data: companies } = await supabase
            .from('companies')
            .select('id, name')
            .in('id', companyIds);

          const companyCounts = new Map<string, number>();
          employees.forEach(emp => {
            const count = employeeUserIds.filter(id => id === emp.user_id).length;
            const company = companies?.find(c => c.id === emp.company_id);
            if (company) {
              companyCounts.set(
                company.name,
                (companyCounts.get(company.name) || 0) + count
              );
            }
          });

          topCompanies = Array.from(companyCounts.entries())
            .map(([name, count]) => ({ name, count }))
            .sort((a, b) => b.count - a.count)
            .slice(0, 5);
        }
      }

      setData({
        totalAccess: accessLogs.length,
        totalEntries,
        totalExits,
        totalVisitors,
        totalEmployees,
        accessByDay,
        accessByHour,
        topCompanies
      });
    } catch (error) {
      console.error('Error fetching reports:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchReports();
  }, [startDate.toISOString(), endDate.toISOString()]);

  return { data, loading, refetch: fetchReports };
}
