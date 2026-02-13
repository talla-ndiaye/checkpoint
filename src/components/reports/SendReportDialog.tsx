import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogFooter, DialogDescription } from '@/components/ui/dialog';
import { Send, Loader2 } from 'lucide-react';
import { useScheduledReports } from '@/hooks/useScheduledReports';
import { useSites } from '@/hooks/useSites';
import { format, subDays } from 'date-fns';

export function SendReportDialog() {
  const { sendReportNow, isLoading } = useScheduledReports();
  const { sites } = useSites();
  const [isOpen, setIsOpen] = useState(false);

  const [formData, setFormData] = useState({
    siteId: 'all',
    format: 'pdf' as 'pdf' | 'csv' | 'excel',
    dateFrom: format(subDays(new Date(), 7), 'yyyy-MM-dd'),
    dateTo: format(new Date(), 'yyyy-MM-dd'),
    email: ''
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await sendReportNow({
        siteId: formData.siteId === 'all' ? undefined : formData.siteId,
        format: formData.format,
        dateFrom: formData.dateFrom,
        dateTo: formData.dateTo,
        email: formData.email
      });
      setIsOpen(false);
    } catch (error) {
      // Error is handled in the hook
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <Button variant="outline" className="glass-card border-primary/20 hover:bg-primary/5 rounded-xl h-12 px-6 font-black uppercase tracking-widest text-xs transition-all">
          <Send className="h-4 w-4 mr-2" />
          Envoyer maintenant
        </Button>
      </DialogTrigger>
      <DialogContent className="glass-card border-white/10 rounded-[32px] max-w-lg">
        <DialogHeader>
          <DialogTitle className="text-2xl font-black uppercase tracking-tight">Rapport Express</DialogTitle>
          <DialogDescription className="text-muted-foreground italic">
            Le rapport sera généré et envoyé immédiatement à l'adresse indiquée.
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-6 mt-4">
          <div className="space-y-2">
            <Label className="text-xs font-black uppercase tracking-widest text-primary ml-1">Site concerné</Label>
            <Select
              value={formData.siteId}
              onValueChange={(value) => setFormData(prev => ({ ...prev, siteId: value }))}
            >
              <SelectTrigger className="h-14 rounded-2xl bg-white/5 border-white/10 font-bold">
                <SelectValue placeholder="Tous les sites" />
              </SelectTrigger>
              <SelectContent className="glass-card border-white/10 rounded-2xl">
                <SelectItem value="all" className="font-bold">Tous les sites</SelectItem>
                {sites?.map(site => (
                  <SelectItem key={site.id} value={site.id} className="font-bold">
                    {site.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>Date de début</Label>
              <Input
                type="date"
                value={formData.dateFrom}
                onChange={(e) => setFormData(prev => ({ ...prev, dateFrom: e.target.value }))}
                required
              />
            </div>
            <div className="space-y-2">
              <Label>Date de fin</Label>
              <Input
                type="date"
                value={formData.dateTo}
                onChange={(e) => setFormData(prev => ({ ...prev, dateTo: e.target.value }))}
                required
              />
            </div>
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
                <SelectItem value="pdf">PDF (HTML imprimable)</SelectItem>
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
              disabled={isLoading || !formData.email}
            >
              {isLoading && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
              Envoyer le rapport
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
