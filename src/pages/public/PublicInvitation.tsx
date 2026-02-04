import { useParams } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { format } from 'date-fns';
import { fr } from 'date-fns/locale';
import { Calendar, Clock, Key, QrCode, CheckCircle, XCircle, AlertTriangle } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { QRCodeDisplay } from '@/components/ui/QRCodeDisplay';
import { supabase } from '@/integrations/supabase/client';

const statusConfig: Record<string, { label: string; icon: React.ReactNode; color: string }> = {
  pending: { 
    label: 'Valide', 
    icon: <CheckCircle className="h-5 w-5" />, 
    color: 'bg-success/10 text-success border-success/20' 
  },
  used: { 
    label: 'Déjà utilisée', 
    icon: <AlertTriangle className="h-5 w-5" />, 
    color: 'bg-warning/10 text-warning border-warning/20' 
  },
  expired: { 
    label: 'Expirée', 
    icon: <XCircle className="h-5 w-5" />, 
    color: 'bg-muted text-muted-foreground border-muted' 
  },
  cancelled: { 
    label: 'Annulée', 
    icon: <XCircle className="h-5 w-5" />, 
    color: 'bg-destructive/10 text-destructive border-destructive/20' 
  },
};

export default function PublicInvitation() {
  const { code } = useParams<{ code: string }>();

  const { data: invitation, isLoading, error } = useQuery({
    queryKey: ['public-invitation', code],
    queryFn: async () => {
      if (!code) return null;

      const { data, error } = await supabase
        .from('invitations')
        .select('id, visitor_name, visit_date, visit_time, alpha_code, status, qr_code')
        .eq('alpha_code', code.toUpperCase())
        .single();

      if (error) throw error;
      return data;
    },
    enabled: !!code,
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

  // Check if invitation is expired
  const isExpired = () => {
    if (!invitation) return false;
    const visitDateTime = new Date(`${invitation.visit_date}T${invitation.visit_time}`);
    const now = new Date();
    // Consider expired if more than 24 hours after scheduled time
    return now > new Date(visitDateTime.getTime() + 24 * 60 * 60 * 1000);
  };

  const getStatus = () => {
    if (!invitation) return statusConfig.pending;
    if (invitation.status === 'pending' && isExpired()) {
      return statusConfig.expired;
    }
    return statusConfig[invitation.status] || statusConfig.pending;
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-background via-background to-primary/5 flex items-center justify-center p-4">
        <div className="animate-pulse text-muted-foreground">Chargement...</div>
      </div>
    );
  }

  if (error || !invitation) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-background via-background to-primary/5 flex items-center justify-center p-4">
        <Card className="w-full max-w-md glass-card">
          <CardContent className="pt-6 text-center">
            <XCircle className="h-16 w-16 text-destructive mx-auto mb-4" />
            <h1 className="text-2xl font-bold text-foreground mb-2">Invitation non trouvée</h1>
            <p className="text-muted-foreground">
              Ce code d'invitation n'existe pas ou a été supprimé.
            </p>
          </CardContent>
        </Card>
      </div>
    );
  }

  const status = getStatus();

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-primary/5 flex items-center justify-center p-4">
      <Card className="w-full max-w-md glass-card overflow-hidden">
        <div className="bg-primary/10 p-6 text-center border-b border-primary/10">
          <h1 className="text-2xl font-bold text-foreground mb-1">Invitation de visite</h1>
          <p className="text-muted-foreground">pour {invitation.visitor_name}</p>
        </div>

        <CardContent className="p-6 space-y-6">
          {/* Status Badge */}
          <div className="flex justify-center">
            <Badge className={`${status.color} text-sm px-4 py-2 flex items-center gap-2`}>
              {status.icon}
              {status.label}
            </Badge>
          </div>

          {/* QR Code */}
          <div className="flex justify-center">
            <div className="p-4 bg-white rounded-2xl shadow-lg">
              <QRCodeDisplay data={getInvitationQRData()} size={200} />
            </div>
          </div>

          {/* Manual Code */}
          <div className="flex items-center justify-center gap-3 p-4 bg-primary/5 rounded-xl border border-primary/10">
            <Key className="h-6 w-6 text-primary" />
            <span className="font-mono text-2xl font-bold tracking-widest text-primary">
              {invitation.alpha_code}
            </span>
          </div>

          {/* Date and Time */}
          <div className="grid grid-cols-2 gap-4">
            <div className="flex items-center gap-3 p-3 bg-muted/50 rounded-lg">
              <Calendar className="h-5 w-5 text-muted-foreground" />
              <div>
                <p className="text-xs text-muted-foreground">Date</p>
                <p className="font-medium">
                  {format(new Date(invitation.visit_date), 'dd MMM yyyy', { locale: fr })}
                </p>
              </div>
            </div>
            <div className="flex items-center gap-3 p-3 bg-muted/50 rounded-lg">
              <Clock className="h-5 w-5 text-muted-foreground" />
              <div>
                <p className="text-xs text-muted-foreground">Heure</p>
                <p className="font-medium">{invitation.visit_time}</p>
              </div>
            </div>
          </div>

          {/* Instructions */}
          <div className="text-center text-sm text-muted-foreground space-y-2 pt-4 border-t">
            <p>Présentez ce QR code ou le code manuel au gardien à votre arrivée.</p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
