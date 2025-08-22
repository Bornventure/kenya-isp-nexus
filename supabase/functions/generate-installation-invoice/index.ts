
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

    // Get client details
    const { data: client, error: clientError } = await supabaseClient
      .from('clients')
      .select('*')
      .eq('id', client_id)
      .single();

    if (clientError || !client) {
      throw new Error('Client not found');
    }

    // Generate installation invoice
    const installationAmount = 2500; // Standard installation fee
    const vatAmount = installationAmount * 0.16;
    const totalAmount = installationAmount + vatAmount;

    // Generate tracking number
    const trackingNumber = `TRK-${Date.now()}-${client.phone.slice(-4)}`;

    // Generate invoice number
    const invoiceNumber = `INST-${Date.now()}`;

    const { data: invoice, error: invoiceError } = await supabaseClient
      .from('installation_invoices')
      .insert({
        client_id: client_id,
        invoice_number: invoiceNumber,
        tracking_number: trackingNumber,
        amount: installationAmount,
        vat_amount: vatAmount,
        total_amount: totalAmount,
        status: 'pending',
        equipment_details: {
          router: 'Standard Wi-Fi Router',
          cable: 'Ethernet Cable (10m)',
          installation: 'Professional Installation'
        },
        notes: `Installation invoice for ${client.name}. Payment required before service activation.`,
        isp_company_id: client.isp_company_id
      })
      .select()
      .single();

    if (invoiceError) {
      throw invoiceError;
    }

    // Send installation invoice SMS
    await fetch(`${Deno.env.get("SUPABASE_URL")}/functions/v1/send-notifications`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")}`
      },
      body: JSON.stringify({
        client_id: client_id,
        type: 'installation_invoice',
        data: {
          invoice_number: invoiceNumber,
          tracking_number: trackingNumber,
          amount: totalAmount,
          payment_instructions: `Pay KES ${totalAmount} to Paybill 123456, Account: ${client.phone}`
        }
      })
    });

    console.log('Installation invoice generated:', invoiceNumber);

    return new Response(
      JSON.stringify({
        success: true,
        invoice,
        message: 'Installation invoice generated and sent to client'
      }),
      {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 200,
      }
    );

  } catch (error) {
    console.error("Error in generate-installation-invoice function:", error);
    return new Response(
      JSON.stringify({ error: error.message }),
      {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 500,
      }
    );
  }
});
