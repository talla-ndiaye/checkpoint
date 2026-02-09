import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface IDCardData {
  firstName: string;
  lastName: string;
  idCardNumber: string;
  birthDate: string | null;
  gender: string | null;
  nationality: string;
  address: string | null;
  expiryDate: string | null;
}

Deno.serve(async (req: Request) => {
  // Handle CORS preflight
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  try {
    // Verify authentication
    const authHeader = req.headers.get('Authorization');
    if (!authHeader) {
      return new Response(
        JSON.stringify({ error: 'Authorization header required' }),
        { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_ANON_KEY') ?? '',
      { global: { headers: { Authorization: authHeader } } }
    );

    const { data: { user }, error: authError } = await supabaseClient.auth.getUser();
    if (authError || !user) {
      return new Response(
        JSON.stringify({ error: 'Unauthorized' }),
        { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Get image data from request
    const body = await req.json();
    const { frontImageBase64, backImageBase64 } = body;
    
    console.log('--- Edge Function Debug ---');
    console.log('User ID:', user?.id);
    console.log('Front image received:', !!frontImageBase64, 'Length:', frontImageBase64?.length);
    console.log('Back image received:', !!backImageBase64, 'Length:', backImageBase64?.length);

    if (!frontImageBase64 || !backImageBase64) {
      console.warn('Incomplete payload received');
      return new Response(
        JSON.stringify({ 
          error: 'Front and back images are required',
          debug: { front: !!frontImageBase64, back: !!backImageBase64 }
        }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    console.log('Processing ID card images for user:', user.id);

    // Use Direct Google Gemini API
    const geminiApiKey = Deno.env.get('GOOGLE_GEMINI_API_KEY');
    if (!geminiApiKey) {
      throw new Error('GOOGLE_GEMINI_API_KEY not configured');
    }

    console.log('Calling Google Gemini API directly...');
    const geminiUrl = `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${geminiApiKey}`;
    
    const aiResponse = await fetch(geminiUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        contents: [
          {
            parts: [
              {
                text: `Analyze these two images (Front and Back) of a Senegal identity card.
                There are two common versions: 
                1. CEDEAO/ECOWAS: Card number is "N° de la carte d'identité". MRZ on the back.
                2. Biometric CNI: Card number is "N° d'Identification Nationale" (found at the bottom). Large barcode on the back.

                Extract information regardless of which side it appears on.
                
                Guidelines:
                - Name/First Name: "Nom" and "Prénoms".
                - ID Card Number: Look for both "N° de la carte d'identité" OR "N° d'Identification Nationale" (NIN).
                - Dates: "Date de naissance" and "Date d'expiration". Convert to YYYY-MM-DD.
                - Address: "Adresse" or "Adresse du domicile".
                - Gender: "Sexe" (M or F).
                - Cross-verification: If it's a CEDEAO card, use the MRZ code on the back (I<SEN...) to confirm Name and numbers.

                Extract these fields in JSON:
                - firstName: The first name (Prénoms)
                - lastName: The last name (Nom)
                - idCardNumber: The ID card number (N° de la carte d'identité / NIN)
                - birthDate: Date of birth (YYYY-MM-DD)
                - gender: Gender (M or F)
                - nationality: Nationality code (default to "SEN")
                - address: Full address
                - expiryDate: Expiry date (YYYY-MM-DD)

                If a field cannot be read clearly, set it to null.
                Respond ONLY with valid JSON.`
              },
              {
                inlineData: {
                  mimeType: "image/jpeg",
                  data: frontImageBase64
                }
              },
              {
                inlineData: {
                  mimeType: "image/jpeg",
                  data: backImageBase64
                }
              }
            ]
          }
        ],
        generationConfig: {
          temperature: 0.1,
          topP: 0.95,
          topK: 64,
          maxOutputTokens: 1024,
          responseMimeType: "application/json",
        }
      })
    });

    if (!aiResponse.ok) {
      const errorText = await aiResponse.text();
      console.error('Gemini API error:', errorText);
      throw new Error(`Gemini API error: ${aiResponse.status}`);
    }

    const aiData = await aiResponse.json();
    const content = aiData.candidates?.[0]?.content?.parts?.[0]?.text;
    
    console.log('AI response content:', content);

    if (!content) {
      throw new Error('No response from AI');
    }

    // Parse the JSON response from AI
    let idCardData: IDCardData;
    try {
      // More robust cleaning of AI response
      let cleanedContent = content;
      
      // Remove any markdown blocks if present
      const jsonMatch = content.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        cleanedContent = jsonMatch[0];
      } else {
        cleanedContent = content.replace(/```json\n?/g, '').replace(/```\n?/g, '').trim();
      }
      
      idCardData = JSON.parse(cleanedContent);
    } catch (parseError) {
      console.error('Failed to parse AI response. Raw content:', content);
      throw new Error(`Could not parse ID information. Data received: ${content.substring(0, 100)}...`);
    }

    // Validate essential fields
    if (!idCardData.firstName && !idCardData.lastName && !idCardData.idCardNumber) {
      throw new Error('Could not read any essential information from the images. Please ensure they are clear and well-lit.');
    }

    console.log('Extracted ID card data:', idCardData);

    return new Response(
      JSON.stringify({ success: true, data: idCardData }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error: unknown) {
    console.error('Error processing ID card:', error);
    const message = error instanceof Error ? error.message : 'Failed to process ID card';
    return new Response(
      JSON.stringify({ error: message }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
