import { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { useEmployees, Employee, CreateEmployeeData } from '@/hooks/useEmployees';
import { EmployeesTable } from '@/components/employees/EmployeesTable';
import { EmployeeFormDialog } from '@/components/employees/EmployeeFormDialog';
import { DeleteEmployeeDialog } from '@/components/employees/DeleteEmployeeDialog';
import { Plus, Search, Users, Loader2, ArrowLeft } from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';

export default function EmployeesPage() {
  const navigate = useNavigate();
  const { companyId } = useParams<{ companyId: string }>();
  const { user, loading: authLoading } = useAuth();
  const { employees, loading, createEmployee, deleteEmployee } = useEmployees(companyId);
  const [searchQuery, setSearchQuery] = useState('');
  const [formDialogOpen, setFormDialogOpen] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [selectedEmployee, setSelectedEmployee] = useState<Employee | null>(null);

  useEffect(() => {
    if (!authLoading && !user) {
      navigate('/auth');
    }
  }, [user, authLoading, navigate]);

  const filteredEmployees = employees.filter(
    (employee) =>
      employee.profile?.first_name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      employee.profile?.last_name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      employee.profile?.email?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      employee.unique_code?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleCreate = () => {
    setFormDialogOpen(true);
  };

  const handleDelete = (employee: Employee) => {
    setSelectedEmployee(employee);
    setDeleteDialogOpen(true);
  };

  const handleFormSubmit = async (data: CreateEmployeeData) => {
    await createEmployee(data);
  };

  const handleDeleteConfirm = async () => {
    if (selectedEmployee) {
      await deleteEmployee(selectedEmployee.id);
    }
  };

  const companyName = employees[0]?.company?.name || 'Employés';

  return (
    <DashboardLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
          <div className="flex items-center gap-4">
            {companyId && (
              <Button 
                variant="ghost" 
                size="icon"
                onClick={() => navigate('/manager/companies')}
              >
                <ArrowLeft className="h-4 w-4" />
              </Button>
            )}
            <div>
              <h1 className="text-3xl font-bold tracking-tight">
                {companyId ? `Employés - ${companyName}` : 'Gestion des Employés'}
              </h1>
              <p className="text-muted-foreground">
                Gérez les employés et leurs accès
              </p>
            </div>
          </div>
          <Button onClick={handleCreate} className="gap-2">
            <Plus className="h-4 w-4" />
            Nouvel employé
          </Button>
        </div>

        {/* Stats Cards */}
        <div className="grid gap-4 md:grid-cols-3">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total des employés</CardTitle>
              <Users className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{employees.length}</div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Avec QR Code</CardTitle>
              <Users className="h-4 w-4 text-primary" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {employees.filter((e) => e.qr_code).length}
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Actifs aujourd'hui</CardTitle>
              <Users className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">0</div>
            </CardContent>
          </Card>
        </div>

        {/* Employees Table */}
        <Card>
          <CardHeader>
            <CardTitle>Liste des employés</CardTitle>
            <CardDescription>
              Tous les employés enregistrés
            </CardDescription>
          </CardHeader>
          <CardContent>
            {/* Search */}
            <div className="mb-4">
              <div className="relative max-w-sm">
                <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                <Input
                  placeholder="Rechercher un employé..."
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
              <EmployeesTable
                employees={filteredEmployees}
                onDelete={handleDelete}
              />
            )}
          </CardContent>
        </Card>
      </div>

      {/* Dialogs */}
      <EmployeeFormDialog
        open={formDialogOpen}
        onOpenChange={setFormDialogOpen}
        onSubmit={handleFormSubmit}
        defaultCompanyId={companyId}
      />

      <DeleteEmployeeDialog
        open={deleteDialogOpen}
        onOpenChange={setDeleteDialogOpen}
        employee={selectedEmployee}
        onConfirm={handleDeleteConfirm}
      />
    </DashboardLayout>
  );
}
