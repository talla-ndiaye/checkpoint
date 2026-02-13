import { useState } from "react";
import { useUsers, UserProfile } from "@/hooks/useUsers";
import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { DataTable } from "@/components/ui/DataTable";
import { RoleBadge } from "@/components/ui/RoleBadge";
import { Button } from "@/components/ui/button";
import { UserPlus, Mail, Phone, Edit, Trash2, Building2, Briefcase } from "lucide-react";
import { UserEditDialog } from "@/components/admin/UserEditDialog";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle
} from "@/components/ui/alert-dialog";

export default function Users() {
  const { users, loading, updateUser, deleteUser } = useUsers();
  const [editingUser, setEditingUser] = useState<UserProfile | null>(null);
  const [deletingUser, setDeletingUser] = useState<UserProfile | null>(null);

  const columns = [
    {
      header: "Utilisateur",
      accessorKey: "last_name",
      cell: (user: UserProfile) => (
        <div className="flex items-center gap-4">
          <div className="h-11 w-11 rounded-2xl bg-primary/10 flex items-center justify-center font-black text-primary border border-primary/20 shadow-sm">
            {user.first_name[0]}{user.last_name[0]}
          </div>
          <div>
            <div className="font-black text-slate-900 text-sm">
              {user.first_name} {user.last_name}
            </div>
            <div className="text-[10px] text-slate-400 font-bold uppercase tracking-tight">
              ID: {user.id.substring(0, 8)}
            </div>
          </div>
        </div>
      ),
    },
    {
      header: "Contact",
      accessorKey: "email",
      cell: (user: UserProfile) => (
        <div className="space-y-1">
          <div className="flex items-center gap-2 font-bold text-slate-600 text-xs">
            <Mail className="h-3 w-3 text-slate-400" />
            {user.email}
          </div>
          {user.phone && (
            <div className="flex items-center gap-2 font-semibold text-slate-400 text-[10px]">
              <Phone className="h-3 w-3" />
              {user.phone}
            </div>
          )}
        </div>
      ),
    },
    {
      header: "Rôles",
      accessorKey: "roles",
      cell: (user: UserProfile) => (
        <div className="flex flex-wrap gap-1.5">
          {user.roles.map((role) => (
            <RoleBadge key={role} role={role} size="sm" />
          ))}
        </div>
      ),
    },
    {
      header: "Localisation",
      accessorKey: "site_name",
      cell: (user: UserProfile) => (
        <div className="space-y-1">
          {user.site_name && (
            <div className="flex items-center gap-1.5 text-xs font-bold text-slate-500">
              <Building2 className="h-3 w-3" />
              {user.site_name}
            </div>
          )}
          {user.company_name && (
            <div className="flex items-center gap-1.5 text-[10px] font-bold text-slate-400 uppercase">
              <Briefcase className="h-2.5 w-2.5" />
              {user.company_name}
            </div>
          )}
        </div>
      ),
    },
    {
      header: "Actions",
      accessorKey: "actions",
      className: "text-right pr-6",
      cell: (user: UserProfile) => (
        <div className="flex items-center justify-end gap-1">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => setEditingUser(user)}
            className="h-9 w-9 rounded-xl hover:bg-primary/10 hover:text-primary transition-all"
          >
            <Edit className="h-4 w-4" />
          </Button>
          <Button
            variant="ghost"
            size="icon"
            onClick={() => setDeletingUser(user)}
            className="h-9 w-9 rounded-xl hover:bg-destructive/10 hover:text-destructive transition-all"
          >
            <Trash2 className="h-4 w-4" />
          </Button>
        </div>
      ),
    },
  ];

  return (
    <DashboardLayout>
      <div className="space-y-8">
        <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4">
          <div>
            <h1 className="text-4xl font-black text-slate-900 tracking-tight">Utilisateurs</h1>
            <p className="text-slate-500 font-medium mt-2">Gérez les accès et les profils de l'ensemble du système.</p>
          </div>
          <Button className="rounded-2xl gap-2 h-12 px-6 shadow-glow font-bold">
            <UserPlus className="h-5 w-5" />
            Nouvel Utilisateur
          </Button>
        </div>

        <DataTable
          data={users}
          columns={columns}
          searchPlaceholder="Rechercher un nom ou un email..."
          searchKey="email"
          isLoading={loading}
        />

        {editingUser && (
          <UserEditDialog
            user={editingUser}
            open={!!editingUser}
            onOpenChange={(open) => !open && setEditingUser(null)}
            onSubmit={async (id, data) => {
              const success = await updateUser(id, data);
              if (success) setEditingUser(null);
              return !!success;
            }}
          />
        )}

        <AlertDialog open={!!deletingUser} onOpenChange={() => setDeletingUser(null)}>
          <AlertDialogContent className="rounded-3xl border-2">
            <AlertDialogHeader>
              <AlertDialogTitle className="text-xl font-black">Confirmer la suppression</AlertDialogTitle>
              <AlertDialogDescription className="font-medium">
                Êtes-vous sûr de vouloir supprimer l'utilisateur {deletingUser?.first_name} {deletingUser?.last_name} ?
                Cette action est irréversible.
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel className="rounded-xl font-bold">Annuler</AlertDialogCancel>
              <AlertDialogAction
                className="rounded-xl font-bold bg-destructive hover:bg-destructive/90"
                onClick={() => deletingUser && deleteUser(deletingUser.id)}
              >
                Supprimer
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      </div>
    </DashboardLayout>
  );
}
