
import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    )

    const { companyData, licenseKey } = await req.json()

    // Generate secure password
    const password = Array.from(crypto.getRandomValues(new Uint8Array(12)), 
      byte => '0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz'[byte % 62]).join('')

    // Create auth user
    const { data: authUser, error: authError } = await supabaseClient.auth.admin.createUser({
      email: companyData.contact_email,
      password: password,
      email_confirm: true,
      user_metadata: {
        first_name: companyData.contact_person_name.split(' ')[0],
        last_name: companyData.contact_person_name.split(' ').slice(1).join(' ') || '',
      }
    })

    if (authError) {
      console.error('Error creating auth user:', authError)
      throw authError
    }

    // Create profile
    const { error: profileError } = await supabaseClient
      .from('profiles')
      .insert({
        id: authUser.user.id,
        first_name: companyData.contact_person_name.split(' ')[0],
        last_name: companyData.contact_person_name.split(' ').slice(1).join(' ') || '',
        role: 'isp_admin',
        isp_company_id: companyData.id,
        is_active: true
      })

    if (profileError) {
      console.error('Error creating profile:', profileError)
      throw profileError
    }

    // Send credentials email
    const credentialsResponse = await fetch(`${Deno.env.get('SUPABASE_URL')}/functions/v1/send-user-credentials`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')}`
      },
      body: JSON.stringify({
        email: companyData.contact_email,
        password: password,
        companyName: companyData.name,
        companyId: companyData.id,
        licenseKey: licenseKey,
        contactName: companyData.contact_person_name
      })
    })

    if (!credentialsResponse.ok) {
      console.error('Error sending credentials email')
    }

    return new Response(
      JSON.stringify({ 
        success: true, 
        message: 'ISP account created and credentials sent',
        userId: authUser.user.id
      }),
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200,
      },
    )

  } catch (error) {
    console.error('Error:', error)
    return new Response(
      JSON.stringify({ error: error.message }),
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 400,
      },
    )
  }
})
