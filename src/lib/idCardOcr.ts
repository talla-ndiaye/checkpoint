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
 * Example CEDEAO card verso:
 * Line 1: I<SEN101200109<200007300<<<<<<
 * Line 2: 0109202M3008258SEN<<<<<<<<<<<<6
 * Line 3: NDIAYE<<TALLA<<<<<<<<<<<<<<<<<
 *
 * Line 2 breakdown:
 *   - Pos 0-5:  Birth date YYMMDD (010920 = 20/09/2001)
 *   - Pos 6:    Check digit
 *   - Pos 7:    Sex (M/F)
 *   - Pos 8-13: Expiry date YYMMDD (300825 = 25/08/2030)
 *   - Pos 14:   Check digit
 *   - Pos 15-17: Nationality (SEN)
 *
 * Line 3: SURNAME<<GIVEN_NAMES
 */
function parseTD1MRZ(lines: string[]): ExtractedIDData | null {
  if (lines.length < 3) return null;

  // Clean MRZ lines: normalize common OCR errors in MRZ context
  const cleanMRZ = (line: string): string => {
    return line
      .replace(/\s/g, '')
      .replace(/[{}[\]()]/g, '<')
      .replace(/[|!lI]/g, '1')  // Common OCR confusion in number context
      .toUpperCase();
  };

  const line1 = cleanMRZ(lines[0]);
  const line2 = cleanMRZ(lines[1]);
  const line3 = cleanMRZ(lines[2]);

  console.log('[v0] MRZ cleaned line1:', line1);
  console.log('[v0] MRZ cleaned line2:', line2);
  console.log('[v0] MRZ cleaned line3:', line3);

  // Validate minimum lengths
  if (line1.length < 20 || line2.length < 15 || line3.length < 5) return null;

  // Line 2 - dates and gender
  // Find the gender character (M or F) - it's at position 7
  const birthRaw = line2.substring(0, 6);
  const gender = line2.charAt(7);
  const expiryRaw = line2.substring(8, 14);

  const formatDate = (yymmdd: string): string | null => {
    if (!/^\d{6}$/.test(yymmdd)) return null;
    const yy = parseInt(yymmdd.substring(0, 2));
    const mm = yymmdd.substring(2, 4);
    const dd = yymmdd.substring(4, 6);
    const year = yy < 50 ? 2000 + yy : 1900 + yy;
    return `${dd}/${mm}/${year}`;
  };

  // Line 3 - names: SURNAME<<GIVEN_NAMES
  const nameParts = line3.replace(/<+$/, '').split('<<');
  const lastName = (nameParts[0] || '').replace(/</g, ' ').trim();
  const firstName = (nameParts.slice(1).join(' ') || '').replace(/</g, ' ').trim();

  return {
    firstName: firstName || '',
    lastName: lastName || '',
    idCardNumber: '', // Will be filled from recto or NIN parsing
    birthDate: formatDate(birthRaw),
    gender: gender === 'M' || gender === 'F' ? gender : null,
    nationality: 'SEN',
    address: null,
    expiryDate: formatDate(expiryRaw),
  };
}

/**
 * Try to find MRZ lines from OCR text.
 * MRZ lines contain uppercase letters, digits, and '<' characters.
 */
function findMRZLines(ocrText: string): string[] | null {
  const allLines = ocrText.split('\n').map(l => l.trim()).filter(l => l.length > 0);

  // MRZ lines are characterized by having '<' characters
  const mrzCandidates = allLines.filter(line => {
    const cleaned = line.replace(/\s/g, '');
    return cleaned.includes('<') && cleaned.length >= 20;
  });

  if (mrzCandidates.length >= 3) {
    return mrzCandidates.slice(-3); // Take last 3 (MRZ is at bottom)
  }

  // Fallback: look for lines that are mostly alphanumeric + '<'
  const mrzLike = allLines.filter(line => {
    const cleaned = line.replace(/\s/g, '');
    if (cleaned.length < 20) return false;
    const mrzChars = cleaned.replace(/[^A-Z0-9<]/gi, '');
    return mrzChars.length / cleaned.length > 0.7;
  });

  if (mrzLike.length >= 3) {
    return mrzLike.slice(-3);
  }

  return null;
}

