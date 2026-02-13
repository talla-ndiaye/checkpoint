import { useState } from 'react';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { CalendarPlus, Search, Loader2, UserPlus, Filter, Share2, XCircle } from 'lucide-react';
import { useInvitations } from '@/hooks/useInvitations';
import { InvitationFormDialog } from '@/components/invitations/InvitationFormDialog';
import { InvitationCard } from '@/components/invitations/InvitationCard';

export default function InvitationsPage() {
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');

  const {
    invitations,
    isLoading,
    createInvitation,
    cancelInvitation,
    shareViaWhatsApp,
  } = useInvitations();

  const filteredInvitations = invitations.filter((inv) =>
    inv.visitor_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    inv.alpha_code.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleCreateInvitation = (data: {
    visitor_name: string;
    visitor_phone: string;
    visit_date: string;
    visit_time: string;
  }) => {
    createInvitation.mutate(data, {
      onSuccess: () => setIsDialogOpen(false),
    });
  };

  return (
    <DashboardLayout>
      <div className="max-w-5xl mx-auto space-y-8 animate-fade-in">
        {/* Unified Page Header */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="flex items-center gap-5">
            <div className="h-16 w-16 rounded-3xl bg-primary/10 flex items-center justify-center shadow-inner">
              <CalendarPlus className="h-8 w-8 text-primary" />
            </div>
            <div>
              <h1 className="text-4xl font-black tracking-tight gradient-text">Mes invitations</h1>
              <p className="text-muted-foreground mt-1 text-lg italic">
                Gérez vos accès visiteurs et partagez les badges d'entrée
              </p>
            </div>
          </div>
          <Button onClick={() => setIsDialogOpen(true)} className="h-14 px-8 rounded-2xl gap-3 font-black text-lg shadow-glow hover:scale-[1.02] transition-all">
            <PlusIcon className="h-6 w-6" />
            Nouvelle invitation
          </Button>
        </div>

        {/* Search & Tool Bar */}
        <div className="glass-card p-4 sm:p-6 rounded-3xl flex flex-col md:flex-row gap-4 items-center animate-slide-up" style={{ animationDelay: '100ms' }}>
          <div className="relative flex-1 w-full group">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground group-focus-within:text-primary transition-colors" />
            <Input
              placeholder="Rechercher un visiteur ou un code..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-12 h-14 rounded-2xl bg-white/5 border-white/10 focus:border-primary/50 transition-all font-medium"
            />
          </div>
          <div className="flex gap-2 w-full md:w-auto">
            <Button variant="outline" className="h-14 flex-1 md:w-14 md:px-0 rounded-2xl border-white/10 hover:bg-white/5">
              <Filter className="h-5 w-5" />
              <span className="md:hidden ml-2 font-bold">Filtres</span>
            </Button>
          </div>
        </div>

        {/* Content Area */}
        <div className="space-y-4">
          {isLoading ? (
            <div className="flex flex-col items-center justify-center py-24 gap-4 glass-card rounded-3xl">
              <Loader2 className="h-12 w-12 animate-spin text-primary" />
              <p className="text-muted-foreground font-black animate-pulse uppercase tracking-widest">Récupération de vos accès...</p>
            </div>
          ) : filteredInvitations.length === 0 ? (
            <div className="text-center py-24 glass-card rounded-[40px] border-dashed border-white/10 opacity-60">
              <div className="h-24 w-24 bg-muted/20 rounded-full flex items-center justify-center mx-auto mb-6">
                <XCircle className="h-12 w-12 text-muted-foreground" />
              </div>
              <h3 className="text-2xl font-black tracking-tight uppercase">Aucune invitation</h3>
              <p className="text-muted-foreground mt-2 italic max-w-xs mx-auto">
                {searchTerm
                  ? 'Aucune invitation ne correspond à votre recherche'
                  : 'Créez votre première invitation pour faciliter l\'accès à vos visiteurs.'}
              </p>
              {!searchTerm && (
                <Button onClick={() => setIsDialogOpen(true)} variant="ghost" className="mt-6 text-primary font-black uppercase tracking-widest">
                  Créer maintenant
                </Button>
              )}
            </div>
          ) : (
            <div className="grid gap-6">
              {filteredInvitations.map((invitation, index) => (
                <div key={invitation.id} className="animate-slide-up" style={{ animationDelay: `${index * 50 + 200}ms` }}>
                  <InvitationCard
                    invitation={invitation}
                    onShare={shareViaWhatsApp}
                    onCancel={(id) => cancelInvitation.mutate(id)}
                  />
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      <InvitationFormDialog
        open={isDialogOpen}
        onOpenChange={setIsDialogOpen}
        onSubmit={handleCreateInvitation}
        isLoading={createInvitation.isPending}
      />
    </DashboardLayout>
  );
}

function PlusIcon(props: any) {
  return (
    <svg
      {...props}
      xmlns="http://www.w3.org/2000/svg"
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="3"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M5 12h14" />
      <path d="M12 5v14" />
    </svg>
  );
}
