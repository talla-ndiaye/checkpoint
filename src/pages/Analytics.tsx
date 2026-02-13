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
import { BarChart3, FileText, TrendingUp, Presentation, Loader2 } from 'lucide-react';

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
        <div className="flex flex-col items-center justify-center py-24 gap-4">
          <Loader2 className="h-12 w-12 animate-spin text-primary" />
          <p className="text-muted-foreground font-black animate-pulse uppercase">Analyse des données...</p>
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      <div className="space-y-8 animate-fade-in">
        {/* Unified Page Header */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="flex items-center gap-5">
            <div className="h-16 w-16 rounded-3xl bg-primary/10 flex items-center justify-center shadow-inner">
              <BarChart3 className="h-8 w-8 text-primary" />
            </div>
            <div>
              <h1 className="text-4xl font-black tracking-tight gradient-text">Analytiques avancées</h1>
              <p className="text-muted-foreground mt-1 text-lg italic">
                Statistiques détaillées et planification de rapports stratégiques
              </p>
            </div>
          </div>
          <SendReportDialog />
        </div>

        <Tabs defaultValue="dashboard" className="space-y-8">
          <div className="flex justify-start">
            <TabsList className="bg-muted/20 p-1.5 rounded-2xl h-14 border border-white/5 backdrop-blur-sm">
              <TabsTrigger value="dashboard" className="rounded-xl h-11 px-6 data-[state=active]:bg-primary data-[state=active]:text-white font-black uppercase text-xs tracking-widest transition-all">
                <BarChart3 className="h-4 w-4 mr-2" />
                Tableau de Bord
              </TabsTrigger>
              <TabsTrigger value="trends" className="rounded-xl h-11 px-6 data-[state=active]:bg-primary data-[state=active]:text-white font-black uppercase text-xs tracking-widest transition-all">
                <TrendingUp className="h-4 w-4 mr-2" />
                Tendances
              </TabsTrigger>
              <TabsTrigger value="reports" className="rounded-xl h-11 px-6 data-[state=active]:bg-primary data-[state=active]:text-white font-black uppercase text-xs tracking-widest transition-all">
                <FileText className="h-4 w-4 mr-2" />
                Rapports
              </TabsTrigger>
            </TabsList>
          </div>

          <TabsContent value="dashboard" className="space-y-8 animate-slide-up" style={{ animationDelay: '100ms' }}>
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
              <div className="lg:col-span-2 glass-card rounded-3xl p-2 border-white/10 overflow-hidden group">
                <HourlyChart data={hourlyData || []} isLoading={isLoading} />
              </div>
              <div className="glass-card rounded-3xl overflow-hidden border-white/10">
                <PeakHoursCard peakHours={peakHours} isLoading={isLoading} />
              </div>
            </div>

            {(userRole === 'super_admin' || userRole === 'manager') && (
              <div className="glass-card rounded-3xl p-2 border-white/10 animate-slide-up" style={{ animationDelay: '200ms' }}>
                <SiteComparisonChart data={siteComparison || []} isLoading={isLoading} />
              </div>
            )}
          </TabsContent>

          <TabsContent value="trends" className="space-y-8 animate-slide-up">
            <div className="glass-card rounded-3xl p-2 border-white/10 overflow-hidden">
              <DailyTrendChart data={dailyData || []} isLoading={isLoading} />
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              <div className="glass-card rounded-3xl p-2 border-white/10 overflow-hidden">
                <HourlyChart data={hourlyData || []} isLoading={isLoading} />
              </div>
              <div className="glass-card rounded-3xl overflow-hidden border-white/10">
                <PeakHoursCard peakHours={peakHours} isLoading={isLoading} />
              </div>
            </div>
          </TabsContent>

          <TabsContent value="reports" className="animate-slide-up">
            <ScheduledReportsPanel />
          </TabsContent>
        </Tabs>
      </div>
    </DashboardLayout>
  );
}
