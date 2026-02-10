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
    
    const authHeader = req.headers.get('authorization')
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      console.error('Missing or invalid authorization header')
      return new Response(JSON.stringify({ error: 'Non autorisé - Token manquant' }), {
        status: 401,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      })
    }

    // Create admin client for all operations
    const adminClient = createClient(supabaseUrl, supabaseServiceKey)
    
    // Verify the JWT token using admin client
    const token = authHeader.replace('Bearer ', '')
    const { data: userData, error: userError } = await adminClient.auth.getUser(token)
    
    if (userError || !userData?.user) {
      console.error('Auth verify error:', userError?.message || 'No user found', 'Token prefix:', token.substring(0, 10))
      return new Response(JSON.stringify({ error: 'Non autorisé - Token invalide' }), {
        status: 401,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      })
    }

    const userId = userData.user.id
    
    // Check if user is super_admin
    const { data: roleData, error: roleCheckError } = await adminClient
      .from('user_roles')
      .select('role')
      .eq('user_id', userId)
      .eq('role', 'super_admin')
      .single()

    if (roleCheckError || !roleData) {
      console.error('Role check error:', roleCheckError?.message || 'No super_admin role')
      return new Response(JSON.stringify({ error: 'Accès refusé - Super Admin requis' }), {
        status: 403,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      })
    }

    const { action, id, name, address, manager_id } = await req.json()

    if (action === 'create') {
      if (!name || !address) {
        return new Response(JSON.stringify({ error: 'Nom et adresse requis' }), {
          status: 400,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        })
      }

      const { data, error } = await adminClient
        .from('sites')
        .insert({ name, address, manager_id: manager_id || null })
        .select()
        .single()

      if (error) {
        console.error('Create site error:', error.message)
        return new Response(JSON.stringify({ error: error.message }), {
          status: 400,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        })
      }

      return new Response(JSON.stringify({ success: true, site: data }), {
        status: 200,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      })
    }

    if (action === 'update') {
      if (!id) {
        return new Response(JSON.stringify({ error: 'ID du site requis' }), {
          status: 400,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        })
      }

      const updateData: Record<string, unknown> = {}
      if (name !== undefined) updateData.name = name
      if (address !== undefined) updateData.address = address
      if (manager_id !== undefined) updateData.manager_id = manager_id || null

      const { data, error } = await adminClient
        .from('sites')
        .update(updateData)
        .eq('id', id)
        .select()
        .single()

      if (error) {
        console.error('Update site error:', error.message)
        return new Response(JSON.stringify({ error: error.message }), {
          status: 400,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        })
      }

      return new Response(JSON.stringify({ success: true, site: data }), {
        status: 200,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      })
    }

    if (action === 'delete') {
      if (!id) {
        return new Response(JSON.stringify({ error: 'ID du site requis' }), {
          status: 400,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        })
      }

      const { error } = await adminClient
        .from('sites')
        .delete()
        .eq('id', id)

      if (error) {
        console.error('Delete site error:', error.message)
        return new Response(JSON.stringify({ error: error.message }), {
          status: 400,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        })
      }

      return new Response(JSON.stringify({ success: true }), {
        status: 200,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      })
    }

    return new Response(JSON.stringify({ error: 'Action non reconnue' }), {
      status: 400,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    })

  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Erreur inconnue'
    console.error('Unexpected error:', message)
    return new Response(JSON.stringify({ error: message }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    })
  }
})
