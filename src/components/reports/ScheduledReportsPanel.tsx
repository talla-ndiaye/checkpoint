import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogFooter } from '@/components/ui/dialog';
import { Trash2, Plus, Calendar, Mail, FileText, Loader2 } from 'lucide-react';
import { useScheduledReports } from '@/hooks/useScheduledReports';
import { useSites } from '@/hooks/useSites';
import { format } from 'date-fns';
import { fr } from 'date-fns/locale';

export function ScheduledReportsPanel() {
  const { reports, isLoadingReports, createReport, toggleReport, deleteReport } = useScheduledReports();
  const { sites } = useSites();
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  
  // Form state
  const [formData, setFormData] = useState({
    site_id: '',
    report_type: 'weekly' as 'daily' | 'weekly' | 'monthly',
    format: 'pdf' as 'pdf' | 'csv' | 'excel',
    email: ''
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    await createReport.mutateAsync({
      site_id: formData.site_id || undefined,
      report_type: formData.report_type,
      format: formData.format,
      email: formData.email
    });
    setIsDialogOpen(false);
    setFormData({ site_id: '', report_type: 'weekly', format: 'pdf', email: '' });
  };

  const getReportTypeLabel = (type: string) => {
    switch (type) {
      case 'daily': return 'Quotidien';
      case 'weekly': return 'Hebdomadaire';
      case 'monthly': return 'Mensuel';
      default: return type;
    }
  };

  const getFormatLabel = (format: string) => {
    switch (format) {
      case 'pdf': return 'PDF';
      case 'csv': return 'CSV';
      case 'excel': return 'Excel';
      default: return format;
    }
  };

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between">
        <div>
          <CardTitle className="flex items-center gap-2">
            <Calendar className="h-5 w-5" />
            Rapports planifiés
          </CardTitle>
          <CardDescription>
            Configurez l'envoi automatique de rapports par email
          </CardDescription>
        </div>
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="h-4 w-4 mr-2" />
              Nouveau rapport
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Planifier un nouveau rapport</DialogTitle>
            </DialogHeader>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-2">
                <Label>Site (optionnel)</Label>
                <Select 
                  value={formData.site_id} 
                  onValueChange={(value) => setFormData(prev => ({ ...prev, site_id: value }))}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Tous les sites" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="">Tous les sites</SelectItem>
                    {sites?.map(site => (
                      <SelectItem key={site.id} value={site.id}>
                        {site.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label>Fréquence</Label>
                <Select 
                  value={formData.report_type} 
                  onValueChange={(value: 'daily' | 'weekly' | 'monthly') => 
                    setFormData(prev => ({ ...prev, report_type: value }))
                  }
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="daily">Quotidien</SelectItem>
                    <SelectItem value="weekly">Hebdomadaire</SelectItem>
                    <SelectItem value="monthly">Mensuel</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label>Format</Label>
                <Select 
                  value={formData.format} 
                  onValueChange={(value: 'pdf' | 'csv' | 'excel') => 
                    setFormData(prev => ({ ...prev, format: value }))
                  }
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="pdf">PDF</SelectItem>
                    <SelectItem value="csv">CSV</SelectItem>
                    <SelectItem value="excel">Excel</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label>Email de destination</Label>
                <Input
                  type="email"
                  placeholder="email@exemple.com"
                  value={formData.email}
                  onChange={(e) => setFormData(prev => ({ ...prev, email: e.target.value }))}
                  required
                />
              </div>

              <DialogFooter>
                <Button 
                  type="submit" 
                  disabled={createReport.isPending || !formData.email}
                >
                  {createReport.isPending && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
                  Créer le rapport
                </Button>
              </DialogFooter>
            </form>
          </DialogContent>
        </Dialog>
      </CardHeader>
      <CardContent>
        {isLoadingReports ? (
          <div className="flex items-center justify-center py-8">
            <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
          </div>
        ) : reports && reports.length > 0 ? (
          <div className="space-y-4">
            {reports.map(report => (
              <div 
                key={report.id}
                className="flex items-center justify-between p-4 rounded-lg border bg-card"
              >
                <div className="flex items-center gap-4">
                  <div className="p-2 rounded-lg bg-primary/10">
                    <FileText className="h-5 w-5 text-primary" />
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="font-medium">
                        Rapport {getReportTypeLabel(report.report_type)}
                      </span>
                      <Badge variant="outline">
                        {getFormatLabel(report.format)}
                      </Badge>
                    </div>
                    <div className="flex items-center gap-2 text-sm text-muted-foreground">
                      <Mail className="h-3 w-3" />
                      {report.email}
                    </div>
                    <div className="text-xs text-muted-foreground mt-1">
                      Prochain envoi: {format(new Date(report.next_send_at), "dd MMM yyyy 'à' HH:mm", { locale: fr })}
                    </div>
                  </div>
                </div>
                <div className="flex items-center gap-4">
                  <Switch
                    checked={report.is_active}
                    onCheckedChange={(checked) => 
                      toggleReport.mutate({ id: report.id, isActive: checked })
                    }
                  />
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => deleteReport.mutate(report.id)}
                    className="text-destructive hover:text-destructive"
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-8 text-muted-foreground">
            <Calendar className="h-12 w-12 mx-auto mb-4 opacity-50" />
            <p>Aucun rapport planifié</p>
            <p className="text-sm">Cliquez sur "Nouveau rapport" pour commencer</p>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
