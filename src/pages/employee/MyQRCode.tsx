import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { QrCode, Key, Loader2 } from 'lucide-react';
import { useInvitations } from '@/hooks/useInvitations';
import { QRCodeDisplay } from '@/components/ui/QRCodeDisplay';

export default function MyQRCodePage() {
  const { employeeData, isLoading } = useInvitations();

  // Generate QR code data for the employee
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
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold text-foreground">Mon QR Code</h1>
          <p className="text-muted-foreground">Votre code d'accès personnel</p>
        </div>

        {isLoading ? (
          <div className="flex items-center justify-center py-12">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
          </div>
        ) : employeeData ? (
          <div className="grid gap-6 md:grid-cols-2">
            <Card className="glass-card">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <QrCode className="h-5 w-5 text-primary" />
                  QR Code
                </CardTitle>
              </CardHeader>
              <CardContent className="flex items-center justify-center">
                <div className="qr-container p-6 bg-white rounded-2xl shadow-lg">
                  <QRCodeDisplay data={getEmployeeQRData()} size={192} />
                </div>
              </CardContent>
            </Card>

            <Card className="glass-card">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Key className="h-5 w-5 text-primary" />
                  Code alphanumérique
                </CardTitle>
              </CardHeader>
              <CardContent className="flex items-center justify-center">
                <div className="text-center space-y-4">
                  <div className="p-6 bg-primary/5 rounded-2xl border-2 border-primary/20">
                    <span className="font-mono text-4xl sm:text-5xl font-bold tracking-wider text-primary">
                      {employeeData.unique_code}
                    </span>
                  </div>
                  <p className="text-sm text-muted-foreground">
                    Présentez ce code au gardien pour accéder au site
                  </p>
                </div>
              </CardContent>
            </Card>
          </div>
        ) : (
          <div className="text-center py-12">
            <QrCode className="mx-auto h-12 w-12 text-muted-foreground/50" />
            <h3 className="mt-4 text-lg font-medium text-foreground">Aucun code trouvé</h3>
            <p className="text-muted-foreground">
              Vous n'êtes pas encore enregistré comme employé
            </p>
          </div>
        )}
      </div>
    </DashboardLayout>
  );
}
