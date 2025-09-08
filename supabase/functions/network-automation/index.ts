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

    const { action, client_id, company_id } = await req.json();

    console.log(`Network automation action: ${action} for client: ${client_id}`);

    let result = { success: false, message: 'Unknown action' };

    switch (action) {
      case 'connect_client':
        result = await connectClient(supabaseClient, client_id, company_id);
        break;
      case 'disconnect_client':
        result = await disconnectClient(supabaseClient, client_id, company_id);
        break;
      case 'update_qos':
        result = await updateClientQoS(supabaseClient, client_id, company_id);
        break;
      case 'process_renewals':
        result = await processAutoRenewals(supabaseClient, company_id);
        break;
      default:
        result = { success: false, message: `Unknown action: ${action}` };
    }

    return new Response(
      JSON.stringify(result),
      {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: result.success ? 200 : 400,
      }
    );

  } catch (error) {
    console.error("Error in network automation:", error);
    return new Response(
      JSON.stringify({ 
        success: false, 
        error: error.message 
      }),
      {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 500,
      }
    );
  }
});

async function connectClient(supabaseClient: any, clientId: string, companyId: string) {
  try {
    // Get client details with service package
    const { data: client, error: clientError } = await supabaseClient
      .from('clients')
      .select(`
        *,
        service_packages:service_package_id(*)
      `)
      .eq('id', clientId)
      .single();

    if (clientError || !client) {
      throw new Error('Client not found');
    }

    // Create or update RADIUS user
    const { data: existingUser } = await supabaseClient
      .from('radius_users')
      .select('id')
      .eq('client_id', clientId)
      .single();

    if (existingUser) {
      // Update existing user to active
      await supabaseClient
        .from('radius_users')
        .update({ is_active: true })
        .eq('client_id', clientId);
    } else {
      // Create new RADIUS user
      const username = `${client.name.replace(/\s+/g, '').toLowerCase()}_${clientId.slice(0, 8)}`;
      const password = Math.random().toString(36).slice(-8);
      
      // Convert speed from service package
      let maxDownload = '10000';
      let maxUpload = '5000';
      
      if (client.service_packages?.speed) {
        const speedMatch = client.service_packages.speed.match(/(\d+(?:\.\d+)?)\s*(mbps|kbps|gbps)/i);
        if (speedMatch) {
          const value = parseFloat(speedMatch[1]);
          const unit = speedMatch[2].toLowerCase();
          
          switch (unit) {
            case 'gbps':
              maxDownload = Math.round(value * 1000 * 1000).toString();
              break;
            case 'mbps':
              maxDownload = Math.round(value * 1000).toString();
              break;
            case 'kbps':
              maxDownload = Math.round(value).toString();
              break;
          }
          maxUpload = Math.round(parseInt(maxDownload) * 0.5).toString();
        }
      }

      await supabaseClient
        .from('radius_users')
        .insert({
          username,
          password,
          group_name: 'default',
          is_active: true,
          client_id: clientId,
          isp_company_id: companyId,
          max_download: maxDownload,
          max_upload: maxUpload
        });
    }

    // Update client status to active
    await supabaseClient
      .from('clients')
      .update({ status: 'active' })
      .eq('id', clientId);

    return { success: true, message: 'Client connected successfully' };
  } catch (error) {
    console.error('Connect client error:', error);
    return { success: false, message: error.message };
  }
}

async function disconnectClient(supabaseClient: any, clientId: string, companyId: string) {
  try {
    // Deactivate RADIUS user
    await supabaseClient
      .from('radius_users')
      .update({ is_active: false })
      .eq('client_id', clientId);

    // Update client status to suspended
    await supabaseClient
      .from('clients')
      .update({ status: 'suspended' })
      .eq('id', clientId);

    return { success: true, message: 'Client disconnected successfully' };
  } catch (error) {
    console.error('Disconnect client error:', error);
    return { success: false, message: error.message };
  }
}

async function updateClientQoS(supabaseClient: any, clientId: string, companyId: string) {
  try {
    // Get client with service package
    const { data: client, error: clientError } = await supabaseClient
      .from('clients')
      .select(`
        *,
        service_packages:service_package_id(*)
      `)
      .eq('id', clientId)
      .single();

    if (clientError || !client || !client.service_packages) {
      throw new Error('Client or service package not found');
    }

    // Convert speed and update RADIUS user
    let maxDownload = '10000';
    let maxUpload = '5000';
    
    if (client.service_packages.speed) {
      const speedMatch = client.service_packages.speed.match(/(\d+(?:\.\d+)?)\s*(mbps|kbps|gbps)/i);
      if (speedMatch) {
        const value = parseFloat(speedMatch[1]);
        const unit = speedMatch[2].toLowerCase();
        
        switch (unit) {
          case 'gbps':
            maxDownload = Math.round(value * 1000 * 1000).toString();
            break;
          case 'mbps':
            maxDownload = Math.round(value * 1000).toString();
            break;
          case 'kbps':
            maxDownload = Math.round(value).toString();
            break;
        }
        maxUpload = Math.round(parseInt(maxDownload) * 0.5).toString();
      }
    }

    await supabaseClient
      .from('radius_users')
      .update({
        max_download: maxDownload,
        max_upload: maxUpload
      })
      .eq('client_id', clientId);

    return { success: true, message: 'QoS updated successfully' };
  } catch (error) {
    console.error('Update QoS error:', error);
    return { success: false, message: error.message };
  }
}

async function processAutoRenewals(supabaseClient: any, companyId: string) {
  try {
    // Get clients approaching expiry with sufficient wallet balance
    const { data: clientsForRenewal, error } = await supabaseClient
      .from('clients')
      .select('*')
      .eq('isp_company_id', companyId)
      .eq('status', 'active')
      .not('subscription_end_date', 'is', null)
      .lte('subscription_end_date', new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString());

    if (error) throw error;

    let processed = 0;
    let renewed = 0;

    for (const client of clientsForRenewal || []) {
      processed++;
      
      const walletBalance = client.wallet_balance || 0;
      const monthlyRate = client.monthly_rate || 0;
      
      if (walletBalance >= monthlyRate) {
        // Process renewal
        const { error: renewalError } = await supabaseClient
          .rpc('process_subscription_renewal', {
            p_client_id: client.id
          });

        if (!renewalError) {
          renewed++;
          console.log(`Auto-renewed subscription for client: ${client.name}`);
        }
      } else {
        // Insufficient balance - suspend if expired
        const now = new Date();
        const expiryDate = new Date(client.subscription_end_date);
        
        if (expiryDate <= now) {
          await disconnectClient(supabaseClient, client.id, companyId);
          console.log(`Suspended client due to insufficient balance: ${client.name}`);
        }
      }
    }

    return { 
      success: true, 
      message: `Processed ${processed} clients, renewed ${renewed} subscriptions` 
    };
  } catch (error) {
    console.error('Process auto renewals error:', error);
    return { success: false, message: error.message };
  }
}