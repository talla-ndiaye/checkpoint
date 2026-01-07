import { useState, useEffect } from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Employee } from '@/hooks/useEmployees';
import { Loader2 } from 'lucide-react';

interface EmployeeEditDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  employee: Employee | null;
  onSubmit: (data: { first_name: string; last_name: string; email: string; phone?: string }) => Promise<void>;
}

export function EmployeeEditDialog({
  open,
  onOpenChange,
  employee,
  onSubmit,
}: EmployeeEditDialogProps) {
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (employee && open) {
      setFirstName(employee.profile?.first_name || '');
      setLastName(employee.profile?.last_name || '');
      setEmail(employee.profile?.email || '');
      setPhone(employee.profile?.phone || '');
    }
  }, [employee, open]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);

    try {
      await onSubmit({
        first_name: firstName.trim(),
        last_name: lastName.trim(),
        email: email.trim(),
        phone: phone.trim() || undefined,
      });
      onOpenChange(false);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>Modifier l'employé</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="editFirstName">Prénom *</Label>
              <Input
                id="editFirstName"
                value={firstName}
                onChange={(e) => setFirstName(e.target.value)}
                placeholder="Jean"
                required
                maxLength={50}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="editLastName">Nom *</Label>
              <Input
                id="editLastName"
                value={lastName}
                onChange={(e) => setLastName(e.target.value)}
                placeholder="Dupont"
                required
                maxLength={50}
              />
            </div>
          </div>
          <div className="space-y-2">
            <Label htmlFor="editEmail">Email *</Label>
            <Input
              id="editEmail"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="jean.dupont@entreprise.com"
              required
              maxLength={255}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="editPhone">Téléphone</Label>
            <Input
              id="editPhone"
              type="tel"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              placeholder="+33 6 12 34 56 78"
              maxLength={20}
            />
          </div>
          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              Annuler
            </Button>
            <Button
              type="submit"
              disabled={submitting || !firstName.trim() || !lastName.trim() || !email.trim()}
            >
              {submitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Enregistrer
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
