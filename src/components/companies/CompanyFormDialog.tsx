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
import { Company, CreateCompanyData } from '@/hooks/useCompanies';
import { useSites } from '@/hooks/useSites';
import { Loader2 } from 'lucide-react';

interface CompanyFormDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  company?: Company | null;
  onSubmit: (data: CreateCompanyData) => Promise<void>;
  defaultSiteId?: string;
}

export function CompanyFormDialog({ 
  open, 
  onOpenChange, 
  company, 
  onSubmit,
  defaultSiteId 
}: CompanyFormDialogProps) {
  const [name, setName] = useState('');
  const [siteId, setSiteId] = useState<string>('');
  const [submitting, setSubmitting] = useState(false);
  const { sites, loading: loadingSites } = useSites();

  useEffect(() => {
    if (company) {
      setName(company.name);
      setSiteId(company.site_id);
    } else {
      setName('');
      setSiteId(defaultSiteId || '');
    }
  }, [company, open, defaultSiteId]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);

    try {
      await onSubmit({
        name: name.trim(),
        site_id: siteId,
      });
      onOpenChange(false);
    } finally {
      setSubmitting(false);
    }
  };

  const isEditing = !!company;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>
            {isEditing ? 'Modifier l\'entreprise' : 'Nouvelle entreprise'}
          </DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="name">Nom de l'entreprise *</Label>
            <Input
              id="name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="TechCorp SARL"
              required
              maxLength={100}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="site">Site *</Label>
            <Select value={siteId} onValueChange={setSiteId} required>
              <SelectTrigger>
                <SelectValue placeholder="Sélectionner un site" />
              </SelectTrigger>
              <SelectContent>
                {sites.map((site) => (
                  <SelectItem key={site.id} value={site.id}>
                    {site.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            {loadingSites && (
              <p className="text-sm text-muted-foreground">Chargement des sites...</p>
            )}
          </div>
          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              Annuler
            </Button>
            <Button type="submit" disabled={submitting || !name.trim() || !siteId}>
              {submitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              {isEditing ? 'Mettre à jour' : 'Créer'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
