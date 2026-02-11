import { useState, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { createWorker } from 'tesseract.js';

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
 */
export function parseBarcodeData(raw: string): Partial<IDCardData> | null {
  try {
    console.log('Parsing raw barcode data:', raw);
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
    if (raw.length > 30 && (raw.includes('<<') || raw.startsWith('ID'))) {
      const ninMatch = raw.match(/IDSEN(\d+)/);
      if (ninMatch) return { idCardNumber: ninMatch[1] };
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
  const [ocrProgress, setOcrProgress] = useState(0);

  /**
   * Perfrom Local OCR using Tesseract.js
   */
  const performLocalOCR = useCallback(async (image: string): Promise<Partial<IDCardData> | null> => {
    setProcessing(true);
    setOcrProgress(0);
    try {
      console.log('Starting local OCR with Tesseract...');
      const worker = await createWorker('fra+eng', 1, {
        logger: m => {
          if (m.status === 'recognizing text') {
            setOcrProgress(Math.floor(m.progress * 100));
          }
        },
      });
      const { data: { text } } = await worker.recognize(image);
      console.log('OCR result text:', text);
      await worker.terminate();

      // Extract NIN (Senegal ID numbers are 13 or 14 digits)
      const ninMatch = text.match(/\b\d{13,14}\b/);

      // Basic extraction logic: looking for lines that look like a name
      // This is hit-over-miss, but usually names are in uppercase
      const lines = text.split('\n').map(l => l.trim()).filter(l => l.length > 2);

      // Heuristique: Le nom est souvent sur une ligne en majuscules
      const upperLines = lines.filter(l => l === l.toUpperCase() && !l.includes(':'));

      return {
        idCardNumber: ninMatch ? ninMatch[0] : '',
        lastName: upperLines[0] || '',
        firstName: upperLines[1] || '',
        nationality: 'SEN'
      };
    } catch (error) {
      console.error('OCR Error:', error);
      toast.error('Erreur lors de l\'analyse locale de l\'image');
      return null;
    } finally {
      setProcessing(false);
    }
  }, []);

  const extractIDCardData = useCallback(async (frontImage: string, backImage: string): Promise<IDCardData | null> => {
    // Falls back to AI if local OCR is not enough
    setProcessing(true);
    try {
      const { data, error } = await supabase.functions.invoke('scan-id-card', {
        body: {
          frontImageBase64: frontImage.replace(/^data:image\/\w+;base64,/, ''),
          backImageBase64: backImage.replace(/^data:image\/\w+;base64,/, '')
        }
      });

      if (error || !data?.success) throw new Error(data?.error || 'AI Failed');

      const idCardData = data.data as IDCardData;
      setExtractedData(idCardData);
      return idCardData;
    } catch (error) {
      console.error('AI Extraction error:', error);
      return null;
    } finally {
      setProcessing(false);
    }
  }, []);

  const registerWalkInVisitor = useCallback(async (
    idCardData: IDCardData,
    actionType: 'entry' | 'exit'
  ): Promise<WalkInVisitorResult | null> => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('Non authentifié');

      const { data: guardian } = await supabase.from('guardians').select('site_id').eq('user_id', user.id).single();
      if (!guardian) throw new Error('Gardien non trouvé');

      const { data: receiptCodeData } = await supabase.rpc('generate_receipt_code');
      const receiptCode = receiptCodeData as string;
      const qrCodeData = JSON.stringify({ type: 'walk_in_receipt', code: receiptCode, timestamp: Date.now() });

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
        .select('id, first_name, last_name, id_card_number').single();

      if (visitorError) throw new Error('Erreur base de données');

      await supabase.from('access_logs').insert({
        site_id: guardian.site_id,
        scanned_by: user.id,
        action_type: actionType,
        walk_in_visitor_id: visitor.id
      });

      const QRCodeLib = await import('qrcode');
      const qrCodeDataUrl = await QRCodeLib.default.toDataURL(qrCodeData, { width: 200, margin: 2 });

      toast.success('Entrée enregistrée');
      return { id: visitor.id, firstName: visitor.first_name, lastName: visitor.last_name, idCardNumber: visitor.id_card_number, receiptCode, qrCodeData, qrCodeDataUrl };
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Erreur');
      return null;
    }
  }, []);

  return { scanning, setScanning, extractedData, setExtractedData, processing, ocrProgress, performLocalOCR, extractIDCardData, registerWalkInVisitor, reset: () => setExtractedData(null) };
}
