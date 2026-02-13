import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Employee } from '@/hooks/useEmployees';
import { Trash2, User, Briefcase, Mail, Phone, QrCode, Pencil } from 'lucide-react';
import { format } from 'date-fns';
import { fr } from 'date-fns/locale';
import { DataTable } from '@/components/ui/DataTable';

interface EmployeesTableProps {
  employees: Employee[];
  onDelete: (employee: Employee) => void;
  onEdit?: (employee: Employee) => void;
  onViewQR?: (employee: Employee) => void;
}

export function EmployeesTable({ employees, onDelete, onEdit, onViewQR }: EmployeesTableProps) {
  const columns = [
    {
      header: "Employé",
      accessorKey: "profile.last_name",
      cell: (emp: Employee) => (
        <div className="flex items-center gap-4">
          <div className="h-11 w-11 rounded-2xl bg-primary/10 flex items-center justify-center font-black text-primary border border-primary/20 shadow-sm">
            {emp.profile?.first_name?.[0]}{emp.profile?.last_name?.[0]}
          </div>
          <div>
            <div className="font-black text-slate-900 text-sm">
              {emp.profile?.first_name} {emp.profile?.last_name}
            </div>
            <div className="text-[10px] text-slate-400 font-bold uppercase tracking-tight">
              #{emp.unique_code}
            </div>
          </div>
        </div>
      ),
    },
    {
      header: "Contact",
      accessorKey: "profile.email",
      cell: (emp: Employee) => (
        <div className="space-y-1">
          <div className="flex items-center gap-2 font-bold text-slate-600 text-xs">
            <Mail className="h-3 w-3 text-slate-400" />
            {emp.profile?.email}
          </div>
          {emp.profile?.phone && (
            <div className="flex items-center gap-2 font-semibold text-slate-400 text-[10px]">
              <Phone className="h-3 w-3" />
              {emp.profile.phone}
            </div>
          )}
        </div>
      ),
    },
    {
      header: "Entreprise",
      accessorKey: "company.name",
      cell: (emp: Employee) => (
        <div className="flex items-center gap-2 font-bold text-slate-500 text-xs">
          <Briefcase className="h-4 w-4 text-slate-300" />
          {emp.company?.name || 'N/A'}
        </div>
      ),
    },
    {
      header: "Créé le",
      accessorKey: "created_at",
      cell: (emp: Employee) => (
        <div className="text-xs font-bold text-slate-400">
          {format(new Date(emp.created_at), 'dd MMM yyyy', { locale: fr })}
        </div>
      ),
    },
    {
      header: "Actions",
      accessorKey: "actions",
      className: "text-right pr-6",
      cell: (emp: Employee) => (
        <div className="flex items-center justify-end gap-1">
          {onViewQR && (
            <Button
              variant="ghost"
              size="icon"
              onClick={() => onViewQR(emp)}
              className="h-9 w-9 rounded-xl hover:bg-primary/10 hover:text-primary transition-all"
              title="Voir QR Code"
            >
              <QrCode className="h-4 w-4" />
            </Button>
          )}
          {onEdit && (
            <Button
              variant="ghost"
              size="icon"
              onClick={() => onEdit(emp)}
              className="h-9 w-9 rounded-xl hover:bg-slate-100 transition-all font-bold"
              title="Modifier"
            >
              <Pencil className="h-4 w-4" />
            </Button>
          )}
          <Button
            variant="ghost"
            size="icon"
            onClick={() => onDelete(emp)}
            className="h-9 w-9 rounded-xl hover:bg-destructive/10 hover:text-destructive transition-all"
            title="Supprimer"
          >
            <Trash2 className="h-4 w-4" />
          </Button>
        </div>
      ),
    },
  ];

  return (
    <DataTable
      data={employees}
      columns={columns}
      searchPlaceholder="Rechercher un employé..."
      searchKey="profile.last_name"
    />
  );
}
