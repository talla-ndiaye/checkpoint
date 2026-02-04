import { useState, useRef, useCallback } from 'react';
import { Camera, Upload, User, CreditCard, Calendar, MapPin, LogIn, LogOut, CheckCircle, RotateCcw } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useIDCardScanner, IDCardData } from '@/hooks/useIDCardScanner';
import { format } from 'date-fns';
import { fr } from 'date-fns/locale';

interface IDCardScanPanelProps {
  onComplete?: () => void;
}

export function IDCardScanPanel({ onComplete }: IDCardScanPanelProps) {
  const { 
    extractedData, 
    setExtractedData,
    processing, 
    extractIDCardData, 
    registerWalkInVisitor,
    reset 
  } = useIDCardScanner();
  
  const [capturedImage, setCapturedImage] = useState<string | null>(null);
  const [registered, setRegistered] = useState(false);
  const [editableData, setEditableData] = useState<IDCardData | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [cameraActive, setCameraActive] = useState(false);
  const [stream, setStream] = useState<MediaStream | null>(null);

  const startCamera = async () => {
    try {
      const mediaStream = await navigator.mediaDevices.getUserMedia({ 
        video: { facingMode: 'environment', width: { ideal: 1280 }, height: { ideal: 720 } } 
      });
      if (videoRef.current) {
        videoRef.current.srcObject = mediaStream;
        setStream(mediaStream);
        setCameraActive(true);
      }
    } catch (error) {
      console.error('Error accessing camera:', error);
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
    // Extract base64 data without the data URL prefix
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

  const handleAccess = async (type: 'entry' | 'exit') => {
    if (!editableData) return;
    const result = await registerWalkInVisitor(editableData, type);
    if (result) {
      setRegistered(true);
    }
  };

  const handleReset = () => {
    reset();
    setCapturedImage(null);
    setEditableData(null);
    setRegistered(false);
    stopCamera();
    onComplete?.();
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
          {cameraActive ? (
            <div className="space-y-4">
              <div className="relative aspect-video bg-muted rounded-lg overflow-hidden">
                <video 
                  ref={videoRef} 
                  autoPlay 
                  playsInline 
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
              <div className="grid grid-cols-2 gap-3">
                <Button onClick={startCamera} variant="outline" className="h-24 flex-col gap-2">
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
              <Input
                id="lastName"
                value={editableData.lastName}
                onChange={(e) => handleFieldChange('lastName', e.target.value)}
                className="h-9"
              />
            </div>
            <div className="space-y-1">
              <Label htmlFor="firstName" className="text-xs">Prénom</Label>
              <Input
                id="firstName"
                value={editableData.firstName}
                onChange={(e) => handleFieldChange('firstName', e.target.value)}
                className="h-9"
              />
            </div>
          </div>

          <div className="space-y-1">
            <Label htmlFor="idCardNumber" className="text-xs flex items-center gap-1">
              <CreditCard className="h-3 w-3" />
              N° Carte d'identité
            </Label>
            <Input
              id="idCardNumber"
              value={editableData.idCardNumber}
              onChange={(e) => handleFieldChange('idCardNumber', e.target.value)}
              className="h-9 font-mono"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1">
              <Label htmlFor="birthDate" className="text-xs flex items-center gap-1">
                <Calendar className="h-3 w-3" />
                Date de naissance
              </Label>
              <Input
                id="birthDate"
                type="date"
                value={editableData.birthDate || ''}
                onChange={(e) => handleFieldChange('birthDate', e.target.value)}
                className="h-9"
              />
            </div>
            <div className="space-y-1">
              <Label htmlFor="gender" className="text-xs">Sexe</Label>
              <Input
                id="gender"
                value={editableData.gender || ''}
                onChange={(e) => handleFieldChange('gender', e.target.value)}
                className="h-9"
                placeholder="M/F"
              />
            </div>
          </div>

          <div className="space-y-1">
            <Label htmlFor="address" className="text-xs flex items-center gap-1">
              <MapPin className="h-3 w-3" />
              Adresse
            </Label>
            <Input
              id="address"
              value={editableData.address || ''}
              onChange={(e) => handleFieldChange('address', e.target.value)}
              className="h-9"
            />
          </div>

          {/* Action Buttons */}
          <div className="grid grid-cols-2 gap-3 pt-2">
            <Button
              size="lg"
              className="h-16 text-base gap-2 bg-green-600 hover:bg-green-700"
              onClick={() => handleAccess('entry')}
            >
              <LogIn className="h-5 w-5" />
              Entrée
            </Button>
            <Button
              size="lg"
              className="h-16 text-base gap-2 bg-orange-600 hover:bg-orange-700"
              onClick={() => handleAccess('exit')}
            >
              <LogOut className="h-5 w-5" />
              Sortie
            </Button>
          </div>

          <Button variant="ghost" className="w-full" onClick={handleReset}>
            <RotateCcw className="h-4 w-4 mr-2" />
            Annuler et recommencer
          </Button>
        </CardContent>
      </Card>
    );
  }

  // Success view
  if (registered && editableData) {
    return (
      <Card className="border-2 border-green-500 bg-green-50 dark:bg-green-950/20">
        <CardContent className="p-6">
          <div className="text-center space-y-4">
            <div className="flex items-center justify-center gap-2 text-green-600">
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
              <div className="pt-2">
                <span className="font-mono text-sm bg-muted px-3 py-1 rounded">
                  CNI: {editableData.idCardNumber}
                </span>
              </div>
            </div>
          </div>
        </CardContent>

        <div className="p-4 pt-0">
          <Button size="lg" className="w-full h-14 text-lg" onClick={handleReset}>
            Nouveau scan
          </Button>
        </div>
      </Card>
    );
  }

  return null;
}
