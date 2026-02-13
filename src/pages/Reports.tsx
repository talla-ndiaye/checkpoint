import { useState } from 'react';
import { format, subDays, startOfMonth, endOfMonth } from 'date-fns';
import { fr } from 'date-fns/locale';
import {
  FileBarChart,
  Download,
  Calendar,
  Users,
  LogIn,
  LogOut,
  UserCheck,
  Building2,
  Loader2,
  TrendingDown,
  TrendingUp,
} from 'lucide-react';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useReports } from '@/hooks/useReports';
import { generateAccessReportPDF } from '@/lib/pdfGenerator';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  LineChart,
  Line,
  PieChart,
  Pie,
  Cell,
} from 'recharts';

const COLORS = ['hsl(var(--primary))', 'hsl(var(--accent))', 'hsl(221, 83%, 53%)', 'hsl(262, 83%, 58%)', 'hsl(316, 70%, 50%)'];

export function StatCardPremium({ title, value, icon: Icon, trend, colorClass = "bg-primary/10 text-primary" }: { title: string, value: string | number, icon: any, trend?: string, colorClass?: string }) {
  return (
    <div className="glass-card p-6 rounded-3xl flex flex-col justify-between group hover:border-primary/30 transition-all duration-300">
      <div className="flex items-center justify-between mb-4">
        <div className={`p-3 rounded-2xl ${colorClass} group-hover:scale-110 transition-transform`}>
          <Icon className="h-6 w-6" />
        </div>
        {trend && (
          <span className="text-[10px] font-black uppercase tracking-widest text-success flex items-center gap-1">
            <TrendingUp className="h-3 w-3" />
            {trend}
          </span>
        )}
      </div>
      <div>
        <p className="text-sm font-medium text-muted-foreground uppercase tracking-widest text-[10px] mb-1">{title}</p>
        <div className="text-3xl font-black tracking-tight">{value}</div>
      </div>
    </div>
  );
}

