import { useState, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { extractIDCardDataFromImages } from '@/lib/idCardOcr';
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
  const [ocrProgress, setOcrProgress] = useState<{ progress: number; status: string }>({
    progress: 0,
    status: ''
  });

  const performLocalOCR = useCallback(async (image: string): Promise<Partial<IDCardData> | null> => {
    setProcessing(true);
    setOcrProgress({ progress: 0, status: 'Analyse locale...' });
    try {
      const worker = await createWorker('fra+eng', 1, {
        logger: (message) => {
          if (message.status === 'recognizing text') {
            setOcrProgress({ progress: Math.floor(message.progress * 100), status: 'Analyse locale...' });
          }
        }
      });
      const { data: { text } } = await worker.recognize(image);
      await worker.terminate();

      const ninMatch = text.match(/\b\d{13,14}\b/);
      const lines = text.split('\n').map(line => line.trim()).filter(line => line.length > 2);
      const upperLines = lines.filter(line => line === line.toUpperCase() && !line.includes(':'));

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
      setOcrProgress({ progress: 0, status: '' });
    }
  }, []);

  const extractIDCardData = useCallback(async (frontImage: string, backImage: string): Promise<IDCardData | null> => {
    setProcessing(true);
    setOcrProgress({ progress: 0, status: 'Demarrage...' });
    try {
      const result = await extractIDCardDataFromImages(
        frontImage,
        backImage,
        (progress, status) => setOcrProgress({ progress, status })
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
      // 1. Validation des champs obligatoires
      if (!idCardData.firstName?.trim() || !idCardData.lastName?.trim() || !idCardData.idCardNumber?.trim()) {
        throw new Error('Les champs Nom, Prenom et Numero de CNI sont obligatoires.');
      }

      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('Non authentifie');

      const { data: guardian } = await supabase.from('guardians').select('site_id').eq('user_id', user.id).single();
      if (!guardian) throw new Error('Gardien non trouve');

      // 2. Generation du code de recu via RPC sécurisé
      const { data: receiptCodeData, error: rpcError } = await supabase.rpc('generate_receipt_code');
      
      if (rpcError || !receiptCodeData) {
        console.error('Erreur RPC generate_receipt_code:', rpcError);
        throw new Error('Erreur lors de la generation du code de recu.');
      }
      
      const receiptCode = receiptCodeData as string;
      const qrCodeData = JSON.stringify({ type: 'walk_in_receipt', code: receiptCode, timestamp: Date.now() });

      // Helper pour convertir DD/MM/YYYY -> YYYY-MM-DD
      const formatToISO = (dateStr: string | null) => {
        if (!dateStr) return null;
        // Si deja au format YYYY-MM-DD
        if (/^\d{4}-\d{2}-\d{2}$/.test(dateStr)) return dateStr;
        
        // Format attendu: DD/MM/YYYY
        const parts = dateStr.split('/');
        if (parts.length === 3) {
          return `${parts[2]}-${parts[1]}-${parts[0]}`;
        }
        return null; // ou retourner dateStr original et laisser la DB valider
      };

      const formattedBirthDate = formatToISO(idCardData.birthDate);
      const formattedExpiryDate = formatToISO(idCardData.expiryDate);

      const { data: visitor, error: visitorError } = await supabase
        .from('walk_in_visitors')
        .insert({
          site_id: guardian.site_id,
          first_name: idCardData.firstName.toUpperCase(),
          last_name: idCardData.lastName.toUpperCase(),
          id_card_number: idCardData.idCardNumber.toUpperCase().replace(/\s/g, ''), // Nettoyage espaces
          birth_date: formattedBirthDate,
          gender: idCardData.gender,
          nationality: idCardData.nationality || 'SEN',
          address: idCardData.address,
          id_card_expiry: formattedExpiryDate,
          scanned_by: user.id,
          receipt_code: receiptCode,
          receipt_qr_code: qrCodeData
        })
        .select('id, first_name, last_name, id_card_number')
        .single();

      if (visitorError) {
        console.error('Erreur insertion walk_in_visitor:', visitorError);
        // Gestion specifique des erreurs de contrainte
        if (visitorError.code === '23505') { // Unique violation
           throw new Error('Ce visiteur ou ce code existe deja.');
        }
        throw new Error(`Erreur base de donnees: ${visitorError.message}`);
      }

      await supabase.from('access_logs').insert({
        site_id: guardian.site_id,
        scanned_by: user.id,
        action_type: actionType,
        walk_in_visitor_id: visitor.id
      });

      const QRCodeLib = await import('qrcode');
      const qrCodeDataUrl = await QRCodeLib.default.toDataURL(qrCodeData, { width: 200, margin: 2 });

      toast.success('Entree enregistree');
      return { id: visitor.id, firstName: visitor.first_name, lastName: visitor.last_name, idCardNumber: visitor.id_card_number, receiptCode, qrCodeData, qrCodeDataUrl };
    } catch (error) {
      console.error('Erreur registerWalkInVisitor:', error);
      toast.error(error instanceof Error ? error.message : 'Erreur inconnue');
      return null;
    }
  }, []);

  const reset = useCallback(() => {
    setExtractedData(null);
    setScanning(false);
    setProcessing(false);
    setOcrProgress({ progress: 0, status: '' });
  }, []);

  return {
    scanning,
    setScanning,
    extractedData,
    setExtractedData,
    processing,
    ocrProgress,
    performLocalOCR,
    extractIDCardData,
    registerWalkInVisitor,
    reset
  };
}
