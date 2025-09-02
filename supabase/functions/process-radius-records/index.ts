import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from "https://esm.sh/@supabase/supabase-js@2"

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    )

    console.log('Processing all existing radius records...');

    let processedCount = 0;
    let errorCount = 0;

    // Process all mikrotik_routers
    console.log('Processing MikroTik routers...');
    const { data: routers, error: routersError } = await supabaseClient
      .from('mikrotik_routers')
      .select('*');

    if (routersError) {
      console.error('Error fetching routers:', routersError);
      throw routersError;
    }

    for (const router of routers || []) {
      try {
        const response = await fetch('https://ddljuawonxdnesrnclsx.supabase.co/functions/v1/radius-webhook', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${Deno.env.get('SUPABASE_ANON_KEY')}`
          },
          body: JSON.stringify({
            record: router,
            table_name: 'mikrotik_routers'
          })
        });
        
        if (response.ok) {
          processedCount++;
        } else {
          errorCount++;
          console.error(`Failed to process router ${router.id}:`, await response.text());
        }
      } catch (error) {
        errorCount++;
        console.error(`Error processing router ${router.id}:`, error);
      }
    }

    // Process all clients
    console.log('Processing clients...');
    const { data: clients, error: clientsError } = await supabaseClient
      .from('clients')
      .select('*');

    if (clientsError) {
      console.error('Error fetching clients:', clientsError);
      throw clientsError;
    }

    for (const client of clients || []) {
      try {
        const response = await fetch('https://ddljuawonxdnesrnclsx.supabase.co/functions/v1/radius-webhook', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${Deno.env.get('SUPABASE_ANON_KEY')}`
          },
          body: JSON.stringify({
            record: client,
            table_name: 'clients'
          })
        });
        
        if (response.ok) {
          processedCount++;
        } else {
          errorCount++;
          console.error(`Failed to process client ${client.id}:`, await response.text());
        }
      } catch (error) {
        errorCount++;
        console.error(`Error processing client ${client.id}:`, error);
      }
    }

    console.log(`Processing complete. Processed: ${processedCount}, Errors: ${errorCount}`);

    return new Response(
      JSON.stringify({
        success: true,
        processed_count: processedCount,
        error_count: errorCount,
        total_records: (routers?.length || 0) + (clients?.length || 0)
      }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200,
      }
    )

  } catch (error) {
    console.error('Error in process-radius-records function:', error);
    return new Response(
      JSON.stringify({
        success: false,
        error: error.message
      }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 500,
      }
    )
  }
})