/**
 * Extract NIN (Numero d'Identification Nationale) from verso OCR text.
 * The NIN appears on the verso as "NIN  1 752 2001 01604"
 */
function extractNINFromVerso(ocrText: string): string | null {
  const lines = ocrText.split('\n').map(l => l.trim()).filter(l => l.length > 0);

  // Look for NIN label followed by number
  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];
    // Match "NIN" followed by digits with spaces
    const ninMatch = line.match(/NIN\s+([\d\s]+)/i);
    if (ninMatch && ninMatch[1]) {
      const nin = ninMatch[1].replace(/\s+/g, ' ').trim();
      if (nin.length >= 5) return nin;
    }
  }

  return null;
}

/**
 * Parse the OCR text from the front (recto) of a Senegalese ID card.
 * Handles both CEDEAO and old CNI formats.
 *
 * CEDEAO recto fields:
 *   N de la carte d'identite: 1 01 2001 0920 00073 0
 *   Prenoms: TALLA
 *   Nom: NDIAYE
 *   Date de naissance: 20/09/2001
 *   Sexe: M   Taille: 180 cm
 *   Lieu de naissance: DAKAR
 *   Date de delivrance: 26/08/2020   Date d'expiration: 25/08/2030
 *   Adresse du domicile: S/51 HAMO 3 GUEDIAWAYE
 *
 * Old CNI recto fields:
 *   Prenoms: TALLA
 *   Nom: NDIAYE
 *   Date de naissance: 20/09/2001
 *   N d'Identification Nationale: 1 752 2001 01604
 *   Adresse: 551 HAMO 3 GUEDIAWAYE
 */
function parseRectoOCR(ocrText: string): Partial<ExtractedIDData> {
  const result: Partial<ExtractedIDData> = {};
  const lines = ocrText.split('\n').map(l => l.trim()).filter(l => l.length > 0);

  console.log('[v0] Recto OCR lines:', lines);

  // Helper: given a label, find the VALUE on same line after label or on the next line
  const findValue = (labelRegex: RegExp): string | null => {
    for (let i = 0; i < lines.length; i++) {
      const match = lines[i].match(labelRegex);
      if (match) {
        // Check if value is captured in the regex group
        if (match[1] && match[1].trim().length > 0) {
          return match[1].trim();
        }
        // Otherwise check next line
        if (i + 1 < lines.length) {
          const nextLine = lines[i + 1].trim();
          // Skip if next line is another label
          if (nextLine.length > 0 && !isLabel(nextLine)) {
            return nextLine;
          }
        }
      }
    }
    return null;
  };

  // Check if a line looks like a label (starts with known field names)
  const isLabel = (line: string): boolean => {
    return /^(pr[eé]noms?|nom|date|sexe|taille|lieu|centre|adresse|n[°o\s]|code|carte)/i.test(line);
  };

  // --- First Name (Prenoms) ---
  const firstName = findValue(/pr[eé]noms?\s*[:;,.\-]?\s*(.*)$/i);
  if (firstName && firstName.length > 0 && !isLabel(firstName)) {
    result.firstName = firstName.replace(/[^A-Za-zÀ-ÿ\s\-]/g, '').trim().toUpperCase();
  }

  // --- Last Name (Nom) ---
  // Be careful: "Nom" can appear in "Prenoms et nom de la mere" (verso old format)
  // On recto, it appears as just "Nom" on its own line
  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];
    // Match "Nom" that is NOT part of "Prenoms et nom" or "nom de la"
    if (/^nom\s*$/i.test(line) || /^nom\s*[:;,.\-]\s*$/i.test(line)) {
      // Value is on next line
      if (i + 1 < lines.length && !isLabel(lines[i + 1])) {
        result.lastName = lines[i + 1].replace(/[^A-Za-zÀ-ÿ\s\-]/g, '').trim().toUpperCase();
      }
      break;
    }
    const nomMatch = line.match(/^nom\s*[:;,.\-]\s*(.+)$/i);
    if (nomMatch && !/pr[eé]nom/i.test(line) && !/m[eè]re/i.test(line)) {
      result.lastName = nomMatch[1].replace(/[^A-Za-zÀ-ÿ\s\-]/g, '').trim().toUpperCase();
      break;
    }
  }

  // --- Date of Birth ---
  // Look for date pattern DD/MM/YYYY near "naissance"
  const birthMatch = ocrText.match(/(?:date\s*de\s*)?naissance[^0-9]*(\d{1,2}[\/.\-]\d{1,2}[\/.\-]\d{2,4})/i);
  if (birthMatch) {
    result.birthDate = birthMatch[1].replace(/[.\-]/g, '/');
  }

  // --- Gender ---
  const genderMatch = ocrText.match(/sexe\s*[:;,.\-]?\s*([MFmf])/i);
  if (genderMatch) {
    result.gender = genderMatch[1].toUpperCase();
  }

  // --- ID Card Number / NIN ---
  // CEDEAO format: "N° de la carte d'identité" followed by number string
  // Old CNI format: "N° d'Identification Nationale" or just the number at bottom
  const idPatterns = [
    // CEDEAO: N de la carte d'identite
    /n[°o\s]*\s*de\s*la\s*carte\s*d['']?identit[eé]\s*[:;,.\-]?\s*([\d\s]+)/i,
    // Old CNI: N d'Identification Nationale
    /n[°o\s]*\s*d['']?identification\s*nationale\s*[:;,.\-]?\s*([\d\s]+)/i,
    /identification\s*nationale\s*[:;,.\-]?\s*([\d\s]+)/i,
  ];

  for (const pattern of idPatterns) {
    const match = ocrText.match(pattern);
    if (match && match[1]?.trim()) {
      result.idCardNumber = match[1].replace(/\s+/g, ' ').trim();
      break;
    }
  }

  // --- Expiry Date ---
  const expiryMatch = ocrText.match(/(?:date\s*d['']?)?expiration[^0-9]*(\d{1,2}[\/.\-]\d{1,2}[\/.\-]\d{2,4})/i);
  if (expiryMatch) {
    result.expiryDate = expiryMatch[1].replace(/[.\-]/g, '/');
  }

  // --- Address ---
  const addressValue = findValue(/adresse(?:\s*du\s*domicile)?\s*[:;,.\-]?\s*(.*)$/i);
  if (addressValue && addressValue.length > 2 && !isLabel(addressValue)) {
    result.address = addressValue.toUpperCase();
  }

  return result;
}

