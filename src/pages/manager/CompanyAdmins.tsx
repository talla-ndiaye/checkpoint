import { useState } from 'react';
import { Plus, UserCog } from 'lucide-react';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { Button } from '@/components/ui/button';
import { useCompanyAdmins, CompanyAdmin } from '@/hooks/useCompanyAdmins';
import { useManagerSite } from '@/hooks/useManagerSite';
import { CompanyAdminsTable } from '@/components/company-admins/CompanyAdminsTable';
import { CompanyAdminFormDialog } from '@/components/company-admins/CompanyAdminFormDialog';
import { DeleteCompanyAdminDialog } from '@/components/company-admins/DeleteCompanyAdminDialog';

export default function CompanyAdmins() {
  const { site } = useManagerSite();
  const { admins, loading, createCompanyAdmin, removeCompanyAdmin } = useCompanyAdmins(site?.id);
  const [showForm, setShowForm] = useState(false);
  const [adminToRemove, setAdminToRemove] = useState<CompanyAdmin | null>(null);

  const handleRemove = async () => {
    if (adminToRemove) {
      await removeCompanyAdmin(adminToRemove.user_id, adminToRemove.company_id);
      setAdminToRemove(null);
    }
  };

  return (
    <DashboardLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold text-foreground flex items-center gap-2">
              <UserCog className="h-7 w-7 text-primary" />
              Administrateurs d'entreprise
            </h1>
            <p className="text-muted-foreground mt-1">
              Gérez les administrateurs de chaque entreprise
            </p>
          </div>
          <Button onClick={() => setShowForm(true)} className="gap-2">
            <Plus className="h-4 w-4" />
            Ajouter un administrateur
          </Button>
        </div>

        {/* Content */}
        {loading ? (
          <div className="flex items-center justify-center py-12">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary" />
          </div>
        ) : (
          <CompanyAdminsTable admins={admins} onRemove={setAdminToRemove} />
        )}

        {/* Dialogs */}
        <CompanyAdminFormDialog
          open={showForm}
          onOpenChange={setShowForm}
          onSubmit={createCompanyAdmin}
        />

        <DeleteCompanyAdminDialog
          admin={adminToRemove}
          open={!!adminToRemove}
          onOpenChange={(open) => !open && setAdminToRemove(null)}
          onConfirm={handleRemove}
        />
      </div>
    </DashboardLayout>
  );
}
