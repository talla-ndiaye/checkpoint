import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { QrCode, Key, Loader2, ArrowLeft, Download, Share2, ShieldCheck } from 'lucide-react';
import { useInvitations } from '@/hooks/useInvitations';
import { QRCodeDisplay } from '@/components/ui/QRCodeDisplay';
import { Button } from '@/components/ui/button';
import { useNavigate } from 'react-router-dom';

export default function MyQRCodePage() {
  const navigate = useNavigate();
  const { employeeData, isLoading } = useInvitations();

  const getEmployeeQRData = () => {
    if (!employeeData) return '';
    return JSON.stringify({
      type: 'employee',
      id: employeeData.id,
      code: employeeData.unique_code,
      timestamp: Date.now(),
    });
  };

  return (
    <DashboardLayout>
      <div className="max-w-4xl mx-auto space-y-8 animate-fade-in">
        {/* Header with back button */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Button
              variant="ghost"
              size="icon"
              onClick={() => navigate(-1)}
              className="rounded-full hover:bg-primary/10 text-primary"
            >
              <ArrowLeft className="h-6 w-6" />
            </Button>
            <div>
              <h1 className="text-3xl font-black tracking-tight gradient-text">Mon Badge Digital</h1>
              <p className="text-muted-foreground font-medium">Accès sécurisé au site</p>
            </div>
          </div>
        </div>

        {isLoading ? (
          <div className="flex flex-col items-center justify-center py-24 gap-4 glass-card rounded-3xl">
            <Loader2 className="h-12 w-12 animate-spin text-primary" />
            <p className="text-muted-foreground font-black animate-pulse uppercase tracking-widest">Génération du badge...</p>
          </div>
        ) : employeeData ? (
          <div className="grid gap-12 lg:grid-cols-2 items-start">
            {/* The Badge Component */}
            <div className="relative group animate-scale-in">
              {/* Decorative background glow */}
              <div className="absolute -inset-4 bg-gradient-to-tr from-primary/20 via-accent/20 to-success/20 rounded-[40px] blur-2xl opacity-50 group-hover:opacity-100 transition-opacity duration-700" />

              <div className="relative glass-card rounded-[32px] overflow-hidden border-white/20 shadow-2xl">
                {/* Badge Top Banner */}
                <div className="h-32 bg-gradient-to-br from-primary via-primary/80 to-accent p-8 flex items-end justify-between">
                  <div className="text-white">
                    <p className="text-[10px] font-black uppercase tracking-[0.2em] opacity-80 mb-1">Badge Employé</p>
                    <h2 className="text-2xl font-black leading-none">SECURE ACCESS</h2>
                  </div>
                  <ShieldCheck className="h-12 w-12 text-white/20 absolute right-8 top-8" />
                </div>

                {/* Badge Content */}
                <div className="p-8 space-y-8 flex flex-col items-center">
                  {/* Photo area or Initials */}
                  <div className="h-24 w-24 rounded-full bg-gradient-to-tr from-primary/10 to-accent/10 border-4 border-white dark:border-white/10 flex items-center justify-center shadow-xl animate-bounce-in">
                    <span className="text-3xl font-black gradient-text">
                      {employeeData.unique_code.substring(0, 2)}
                    </span>
                  </div>

                  <div className="text-center">
                    <p className="text-[10px] font-black uppercase tracking-[0.3em] text-muted-foreground mb-1">Employé Identifié</p>
                    <p className="text-2xl font-black tracking-tight uppercase">
                      Codename: {employeeData.unique_code}
                    </p>
                  </div>

                  {/* QR Container with focus styling */}
                  <div className="relative p-3 bg-white rounded-3xl shadow-inner-lg">
                    <QRCodeDisplay data={getEmployeeQRData()} size={200} />
                    <div className="absolute -inset-2 border-2 border-primary/20 rounded-[36px] animate-pulse-glow" />
                  </div>

                  <div className="flex gap-4 w-full">
                    <Button className="flex-1 h-12 rounded-xl gap-2 font-black shadow-glow">
                      <Download className="h-4 w-4" /> Enregistrer
                    </Button>
                    <Button variant="outline" className="flex-1 h-12 rounded-xl gap-2 font-black border-primary/20 hover:bg-primary/5">
                      <Share2 className="h-4 w-4" /> Partager
                    </Button>
                  </div>
                </div>

                {/* Bottom decorative bar */}
                <div className="h-2 bg-gradient-to-r from-primary via-accent to-success" />
              </div>
            </div>

            {/* Information Card */}
            <div className="space-y-6 animate-slide-up" style={{ animationDelay: '200ms' }}>
              <div className="glass-card p-8 rounded-3xl space-y-6">
                <div className="flex items-center gap-4 mb-2">
                  <div className="p-3 rounded-2xl bg-accent/10">
                    <Key className="h-6 w-6 text-accent" />
                  </div>
                  <h3 className="text-xl font-black tracking-tight">Instructions d'accès</h3>
                </div>

                <div className="space-y-4">
                  <div className="p-4 rounded-2xl bg-white/5 border border-white/10">
                    <h4 className="font-black text-xs uppercase tracking-widest text-primary mb-2">Code de Secours</h4>
                    <p className="font-mono text-3xl font-black tracking-[0.2em] select-all cursor-copy hover:text-primary transition-colors">
                      {employeeData.unique_code}
                    </p>
                  </div>

                  <ul className="space-y-3">
                    {[
                      "Présentez le QR Code devant le lecteur à l'entrée.",
                      "Si le lecteur échoue, donnez votre code alphanumérique au gardien.",
                      "Ce badge est personnel et strictement confidentiel.",
                      "L'accès est journalisé en temps réel par la centrale."
                    ].map((step, i) => (
                      <li key={i} className="flex gap-3 text-sm text-muted-foreground leading-relaxed">
                        <div className="h-5 w-5 rounded-full bg-primary/20 flex items-center justify-center flex-shrink-0 mt-0.5 text-[10px] font-black text-primary">
                          {i + 1}
                        </div>
                        {step}
                      </li>
                    ))}
                  </ul>
                </div>

                <div className="pt-4">
                  <div className="p-4 rounded-2xl bg-success/5 border border-success/20 flex items-center gap-4">
                    <div className="h-10 w-10 rounded-xl bg-success/20 flex items-center justify-center">
                      <ShieldCheck className="h-6 w-6 text-success" />
                    </div>
                    <div>
                      <p className="text-xs font-black uppercase tracking-widest text-success">Statut du Badge</p>
                      <p className="font-bold text-sm">Vérifié & Actif</p>
                    </div>
                  </div>
                </div>
              </div>

              <p className="text-center text-xs text-muted-foreground/60 italic uppercase tracking-tighter">
                SecureAccess Technology • Version 2.0 • Build 2026.02
              </p>
            </div>
          </div>
        ) : (
          <div className="text-center py-20 glass-card rounded-3xl max-w-xl mx-auto border-dashed">
            <QrCode className="mx-auto h-16 w-16 text-muted-foreground/30 animate-pulse" />
            <h3 className="mt-6 text-2xl font-black tracking-tight uppercase">Accès restreint</h3>
            <p className="text-muted-foreground mt-2 italic px-8">
              Vous n'êtes pas encore enregistré comme employé dans le système. Veuillez contacter votre administrateur de site.
            </p>
            <Button onClick={() => navigate('/dashboard')} className="mt-8 h-12 px-8 rounded-xl font-black">
              Retour au Dashboard
            </Button>
          </div>
        )}
      </div>
    </DashboardLayout>
  );
}
