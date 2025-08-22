
import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.45.0";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseClient = createClient(
      Deno.env.get("SUPABASE_URL") ?? "",
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? "",
      { auth: { persistSession: false } }
    );

    const { client_id } = await req.json();

    console.log('Activating client service for:', client_id);

    // Get client details
    const { data: client, error: clientError } = await supabaseClient
      .from('clients')
      .select('*')
      .eq('id', client_id)
      .single();

    if (clientError || !client) {
      throw new Error('Client not found');
    }

    // Create RADIUS user (simulated)
    console.log('Creating RADIUS user for client:', client.name);
    
    // Configure MikroTik QoS (simulated)
    console.log('Configuring MikroTik QoS for client:', client.name);
    
    // Start bandwidth monitoring (simulated)
    await supabaseClient
      .from('bandwidth_statistics')
      .insert({
        client_id: client_id,
        equipment_id: crypto.randomUUID(), // This would be the actual equipment ID
        in_octets: 0,
        out_octets: 0,
        in_packets: 0,
        out_packets: 0,
        isp_company_id: client.isp_company_id
      });

    console.log('Service activation completed for client:', client.name);

    return new Response(
      JSON.stringify({
        success: true,
        message: 'Client service activated successfully'
      }),
      {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 200,
      }
    );

  } catch (error) {
    console.error("Error in activate-client-service function:", error);
    return new Response(
      JSON.stringify({ error: error.message }),
      {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 500,
      }
    );
  }
});
