import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { HourlyChart } from '@/components/analytics/HourlyChart';
import { DailyTrendChart } from '@/components/analytics/DailyTrendChart';
import { SiteComparisonChart } from '@/components/analytics/SiteComparisonChart';
import { PeakHoursCard } from '@/components/analytics/PeakHoursCard';
import { ScheduledReportsPanel } from '@/components/reports/ScheduledReportsPanel';
import { SendReportDialog } from '@/components/reports/SendReportDialog';
import { useAuth } from '@/hooks/useAuth';
import { useAdvancedAnalytics } from '@/hooks/useAdvancedAnalytics';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { BarChart3, FileText, TrendingUp } from 'lucide-react';

export default function Analytics() {
  const navigate = useNavigate();
  const { user, userRole, loading } = useAuth();
  const { hourlyData, dailyData, siteComparison, peakHours, isLoading } = useAdvancedAnalytics();

  const canAccess = userRole === 'super_admin' || userRole === 'manager';

  useEffect(() => {
    if (!loading && !user) {
      navigate('/auth');
    }
    if (!loading && user && !canAccess) {
      navigate('/dashboard');
    }
  }, [user, loading, canAccess, navigate]);

  if (loading) {
    return (
      <DashboardLayout>
        <div className="flex items-center justify-center h-64">
          <div className="animate-pulse text-muted-foreground">Chargement...</div>
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold">Analytiques avancées</h1>
            <p className="text-muted-foreground">
              Statistiques détaillées et planification de rapports
            </p>
          </div>
          <SendReportDialog />
        </div>

        <Tabs defaultValue="dashboard" className="space-y-6">
          <TabsList>
            <TabsTrigger value="dashboard" className="flex items-center gap-2">
              <BarChart3 className="h-4 w-4" />
              Dashboard
            </TabsTrigger>
            <TabsTrigger value="trends" className="flex items-center gap-2">
              <TrendingUp className="h-4 w-4" />
              Tendances
            </TabsTrigger>
            <TabsTrigger value="reports" className="flex items-center gap-2">
              <FileText className="h-4 w-4" />
              Rapports planifiés
            </TabsTrigger>
          </TabsList>

          <TabsContent value="dashboard" className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              <div className="lg:col-span-2">
                <HourlyChart data={hourlyData || []} isLoading={isLoading} />
              </div>
              <PeakHoursCard peakHours={peakHours} isLoading={isLoading} />
            </div>

            {(userRole === 'super_admin' || userRole === 'manager') && (
              <SiteComparisonChart data={siteComparison || []} isLoading={isLoading} />
            )}
          </TabsContent>

          <TabsContent value="trends" className="space-y-6">
            <DailyTrendChart data={dailyData || []} isLoading={isLoading} />
            
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <HourlyChart data={hourlyData || []} isLoading={isLoading} />
              <PeakHoursCard peakHours={peakHours} isLoading={isLoading} />
            </div>
          </TabsContent>

          <TabsContent value="reports">
            <ScheduledReportsPanel />
          </TabsContent>
        </Tabs>
      </div>
    </DashboardLayout>
  );
}
