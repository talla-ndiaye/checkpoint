import { useState, useRef, useCallback } from 'react';
import {
  Camera,
  Upload,
  User,
  CreditCard,
  Calendar,
  MapPin,
  LogIn,
  CheckCircle,
  RotateCcw,
  Printer,
  X,
  ImageIcon,
  Globe,
  UserCircle,
  Check,
} from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useIDCardScanner, IDCardData, WalkInVisitorResult } from '@/hooks/useIDCardScanner';
import { QRCodeDisplay } from '@/components/ui/QRCodeDisplay';
import { Progress } from '@/components/ui/progress';
import { toast } from 'sonner';

interface IDCardScanPanelProps {
  onComplete?: () => void;
}

type ScanStep = 'front' | 'back' | 'processing' | 'review' | 'success';

const STEPS = [
  { key: 'front', label: 'Recto', icon: CreditCard },
  { key: 'back', label: 'Verso', icon: CreditCard },
  { key: 'processing', label: 'Analyse', icon: ImageIcon },
  { key: 'review', label: 'Validation', icon: Check },
] as const;

function getStepIndex(step: ScanStep): number {
  if (step === 'success') return 4;
  return STEPS.findIndex(s => s.key === step);
}

function StepperBar({ currentStep }: { currentStep: ScanStep }) {
  const currentIndex = getStepIndex(currentStep);

  return (
    <div className="flex items-center w-full px-2 py-4">
      {STEPS.map((s, i) => {
        const Icon = s.icon;
        const isDone = i < currentIndex;
        const isActive = i === currentIndex;
        return (
          <div key={s.key} className="flex items-center flex-1 last:flex-none">
            <div className="stepper-step">
              <div className={`stepper-circle ${isDone ? 'stepper-circle-done' : isActive ? 'stepper-circle-active' : 'stepper-circle-pending'}`}>
                {isDone ? <Check className="h-4 w-4" /> : <Icon className="h-4 w-4" />}
              </div>
              <span className={`text-[10px] font-bold uppercase tracking-wider whitespace-nowrap ${isDone ? 'text-success' : isActive ? 'text-primary' : 'text-muted-foreground'}`}>
                {s.label}
              </span>
            </div>
            {i < STEPS.length - 1 && (
              <div className={`stepper-line mx-1 ${isDone ? 'stepper-line-done' : ''}`} />
            )}
          </div>
        );
      })}
    </div>
  );
}

