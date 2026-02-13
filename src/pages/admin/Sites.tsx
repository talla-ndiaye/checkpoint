import { useState } from "react";
import { useSites, Site } from "@/hooks/useSites";
import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { DataTable } from "@/components/ui/DataTable";
import { Button } from "@/components/ui/button";
import { Plus, MapPin, User, Edit, Trash2, Building2 } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { SiteFormDialog as SiteDialog } from "@/components/sites/SiteFormDialog";
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

export default function Sites() {
  const { sites, loading, updateSite, deleteSite, createSite } = useSites();
  const [editingSite, setEditingSite] = useState<Site | null>(null);
  const [deletingSite, setDeletingSite] = useState<Site | null>(null);
  const [isCreateOpen, setIsCreateOpen] = useState(false);

  const columns = [
    {
      header: "Site",
      accessorKey: "name",
      cell: (site: Site) => (
        <div className="flex items-center gap-4">
          <div className="h-11 w-11 rounded-2xl bg-accent/10 flex items-center justify-center font-black text-accent border border-accent/20 shadow-sm">
            <Building2 className="h-5 w-5" />
          </div>
          <div>
            <div className="font-black text-slate-900 text-sm">
              {site.name}
            </div>
            <div className="text-[10px] text-slate-400 font-bold uppercase tracking-tight">
              ID: {site.id.substring(0, 8)}
            </div>
          </div>
        </div>
      ),
    },
    {
      header: "Adresse",
      accessorKey: "address",
      cell: (site: Site) => (
        <div className="flex items-center gap-2 font-bold text-slate-600 text-xs max-w-xs truncate">
          <MapPin className="h-3 w-3 text-slate-400 flex-shrink-0" />
          {site.address}
        </div>
      ),
    },
    {
      header: "Gestionnaire",
      accessorKey: "manager.last_name",
      cell: (site: Site) => (
        <div className="flex items-center gap-2">
          {site.manager ? (
            <>
              <div className="h-7 w-7 rounded-lg bg-primary/10 flex items-center justify-center font-bold text-primary text-[10px]">
                {site.manager.first_name[0]}{site.manager.last_name[0]}
              </div>
              <div className="text-xs font-bold text-slate-700">
                {site.manager.first_name} {site.manager.last_name}
              </div>
            </>
          ) : (
            <Badge variant="outline" className="text-[10px] uppercase font-bold text-slate-400 border-dashed">
              Non assigné
            </Badge>
          )}
        </div>
      ),
    },
    {
      header: "Actions",
      accessorKey: "actions",
      className: "text-right pr-6",
      cell: (site: Site) => (
        <div className="flex items-center justify-end gap-1">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => setEditingSite(site)}
            className="h-9 w-9 rounded-xl hover:bg-primary/10 hover:text-primary transition-all"
          >
            <Edit className="h-4 w-4" />
          </Button>
          <Button
            variant="ghost"
            size="icon"
            onClick={() => setDeletingSite(site)}
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
            <h1 className="text-4xl font-black text-slate-900 tracking-tight">Sites & Bâtiments</h1>
            <p className="text-slate-500 font-medium mt-2">Gérez les emplacements physiques supervisés par le système.</p>
          </div>
          <Button onClick={() => setIsCreateOpen(true)} className="rounded-2xl gap-2 h-12 px-6 shadow-glow font-bold bg-accent hover:bg-accent/90">
            <Plus className="h-5 w-5" />
            Nouveau Site
          </Button>
        </div>

        <DataTable
          data={sites}
          columns={columns}
          searchPlaceholder="Rechercher un site ou une adresse..."
          searchKey="name"
          isLoading={loading}
        />

        <SiteDialog
          open={isCreateOpen || !!editingSite}
          onOpenChange={(open) => {
            if (!open) {
              setIsCreateOpen(false);
              setEditingSite(null);
            }
          }}
          site={editingSite || undefined}
          onSubmit={async (data) => {
            if (editingSite) {
              await updateSite(editingSite.id, data);
            } else {
              await createSite(data);
            }
            setIsCreateOpen(false);
            setEditingSite(null);
          }}
        />

        <AlertDialog open={!!deletingSite} onOpenChange={() => setDeletingSite(null)}>
          <AlertDialogContent className="rounded-3xl border-2">
            <AlertDialogHeader>
              <AlertDialogTitle className="text-xl font-black">Supprimer le site</AlertDialogTitle>
              <AlertDialogDescription className="font-medium">
                Êtes-vous sûr de vouloir supprimer "{deletingSite?.name}" ?
                Cette action supprimera également l'accès pour toutes les entreprises liées à ce site.
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel className="rounded-xl font-bold">Annuler</AlertDialogCancel>
              <AlertDialogAction
                className="rounded-xl font-bold bg-destructive hover:bg-destructive/90"
                onClick={() => deletingSite && deleteSite(deletingSite.id)}
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
