import { format } from 'date-fns';
import { fr } from 'date-fns/locale';
import { Shield, Mail, Phone, Trash2, Calendar } from 'lucide-react';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import { Guardian } from '@/hooks/useGuardians';

interface GuardiansTableProps {
  guardians: Guardian[];
  onDelete: (guardian: Guardian) => void;
}

export function GuardiansTable({ guardians, onDelete }: GuardiansTableProps) {
  if (guardians.length === 0) {
    return (
      <div className="text-center py-12 border rounded-lg bg-muted/50">
        <Shield className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
        <h3 className="text-lg font-medium text-foreground">Aucun gardien</h3>
        <p className="text-muted-foreground">Ajoutez un gardien pour commencer</p>
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
            <TableHead>Date d'ajout</TableHead>
            <TableHead className="w-24">Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {guardians.map((guardian) => (
            <TableRow key={guardian.id}>
              <TableCell>
                <div className="flex items-center gap-3">
                  <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center">
                    <Shield className="h-5 w-5 text-primary" />
                  </div>
                  <div>
                    <p className="font-medium text-foreground">
                      {guardian.profile?.first_name} {guardian.profile?.last_name}
                    </p>
                  </div>
                </div>
              </TableCell>
              <TableCell>
                <div className="space-y-1">
                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <Mail className="h-4 w-4" />
                    {guardian.profile?.email}
                  </div>
                  {guardian.profile?.phone && (
                    <div className="flex items-center gap-2 text-sm text-muted-foreground">
                      <Phone className="h-4 w-4" />
                      {guardian.profile.phone}
                    </div>
                  )}
                </div>
              </TableCell>
              <TableCell>
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <Calendar className="h-4 w-4" />
                  {format(new Date(guardian.created_at), 'dd MMM yyyy', { locale: fr })}
                </div>
              </TableCell>
              <TableCell>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => onDelete(guardian)}
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
