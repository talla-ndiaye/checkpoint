import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { format } from 'date-fns';
import { fr } from 'date-fns/locale';
import { ArrowUpRight, ArrowDownLeft, Calendar, Filter, CheckCircle, Clock } from 'lucide-react';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { useAuth } from '@/hooks/useAuth';
import { useAccessLogs } from '@/hooks/useAccessLogs';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { useEffect } from 'react';

export default function AccessHistory() {
  const navigate = useNavigate();
  const { user, loading } = useAuth();
  const [startDate, setStartDate] = useState<string>('');
  const [endDate, setEndDate] = useState<string>('');
  const [actionType, setActionType] = useState<'entry' | 'exit' | 'all'>('all');

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
        <Badge className="bg-success/10 text-success border-success/20 hover:bg-success/20">
          <ArrowUpRight className="h-3 w-3 mr-1" />
          Entrée
        </Badge>
      );
    }
    return (
      <Badge className="bg-warning/10 text-warning border-warning/20 hover:bg-warning/20">
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

  const getExitStatusBadge = (log: any) => {
    // Only show exit status for walk-in visitors
    if (!log.walk_in_visitor) return null;
    
    // Only show for exit actions
    if (log.action_type !== 'exit') return null;

    if (log.walk_in_visitor.exit_validated) {
      return (
        <Badge className="bg-success/10 text-success border-success/20">
          <CheckCircle className="h-3 w-3 mr-1" />
          Sortie validée
        </Badge>
      );
    }

    return (
      <Badge className="bg-amber-500/10 text-amber-600 border-amber-500/20">
        <Clock className="h-3 w-3 mr-1" />
        Sortie en attente
      </Badge>
    );
  };

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Historique des accès</h1>
          <p className="text-muted-foreground mt-1">
            Consultez l'historique complet des entrées et sorties
          </p>
        </div>

        {/* Filters */}
        <div className="glass-card rounded-xl p-6">
          <div className="flex items-center gap-2 mb-4">
            <Filter className="h-5 w-5 text-muted-foreground" />
            <h3 className="font-semibold">Filtres</h3>
          </div>
          <div className="grid gap-4 md:grid-cols-4">
            <div className="space-y-2">
              <label className="text-sm font-medium">Date de début</label>
              <div className="relative">
                <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  type="date"
                  value={startDate}
                  onChange={(e) => setStartDate(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium">Date de fin</label>
              <div className="relative">
                <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  type="date"
                  value={endDate}
                  onChange={(e) => setEndDate(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium">Type d'action</label>
              <Select value={actionType} onValueChange={(v) => setActionType(v as any)}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Tous</SelectItem>
                  <SelectItem value="entry">Entrées uniquement</SelectItem>
                  <SelectItem value="exit">Sorties uniquement</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="flex items-end">
              <Button
                variant="outline"
                onClick={() => {
                  setStartDate('');
                  setEndDate('');
                  setActionType('all');
                }}
              >
                Réinitialiser
              </Button>
            </div>
          </div>
        </div>

        {/* Table */}
        <div className="glass-card rounded-xl overflow-hidden">
          <Table>
            <TableHeader>
              <TableRow>
             <TableHead>Date & Heure</TableHead>
                <TableHead>Utilisateur</TableHead>
                <TableHead>Site</TableHead>
                <TableHead>Action</TableHead>
                <TableHead>Statut sortie</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {isLoading ? (
                <TableRow>
                  <TableCell colSpan={4} className="text-center py-8">
                    <div className="animate-pulse text-muted-foreground">
                      Chargement...
                    </div>
                  </TableCell>
                </TableRow>
              ) : accessLogs?.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={4} className="text-center py-8 text-muted-foreground">
                    Aucun accès enregistré
                  </TableCell>
                </TableRow>
              ) : (
                accessLogs?.map((log) => (
                  <TableRow 
                    key={log.id} 
                    className="cursor-pointer hover:bg-muted/50"
                    onClick={() => navigate(`/access-history/${log.id}`)}
                  >
                    <TableCell>
                      <div className="font-medium">
                        {format(new Date(log.timestamp), 'dd/MM/yyyy', { locale: fr })}
                      </div>
                      <div className="text-sm text-muted-foreground">
                        {format(new Date(log.timestamp), 'HH:mm:ss')}
                      </div>
                    </TableCell>
                    <TableCell>{getUserName(log)}</TableCell>
                    <TableCell>{log.site?.name || 'N/A'}</TableCell>
                    <TableCell>{getActionBadge(log.action_type)}</TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </div>
      </div>
    </DashboardLayout>
  );
}