export default function Reports() {
  const [startDate, setStartDate] = useState(startOfMonth(new Date()));
  const [endDate, setEndDate] = useState(endOfMonth(new Date()));
  const { data, loading } = useReports(startDate, endDate);

  const handleExportPDF = () => {
    if (data) {
      generateAccessReportPDF(data, startDate, endDate);
    }
  };

  const handleQuickRange = (days: number) => {
    const end = new Date();
    const start = subDays(end, days);
    setStartDate(start);
    setEndDate(end);
  };

  return (
    <DashboardLayout>
      <div className="space-y-8 animate-fade-in text-foreground">
        {/* Unified Page Header */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="flex items-center gap-5">
            <div className="h-16 w-16 rounded-3xl bg-primary/10 flex items-center justify-center shadow-inner">
              <FileBarChart className="h-8 w-8 text-primary" />
            </div>
            <div>
              <h1 className="text-4xl font-black tracking-tight gradient-text">Rapports d'accès</h1>
              <p className="text-muted-foreground mt-1 text-lg italic">
                Exportez vos données et analysez les flux historiques
              </p>
            </div>
          </div>
          <Button onClick={handleExportPDF} disabled={!data || loading} className="h-14 px-8 rounded-2xl gap-3 font-black text-lg shadow-glow hover:scale-[1.02] transition-all">
            <Download className="h-6 w-6" />
            Exporter PDF
          </Button>
        </div>

        {/* Date Filters Bar */}
        <div className="glass-card p-6 rounded-3xl animate-slide-up" style={{ animationDelay: '100ms' }}>
          <div className="flex flex-col lg:flex-row gap-8 items-end">
            <div className="w-full lg:w-auto space-y-2">
              <Label className="text-xs font-black uppercase tracking-widest ml-1">Date de début</Label>
              <Input
                type="date"
                value={format(startDate, 'yyyy-MM-dd')}
                onChange={(e) => setStartDate(new Date(e.target.value))}
                className="h-12 rounded-xl bg-white/5 border-white/10 font-bold px-4"
              />
            </div>
            <div className="w-full lg:w-auto space-y-2">
              <Label className="text-xs font-black uppercase tracking-widest ml-1">Date de fin</Label>
              <Input
                type="date"
                value={format(endDate, 'yyyy-MM-dd')}
                onChange={(e) => setEndDate(new Date(e.target.value))}
                className="h-12 rounded-xl bg-white/5 border-white/10 font-bold px-4"
              />
            </div>
            <div className="flex gap-2 w-full lg:w-auto overflow-x-auto pb-1">
              {[
                { label: '7 jours', val: 7 },
                { label: '30 jours', val: 30 },
                { label: '90 jours', val: 90 }
              ].map(range => (
                <Button
                  key={range.val}
                  variant="outline"
                  className="h-12 px-6 rounded-xl font-black uppercase text-xs border-white/10 hover:bg-primary hover:text-white transition-all whitespace-nowrap"
                  onClick={() => handleQuickRange(range.val)}
                >
                  {range.label}
                </Button>
              ))}
            </div>
          </div>
        </div>

        {loading ? (
          <div className="flex flex-col items-center justify-center py-24 gap-4">
            <Loader2 className="h-12 w-12 animate-spin text-primary" />
            <p className="text-muted-foreground font-black animate-pulse uppercase">Génération du rapport...</p>
          </div>
        ) : data ? (
          <>
            {/* Summary Cards */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 animate-slide-up" style={{ animationDelay: '200ms' }}>
              <StatCardPremium title="Total accès" value={data.totalAccess} icon={Calendar} trend="+12%" />
              <StatCardPremium title="Entrées" value={data.totalEntries} icon={LogIn} colorClass="bg-success/10 text-success" />
              <StatCardPremium title="Sorties" value={data.totalExits} icon={LogOut} colorClass="bg-accent/10 text-accent" />
              <StatCardPremium title="Visiteurs" value={data.totalVisitors} icon={UserCheck} colorClass="bg-primary/20 text-primary" />
            </div>

            {/* Charts Section */}
            <div className="grid lg:grid-cols-2 gap-8 animate-slide-up" style={{ animationDelay: '300ms' }}>
              {/* Daily Access Chart */}
              <div className="glass-card rounded-3xl p-8 space-y-8">
                <div className="flex items-center justify-between">
                  <h3 className="text-xl font-black uppercase tracking-tight">Accès par jour</h3>
                  <TrendingUp className="h-5 w-5 text-primary opacity-50" />
                </div>
                <div className="h-72">
                  {data.accessByDay.length > 0 ? (
                    <ResponsiveContainer width="100%" height="100%">
                      <BarChart data={data.accessByDay}>
                        <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="rgba(255,255,255,0.05)" />
                        <XAxis
                          dataKey="date"
                          tickFormatter={(v) => format(new Date(v), 'dd/MM', { locale: fr })}
                          axisLine={false}
                          tickLine={false}
                          className="text-[10px] font-black uppercase tracking-widest text-muted-foreground/60"
                        />
                        <YAxis axisLine={false} tickLine={false} className="text-[10px] font-black text-muted-foreground/60" />
                        <Tooltip
                          labelFormatter={(v) => format(new Date(v), 'dd MMMM yyyy', { locale: fr })}
                          contentStyle={{
                            background: 'rgba(15, 23, 42, 0.9)',
                            backdropFilter: 'blur(10px)',
                            border: '1px solid rgba(255,255,255,0.1)',
                            borderRadius: '16px',
                            boxShadow: '0 20px 50px rgba(0,0,0,0.5)'
                          }}
                        />
                        <Bar dataKey="entries" name="Entrées" fill="hsl(var(--primary))" radius={[8, 8, 0, 0]} barSize={20} />
                        <Bar dataKey="exits" name="Sorties" fill="hsl(var(--accent))" radius={[8, 8, 0, 0]} barSize={20} />
                      </BarChart>
                    </ResponsiveContainer>
                  ) : (
                    <div className="h-full flex items-center justify-center text-muted-foreground italic">
                      Aucune donnée disponible
                    </div>
                  )}
                </div>
              </div>

              {/* Hourly Distribution */}
              <div className="glass-card rounded-3xl p-8 space-y-8">
                <div className="flex items-center justify-between">
                  <h3 className="text-xl font-black uppercase tracking-tight">Distribution horaire</h3>
                  <FileBarChart className="h-5 w-5 text-primary opacity-50" />
                </div>
                <div className="h-72">
                  <ResponsiveContainer width="100%" height="100%">
                    <LineChart data={data.accessByHour}>
                      <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="rgba(255,255,255,0.05)" />
                      <XAxis dataKey="hour" axisLine={false} tickLine={false} className="text-[10px] font-black text-muted-foreground/60" />
                      <YAxis axisLine={false} tickLine={false} className="text-[10px] font-black text-muted-foreground/60" />
                      <Tooltip
                        contentStyle={{
                          background: 'rgba(15, 23, 42, 0.9)',
                          backdropFilter: 'blur(10px)',
                          border: '1px solid rgba(255,255,255,0.1)',
                          borderRadius: '16px'
                        }}
                      />
                      <Line
                        type="monotone"
                        dataKey="count"
                        name="Accès"
                        stroke="hsl(var(--primary))"
                        strokeWidth={4}
                        dot={{ fill: 'hsl(var(--primary))', r: 4, strokeWidth: 2, stroke: 'white' }}
                        activeDot={{ r: 8, strokeWidth: 0 }}
                      />
                    </LineChart>
                  </ResponsiveContainer>
                </div>
              </div>

              {/* Top Companies */}
              <div className="glass-card rounded-3xl p-8 space-y-8">
                <h3 className="text-xl font-black uppercase tracking-tight flex items-center gap-3">
                  <Building2 className="h-6 w-6 text-primary" />
                  Top entreprises
                </h3>
                <div className="h-72">
                  {data.topCompanies.length > 0 ? (
                    <ResponsiveContainer width="100%" height="100%">
                      <PieChart>
                        <Pie
                          data={data.topCompanies}
                          cx="50%"
                          cy="50%"
                          innerRadius={70}
                          outerRadius={100}
                          dataKey="count"
                          nameKey="name"
                          paddingAngle={5}
                          label={({ name, percent }) => `${name} (${(percent * 100).toFixed(0)}%)`}
                        >
                          {data.topCompanies.map((_, index) => (
                            <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                          ))}
                        </Pie>
                        <Tooltip />
                      </PieChart>
                    </ResponsiveContainer>
                  ) : (
                    <div className="h-full flex items-center justify-center text-muted-foreground italic">
                      Aucune donnée enregistrée
                    </div>
                  )}
                </div>
              </div>

              {/* Employee vs Visitor */}
              <div className="glass-card rounded-3xl p-8 space-y-8">
                <h3 className="text-xl font-black uppercase tracking-tight flex items-center gap-3">
                  <Users className="h-6 w-6 text-primary" />
                  Répartition des flux
                </h3>
                <div className="h-72">
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie
                        data={[
                          { name: 'Employés', value: data.totalEmployees },
                          { name: 'Visiteurs', value: data.totalVisitors },
                        ]}
                        cx="50%"
                        cy="50%"
                        innerRadius={70}
                        outerRadius={100}
                        dataKey="value"
                        paddingAngle={8}
                        label={({ name, percent }) => `${name} (${(percent * 100).toFixed(0)}%)`}
                      >
                        <Cell fill="hsl(var(--primary))" />
                        <Cell fill="hsl(var(--accent))" stroke="none" />
                      </Pie>
                      <Tooltip />
                    </PieChart>
                  </ResponsiveContainer>
                </div>
              </div>
            </div>
          </>
        ) : (
          <div className="text-center py-20 glass-card rounded-[40px] border-dashed opacity-50">
            <FileBarChart className="h-16 w-16 mx-auto mb-6 text-muted-foreground/30 animate-pulse" />
            <h3 className="text-2xl font-black uppercase tracking-tight">Données indisponibles</h3>
            <p className="italic text-muted-foreground mt-2">Veuillez sélectionner une autre période ou vérifier la synchronisation.</p>
          </div>
        )}
      </div>
    </DashboardLayout>
  );
}
