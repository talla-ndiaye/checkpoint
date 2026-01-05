import { useState } from 'react';
import { Plus, Shield } from 'lucide-react';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { Button } from '@/components/ui/button';
import { useGuardians, Guardian } from '@/hooks/useGuardians';
import { GuardiansTable } from '@/components/guardians/GuardiansTable';
import { GuardianFormDialog } from '@/components/guardians/GuardianFormDialog';
import { DeleteGuardianDialog } from '@/components/guardians/DeleteGuardianDialog';

export default function Guardians() {
  const { guardians, loading, createGuardian, deleteGuardian } = useGuardians();
  const [showForm, setShowForm] = useState(false);
  const [guardianToDelete, setGuardianToDelete] = useState<Guardian | null>(null);

  const handleDelete = async () => {
    if (guardianToDelete) {
      await deleteGuardian(guardianToDelete.id, guardianToDelete.user_id);
      setGuardianToDelete(null);
    }
  };

  return (
    <DashboardLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold text-foreground flex items-center gap-2">
              <Shield className="h-7 w-7 text-primary" />
              Gestion des Gardiens
            </h1>
            <p className="text-muted-foreground mt-1">
              Gérez les gardiens de votre site
            </p>
          </div>
          <Button onClick={() => setShowForm(true)} className="gap-2">
            <Plus className="h-4 w-4" />
            Ajouter un gardien
          </Button>
        </div>

        {/* Content */}
        {loading ? (
          <div className="flex items-center justify-center py-12">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary" />
          </div>
        ) : (
          <GuardiansTable guardians={guardians} onDelete={setGuardianToDelete} />
        )}

        {/* Dialogs */}
        <GuardianFormDialog
          open={showForm}
          onOpenChange={setShowForm}
          onSubmit={createGuardian}
        />

        <DeleteGuardianDialog
          guardian={guardianToDelete}
          open={!!guardianToDelete}
          onOpenChange={(open) => !open && setGuardianToDelete(null)}
          onConfirm={handleDelete}
        />
      </div>
    </DashboardLayout>
  );
}
