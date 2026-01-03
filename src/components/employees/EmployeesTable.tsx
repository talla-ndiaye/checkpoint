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
import { Employee } from '@/hooks/useEmployees';
import { Trash2, User, Briefcase, Mail, Phone, QrCode } from 'lucide-react';
import { format } from 'date-fns';
import { fr } from 'date-fns/locale';

interface EmployeesTableProps {
  employees: Employee[];
  onDelete: (employee: Employee) => void;
  onViewQR?: (employee: Employee) => void;
}

export function EmployeesTable({ employees, onDelete, onViewQR }: EmployeesTableProps) {
  if (employees.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-12 text-center">
        <User className="h-12 w-12 text-muted-foreground mb-4" />
        <h3 className="text-lg font-semibold">Aucun employé</h3>
        <p className="text-muted-foreground">
          Commencez par créer votre premier employé.
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
            <TableHead>Contact</TableHead>
            <TableHead>Entreprise</TableHead>
            <TableHead>Code unique</TableHead>
            <TableHead>Créé le</TableHead>
            <TableHead className="text-right">Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {employees.map((employee) => (
            <TableRow key={employee.id}>
              <TableCell>
                <div className="flex items-center gap-2">
                  <div className="h-8 w-8 rounded-full bg-primary/10 flex items-center justify-center">
                    <User className="h-4 w-4 text-primary" />
                  </div>
                  <div>
                    <span className="font-medium">
                      {employee.profile?.first_name} {employee.profile?.last_name}
                    </span>
                  </div>
                </div>
              </TableCell>
              <TableCell>
                <div className="space-y-1">
                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <Mail className="h-3 w-3" />
                    <span>{employee.profile?.email}</span>
                  </div>
                  {employee.profile?.phone && (
                    <div className="flex items-center gap-2 text-sm text-muted-foreground">
                      <Phone className="h-3 w-3" />
                      <span>{employee.profile.phone}</span>
                    </div>
                  )}
                </div>
              </TableCell>
              <TableCell>
                <div className="flex items-center gap-2 text-muted-foreground">
                  <Briefcase className="h-4 w-4" />
                  <span>{employee.company?.name || 'N/A'}</span>
                </div>
              </TableCell>
              <TableCell>
                <Badge variant="outline" className="font-mono">
                  {employee.unique_code}
                </Badge>
              </TableCell>
              <TableCell className="text-muted-foreground">
                {format(new Date(employee.created_at), 'dd MMM yyyy', { locale: fr })}
              </TableCell>
              <TableCell className="text-right">
                <div className="flex justify-end gap-2">
                  {onViewQR && (
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => onViewQR(employee)}
                      title="Voir QR Code"
                    >
                      <QrCode className="h-4 w-4" />
                    </Button>
                  )}
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => onDelete(employee)}
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
