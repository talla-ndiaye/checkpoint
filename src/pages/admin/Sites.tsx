import { useState } from 'react';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useSites, Site, CreateSiteData } from '@/hooks/useSites';
import { SitesTable } from '@/components/sites/SitesTable';
import { SiteFormDialog } from '@/components/sites/SiteFormDialog';
import { DeleteSiteDialog } from '@/components/sites/DeleteSiteDialog';
import { Plus, Search, Building2, Loader2, MapPin, ShieldCheck, ShieldAlert } from 'lucide-react';
import { StatCardMinimal } from '../manager/Companies';

export default function SitesPage() {
  const { sites, loading, createSite, updateSite, deleteSite } = useSites();
  const [searchQuery, setSearchQuery] = useState('');
  const [formDialogOpen, setFormDialogOpen] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [selectedSite, setSelectedSite] = useState<Site | null>(null);

  const filteredSites = sites.filter(
    (site) =>
      site.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      site.address.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleCreate = () => {
    setSelectedSite(null);
    setFormDialogOpen(true);
  };

  const handleEdit = (site: Site) => {
    setSelectedSite(site);
    setFormDialogOpen(true);
  };

  const handleDelete = (site: Site) => {
    setSelectedSite(site);
    setDeleteDialogOpen(true);
  };

  const handleFormSubmit = async (data: CreateSiteData) => {
    if (selectedSite) {
      await updateSite(selectedSite.id, data);
    } else {
      await createSite(data);
    }
  };

  const handleDeleteConfirm = async () => {
    if (selectedSite) {
      await deleteSite(selectedSite.id);
    }
  };

  return (
    <DashboardLayout>
      <div className="space-y-8 animate-fade-in">
        {/* Unified Page Header */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="flex items-center gap-5">
            <div className="h-16 w-16 rounded-3xl bg-primary/10 flex items-center justify-center shadow-inner">
              <MapPin className="h-8 w-8 text-primary" />
            </div>
            <div>
              <h1 className="text-4xl font-black tracking-tight gradient-text">Gestion des Sites</h1>
              <p className="text-muted-foreground mt-1 text-lg italic">
                Administrez tous les périmètres de sécurité de votre organisation
              </p>
            </div>
          </div>
          <Button onClick={handleCreate} className="h-14 px-8 rounded-2xl gap-3 font-black text-lg shadow-glow hover:scale-[1.02] transition-all">
            <Plus className="h-6 w-6" />
            Nouveau site
          </Button>
        </div>

        {/* Stats Cards with staggered animation */}
        <div className="grid gap-6 md:grid-cols-3">
          <div className="animate-slide-up" style={{ animationDelay: '0ms' }}>
            <StatCardMinimal
              title="Total des sites"
              value={sites.length}
              icon={Building2}
            />
          </div>
          <div className="animate-slide-up" style={{ animationDelay: '100ms' }}>
            <StatCardMinimal
              title="Avec gestionnaire"
              value={sites.filter((s) => s.manager_id).length}
              icon={ShieldCheck}
              variant="success"
            />
          </div>
          <div className="animate-slide-up" style={{ animationDelay: '200ms' }}>
            <StatCardMinimal
              title="Sans gestionnaire"
              value={sites.filter((s) => !s.manager_id).length}
              icon={ShieldAlert}
              variant="accent"
            />
          </div>
        </div>

        {/* Search & Main Content Area */}
        <div className="glass-card rounded-3xl overflow-hidden animate-slide-up" style={{ animationDelay: '300ms' }}>
          <div className="p-8 border-b border-white/10 flex flex-col md:flex-row md:items-center justify-between gap-6">
            <div>
              <h3 className="text-2xl font-black tracking-tight">Liste des sites décrits</h3>
              <p className="text-sm text-muted-foreground mt-1">Configurez les gestionnaires et les adresses pour chaque site</p>
            </div>

            <div className="relative w-full md:w-96 group">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground group-focus-within:text-primary transition-colors" />
              <Input
                placeholder="Rechercher par nom ou adresse..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-12 h-14 rounded-2xl bg-white/5 border-white/10 focus:border-primary/50 transition-all font-medium"
              />
            </div>
          </div>

          <div className="p-2">
            {loading ? (
              <div className="flex flex-col items-center justify-center py-24 gap-4">
                <Loader2 className="h-12 w-12 animate-spin text-primary" />
                <p className="text-muted-foreground font-black animate-pulse">SYNCHRONISATION...</p>
              </div>
            ) : (
              <SitesTable
                sites={filteredSites}
                onEdit={handleEdit}
                onDelete={handleDelete}
              />
            )}
          </div>
        </div>
      </div>

      {/* Dialogs */}
      <SiteFormDialog
        open={formDialogOpen}
        onOpenChange={setFormDialogOpen}
        site={selectedSite}
        onSubmit={handleFormSubmit}
      />

      <DeleteSiteDialog
        open={deleteDialogOpen}
        onOpenChange={setDeleteDialogOpen}
        site={selectedSite}
        onConfirm={handleDeleteConfirm}
      />
    </DashboardLayout>
  );
}
