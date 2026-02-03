import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.49.1";
import { Resend } from "https://esm.sh/resend@4.0.0";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface ReportRequest {
  siteId?: string;
  format: 'pdf' | 'csv' | 'excel';
  dateFrom: string;
  dateTo: string;
  email: string;
  reportType?: string;
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  try {
    const RESEND_API_KEY = Deno.env.get('RESEND_API_KEY');
    if (!RESEND_API_KEY) {
      throw new Error('RESEND_API_KEY is not configured');
    }

    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    
    const supabase = createClient(supabaseUrl, supabaseServiceKey);
    const resend = new Resend(RESEND_API_KEY);

    // Get auth token and verify user
    const authHeader = req.headers.get('Authorization');
    if (!authHeader) {
      throw new Error('Non authentifié');
    }

    const token = authHeader.replace('Bearer ', '');
    const { data: { user }, error: authError } = await supabase.auth.getUser(token);
    
    if (authError || !user) {
      throw new Error('Utilisateur non authentifié');
    }

    const { siteId, format, dateFrom, dateTo, email, reportType } = await req.json() as ReportRequest;

    console.log(`Generating ${format} report for site ${siteId || 'all'} from ${dateFrom} to ${dateTo}`);

    // Fetch access logs data
    let query = supabase
      .from('access_logs')
      .select(`
        id,
        timestamp,
        action_type,
        user_id,
        invitation_id,
        site_id,
        sites:site_id (name)
      `)
      .gte('timestamp', dateFrom)
      .lte('timestamp', dateTo)
      .order('timestamp', { ascending: false });

    if (siteId) {
      query = query.eq('site_id', siteId);
    }

    const { data: accessLogs, error: logsError } = await query;

    if (logsError) {
      console.error('Error fetching logs:', logsError);
      throw new Error('Erreur lors de la récupération des données');
    }

    // Generate report content based on format
    let reportContent: string;
    let mimeType: string;
    let fileName: string;

    const stats = {
      total: accessLogs?.length || 0,
      entries: accessLogs?.filter(l => l.action_type === 'entry').length || 0,
      exits: accessLogs?.filter(l => l.action_type === 'exit').length || 0,
      employees: accessLogs?.filter(l => l.user_id).length || 0,
      visitors: accessLogs?.filter(l => l.invitation_id).length || 0,
    };

    if (format === 'csv') {
      mimeType = 'text/csv';
      fileName = `rapport-acces-${dateFrom}-${dateTo}.csv`;
      
      const headers = ['Date/Heure', 'Type', 'Site', 'Type Accès'];
      const rows = accessLogs?.map(log => [
        new Date(log.timestamp).toLocaleString('fr-FR'),
        log.action_type === 'entry' ? 'Entrée' : 'Sortie',
        (log.sites as any)?.name || 'N/A',
        log.user_id ? 'Employé' : 'Visiteur'
      ]) || [];
      
      reportContent = [headers.join(','), ...rows.map(r => r.join(','))].join('\n');
    } else if (format === 'excel') {
      // For Excel, we'll create a simple CSV that Excel can open
      mimeType = 'text/csv';
      fileName = `rapport-acces-${dateFrom}-${dateTo}.xls`;
      
      const headers = ['Date/Heure', 'Type', 'Site', 'Type Accès'];
      const rows = accessLogs?.map(log => [
        new Date(log.timestamp).toLocaleString('fr-FR'),
        log.action_type === 'entry' ? 'Entrée' : 'Sortie',
        (log.sites as any)?.name || 'N/A',
        log.user_id ? 'Employé' : 'Visiteur'
      ]) || [];
      
      reportContent = [headers.join('\t'), ...rows.map(r => r.join('\t'))].join('\n');
    } else {
      // PDF - send as HTML that can be printed to PDF
      mimeType = 'text/html';
      fileName = `rapport-acces-${dateFrom}-${dateTo}.html`;
      
      reportContent = `
        <!DOCTYPE html>
        <html>
        <head>
          <meta charset="utf-8">
          <title>Rapport d'Accès</title>
          <style>
            body { font-family: Arial, sans-serif; margin: 40px; }
            h1 { color: #1a1a2e; }
            .stats { display: flex; gap: 20px; margin: 20px 0; }
            .stat { background: #f5f5f5; padding: 15px; border-radius: 8px; }
            .stat-value { font-size: 24px; font-weight: bold; color: #16213e; }
            .stat-label { color: #666; font-size: 14px; }
            table { width: 100%; border-collapse: collapse; margin-top: 20px; }
            th, td { border: 1px solid #ddd; padding: 10px; text-align: left; }
            th { background: #16213e; color: white; }
            tr:nth-child(even) { background: #f9f9f9; }
          </style>
        </head>
        <body>
          <h1>Rapport d'Accès</h1>
          <p>Période: ${dateFrom} au ${dateTo}</p>
          
          <div class="stats">
            <div class="stat">
              <div class="stat-value">${stats.total}</div>
              <div class="stat-label">Total Accès</div>
            </div>
            <div class="stat">
              <div class="stat-value">${stats.entries}</div>
              <div class="stat-label">Entrées</div>
            </div>
            <div class="stat">
              <div class="stat-value">${stats.exits}</div>
              <div class="stat-label">Sorties</div>
            </div>
            <div class="stat">
              <div class="stat-value">${stats.employees}</div>
              <div class="stat-label">Employés</div>
            </div>
            <div class="stat">
              <div class="stat-value">${stats.visitors}</div>
              <div class="stat-label">Visiteurs</div>
            </div>
          </div>
          
          <table>
            <thead>
              <tr>
                <th>Date/Heure</th>
                <th>Type</th>
                <th>Site</th>
                <th>Type d'Accès</th>
              </tr>
            </thead>
            <tbody>
              ${accessLogs?.map(log => `
                <tr>
                  <td>${new Date(log.timestamp).toLocaleString('fr-FR')}</td>
                  <td>${log.action_type === 'entry' ? 'Entrée' : 'Sortie'}</td>
                  <td>${(log.sites as any)?.name || 'N/A'}</td>
                  <td>${log.user_id ? 'Employé' : 'Visiteur'}</td>
                </tr>
              `).join('') || ''}
            </tbody>
          </table>
          
          <p style="margin-top: 40px; color: #666; font-size: 12px;">
            Rapport généré automatiquement le ${new Date().toLocaleString('fr-FR')}
          </p>
        </body>
        </html>
      `;
    }

    // Encode content as base64 for attachment
    const base64Content = btoa(unescape(encodeURIComponent(reportContent)));

    // Send email with attachment
    const { error: emailError } = await resend.emails.send({
      from: 'Rapports Access <onboarding@resend.dev>',
      to: [email],
      subject: `Rapport d'accès - ${dateFrom} au ${dateTo}`,
      html: `
        <h2>Votre rapport d'accès est prêt</h2>
        <p>Période: ${dateFrom} au ${dateTo}</p>
        <h3>Résumé</h3>
        <ul>
          <li><strong>Total accès:</strong> ${stats.total}</li>
          <li><strong>Entrées:</strong> ${stats.entries}</li>
          <li><strong>Sorties:</strong> ${stats.exits}</li>
          <li><strong>Employés:</strong> ${stats.employees}</li>
          <li><strong>Visiteurs:</strong> ${stats.visitors}</li>
        </ul>
        <p>Le rapport complet est joint à cet email.</p>
      `,
      attachments: [
        {
          filename: fileName,
          content: base64Content,
        }
      ]
    });

    if (emailError) {
      console.error('Error sending email:', emailError);
      throw new Error('Erreur lors de l\'envoi de l\'email');
    }

    console.log(`Report sent successfully to ${email}`);

    return new Response(
      JSON.stringify({ success: true, message: 'Rapport envoyé avec succès' }),
      { 
        status: 200, 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      }
    );

  } catch (error: unknown) {
    console.error('Error in send-report function:', error);
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    return new Response(
      JSON.stringify({ error: errorMessage }),
      { 
        status: 500, 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      }
    );
  }
});
