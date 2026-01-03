import { useState } from 'react';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { useSites, Site, CreateSiteData } from '@/hooks/useSites';
import { SitesTable } from '@/components/sites/SitesTable';
import { SiteFormDialog } from '@/components/sites/SiteFormDialog';
import { DeleteSiteDialog } from '@/components/sites/DeleteSiteDialog';
import { Plus, Search, Building2, Loader2 } from 'lucide-react';

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
      <div className="space-y-6">
        {/* Header */}
        <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Gestion des Sites</h1>
            <p className="text-muted-foreground">
              Gérez tous les sites (bâtiments) de votre organisation
            </p>
          </div>
          <Button onClick={handleCreate} className="gap-2">
            <Plus className="h-4 w-4" />
            Nouveau site
          </Button>
        </div>

        {/* Stats Cards */}
        <div className="grid gap-4 md:grid-cols-3">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total des sites</CardTitle>
              <Building2 className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{sites.length}</div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Avec gestionnaire</CardTitle>
              <Building2 className="h-4 w-4 text-primary" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {sites.filter((s) => s.manager_id).length}
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Sans gestionnaire</CardTitle>
              <Building2 className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {sites.filter((s) => !s.manager_id).length}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Sites Table */}
        <Card>
          <CardHeader>
            <CardTitle>Liste des sites</CardTitle>
            <CardDescription>
              Tous les sites enregistrés dans le système
            </CardDescription>
          </CardHeader>
          <CardContent>
            {/* Search */}
            <div className="mb-4">
              <div className="relative max-w-sm">
                <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                <Input
                  placeholder="Rechercher un site..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>

            {loading ? (
              <div className="flex items-center justify-center py-12">
                <Loader2 className="h-8 w-8 animate-spin text-primary" />
              </div>
            ) : (
              <SitesTable
                sites={filteredSites}
                onEdit={handleEdit}
                onDelete={handleDelete}
              />
            )}
          </CardContent>
        </Card>
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
