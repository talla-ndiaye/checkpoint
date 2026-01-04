import { useState } from 'react';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { CalendarPlus, Search, Loader2 } from 'lucide-react';
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
      <div className="space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="text-2xl sm:text-3xl font-bold text-foreground">Mes invitations</h1>
            <p className="text-muted-foreground">Gérez vos invitations visiteurs</p>
          </div>
          <Button onClick={() => setIsDialogOpen(true)} className="w-full sm:w-auto">
            <CalendarPlus className="mr-2 h-4 w-4" />
            Nouvelle invitation
          </Button>
        </div>

        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Rechercher par nom ou code..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10"
          />
        </div>

        {isLoading ? (
          <div className="flex items-center justify-center py-12">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
          </div>
        ) : filteredInvitations.length === 0 ? (
          <div className="text-center py-12">
            <CalendarPlus className="mx-auto h-12 w-12 text-muted-foreground/50" />
            <h3 className="mt-4 text-lg font-medium text-foreground">Aucune invitation</h3>
            <p className="text-muted-foreground">
              {searchTerm
                ? 'Aucune invitation ne correspond à votre recherche'
                : 'Créez votre première invitation pour un visiteur'}
            </p>
          </div>
        ) : (
          <div className="grid gap-4">
            {filteredInvitations.map((invitation) => (
              <InvitationCard
                key={invitation.id}
                invitation={invitation}
                onShare={shareViaWhatsApp}
                onCancel={(id) => cancelInvitation.mutate(id)}
              />
            ))}
          </div>
        )}
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
