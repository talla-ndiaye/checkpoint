import { useState } from 'react';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { useUsers, UserProfile } from '@/hooks/useUsers';
import { useSites } from '@/hooks/useSites';
import { useCompanies } from '@/hooks/useCompanies';
import { UsersTable } from '@/components/admin/UsersTable';
import { UserEditDialog } from '@/components/admin/UserEditDialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Plus, Search, Users, Loader2, Filter, Download, X } from 'lucide-react';
import { toast } from 'sonner';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogDescription,
    DialogFooter,
} from "@/components/ui/dialog";

export default function UsersManagement() {
    const [selectedSiteId, setSelectedSiteId] = useState<string | undefined>();
    const [selectedCompanyId, setSelectedCompanyId] = useState<string | undefined>();
    const [selectedRole, setSelectedRole] = useState<string | undefined>();
    const [searchQuery, setSearchQuery] = useState('');

    const { users, loading, deleteUser, updateUser } = useUsers({
        siteId: selectedSiteId === 'all' ? undefined : selectedSiteId,
        companyId: selectedCompanyId === 'all' ? undefined : selectedCompanyId,
        role: selectedRole === 'all' ? undefined : (selectedRole as any)
    });

    const { sites } = useSites();
    const { companies } = useCompanies(selectedSiteId === 'all' ? undefined : selectedSiteId);

    const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
    const [editDialogOpen, setEditDialogOpen] = useState(false);
    const [selectedUser, setSelectedUser] = useState<UserProfile | null>(null);

    const filteredUsers = users.filter(
        (u) =>
            u.first_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
            u.last_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
            u.email.toLowerCase().includes(searchQuery.toLowerCase())
    );

    const handleEdit = (user: UserProfile) => {
        setSelectedUser(user);
        setEditDialogOpen(true);
    };

    const handleDelete = (user: UserProfile) => {
        setSelectedUser(user);
        setDeleteDialogOpen(true);
    };

    const confirmDelete = async () => {
        if (selectedUser) {
            await deleteUser(selectedUser.id);
            setDeleteDialogOpen(false);
        }
    };

    const resetFilters = () => {
        setSelectedSiteId('all');
        setSelectedCompanyId('all');
        setSelectedRole('all');
    };

    return (
        <DashboardLayout>
            <div className="space-y-8 animate-fade-in">
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
                    <div className="flex items-center gap-5">
                        <div className="h-16 w-16 rounded-3xl bg-primary/10 flex items-center justify-center shadow-inner">
                            <Users className="h-8 w-8 text-primary" />
                        </div>
                        <div>
                            <h1 className="text-4xl font-black tracking-tight text-slate-900 uppercase">Gestion Utilisateurs</h1>
                            <p className="text-slate-500 mt-1 text-lg font-medium">
                                Contrôle global et filtrage avancé par site et entreprise
                            </p>
                        </div>
                    </div>
                    <div className="flex gap-3">
                        <Button variant="outline" className="h-14 px-6 rounded-2xl gap-3 font-bold border-2 transition-all">
                            <Download className="h-5 w-5" />
                            Exporter CSV
                        </Button>
                    </div>
                </div>

                {/* Action & Filter Bar */}
                <div className="bg-white border border-border p-8 rounded-[2.5rem] space-y-6 shadow-sm">
                    <div className="flex flex-col lg:flex-row gap-6">
                        <div className="relative flex-1 group">
                            <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-slate-400 group-focus-within:text-primary transition-colors" />
                            <Input
                                placeholder="Rechercher par nom, email..."
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                                className="pl-12 h-14 rounded-2xl bg-slate-50 border-slate-200 focus:border-primary/50 transition-all font-medium"
                            />
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                            <Select value={selectedSiteId} onValueChange={setSelectedSiteId}>
                                <SelectTrigger className="h-14 rounded-2xl bg-white border-2 font-bold min-w-[180px]">
                                    <SelectValue placeholder="Tous les sites" />
                                </SelectTrigger>
                                <SelectContent className="rounded-2xl border-2">
                                    <SelectItem value="all">Tous les sites</SelectItem>
                                    {sites.map(site => (
                                        <SelectItem key={site.id} value={site.id}>{site.name}</SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>

                            <Select value={selectedCompanyId} onValueChange={setSelectedCompanyId}>
                                <SelectTrigger className="h-14 rounded-2xl bg-white border-2 font-bold min-w-[180px]">
                                    <SelectValue placeholder="Toutes les entreprises" />
                                </SelectTrigger>
                                <SelectContent className="rounded-2xl border-2">
                                    <SelectItem value="all">Toutes les entreprises</SelectItem>
                                    {companies.map(company => (
                                        <SelectItem key={company.id} value={company.id}>{company.name}</SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>

                            <Select value={selectedRole} onValueChange={setSelectedRole}>
                                <SelectTrigger className="h-14 rounded-2xl bg-white border-2 font-bold min-w-[150px]">
                                    <SelectValue placeholder="Tous les rôles" />
                                </SelectTrigger>
                                <SelectContent className="rounded-2xl border-2">
                                    <SelectItem value="all">Tous les rôles</SelectItem>
                                    <SelectItem value="manager">Gestionnaires</SelectItem>
                                    <SelectItem value="guardian">Gardiens</SelectItem>
                                    <SelectItem value="company_admin">Admin Entreprise</SelectItem>
                                    <SelectItem value="employee">Employés</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>

                        {(selectedSiteId !== 'all' || selectedCompanyId !== 'all' || selectedRole !== 'all') && (
                            <Button variant="ghost" onClick={resetFilters} className="h-14 px-4 rounded-2xl text-slate-400 hover:text-destructive">
                                <X className="h-5 w-5 mr-2" />
                                Effacer
                            </Button>
                        )}
                    </div>
                </div>

                {/* Content Area */}
                <div className="min-h-[500px]">
                    {loading ? (
                        <div className="flex flex-col items-center justify-center py-32 gap-4 bg-white border border-border rounded-[2.5rem]">
                            <Loader2 className="h-12 w-12 animate-spin text-primary" />
                            <p className="text-slate-400 font-bold uppercase tracking-widest text-sm">Chargement des données...</p>
                        </div>
                    ) : (
                        <UsersTable
                            users={filteredUsers}
                            onEdit={handleEdit}
                            onDelete={handleDelete}
                        />
                    )}
                </div>
            </div>

            <UserEditDialog
                user={selectedUser}
                open={editDialogOpen}
                onOpenChange={setEditDialogOpen}
                onSubmit={updateUser}
            />

            {/* Delete Confirmation */}
            <Dialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
                <DialogContent className="rounded-3xl border-2">
                    <DialogHeader className="space-y-4">
                        <div className="h-16 w-16 bg-destructive/10 rounded-2xl flex items-center justify-center mx-auto mb-2">
                            <Users className="h-8 w-8 text-destructive" />
                        </div>
                        <DialogTitle className="text-2xl font-black text-center text-slate-900 uppercase">Supprimer l'utilisateur ?</DialogTitle>
                        <DialogDescription className="text-center text-slate-500 font-medium">
                            Cette action supprimera le profil de <span className="font-bold text-slate-900">{selectedUser?.first_name} {selectedUser?.last_name}</span>.
                            <br />Le compte d'authentification restera actif dans Supabase Auth.
                        </DialogDescription>
                    </DialogHeader>
                    <DialogFooter className="flex gap-4 pt-6 sm:justify-center">
                        <Button variant="outline" className="h-12 px-8 rounded-xl font-bold border-2" onClick={() => setDeleteDialogOpen(false)}>Annuler</Button>
                        <Button variant="destructive" className="h-12 px-8 rounded-xl font-bold shadow-lg shadow-destructive/20" onClick={confirmDelete}>Confirmer </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </DashboardLayout>
    );
}
