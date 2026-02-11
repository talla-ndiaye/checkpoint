import Tesseract from 'tesseract.js';

export interface ExtractedIDData {
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
 * Parse a TD1 MRZ (3 lines, 30 chars each) from a Senegalese ID card.
 *
 * Line 1: I<SEN101200109<200007300<<<<<<
 *   - Pos 0:    Document type (I)
 *   - Pos 2-4:  Country code (SEN)
 *   - Pos 5-14: Document number (up to first <)
 *   - (rest)    Optional data / NIN fragments
 *
 * Line 2: 0109202M3008258SEN<<<<<<<<<<<<6
 *   - Pos 0-5:  Birth date YYMMDD
 *   - Pos 6:    Check digit
 *   - Pos 7:    Sex (M/F)
 *   - Pos 8-13: Expiry date YYMMDD
 *   - Pos 14:   Check digit
 *   - Pos 15-17: Nationality (SEN)
 *
 * Line 3: NDIAYE<<TALLA<<<<<<<<<<<<<<<<<
 *   - SURNAME<<GIVEN_NAMES
 */
function parseTD1MRZ(lines: string[]): ExtractedIDData | null {
  if (lines.length < 3) return null;

  const line1 = lines[0].replace(/\s/g, '');
  const line2 = lines[1].replace(/\s/g, '');
  const line3 = lines[2].replace(/\s/g, '');

  // Validate minimum length
  if (line1.length < 20 || line2.length < 15 || line3.length < 5) return null;

  // Line 1 - document number: everything between country code and first filler
  const docNumberRaw = line1.substring(5);
  const docNumber = docNumberRaw.split('<')[0].replace(/[^A-Z0-9]/g, '');

  // Line 2 - dates and gender
  const birthRaw = line2.substring(0, 6);
  const gender = line2.charAt(7);
  const expiryRaw = line2.substring(8, 14);

  const formatDate = (yymmdd: string): string | null => {
    if (!/^\d{6}$/.test(yymmdd)) return null;
    const yy = parseInt(yymmdd.substring(0, 2));
    const mm = yymmdd.substring(2, 4);
    const dd = yymmdd.substring(4, 6);
    // Assume 2000+ for years < 50, 1900+ otherwise
    const year = yy < 50 ? 2000 + yy : 1900 + yy;
    return `${dd}/${mm}/${year}`;
  };

  // Line 3 - names
  const nameParts = line3.replace(/<+$/, '').split('<<');
  const lastName = (nameParts[0] || '').replace(/</g, ' ').trim();
  const firstName = (nameParts[1] || '').replace(/</g, ' ').trim();

  // NIN extraction: try to find it in line 1 optional data or combine
  // For CEDEAO: doc number portion often contains the full ID number
  // E.g. "101200109<200007300" -> "1 01 2001 0920 00073 0"
  const optionalRaw = line1.substring(5).replace(/</g, ' ').trim();

  return {
    firstName: firstName || '',
    lastName: lastName || '',
    idCardNumber: docNumber || optionalRaw.replace(/\s/g, ''),
    birthDate: formatDate(birthRaw),
    gender: gender === 'M' || gender === 'F' ? gender : null,
    nationality: 'SEN',
    address: null,
    expiryDate: formatDate(expiryRaw),
  };
}

/**
 * Try to find and parse MRZ lines from OCR text.
 * MRZ lines contain primarily uppercase letters, digits, and '<' characters.
 */
function findMRZLines(ocrText: string): string[] | null {
  const allLines = ocrText.split('\n').map(l => l.trim()).filter(l => l.length > 0);

  // MRZ lines are characterized by having many '<' characters
  const mrzCandidates = allLines.filter(line => {
    const cleaned = line.replace(/\s/g, '');
    // Must have at least some '<' chars and be ~30 chars for TD1
    return cleaned.includes('<') && cleaned.length >= 20;
  });

  if (mrzCandidates.length >= 3) {
    return mrzCandidates.slice(0, 3);
  }

  // Fallback: look for lines that are mostly alphanumeric + '<'
  const mrzLike = allLines.filter(line => {
    const cleaned = line.replace(/\s/g, '');
    if (cleaned.length < 20) return false;
    const mrzChars = cleaned.replace(/[^A-Z0-9<]/gi, '');
    return mrzChars.length / cleaned.length > 0.8;
  });

  if (mrzLike.length >= 3) {
    return mrzLike.slice(0, 3);
  }

  return null;
}

/**
 * Parse the OCR text from the front (recto) of a Senegalese ID card.
 * Looks for labeled fields like "Prénoms", "Nom", "Date de naissance", etc.
 */
function parseRectoOCR(ocrText: string): Partial<ExtractedIDData> {
  const result: Partial<ExtractedIDData> = {};
  const lines = ocrText.split('\n').map(l => l.trim()).filter(l => l.length > 0);
  const text = lines.join('\n');

  // Helper: find value after a label (on same line or next line)
  const findFieldValue = (patterns: RegExp[]): string | null => {
    for (const pattern of patterns) {
      for (let i = 0; i < lines.length; i++) {
        const match = lines[i].match(pattern);
        if (match && match[1]?.trim()) {
          return match[1].trim();
        }
        // If label found but no value on same line, check next line
        if (lines[i].match(new RegExp(pattern.source.split('(')[0], 'i')) && i + 1 < lines.length) {
          const nextLine = lines[i + 1].trim();
          if (nextLine && !nextLine.match(/^(pr[eé]noms?|nom|date|sexe|taille|lieu|centre|adresse|n[°o])/i)) {
            return nextLine;
          }
        }
      }
    }
    return null;
  };

  // First name (Prénoms)
  const firstName = findFieldValue([
    /pr[eé]noms?\s*[:\-]?\s*(.+)/i,
    /pr[eé]noms?\s*$/i,
  ]);
  if (firstName) result.firstName = firstName.toUpperCase();

  // Last name (Nom)
  const lastName = findFieldValue([
    /^nom\s*[:\-]?\s*(.+)/i,
    /^nom\s*$/i,
  ]);
  if (lastName) result.lastName = lastName.toUpperCase();

  // Date of birth
  const birthDate = findFieldValue([
    /date\s*de\s*naissance\s*[:\-]?\s*(\d{2}[\/.]\d{2}[\/.]\d{4})/i,
    /naissance\s*[:\-]?\s*(\d{2}[\/.]\d{2}[\/.]\d{4})/i,
  ]);
  if (birthDate) result.birthDate = birthDate.replace(/\./g, '/');

  // Gender
  const genderMatch = text.match(/sexe\s*[:\-]?\s*([MF])/i);
  if (genderMatch) result.gender = genderMatch[1].toUpperCase();

  // Address
  const address = findFieldValue([
    /adresse(?:\s*du\s*domicile)?\s*[:\-]?\s*(.+)/i,
    /adresse\s*$/i,
  ]);
  if (address) result.address = address;

  // ID Number / NIN
  const ninPatterns = [
    /n[°o]\s*(?:de la carte|d['']?identit[eé]|identification\s*nationale)\s*[:\-]?\s*([\d\s]+)/i,
    /identification\s*nationale\s*[:\-]?\s*([\d\s]+)/i,
    /n[°o]\s*de la carte d['']?identit[eé]\s*[:\-]?\s*([\d\s]+)/i,
  ];
  for (const p of ninPatterns) {
    const m = text.match(p);
    if (m && m[1]?.trim()) {
      result.idCardNumber = m[1].replace(/\s+/g, ' ').trim();
      break;
    }
  }

  // Expiry date
  const expiryMatch = text.match(/(?:date\s*d['']?expiration|expiration)\s*[:\-]?\s*(\d{2}[\/.]\d{2}[\/.]\d{4})/i);
  if (expiryMatch) result.expiryDate = expiryMatch[1].replace(/\./g, '/');

  // Delivery date-based expiry (for old format: délivrance -> +10 years)
  if (!result.expiryDate) {
    const deliveryMatch = text.match(/d[eé]livrance\s*[:\-]?\s*(\d{2}[\/.]\d{2}[\/.]\d{4})/i);
    // Don't auto-calculate, just leave null
    if (!deliveryMatch) result.expiryDate = null;
  }

  return result;
}

/**
 * Main extraction function: runs Tesseract OCR on both images,
 * parses MRZ from verso, and field labels from recto.
 * Merges results with MRZ taking priority for structured fields.
 */
export async function extractIDCardDataFromImages(
  frontImageDataUrl: string,
  backImageDataUrl: string,
  onProgress?: (progress: number, status: string) => void
): Promise<ExtractedIDData> {
  onProgress?.(5, 'Initialisation du moteur OCR...');

  // Run OCR on both images in parallel
  const [frontResult, backResult] = await Promise.all([
    Tesseract.recognize(frontImageDataUrl, 'fra', {
      logger: (m) => {
        if (m.status === 'recognizing text') {
          onProgress?.(10 + Math.round((m.progress || 0) * 40), 'Lecture du recto...');
        }
      }
    }),
    Tesseract.recognize(backImageDataUrl, 'fra', {
      logger: (m) => {
        if (m.status === 'recognizing text') {
          onProgress?.(50 + Math.round((m.progress || 0) * 40), 'Lecture du verso...');
        }
      }
    })
  ]);

  onProgress?.(92, 'Extraction des informations...');

  const frontText = frontResult.data.text;
  const backText = backResult.data.text;

  console.log('[v0] Front OCR text:', frontText);
  console.log('[v0] Back OCR text:', backText);

  // Try MRZ parsing from back image
  const mrzLines = findMRZLines(backText);
  let mrzData: ExtractedIDData | null = null;
  if (mrzLines) {
    console.log('[v0] MRZ lines found:', mrzLines);
    mrzData = parseTD1MRZ(mrzLines);
    console.log('[v0] MRZ parsed data:', mrzData);
  }

  // Parse recto OCR for labeled fields
  const rectoData = parseRectoOCR(frontText);
  console.log('[v0] Recto parsed data:', rectoData);

  onProgress?.(100, 'Termine !');

  // Merge: MRZ is more reliable for structured fields, recto for address
  const merged: ExtractedIDData = {
    firstName: mrzData?.firstName || rectoData.firstName || '',
    lastName: mrzData?.lastName || rectoData.lastName || '',
    idCardNumber: rectoData.idCardNumber || mrzData?.idCardNumber || '',
    birthDate: mrzData?.birthDate || rectoData.birthDate || null,
    gender: mrzData?.gender || rectoData.gender || null,
    nationality: mrzData?.nationality || 'SEN',
    address: rectoData.address || null,
    expiryDate: rectoData.expiryDate || mrzData?.expiryDate || null,
  };

  return merged;
}
