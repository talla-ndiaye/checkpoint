import { generateText, Output } from 'ai'
import { z } from 'zod'

const idCardSchema = z.object({
  firstName: z.string().describe('Prenom(s) sur la carte'),
  lastName: z.string().describe('Nom de famille sur la carte'),
  idCardNumber: z.string().describe('Numero de la carte d identite ou NIN (Numero d Identification Nationale)'),
  birthDate: z.string().nullable().describe('Date de naissance au format JJ/MM/AAAA'),
  gender: z.string().nullable().describe('Sexe: M ou F'),
  nationality: z.string().describe('Nationalite, par defaut SEN si pas visible'),
  address: z.string().nullable().describe('Adresse du domicile si visible'),
  expiryDate: z.string().nullable().describe('Date d expiration au format JJ/MM/AAAA'),
})

export default async function handler(req: Request) {
  if (req.method !== 'POST') {
    return new Response(JSON.stringify({ error: 'Method not allowed' }), {
      status: 405,
      headers: { 'Content-Type': 'application/json' },
    })
  }

  try {
    const { frontImageBase64, backImageBase64 } = await req.json()

    if (!frontImageBase64 || !backImageBase64) {
      return new Response(
        JSON.stringify({ success: false, error: 'Les images recto et verso sont requises' }),
        { status: 400, headers: { 'Content-Type': 'application/json' } }
      )
    }

    const { output } = await generateText({
      model: 'openai/gpt-4o',
      output: Output.object({
        schema: idCardSchema,
      }),
      messages: [
        {
          role: 'user',
          content: [
            {
              type: 'text',
              text: `Tu es un systeme OCR specialise dans l'extraction de donnees des cartes d'identite senegalaises (CNI et CEDEAO).

Analyse les deux images suivantes:
- Image 1: RECTO (face avant) de la carte d'identite
- Image 2: VERSO (face arriere) de la carte d'identite

Extrais toutes les informations visibles:
- Le prenom (firstName)
- Le nom de famille (lastName)  
- Le numero de la carte d'identite ou NIN (idCardNumber) - c'est le numero le plus long visible sur la carte
- La date de naissance (birthDate) au format JJ/MM/AAAA
- Le sexe (gender): M ou F
- La nationalite (nationality): par defaut "SEN"
- L'adresse du domicile (address) si visible
- La date d'expiration (expiryDate) au format JJ/MM/AAAA

Si une information n'est pas visible ou lisible, mets null.
Pour le numero de carte, cherche aussi la zone MRZ au verso (les lignes avec des < et des chiffres).

IMPORTANT: Extrais les donnees telles qu'elles apparaissent sur la carte, sans les modifier.`,
            },
            {
              type: 'image',
              image: frontImageBase64,
            },
            {
              type: 'image',
              image: backImageBase64,
            },
          ],
        },
      ],
    })

    return new Response(
      JSON.stringify({ success: true, data: output }),
      { status: 200, headers: { 'Content-Type': 'application/json' } }
    )
  } catch (error) {
    console.error('Error processing ID card:', error)
    return new Response(
      JSON.stringify({
        success: false,
        error: error instanceof Error ? error.message : 'Erreur lors du traitement des images',
      }),
      { status: 500, headers: { 'Content-Type': 'application/json' } }
    )
  }
}
