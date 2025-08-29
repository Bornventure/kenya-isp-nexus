
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

    // Get client details with service package
    const { data: client, error: clientError } = await supabaseClient
      .from('clients')
      .select(`
        *,
        service_packages (
          id,
          name,
          setup_fee,
          monthly_rate
        )
      `)
      .eq('id', client_id)
      .single();

    if (clientError || !client) {
      throw new Error('Client not found');
    }

    // Get installation fee from service package setup_fee or system settings
    let installationFee = client.service_packages?.setup_fee || 2500;
    
    // If no setup fee in package, get from system settings
    if (!client.service_packages?.setup_fee) {
      const { data: settings } = await supabaseClient
        .from('system_settings')
        .select('installation_fee')
        .eq('isp_company_id', client.isp_company_id)
        .single();
      
      installationFee = settings?.installation_fee || 2500;
    }

    const vatAmount = installationFee * 0.16;
    const totalAmount = installationFee + vatAmount;

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
        amount: installationFee,
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

    // Get payment settings for SMS
    const { data: mpesaSettings } = await supabaseClient
      .from('mpesa_settings')
      .select('*')
      .eq('isp_company_id', client.isp_company_id)
      .eq('is_active', true)
      .single();

    const { data: familyBankSettings } = await supabaseClient
      .from('family_bank_settings')
      .select('*')
      .eq('isp_company_id', client.isp_company_id)
      .eq('is_active', true)
      .single();

    // Send installation invoice SMS with real payment details
    const paymentInstructions = [];
    
    if (mpesaSettings) {
      paymentInstructions.push(`M-Pesa: Paybill ${mpesaSettings.shortcode}, Account: ${client.phone}`);
    }
    
    if (familyBankSettings) {
      paymentInstructions.push(`Family Bank: Paybill ${familyBankSettings.paybill_number}, Account: ${client.phone}`);
    }

    const smsMessage = `Dear ${client.name}, 
Your internet service installation invoice ${invoiceNumber} for KES ${totalAmount.toLocaleString()} has been generated. 
Tracking: ${trackingNumber}
Payment Options:
${paymentInstructions.join('\n')}
Installation will be scheduled after payment confirmation.`;

    // Use Celcomafrica SMS gateway
    await fetch('https://ddljuawonxdnesrnclsx.supabase.co/functions/v1/send-sms', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")}`
      },
      body: JSON.stringify({
        phone: client.phone,
        message: smsMessage,
        gateway: 'celcomafrica'
      })
    });

    console.log('Installation invoice generated:', invoiceNumber);

    return new Response(
      JSON.stringify({
        success: true,
        invoice,
        message: 'Installation invoice generated and SMS sent via Celcomafrica'
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
