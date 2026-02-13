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
import { Loader2, Key, UserCircle } from 'lucide-react';

interface EmployeeEditDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  employee: Employee | null;
  onSubmit: (data: { first_name: string; last_name: string; email: string; phone?: string; password?: string }) => Promise<void>;
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
  const [password, setPassword] = useState('');
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (employee && open) {
      setFirstName(employee.profile?.first_name || '');
      setLastName(employee.profile?.last_name || '');
      setEmail(employee.profile?.email || '');
      setPhone(employee.profile?.phone || '');
      setPassword('');
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
        password: password.trim() || undefined,
      });
      onOpenChange(false);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px] rounded-[2.5rem] border-2 shadow-2xl overflow-hidden p-0">
        <div className="bg-primary/5 p-8 border-b border-primary/10">
          <div className="h-16 w-16 bg-primary/10 rounded-2xl flex items-center justify-center mb-4">
            <UserCircle className="h-8 w-8 text-primary" />
          </div>
          <DialogHeader>
            <DialogTitle className="text-3xl font-black text-slate-900 uppercase">Modifier l'employé</DialogTitle>
            <p className="text-slate-500 font-medium">{email}</p>
          </DialogHeader>
        </div>

        <form onSubmit={handleSubmit} className="p-8 space-y-6">
          <div className="grid grid-cols-2 gap-6">
            <div className="space-y-2">
              <Label htmlFor="editFirstName" className="text-sm font-bold text-slate-700 ml-1">Prénom *</Label>
              <Input
                id="editFirstName"
                value={firstName}
                onChange={(e) => setFirstName(e.target.value)}
                placeholder="Jean"
                required
                className="h-12 rounded-xl bg-slate-50 border-slate-200 focus:border-primary/50"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="editLastName" className="text-sm font-bold text-slate-700 ml-1">Nom *</Label>
              <Input
                id="editLastName"
                value={lastName}
                onChange={(e) => setLastName(e.target.value)}
                placeholder="Dupont"
                required
                className="h-12 rounded-xl bg-slate-50 border-slate-200 focus:border-primary/50"
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="editPhone" className="text-sm font-bold text-slate-700 ml-1">Téléphone</Label>
            <Input
              id="editPhone"
              type="tel"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              placeholder="+221 ..."
              className="h-12 rounded-xl bg-slate-50 border-slate-200 focus:border-primary/50"
            />
          </div>

          <div className="space-y-2 pt-4">
            <div className="flex items-center gap-2 mb-2">
              <Key className="h-4 w-4 text-amber-500" />
              <Label className="text-sm font-extrabold text-slate-900">Changer le mot de passe</Label>
            </div>
            <Input
              id="editPassword"
              type="password"
              placeholder="Laissez vide pour ne pas changer"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="h-12 rounded-xl bg-slate-50 border-slate-200 focus:border-amber-500/50"
            />
            <p className="text-[10px] text-slate-400 font-medium italic">Min. 6 caractères pour le nouveau mot de passe.</p>
          </div>

          <DialogFooter className="pt-6">
            <Button type="button" variant="ghost" onClick={() => onOpenChange(false)} className="h-12 rounded-xl font-bold">
              Annuler
            </Button>
            <Button
              type="submit"
              disabled={submitting || !firstName.trim() || !lastName.trim()}
              className="h-12 bg-primary px-8 rounded-xl font-bold shadow-lg shadow-primary/20"
            >
              {submitting ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Enregistrement...
                </>
              ) : (
                "Mettre à jour"
              )}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
