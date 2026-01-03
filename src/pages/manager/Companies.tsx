import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { useCompanies, Company, CreateCompanyData } from '@/hooks/useCompanies';
import { CompaniesTable } from '@/components/companies/CompaniesTable';
import { CompanyFormDialog } from '@/components/companies/CompanyFormDialog';
import { DeleteCompanyDialog } from '@/components/companies/DeleteCompanyDialog';
import { Plus, Search, Briefcase, Loader2 } from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';
import { useEffect } from 'react';

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
      <div className="space-y-6">
        {/* Header */}
        <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Gestion des Entreprises</h1>
            <p className="text-muted-foreground">
              Gérez les entreprises de votre site
            </p>
          </div>
          <Button onClick={handleCreate} className="gap-2">
            <Plus className="h-4 w-4" />
            Nouvelle entreprise
          </Button>
        </div>

        {/* Stats Cards */}
        <div className="grid gap-4 md:grid-cols-3">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total des entreprises</CardTitle>
              <Briefcase className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{companies.length}</div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Avec administrateur</CardTitle>
              <Briefcase className="h-4 w-4 text-primary" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {companies.filter((c) => c.admin_id).length}
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total employés</CardTitle>
              <Briefcase className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {companies.reduce((acc, c) => acc + (c.employee_count || 0), 0)}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Companies Table */}
        <Card>
          <CardHeader>
            <CardTitle>Liste des entreprises</CardTitle>
            <CardDescription>
              Toutes les entreprises enregistrées
            </CardDescription>
          </CardHeader>
          <CardContent>
            {/* Search */}
            <div className="mb-4">
              <div className="relative max-w-sm">
                <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                <Input
                  placeholder="Rechercher une entreprise..."
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
              <CompaniesTable
                companies={filteredCompanies}
                onEdit={handleEdit}
                onDelete={handleDelete}
                onViewEmployees={handleViewEmployees}
              />
            )}
          </CardContent>
        </Card>
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
