import { useState, useCallback } from 'react';
import { Scanner, IDetectedBarcode } from '@yudiel/react-qr-scanner';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  QrCode,
  LogIn,
  LogOut,
  User,
  Building2,
  Calendar,
  Clock,
  CheckCircle,
  Keyboard,
  Camera,
  AlertTriangle,
  ScanLine,
} from 'lucide-react';

import { useQRScanner } from '@/hooks/useQRScanner';
import { useAuth } from '@/hooks/useAuth';
import { useNavigate } from 'react-router-dom';
import { useEffect } from 'react';
import { format } from 'date-fns';
import { fr } from 'date-fns/locale';

export default function ScanPage() {
  const navigate = useNavigate();
  const { lastScan, setLastScan, validateCode, recordAccess } = useQRScanner();
  const [manualCode, setManualCode] = useState('');
  const [inputMode, setInputMode] = useState<'camera' | 'manual'>('camera');
  const [processing, setProcessing] = useState(false);
  const [recorded, setRecorded] = useState(false);

  const handleScan = useCallback(async (result: IDetectedBarcode[]) => {
    if (result.length > 0 && !processing && !recorded) {
      const code = result[0].rawValue;
      setProcessing(true);
      const scanResult = await validateCode(code);
      if (scanResult) {
        setLastScan(scanResult);
      }
      setProcessing(false);
    }
  }, [validateCode, processing, recorded]);

  const handleManualSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!manualCode.trim() || processing) return;
    setProcessing(true);
    const scanResult = await validateCode(manualCode.toUpperCase());
    if (scanResult) {
      setLastScan(scanResult);
    }
    setProcessing(false);
  };

  const handleAccess = async (type: 'entry' | 'exit') => {
    if (!lastScan) return;
    setProcessing(true);
    const success = await recordAccess(lastScan, type);
    if (success) {
      setRecorded(true);
    }
    setProcessing(false);
  };

  const resetScan = () => {
    setLastScan(null);
    setManualCode('');
    setRecorded(false);
  };

  return (
    <DashboardLayout>
      <div className="max-w-xl mx-auto space-y-8">
        <div className="text-center space-y-2">
          <div className="inline-flex items-center justify-center p-3 rounded-2xl bg-primary/10 mb-2">
            <QrCode className="h-8 w-8 text-primary" />
          </div>
          <h1 className="text-3xl font-bold tracking-tight text-foreground">
            Scanner QR Code
          </h1>
          <p className="text-muted-foreground">
            Scannez un code d'accès ou saisissez-le manuellement
          </p>
        </div>

        {!lastScan ? (
          <div className="space-y-6 animate-fade-in">
            {/* Mode Toggle - Animated sliding indicator */}
            <div className="mode-toggle sticky top-0 z-10 mx-4 md:mx-0">
              <div
                className="mode-toggle-indicator w-1/2"
                style={{ left: inputMode === 'camera' ? '6px' : 'calc(50% - 0px)' }}
              />
              <button
                onClick={() => setInputMode('camera')}
                className={`mode-toggle-btn ${inputMode === 'camera' ? 'text-primary-foreground' : 'text-muted-foreground hover:text-foreground'}`}
              >
                <Camera className="h-4 w-4" />
                Caméra
              </button>
              <button
                onClick={() => setInputMode('manual')}
                className={`mode-toggle-btn ${inputMode === 'manual' ? 'text-primary-foreground' : 'text-muted-foreground hover:text-foreground'}`}
              >
                <Keyboard className="h-4 w-4" />
                Manuel
              </button>
            </div>

            {inputMode === 'camera' ? (
              <div className="relative rounded-3xl overflow-hidden shadow-2xl ring-4 ring-primary/20 bg-black aspect-square max-w-sm mx-auto animate-pulse-glow">
                <Scanner
                  onScan={handleScan}
                  formats={['qr_code']}
                  allowMultiple={false}
                  scanDelay={500}
                  components={{ torch: true }}
                  styles={{
                    container: { height: '100%' },
                    video: { objectFit: 'cover' }
                  }}
                />

                {/* Scanner Overlay */}
                <div className="absolute inset-0 pointer-events-none">
                  <div className="absolute inset-0 border-[30px] border-black/40 mask-scan" />
                  <div className="absolute inset-8 border-2 border-white/30 rounded-2xl">
                    {/* Corners */}
                    <div className="absolute top-0 left-0 w-8 h-8 border-t-4 border-l-4 border-primary rounded-tl-xl" />
                    <div className="absolute top-0 right-0 w-8 h-8 border-t-4 border-r-4 border-primary rounded-tr-xl" />
                    <div className="absolute bottom-0 left-0 w-8 h-8 border-b-4 border-l-4 border-primary rounded-bl-xl" />
                    <div className="absolute bottom-0 right-0 w-8 h-8 border-b-4 border-r-4 border-primary rounded-br-xl" />

                    {/* Scanning Line */}
                    <div className="absolute top-0 left-0 right-0 h-0.5 bg-primary shadow-[0_0_20px_hsl(var(--primary))] animate-scan-beam" />
                  </div>
                  <div className="absolute bottom-8 left-0 right-0 text-center">
                    <span className="bg-black/80 text-white/90 text-sm px-4 py-2 rounded-full">
                      Placez le QR Code dans le cadre
                    </span>
                  </div>
                </div>
              </div>
            ) : (
              <div className="glass-card rounded-3xl p-8 max-w-sm mx-auto shadow-xl">
                <form onSubmit={handleManualSubmit} className="space-y-6">
                  <div className="space-y-3">
                    <Label htmlFor="code" className="text-base font-medium">Code d'accès</Label>
                    <div className="relative">
                      <Input
                        id="code"
                        value={manualCode}
                        onChange={(e) => setManualCode(e.target.value.toUpperCase())}
                        placeholder="ABC-123"
                        className="text-center text-3xl tracking-[0.2em] font-mono h-16 uppercase bg-background border-2 focus:border-primary/50"
                        maxLength={8}
                      />
                      <Keyboard className="absolute right-4 top-1/2 -translate-y-1/2 text-muted-foreground/50 h-5 w-5" />
                    </div>
                  </div>
                  <Button
                    type="submit"
                    className="w-full h-12 text-base font-semibold shadow-lg hover:shadow-primary/20 transition-all"
                    disabled={!manualCode.trim() || processing}
                  >
                    {processing ? 'Vérification...' : 'Valider le code'}
                  </Button>
                </form>
              </div>
            )}
          </div>
        ) : (
          <div className="animate-bounce-in max-w-md mx-auto">
            {/* Scan Result Card */}
            <div className={`glass-card rounded-3xl overflow-hidden shadow-2xl border-2 transition-colors duration-500 ${recorded
              ? 'border-success/50 bg-success/5'
              : lastScan.exitAlreadyValidated
                ? 'border-destructive/50 bg-destructive/5'
                : 'border-primary/50'
              }`}>
              {/* Header Status */}
              <div className={`p-6 text-center text-white ${recorded
                ? 'bg-success'
                : lastScan.exitAlreadyValidated
                  ? 'bg-destructive'
                  : 'bg-primary'
                }`}>
                {lastScan.exitAlreadyValidated ? (
                  <div className="flex flex-col items-center gap-2">
                    <div className="p-3 bg-black/10 rounded-full">
                      <AlertTriangle className="h-8 w-8" />
                    </div>
                    <h2 className="text-xl font-bold">Reçu déjà utilisé</h2>
                  </div>
                ) : recorded ? (
                  <div className="flex flex-col items-center gap-2">
                    <div className="p-3 bg-black/10 rounded-full">
                      <CheckCircle className="h-8 w-8" />
                    </div>
                    <h2 className="text-xl font-bold">Accès autorisé</h2>
                  </div>
                ) : (
                  <div className="flex flex-col items-center gap-2">
                    <div className="p-3 bg-black/10 rounded-full">
                      <ScanLine className="h-8 w-8" />
                    </div>
                    <h2 className="text-xl font-bold flex items-center gap-2">
                      {lastScan.type === 'employee' ? 'Employé' : lastScan.isWalkInExit ? 'Visiteur (Reçu)' : 'Visiteur'}
                    </h2>
                  </div>
                )}
              </div>

              <div className="p-8 space-y-6">
                <div className="text-center space-y-4">
                  <div className="space-y-1">
                    <p className="text-sm text-muted-foreground uppercase tracking-wider font-semibold">Identité</p>
                    <h3 className="text-2xl font-bold text-foreground">{lastScan.name}</h3>
                  </div>

                  {lastScan.companyName && (
                    <div className="flex items-center justify-center gap-2 text-muted-foreground bg-muted/50 py-2 rounded-lg">
                      <Building2 className="h-4 w-4" />
                      <span className="font-medium">{lastScan.companyName}</span>
                    </div>
                  )}

                  {lastScan.visitorInfo && (
                    <div className="grid grid-cols-2 gap-3 text-sm">
                      <div className="bg-muted/30 p-3 rounded-xl flex flex-col items-center gap-1">
                        <Calendar className="h-4 w-4 text-primary" />
                        <span className="font-medium">{format(new Date(lastScan.visitorInfo.visitDate), 'dd MMM', { locale: fr })}</span>
                      </div>
                      <div className="bg-muted/30 p-3 rounded-xl flex flex-col items-center gap-1">
                        <Clock className="h-4 w-4 text-primary" />
                        <span className="font-medium">{lastScan.visitorInfo.visitTime}</span>
                      </div>
                      <div className="col-span-2 bg-muted/30 p-3 rounded-xl flex items-center justify-center gap-2">
                        <User className="h-4 w-4 text-primary" />
                        <span className="text-muted-foreground">Hôte:</span>
                        <span className="font-medium">{lastScan.visitorInfo.hostName}</span>
                      </div>
                    </div>
                  )}

                  {lastScan.isWalkInExit && !lastScan.visitorInfo && (
                    <div className="text-sm text-muted-foreground italic">
                      Enregistré par carte d'identité
                    </div>
                  )}

                  <div className="pt-2">
                    <div className="inline-block px-4 py-1.5 rounded-lg bg-black/5 font-mono text-lg tracking-widest font-bold">
                      {lastScan.code}
                    </div>
                  </div>
                </div>

                {/* Actions */}
                <div className="pt-2">
                  {lastScan.exitAlreadyValidated ? (
                    <div className="space-y-4">
                      <p className="text-sm text-destructive text-center font-medium bg-destructive/10 p-3 rounded-lg">
                        Ce reçu ne peut être utilisé qu'une seule fois.
                      </p>
                      <Button size="lg" className="w-full h-14 text-base rounded-xl" onClick={resetScan}>
                        Scanner à nouveau
                      </Button>
                    </div>
                  ) : !recorded ? (
                    lastScan.isWalkInExit ? (
                      <Button
                        size="lg"
                        className="w-full h-16 text-lg gap-3 bg-gradient-to-r from-warning to-orange-500 hover:shadow-lg hover:shadow-warning/20 transition-all rounded-xl"
                        onClick={() => handleAccess('exit')}
                        disabled={processing}
                      >
                        <LogOut className="h-6 w-6" />
                        Valider la sortie
                      </Button>
                    ) : (
                      <div className="grid grid-cols-2 gap-4">
                        <Button
                          size="lg"
                          className="group h-24 text-lg flex-col gap-2 bg-success hover:bg-success/90 transition-all duration-300 rounded-2xl"
                          onClick={() => handleAccess('entry')}
                          disabled={processing}
                        >
                          <LogIn className="h-7 w-7 group-hover:-translate-y-0.5 transition-transform" />
                          <span className="font-bold">Entrée</span>
                        </Button>
                        <Button
                          size="lg"
                          className="group h-24 text-lg flex-col gap-2 bg-warning hover:bg-warning/90 transition-all duration-300 rounded-2xl"
                          onClick={() => handleAccess('exit')}
                          disabled={processing}
                        >
                          <LogOut className="h-7 w-7 group-hover:-translate-y-0.5 transition-transform" />
                          <span className="font-bold">Sortie</span>
                        </Button>
                      </div>
                    )
                  ) : (
                    <Button size="lg" variant="outline" className="w-full h-14 text-base rounded-xl border-dashed" onClick={resetScan}>
                      Scanner le suivant
                    </Button>
                  )}
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </DashboardLayout>
  );
}
