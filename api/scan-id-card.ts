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

    const apiKey = process.env.OPENAI_API_KEY || process.env.AI_GATEWAY_API_KEY
    if (!apiKey) {
      return new Response(
        JSON.stringify({ success: false, error: 'Cle API OpenAI non configuree' }),
        { status: 500, headers: { 'Content-Type': 'application/json' } }
      )
    }

    const systemPrompt = `Tu es un systeme OCR specialise dans l'extraction de donnees des cartes d'identite senegalaises (CNI et CEDEAO).
Tu dois repondre UNIQUEMENT avec un objet JSON valide, sans aucun texte supplementaire, sans markdown, sans backticks.

Le format JSON attendu est:
{
  "firstName": "prenom(s)",
  "lastName": "nom de famille",
  "idCardNumber": "numero de carte ou NIN",
  "birthDate": "JJ/MM/AAAA ou null",
  "gender": "M ou F ou null",
  "nationality": "SEN par defaut",
  "address": "adresse ou null",
  "expiryDate": "JJ/MM/AAAA ou null"
}`

    const userPrompt = `Analyse ces deux images d'une carte d'identite senegalaise:
- Image 1: RECTO (face avant)
- Image 2: VERSO (face arriere)

Extrais toutes les informations visibles. Pour le numero de carte, cherche aussi la zone MRZ au verso (lignes avec des < et des chiffres).
Si une information n'est pas lisible, mets null.
Reponds UNIQUEMENT avec le JSON, rien d'autre.`

    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${apiKey}`,
      },
      body: JSON.stringify({
        model: 'gpt-4o',
        messages: [
          { role: 'system', content: systemPrompt },
          {
            role: 'user',
            content: [
              { type: 'text', text: userPrompt },
              {
                type: 'image_url',
                image_url: {
                  url: `data:image/jpeg;base64,${frontImageBase64}`,
                  detail: 'high',
                },
              },
              {
                type: 'image_url',
                image_url: {
                  url: `data:image/jpeg;base64,${backImageBase64}`,
                  detail: 'high',
                },
              },
            ],
          },
        ],
        max_tokens: 1000,
        temperature: 0.1,
      }),
    })

    if (!response.ok) {
      const errorBody = await response.text()
      console.error('OpenAI API error:', response.status, errorBody)
      return new Response(
        JSON.stringify({ success: false, error: `Erreur API OpenAI (${response.status})` }),
        { status: 500, headers: { 'Content-Type': 'application/json' } }
      )
    }

    const completion = await response.json()
    const content = completion.choices?.[0]?.message?.content?.trim()

    if (!content) {
      return new Response(
        JSON.stringify({ success: false, error: 'Reponse vide de l\'IA' }),
        { status: 500, headers: { 'Content-Type': 'application/json' } }
      )
    }

    // Parse the JSON response - handle potential markdown code blocks
    let jsonStr = content
    if (jsonStr.startsWith('```')) {
      jsonStr = jsonStr.replace(/^```(?:json)?\n?/, '').replace(/\n?```$/, '')
    }

    const data = JSON.parse(jsonStr)

    return new Response(
      JSON.stringify({ success: true, data }),
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
