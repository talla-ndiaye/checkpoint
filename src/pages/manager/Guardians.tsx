import { useState } from 'react';
import { Plus, Shield, ShieldCheck, UserCheck, ShieldAlert, Search, Loader2 } from 'lucide-react';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useGuardians, Guardian } from '@/hooks/useGuardians';
import { GuardiansTable } from '@/components/guardians/GuardiansTable';
import { GuardianFormDialog } from '@/components/guardians/GuardianFormDialog';
import { DeleteGuardianDialog } from '@/components/guardians/DeleteGuardianDialog';

export default function Guardians() {
  const { guardians, loading, createGuardian, deleteGuardian } = useGuardians();
  const [showForm, setShowForm] = useState(false);
  const [guardianToDelete, setGuardianToDelete] = useState<Guardian | null>(null);
  const [searchQuery, setSearchQuery] = useState('');

  const handleDelete = async () => {
    if (guardianToDelete) {
      await deleteGuardian(guardianToDelete.id, guardianToDelete.user_id);
      setGuardianToDelete(null);
    }
  };

  const filteredGuardians = guardians.filter(g =>
    `${g.profile?.first_name} ${g.profile?.last_name}`.toLowerCase().includes(searchQuery.toLowerCase()) ||
    g.profile?.email?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    g.sites?.some(s => s.name.toLowerCase().includes(searchQuery.toLowerCase()))
  );

  return (
    <DashboardLayout>
      <div className="space-y-8 animate-fade-in">
        {/* Unified Page Header */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="flex items-center gap-5">
            <div className="h-16 w-16 rounded-3xl bg-primary/10 flex items-center justify-center shadow-inner">
              <ShieldCheck className="h-8 w-8 text-primary" />
            </div>
            <div>
              <h1 className="text-4xl font-black tracking-tight text-foreground">Gestion des Gardiens</h1>
              <p className="text-muted-foreground mt-1 text-lg">
                Administrez le personnel de sécurité affecté à vos points d'accès
              </p>
            </div>
          </div>
          <Button onClick={() => setShowForm(true)} className="h-14 px-8 rounded-2xl gap-3 font-black text-lg bg-primary hover:bg-primary/90 transition-all shadow-md">
            <Plus className="h-6 w-6" />
            Nouveau gardien
          </Button>
        </div>

        {/* Search & Tool Bar */}
        <div className="bg-card border border-border p-6 rounded-3xl flex flex-col md:flex-row gap-6 justify-between items-center animate-slide-up" style={{ animationDelay: '100ms' }}>
          <div className="relative w-full md:w-96 group">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground group-focus-within:text-primary transition-colors" />
            <Input
              placeholder="Rechercher par nom, email ou site..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-12 h-14 rounded-2xl bg-muted/50 border-border focus:border-primary/50 transition-all font-medium"
            />
          </div>
          <div className="flex items-center gap-8 px-6 py-3 bg-muted/30 rounded-2xl border border-border">
            <div className="text-center">
              <p className="text-[10px] uppercase tracking-widest text-muted-foreground font-black">Total Gardiens</p>
              <p className="text-2xl font-black">{guardians.length}</p>
            </div>
            <div className="h-8 w-px bg-border" />
            <div className="text-center">
              <p className="text-[10px] uppercase tracking-widest text-primary font-black">Postes Actifs</p>
              <p className="text-2xl font-black">{new Set(guardians.flatMap(g => g.sites?.map(s => s.id) || [])).size}</p>
            </div>
          </div>
        </div>

        {/* Content Area */}
        <div className="bg-card border border-border rounded-3xl overflow-hidden animate-slide-up" style={{ animationDelay: '200ms' }}>
          <div className="p-2 min-h-[400px]">
            {loading ? (
              <div className="flex flex-col items-center justify-center py-24 gap-4">
                <Loader2 className="h-12 w-12 animate-spin text-primary" />
                <p className="text-muted-foreground font-black animate-pulse uppercase tracking-widest">Chargement...</p>
              </div>
            ) : (
              <GuardiansTable guardians={filteredGuardians} onDelete={setGuardianToDelete} />
            )}
          </div>
        </div>

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
