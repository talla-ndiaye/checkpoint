import { useState, useEffect } from 'react';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { useEmployees, Employee, CreateEmployeeData } from '@/hooks/useEmployees';
import { EmployeesTable } from '@/components/employees/EmployeesTable';
import { EmployeeFormDialog } from '@/components/employees/EmployeeFormDialog';
import { EmployeeEditDialog } from '@/components/employees/EmployeeEditDialog';
import { DeleteEmployeeDialog } from '@/components/employees/DeleteEmployeeDialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Plus, Search, Loader2, QrCode, Users, UserPlus } from 'lucide-react';
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
        <div className="flex flex-col items-center justify-center py-24 gap-4">
          <Loader2 className="h-12 w-12 animate-spin text-primary" />
          <p className="text-muted-foreground font-black animate-pulse">CHARGEMENT...</p>
        </div>
      </DashboardLayout>
    );
  }

  if (!companyId) {
    return (
      <DashboardLayout>
        <div className="flex flex-col items-center justify-center py-32 text-center glass-card rounded-3xl max-w-2xl mx-auto border-dashed">
          <div className="h-20 w-20 rounded-full bg-muted/20 flex items-center justify-center mb-6">
            <Users className="h-10 w-10 text-muted-foreground" />
          </div>
          <h2 className="text-3xl font-black tracking-tight mb-2">Aucune entreprise associée</h2>
          <p className="text-muted-foreground text-lg italic max-w-sm">
            Vous n'êtes pas encore administrateur d'une entreprise enregistrée dans le système.
          </p>
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      <div className="space-y-8 animate-fade-in">
        {/* Unified Page Header */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="flex items-center gap-5">
            <div className="h-16 w-16 rounded-3xl bg-primary/10 flex items-center justify-center shadow-inner animate-scale-in">
              <Users className="h-8 w-8 text-primary" />
            </div>
            <div>
              <h1 className="text-4xl font-black tracking-tight text-slate-900 uppercase">Gestion des employés</h1>
              <p className="text-slate-500 mt-1 text-lg font-medium">
                Enregistrez et administrez le personnel de votre entreprise
              </p>
            </div>
          </div>
          <Button onClick={() => setIsFormOpen(true)} className="h-14 px-8 rounded-2xl gap-3 font-black text-lg shadow-glow hover:scale-[1.02] transition-all">
            <Plus className="h-6 w-6" />
            Nouvel employé
          </Button>
        </div>

        {/* Search & Stats Bar */}
        <div className="bg-white border border-border p-6 rounded-[2.5rem] flex flex-col md:flex-row gap-6 justify-between items-center animate-slide-up shadow-sm" style={{ animationDelay: '100ms' }}>
          <div className="relative w-full md:w-96 group">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-slate-400 group-focus-within:text-primary transition-colors" />
            <Input
              placeholder="Rechercher par nom, email..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-12 h-14 rounded-2xl bg-slate-50 border-slate-200 focus:border-primary/50 transition-all font-medium"
            />
          </div>
          <div className="flex items-center gap-8 px-6 py-3 bg-slate-50 rounded-2xl border border-border">
            <div className="text-center">
              <p className="text-[10px] uppercase tracking-widest text-slate-400 font-bold">Total</p>
              <p className="text-xl font-black text-slate-900">{employees.length}</p>
            </div>
            <div className="h-8 w-px bg-border" />
            <div className="text-center">
              <p className="text-[10px] uppercase tracking-widest text-primary font-bold">Actifs</p>
              <p className="text-xl font-black text-slate-900">{employees.length}</p>
            </div>
          </div>
        </div>

        {/* Content Area */}
        <div className="bg-white border border-border rounded-[2.5rem] overflow-hidden animate-slide-up shadow-sm pr-1" style={{ animationDelay: '200ms' }}>
          <div className="p-2 min-h-[400px]">
            {loading ? (
              <div className="flex flex-col items-center justify-center py-24 gap-4">
                <Loader2 className="h-12 w-12 animate-spin text-primary" />
                <p className="text-muted-foreground font-black animate-pulse uppercase tracking-widest">Récupération des données...</p>
              </div>
            ) : (
              <EmployeesTable
                employees={filteredEmployees}
                onDelete={handleDelete}
                onEdit={handleEdit}
                onViewQR={handleViewQR}
              />
            )}
          </div>
        </div>

        {/* Dialogs */}
        <EmployeeFormDialog
          open={isFormOpen}
          onOpenChange={setIsFormOpen}
          onSubmit={handleCreateEmployee}
          defaultCompanyId={companyId}
        />

        <EmployeeEditDialog
          open={isEditOpen}
          onOpenChange={setIsEditOpen}
          employee={selectedEmployee}
          onSubmit={handleUpdateEmployee}
        />

        <DeleteEmployeeDialog
          open={deleteDialogOpen}
          onOpenChange={setDeleteDialogOpen}
          employee={selectedEmployee}
          onConfirm={handleConfirmDelete}
        />

        {/* QR Code Dialog - Modernized */}
        <Dialog open={qrDialogOpen} onOpenChange={setQrDialogOpen}>
          <DialogContent className="sm:max-w-md bg-card/95 backdrop-blur-2xl border-white/10 rounded-3xl overflow-hidden p-0">
            <div className="h-32 bg-gradient-to-br from-primary via-primary/80 to-accent animate-shimmer bg-[length:200%_100%] flex items-center justify-center">
              <QrCode className="h-16 w-16 text-white animate-bounce-in" />
            </div>
            <div className="p-8 space-y-8 flex flex-col items-center text-center">
              <div>
                <h3 className="text-2xl font-black tracking-tight">Badge Digital</h3>
                <p className="text-muted-foreground font-medium uppercase text-xs tracking-widest mt-1">
                  {selectedQREmployee?.profile?.first_name} {selectedQREmployee?.profile?.last_name}
                </p>
              </div>

              <div className="relative group p-2 bg-white rounded-3xl shadow-2xl shadow-primary/20 hover:scale-105 transition-transform duration-500">
                <img
                  src={`https://api.qrserver.com/v1/create-qr-code/?size=300x300&data=${encodeURIComponent(
                    selectedQREmployee?.qr_code || ''
                  )}`}
                  alt="QR Code"
                  className="h-56 w-56 rounded-2xl"
                />
              </div>

              <div className="w-full p-4 rounded-2xl bg-muted/30 border border-white/5">
                <p className="text-[10px] text-muted-foreground font-black uppercase tracking-tighter mb-1">Code Unique Sécurisé</p>
                <p className="font-mono text-xl font-black tracking-[0.2em] text-primary">
                  {selectedQREmployee?.unique_code}
                </p>
              </div>

              <Button onClick={() => setQrDialogOpen(false)} className="w-full h-14 rounded-2xl font-black text-lg">
                Fermer
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>
    </DashboardLayout>
  );
}
