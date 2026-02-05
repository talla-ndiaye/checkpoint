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
  
  const [capturedImage, setCapturedImage] = useState<string | null>(null);
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
    try {
      // Check if mediaDevices API is available
      if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
        setCameraError('Votre navigateur ne supporte pas l\'accès à la caméra. Essayez avec Chrome, Firefox ou Safari.');
        return;
      }

      // Try to get the camera with environment facing mode first (back camera on mobile)
      const mediaStream = await navigator.mediaDevices.getUserMedia({ 
        video: { 
          facingMode: { ideal: 'environment' }, 
          width: { ideal: 1280 }, 
          height: { ideal: 720 } 
        },
        audio: false
      });
      
      if (videoRef.current) {
        videoRef.current.srcObject = mediaStream;
        // Ensure video plays
        videoRef.current.onloadedmetadata = () => {
          videoRef.current?.play().catch(err => {
            console.error('Error playing video:', err);
          });
        };
        setStream(mediaStream);
        setCameraActive(true);
        setCameraPermission('granted');
      }
    } catch (error) {
      console.error('Error accessing camera:', error);
      const err = error as Error;
      
      if (err.name === 'NotAllowedError' || err.name === 'PermissionDeniedError') {
        setCameraError('L\'accès à la caméra a été refusé. Veuillez autoriser l\'accès dans les paramètres de votre navigateur.');
        setCameraPermission('denied');
      } else if (err.name === 'NotFoundError' || err.name === 'DevicesNotFoundError') {
        setCameraError('Aucune caméra détectée sur cet appareil. Utilisez l\'option "Importer".');
      } else if (err.name === 'NotReadableError' || err.name === 'TrackStartError') {
        setCameraError('La caméra est utilisée par une autre application. Fermez les autres applications et réessayez.');
      } else if (err.name === 'OverconstrainedError') {
        // Try again with simpler constraints
        try {
          const simpleStream = await navigator.mediaDevices.getUserMedia({ 
            video: true,
            audio: false
          });
          if (videoRef.current) {
            videoRef.current.srcObject = simpleStream;
            videoRef.current.onloadedmetadata = () => {
              videoRef.current?.play().catch(e => console.error('Error playing video:', e));
            };
            setStream(simpleStream);
            setCameraActive(true);
            setCameraPermission('granted');
          }
          return;
        } catch {
          setCameraError('Impossible d\'accéder à la caméra. Essayez avec un autre navigateur.');
        }
      } else if (err.name === 'SecurityError') {
        setCameraError('L\'accès à la caméra nécessite une connexion HTTPS sécurisée.');
      } else {
        setCameraError(`Erreur d'accès à la caméra: ${err.message || 'Erreur inconnue'}`);
      }
    }
  };

  const stopCamera = () => {
    if (stream) {
      stream.getTracks().forEach(track => track.stop());
      setStream(null);
      setCameraActive(false);
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
        setCapturedImage(imageData);
        stopCamera();
        processImage(imageData);
      }
    }
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        const base64 = reader.result as string;
        setCapturedImage(base64);
        processImage(base64);
      };
      reader.readAsDataURL(file);
    }
  };

  const processImage = async (imageDataUrl: string) => {
    const base64Data = imageDataUrl.replace(/^data:image\/\w+;base64,/, '');
    const result = await extractIDCardData(base64Data);
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
    setCapturedImage(null);
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

  // Camera capture or file upload view
  if (!capturedImage && !extractedData) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="text-lg flex items-center gap-2">
            <CreditCard className="h-5 w-5 text-primary" />
            Scanner une carte d'identité
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {cameraError && (
            <Alert variant="destructive">
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>{cameraError}</AlertDescription>
            </Alert>
          )}
          
          {cameraActive ? (
            <div className="space-y-4">
              <div className="relative aspect-video bg-muted rounded-lg overflow-hidden">
                <video 
                  ref={videoRef} 
                  autoPlay 
                  playsInline
                  muted
                  className="w-full h-full object-cover"
                />
                <canvas ref={canvasRef} className="hidden" />
              </div>
              <div className="flex gap-2">
                <Button onClick={captureFromCamera} className="flex-1 gap-2">
                  <Camera className="h-4 w-4" />
                  Capturer
                </Button>
                <Button variant="outline" onClick={stopCamera}>
                  Annuler
                </Button>
              </div>
            </div>
          ) : (
            <div className="space-y-4">
              <p className="text-sm text-muted-foreground">
                Prenez une photo de la carte d'identité du visiteur ou importez une image existante.
              </p>
              
              {cameraPermission === 'denied' && (
                <Alert>
                  <AlertCircle className="h-4 w-4" />
                  <AlertDescription>
                    L'accès à la caméra a été bloqué. Cliquez sur l'icône de caméra dans la barre d'adresse pour l'activer.
                  </AlertDescription>
                </Alert>
              )}
              
              <div className="grid grid-cols-2 gap-3">
                <Button 
                  onClick={startCamera} 
                  variant="outline" 
                  className="h-24 flex-col gap-2"
                  disabled={cameraPermission === 'denied'}
                >
                  <Camera className="h-8 w-8" />
                  <span>Caméra</span>
                </Button>
                <Button 
                  variant="outline" 
                  className="h-24 flex-col gap-2"
                  onClick={() => fileInputRef.current?.click()}
                >
                  <Upload className="h-8 w-8" />
                  <span>Importer</span>
                </Button>
              </div>
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                capture="environment"
                className="hidden"
                onChange={handleFileUpload}
              />
            </div>
          )}
        </CardContent>
      </Card>
    );
  }

  // Processing view
  if (processing) {
    return (
      <Card>
        <CardContent className="p-6">
          <div className="flex flex-col items-center justify-center space-y-4">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
            <p className="text-muted-foreground">Analyse de la carte en cours...</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  // Extracted data view (editable)
  if (editableData && !registered) {
    return (
      <Card className="border-2 border-primary">
        <CardHeader>
          <CardTitle className="text-lg flex items-center gap-2">
            <User className="h-5 w-5 text-primary" />
            Informations du visiteur
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {capturedImage && (
            <div className="aspect-video max-h-40 bg-muted rounded-lg overflow-hidden">
              <img src={capturedImage} alt="Carte scannée" className="w-full h-full object-contain" />
            </div>
          )}
          
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1">
              <Label htmlFor="lastName" className="text-xs">Nom</Label>
              <Input id="lastName" value={editableData.lastName} onChange={(e) => handleFieldChange('lastName', e.target.value)} className="h-9" />
            </div>
            <div className="space-y-1">
              <Label htmlFor="firstName" className="text-xs">Prénom</Label>
              <Input id="firstName" value={editableData.firstName} onChange={(e) => handleFieldChange('firstName', e.target.value)} className="h-9" />
            </div>
          </div>

          <div className="space-y-1">
            <Label htmlFor="idCardNumber" className="text-xs flex items-center gap-1">
              <CreditCard className="h-3 w-3" />
              N° Carte d'identité
            </Label>
            <Input id="idCardNumber" value={editableData.idCardNumber} onChange={(e) => handleFieldChange('idCardNumber', e.target.value)} className="h-9 font-mono" />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1">
              <Label htmlFor="birthDate" className="text-xs flex items-center gap-1">
                <Calendar className="h-3 w-3" />
                Date de naissance
              </Label>
              <Input id="birthDate" type="date" value={editableData.birthDate || ''} onChange={(e) => handleFieldChange('birthDate', e.target.value)} className="h-9" />
            </div>
            <div className="space-y-1">
              <Label htmlFor="gender" className="text-xs">Sexe</Label>
              <Input id="gender" value={editableData.gender || ''} onChange={(e) => handleFieldChange('gender', e.target.value)} className="h-9" placeholder="M/F" />
            </div>
          </div>

          <div className="space-y-1">
            <Label htmlFor="address" className="text-xs flex items-center gap-1">
              <MapPin className="h-3 w-3" />
              Adresse
            </Label>
            <Input id="address" value={editableData.address || ''} onChange={(e) => handleFieldChange('address', e.target.value)} className="h-9" />
          </div>

          <div className="pt-2">
            <Button size="lg" className="w-full h-16 text-base gap-2 bg-success hover:bg-success/90" onClick={handleAccess}>
              <LogIn className="h-5 w-5" />
              Enregistrer l'entrée
            </Button>
          </div>
          <p className="text-xs text-muted-foreground text-center">
            Un reçu avec QR code sera généré pour la sortie
          </p>

          <Button variant="ghost" className="w-full" onClick={handleReset}>
            <RotateCcw className="h-4 w-4 mr-2" />
            Annuler et recommencer
          </Button>
        </CardContent>
      </Card>
    );
  }

  // Success view with receipt
  if (registered && editableData && registeredVisitor) {
    return (
      <Card className="border-2 border-success bg-success/5">
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
