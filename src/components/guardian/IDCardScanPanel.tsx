import { useState, useRef, useEffect } from 'react';
import { Camera, Upload, User, CreditCard, Calendar, MapPin, LogIn, CheckCircle, RotateCcw, Printer, AlertCircle } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useIDCardScanner, IDCardData, WalkInVisitorResult } from '@/hooks/useIDCardScanner';
import { QRCodeDisplay } from '@/components/ui/QRCodeDisplay';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { format } from 'date-fns';
import { fr } from 'date-fns/locale';
import { toast } from 'sonner';

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
  const [stabilityCounter, setStabilityCounter] = useState(0);
  const [isSteady, setIsSteady] = useState(false);
  const [registered, setRegistered] = useState(false);
  const [registeredVisitor, setRegisteredVisitor] = useState<WalkInVisitorResult | null>(null);
  const [editableData, setEditableData] = useState<IDCardData | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [cameraActive, setCameraActive] = useState(false);
  const [stream, setStream] = useState<MediaStream | null>(null);
  const [cameraError, setCameraError] = useState<string | null>(null);
  const [cameraPermission, setCameraPermission] = useState<'prompt' | 'granted' | 'denied' | 'unknown'>('unknown');
  const capturedFrontImageRef = useRef<string | null>(null);
  const capturedBackImageRef = useRef<string | null>(null);

  // Auto-capture logic
  useEffect(() => {
    if (!cameraActive || scanStep === 'captured') return;

    let timer: any;
    if (cameraActive && stream) {
      timer = setInterval(() => {
        // Simple auto-capture simulation: wait 3 seconds once camera is active
        setStabilityCounter(prev => {
          if (prev >= 100) {
            captureFromCamera();
            return 0;
          }
          return prev + 5; // progress 5% every 150ms => 3s total
        });
      }, 150);
    }

    return () => {
      if (timer) clearInterval(timer);
    };
  }, [cameraActive, stream, scanStep]);

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
        console.log('Permission API not supported, will check on camera access');
      }
    };
    checkCameraPermission();
  }, []);

  const startCamera = async () => {
    setCameraError(null);
    setCameraActive(true); // Show video element first
  };

  // Start the stream once cameraActive is true and videoRef is mounted
  useEffect(() => {
    if (!cameraActive || !videoRef.current) return;

    let cancelled = false;
    const initStream = async () => {
      try {
        if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
          setCameraError('Votre navigateur ne supporte pas l\'accès à la caméra. Essayez avec Chrome, Firefox ou Safari.');
          setCameraActive(false);
          return;
        }

        let mediaStream: MediaStream;
        try {
          mediaStream = await navigator.mediaDevices.getUserMedia({
            video: {
              facingMode: { ideal: 'environment' },
              width: { ideal: 1280 },
              height: { ideal: 720 }
            },
            audio: false
          });
        } catch (firstError) {
          // Fallback to basic video
          console.warn('Falling back to basic video constraints:', firstError);
          mediaStream = await navigator.mediaDevices.getUserMedia({ video: true, audio: false });
        }

        if (cancelled) {
          if (mediaStream) mediaStream.getTracks().forEach(t => t.stop());
          return;
        }

        if (videoRef.current) {
          videoRef.current.srcObject = mediaStream;
          try {
            await videoRef.current.play();
          } catch (playErr) {
            console.warn('Auto-play failed, user interaction may be needed:', playErr);
          }
          setStream(mediaStream);
          setCameraPermission('granted');
        }
      } catch (error) {
        if (cancelled) return;
        console.error('Error accessing camera:', error);
        const err = error as Error;

        if (err.name === 'NotAllowedError' || err.name === 'PermissionDeniedError') {
          setCameraError('L\'accès à la caméra a été refusé. Veuillez autoriser l\'accès dans les paramètres de votre navigateur.');
          setCameraPermission('denied');
        } else if (err.name === 'NotFoundError' || err.name === 'DevicesNotFoundError') {
          setCameraError('Aucune caméra détectée sur cet appareil. Utilisez l\'option "Importer".');
        } else if (err.name === 'NotReadableError' || err.name === 'TrackStartError') {
          setCameraError('La caméra est utilisée par une autre application. Fermez les autres applications et réessayez.');
        } else if (err.name === 'SecurityError') {
          setCameraError('L\'accès à la caméra nécessite une connexion HTTPS sécurisée.');
        } else {
          setCameraError(`Erreur d'accès à la caméra: ${err.message || 'Erreur inconnue'}`);
        }
        setCameraActive(false);
      }
    };

    initStream();

    return () => {
      cancelled = true;
    };
  }, [cameraActive]);



  const stopCamera = () => {
    if (stream) {
      stream.getTracks().forEach(track => track.stop());
      setStream(null);
      setCameraActive(false);
      setStabilityCounter(0);
    }
  };

  const captureFromCamera = () => {
    if (videoRef.current && canvasRef.current) {
      const video = videoRef.current;
      const canvas = canvasRef.current;
      canvas.width = video.videoWidth;
      canvas.height = video.videoHeight;
      const ctx = canvas.getContext('2d');
      if (ctx) {
        ctx.drawImage(video, 0, 0);
        const imageData = canvas.toDataURL('image/jpeg', 0.8);

        if (scanStep === 'front') {
          capturedFrontImageRef.current = imageData;
          setFrontImage(imageData);
          setStabilityCounter(0);
          setScanStep('back');
          toast.info('Recto capturé. Maintenant, tournez la carte pour scanner le verso.');
        } else if (scanStep === 'back') {
          capturedBackImageRef.current = imageData;
          setBackImage(imageData);
          setScanStep('captured');
          stopCamera();

          const frontFromRef = capturedFrontImageRef.current;
          if (frontFromRef) {
            processImages(frontFromRef, imageData);
          } else {
            console.error('Front image missing in ref!');
            toast.error('Erreur lors de la capture du recto. Veuillez recommencer.');
            handleReset();
          }
        }
      }
    }
  };

  const processImages = async (front: string, back: string) => {
    console.log('Starting images processing...', {
      frontSize: front?.length,
      backSize: back?.length
    });
    const result = await extractIDCardData(front, back);
    if (result) {
      console.log('Extraction success:', result);
      setEditableData(result);
    } else {
      console.warn('Extraction failed or returned no result');
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
    setStabilityCounter(0);
    setEditableData(null);
    setRegistered(false);
    setRegisteredVisitor(null);
    setCameraError(null);
    stopCamera();
    onComplete?.();
  };

  const printReceipt = () => {
    if (!registeredVisitor || !editableData) return;

    const printWindow = window.open('', '_blank');
    if (!printWindow) {
      toast.error('Impossible d\'ouvrir la fenêtre d\'impression. Vérifiez que les popups sont autorisés.');
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
          .header p { font-size: 12px; color: #666; }
          .qr-container { text-align: center; margin: 20px 0; }
          .qr-container img { max-width: 180px; height: auto; }
          .code-manual { text-align: center; font-size: 28px; font-weight: bold; letter-spacing: 4px; margin: 15px 0; padding: 10px; background: #f0f0f0; border-radius: 4px; }
          .info { margin: 15px 0; }
          .info-row { display: flex; justify-content: space-between; padding: 8px 0; border-bottom: 1px solid #eee; }
          .info-label { color: #666; font-size: 12px; }
          .info-value { font-weight: 500; font-size: 14px; }
          .footer { text-align: center; margin-top: 20px; padding-top: 15px; border-top: 2px dashed #333; }
          .footer p { font-size: 10px; color: #666; line-height: 1.5; }
          .important { background: #fff3cd; padding: 10px; border-radius: 4px; margin-top: 15px; font-size: 11px; text-align: center; }
          @media print { body { padding: 0; } .receipt { border: none; } @page { margin: 1cm; } }
        </style>
      </head>
      <body>
        <div class="receipt">
          <div class="header">
            <h1>REÇU D'ACCÈS VISITEUR</h1>
            <p>Conservez ce reçu pour la sortie</p>
          </div>
          <div class="qr-container">
            <img src="${registeredVisitor.qrCodeDataUrl}" alt="QR Code" />
          </div>
          <div class="code-manual">${registeredVisitor.receiptCode}</div>
          <div class="info">
            <div class="info-row"><span class="info-label">Nom</span><span class="info-value">${editableData.lastName}</span></div>
            <div class="info-row"><span class="info-label">Prénom</span><span class="info-value">${editableData.firstName}</span></div>
            <div class="info-row"><span class="info-label">N° Pièce d'identité</span><span class="info-value">${editableData.idCardNumber}</span></div>
            <div class="info-row"><span class="info-label">Date d'entrée</span><span class="info-value">${format(new Date(), 'dd/MM/yyyy', { locale: fr })}</span></div>
            <div class="info-row"><span class="info-label">Heure d'entrée</span><span class="info-value">${format(new Date(), 'HH:mm', { locale: fr })}</span></div>
          </div>
          <div class="important">⚠️ Ce reçu est à usage unique. Présentez-le au gardien à votre sortie.</div>
          <div class="footer">
            <p>Merci de votre visite</p>
            <p>Généré le ${format(new Date(), "dd/MM/yyyy 'à' HH:mm", { locale: fr })}</p>
          </div>
        </div>
        <script>window.onload = function() { setTimeout(function() { window.print(); }, 500); }</script>
      </body>
      </html>
    `;

    printWindow.document.write(receiptHtml);
    printWindow.document.close();
  };

  // 1. Processing view (Highest priority)
  if (processing) {
    return (
      <Card key="processing-view" className="glass-card border-primary/20 shadow-2xl overflow-hidden p-12 animate-fade-in">
        <div className="flex flex-col items-center justify-center space-y-10">
          <div className="relative">
            <div className="w-32 h-32 rounded-full border-8 border-primary/5 flex items-center justify-center">
              <div className="w-24 h-24 rounded-full border-8 border-primary border-t-transparent animate-spin" />
            </div>
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2">
              <CreditCard className="h-12 w-12 text-primary animate-pulse" />
            </div>
          </div>
          <div className="text-center space-y-4">
            <h3 className="text-3xl font-black gradient-text">Analyse IA</h3>
            <p className="text-muted-foreground text-sm max-w-[280px] leading-relaxed">
              Nous analysons les deux faces de votre carte pour une précision <span className="font-bold text-foreground">maximale</span>.
            </p>
          </div>
        </div>
      </Card>
    );
  }

  // 2. Camera capture view with guide
  if (!editableData && !registered) {
    return (
      <Card key="scan-view" className="glass-card border-primary/20 overflow-hidden shadow-2xl">
        <CardHeader className="pb-4">
          <CardTitle className="text-xl font-black flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-primary/10">
                <CreditCard className="h-5 w-5 text-primary" />
              </div>
              <span className="gradient-text">Scanner CNI</span>
            </div>
            {cameraActive && (
              <div className="flex items-center gap-2">
                <div className={`h-2.5 w-2.5 rounded-full animate-pulse ${scanStep === 'front' ? 'bg-primary' : 'bg-accent'}`} />
                <span className="text-xs font-bold uppercase tracking-widest text-muted-foreground">
                  {scanStep === 'front' ? 'Recto' : 'Verso'}
                </span>
              </div>
            )}
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          {cameraError && (
            <Alert variant="destructive" className="animate-shake">
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>{cameraError}</AlertDescription>
            </Alert>
          )}

          {cameraActive ? (
            <div className="space-y-6">
              <div className="relative aspect-[4/3] bg-black rounded-3xl overflow-hidden shadow-inner group">
                <video
                  ref={videoRef}
                  autoPlay
                  playsInline
                  muted
                  className="w-full h-full object-cover opacity-80"
                />

                {/* ID Card Guide Overlay */}
                <div className="absolute inset-0 flex items-center justify-center p-8 pointer-events-none">
                  <div className={`relative w-full aspect-[1.6/1] border-2 rounded-2xl transition-all duration-500 ${stabilityCounter > 0 ? 'border-primary' : 'border-white/40 border-dashed'}`}>
                    {/* Corners */}
                    <div className="absolute -top-1 -left-1 w-6 h-6 border-t-4 border-l-4 border-primary rounded-tl-xl" />
                    <div className="absolute -top-1 -right-1 w-6 h-6 border-t-4 border-r-4 border-primary rounded-tr-xl" />
                    <div className="absolute -bottom-1 -left-1 w-6 h-6 border-b-4 border-l-4 border-primary rounded-bl-xl" />
                    <div className="absolute -bottom-1 -right-1 w-6 h-6 border-b-4 border-r-4 border-primary rounded-br-xl" />

                    {/* Stability Progress Indicator */}
                    {stabilityCounter > 0 && (
                      <div className="absolute inset-0 flex items-center justify-center bg-primary/5">
                        <div className="w-16 h-16 rounded-full border-4 border-primary/20 flex items-center justify-center">
                          <svg className="w-full h-full rotate-[-90deg]">
                            <circle
                              cx="32"
                              cy="32"
                              r="28"
                              fill="none"
                              stroke="currentColor"
                              strokeWidth="4"
                              strokeDasharray={`${stabilityCounter * 1.76} 176`}
                              className="text-primary transition-all duration-150"
                            />
                          </svg>
                          <Camera className="absolute h-6 w-6 text-primary animate-pulse" />
                        </div>
                      </div>
                    )}

                    <div className="absolute inset-x-0 -bottom-14 text-center">
                      <p className="text-white font-bold bg-black/60 backdrop-blur-md px-4 py-2 rounded-full text-sm inline-block shadow-lg">
                        {scanStep === 'front'
                          ? 'Cadrez le RECTO de la carte'
                          : 'Maintenant, cadrez le VERSO'
                        }
                      </p>
                    </div>
                  </div>
                </div>

                <canvas ref={canvasRef} className="hidden" />
              </div>

              <div className="flex gap-4">
                <Button
                  variant="outline"
                  onClick={stopCamera}
                  className="flex-1 h-14 rounded-2xl border-2 hover:bg-destructive/5 hover:border-destructive/20 hover:text-destructive transition-all"
                >
                  <RotateCcw className="h-4 w-4 mr-2" />
                  Annuler
                </Button>
                <Button
                  onClick={captureFromCamera}
                  className="flex-1 h-14 rounded-2xl bg-primary shadow-lg shadow-primary/20 font-bold"
                >
                  <Camera className="h-4 w-4 mr-2" />
                  Capture manuelle
                </Button>
              </div>
            </div>
          ) : (
            <div className="space-y-8 py-4">
              <div className="flex flex-col items-center text-center space-y-4">
                <div className="w-24 h-24 rounded-[2rem] bg-primary/10 flex items-center justify-center shadow-inner animate-float">
                  <Camera className="h-12 w-12 text-primary" />
                </div>
                <div className="space-y-2">
                  <h3 className="text-2xl font-black gradient-text">Détection auto</h3>
                  <p className="text-muted-foreground text-sm max-w-[300px] leading-relaxed">
                    Maintenez la carte devant la caméra. Elle sera capturée <span className="text-primary font-bold">automatiquement</span> une fois stabilisée.
                  </p>
                </div>
              </div>

              <div className="grid gap-4">
                <Button
                  size="lg"
                  onClick={startCamera}
                  className="h-24 rounded-3xl text-xl font-black gap-4 shadow-2xl shadow-primary/20 hover:scale-[1.02] active:scale-[0.98] transition-all bg-primary"
                  disabled={cameraPermission === 'denied'}
                >
                  <div className="p-3 rounded-2xl bg-white/20">
                    <LogIn className="h-6 w-6" />
                  </div>
                  Commencer le Scan
                </Button>

                <div className="relative py-2">
                  <div className="absolute inset-0 flex items-center">
                    <span className="w-full border-t border-muted-foreground/10" />
                  </div>
                  <div className="relative flex justify-center text-xs uppercase">
                    <span className="bg-background px-4 text-muted-foreground font-bold tracking-widest">Ou</span>
                  </div>
                </div>

                <Button
                  variant="outline"
                  size="lg"
                  className="h-16 rounded-2xl gap-3 border-2 hover:bg-accent/5 transition-all text-muted-foreground hover:text-foreground"
                  onClick={() => fileInputRef.current?.click()}
                >
                  <Upload className="h-5 w-5" />
                  Importer (Recto + Verso)
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
                  } else if (files && files.length === 1) {
                    toast.error('Veuillez sélectionner au moins deux images (recto et verso)');
                  }
                }}
              />
            </div>
          )}
        </CardContent>
      </Card>
    );
  }

  // 3. Extracted data view (editable)
  if (editableData && !registered) {
    return (
      <Card key="editable-view" className="glass-card border-primary/40 shadow-2xl overflow-hidden animate-slide-up">
        <CardHeader className="bg-primary/5 pb-6 border-b border-primary/10">
          <CardTitle className="text-2xl font-black flex items-center gap-4">
            <div className="p-3 rounded-2xl bg-primary/10">
              <User className="h-6 w-6 text-primary" />
            </div>
            <span className="gradient-text">Détails Visiteur</span>
          </CardTitle>
        </CardHeader>
        <CardContent className="p-8 space-y-8">
          <div className="flex gap-4 overflow-x-auto pb-4 scrollbar-hide">
            {frontImage && (
              <div className="relative flex-none w-48 aspect-[1.6/1] bg-muted rounded-2xl overflow-hidden border-2 border-primary/10 shadow-lg group">
                <img src={frontImage} alt="Recto" className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110" />
                <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
                <div className="absolute bottom-3 left-3 px-3 py-1 rounded-full bg-white/20 backdrop-blur-md text-[10px] font-black text-white uppercase tracking-widest">Recto</div>
              </div>
            )}
            {backImage && (
              <div className="relative flex-none w-48 aspect-[1.6/1] bg-muted rounded-2xl overflow-hidden border-2 border-primary/10 shadow-lg group">
                <img src={backImage} alt="Verso" className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110" />
                <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
                <div className="absolute bottom-3 left-3 px-3 py-1 rounded-full bg-white/20 backdrop-blur-md text-[10px] font-black text-white uppercase tracking-widest">Verso</div>
              </div>
            )}
          </div>

          <div className="grid grid-cols-2 gap-6">
            <div className="space-y-2">
              <Label htmlFor="lastName" className="text-[10px] font-black uppercase tracking-[0.2em] text-muted-foreground ml-1">Nom</Label>
              <Input id="lastName" value={editableData.lastName} onChange={(e) => handleFieldChange('lastName', e.target.value)} className="h-14 rounded-2xl bg-muted/20 border-border/50 focus:border-primary/50 text-lg font-bold" />
            </div>
            <div className="space-y-2">
              <Label htmlFor="firstName" className="text-[10px] font-black uppercase tracking-[0.2em] text-muted-foreground ml-1">Prénom</Label>
              <Input id="firstName" value={editableData.firstName} onChange={(e) => handleFieldChange('firstName', e.target.value)} className="h-14 rounded-2xl bg-muted/20 border-border/50 focus:border-primary/50 text-lg font-bold" />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="idCardNumber" className="text-[10px] font-black uppercase tracking-[0.2em] text-muted-foreground ml-1 flex items-center gap-2">
              <CreditCard className="h-3 w-3" />
              Numéro de carte d'identité
            </Label>
            <Input id="idCardNumber" value={editableData.idCardNumber} onChange={(e) => handleFieldChange('idCardNumber', e.target.value)} className="h-14 rounded-2xl bg-muted/20 border-border/50 font-mono text-xl tracking-[0.3em] font-black focus:border-primary/50 text-center" />
          </div>

          <div className="grid grid-cols-2 gap-6">
            <div className="space-y-2">
              <Label htmlFor="birthDate" className="text-[10px] font-black uppercase tracking-[0.2em] text-muted-foreground ml-1 flex items-center gap-2">
                <Calendar className="h-3 w-3" />
                Naissance
              </Label>
              <Input id="birthDate" type="date" value={editableData.birthDate || ''} onChange={(e) => handleFieldChange('birthDate', e.target.value)} className="h-14 rounded-2xl bg-muted/20 border-border/50 text-lg" />
            </div>
            <div className="space-y-2">
              <Label htmlFor="gender" className="text-[10px] font-black uppercase tracking-[0.2em] text-muted-foreground ml-1">Sexe</Label>
              <Input id="gender" value={editableData.gender || ''} onChange={(e) => handleFieldChange('gender', e.target.value)} className="h-14 rounded-2xl bg-muted/20 border-border/50 text-lg text-center font-bold" placeholder="M/F" />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="address" className="text-[10px] font-black uppercase tracking-[0.2em] text-muted-foreground ml-1 flex items-center gap-2">
              <MapPin className="h-3 w-3" />
              Adresse
            </Label>
            <Input id="address" value={editableData.address || ''} onChange={(e) => handleFieldChange('address', e.target.value)} className="h-14 rounded-2xl bg-muted/20 border-border/50" />
          </div>

          <div className="pt-6">
            <Button
              size="lg"
              className="w-full h-20 text-xl font-black gap-4 rounded-3xl bg-success hover:bg-success/90 shadow-2xl shadow-success/20 animate-pulse-glow"
              onClick={handleAccess}
            >
              <LogIn className="h-7 w-7" />
              Confirmer l'Entrée
            </Button>
          </div>

          <Button variant="ghost" className="w-full rounded-2xl h-12 text-muted-foreground font-bold" onClick={handleReset}>
            <RotateCcw className="h-4 w-4 mr-2" />
            Annuler et recommencer
          </Button>
        </CardContent>
      </Card>
    );
  }

  // 4. Success view with receipt
  if (registered && editableData && registeredVisitor) {
    return (
      <Card key="success-view" className="border-2 border-success bg-success/5">
        <CardContent className="p-6">
          <div className="text-center space-y-4">
            <div className="flex items-center justify-center gap-2 text-success">
              <CheckCircle className="h-8 w-8" />
              <span className="text-xl font-semibold">Accès enregistré</span>
            </div>

            <div className="space-y-2">
              <div className="flex items-center justify-center gap-2">
                <User className="h-5 w-5 text-muted-foreground" />
                <span className="text-xl font-semibold">
                  {editableData.firstName} {editableData.lastName}
                </span>
              </div>
              <div className="text-sm text-muted-foreground">
                Visiteur sans invitation
              </div>
            </div>

            {/* QR Code and Receipt Code */}
            <div className="bg-card p-4 rounded-lg shadow-sm border">
              <div className="flex justify-center mb-3">
                <QRCodeDisplay data={registeredVisitor.qrCodeData} size={150} />
              </div>
              <div className="text-2xl font-mono font-bold tracking-widest bg-muted py-2 rounded">
                {registeredVisitor.receiptCode}
              </div>
              <p className="text-xs text-muted-foreground mt-2">
                Code de sortie - À présenter au gardien
              </p>
            </div>

            <div className="pt-2">
              <span className="font-mono text-xs bg-muted px-3 py-1 rounded">
                CNI: {editableData.idCardNumber}
              </span>
            </div>
          </div>
        </CardContent>

        <div className="p-4 pt-0 space-y-2">
          <Button size="lg" className="w-full h-14 text-lg gap-2" onClick={printReceipt}>
            <Printer className="h-5 w-5" />
            Imprimer le reçu
          </Button>
          <Button size="lg" variant="outline" className="w-full h-12" onClick={handleReset}>
            Nouveau visiteur
          </Button>
        </div>
      </Card>
    );
  }

  return null;
}
