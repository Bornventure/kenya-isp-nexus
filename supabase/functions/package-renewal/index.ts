
import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

interface PackageRenewalRequest {
  client_email: string;
  client_id_number: string;
  mpesa_number?: string;
  package_id?: string;
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    console.log('=== Package Renewal Request Started ===')

    const supabaseUrl = Deno.env.get('SUPABASE_URL')!
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
    const supabase = createClient(supabaseUrl, supabaseServiceKey)

    const requestBody: PackageRenewalRequest = await req.json()
    console.log('Received renewal request for email:', requestBody.client_email)

    const { client_email, client_id_number, mpesa_number, package_id } = requestBody

    if (!client_email || !client_id_number) {
      return new Response(
        JSON.stringify({
          success: false,
          error: 'Email and ID number are required',
          code: 'MISSING_FIELDS'
        }),
        { 
          status: 400, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      )
    }

    // Find client
    const { data: client, error: clientError } = await supabase
      .from('clients')
      .select(`
        id,
        name,
        email,
        phone,
        mpesa_number,
        id_number,
        status,
        monthly_rate,
        service_package_id,
        isp_company_id,
        service_packages (
          id,
          name,
          monthly_rate,
          speed
        )
      `)
      .eq('email', client_email)
      .eq('id_number', client_id_number)
      .single()

    if (clientError || !client) {
      console.error('Client not found:', clientError)
      return new Response(
        JSON.stringify({
          success: false,
          error: 'Client not found',
          code: 'CLIENT_NOT_FOUND'
        }),
        { 
          status: 404, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      )
    }

    // Get or create ISP company
    let ispCompanyId = client.isp_company_id
    
    if (!ispCompanyId) {
      console.log('No ISP company associated with client, checking for default company...')
      
      const { data: existingCompany } = await supabase
        .from('isp_companies')
        .select('id')
        .limit(1)
        .single()
      
      if (existingCompany) {
        ispCompanyId = existingCompany.id
        console.log('Using existing ISP company:', ispCompanyId)
      } else {
        const { data: newCompany, error: companyError } = await supabase
          .from('isp_companies')
          .insert({
            name: 'Default ISP Company',
            license_key: 'DEFAULT-' + Date.now(),
            license_type: 'starter'
          })
          .select('id')
          .single()
        
        if (companyError) {
          console.error('Error creating default ISP company:', companyError)
          return new Response(
            JSON.stringify({
              success: false,
              error: 'Failed to setup ISP company',
              code: 'ISP_COMPANY_ERROR'
            }),
            { 
              status: 500, 
              headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
            }
          )
        }
        
        ispCompanyId = newCompany.id
        console.log('Created default ISP company:', ispCompanyId)
      }
      
      await supabase
        .from('clients')
        .update({ isp_company_id: ispCompanyId })
        .eq('id', client.id)
    }

    // Update M-Pesa number if provided
    if (mpesa_number && mpesa_number !== client.mpesa_number) {
      const { error: updateError } = await supabase
        .from('clients')
        .update({ mpesa_number })
        .eq('id', client.id)

      if (updateError) {
        console.error('Error updating M-Pesa number:', updateError)
      } else {
        console.log('Updated M-Pesa number for client:', client.name)
      }
    }

    // Get package details and calculate correct amounts
    const currentPackage = client.service_packages
    const baseAmount = currentPackage?.monthly_rate || client.monthly_rate || 10

    // Generate invoice for renewal - EXACTLY 30 minutes from now
    const invoiceNumber = `INV-${Date.now()}`
    const dueDate = new Date()
    dueDate.setMinutes(dueDate.getMinutes() + 30) // Exactly 30 minutes

    // IMPORTANT: Don't add VAT here - use base amount only
    const { data: invoice, error: invoiceError } = await supabase
      .from('invoices')
      .insert({
        invoice_number: invoiceNumber,
        client_id: client.id,
        amount: baseAmount, // Base amount without VAT
        vat_amount: 0, // No VAT for testing
        total_amount: baseAmount, // Total = base amount (no VAT)
        due_date: dueDate.toISOString(),
        service_period_start: new Date().toISOString(),
        service_period_end: dueDate.toISOString(),
        status: 'pending',
        notes: 'Package renewal - 30min test package',
        isp_company_id: ispCompanyId
      })
      .select()
      .single()

    if (invoiceError) {
      console.error('Error creating invoice:', invoiceError)
      return new Response(
        JSON.stringify({
          success: false,
          error: 'Failed to create invoice',
          code: 'INVOICE_CREATION_ERROR'
        }),
        { 
          status: 500, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      )
    }

    // Initiate M-Pesa STK Push with base amount only
    const mpesaPayload = {
      phoneNumber: mpesa_number || client.mpesa_number,
      amount: Math.round(baseAmount), // Use base amount only
      accountReference: invoiceNumber,
      transactionDesc: `Package renewal for ${client.name}`
    }

    console.log('Initiating M-Pesa payment with correct amount:', mpesaPayload)

    const { data: mpesaResponse, error: mpesaError } = await supabase.functions.invoke('mpesa-stk-push', {
      body: mpesaPayload,
    })

    if (mpesaError || !mpesaResponse) {
      console.error('M-Pesa STK Push failed:', mpesaError)
      return new Response(
        JSON.stringify({
          success: false,
          error: 'Failed to initiate M-Pesa payment',
          code: 'MPESA_ERROR',
          invoice_id: invoice.id
        }),
        { 
          status: 500, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      )
    }

    console.log('Package renewal initiated successfully for:', client.name)
    console.log('Invoice created with base amount:', baseAmount, 'due at:', dueDate.toISOString())

    return new Response(
      JSON.stringify({
        success: true,
        data: {
          invoice: {
            id: invoice.id,
            invoice_number: invoiceNumber,
            amount: baseAmount, // Return base amount
            due_date: dueDate.toISOString()
          },
          mpesa_response: mpesaResponse,
          client: {
            name: client.name,
            email: client.email,
            mpesa_number: mpesa_number || client.mpesa_number
          }
        }
      }),
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      }
    )

  } catch (error) {
    console.error('Package renewal error:', error)
    return new Response(
      JSON.stringify({
        success: false,
        error: 'Package renewal failed',
        code: 'INTERNAL_ERROR'
      }),
      { 
        status: 500, 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      }
    )
  }
})
