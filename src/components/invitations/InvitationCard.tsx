import { useNavigate } from 'react-router-dom';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { MessageCircle, X, Calendar, Clock, User, Key, QrCode, ExternalLink } from 'lucide-react';
import { QRCodeDisplay } from '@/components/ui/QRCodeDisplay';
import type { Invitation } from '@/hooks/useInvitations';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';

interface InvitationCardProps {
  invitation: Invitation;
  onShare: (invitation: Invitation) => void;
  onCancel: (id: string) => void;
}

const statusConfig: Record<string, { label: string; variant: 'default' | 'secondary' | 'destructive' | 'outline' }> = {
  pending: { label: 'En attente', variant: 'default' },
  used: { label: 'Utilisée', variant: 'secondary' },
  expired: { label: 'Expirée', variant: 'outline' },
  cancelled: { label: 'Annulée', variant: 'destructive' },
};

export function InvitationCard({ invitation, onShare, onCancel }: InvitationCardProps) {
  const navigate = useNavigate();
  const status = statusConfig[invitation.status] || statusConfig.pending;
  const isPending = invitation.status === 'pending';

  const getInvitationQRData = () => {
    return JSON.stringify({
      type: 'invitation',
      id: invitation.id,
      code: invitation.alpha_code,
      visitor: invitation.visitor_name,
      date: invitation.visit_date,
      time: invitation.visit_time,
    });
  };

  const handleCardClick = () => {
    navigate(`/invitation/${invitation.id}`);
  };

  return (
    <Card 
      className="glass-card overflow-hidden cursor-pointer hover:border-primary/30 transition-colors"
      onClick={handleCardClick}
    >
      <CardContent className="p-4 sm:p-6">
        <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4">
          <div className="space-y-3 flex-1">
            <div className="flex items-center gap-2 flex-wrap">
              <User className="h-4 w-4 text-muted-foreground" />
              <span className="font-semibold text-foreground">{invitation.visitor_name}</span>
              <Badge variant={status.variant}>{status.label}</Badge>
              <Button 
                variant="ghost" 
                size="icon" 
                className="h-6 w-6 ml-auto"
                onClick={(e) => {
                  e.stopPropagation();
                  navigate(`/invitation/${invitation.id}`);
                }}
              >
                <ExternalLink className="h-4 w-4" />
              </Button>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-sm text-muted-foreground">
              <div className="flex items-center gap-2">
                <Calendar className="h-4 w-4" />
                <span>{new Date(invitation.visit_date).toLocaleDateString('fr-FR')}</span>
              </div>
              <div className="flex items-center gap-2">
                <Clock className="h-4 w-4" />
                <span>{invitation.visit_time}</span>
              </div>
            </div>

            <div className="flex items-center gap-3">
              <div className="flex items-center gap-2 p-3 bg-primary/5 rounded-lg border border-primary/10 flex-1">
                <Key className="h-5 w-5 text-primary" />
                <span className="font-mono text-lg font-bold tracking-wider text-primary">
                  {invitation.alpha_code}
                </span>
              </div>
              
              <Dialog>
                <DialogTrigger asChild>
                  <Button 
                    variant="outline" 
                    size="icon" 
                    className="shrink-0"
                    onClick={(e) => e.stopPropagation()}
                  >
                    <QrCode className="h-5 w-5" />
                  </Button>
                </DialogTrigger>
                <DialogContent className="sm:max-w-md">
                  <DialogHeader>
                    <DialogTitle>QR Code - {invitation.visitor_name}</DialogTitle>
                  </DialogHeader>
                  <div className="flex flex-col items-center gap-4 py-4">
                    <div className="p-4 bg-white rounded-2xl shadow-lg">
                      <QRCodeDisplay data={getInvitationQRData()} size={250} />
                    </div>
                    <div className="text-center space-y-1">
                      <p className="font-mono text-2xl font-bold text-primary">{invitation.alpha_code}</p>
                      <p className="text-sm text-muted-foreground">
                        {new Date(invitation.visit_date).toLocaleDateString('fr-FR')} à {invitation.visit_time}
                      </p>
                    </div>
                  </div>
                </DialogContent>
              </Dialog>
            </div>
          </div>

          {isPending && (
            <div className="flex sm:flex-col gap-2" onClick={(e) => e.stopPropagation()}>
              <Button
                onClick={() => onShare(invitation)}
                className="flex-1 sm:flex-none gap-2"
                variant="default"
              >
                <MessageCircle className="h-4 w-4" />
                <span className="sm:hidden lg:inline">WhatsApp</span>
              </Button>
              <Button
                onClick={() => onCancel(invitation.id)}
                variant="outline"
                className="flex-1 sm:flex-none gap-2 text-destructive hover:text-destructive"
              >
                <X className="h-4 w-4" />
                <span className="sm:hidden lg:inline">Annuler</span>
              </Button>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
