import { useState } from "react";
import { useCompanies, Company } from "@/hooks/useCompanies";
import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { DataTable } from "@/components/ui/DataTable";
import { Button } from "@/components/ui/button";
import { Plus, Briefcase, Building2, UserCircle, Edit, Trash2 } from "lucide-react";
import { CompanyFormDialog as CompanyDialog } from "@/components/companies/CompanyFormDialog";
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

export default function Companies() {
  const { companies, loading, createCompany, updateCompany, deleteCompany } = useCompanies();
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingCompany, setEditingCompany] = useState<Company | null>(null);
  const [deletingCompany, setDeletingCompany] = useState<Company | null>(null);

  const columns = [
    {
      header: "Entreprise",
      accessorKey: "name",
      cell: (company: Company) => (
        <div className="flex items-center gap-4">
          <div className="h-11 w-11 rounded-2xl bg-primary/10 flex items-center justify-center font-black text-primary border border-primary/20 shadow-sm transition-transform group-hover:scale-110">
            <Briefcase className="h-5 w-5" />
          </div>
          <div>
            <div className="font-black text-slate-900 text-sm">
              {company.name}
            </div>
            <div className="text-[10px] text-slate-400 font-bold uppercase tracking-tight">
              Depuis: {new Date(company.created_at).toLocaleDateString()}
            </div>
          </div>
        </div>
      ),
    },
    {
      header: "Site / Emplacement",
      accessorKey: "site.name",
      cell: (company: Company) => (
        <div className="flex items-center gap-2 font-bold text-slate-600 text-xs">
          <Building2 className="h-4 w-4 text-slate-300" />
          {company.site?.name || "N/A"}
        </div>
      ),
    },
    {
      header: "Administrateur",
      accessorKey: "admin.last_name",
      cell: (company: Company) => (
        <div className="flex flex-col">
          {company.admin ? (
            <>
              <div className="flex items-center gap-2 font-black text-slate-700 text-xs">
                <UserCircle className="h-3.5 w-3.5 text-primary/50" />
                {company.admin.first_name} {company.admin.last_name}
              </div>
              <div className="text-[10px] text-slate-400 font-medium pl-5">
                {company.admin.email}
              </div>
            </>
          ) : (
            <span className="text-[10px] uppercase font-bold text-slate-300 tracking-widest">
              Aucun admin
            </span>
          )}
        </div>
      ),
    },
    {
      header: "Actions",
      accessorKey: "actions",
      className: "text-right pr-6",
      cell: (company: Company) => (
        <div className="flex items-center justify-end gap-1">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => setEditingCompany(company)}
            className="h-9 w-9 rounded-xl hover:bg-slate-100 transition-all"
          >
            <Edit className="h-4 w-4" />
          </Button>
          <Button
            variant="ghost"
            size="icon"
            onClick={() => setDeletingCompany(company)}
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
            <h1 className="text-4xl font-black text-slate-900 tracking-tight">Entreprises</h1>
            <p className="text-slate-500 font-medium mt-2">Gérez les structures professionnelles hébergées sur vos sites.</p>
          </div>
          <Button onClick={() => setIsDialogOpen(true)} className="rounded-2xl gap-2 h-12 px-6 shadow-glow font-bold">
            <Plus className="h-5 w-5" />
            Nouvelle Entreprise
          </Button>
        </div>

        <DataTable
          data={companies}
          columns={columns}
          searchPlaceholder="Rechercher une entreprise..."
          searchKey="name"
          isLoading={loading}
        />

        <CompanyDialog
          open={isDialogOpen || !!editingCompany}
          onOpenChange={(open) => {
            if (!open) {
              setIsDialogOpen(false);
              setEditingCompany(null);
            }
          }}
          company={editingCompany || undefined}
          onSubmit={async (data) => {
            if (editingCompany) {
              await updateCompany(editingCompany.id, data);
            } else {
              await createCompany(data);
            }
            setIsDialogOpen(false);
            setEditingCompany(null);
          }}
        />

        <AlertDialog open={!!deletingCompany} onOpenChange={() => setDeletingCompany(null)}>
          <AlertDialogContent className="rounded-3xl border-2">
            <AlertDialogHeader>
              <AlertDialogTitle className="text-xl font-black">Supprimer l'entreprise</AlertDialogTitle>
              <AlertDialogDescription className="font-medium">
                Êtes-vous sûr de vouloir supprimer "{deletingCompany?.name}" ?
                Cette action est irréversible et supprimera l'accès de tous ses employés.
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel className="rounded-xl font-bold">Annuler</AlertDialogCancel>
              <AlertDialogAction
                className="rounded-xl font-bold bg-destructive hover:bg-destructive/90"
                onClick={() => deletingCompany && deleteCompany(deletingCompany.id)}
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
