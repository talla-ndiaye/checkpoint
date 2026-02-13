import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { format } from 'date-fns';
import { fr } from 'date-fns/locale';
import { ArrowUpRight, ArrowDownLeft, Calendar, Filter, CheckCircle, Clock, Search, Loader2, ListFilter, History } from 'lucide-react';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { useAuth } from '@/hooks/useAuth';
import { useAccessLogs } from '@/hooks/useAccessLogs';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Switch } from '@/components/ui/switch';

export default function AccessHistory() {
  const navigate = useNavigate();
  const { user, loading } = useAuth();
  const [startDate, setStartDate] = useState<string>('');
  const [endDate, setEndDate] = useState<string>('');
  const [actionType, setActionType] = useState<'entry' | 'exit' | 'all'>('all');
  const [showPendingExitsOnly, setShowPendingExitsOnly] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');

  const { data: accessLogs, isLoading } = useAccessLogs({
    startDate: startDate ? new Date(startDate) : undefined,
    endDate: endDate ? new Date(endDate + 'T23:59:59') : undefined,
    actionType
  });

  useEffect(() => {
    if (!loading && !user) {
      navigate('/auth');
    }
  }, [user, loading, navigate]);

  const getActionBadge = (type: string) => {
    if (type === 'entry') {
      return (
        <Badge className="bg-success text-white border-transparent px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest shadow-lg shadow-success/20">
          <ArrowUpRight className="h-3 w-3 mr-1" />
          Entrée
        </Badge>
      );
    }
    return (
      <Badge className="bg-accent text-white border-transparent px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest shadow-lg shadow-accent/20">
        <ArrowDownLeft className="h-3 w-3 mr-1" />
        Sortie
      </Badge>
    );
  };

  const getUserName = (log: any) => {
    if (log.user_profile) {
      return `${log.user_profile.first_name} ${log.user_profile.last_name}`;
    }
    if (log.invitation?.visitor_name) {
      return `${log.invitation.visitor_name} (Visiteur)`;
    }
    if (log.walk_in_visitor) {
      return `${log.walk_in_visitor.first_name} ${log.walk_in_visitor.last_name} (CNI)`;
    }
    return 'Inconnu';
  };

  const filteredLogs = accessLogs?.filter(log => {
    if (showPendingExitsOnly) {
      return log.walk_in_visitor && !log.walk_in_visitor.exit_validated && log.action_type === 'entry';
    }
    if (!searchQuery) return true;
    const name = getUserName(log).toLowerCase();
    const site = (log.site?.name || '').toLowerCase();
    const search = searchQuery.toLowerCase();
    return name.includes(search) || site.includes(search);
  });

  const getExitStatusBadge = (log: any) => {
    if (!log.walk_in_visitor) return null;
    if (log.action_type !== 'exit') return null;

    if (log.walk_in_visitor.exit_validated) {
      return (
        <Badge className="bg-success/10 text-success border-success/20 font-bold px-3 py-1 rounded-lg">
          <CheckCircle className="h-3 w-3 mr-1" />
          Sortie validée
        </Badge>
      );
    }

    return (
      <Badge className="bg-primary/20 text-primary border-primary/30 font-bold px-3 py-1 rounded-lg animate-pulse">
        <Clock className="h-3 w-3 mr-1" />
        Attente de sortie
      </Badge>
    );
  };

  return (
    <DashboardLayout>
      <div className="space-y-8 animate-fade-in">
        {/* Unified Page Header */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="flex items-center gap-5">
            <div className="h-16 w-16 rounded-3xl bg-primary/10 flex items-center justify-center shadow-inner">
              <History className="h-8 w-8 text-primary" />
            </div>
            <div>
              <h1 className="text-4xl font-black tracking-tight gradient-text">Historique des accès</h1>
              <p className="text-muted-foreground mt-1 text-lg italic">
                Traçabilité complète des mouvements sur vos périmètres sécurisés
              </p>
            </div>
          </div>
        </div>

        {/* Filters Panel */}
        <div className="glass-card rounded-[32px] p-8 space-y-8 animate-slide-up" style={{ animationDelay: '100ms' }}>
          <div className="flex items-center justify-between border-b border-white/10 pb-6">
            <div className="flex items-center gap-3">
              <div className="p-2.5 rounded-xl bg-primary/10">
                <Filter className="h-5 w-5 text-primary" />
              </div>
              <h3 className="text-xl font-black uppercase tracking-tight">Paramètres de filtrage</h3>
            </div>
            <Button
              variant="ghost"
              className="text-primary font-black uppercase text-[10px] tracking-[0.2em] hover:bg-primary/5 px-6"
              onClick={() => {
                setStartDate('');
                setEndDate('');
                setActionType('all');
                setShowPendingExitsOnly(false);
                setSearchQuery('');
              }}
            >
              Réinitialiser
            </Button>
          </div>

          <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-4">
            <div className="space-y-3">
              <label className="text-[10px] font-black uppercase tracking-[0.2em] ml-1 text-muted-foreground">Recherche</label>
              <div className="relative group">
                <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground group-focus-within:text-primary transition-colors" />
                <Input
                  placeholder="Nom ou site..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-12 h-14 rounded-2xl bg-white/5 border-white/10 focus:border-primary/50 transition-all font-bold"
                />
              </div>
            </div>

            <div className="space-y-3">
              <label className="text-[10px] font-black uppercase tracking-[0.2em] ml-1 text-muted-foreground">Date début</label>
              <div className="relative group">
                <Calendar className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground group-focus-within:text-primary transition-colors" />
                <Input
                  type="date"
                  value={startDate}
                  onChange={(e) => setStartDate(e.target.value)}
                  className="pl-12 h-14 rounded-2xl bg-white/5 border-white/10 focus:border-primary/50 transition-all font-bold"
                />
              </div>
            </div>

            <div className="space-y-3">
              <label className="text-[10px] font-black uppercase tracking-[0.2em] ml-1 text-muted-foreground">Date fin</label>
              <div className="relative group">
                <Calendar className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground group-focus-within:text-primary transition-colors" />
                <Input
                  type="date"
                  value={endDate}
                  onChange={(e) => setEndDate(e.target.value)}
                  className="pl-12 h-14 rounded-2xl bg-white/5 border-white/10 focus:border-primary/50 transition-all font-bold"
                />
              </div>
            </div>

            <div className="space-y-3">
              <label className="text-[10px] font-black uppercase tracking-[0.2em] ml-1 text-muted-foreground">Type d'action</label>
              <Select value={actionType} onValueChange={(v) => setActionType(v as any)}>
                <SelectTrigger className="h-14 rounded-2xl bg-white/5 border-white/10 font-bold px-6">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent className="rounded-2xl bg-card/95 backdrop-blur-3xl border-white/10">
                  <SelectItem value="all" className="rounded-xl font-bold">Toutes les actions</SelectItem>
                  <SelectItem value="entry" className="rounded-xl font-bold">Entrées uniquement</SelectItem>
                  <SelectItem value="exit" className="rounded-xl font-bold">Sorties uniquement</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="pt-4 border-t border-white/5 flex items-center gap-4">
            <div className={`p-1 rounded-full transition-all ${showPendingExitsOnly ? 'bg-primary/20' : 'bg-white/5'}`}>
              <Switch
                checked={showPendingExitsOnly}
                onCheckedChange={setShowPendingExitsOnly}
                id="pending-exits"
                className="data-[state=checked]:bg-primary"
              />
            </div>
            <label htmlFor="pending-exits" className="text-sm font-bold cursor-pointer italic text-muted-foreground hover:text-white transition-colors">
              Masquer les sorties complétées pour les visiteurs CNI
            </label>
          </div>
        </div>

        {/* Table Area */}
        <div className="glass-card rounded-[32px] overflow-hidden animate-slide-up shadow-2xl" style={{ animationDelay: '200ms' }}>
          <div className="p-2 min-h-[400px]">
            {isLoading ? (
              <div className="flex flex-col items-center justify-center py-32 gap-4">
                <Loader2 className="h-12 w-12 animate-spin text-primary" />
                <p className="text-muted-foreground font-black animate-pulse uppercase tracking-[0.3em]">Lecture des journaux...</p>
              </div>
            ) : filteredLogs?.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-32 text-center opacity-40">
                <History className="h-16 w-16 mb-4 text-muted-foreground/30" />
                <h3 className="text-2xl font-black uppercase tracking-tight">Aucun enregistrement</h3>
                <p className="italic text-sm">Modifiez vos filtres pour voir plus de résultats.</p>
              </div>
            ) : (
              <Table>
                <TableHeader className="bg-white/5 border-b border-white/5">
                  <TableRow className="hover:bg-transparent px-4">
                    <TableHead className="text-xs font-black uppercase tracking-widest py-6 px-10">Date & Heure</TableHead>
                    <TableHead className="text-xs font-black uppercase tracking-widest py-6">Identité</TableHead>
                    <TableHead className="text-xs font-black uppercase tracking-widest py-6">Site Ref.</TableHead>
                    <TableHead className="text-xs font-black uppercase tracking-widest py-6">Action</TableHead>
                    <TableHead className="text-xs font-black uppercase tracking-widest py-6 text-right px-10">Statut</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredLogs?.map((log, index) => (
                    <TableRow
                      key={log.id}
                      className="group cursor-pointer hover:bg-primary/5 border-white/5 h-20 transition-all"
                      onClick={() => navigate(`/access-history/${log.id}`)}
                    >
                      <TableCell className="px-10">
                        <div className="font-black tracking-tight text-white group-hover:text-primary transition-colors">
                          {format(new Date(log.timestamp), 'dd MMM yyyy', { locale: fr })}
                        </div>
                        <div className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">
                          {format(new Date(log.timestamp), 'HH:mm:ss')}
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-3">
                          <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center font-black text-xs text-primary border border-primary/20">
                            {getUserName(log).split(' ').map(n => n[0]).join('')}
                          </div>
                          <span className="font-bold tracking-tight text-foreground/90">{getUserName(log)}</span>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <span className="h-2 w-2 rounded-full bg-success/60 animate-pulse" />
                          <span className="font-medium text-muted-foreground italic text-sm">{log.site?.name || 'Inconnu'}</span>
                        </div>
                      </TableCell>
                      <TableCell>{getActionBadge(log.action_type)}</TableCell>
                      <TableCell className="text-right px-10">{getExitStatusBadge(log) || '-'}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            )}
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}
