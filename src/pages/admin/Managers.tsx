import { useState } from 'react';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useManagers, Manager, CreateManagerData, UpdateManagerData } from '@/hooks/useManagers';
import { ManagersTable } from '@/components/managers/ManagersTable';
import { ManagerFormDialog } from '@/components/managers/ManagerFormDialog';
import { DeleteManagerDialog } from '@/components/managers/DeleteManagerDialog';
import { Plus, Search, Users, Loader2, Building2, UserCheck, Shield } from 'lucide-react';
import { StatCardMinimal } from '../manager/Companies';

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
      <div className="space-y-8 animate-fade-in">
        {/* Unified Page Header */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="flex items-center gap-5">
            <div className="h-16 w-16 rounded-3xl bg-primary/10 flex items-center justify-center shadow-inner">
              <UserCheck className="h-8 w-8 text-primary" />
            </div>
            <div>
              <h1 className="text-4xl font-black tracking-tight gradient-text">Gestion des Gestionnaires</h1>
              <p className="text-muted-foreground mt-1 text-lg italic">
                Administrez le personnel d'encadrement des sites sécurisés
              </p>
            </div>
          </div>
          <Button onClick={handleCreate} className="h-14 px-8 rounded-2xl gap-3 font-black text-lg shadow-glow hover:scale-[1.02] transition-all">
            <Plus className="h-6 w-6" />
            Nouveau gestionnaire
          </Button>
        </div>

        {/* Stats Section with staggered animation */}
        <div className="grid gap-6 md:grid-cols-3">
          <div className="animate-slide-up" style={{ animationDelay: '0ms' }}>
            <StatCardMinimal
              title="Total gestionnaires"
              value={managers.length}
              icon={Users}
            />
          </div>
          <div className="animate-slide-up" style={{ animationDelay: '100ms' }}>
            <StatCardMinimal
              title="Avec sites assignés"
              value={managersWithSites}
              icon={Building2}
              variant="success"
            />
          </div>
          <div className="animate-slide-up" style={{ animationDelay: '200ms' }}>
            <StatCardMinimal
              title="Sans site assigné"
              value={managers.length - managersWithSites}
              icon={Shield}
              variant="accent"
            />
          </div>
        </div>

        {/* Search & Table Area */}
        <div className="glass-card rounded-3xl overflow-hidden animate-slide-up" style={{ animationDelay: '300ms' }}>
          <div className="p-8 border-b border-white/10 flex flex-col md:flex-row md:items-center justify-between gap-6">
            <div>
              <h3 className="text-2xl font-black tracking-tight">Liste des gestionnaires</h3>
              <p className="text-sm text-muted-foreground mt-1">Gérez les accès administratifs et les affectations aux sites</p>
            </div>

            <div className="relative w-full md:w-96 group">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground group-focus-within:text-primary transition-colors" />
              <Input
                placeholder="Rechercher par nom ou email..."
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
                <p className="text-muted-foreground font-black animate-pulse uppercase tracking-widest">Synchronisation...</p>
              </div>
            ) : (
              <ManagersTable
                managers={filteredManagers}
                onEdit={handleEdit}
                onDelete={handleDelete}
              />
            )}
          </div>
        </div>
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