export function IDCardScanPanel({ onComplete }: IDCardScanPanelProps) {
  const {
    processing,
    ocrProgress,
    extractIDCardData,
    registerWalkInVisitor,
    reset
  } = useIDCardScanner();

  const [step, setStep] = useState<ScanStep>('front');
  const [frontImage, setFrontImage] = useState<string | null>(null);
  const [backImage, setBackImage] = useState<string | null>(null);
  const [editableData, setEditableData] = useState<IDCardData | null>(null);
  const [registeredVisitor, setRegisteredVisitor] = useState<WalkInVisitorResult | null>(null);
  const [cameraActive, setCameraActive] = useState(false);
  const [cameraStream, setCameraStream] = useState<MediaStream | null>(null);

  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const frontFileRef = useRef<HTMLInputElement>(null);
  const backFileRef = useRef<HTMLInputElement>(null);

  const startCamera = useCallback(async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: 'environment', width: { ideal: 1920 }, height: { ideal: 1080 } }
      });
      setCameraStream(stream);
      setCameraActive(true);
      setTimeout(() => {
        if (videoRef.current) {
          videoRef.current.srcObject = stream;
          videoRef.current.play();
        }
      }, 100);
    } catch {
      toast.error('Impossible d\'acceder a la camera. Verifiez les permissions.');
    }
  }, []);

  const stopCamera = useCallback(() => {
    if (cameraStream) {
      cameraStream.getTracks().forEach(track => track.stop());
      setCameraStream(null);
    }
    setCameraActive(false);
  }, [cameraStream]);

  const capturePhoto = useCallback(() => {
    if (!videoRef.current || !canvasRef.current) return;
    const video = videoRef.current;
    const canvas = canvasRef.current;
    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    ctx.drawImage(video, 0, 0);
    const dataUrl = canvas.toDataURL('image/jpeg', 0.9);
    stopCamera();

    if (step === 'front') {
      setFrontImage(dataUrl);
      setStep('back');
    } else if (step === 'back') {
      setBackImage(dataUrl);
    }
  }, [step, stopCamera]);

  const handleFileUpload = useCallback((e: React.ChangeEvent<HTMLInputElement>, side: 'front' | 'back') => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (ev) => {
      const dataUrl = ev.target?.result as string;
      if (side === 'front') {
        setFrontImage(dataUrl);
        setStep('back');
      } else {
        setBackImage(dataUrl);
      }
    };
    reader.readAsDataURL(file);
  }, []);

  const processImages = useCallback(async () => {
    if (!frontImage || !backImage) return;
    setStep('processing');
    const result = await extractIDCardData(frontImage, backImage);
    if (result) {
      setEditableData(result);
      setStep('review');
    } else {
      setStep('back');
    }
  }, [frontImage, backImage, extractIDCardData]);

  const handleFieldChange = (field: keyof IDCardData, value: string) => {
    if (editableData) setEditableData({ ...editableData, [field]: value });
  };

  const handleAccess = async () => {
    if (!editableData) return;
    const result = await registerWalkInVisitor(editableData, 'entry');
    if (result) {
      setRegisteredVisitor(result);
      setStep('success');
    }
  };

  const handleReset = () => {
    stopCamera();
    reset();
    setFrontImage(null);
    setBackImage(null);
    setStep('front');
    setEditableData(null);
    setRegisteredVisitor(null);
    onComplete?.();
  };

  const printReceipt = () => {
    if (!registeredVisitor || !editableData) return;
    const printWindow = window.open('', '_blank');
    if (!printWindow) {
      toast.error('Impossible d\'ouvrir la fenetre d\'impression.');
      return;
    }
    const receiptHtml = `<!DOCTYPE html>
<html><head><title>Recu d'acces - ${editableData.firstName} ${editableData.lastName}</title><meta charset="UTF-8">
<style>
*{margin:0;padding:0;box-sizing:border-box}body{font-family:Arial,sans-serif;padding:20px;max-width:400px;margin:0 auto}
.receipt{border:2px solid #333;padding:20px;border-radius:8px}.header{text-align:center;margin-bottom:20px;border-bottom:2px dashed #333;padding-bottom:15px}
.header h1{font-size:18px;margin-bottom:5px}.qr-container{text-align:center;margin:20px 0}.qr-container img{max-width:180px;height:auto}
.code-manual{text-align:center;font-size:28px;font-weight:bold;letter-spacing:4px;margin:15px 0;padding:10px;background:#f0f0f0;border-radius:4px}
.info{margin:15px 0}.info-row{display:flex;justify-content:space-between;padding:8px 0;border-bottom:1px solid #eee}
.info-label{color:#666;font-size:12px}.info-value{font-weight:500;font-size:14px}
.footer{text-align:center;margin-top:20px;padding-top:15px;border-top:2px dashed #333}
.important{background:#fff3cd;padding:10px;border-radius:4px;margin-top:15px;font-size:11px;text-align:center}
@media print{body{padding:0}.receipt{border:none}}
</style></head><body>
<div class="receipt">
<div class="header"><h1>RECU D'ACCES VISITEUR</h1><p>Conservez ce recu pour la sortie</p></div>
<div class="qr-container"><img src="${registeredVisitor.qrCodeDataUrl}" alt="QR Code" /></div>
<div class="code-manual">${registeredVisitor.receiptCode}</div>
<div class="info">
<div class="info-row"><span class="info-label">Nom</span><span class="info-value">${editableData.lastName}</span></div>
<div class="info-row"><span class="info-label">Prenom</span><span class="info-value">${editableData.firstName}</span></div>
<div class="info-row"><span class="info-label">N Piece</span><span class="info-value">${editableData.idCardNumber}</span></div>
</div>
<div class="important">Recu a usage unique. Presentez-le a la sortie.</div>
</div>
<script>window.onload=function(){setTimeout(function(){window.print()},500)}</script>
</body></html>`;
    printWindow.document.write(receiptHtml);
    printWindow.document.close();
  };

  const hiddenInputs = (
    <>
      <canvas ref={canvasRef} className="hidden" />
      <input
        ref={frontFileRef}
        type="file"
        accept="image/*"
        capture="environment"
        className="hidden"
        onChange={(e) => handleFileUpload(e, 'front')}
      />
      <input
        ref={backFileRef}
        type="file"
        accept="image/*"
        capture="environment"
        className="hidden"
        onChange={(e) => handleFileUpload(e, 'back')}
      />
    </>
  );

  // ─── Processing State ────────────────────────────
  if (step === 'processing' || processing) {
    return (
      <Card className="border border-primary/20 shadow-2xl overflow-hidden">
        {hiddenInputs}
        <StepperBar currentStep="processing" />
        <CardContent className="p-12 text-center space-y-8">
          <div className="flex flex-col items-center gap-6">
            <div className="relative">
              <div className="w-24 h-24 rounded-full border-[6px] border-primary/20 flex items-center justify-center">
                <div className="w-24 h-24 rounded-full border-[6px] border-primary border-t-transparent animate-spin absolute inset-0" />
                <span className="text-2xl font-black text-primary">{ocrProgress.progress}%</span>
              </div>
            </div>
            <div className="space-y-2">
              <h3 className="text-2xl font-black text-primary">Analyse en cours...</h3>
              <p className="text-sm text-muted-foreground font-medium">
                {ocrProgress.status || 'Reconnaissance de texte'}
              </p>
            </div>
            <div className="w-full max-w-xs">
              <Progress value={ocrProgress.progress} className="h-2" />
            </div>
          </div>
        </CardContent>
      </Card>
    );
  }

  // ─── Success State ───────────────────────────────
  if (step === 'success' && registeredVisitor && editableData) {
    return (
      <Card className="border-2 border-success/40 overflow-hidden animate-fade-in">
        {hiddenInputs}
        <div className="bg-success p-8 text-center text-white">
          <div className="flex flex-col items-center gap-3">
            <div className="p-4 bg-black/10 rounded-full animate-bounce-in">
              <CheckCircle className="h-10 w-10" />
            </div>
            <h2 className="text-2xl font-black tracking-tight">ACCÈS VALIDÉ</h2>
            <p className="text-white/80 text-sm">{editableData.firstName} {editableData.lastName}</p>
          </div>
        </div>
        <CardContent className="p-8 space-y-6">
          <div className="bg-background p-6 rounded-3xl shadow-lg border-2 border-success/10 space-y-4">
            <div className="text-center space-y-3">
              <p className="text-sm text-muted-foreground font-medium">Code d'accès</p>
              <div className="text-3xl font-mono font-black tracking-[0.2em]">{registeredVisitor.receiptCode}</div>
              <div className="flex justify-center">
                <div className="p-3 bg-white rounded-2xl shadow-lg shadow-success/20">
                  <QRCodeDisplay data={registeredVisitor.qrCodeData} size={180} />
                </div>
              </div>
              <p className="text-xs text-muted-foreground">
                N° Pièce : {editableData.idCardNumber}
              </p>
            </div>
          </div>
          <div className="grid gap-3">
            <Button size="lg" className="w-full h-16 text-lg font-bold gap-3 rounded-2xl bg-primary hover:bg-primary/90 shadow-lg transition-all" onClick={printReceipt}>
              <Printer className="h-5 w-5" /> Imprimer le reçu
            </Button>
            <Button size="lg" variant="outline" className="w-full h-12 rounded-xl border-dashed" onClick={handleReset}>
              Nouveau visiteur
            </Button>
          </div>
        </CardContent>
      </Card>
    );
  }

  // ─── Review State ────────────────────────────────
  if (step === 'review' && editableData) {
    return (
      <Card className="border border-primary/20 shadow-2xl overflow-hidden animate-slide-up">
        {hiddenInputs}
        <StepperBar currentStep="review" />
        <CardContent className="p-6 space-y-6">
          {/* Image thumbnails */}
          <div className="flex gap-3 justify-center">
            {frontImage && (
              <div className="relative group">
                <div className="w-28 h-20 rounded-xl overflow-hidden border-2 border-primary/20 shadow-md">
                  <img src={frontImage} alt="Recto CNI" className="w-full h-full object-cover" />
                </div>
                <span className="absolute bottom-1 left-1 text-[10px] font-bold bg-background/80 px-1.5 py-0.5 rounded">RECTO</span>
              </div>
            )}
            {backImage && (
              <div className="relative group">
                <div className="w-28 h-20 rounded-xl overflow-hidden border-2 border-primary/20 shadow-md">
                  <img src={backImage} alt="Verso CNI" className="w-full h-full object-cover" />
                </div>
                <span className="absolute bottom-1 left-1 text-[10px] font-bold bg-background/80 px-1.5 py-0.5 rounded">VERSO</span>
              </div>
            )}
          </div>

          {/* Section: Identity */}
          <div className="space-y-4">
            <div className="flex items-center gap-2 text-sm font-bold text-muted-foreground uppercase tracking-wider">
              <UserCircle className="h-4 w-4 text-primary" />
              Identité
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <Label className="text-xs font-bold uppercase text-muted-foreground">Prénom</Label>
                <Input value={editableData.firstName} onChange={(e) => handleFieldChange('firstName', e.target.value)} className="h-11 rounded-xl font-semibold" />
              </div>
              <div className="space-y-1.5">
                <Label className="text-xs font-bold uppercase text-muted-foreground">Nom</Label>
                <Input value={editableData.lastName} onChange={(e) => handleFieldChange('lastName', e.target.value)} className="h-11 rounded-xl font-semibold" />
              </div>
            </div>
            <div className="space-y-1.5">
              <Label className="text-xs font-bold uppercase text-muted-foreground">Numéro de carte / NIN</Label>
              <Input value={editableData.idCardNumber} onChange={(e) => handleFieldChange('idCardNumber', e.target.value)} className="h-11 rounded-xl font-mono text-center font-bold tracking-wider" />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <Label className="text-xs font-bold uppercase text-muted-foreground">Sexe</Label>
                <Input value={editableData.gender || ''} onChange={(e) => handleFieldChange('gender', e.target.value)} className="h-11 rounded-xl" placeholder="M / F" />
              </div>
              <div className="space-y-1.5">
                <Label className="text-xs font-bold uppercase text-muted-foreground flex items-center gap-1">
                  <Calendar className="h-3 w-3" /> Date de naissance
                </Label>
                <Input value={editableData.birthDate || ''} onChange={(e) => handleFieldChange('birthDate', e.target.value)} className="h-11 rounded-xl" placeholder="JJ/MM/AAAA" />
              </div>
            </div>
          </div>

          {/* Section: Location */}
          <div className="space-y-4">
            <div className="flex items-center gap-2 text-sm font-bold text-muted-foreground uppercase tracking-wider">
              <MapPin className="h-4 w-4 text-accent" />
              Localisation
            </div>
            <div className="space-y-1.5">
              <Label className="text-xs font-bold uppercase text-muted-foreground">Adresse</Label>
              <Input value={editableData.address || ''} onChange={(e) => handleFieldChange('address', e.target.value)} className="h-11 rounded-xl" placeholder="Adresse" />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <Label className="text-xs font-bold uppercase text-muted-foreground flex items-center gap-1">
                  <Globe className="h-3 w-3" /> Nationalité
                </Label>
                <Input value={editableData.nationality || 'SEN'} onChange={(e) => handleFieldChange('nationality', e.target.value)} className="h-11 rounded-xl" />
              </div>
              <div className="space-y-1.5">
                <Label className="text-xs font-bold uppercase text-muted-foreground">Date d'expiration</Label>
                <Input value={editableData.expiryDate || ''} onChange={(e) => handleFieldChange('expiryDate', e.target.value)} className="h-11 rounded-xl" placeholder="JJ/MM/AAAA" />
              </div>
            </div>
          </div>

          {/* Actions */}
          <div className="pt-2 space-y-3">
            <Button size="lg" className="w-full h-14 text-lg font-black gap-3 rounded-2xl bg-success hover:bg-success/90 shadow-md transition-all" onClick={handleAccess}>
              <LogIn className="h-5 w-5" /> Confirmer l'accès
            </Button>
            <Button variant="ghost" className="w-full text-muted-foreground" onClick={handleReset}>
              <RotateCcw className="h-4 w-4 mr-2" /> Annuler et recommencer
            </Button>
          </div>
        </CardContent>
      </Card>
    );
  }

  // ─── Capture State (Front / Back) ────────────────
  const currentSide = step === 'front' ? 'front' : 'back';
  const currentLabel = currentSide === 'front' ? 'RECTO' : 'VERSO';
  const currentDescription = currentSide === 'front'
    ? 'Photographiez ou importez la face avant de la carte d\'identite'
    : 'Photographiez ou importez la face arriere de la carte d\'identite';
  const currentImage = currentSide === 'front' ? frontImage : backImage;
  const exampleUrl = currentSide === 'front'
    ? 'https://hebbkx1anhila5yf.public.blob.vercel-storage.com/cdeao-recto-b4PudMGdJsp2MEYdfD8WnLeM8A0fWj.jpg'
    : 'https://hebbkx1anhila5yf.public.blob.vercel-storage.com/cdeao-verso-j3AMJlJFyFcZMJ08SwvZ2YLV2O911e.jpg';

  return (
    <Card className="border border-primary/20 overflow-hidden shadow-2xl">
      {hiddenInputs}

      {/* Stepper */}
      <StepperBar currentStep={step} />

      <CardContent className="space-y-5">
        {cameraActive ? (
          <div className="space-y-4">
            <div className="relative aspect-[4/3] bg-black rounded-2xl overflow-hidden border-2 border-primary/30">
              <video
                ref={videoRef}
                autoPlay
                playsInline
                muted
                className="w-full h-full object-cover"
              />
              <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                <div className="w-[85%] h-[65%] border-2 border-dashed border-white/50 rounded-xl" />
              </div>
              <div className="absolute top-3 left-3 bg-black/60 text-white text-xs font-bold px-3 py-1.5 rounded-lg">
                {currentLabel}
              </div>
            </div>
            <div className="flex gap-3">
              <Button variant="outline" onClick={stopCamera} className="flex-1 h-12 rounded-xl border-2">
                <X className="h-4 w-4 mr-2" /> Annuler
              </Button>
              <Button onClick={capturePhoto} className="flex-[2] h-12 rounded-xl font-bold text-base">
                <Camera className="h-4 w-4 mr-2" /> Capturer
              </Button>
            </div>
          </div>
        ) : (
          <>
            <div className="text-center space-y-3">
              <div className={`inline-flex items-center gap-2 px-4 py-2 rounded-full text-sm font-bold ${step === 'front' ? 'bg-primary/10 text-primary' : 'bg-accent/10 text-accent-foreground'
                }`}>
                <ImageIcon className="h-4 w-4" />
                Étape {step === 'front' ? '1' : '2'} : {currentLabel}
              </div>
              <p className="text-muted-foreground text-sm">{currentDescription}</p>
            </div>

            {currentImage ? (
              <div className="relative animate-scale-in">
                <div className="aspect-[16/10] rounded-2xl overflow-hidden border-2 border-success/40 shadow-lg">
                  <img src={currentImage} alt={`${currentLabel} capture`} className="w-full h-full object-cover" />
                </div>
                <div className="absolute top-3 left-3 bg-success/90 text-white text-xs font-bold px-3 py-1.5 rounded-lg flex items-center gap-1">
                  <CheckCircle className="h-3 w-3" /> {currentLabel} capturé
                </div>
                <button
                  onClick={() => {
                    if (currentSide === 'front') setFrontImage(null);
                    else setBackImage(null);
                  }}
                  className="absolute top-3 right-3 bg-destructive/90 text-white p-1.5 rounded-lg hover:bg-destructive transition-colors"
                >
                  <RotateCcw className="h-3.5 w-3.5" />
                </button>
              </div>
            ) : (
              <div className="relative aspect-[16/10] rounded-2xl overflow-hidden border-2 border-dashed border-muted-foreground/20 bg-muted/30">
                <img
                  src={exampleUrl}
                  alt={`Exemple ${currentLabel}`}
                  className="w-full h-full object-cover opacity-30"
                  crossOrigin="anonymous"
                />
                <div className="absolute inset-0 flex flex-col items-center justify-center gap-2">
                  <CreditCard className="h-10 w-10 text-muted-foreground/40" />
                  <span className="text-sm font-bold text-muted-foreground/60">{currentLabel} de la CNI</span>
                </div>
              </div>
            )}

            {step === 'back' && frontImage && !currentImage && (
              <div className="flex items-center gap-3 p-3 rounded-xl bg-success/5 border border-success/20">
                <div className="w-16 h-11 rounded-lg overflow-hidden border border-success/30 flex-shrink-0">
                  <img src={frontImage} alt="Recto capture" className="w-full h-full object-cover" />
                </div>
                <div className="text-sm">
                  <span className="font-bold text-success">RECTO capturé</span>
                  <p className="text-muted-foreground text-xs">Capturez maintenant le verso</p>
                </div>
              </div>
            )}

            {!currentImage ? (
              <div className="grid gap-3">
                <Button size="lg" onClick={startCamera} className="h-14 rounded-2xl text-base font-bold gap-3">
                  <Camera className="h-5 w-5" /> Prendre en photo
                </Button>
                <div className="relative py-1">
                  <div className="absolute inset-0 flex items-center"><span className="w-full border-t border-muted-foreground/10" /></div>
                  <div className="relative flex justify-center text-xs uppercase">
                    <span className="bg-background px-4 text-muted-foreground font-bold">ou</span>
                  </div>
                </div>
                <Button
                  variant="outline"
                  size="lg"
                  className="h-12 rounded-xl border-2"
                  onClick={() => {
                    if (currentSide === 'front') frontFileRef.current?.click();
                    else backFileRef.current?.click();
                  }}
                >
                  <Upload className="h-4 w-4 mr-2" /> Importer depuis la galerie
                </Button>
              </div>
            ) : (
              <div className="grid gap-3">
                {step === 'front' ? (
                  <Button size="lg" className="h-14 rounded-2xl text-base font-bold gap-3" onClick={() => setStep('back')}>
                    Continuer vers le VERSO
                  </Button>
                ) : (
                  <Button
                    size="lg"
                    className="h-14 rounded-2xl text-base font-bold gap-3 bg-success hover:bg-success/90 shadow-md transition-all"
                    onClick={processImages}
                  >
                    <CreditCard className="h-5 w-5" /> Analyser la carte
                  </Button>
                )}
              </div>
            )}

            {(frontImage || backImage) && (
              <Button variant="ghost" className="w-full text-muted-foreground" onClick={handleReset}>
                <RotateCcw className="h-4 w-4 mr-2" /> Recommencer
              </Button>
            )}
          </>
        )}
      </CardContent>
    </Card>
  );
}
