import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Site } from '@/hooks/useSites';
import { Pencil, Trash2, Building2, MapPin, User } from 'lucide-react';
import { format } from 'date-fns';
import { fr } from 'date-fns/locale';

interface SitesTableProps {
  sites: Site[];
  onEdit: (site: Site) => void;
  onDelete: (site: Site) => void;
}

export function SitesTable({ sites, onEdit, onDelete }: SitesTableProps) {
  if (sites.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-12 text-center">
        <Building2 className="h-12 w-12 text-muted-foreground mb-4" />
        <h3 className="text-lg font-semibold">Aucun site</h3>
        <p className="text-muted-foreground">
          Commencez par créer votre premier site.
        </p>
      </div>
    );
  }

  return (
    <div className="rounded-md border">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Nom</TableHead>
            <TableHead>Adresse</TableHead>
            <TableHead>Gestionnaire</TableHead>
            <TableHead>Créé le</TableHead>
            <TableHead className="text-right">Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {sites.map((site) => (
            <TableRow key={site.id}>
              <TableCell>
                <div className="flex items-center gap-2">
                  <Building2 className="h-4 w-4 text-primary" />
                  <span className="font-medium">{site.name}</span>
                </div>
              </TableCell>
              <TableCell>
                <div className="flex items-center gap-2 text-muted-foreground">
                  <MapPin className="h-4 w-4" />
                  <span className="max-w-[250px] truncate">{site.address}</span>
                </div>
              </TableCell>
              <TableCell>
                {site.manager ? (
                  <div className="flex items-center gap-2">
                    <User className="h-4 w-4 text-muted-foreground" />
                    <span>{site.manager.first_name} {site.manager.last_name}</span>
                  </div>
                ) : (
                  <Badge variant="outline" className="text-muted-foreground">
                    Non assigné
                  </Badge>
                )}
              </TableCell>
              <TableCell className="text-muted-foreground">
                {format(new Date(site.created_at), 'dd MMM yyyy', { locale: fr })}
              </TableCell>
              <TableCell className="text-right">
                <div className="flex justify-end gap-2">
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => onEdit(site)}
                    title="Modifier"
                  >
                    <Pencil className="h-4 w-4" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => onDelete(site)}
                    className="text-destructive hover:text-destructive"
                    title="Supprimer"
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
}
