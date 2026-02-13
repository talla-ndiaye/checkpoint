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
    const geminiApiKey = Deno.env.get('GOOGLE_GEMINI_API_KEY') || Deno.env.get('LOVABLE_API_KEY');
    
    console.log('API Key present:', !!geminiApiKey);
    if (geminiApiKey) {
      console.log('API Key prefix:', geminiApiKey.substring(0, 6) + '...');
    }

    if (!geminiApiKey) {
      console.error('API Key missing: Neither GOOGLE_GEMINI_API_KEY nor LOVABLE_API_KEY is set');
      throw new Error('Intelligence artificielle non configurée (Clé API manquante)');
    }

    console.log('Calling Google Gemini API directly...');
    const geminiUrl = `https://generativelanguage.googleapis.com/v1/models/gemini-1.5-flash:generateContent?key=${geminiApiKey}`;
    
    const geminiPayload = {
      contents: [
        {
          parts: [
            {
              text: `Analyze these two images (Front and Back) of a Senegal identity card.
              Extract these fields in JSON: firstName, lastName, idCardNumber, birthDate, gender, nationality, address, expiryDate.
              
              CRITICAL INSTRUCTIONS:
              1. "idCardNumber" MUST be the National Identification Number (NIN). 
                 - It usually looks like "1 752 1990 01234" (approx 13-14 digits).
                 - It is labeled "Identification Nationale" or "NIN".
                 - On the new ECOWAS card, the NIN is often on the BACK (Verso).
                 - DO NOT use the "N° de la carte" found on the top-left of the ECOWAS card (e.g. 1 01 2001...). That is NOT the ID number.
              2. "Address" might be labeled "Adresse" or "Adresse du domicile".
              3. "Gender" is 'M' or 'F'.
              
              If a field cannot be read, set it to null. Respond ONLY with valid JSON.`
            },
            { inlineData: { mimeType: "image/jpeg", data: frontImageBase64 } },
            { inlineData: { mimeType: "image/jpeg", data: backImageBase64 } }
          ]
        }
      ],
      generationConfig: {
        temperature: 0.1,
        responseMimeType: "application/json",
      }
    };

    console.log('Sending request to Gemini...');
    const aiResponse = await fetch(geminiUrl, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(geminiPayload)
    });

    console.log('Gemini response status:', aiResponse.status);

    if (!aiResponse.ok) {
      const errorText = await aiResponse.text();
      console.error('Gemini API error details:', errorText);
      try {
        const errorJson = JSON.parse(errorText);
        const geminiError = errorJson.error?.message || errorText;
        return new Response(
          JSON.stringify({ success: false, error: `Erreur Gemini: ${geminiError}`, details: errorJson }),
          { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      } catch {
        return new Response(
          JSON.stringify({ success: false, error: `Erreur de l'IA (Gemini): ${aiResponse.status}`, raw: errorText }),
          { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }
    }

    const aiData = await aiResponse.json();
    console.log('Gemini data received successfully');
    const content = aiData.candidates?.[0]?.content?.parts?.[0]?.text;
    
    if (!content) {
      console.error('No content in Gemini response:', aiData);
      throw new Error('Aucune réponse générée par l\'IA');
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
