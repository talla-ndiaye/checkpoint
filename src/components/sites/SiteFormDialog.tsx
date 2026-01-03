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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Site, CreateSiteData } from '@/hooks/useSites';
import { useManagers, Manager } from '@/hooks/useManagers';
import { Loader2 } from 'lucide-react';

interface SiteFormDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  site?: Site | null;
  onSubmit: (data: CreateSiteData) => Promise<void>;
}

export function SiteFormDialog({ open, onOpenChange, site, onSubmit }: SiteFormDialogProps) {
  const [name, setName] = useState('');
  const [address, setAddress] = useState('');
  const [managerId, setManagerId] = useState<string>('none');
  const [submitting, setSubmitting] = useState(false);
  const { managers, loading: loadingManagers } = useManagers();

  useEffect(() => {
    if (site) {
      setName(site.name);
      setAddress(site.address);
      setManagerId(site.manager_id || 'none');
    } else {
      setName('');
      setAddress('');
      setManagerId('none');
    }
  }, [site, open]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    
    try {
      await onSubmit({
        name: name.trim(),
        address: address.trim(),
        manager_id: managerId === 'none' ? null : managerId,
      });
      onOpenChange(false);
    } finally {
      setSubmitting(false);
    }
  };

  const isEditing = !!site;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>
            {isEditing ? 'Modifier le site' : 'Nouveau site'}
          </DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="name">Nom du site *</Label>
            <Input
              id="name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Tour Eiffel Business Center"
              required
              maxLength={100}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="address">Adresse *</Label>
            <Input
              id="address"
              value={address}
              onChange={(e) => setAddress(e.target.value)}
              placeholder="123 Avenue des Champs-Élysées, Paris"
              required
              maxLength={255}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="manager">Gestionnaire</Label>
            <Select value={managerId} onValueChange={setManagerId}>
              <SelectTrigger>
                <SelectValue placeholder="Sélectionner un gestionnaire" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="none">Aucun gestionnaire</SelectItem>
                {managers.map((manager) => (
                  <SelectItem key={manager.id} value={manager.id}>
                    {manager.first_name} {manager.last_name} ({manager.email})
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            {loadingManagers && (
              <p className="text-sm text-muted-foreground">Chargement des gestionnaires...</p>
            )}
          </div>
          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              Annuler
            </Button>
            <Button type="submit" disabled={submitting || !name.trim() || !address.trim()}>
              {submitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              {isEditing ? 'Mettre à jour' : 'Créer'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
