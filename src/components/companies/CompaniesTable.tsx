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
import { Company } from '@/hooks/useCompanies';
import { Pencil, Trash2, Briefcase, Building2, Users, User } from 'lucide-react';
import { format } from 'date-fns';
import { fr } from 'date-fns/locale';

interface CompaniesTableProps {
  companies: Company[];
  onEdit: (company: Company) => void;
  onDelete: (company: Company) => void;
  onViewEmployees?: (company: Company) => void;
}

export function CompaniesTable({ companies, onEdit, onDelete, onViewEmployees }: CompaniesTableProps) {
  if (companies.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-12 text-center">
        <Briefcase className="h-12 w-12 text-muted-foreground mb-4" />
        <h3 className="text-lg font-semibold">Aucune entreprise</h3>
        <p className="text-muted-foreground">
          Commencez par créer votre première entreprise.
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
            <TableHead>Site</TableHead>
            <TableHead>Administrateur</TableHead>
            <TableHead>Employés</TableHead>
            <TableHead>Créé le</TableHead>
            <TableHead className="text-right">Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {companies.map((company) => (
            <TableRow key={company.id}>
              <TableCell>
                <div className="flex items-center gap-2">
                  <Briefcase className="h-4 w-4 text-primary" />
                  <span className="font-medium">{company.name}</span>
                </div>
              </TableCell>
              <TableCell>
                <div className="flex items-center gap-2 text-muted-foreground">
                  <Building2 className="h-4 w-4" />
                  <span>{company.site?.name || 'N/A'}</span>
                </div>
              </TableCell>
              <TableCell>
                {company.admin ? (
                  <div className="flex items-center gap-2">
                    <User className="h-4 w-4 text-muted-foreground" />
                    <span>{company.admin.first_name} {company.admin.last_name}</span>
                  </div>
                ) : (
                  <Badge variant="outline" className="text-muted-foreground">
                    Non assigné
                  </Badge>
                )}
              </TableCell>
              <TableCell>
                <Badge variant="secondary" className="gap-1">
                  <Users className="h-3 w-3" />
                  {company.employee_count || 0}
                </Badge>
              </TableCell>
              <TableCell className="text-muted-foreground">
                {format(new Date(company.created_at), 'dd MMM yyyy', { locale: fr })}
              </TableCell>
              <TableCell className="text-right">
                <div className="flex justify-end gap-2">
                  {onViewEmployees && (
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => onViewEmployees(company)}
                      title="Voir les employés"
                    >
                      <Users className="h-4 w-4" />
                    </Button>
                  )}
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => onEdit(company)}
                    title="Modifier"
                  >
                    <Pencil className="h-4 w-4" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => onDelete(company)}
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
