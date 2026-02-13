import { useState } from 'react';
import { Plus, UserCog, Shield, Users, Search, Loader2 } from 'lucide-react';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
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
  const [searchQuery, setSearchQuery] = useState('');

  const handleRemove = async () => {
    if (adminToRemove) {
      await removeCompanyAdmin(adminToRemove.user_id, adminToRemove.company_id);
      setAdminToRemove(null);
    }
  };

  const filteredAdmins = admins.filter(admin =>
    `${admin.profile?.first_name} ${admin.profile?.last_name}`.toLowerCase().includes(searchQuery.toLowerCase()) ||
    admin.profile?.email?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    admin.company?.name?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <DashboardLayout>
      <div className="space-y-8 animate-fade-in">
        {/* Unified Page Header */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="flex items-center gap-5">
            <div className="h-16 w-16 rounded-3xl bg-primary/10 flex items-center justify-center shadow-inner">
              <UserCog className="h-8 w-8 text-primary" />
            </div>
            <div>
              <h1 className="text-4xl font-black tracking-tight gradient-text">Administrateurs d'entreprise</h1>
              <p className="text-muted-foreground mt-1 text-lg italic">
                Gérez les comptes administratifs des entreprises partenaires
              </p>
            </div>
          </div>
          <Button onClick={() => setShowForm(true)} className="h-14 px-8 rounded-2xl gap-3 font-black text-lg shadow-glow hover:scale-[1.02] transition-all">
            <Plus className="h-6 w-6" />
            Ajouter un administrateur
          </Button>
        </div>

        {/* Stats & Search Bar */}
        <div className="glass-card p-6 rounded-3xl flex flex-col md:flex-row gap-6 justify-between items-center animate-slide-up" style={{ animationDelay: '100ms' }}>
          <div className="relative w-full md:w-96 group">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground group-focus-within:text-primary transition-colors" />
            <Input
              placeholder="Rechercher par nom, email ou entreprise..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-12 h-14 rounded-2xl bg-white/5 border-white/10 focus:border-primary/50 transition-all font-medium"
            />
          </div>
          <div className="flex items-center gap-8 px-6 py-3 bg-muted/20 rounded-2xl border border-white/5 shadow-inner">
            <div className="text-center">
              <p className="text-[10px] uppercase tracking-widest text-muted-foreground font-black">Total Admins</p>
              <p className="text-2xl font-black">{admins.length}</p>
            </div>
            <div className="h-8 w-px bg-white/10" />
            <div className="text-center">
              <p className="text-[10px] uppercase tracking-widest text-primary font-black">Entreprises</p>
              <p className="text-2xl font-black">{new Set(admins.map(a => a.company_id)).size}</p>
            </div>
          </div>
        </div>

        {/* Content Area */}
        <div className="glass-card rounded-3xl overflow-hidden animate-slide-up" style={{ animationDelay: '200ms' }}>
          <div className="p-2 min-h-[400px]">
            {loading ? (
              <div className="flex flex-col items-center justify-center py-24 gap-4">
                <Loader2 className="h-12 w-12 animate-spin text-primary" />
                <p className="text-muted-foreground font-black animate-pulse uppercase tracking-widest">Initialisation...</p>
              </div>
            ) : (
              <CompanyAdminsTable admins={filteredAdmins} onRemove={setAdminToRemove} />
            )}
          </div>
        </div>

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
