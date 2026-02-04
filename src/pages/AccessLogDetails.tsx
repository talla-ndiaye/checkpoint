import { useParams, useNavigate } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { format } from 'date-fns';
import { fr } from 'date-fns/locale';
import { 
  ArrowLeft, Calendar, Clock, User, Building, Key, QrCode, 
  MapPin, CreditCard, ArrowUpRight, ArrowDownLeft, Globe 
} from 'lucide-react';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { QRCodeDisplay } from '@/components/ui/QRCodeDisplay';
import { supabase } from '@/integrations/supabase/client';

export default function AccessLogDetails() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();

  const { data: accessLog, isLoading } = useQuery({
    queryKey: ['access-log-details', id],
    queryFn: async () => {
      if (!id) return null;

      const { data, error } = await supabase
        .from('access_logs')
        .select(`
          *,
          site:sites(id, name, address),
          invitation:invitations(
            *,
            employee:employees(
              id,
              user_id,
              company:companies(id, name),
              profile:profiles!employees_user_id_fkey(first_name, last_name, email, phone)
            )
          ),
          walk_in_visitor:walk_in_visitors(*)
        `)
        .eq('id', id)
        .single();

      if (error) throw error;
      return data;
    },
    enabled: !!id,
  });

  // Get user profile if user_id is set (employee access)
  const { data: userProfile } = useQuery({
    queryKey: ['access-log-user-profile', accessLog?.user_id],
    queryFn: async () => {
      if (!accessLog?.user_id) return null;

      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', accessLog.user_id)
        .single();

      if (error) throw error;
      return data;
    },
    enabled: !!accessLog?.user_id,
  });

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

  if (!accessLog) {
    return (
      <DashboardLayout>
        <div className="text-center py-12">
          <h2 className="text-xl font-semibold">Accès non trouvé</h2>
          <Button onClick={() => navigate(-1)} className="mt-4">
            <ArrowLeft className="mr-2 h-4 w-4" />
            Retour
          </Button>
        </div>
      </DashboardLayout>
    );
  }

  const site = accessLog.site as any;
  const invitation = accessLog.invitation as any;
  const walkInVisitor = accessLog.walk_in_visitor as any;
  const employee = invitation?.employee;
  const employeeProfile = employee?.profile;
  const company = employee?.company;

  const isEntry = accessLog.action_type === 'entry';
  const isWalkIn = !!walkInVisitor;
  const isInvitation = !!invitation;
  const isEmployee = !!accessLog.user_id && !isInvitation && !isWalkIn;

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

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div className="flex items-center gap-4">
          <Button variant="ghost" size="icon" onClick={() => navigate(-1)}>
            <ArrowLeft className="h-5 w-5" />
          </Button>
          <div>
            <h1 className="text-2xl sm:text-3xl font-bold text-foreground">
              Détails de l'accès
            </h1>
            <p className="text-muted-foreground">
              {format(new Date(accessLog.timestamp), 'EEEE dd MMMM yyyy à HH:mm', { locale: fr })}
            </p>
          </div>
        </div>

        <div className="grid gap-6 md:grid-cols-2">
          {/* Access Information */}
          <Card className="glass-card">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                {isEntry ? (
                  <ArrowUpRight className="h-5 w-5 text-success" />
                ) : (
                  <ArrowDownLeft className="h-5 w-5 text-warning" />
                )}
                Informations de l'accès
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-muted-foreground">Type</span>
                <Badge className={isEntry ? 'bg-success/10 text-success' : 'bg-warning/10 text-warning'}>
                  {isEntry ? 'Entrée' : 'Sortie'}
                </Badge>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-muted-foreground">Date</span>
                <span className="font-medium">
                  {format(new Date(accessLog.timestamp), 'dd/MM/yyyy', { locale: fr })}
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-muted-foreground">Heure</span>
                <span className="font-medium">
                  {format(new Date(accessLog.timestamp), 'HH:mm:ss')}
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-muted-foreground">Type de visiteur</span>
                <Badge variant="outline">
                  {isWalkIn ? 'Visiteur spontané (CNI)' : isInvitation ? 'Invitation' : 'Employé'}
                </Badge>
              </div>
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
            </CardContent>
          </Card>

          {/* Walk-in Visitor Information (from ID card scan) */}
          {isWalkIn && (
            <Card className="glass-card md:col-span-2">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <CreditCard className="h-5 w-5 text-primary" />
                  Informations de la carte d'identité
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                  <div className="space-y-1">
                    <span className="text-sm text-muted-foreground">Prénom</span>
                    <p className="font-medium">{walkInVisitor.first_name}</p>
                  </div>
                  <div className="space-y-1">
                    <span className="text-sm text-muted-foreground">Nom</span>
                    <p className="font-medium">{walkInVisitor.last_name}</p>
                  </div>
                  <div className="space-y-1">
                    <span className="text-sm text-muted-foreground">N° Carte d'identité</span>
                    <p className="font-medium font-mono">{walkInVisitor.id_card_number}</p>
                  </div>
                  {walkInVisitor.birth_date && (
                    <div className="space-y-1">
                      <span className="text-sm text-muted-foreground">Date de naissance</span>
                      <p className="font-medium">
                        {format(new Date(walkInVisitor.birth_date), 'dd/MM/yyyy')}
                      </p>
                    </div>
                  )}
                  {walkInVisitor.gender && (
                    <div className="space-y-1">
                      <span className="text-sm text-muted-foreground">Genre</span>
                      <p className="font-medium">{walkInVisitor.gender === 'M' ? 'Masculin' : 'Féminin'}</p>
                    </div>
                  )}
                  {walkInVisitor.nationality && (
                    <div className="space-y-1">
                      <span className="text-sm text-muted-foreground">Nationalité</span>
                      <p className="font-medium">{walkInVisitor.nationality}</p>
                    </div>
                  )}
                  {walkInVisitor.address && (
                    <div className="space-y-1 sm:col-span-2">
                      <span className="text-sm text-muted-foreground">Adresse</span>
                      <p className="font-medium">{walkInVisitor.address}</p>
                    </div>
                  )}
                  {walkInVisitor.id_card_expiry && (
                    <div className="space-y-1">
                      <span className="text-sm text-muted-foreground">Expiration CNI</span>
                      <p className="font-medium">
                        {format(new Date(walkInVisitor.id_card_expiry), 'dd/MM/yyyy')}
                      </p>
                    </div>
                  )}
                  <div className="space-y-1">
                    <span className="text-sm text-muted-foreground">Enregistré le</span>
                    <p className="font-medium">
                      {format(new Date(walkInVisitor.created_at), 'dd/MM/yyyy à HH:mm', { locale: fr })}
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Invitation Information */}
          {isInvitation && (
            <>
              <Card className="glass-card">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <User className="h-5 w-5 text-primary" />
                    Informations du visiteur
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex items-center justify-between">
                    <span className="text-muted-foreground">Nom</span>
                    <span className="font-medium">{invitation.visitor_name}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-muted-foreground">Téléphone</span>
                    <span className="font-medium">{invitation.visitor_phone}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-muted-foreground">Date prévue</span>
                    <span className="font-medium">
                      {format(new Date(invitation.visit_date), 'dd/MM/yyyy', { locale: fr })}
                    </span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-muted-foreground">Heure prévue</span>
                    <span className="font-medium">{invitation.visit_time}</span>
                  </div>
                </CardContent>
              </Card>

              <Card className="glass-card">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <QrCode className="h-5 w-5 text-primary" />
                    Code d'accès
                  </CardTitle>
                </CardHeader>
                <CardContent className="flex flex-col items-center gap-4">
                  <div className="p-3 bg-white rounded-xl shadow-lg">
                    <QRCodeDisplay data={getInvitationQRData()} size={140} />
                  </div>
                  <div className="flex items-center gap-2 p-2 bg-primary/5 rounded-lg border border-primary/10">
                    <Key className="h-4 w-4 text-primary" />
                    <span className="font-mono text-lg font-bold tracking-wider text-primary">
                      {invitation.alpha_code}
                    </span>
                  </div>
                </CardContent>
              </Card>

              {/* Inviter Information */}
              {employeeProfile && (
                <Card className="glass-card md:col-span-2">
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Building className="h-5 w-5 text-primary" />
                      Informations de l'invitant
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
                      <div className="space-y-1">
                        <span className="text-sm text-muted-foreground">Nom</span>
                        <p className="font-medium">
                          {employeeProfile.first_name} {employeeProfile.last_name}
                        </p>
                      </div>
                      {employeeProfile.email && (
                        <div className="space-y-1">
                          <span className="text-sm text-muted-foreground">Email</span>
                          <p className="font-medium">{employeeProfile.email}</p>
                        </div>
                      )}
                      {employeeProfile.phone && (
                        <div className="space-y-1">
                          <span className="text-sm text-muted-foreground">Téléphone</span>
                          <p className="font-medium">{employeeProfile.phone}</p>
                        </div>
                      )}
                      {company && (
                        <div className="space-y-1">
                          <span className="text-sm text-muted-foreground">Entreprise</span>
                          <p className="font-medium">{company.name}</p>
                        </div>
                      )}
                      <div className="space-y-1">
                        <span className="text-sm text-muted-foreground">Invitation créée le</span>
                        <p className="font-medium">
                          {format(new Date(invitation.created_at), 'dd/MM/yyyy à HH:mm', { locale: fr })}
                        </p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              )}
            </>
          )}

          {/* Employee Access */}
          {isEmployee && userProfile && (
            <Card className="glass-card md:col-span-2">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <User className="h-5 w-5 text-primary" />
                  Informations de l'employé
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
                  <div className="space-y-1">
                    <span className="text-sm text-muted-foreground">Nom</span>
                    <p className="font-medium">
                      {userProfile.first_name} {userProfile.last_name}
                    </p>
                  </div>
                  {userProfile.email && (
                    <div className="space-y-1">
                      <span className="text-sm text-muted-foreground">Email</span>
                      <p className="font-medium">{userProfile.email}</p>
                    </div>
                  )}
                  {userProfile.phone && (
                    <div className="space-y-1">
                      <span className="text-sm text-muted-foreground">Téléphone</span>
                      <p className="font-medium">{userProfile.phone}</p>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </DashboardLayout>
  );
}
