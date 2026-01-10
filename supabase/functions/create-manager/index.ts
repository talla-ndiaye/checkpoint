import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.89.0'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders })
  }

  try {
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
    
    // Get the authorization header to verify caller is super_admin
    const authHeader = req.headers.get('authorization')
    if (!authHeader) {
      return new Response(JSON.stringify({ error: 'Non autorisé' }), {
        status: 401,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      })
    }

    // Create client with user's token to verify permissions
    const userClient = createClient(supabaseUrl, Deno.env.get('SUPABASE_ANON_KEY')!, {
      global: { headers: { authorization: authHeader } }
    })
    
    // Use getClaims to validate JWT with signing-keys
    const token = authHeader.replace('Bearer ', '')
    const { data: claimsData, error: claimsError } = await userClient.auth.getClaims(token)
    if (claimsError || !claimsData?.claims) {
      return new Response(JSON.stringify({ error: 'Non autorisé' }), {
        status: 401,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      })
    }
    
    const userId = claimsData.claims.sub as string

    // Create admin client for service operations
    const adminClient = createClient(supabaseUrl, supabaseServiceKey)
    
    // Check if user is super_admin
    const { data: roleData } = await adminClient
      .from('user_roles')
      .select('role')
      .eq('user_id', userId)
      .eq('role', 'super_admin')
      .single()

    if (!roleData) {
      return new Response(JSON.stringify({ error: 'Accès refusé - Super Admin requis' }), {
        status: 403,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      })
    }

    const { email, password, first_name, last_name, phone } = await req.json()

    if (!email || !password || !first_name || !last_name) {
      return new Response(JSON.stringify({ error: 'Données manquantes' }), {
        status: 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      })
    }

    // Create user with admin client
    const { data: authData, error: authError } = await adminClient.auth.admin.createUser({
      email,
      password,
      email_confirm: true,
      user_metadata: { first_name, last_name },
    })

    if (authError) {
      return new Response(JSON.stringify({ error: authError.message }), {
        status: 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      })
    }

    // Update phone if provided
    if (phone) {
      await adminClient
        .from('profiles')
        .update({ phone })
        .eq('id', authData.user.id)
    }

    // Assign manager role
    const { error: roleError } = await adminClient
      .from('user_roles')
      .insert({ user_id: authData.user.id, role: 'manager' })

    if (roleError) {
      // Cleanup: delete the user if role assignment fails
      await adminClient.auth.admin.deleteUser(authData.user.id)
      return new Response(JSON.stringify({ error: 'Échec de l\'attribution du rôle' }), {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      })
    }

    return new Response(JSON.stringify({ 
      success: true, 
      user: { id: authData.user.id, email: authData.user.email } 
    }), {
      status: 200,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    })

  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Erreur inconnue'
    return new Response(JSON.stringify({ error: message }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    })
  }
})
