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

Deno.serve(async (req) => {
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
    const { imageBase64 } = await req.json();
    if (!imageBase64) {
      return new Response(
        JSON.stringify({ error: 'Image data required' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    console.log('Processing ID card image for user:', user.id);

    // Use Lovable AI Gateway with Gemini for OCR
    const lovableApiKey = Deno.env.get('LOVABLE_API_KEY');
    if (!lovableApiKey) {
      throw new Error('LOVABLE_API_KEY not configured');
    }

    const aiResponse = await fetch('https://ai.gateway.lovable.dev/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${lovableApiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'google/gemini-2.5-flash',
        messages: [
          {
            role: 'user',
            content: [
              {
                type: 'text',
                text: `Analyze this identity card image and extract the following information in JSON format. This is a CEDEAO/ECOWAS identity card from Senegal.

Extract these fields:
- firstName: The first name (Prénoms)
- lastName: The last name (Nom)
- idCardNumber: The ID card number (N° de la carte d'identité)
- birthDate: Date of birth in YYYY-MM-DD format (Date de naissance)
- gender: Gender as M or F (Sexe)
- nationality: Nationality code, default to "SEN"
- address: Full address (Adresse du domicile)
- expiryDate: Expiry date in YYYY-MM-DD format (Date d'expiration)

If a field cannot be read clearly, set it to null.
Respond ONLY with valid JSON, no other text.

Example response:
{"firstName":"TALLA","lastName":"NDIAYE","idCardNumber":"1 01 2001092 00073 0","birthDate":"2001-09-20","gender":"M","nationality":"SEN","address":"S/51 HAMO 3 GUEDIAWAYE","expiryDate":"2030-08-25"}`
              },
              {
                type: 'image_url',
                image_url: {
                  url: `data:image/jpeg;base64,${imageBase64}`
                }
              }
            ]
          }
        ],
        max_tokens: 500,
        temperature: 0.1
      })
    });

    if (!aiResponse.ok) {
      const errorText = await aiResponse.text();
      console.error('AI Gateway error:', errorText);
      throw new Error('Failed to process image with AI');
    }

    const aiData = await aiResponse.json();
    const content = aiData.choices?.[0]?.message?.content;
    
    console.log('AI response content:', content);

    if (!content) {
      throw new Error('No response from AI');
    }

    // Parse the JSON response from AI
    let idCardData: IDCardData;
    try {
      // Clean up the response in case it has markdown formatting
      const cleanedContent = content.replace(/```json\n?/g, '').replace(/```\n?/g, '').trim();
      idCardData = JSON.parse(cleanedContent);
    } catch (parseError) {
      console.error('Failed to parse AI response:', content);
      throw new Error('Could not extract ID card information');
    }

    // Validate required fields
    if (!idCardData.firstName || !idCardData.lastName || !idCardData.idCardNumber) {
      throw new Error('Could not read essential ID card information');
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
