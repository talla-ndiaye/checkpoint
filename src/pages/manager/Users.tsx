import { useState, useEffect } from 'react';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { useUsers, UserProfile } from '@/hooks/useUsers';
import { useManagerSite } from '@/hooks/useManagerSite';
import { useCompanies } from '@/hooks/useCompanies';
import { UsersTable } from '@/components/admin/UsersTable';
import { UserEditDialog } from '@/components/admin/UserEditDialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Search, Users, Loader2, Building2, Filter, X } from 'lucide-react';
import { toast } from 'sonner';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";

export default function ManagerUsersManagement() {
    const { sites, loading: sitesLoading } = useManagerSite();
    const [selectedSiteId, setSelectedSiteId] = useState<string | undefined>();
    const [selectedCompanyId, setSelectedCompanyId] = useState<string | undefined>();
    const [selectedRole, setSelectedRole] = useState<string | undefined>();
    const [searchQuery, setSearchQuery] = useState('');

    const { users, loading, updateUser, deleteUser } = useUsers({
        siteId: selectedSiteId,
        companyId: selectedCompanyId === 'all' ? undefined : selectedCompanyId,
        role: selectedRole === 'all' ? undefined : (selectedRole as any)
    });

    const { companies } = useCompanies(selectedSiteId);

    const [editDialogOpen, setEditDialogOpen] = useState(false);
    const [selectedUser, setSelectedUser] = useState<UserProfile | null>(null);

    useEffect(() => {
        if (sites.length > 0 && !selectedSiteId) {
            setSelectedSiteId(sites[0].id);
        }
    }, [sites]);

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

    const resetFilters = () => {
        setSelectedCompanyId('all');
        setSelectedRole('all');
    };

    return (
        <DashboardLayout>
            <div className="space-y-8 animate-fade-in">
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
                    <div className="flex items-center gap-5">
                        <div className="h-16 w-16 rounded-3xl bg-indigo-50 flex items-center justify-center shadow-inner">
                            <Users className="h-8 w-8 text-indigo-600" />
                        </div>
                        <div>
                            <h1 className="text-4xl font-black tracking-tight text-slate-900 uppercase">Utilisateurs du Site</h1>
                            <p className="text-slate-500 mt-1 text-lg font-medium">
                                Gérez les accès et les profils des personnes fréquentant vos bâtiments
                            </p>
                        </div>
                    </div>

                    {sites.length > 1 && (
                        <div className="w-64">
                            <Select value={selectedSiteId} onValueChange={setSelectedSiteId}>
                                <SelectTrigger className="h-14 rounded-2xl border-2 font-bold shadow-sm">
                                    <SelectValue placeholder="Sélectionner un site" />
                                </SelectTrigger>
                                <SelectContent className="rounded-2xl border-2">
                                    {sites.map(site => (
                                        <SelectItem key={site.id} value={site.id} className="font-bold cursor-pointer">
                                            {site.name}
                                        </SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        </div>
                    )}
                </div>

                {/* Action & Filter Bar */}
                <div className="bg-white border border-border p-8 rounded-[2.5rem] space-y-6 shadow-sm">
                    <div className="flex flex-col lg:flex-row gap-6">
                        <div className="relative flex-1 group">
                            <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-slate-400 group-focus-within:text-indigo-600 transition-colors" />
                            <Input
                                placeholder="Rechercher par nom, email..."
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                                className="pl-12 h-14 rounded-2xl bg-slate-50 border-slate-200 focus:border-indigo-600/50 transition-all font-medium"
                            />
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <Select value={selectedCompanyId} onValueChange={setSelectedCompanyId}>
                                <SelectTrigger className="h-14 rounded-2xl bg-white border-2 font-bold min-w-[200px]">
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
                                    <SelectItem value="guardian">Gardiens</SelectItem>
                                    <SelectItem value="company_admin">Admin Entreprise</SelectItem>
                                    <SelectItem value="employee">Employés</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>

                        {(selectedCompanyId !== 'all' || selectedRole !== 'all') && (
                            <Button variant="ghost" onClick={resetFilters} className="h-14 px-4 rounded-2xl text-slate-400 hover:text-indigo-600">
                                <X className="h-5 w-5 mr-2" />
                                Effacer
                            </Button>
                        )}
                    </div>
                </div>

                {/* Content Area */}
                <div className="min-h-[500px]">
                    {loading || sitesLoading ? (
                        <div className="flex flex-col items-center justify-center py-32 gap-4 bg-white border border-border rounded-[2.5rem]">
                            <Loader2 className="h-12 w-12 animate-spin text-indigo-600" />
                            <p className="text-slate-400 font-bold uppercase tracking-widest text-sm">Synchronisation des accès...</p>
                        </div>
                    ) : (
                        <UsersTable
                            users={filteredUsers}
                            onEdit={handleEdit}
                            onDelete={(u) => toast.error('Suppression restreinte au Super Admin')}
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
        </DashboardLayout>
    );
}
