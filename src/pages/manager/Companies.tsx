import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useCompanies, Company, CreateCompanyData } from '@/hooks/useCompanies';
import { CompaniesTable } from '@/components/companies/CompaniesTable';
import { CompanyFormDialog } from '@/components/companies/CompanyFormDialog';
import { DeleteCompanyDialog } from '@/components/companies/DeleteCompanyDialog';
import { Plus, Search, Briefcase, Loader2, Building2, Users, Shield } from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';
import { useEffect } from 'react';

export function StatCardMinimal({ title, value, icon: Icon, variant = 'primary' }: { title: string, value: string | number, icon: any, variant?: 'primary' | 'accent' | 'success' }) {
  const variants = {
    primary: 'bg-primary/10 text-primary',
    accent: 'bg-accent/10 text-accent',
    success: 'bg-success/10 text-success'
  };

  return (
    <div className="glass-card p-6 rounded-2xl flex items-center justify-between group hover:border-primary/30 transition-all duration-300">
      <div>
        <p className="text-sm font-medium text-muted-foreground mb-1">{title}</p>
        <div className="text-3xl font-black tracking-tight">{value}</div>
      </div>
      <div className={`p-4 rounded-xl ${variants[variant]} group-hover:scale-110 transition-transform shadow-inner`}>
        <Icon className="h-6 w-6" />
      </div>
    </div>
  );
}

export default function CompaniesPage() {
  const navigate = useNavigate();
  const { user, loading: authLoading } = useAuth();
  const { companies, loading, createCompany, updateCompany, deleteCompany } = useCompanies();
  const [searchQuery, setSearchQuery] = useState('');
  const [formDialogOpen, setFormDialogOpen] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [selectedCompany, setSelectedCompany] = useState<Company | null>(null);

  useEffect(() => {
    if (!authLoading && !user) {
      navigate('/auth');
    }
  }, [user, authLoading, navigate]);

  const filteredCompanies = companies.filter(
    (company) =>
      company.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      company.site?.name?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleCreate = () => {
    setSelectedCompany(null);
    setFormDialogOpen(true);
  };

  const handleEdit = (company: Company) => {
    setSelectedCompany(company);
    setFormDialogOpen(true);
  };

  const handleDelete = (company: Company) => {
    setSelectedCompany(company);
    setDeleteDialogOpen(true);
  };

  const handleViewEmployees = (company: Company) => {
    navigate(`/manager/companies/${company.id}/employees`);
  };

  const handleFormSubmit = async (data: CreateCompanyData) => {
    if (selectedCompany) {
      await updateCompany(selectedCompany.id, data);
    } else {
      await createCompany(data);
    }
  };

  const handleDeleteConfirm = async () => {
    if (selectedCompany) {
      await deleteCompany(selectedCompany.id);
    }
  };

  return (
    <DashboardLayout>
      <div className="space-y-8 animate-fade-in">
        {/* Unified Page Header */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="flex items-center gap-5">
            <div className="h-16 w-16 rounded-3xl bg-primary/10 flex items-center justify-center shadow-inner">
              <Building2 className="h-8 w-8 text-primary" />
            </div>
            <div>
              <h1 className="text-4xl font-black tracking-tight gradient-text">Gestion des Entreprises</h1>
              <p className="text-muted-foreground mt-1 text-lg italic">
                Administrez les entreprises partenaires de votre site
              </p>
            </div>
          </div>
          <Button onClick={handleCreate} className="h-14 px-8 rounded-2xl gap-3 font-black text-lg shadow-glow hover:scale-[1.02] transition-all">
            <Plus className="h-6 w-6" />
            Nouvelle entreprise
          </Button>
        </div>

        {/* Stats Section with staggered animation */}
        <div className="grid gap-6 md:grid-cols-3">
          <div className="animate-slide-up" style={{ animationDelay: '0ms' }}>
            <StatCardMinimal
              title="Total des entreprises"
              value={companies.length}
              icon={Briefcase}
            />
          </div>
          <div className="animate-slide-up" style={{ animationDelay: '100ms' }}>
            <StatCardMinimal
              title="Avec administrateur"
              value={companies.filter((c) => c.admin_id).length}
              icon={Shield}
              variant="accent"
            />
          </div>
          <div className="animate-slide-up" style={{ animationDelay: '200ms' }}>
            <StatCardMinimal
              title="Total employés"
              value={companies.reduce((acc, c) => acc + (c.employee_count || 0), 0)}
              icon={Users}
              variant="success"
            />
          </div>
        </div>

        {/* Main Content Area */}
        <div className="glass-card rounded-3xl overflow-hidden animate-slide-up" style={{ animationDelay: '300ms' }}>
          <div className="p-8 border-b border-white/10 flex flex-col md:flex-row md:items-center justify-between gap-6">
            <div>
              <h3 className="text-2xl font-black tracking-tight">Liste des entreprises</h3>
              <p className="text-sm text-muted-foreground mt-1">Gérez les accès et les paramètres de chaque entité</p>
            </div>

            <div className="relative w-full md:w-96 group">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground group-focus-within:text-primary transition-colors" />
              <Input
                placeholder="Rechercher une entreprise..."
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
                <p className="text-muted-foreground font-black animate-pulse">CHARGEMENT...</p>
              </div>
            ) : (
              <CompaniesTable
                companies={filteredCompanies}
                onEdit={handleEdit}
                onDelete={handleDelete}
                onViewEmployees={handleViewEmployees}
              />
            )}
          </div>
        </div>
      </div>

      {/* Dialogs */}
      <CompanyFormDialog
        open={formDialogOpen}
        onOpenChange={setFormDialogOpen}
        company={selectedCompany}
        onSubmit={handleFormSubmit}
      />

      <DeleteCompanyDialog
        open={deleteDialogOpen}
        onOpenChange={setDeleteDialogOpen}
        company={selectedCompany}
        onConfirm={handleDeleteConfirm}
      />
    </DashboardLayout>
  );
}
