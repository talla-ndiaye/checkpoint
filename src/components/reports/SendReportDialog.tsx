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
    siteId: '',
    format: 'pdf' as 'pdf' | 'csv' | 'excel',
    dateFrom: format(subDays(new Date(), 7), 'yyyy-MM-dd'),
    dateTo: format(new Date(), 'yyyy-MM-dd'),
    email: ''
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await sendReportNow({
        siteId: formData.siteId || undefined,
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
        <Button variant="outline">
          <Send className="h-4 w-4 mr-2" />
          Envoyer maintenant
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Envoyer un rapport par email</DialogTitle>
          <DialogDescription>
            Le rapport sera généré et envoyé immédiatement à l'adresse indiquée.
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label>Site (optionnel)</Label>
            <Select 
              value={formData.siteId} 
              onValueChange={(value) => setFormData(prev => ({ ...prev, siteId: value }))}
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
