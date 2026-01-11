import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

interface CreateUserRequest {
  email: string;
  password: string;
  firstName: string;
  lastName: string;
  phone?: string;
  role: 'guardian' | 'company_admin' | 'employee';
  siteId?: string;      // For guardians
  companyId?: string;   // For company_admin and employee
}

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const authHeader = req.headers.get("Authorization");
    if (!authHeader?.startsWith("Bearer ")) {
      return new Response(JSON.stringify({ error: "Non autorisé" }), {
        status: 401,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const token = authHeader.replace("Bearer ", "");
    
    // Create admin client with service role
    const adminClient = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!
    );

    // Validate the caller's token
    const { data: callerData, error: callerError } = await adminClient.auth.getUser(token);
    if (callerError || !callerData.user) {
      return new Response(JSON.stringify({ error: "Token invalide" }), {
        status: 401,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const callerId = callerData.user.id;

    // Get caller's roles
    const { data: callerRoles } = await adminClient
      .from("user_roles")
      .select("role")
      .eq("user_id", callerId);

    const roles = callerRoles?.map(r => r.role) || [];
    const isManager = roles.includes("manager");
    const isCompanyAdmin = roles.includes("company_admin");
    const isSuperAdmin = roles.includes("super_admin");

    const body: CreateUserRequest = await req.json();
    const { email, password, firstName, lastName, phone, role, siteId, companyId } = body;

    // Validate request based on role being created
    if (role === 'guardian') {
      if (!isSuperAdmin && !isManager) {
        return new Response(JSON.stringify({ error: "Seuls les gestionnaires peuvent créer des gardiens" }), {
          status: 403,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
      if (!siteId) {
        return new Response(JSON.stringify({ error: "Le site est requis pour créer un gardien" }), {
          status: 400,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
      // Verify manager owns this site
      if (isManager && !isSuperAdmin) {
        const { data: siteData } = await adminClient
          .from("sites")
          .select("id")
          .eq("id", siteId)
          .eq("manager_id", callerId)
          .single();
        
        if (!siteData) {
          return new Response(JSON.stringify({ error: "Vous ne gérez pas ce site" }), {
            status: 403,
            headers: { ...corsHeaders, "Content-Type": "application/json" },
          });
        }
      }
    }

    if (role === 'company_admin') {
      if (!isSuperAdmin && !isManager) {
        return new Response(JSON.stringify({ error: "Seuls les gestionnaires peuvent créer des administrateurs d'entreprise" }), {
          status: 403,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
      if (!companyId) {
        return new Response(JSON.stringify({ error: "L'entreprise est requise pour créer un administrateur" }), {
          status: 400,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
      // Verify manager owns the site of this company
      if (isManager && !isSuperAdmin) {
        const { data: companyData } = await adminClient
          .from("companies")
          .select("site_id")
          .eq("id", companyId)
          .single();
        
        if (companyData) {
          const { data: siteData } = await adminClient
            .from("sites")
            .select("id")
            .eq("id", companyData.site_id)
            .eq("manager_id", callerId)
            .single();
          
          if (!siteData) {
            return new Response(JSON.stringify({ error: "Cette entreprise n'appartient pas à votre site" }), {
              status: 403,
              headers: { ...corsHeaders, "Content-Type": "application/json" },
            });
          }
        }
      }
    }

    if (role === 'employee') {
      if (!isSuperAdmin && !isManager && !isCompanyAdmin) {
        return new Response(JSON.stringify({ error: "Non autorisé à créer des employés" }), {
          status: 403,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
      if (!companyId) {
        return new Response(JSON.stringify({ error: "L'entreprise est requise pour créer un employé" }), {
          status: 400,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
      // Verify company_admin owns this company
      if (isCompanyAdmin && !isManager && !isSuperAdmin) {
        const { data: companyData } = await adminClient
          .from("companies")
          .select("id")
          .eq("id", companyId)
          .eq("admin_id", callerId)
          .single();
        
        if (!companyData) {
          return new Response(JSON.stringify({ error: "Vous n'êtes pas administrateur de cette entreprise" }), {
            status: 403,
            headers: { ...corsHeaders, "Content-Type": "application/json" },
          });
        }
      }
    }

    // Create the user account
    const { data: authData, error: authError } = await adminClient.auth.admin.createUser({
      email,
      password,
      email_confirm: true,
      user_metadata: {
        first_name: firstName,
        last_name: lastName,
      },
    });

    if (authError) {
      return new Response(JSON.stringify({ error: authError.message }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const newUserId = authData.user.id;

    // Update profile with phone if provided
    if (phone) {
      await adminClient
        .from("profiles")
        .update({ phone })
        .eq("id", newUserId);
    }

    // Create role-specific records
    if (role === 'guardian') {
      await adminClient
        .from("guardians")
        .insert({ user_id: newUserId, site_id: siteId });
      
      await adminClient
        .from("user_roles")
        .insert({ user_id: newUserId, role: 'guardian' });
    }

    if (role === 'company_admin') {
      await adminClient
        .from("user_roles")
        .insert({ user_id: newUserId, role: 'company_admin' });
      
      await adminClient
        .from("companies")
        .update({ admin_id: newUserId })
        .eq("id", companyId);
    }

    if (role === 'employee') {
      // Generate unique code
      const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
      let uniqueCode = '';
      for (let i = 0; i < 6; i++) {
        uniqueCode += chars.charAt(Math.floor(Math.random() * chars.length));
      }
      
      const qrCode = `EMP-${Date.now()}-${Math.random().toString(36).substring(2, 9).toUpperCase()}`;
      
      await adminClient
        .from("employees")
        .insert({
          user_id: newUserId,
          company_id: companyId,
          qr_code: qrCode,
          unique_code: uniqueCode,
        });
      
      await adminClient
        .from("user_roles")
        .insert({ user_id: newUserId, role: 'employee' });
    }

    return new Response(
      JSON.stringify({ 
        success: true, 
        userId: newUserId,
        message: `${role === 'guardian' ? 'Gardien' : role === 'company_admin' ? 'Administrateur' : 'Employé'} créé avec succès`
      }),
      {
        status: 200,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      }
    );
  } catch (error: unknown) {
    console.error("Error in create-user:", error);
    const errorMessage = error instanceof Error ? error.message : "Erreur serveur";
    return new Response(
      JSON.stringify({ error: errorMessage }),
      {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      }
    );
  }
});
