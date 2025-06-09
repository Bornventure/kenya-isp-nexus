
import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

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
    // Initialize Supabase client
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!
    const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
    const supabase = createClient(supabaseUrl, supabaseKey)

    if (req.method !== 'POST') {
      throw new Error('Method not allowed');
    }

    const clientData = await req.json();
    console.log('Received client registration data:', clientData);

    // Validate required fields
    const requiredFields = ['name', 'email', 'phone', 'id_number', 'address', 'sub_county', 'client_type', 'connection_type'];
    for (const field of requiredFields) {
      if (!clientData[field]) {
        throw new Error(`Missing required field: ${field}`);
      }
    }

    // Insert client into database
    const { data: client, error } = await supabase
      .from('clients')
      .insert({
        name: clientData.name,
        email: clientData.email,
        phone: clientData.phone,
        mpesa_number: clientData.mpesa_number,
        id_number: clientData.id_number,
        kra_pin_number: clientData.kra_pin_number,
        client_type: clientData.client_type,
        connection_type: clientData.connection_type,
        address: clientData.address,
        county: clientData.county,
        sub_county: clientData.sub_county,
        service_package_id: clientData.service_package_id || null,
        isp_company_id: clientData.isp_company_id,
        monthly_rate: 0, // Default value, will be updated when service package is assigned
        status: 'pending'
      })
      .select()
      .single();

    if (error) {
      console.error('Database error:', error);
      throw new Error(`Failed to register client: ${error.message}`);
    }

    console.log('Client registered successfully:', client);

    return new Response(
      JSON.stringify({
        success: true,
        message: 'Client registration submitted successfully. We will contact you within 24 hours to complete the setup.',
        client: client
      }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200,
      }
    );

  } catch (error) {
    console.error('Registration error:', error);
    
    return new Response(
      JSON.stringify({
        success: false,
        error: error.message || 'Failed to register client'
      }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 400,
      }
    );
  }
})
