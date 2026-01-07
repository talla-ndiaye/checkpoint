import { useState, useEffect } from 'react';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { useEmployees, Employee, CreateEmployeeData } from '@/hooks/useEmployees';
import { EmployeesTable } from '@/components/employees/EmployeesTable';
import { EmployeeFormDialog } from '@/components/employees/EmployeeFormDialog';
import { EmployeeEditDialog } from '@/components/employees/EmployeeEditDialog';
import { DeleteEmployeeDialog } from '@/components/employees/DeleteEmployeeDialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Plus, Search, Loader2, QrCode } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';

export default function CompanyAdminEmployees() {
  const { user } = useAuth();
  const [companyId, setCompanyId] = useState<string | undefined>();
  const [loadingCompany, setLoadingCompany] = useState(true);
  const { employees, loading, createEmployee, updateEmployee, deleteEmployee } = useEmployees(companyId);
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [isEditOpen, setIsEditOpen] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [selectedEmployee, setSelectedEmployee] = useState<Employee | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [qrDialogOpen, setQrDialogOpen] = useState(false);
  const [selectedQREmployee, setSelectedQREmployee] = useState<Employee | null>(null);

  useEffect(() => {
    const fetchCompanyId = async () => {
      if (!user) return;
      
      try {
        // Get the company where this user is admin
        const { data, error } = await supabase
          .from('companies')
          .select('id')
          .eq('admin_id', user.id)
          .maybeSingle();
        
        if (error) throw error;
        if (data) {
          setCompanyId(data.id);
        }
      } catch (error) {
        console.error('Error fetching company:', error);
      } finally {
        setLoadingCompany(false);
      }
    };

    fetchCompanyId();
  }, [user]);

  const handleDelete = (employee: Employee) => {
    setSelectedEmployee(employee);
    setDeleteDialogOpen(true);
  };

  const handleEdit = (employee: Employee) => {
    setSelectedEmployee(employee);
    setIsEditOpen(true);
  };

  const handleConfirmDelete = async () => {
    if (selectedEmployee) {
      await deleteEmployee(selectedEmployee.id);
      setSelectedEmployee(null);
    }
  };

  const handleCreateEmployee = async (data: CreateEmployeeData) => {
    await createEmployee({
      ...data,
      company_id: companyId!,
    });
  };

  const handleUpdateEmployee = async (data: { first_name: string; last_name: string; email: string; phone?: string }) => {
    if (selectedEmployee) {
      await updateEmployee(selectedEmployee.id, selectedEmployee.user_id, data);
      setSelectedEmployee(null);
    }
  };

  const handleViewQR = (employee: Employee) => {
    setSelectedQREmployee(employee);
    setQrDialogOpen(true);
  };

  const filteredEmployees = employees.filter((employee) => {
    const fullName = `${employee.profile?.first_name || ''} ${employee.profile?.last_name || ''}`.toLowerCase();
    const email = employee.profile?.email?.toLowerCase() || '';
    const code = employee.unique_code?.toLowerCase() || '';
    const search = searchTerm.toLowerCase();
    return fullName.includes(search) || email.includes(search) || code.includes(search);
  });

  if (loadingCompany) {
    return (
      <DashboardLayout>
        <div className="flex items-center justify-center h-64">
          <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
        </div>
      </DashboardLayout>
    );
  }

  if (!companyId) {
    return (
      <DashboardLayout>
        <div className="flex flex-col items-center justify-center h-64 text-center">
          <h2 className="text-xl font-semibold">Aucune entreprise associée</h2>
          <p className="text-muted-foreground mt-2">
            Vous n'êtes pas encore administrateur d'une entreprise.
          </p>
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold tracking-tight">Gestion des employés</h1>
            <p className="text-muted-foreground">
              Gérez les employés de votre entreprise
            </p>
          </div>
          <Button onClick={() => setIsFormOpen(true)}>
            <Plus className="mr-2 h-4 w-4" />
            Nouvel employé
          </Button>
        </div>

        {/* Search */}
        <div className="relative max-w-sm">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Rechercher un employé..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10"
          />
        </div>

        {/* Content */}
        {loading ? (
          <div className="flex items-center justify-center h-64">
            <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
          </div>
        ) : (
          <EmployeesTable
            employees={filteredEmployees}
            onDelete={handleDelete}
            onEdit={handleEdit}
            onViewQR={handleViewQR}
          />
        )}

        {/* Form Dialog */}
        <EmployeeFormDialog
          open={isFormOpen}
          onOpenChange={setIsFormOpen}
          onSubmit={handleCreateEmployee}
          defaultCompanyId={companyId}
        />

        {/* Edit Dialog */}
        <EmployeeEditDialog
          open={isEditOpen}
          onOpenChange={setIsEditOpen}
          employee={selectedEmployee}
          onSubmit={handleUpdateEmployee}
        />

        {/* Delete Dialog */}
        <DeleteEmployeeDialog
          open={deleteDialogOpen}
          onOpenChange={setDeleteDialogOpen}
          employee={selectedEmployee}
          onConfirm={handleConfirmDelete}
        />

        {/* QR Code Dialog */}
        <Dialog open={qrDialogOpen} onOpenChange={setQrDialogOpen}>
          <DialogContent className="sm:max-w-md">
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2">
                <QrCode className="h-5 w-5" />
                QR Code de {selectedQREmployee?.profile?.first_name} {selectedQREmployee?.profile?.last_name}
              </DialogTitle>
            </DialogHeader>
            <div className="flex flex-col items-center space-y-4 py-4">
              <div className="bg-white p-4 rounded-lg">
                <img
                  src={`https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=${encodeURIComponent(
                    selectedQREmployee?.qr_code || ''
                  )}`}
                  alt="QR Code"
                  className="h-48 w-48"
                />
              </div>
              <div className="text-center">
                <p className="text-sm text-muted-foreground">Code unique</p>
                <p className="font-mono text-lg font-semibold">
                  {selectedQREmployee?.unique_code}
                </p>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      </div>
    </DashboardLayout>
  );
}
