import { useState, useRef, useEffect } from 'react';
import { Camera, Upload, User, CreditCard, Calendar, MapPin, LogIn, CheckCircle, RotateCcw, Printer, AlertCircle } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useIDCardScanner, IDCardData, WalkInVisitorResult, parseBarcodeData } from '@/hooks/useIDCardScanner';
import { QRCodeDisplay } from '@/components/ui/QRCodeDisplay';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { format } from 'date-fns';
import { fr } from 'date-fns/locale';
import { toast } from 'sonner';
import { Html5QrcodeScanner, Html5QrcodeSupportedFormats } from 'html5-qrcode';

interface IDCardScanPanelProps {
  onComplete?: () => void;
}

export function IDCardScanPanel({ onComplete }: IDCardScanPanelProps) {
  const {
    extractedData,
    processing,
    extractIDCardData,
    registerWalkInVisitor,
    reset
  } = useIDCardScanner();

  const [frontImage, setFrontImage] = useState<string | null>(null);
  const [backImage, setBackImage] = useState<string | null>(null);
  const [scanStep, setScanStep] = useState<'front' | 'back' | 'captured'>('front');
  const [registered, setRegistered] = useState(false);
  const [registeredVisitor, setRegisteredVisitor] = useState<WalkInVisitorResult | null>(null);
  const [editableData, setEditableData] = useState<IDCardData | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [cameraActive, setCameraActive] = useState(false);
  const [cameraError, setCameraError] = useState<string | null>(null);
  const [cameraPermission, setCameraPermission] = useState<'prompt' | 'granted' | 'denied' | 'unknown'>('unknown');

  // Scanner logic
  useEffect(() => {
    if (!cameraActive || scanStep === 'captured') return;

    const scannerId = "reader";
    const scanner = new Html5QrcodeScanner(
      scannerId,
      {
        fps: 10,
        qrbox: { width: 300, height: 200 },
        formatsToSupport: [
          Html5QrcodeSupportedFormats.PDF_417,
          Html5QrcodeSupportedFormats.QR_CODE
        ]
      },
      false
    );

    const onScanSuccess = (decodedText: string) => {
      console.log('Barcode/QR detected:', decodedText);
      const parsed = parseBarcodeData(decodedText);

      if (parsed && parsed.idCardNumber) {
        scanner.clear().catch(e => console.warn(e));
        setEditableData(parsed as IDCardData);
        setScanStep('captured');
        setCameraActive(false);
        toast.success('Carte d\'identité détectée et lue par Code-barres !');
      } else {
        console.log('Detected text but not recognized as ID barcode');
      }
    };

    scanner.render(onScanSuccess, (err) => {
      // Ignore scan errors
    });

    return () => {
      scanner.clear().catch(e => console.warn('Scanner cleanup error:', e));
    };
  }, [cameraActive, scanStep]);

  // Check camera permission on mount
  useEffect(() => {
    const checkCameraPermission = async () => {
      try {
        if (navigator.permissions) {
          const result = await navigator.permissions.query({ name: 'camera' as PermissionName });
          setCameraPermission(result.state as 'prompt' | 'granted' | 'denied');
          result.onchange = () => {
            setCameraPermission(result.state as 'prompt' | 'granted' | 'denied');
          };
        }
      } catch (error) {
        console.log('Permission API not supported');
      }
    };
    checkCameraPermission();
  }, []);

  const startCamera = async () => {
    setCameraError(null);
    setCameraActive(true);
  };

  const stopCamera = () => {
    setCameraActive(false);
  };

  const processImages = async (front: string, back: string) => {
    const result = await extractIDCardData(front, back);
    if (result) {
      setEditableData(result);
    }
  };

  const handleFieldChange = (field: keyof IDCardData, value: string) => {
    if (editableData) {
      setEditableData({ ...editableData, [field]: value });
    }
  };

  const handleAccess = async () => {
    if (!editableData) return;
    const result = await registerWalkInVisitor(editableData, 'entry');
    if (result) {
      setRegistered(true);
      setRegisteredVisitor(result);
    }
  };

  const handleReset = () => {
    reset();
    setFrontImage(null);
    setBackImage(null);
    setScanStep('front');
    setEditableData(null);
    setRegistered(false);
    setRegisteredVisitor(null);
    setCameraError(null);
    setCameraActive(false);
    onComplete?.();
  };

  const printReceipt = () => {
    if (!registeredVisitor || !editableData) return;

    const printWindow = window.open('', '_blank');
    if (!printWindow) {
      toast.error('Impossible d\'ouvrir la fenêtre d\'impression.');
      return;
    }

    const receiptHtml = `
      <!DOCTYPE html>
      <html>
      <head>
        <title>Reçu d'accès - ${editableData.firstName} ${editableData.lastName}</title>
        <meta charset="UTF-8">
        <style>
          * { margin: 0; padding: 0; box-sizing: border-box; }
          body { font-family: Arial, sans-serif; padding: 20px; max-width: 400px; margin: 0 auto; }
          .receipt { border: 2px solid #333; padding: 20px; border-radius: 8px; }
          .header { text-align: center; margin-bottom: 20px; border-bottom: 2px dashed #333; padding-bottom: 15px; }
          .header h1 { font-size: 18px; margin-bottom: 5px; }
          .qr-container { text-align: center; margin: 20px 0; }
          .qr-container img { max-width: 180px; height: auto; }
          .code-manual { text-align: center; font-size: 28px; font-weight: bold; letter-spacing: 4px; margin: 15px 0; padding: 10px; background: #f0f0f0; border-radius: 4px; }
          .info { margin: 15px 0; }
          .info-row { display: flex; justify-content: space-between; padding: 8px 0; border-bottom: 1px solid #eee; }
          .info-label { color: #666; font-size: 12px; }
          .info-value { font-weight: 500; font-size: 14px; }
          .footer { text-align: center; margin-top: 20px; padding-top: 15px; border-top: 2px dashed #333; }
          .important { background: #fff3cd; padding: 10px; border-radius: 4px; margin-top: 15px; font-size: 11px; text-align: center; }
          @media print { body { padding: 0; } .receipt { border: none; } }
        </style>
      </head>
      <body>
        <div class="receipt">
          <div class="header"><h1>REÇU D'ACCÈS VISITEUR</h1><p>Conservez ce reçu pour la sortie</p></div>
          <div class="qr-container"><img src="${registeredVisitor.qrCodeDataUrl}" alt="QR Code" /></div>
          <div class="code-manual">${registeredVisitor.receiptCode}</div>
          <div class="info">
            <div class="info-row"><span class="info-label">Nom</span><span class="info-value">${editableData.lastName}</span></div>
            <div class="info-row"><span class="info-label">Prénom</span><span class="info-value">${editableData.firstName}</span></div>
            <div class="info-row"><span class="info-label">N° Pièce</span><span class="info-value">${editableData.idCardNumber}</span></div>
          </div>
          <div class="important">⚠️ Reçu à usage unique. Présentez-le à la sortie.</div>
        </div>
        <script>window.onload = function() { setTimeout(function() { window.print(); }, 500); }</script>
      </body>
      </html>
    `;

    printWindow.document.write(receiptHtml);
    printWindow.document.close();
  };

  // 1. Processing view
  if (processing) {
    return (
      <Card className="glass-card border-primary/20 shadow-2xl overflow-hidden p-12">
        <div className="flex flex-col items-center justify-center space-y-10 text-center">
          <div className="w-24 h-24 rounded-full border-8 border-primary border-t-transparent animate-spin" />
          <div className="space-y-4">
            <h3 className="text-3xl font-black gradient-text">Traitement en cours</h3>
            <p className="text-muted-foreground">Veuillez patienter...</p>
          </div>
        </div>
      </Card>
    );
  }

  // 2. Main Scan UI
  if (!editableData && !registered) {
    return (
      <Card className="glass-card border-primary/20 overflow-hidden shadow-2xl">
        <CardHeader className="pb-4">
          <CardTitle className="text-xl font-black flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-primary/10">
                <CreditCard className="h-5 w-5 text-primary" />
              </div>
              <span className="gradient-text">Scanner CNI (Code-barres)</span>
            </div>
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          {cameraError && (
            <Alert variant="destructive">
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>{cameraError}</AlertDescription>
            </Alert>
          )}

          {cameraActive ? (
            <div className="space-y-6">
              <div id="reader" className="w-full aspect-[4/3] bg-black rounded-3xl overflow-hidden shadow-inner border-2 border-primary/20" />
              <div className="text-center p-4 bg-primary/5 rounded-2xl border border-primary/10">
                <p className="text-sm font-medium text-primary flex items-center justify-center gap-2">
                  <span className="h-2 w-2 rounded-full bg-primary animate-pulse" />
                  Scanner le code-barres au VERSO de la carte
                </p>
              </div>
              <div className="flex gap-4">
                <Button variant="outline" onClick={stopCamera} className="flex-1 h-14 rounded-2xl border-2">
                  <RotateCcw className="h-4 w-4 mr-2" /> Annuler
                </Button>
              </div>
            </div>
          ) : (
            <div className="space-y-8 py-4">
              <div className="flex flex-col items-center text-center space-y-4">
                <div className="w-24 h-24 rounded-[2rem] bg-primary/10 flex items-center justify-center animate-float">
                  <CreditCard className="h-12 w-12 text-primary" />
                </div>
                <div className="space-y-2">
                  <h3 className="text-2xl font-black gradient-text">Lecture Code-barres</h3>
                  <p className="text-muted-foreground text-sm max-w-[300px]">
                    Présentez le code-barres au dos de la carte devant la caméra pour une extraction <span className="text-primary font-bold">instantanée</span>.
                  </p>
                </div>
              </div>

              <div className="grid gap-4">
                <Button size="lg" onClick={startCamera} className="h-24 rounded-3xl text-xl font-black gap-4 shadow-2xl shadow-primary/20 bg-primary">
                  <Camera className="h-6 w-6" /> Scanner le Barcode
                </Button>

                <div className="relative py-2">
                  <div className="absolute inset-0 flex items-center"><span className="w-full border-t border-muted-foreground/10" /></div>
                  <div className="relative flex justify-center text-xs uppercase"><span className="bg-background px-4 text-muted-foreground font-bold">Ou utiliser l'IA</span></div>
                </div>

                <Button variant="outline" size="lg" className="h-16 rounded-2xl border-2" onClick={() => fileInputRef.current?.click()}>
                  <Upload className="h-5 w-5 mr-2" /> Importer Recto + Verso
                </Button>
              </div>

              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                multiple
                className="hidden"
                onChange={(e) => {
                  const files = e.target.files;
                  if (files && files.length >= 2) {
                    const reader1 = new FileReader();
                    reader1.onload = (ev1) => {
                      const front = ev1.target?.result as string;
                      setFrontImage(front);
                      const reader2 = new FileReader();
                      reader2.onload = (ev2) => {
                        const back = ev2.target?.result as string;
                        setBackImage(back);
                        processImages(front, back);
                      };
                      reader2.readAsDataURL(files[1]);
                    };
                    reader1.readAsDataURL(files[0]);
                  }
                }}
              />
            </div>
          )}
        </CardContent>
      </Card>
    );
  }

  // 3. Extracted data view
  if (editableData && !registered) {
    return (
      <Card className="glass-card border-primary/40 shadow-2xl overflow-hidden animate-slide-up">
        <CardHeader className="bg-primary/5 pb-6 border-b border-primary/10">
          <CardTitle className="text-2xl font-black flex items-center gap-4">
            <User className="h-6 w-6 text-primary" />
            <span className="gradient-text">Vérification des Données</span>
          </CardTitle>
        </CardHeader>
        <CardContent className="p-8 space-y-8">
          <div className="grid grid-cols-2 gap-6">
            <div className="space-y-2">
              <Label className="text-xs font-bold uppercase text-muted-foreground">Nom</Label>
              <Input value={editableData.lastName} onChange={(e) => handleFieldChange('lastName', e.target.value)} className="h-12 rounded-xl font-bold" />
            </div>
            <div className="space-y-2">
              <Label className="text-xs font-bold uppercase text-muted-foreground">Prénom</Label>
              <Input value={editableData.firstName} onChange={(e) => handleFieldChange('firstName', e.target.value)} className="h-12 rounded-xl font-bold" />
            </div>
          </div>
          <div className="space-y-2">
            <Label className="text-xs font-bold uppercase text-muted-foreground">Numéro de carte</Label>
            <Input value={editableData.idCardNumber} onChange={(e) => handleFieldChange('idCardNumber', e.target.value)} className="h-12 rounded-xl font-mono text-lg text-center font-black" />
          </div>
          <div className="pt-6">
            <Button size="lg" className="w-full h-16 text-xl font-black gap-4 rounded-2xl bg-success hover:bg-success/90" onClick={handleAccess}>
              <LogIn className="h-6 w-6" /> Confirmer l'Accès
            </Button>
          </div>
          <Button variant="ghost" className="w-full" onClick={handleReset}>Annuler et recommencer</Button>
        </CardContent>
      </Card>
    );
  }

  // 4. Success view
  if (registered && registeredVisitor) {
    return (
      <Card className="border-2 border-success bg-success/5 animate-fade-in">
        <CardContent className="p-8 text-center space-y-6">
          <div className="flex flex-col items-center gap-4">
            <div className="h-20 w-20 rounded-full bg-success/20 flex items-center justify-center"><CheckCircle className="h-10 w-10 text-success" /></div>
            <h2 className="text-2xl font-black text-success">ACCÈS VALIDE</h2>
          </div>
          <div className="bg-background p-6 rounded-3xl shadow-lg border-2 border-success/10 space-y-4">
            <div className="text-3xl font-mono font-black tracking-[0.2em]">{registeredVisitor.receiptCode}</div>
            <div className="flex justify-center"><QRCodeDisplay data={registeredVisitor.qrCodeData} size={180} /></div>
          </div>
          <div className="pt-4 grid gap-3">
            <Button size="lg" className="w-full h-16 text-lg font-bold gap-2" onClick={printReceipt}><Printer className="h-5 w-5" /> Imprimer le reçu</Button>
            <Button size="lg" variant="outline" className="w-full h-12" onClick={handleReset}>Nouveau visiteur</Button>
          </div>
        </CardContent>
      </Card>
    );
  }

  return null;
}
