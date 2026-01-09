import { useState, useEffect } from 'react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Loader2 } from 'lucide-react';
import { Manager, CreateManagerData, UpdateManagerData } from '@/hooks/useManagers';

interface ManagerFormDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  manager: Manager | null;
  onSubmit: (data: CreateManagerData | UpdateManagerData) => Promise<void>;
}

export function ManagerFormDialog({
  open,
  onOpenChange,
  manager,
  onSubmit,
}: ManagerFormDialogProps) {
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    first_name: '',
    last_name: '',
    phone: '',
  });

  useEffect(() => {
    if (manager) {
      setFormData({
        email: manager.email,
        password: '',
        first_name: manager.first_name,
        last_name: manager.last_name,
        phone: manager.phone || '',
      });
    } else {
      setFormData({
        email: '',
        password: '',
        first_name: '',
        last_name: '',
        phone: '',
      });
    }
  }, [manager, open]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      if (manager) {
        await onSubmit({
          first_name: formData.first_name,
          last_name: formData.last_name,
          phone: formData.phone,
        });
      } else {
        await onSubmit(formData as CreateManagerData);
      }
      onOpenChange(false);
    } finally {
      setLoading(false);
    }
  };

  const isEditing = !!manager;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[425px]">
        <form onSubmit={handleSubmit}>
          <DialogHeader>
            <DialogTitle>
              {isEditing ? 'Modifier le gestionnaire' : 'Nouveau gestionnaire'}
            </DialogTitle>
            <DialogDescription>
              {isEditing
                ? 'Modifiez les informations du gestionnaire'
                : 'Créez un nouveau compte gestionnaire de site'}
            </DialogDescription>
          </DialogHeader>

          <div className="grid gap-4 py-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="first_name">Prénom</Label>
                <Input
                  id="first_name"
                  value={formData.first_name}
                  onChange={(e) =>
                    setFormData({ ...formData, first_name: e.target.value })
                  }
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="last_name">Nom</Label>
                <Input
                  id="last_name"
                  value={formData.last_name}
                  onChange={(e) =>
                    setFormData({ ...formData, last_name: e.target.value })
                  }
                  required
                />
              </div>
            </div>

            {!isEditing && (
              <>
                <div className="space-y-2">
                  <Label htmlFor="email">Email</Label>
                  <Input
                    id="email"
                    type="email"
                    value={formData.email}
                    onChange={(e) =>
                      setFormData({ ...formData, email: e.target.value })
                    }
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="password">Mot de passe</Label>
                  <Input
                    id="password"
                    type="password"
                    value={formData.password}
                    onChange={(e) =>
                      setFormData({ ...formData, password: e.target.value })
                    }
                    required
                    minLength={6}
                  />
                </div>
              </>
            )}

            <div className="space-y-2">
              <Label htmlFor="phone">Téléphone (optionnel)</Label>
              <Input
                id="phone"
                type="tel"
                value={formData.phone}
                onChange={(e) =>
                  setFormData({ ...formData, phone: e.target.value })
                }
              />
            </div>
          </div>

          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
            >
              Annuler
            </Button>
            <Button type="submit" disabled={loading}>
              {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              {isEditing ? 'Modifier' : 'Créer'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