/**
 * Main extraction: runs Tesseract OCR on both images, parses MRZ from verso
 * and labeled fields from recto. Merges results.
 *
 * Strategy:
 * - MRZ (verso) is most reliable for: firstName, lastName, birthDate, gender, expiryDate
 * - Recto OCR is best for: idCardNumber (NIN / N de la carte), address
 * - NIN on verso (if present) is used as fallback for idCardNumber
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

  console.log('[v0] ===== FRONT OCR TEXT =====');
  console.log('[v0]', frontText);
  console.log('[v0] ===== BACK OCR TEXT =====');
  console.log('[v0]', backText);

  // --- Parse MRZ from back ---
  const mrzLines = findMRZLines(backText);
  let mrzData: ExtractedIDData | null = null;
  if (mrzLines) {
    console.log('[v0] MRZ lines detected:', mrzLines);
    mrzData = parseTD1MRZ(mrzLines);
    console.log('[v0] MRZ parsed:', mrzData);
  } else {
    console.log('[v0] No MRZ lines found in verso');
  }

  // --- Extract NIN from verso ---
  const versoNIN = extractNINFromVerso(backText);
  console.log('[v0] Verso NIN:', versoNIN);

  // --- Parse recto ---
  const rectoData = parseRectoOCR(frontText);
  console.log('[v0] Recto parsed:', rectoData);

  onProgress?.(100, 'Termine !');

  // Merge: MRZ for structured fields, recto for address and NIN
  const merged: ExtractedIDData = {
    firstName: mrzData?.firstName || rectoData.firstName || '',
    lastName: mrzData?.lastName || rectoData.lastName || '',
    // NIN priority: recto labeled field > verso NIN > MRZ doc number
    idCardNumber: rectoData.idCardNumber || versoNIN || mrzData?.idCardNumber || '',
    birthDate: mrzData?.birthDate || rectoData.birthDate || null,
    gender: mrzData?.gender || rectoData.gender || null,
    nationality: mrzData?.nationality || 'SEN',
    address: rectoData.address || null,
    expiryDate: mrzData?.expiryDate || rectoData.expiryDate || null,
  };

  console.log('[v0] Final merged result:', merged);

  return merged;
}
