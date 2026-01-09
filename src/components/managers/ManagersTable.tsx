import { Manager } from '@/hooks/useManagers';
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
import { Edit, Trash2, Building2 } from 'lucide-react';

interface ManagersTableProps {
  managers: Manager[];
  onEdit: (manager: Manager) => void;
  onDelete: (manager: Manager) => void;
}

export function ManagersTable({ managers, onEdit, onDelete }: ManagersTableProps) {
  if (managers.length === 0) {
    return (
      <div className="text-center py-12 text-muted-foreground">
        Aucun gestionnaire trouvé
      </div>
    );
  }

  return (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead>Nom</TableHead>
          <TableHead>Email</TableHead>
          <TableHead>Téléphone</TableHead>
          <TableHead>Sites assignés</TableHead>
          <TableHead className="text-right">Actions</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {managers.map((manager) => (
          <TableRow key={manager.id}>
            <TableCell className="font-medium">
              {manager.first_name} {manager.last_name}
            </TableCell>
            <TableCell>{manager.email}</TableCell>
            <TableCell>{manager.phone || '-'}</TableCell>
            <TableCell>
              {manager.sites && manager.sites.length > 0 ? (
                <div className="flex flex-wrap gap-1">
                  {manager.sites.map((site) => (
                    <Badge key={site.id} variant="secondary" className="gap-1">
                      <Building2 className="h-3 w-3" />
                      {site.name}
                    </Badge>
                  ))}
                </div>
              ) : (
                <span className="text-muted-foreground">Aucun site</span>
              )}
            </TableCell>
            <TableCell className="text-right">
              <div className="flex justify-end gap-2">
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => onEdit(manager)}
                >
                  <Edit className="h-4 w-4" />
                </Button>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => onDelete(manager)}
                  className="text-destructive hover:text-destructive"
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              </div>
            </TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  );
}
