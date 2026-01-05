import { format } from 'date-fns';
import { fr } from 'date-fns/locale';
import { UserCog, Mail, Phone, Trash2, Calendar, Building2 } from 'lucide-react';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import { CompanyAdmin } from '@/hooks/useCompanyAdmins';

interface CompanyAdminsTableProps {
  admins: CompanyAdmin[];
  onRemove: (admin: CompanyAdmin) => void;
  showCompany?: boolean;
}

export function CompanyAdminsTable({ admins, onRemove, showCompany = true }: CompanyAdminsTableProps) {
  if (admins.length === 0) {
    return (
      <div className="text-center py-12 border rounded-lg bg-muted/50">
        <UserCog className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
        <h3 className="text-lg font-medium text-foreground">Aucun administrateur</h3>
        <p className="text-muted-foreground">Ajoutez un administrateur pour commencer</p>
      </div>
    );
  }

  return (
    <div className="rounded-lg border overflow-hidden">
      <Table>
        <TableHeader>
          <TableRow className="bg-muted/50">
            <TableHead>Nom</TableHead>
            <TableHead>Contact</TableHead>
            {showCompany && <TableHead>Entreprise</TableHead>}
            <TableHead>Date d'ajout</TableHead>
            <TableHead className="w-24">Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {admins.map((admin) => (
            <TableRow key={admin.id}>
              <TableCell>
                <div className="flex items-center gap-3">
                  <div className="h-10 w-10 rounded-full bg-accent/10 flex items-center justify-center">
                    <UserCog className="h-5 w-5 text-accent" />
                  </div>
                  <div>
                    <p className="font-medium text-foreground">
                      {admin.profile?.first_name} {admin.profile?.last_name}
                    </p>
                  </div>
                </div>
              </TableCell>
              <TableCell>
                <div className="space-y-1">
                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <Mail className="h-4 w-4" />
                    {admin.profile?.email}
                  </div>
                  {admin.profile?.phone && (
                    <div className="flex items-center gap-2 text-sm text-muted-foreground">
                      <Phone className="h-4 w-4" />
                      {admin.profile.phone}
                    </div>
                  )}
                </div>
              </TableCell>
              {showCompany && (
                <TableCell>
                  <div className="flex items-center gap-2 text-sm">
                    <Building2 className="h-4 w-4 text-muted-foreground" />
                    {admin.company?.name}
                  </div>
                </TableCell>
              )}
              <TableCell>
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <Calendar className="h-4 w-4" />
                  {admin.created_at ? format(new Date(admin.created_at), 'dd MMM yyyy', { locale: fr }) : '-'}
                </div>
              </TableCell>
              <TableCell>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => onRemove(admin)}
                  className="text-destructive hover:text-destructive hover:bg-destructive/10"
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
}
