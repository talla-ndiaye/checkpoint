import { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Loader2, CalendarPlus } from 'lucide-react';

interface InvitationFormDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSubmit: (data: {
    visitor_name: string;
    visitor_phone: string;
    visit_date: string;
    visit_time: string;
  }) => void;
  isLoading: boolean;
}

export function InvitationFormDialog({
  open,
  onOpenChange,
  onSubmit,
  isLoading,
}: InvitationFormDialogProps) {
  const [visitorName, setVisitorName] = useState('');
  const [visitorPhone, setVisitorPhone] = useState('');
  const [visitDate, setVisitDate] = useState('');
  const [visitTime, setVisitTime] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit({
      visitor_name: visitorName.trim(),
      visitor_phone: visitorPhone.trim(),
      visit_date: visitDate,
      visit_time: visitTime,
    });
    setVisitorName('');
    setVisitorPhone('');
    setVisitDate('');
    setVisitTime('');
  };

  const today = new Date().toISOString().split('T')[0];

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <CalendarPlus className="h-5 w-5 text-primary" />
            Nouvelle invitation
          </DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="visitorName">Nom du visiteur</Label>
            <Input
              id="visitorName"
              value={visitorName}
              onChange={(e) => setVisitorName(e.target.value)}
              placeholder="Jean Dupont"
              required
              maxLength={100}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="visitorPhone">Téléphone (avec indicatif)</Label>
            <Input
              id="visitorPhone"
              type="tel"
              value={visitorPhone}
              onChange={(e) => setVisitorPhone(e.target.value)}
              placeholder="+33612345678"
              required
              maxLength={20}
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="visitDate">Date de visite</Label>
              <Input
                id="visitDate"
                type="date"
                value={visitDate}
                onChange={(e) => setVisitDate(e.target.value)}
                min={today}
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="visitTime">Heure</Label>
              <Input
                id="visitTime"
                type="time"
                value={visitTime}
                onChange={(e) => setVisitTime(e.target.value)}
                required
              />
            </div>
          </div>

          <div className="flex justify-end gap-3 pt-4">
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
            >
              Annuler
            </Button>
            <Button type="submit" disabled={isLoading}>
              {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Créer l'invitation
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
