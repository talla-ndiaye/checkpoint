import { useState } from 'react';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { useManagers, Manager, CreateManagerData, UpdateManagerData } from '@/hooks/useManagers';
import { ManagersTable } from '@/components/managers/ManagersTable';
import { ManagerFormDialog } from '@/components/managers/ManagerFormDialog';
import { DeleteManagerDialog } from '@/components/managers/DeleteManagerDialog';
import { Plus, Search, Users, Loader2, Building2 } from 'lucide-react';

export default function ManagersPage() {
  const { managers, loading, createManager, updateManager, deleteManager } = useManagers();
  const [searchQuery, setSearchQuery] = useState('');
  const [formDialogOpen, setFormDialogOpen] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [selectedManager, setSelectedManager] = useState<Manager | null>(null);

  const filteredManagers = managers.filter(
    (manager) =>
      manager.first_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      manager.last_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      manager.email.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleCreate = () => {
    setSelectedManager(null);
    setFormDialogOpen(true);
  };

  const handleEdit = (manager: Manager) => {
    setSelectedManager(manager);
    setFormDialogOpen(true);
  };

  const handleDelete = (manager: Manager) => {
    setSelectedManager(manager);
    setDeleteDialogOpen(true);
  };

  const handleFormSubmit = async (data: CreateManagerData | UpdateManagerData) => {
    if (selectedManager) {
      await updateManager(selectedManager.id, data as UpdateManagerData);
    } else {
      await createManager(data as CreateManagerData);
    }
  };

  const handleDeleteConfirm = async () => {
    if (selectedManager) {
      await deleteManager(selectedManager.id);
    }
  };

  const managersWithSites = managers.filter(m => m.sites && m.sites.length > 0).length;

  return (
    <DashboardLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Gestion des Gestionnaires</h1>
            <p className="text-muted-foreground">
              Gérez les gestionnaires de site de votre organisation
            </p>
          </div>
          <Button onClick={handleCreate} className="gap-2">
            <Plus className="h-4 w-4" />
            Nouveau gestionnaire
          </Button>
        </div>

        {/* Stats Cards */}
        <div className="grid gap-4 md:grid-cols-3">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total gestionnaires</CardTitle>
              <Users className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{managers.length}</div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Avec sites assignés</CardTitle>
              <Building2 className="h-4 w-4 text-primary" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{managersWithSites}</div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Sans site</CardTitle>
              <Users className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{managers.length - managersWithSites}</div>
            </CardContent>
          </Card>
        </div>

        {/* Managers Table */}
        <Card>
          <CardHeader>
            <CardTitle>Liste des gestionnaires</CardTitle>
            <CardDescription>
              Tous les gestionnaires de site enregistrés dans le système
            </CardDescription>
          </CardHeader>
          <CardContent>
            {/* Search */}
            <div className="mb-4">
              <div className="relative max-w-sm">
                <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                <Input
                  placeholder="Rechercher un gestionnaire..."
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
              <ManagersTable
                managers={filteredManagers}
                onEdit={handleEdit}
                onDelete={handleDelete}
              />
            )}
          </CardContent>
        </Card>
      </div>

      {/* Dialogs */}
      <ManagerFormDialog
        open={formDialogOpen}
        onOpenChange={setFormDialogOpen}
        manager={selectedManager}
        onSubmit={handleFormSubmit}
      />

      <DeleteManagerDialog
        open={deleteDialogOpen}
        onOpenChange={setDeleteDialogOpen}
        manager={selectedManager}
        onConfirm={handleDeleteConfirm}
      />
    </DashboardLayout>
  );
}
