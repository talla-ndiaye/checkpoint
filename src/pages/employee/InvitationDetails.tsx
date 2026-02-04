import { useParams, useNavigate } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { format } from 'date-fns';
import { fr } from 'date-fns/locale';
import { ArrowLeft, Calendar, Clock, User, Building, Key, QrCode, Phone, MapPin } from 'lucide-react';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { QRCodeDisplay } from '@/components/ui/QRCodeDisplay';
import { supabase } from '@/integrations/supabase/client';

const statusConfig: Record<string, { label: string; variant: 'default' | 'secondary' | 'destructive' | 'outline' }> = {
  pending: { label: 'En attente', variant: 'default' },
  used: { label: 'Utilisée', variant: 'secondary' },
  expired: { label: 'Expirée', variant: 'outline' },
  cancelled: { label: 'Annulée', variant: 'destructive' },
};

export default function InvitationDetails() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();

  const { data: invitation, isLoading } = useQuery({
    queryKey: ['invitation-details', id],
    queryFn: async () => {
      if (!id) return null;

      const { data, error } = await supabase
        .from('invitations')
        .select(`
          *,
          employee:employees(
            id,
            user_id,
            company:companies(
              id,
              name,
              site:sites(id, name, address)
            ),
            profile:profiles!employees_user_id_fkey(first_name, last_name, email, phone)
          )
        `)
        .eq('id', id)
        .single();

      if (error) throw error;
      return data;
    },
    enabled: !!id,
  });

  const getInvitationQRData = () => {
    if (!invitation) return '';
    return JSON.stringify({
      type: 'invitation',
      id: invitation.id,
      code: invitation.alpha_code,
      visitor: invitation.visitor_name,
      date: invitation.visit_date,
      time: invitation.visit_time,
    });
  };

  const status = invitation ? statusConfig[invitation.status] || statusConfig.pending : statusConfig.pending;

  if (isLoading) {
    return (
      <DashboardLayout>
        <div className="space-y-6">
          <Skeleton className="h-8 w-64" />
          <div className="grid gap-6 md:grid-cols-2">
            <Skeleton className="h-64" />
            <Skeleton className="h-64" />
          </div>
        </div>
      </DashboardLayout>
    );
  }

  if (!invitation) {
    return (
      <DashboardLayout>
        <div className="text-center py-12">
          <h2 className="text-xl font-semibold">Invitation non trouvée</h2>
          <Button onClick={() => navigate(-1)} className="mt-4">
            <ArrowLeft className="mr-2 h-4 w-4" />
            Retour
          </Button>
        </div>
      </DashboardLayout>
    );
  }

  const employee = invitation.employee as any;
  const company = employee?.company;
  const site = company?.site;
  const profile = employee?.profile;

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div className="flex items-center gap-4">
          <Button variant="ghost" size="icon" onClick={() => navigate(-1)}>
            <ArrowLeft className="h-5 w-5" />
          </Button>
          <div>
            <h1 className="text-2xl sm:text-3xl font-bold text-foreground">
              Détails de l'invitation
            </h1>
            <p className="text-muted-foreground">
              Invitation pour {invitation.visitor_name}
            </p>
          </div>
        </div>

        <div className="grid gap-6 md:grid-cols-2">
          {/* Visitor Information */}
          <Card className="glass-card">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <User className="h-5 w-5 text-primary" />
                Informations du visiteur
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-muted-foreground">Statut</span>
                <Badge variant={status.variant}>{status.label}</Badge>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-muted-foreground">Nom</span>
                <span className="font-medium">{invitation.visitor_name}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-muted-foreground">Téléphone</span>
                <span className="font-medium">{invitation.visitor_phone}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-muted-foreground">Date de visite</span>
                <span className="font-medium flex items-center gap-2">
                  <Calendar className="h-4 w-4" />
                  {format(new Date(invitation.visit_date), 'dd MMMM yyyy', { locale: fr })}
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-muted-foreground">Heure</span>
                <span className="font-medium flex items-center gap-2">
                  <Clock className="h-4 w-4" />
                  {invitation.visit_time}
                </span>
              </div>
            </CardContent>
          </Card>

          {/* QR Code & Access Code */}
          <Card className="glass-card">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <QrCode className="h-5 w-5 text-primary" />
                Code d'accès
              </CardTitle>
            </CardHeader>
            <CardContent className="flex flex-col items-center gap-4">
              <div className="p-4 bg-white rounded-2xl shadow-lg">
                <QRCodeDisplay data={getInvitationQRData()} size={180} />
              </div>
              <div className="flex items-center gap-2 p-3 bg-primary/5 rounded-lg border border-primary/10">
                <Key className="h-5 w-5 text-primary" />
                <span className="font-mono text-xl font-bold tracking-wider text-primary">
                  {invitation.alpha_code}
                </span>
              </div>
            </CardContent>
          </Card>

          {/* Inviter Information */}
          <Card className="glass-card">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Building className="h-5 w-5 text-primary" />
                Informations de l'invitant
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {profile && (
                <>
                  <div className="flex items-center justify-between">
                    <span className="text-muted-foreground">Nom</span>
                    <span className="font-medium">
                      {profile.first_name} {profile.last_name}
                    </span>
                  </div>
                  {profile.email && (
                    <div className="flex items-center justify-between">
                      <span className="text-muted-foreground">Email</span>
                      <span className="font-medium">{profile.email}</span>
                    </div>
                  )}
                  {profile.phone && (
                    <div className="flex items-center justify-between">
                      <span className="text-muted-foreground">Téléphone</span>
                      <span className="font-medium">{profile.phone}</span>
                    </div>
                  )}
                </>
              )}
              {company && (
                <div className="flex items-center justify-between">
                  <span className="text-muted-foreground">Entreprise</span>
                  <span className="font-medium">{company.name}</span>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Site Information */}
          <Card className="glass-card">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <MapPin className="h-5 w-5 text-primary" />
                Point d'accès
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {site && (
                <>
                  <div className="flex items-center justify-between">
                    <span className="text-muted-foreground">Site</span>
                    <span className="font-medium">{site.name}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-muted-foreground">Adresse</span>
                    <span className="font-medium text-right">{site.address}</span>
                  </div>
                </>
              )}
              <div className="flex items-center justify-between">
                <span className="text-muted-foreground">Créée le</span>
                <span className="font-medium">
                  {format(new Date(invitation.created_at), 'dd/MM/yyyy à HH:mm', { locale: fr })}
                </span>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </DashboardLayout>
  );
}
