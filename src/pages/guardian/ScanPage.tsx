import { useState, useCallback } from 'react';
import { Scanner, IDetectedBarcode } from '@yudiel/react-qr-scanner';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
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
  CreditCard,
} from 'lucide-react';
import { useQRScanner } from '@/hooks/useQRScanner';
import { IDCardScanPanel } from '@/components/guardian/IDCardScanPanel';
import { format } from 'date-fns';
import { fr } from 'date-fns/locale';

export default function ScanPage() {
  const { lastScan, setLastScan, validateCode, recordAccess } = useQRScanner();
  const [manualCode, setManualCode] = useState('');
  const [inputMode, setInputMode] = useState<'camera' | 'manual'>('camera');
  const [scanType, setScanType] = useState<'qr' | 'id'>('qr');
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
      <div className="max-w-2xl mx-auto space-y-6">
        {/* Header */}
        <div className="text-center">
          <h1 className="text-2xl font-bold text-foreground flex items-center justify-center gap-2">
            <QrCode className="h-7 w-7 text-primary" />
            Scanner d'accès
          </h1>
          <p className="text-muted-foreground mt-1">
            Scannez un QR code, une carte d'identité ou entrez un code manuellement
          </p>
        </div>

        {/* Scan Type Tabs */}
        <Tabs value={scanType} onValueChange={(v) => setScanType(v as 'qr' | 'id')} className="w-full">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="qr" className="gap-2">
              <QrCode className="h-4 w-4" />
              QR Code / Code
            </TabsTrigger>
            <TabsTrigger value="id" className="gap-2">
              <CreditCard className="h-4 w-4" />
              Carte d'identité
            </TabsTrigger>
          </TabsList>

          <TabsContent value="qr" className="space-y-6 mt-4">
            {!lastScan ? (
              <>
                {/* Mode Toggle */}
                <div className="flex justify-center gap-2">
                  <Button
                    variant={inputMode === 'camera' ? 'default' : 'outline'}
                    onClick={() => setInputMode('camera')}
                    className="gap-2"
                  >
                    <Camera className="h-4 w-4" />
                    Caméra
                  </Button>
                  <Button
                    variant={inputMode === 'manual' ? 'default' : 'outline'}
                    onClick={() => setInputMode('manual')}
                    className="gap-2"
                  >
                    <Keyboard className="h-4 w-4" />
                    Manuel
                  </Button>
                </div>

                {inputMode === 'camera' ? (
                  <Card>
                    <CardContent className="p-0 overflow-hidden rounded-lg">
                      <div className="aspect-square max-h-[400px]">
                        <Scanner
                          onScan={handleScan}
                          formats={['qr_code']}
                          allowMultiple={false}
                          scanDelay={500}
                          components={{
                            torch: true,
                          }}
                          styles={{
                            container: { height: '100%' },
                            video: { objectFit: 'cover' }
                          }}
                        />
                      </div>
                    </CardContent>
                  </Card>
                ) : (
                  <Card>
                    <CardHeader>
                      <CardTitle className="text-lg">Entrer le code manuellement</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <form onSubmit={handleManualSubmit} className="space-y-4">
                        <div className="space-y-2">
                          <Label htmlFor="code">Code alphanumérique</Label>
                          <Input
                            id="code"
                            value={manualCode}
                            onChange={(e) => setManualCode(e.target.value.toUpperCase())}
                            placeholder="ABC123"
                            className="text-center text-2xl tracking-widest font-mono"
                            maxLength={6}
                          />
                        </div>
                        <Button
                          type="submit"
                          className="w-full"
                          disabled={!manualCode.trim() || processing}
                        >
                          {processing ? 'Vérification...' : 'Valider'}
                        </Button>
                      </form>
                    </CardContent>
                  </Card>
                )}
              </>
            ) : (
              <>
                {/* Scan Result */}
                <Card className={`border-2 ${recorded ? 'border-green-500 bg-green-50 dark:bg-green-950/20' : 'border-primary'}`}>
                  <CardContent className="p-6">
                    <div className="text-center space-y-4">
                      {recorded ? (
                        <div className="flex items-center justify-center gap-2 text-green-600">
                          <CheckCircle className="h-8 w-8" />
                          <span className="text-xl font-semibold">Accès enregistré</span>
                        </div>
                      ) : (
                        <div className={`inline-flex items-center gap-2 px-3 py-1 rounded-full text-sm font-medium ${
                          lastScan.type === 'employee' 
                            ? 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-300'
                            : 'bg-purple-100 text-purple-800 dark:bg-purple-900/30 dark:text-purple-300'
                        }`}>
                          {lastScan.type === 'employee' ? 'Employé' : 'Visiteur'}
                        </div>
                      )}

                      <div className="space-y-3">
                        <div className="flex items-center justify-center gap-2">
                          <User className="h-5 w-5 text-muted-foreground" />
                          <span className="text-xl font-semibold">{lastScan.name}</span>
                        </div>

                        {lastScan.companyName && (
                          <div className="flex items-center justify-center gap-2 text-muted-foreground">
                            <Building2 className="h-4 w-4" />
                            <span>{lastScan.companyName}</span>
                          </div>
                        )}

                        {lastScan.visitorInfo && (
                          <div className="space-y-2 text-muted-foreground">
                            <div className="flex items-center justify-center gap-2">
                              <Calendar className="h-4 w-4" />
                              <span>{format(new Date(lastScan.visitorInfo.visitDate), 'dd MMMM yyyy', { locale: fr })}</span>
                            </div>
                            <div className="flex items-center justify-center gap-2">
                              <Clock className="h-4 w-4" />
                              <span>{lastScan.visitorInfo.visitTime}</span>
                            </div>
                            <div className="flex items-center justify-center gap-2">
                              <User className="h-4 w-4" />
                              <span>Hôte: {lastScan.visitorInfo.hostName}</span>
                            </div>
                          </div>
                        )}

                        <div className="pt-2">
                          <span className="font-mono text-lg bg-muted px-3 py-1 rounded">
                            {lastScan.code}
                          </span>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                {/* Action Buttons */}
                {!recorded ? (
                  <div className="grid grid-cols-2 gap-4">
                    <Button
                      size="lg"
                      className="h-20 text-lg gap-3 bg-green-600 hover:bg-green-700"
                      onClick={() => handleAccess('entry')}
                      disabled={processing}
                    >
                      <LogIn className="h-6 w-6" />
                      Entrée
                    </Button>
                    <Button
                      size="lg"
                      className="h-20 text-lg gap-3 bg-orange-600 hover:bg-orange-700"
                      onClick={() => handleAccess('exit')}
                      disabled={processing}
                    >
                      <LogOut className="h-6 w-6" />
                      Sortie
                    </Button>
                  </div>
                ) : (
                  <Button
                    size="lg"
                    className="w-full h-16 text-lg"
                    onClick={resetScan}
                  >
                    Nouveau scan
                  </Button>
                )}
              </>
            )}
          </TabsContent>

          <TabsContent value="id" className="mt-4">
            <IDCardScanPanel onComplete={() => setScanType('qr')} />
          </TabsContent>
        </Tabs>
      </div>
    </DashboardLayout>
  );
}
