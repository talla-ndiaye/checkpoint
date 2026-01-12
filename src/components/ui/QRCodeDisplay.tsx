import { useEffect, useState } from 'react';
import QRCode from 'qrcode';

interface QRCodeDisplayProps {
  data: string;
  size?: number;
  className?: string;
}

export function QRCodeDisplay({ data, size = 200, className = '' }: QRCodeDisplayProps) {
  const [qrDataUrl, setQrDataUrl] = useState<string>('');
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const generateQR = async () => {
      try {
        const url = await QRCode.toDataURL(data, {
          width: size,
          margin: 2,
          color: {
            dark: '#000000',
            light: '#FFFFFF',
          },
          errorCorrectionLevel: 'M',
        });
        setQrDataUrl(url);
        setError(null);
      } catch (err) {
        console.error('Error generating QR code:', err);
        setError('Erreur lors de la génération du QR code');
      }
    };

    if (data) {
      generateQR();
    }
  }, [data, size]);

  if (error) {
    return (
      <div className={`flex items-center justify-center bg-muted rounded-lg ${className}`} style={{ width: size, height: size }}>
        <span className="text-sm text-muted-foreground text-center px-2">{error}</span>
      </div>
    );
  }

  if (!qrDataUrl) {
    return (
      <div className={`flex items-center justify-center bg-muted rounded-lg animate-pulse ${className}`} style={{ width: size, height: size }}>
        <span className="text-sm text-muted-foreground">Chargement...</span>
      </div>
    );
  }

  return (
    <img
      src={qrDataUrl}
      alt="QR Code"
      width={size}
      height={size}
      className={`rounded-lg ${className}`}
    />
  );
}
