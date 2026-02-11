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
import { Progress } from '@/components/ui/progress';

interface IDCardScanPanelProps {
  onComplete?: () => void;
}

export function IDCardScanPanel({ onComplete }: IDCardScanPanelProps) {
  const {
    extractedData,
    processing,
    ocrProgress,
    performLocalOCR,
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
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [cameraActive, setCameraActive] = useState(false);
  const [cameraError, setCameraError] = useState<string | null>(null);

  // OCR & Camera logic
  const startCamera = async () => {
    setCameraError(null);
    setCameraActive(true);
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: 'environment' }
      });
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
      }
    } catch (err) {
      setCameraError('Erreur caméra : ' + err);
      setCameraActive(false);
    }
  };

  const stopCamera = () => {
    if (videoRef.current?.srcObject) {
      const stream = videoRef.current.srcObject as MediaStream;
      stream.getTracks().forEach(t => t.stop());
    }
    setCameraActive(false);
  };

  const captureAndAnalyze = async () => {
    if (!videoRef.current || !canvasRef.current) return;

    const canvas = canvasRef.current;
    const video = videoRef.current;
    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    ctx.drawImage(video, 0, 0);
    const imageData = canvas.toDataURL('image/jpeg');
    setFrontImage(imageData);
    stopCamera();

    // Perform Local OCR
    const result = await performLocalOCR(imageData);
    if (result) {
      setEditableData(result as IDCardData);
      setScanStep('captured');
      toast.success('Analyse terminée !');
    }
  };

  const processUploadedFiles = async (front: string, back: string) => {
    const result = await extractIDCardData(front, back);
    if (result) setEditableData(result);
  };

  const handleFieldChange = (field: keyof IDCardData, value: string) => {
    if (editableData) setEditableData({ ...editableData, [field]: value });
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
    setScanStep('front');
    setEditableData(null);
    setRegistered(false);
    setCameraActive(false);
  };

  // 1. Processing view
  if (processing) {
    return (
      <Card className="glass-card border-primary/20 shadow-2xl p-12 text-center space-y-8">
        <div className="flex flex-col items-center gap-6">
          <div className="w-24 h-24 rounded-full border-8 border-primary border-t-transparent animate-spin" />
          <h3 className="text-2xl font-black gradient-text">Analyse en cours...</h3>
          <div className="w-full max-w-xs space-y-2">
            <Progress value={ocrProgress} className="h-2" />
            <p className="text-xs text-muted-foreground font-bold">{ocrProgress}% - Reconnaissance de texte</p>
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
          <CardTitle className="text-xl font-black flex items-center gap-3">
            <CreditCard className="h-5 w-5 text-primary" />
            <span className="gradient-text">Capture CNI Locale (Autonome)</span>
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          {cameraActive ? (
            <div className="space-y-6">
              <div className="relative aspect-[4/3] bg-black rounded-3xl overflow-hidden shadow-inner flex items-center justify-center">
                <video ref={videoRef} autoPlay playsInline className="w-full h-full object-cover" />
                <div className="absolute inset-4 border-2 border-white/40 border-dashed rounded-2xl pointer-events-none" />
                <canvas ref={canvasRef} className="hidden" />
              </div>
              <div className="flex gap-4">
                <Button variant="outline" onClick={stopCamera} className="flex-1 h-14 rounded-2xl">
                  Annuler
                </Button>
                <Button onClick={captureAndAnalyze} className="flex-1 h-14 rounded-2xl bg-primary font-bold">
                  <Camera className="h-5 w-5 mr-2" /> Capturer & Analyser
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
                  <h3 className="text-2xl font-black gradient-text">Nouvelle Méthode : Scan Photo</h3>
                  <p className="text-muted-foreground text-sm max-w-[300px]">
                    Prenez une photo nette du <span className="text-primary font-bold">RECTO</span> de la carte. L'analyse se fera directement sur votre appareil.
                  </p>
                </div>
              </div>

              <div className="grid gap-4">
                <Button size="lg" onClick={startCamera} className="h-24 rounded-3xl text-xl font-black gap-4 shadow-xl bg-primary">
                  <Camera className="h-6 w-6" /> Prendre une Photo
                </Button>

                <div className="relative py-2">
                  <div className="absolute inset-0 flex items-center"><span className="w-full border-t border-muted-foreground/10" /></div>
                  <div className="relative flex justify-center text-xs uppercase"><span className="bg-background px-4 text-muted-foreground font-bold tracking-widest">OU</span></div>
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
                    const r1 = new FileReader();
                    r1.onload = (ev1) => {
                      const r2 = new FileReader();
                      r2.onload = (ev2) => processUploadedFiles(ev1.target?.result as string, ev2.target?.result as string);
                      r2.readAsDataURL(files[1]);
                    };
                    r1.readAsDataURL(files[0]);
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
            <span className="gradient-text">Données Extraites</span>
          </CardTitle>
        </CardHeader>
        <CardContent className="p-8 space-y-6 text-left">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label className="text-xs font-bold uppercase text-muted-foreground">Nom de famille</Label>
              <Input value={editableData.lastName} onChange={e => handleFieldChange('lastName', e.target.value)} className="h-12 rounded-xl font-bold" />
            </div>
            <div className="space-y-2">
              <Label className="text-xs font-bold uppercase text-muted-foreground">Prénom(s)</Label>
              <Input value={editableData.firstName} onChange={e => handleFieldChange('firstName', e.target.value)} className="h-12 rounded-xl font-bold" />
            </div>
            <div className="space-y-2 md:col-span-2">
              <Label className="text-xs font-bold uppercase text-muted-foreground">Numéro de carte / NIN</Label>
              <Input value={editableData.idCardNumber} onChange={e => handleFieldChange('idCardNumber', e.target.value)} className="h-12 rounded-xl font-mono text-center font-black" />
            </div>
          </div>
          <Button size="lg" className="w-full h-16 text-xl font-black bg-success hover:bg-success/90 rounded-2xl mt-4" onClick={handleAccess}>
            <LogIn className="h-6 w-6 mr-2" /> Confirmer l'Accès
          </Button>
          <Button variant="ghost" className="w-full mt-2" onClick={handleReset}>Annuler</Button>
        </CardContent>
      </Card>
    );
  }

  // 4. Success view
  if (registered && registeredVisitor) {
    return (
      <Card className="border-2 border-success bg-success/5 animate-fade-in text-center p-8 space-y-6">
        <div className="flex flex-col items-center gap-4">
          <div className="h-20 w-20 rounded-full bg-success/20 flex items-center justify-center"><CheckCircle className="h-10 w-10 text-success" /></div>
          <h2 className="text-2xl font-black text-success uppercase">Accès Accordé</h2>
        </div>
        <div className="bg-background p-6 rounded-3xl shadow-lg border-2 border-success/10 space-y-4">
          <div className="text-3xl font-mono font-black tracking-widest">{registeredVisitor.receiptCode}</div>
          <div className="flex justify-center"><QRCodeDisplay data={registeredVisitor.qrCodeData} size={180} /></div>
        </div>
        <Button size="lg" className="w-full h-16 text-lg font-bold" onClick={() => window.print()}>Imprimer le reçu</Button>
        <Button variant="outline" className="w-full h-12" onClick={handleReset}>Nouveau visiteur</Button>
      </Card>
    );
  }

  return null;
}
