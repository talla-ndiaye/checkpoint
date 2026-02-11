import { useState, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { extractIDCardDataFromImages } from '@/lib/idCardOcr';

export interface IDCardData {
  firstName: string;
  lastName: string;
  idCardNumber: string;
  birthDate: string | null;
  gender: string | null;
  nationality: string;
  address: string | null;
  expiryDate: string | null;
}

/**
 * Parses the raw data from a Senegal ID PDF417 barcode
 * Usually formatted as: NIN|PRENOM|NOM|DATE_NAISSANCE|SEXE|...
 */
export function parseBarcodeData(raw: string): Partial<IDCardData> | null {
  try {
    console.log('Parsing raw barcode data:', raw);

    // Pattern 1: Pipes (Common for direct encoding)
    // NIN|NOM|PRENOM|DATE_NAISSANCE|SEXE
    if (raw.includes('|')) {
      const parts = raw.split('|');
      return {
        idCardNumber: parts[0]?.trim(),
        lastName: parts[1]?.trim(),
        firstName: parts[2]?.trim(),
        birthDate: parts[3]?.trim(),
        gender: parts[4]?.trim()?.substring(0, 1),
      };
    }

    // Pattern 2: MRZ (Machine Readable Zone)
    // Example: IDSEN1234567890<<<<<<<<<<<<<<
    if (raw.length > 30 && (raw.includes('<<') || raw.startsWith('ID'))) {
      // Very basic extraction of NIN for CEDEAO cards
      const ninMatch = raw.match(/IDSEN(\d+)/);
      if (ninMatch) {
        return { idCardNumber: ninMatch[1] };
      }
    }

    return null;
  } catch (e) {
    console.error('Error parsing barcode data:', e);
    return null;
  }
}

export interface WalkInVisitorResult {
  id: string;
  firstName: string;
  lastName: string;
  idCardNumber: string;
  receiptCode: string;
  qrCodeData: string;
  qrCodeDataUrl: string;
}

export function useIDCardScanner() {
  const [scanning, setScanning] = useState(false);
  const [extractedData, setExtractedData] = useState<IDCardData | null>(null);
  const [processing, setProcessing] = useState(false);

  const [ocrProgress, setOcrProgress] = useState<{ progress: number; status: string }>({ progress: 0, status: '' });

  const extractIDCardData = useCallback(async (frontImage: string, backImage: string): Promise<IDCardData | null> => {
    setProcessing(true);
    setOcrProgress({ progress: 0, status: 'Demarrage...' });
    try {
      const result = await extractIDCardDataFromImages(
        frontImage,
        backImage,
        (progress, status) => {
          setOcrProgress({ progress, status });
        }
      );

      if (!result.firstName && !result.lastName && !result.idCardNumber) {
        toast.error('Impossible d\'extraire les informations. Verifiez la qualite des images.');
        return null;
      }

      const idCardData: IDCardData = result;
      setExtractedData(idCardData);
      toast.success('Informations extraites avec succes !');
      return idCardData;
    } catch (error) {
      console.error('Error extracting ID card data:', error);
      toast.error('Erreur lors de l\'extraction des donnees. Reessayez avec des images plus nettes.');
      return null;
    } finally {
      setProcessing(false);
      setOcrProgress({ progress: 0, status: '' });
    }
  }, []);

  const registerWalkInVisitor = useCallback(async (
    idCardData: IDCardData,
    actionType: 'entry' | 'exit'
  ): Promise<WalkInVisitorResult | null> => {
    try {
      // Get guardian's site
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('Non authentifié');

      const { data: guardian, error: guardianError } = await supabase
        .from('guardians')
        .select('site_id')
        .eq('user_id', user.id)
        .single();

      if (guardianError || !guardian) {
        throw new Error('Gardien non trouvé');
      }

      // Create walk-in visitor record
      // Generate receipt code
      const { data: receiptCodeData, error: receiptCodeError } = await supabase.rpc('generate_receipt_code');
      if (receiptCodeError) {
        console.error('Error generating receipt code:', receiptCodeError);
        throw new Error('Erreur lors de la génération du code de reçu');
      }

      const receiptCode = receiptCodeData as string;
      const qrCodeData = JSON.stringify({
        type: 'walk_in_receipt',
        code: receiptCode,
        timestamp: Date.now()
      });

      const { data: visitor, error: visitorError } = await supabase
        .from('walk_in_visitors')
        .insert({
          site_id: guardian.site_id,
          first_name: idCardData.firstName,
          last_name: idCardData.lastName,
          id_card_number: idCardData.idCardNumber,
          birth_date: idCardData.birthDate,
          gender: idCardData.gender,
          nationality: idCardData.nationality || 'SEN',
          address: idCardData.address,
          id_card_expiry: idCardData.expiryDate,
          scanned_by: user.id,
          receipt_code: receiptCode,
          receipt_qr_code: qrCodeData
        })
        .select('id, first_name, last_name, id_card_number')
        .single();

      if (visitorError) {
        console.error('Error creating walk-in visitor:', visitorError);
        throw new Error('Erreur lors de l\'enregistrement du visiteur');
      }

      // Record access log
      const { error: accessError } = await supabase
        .from('access_logs')
        .insert({
          site_id: guardian.site_id,
          scanned_by: user.id,
          action_type: actionType,
          walk_in_visitor_id: visitor.id
        });

      if (accessError) {
        console.error('Error recording access:', accessError);
        throw new Error('Erreur lors de l\'enregistrement de l\'accès');
      }

      toast.success(`${actionType === 'entry' ? 'Entrée' : 'Sortie'} enregistrée pour ${visitor.first_name} ${visitor.last_name}`);

      // Generate QR code data URL for display/printing
      const QRCodeLib = await import('qrcode');
      const qrCodeDataUrl = await QRCodeLib.default.toDataURL(qrCodeData, {
        width: 200,
        margin: 2,
        errorCorrectionLevel: 'M'
      });

      return {
        id: visitor.id,
        firstName: visitor.first_name,
        lastName: visitor.last_name,
        idCardNumber: visitor.id_card_number,
        receiptCode,
        qrCodeData,
        qrCodeDataUrl
      };
    } catch (error) {
      console.error('Error registering walk-in visitor:', error);
      toast.error(error instanceof Error ? error.message : 'Erreur lors de l\'enregistrement');
      return null;
    }
  }, []);

  const reset = useCallback(() => {
    setExtractedData(null);
    setScanning(false);
    setProcessing(false);
  }, []);

  return {
    scanning,
    setScanning,
    extractedData,
    setExtractedData,
    processing,
    ocrProgress,
    extractIDCardData,
    registerWalkInVisitor,
    reset
  };
}
