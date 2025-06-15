
import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

interface PackageRenewalRequest {
  client_email: string;
  client_id_number?: string;
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
    console.log('Received renewal request:', requestBody)

    const { client_email, client_id_number, mpesa_number, package_id } = requestBody

    if (!client_email) {
      return new Response(
        JSON.stringify({
          success: false,
          error: 'Email is required',
          code: 'MISSING_EMAIL'
        }),
        { 
          status: 400, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      )
    }

    // Find client - try with ID number first, then email only
    let clientQuery = supabase
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

    if (client_id_number) {
      clientQuery = clientQuery.eq('id_number', client_id_number)
    }

    const { data: client, error: clientError } = await clientQuery.single()

    if (clientError || !client) {
      console.error('Client not found:', clientError)
      return new Response(
        JSON.stringify({
          success: false,
          error: 'Client not found with provided credentials',
          code: 'CLIENT_NOT_FOUND'
        }),
        { 
          status: 404, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      )
    }

    console.log('Client found:', client.name, 'Status:', client.status)

    // Get or create ISP company
    let ispCompanyId = client.isp_company_id
    
    if (!ispCompanyId) {
      console.log('No ISP company associated with client, creating default...')
      
      const { data: existingCompany } = await supabase
        .from('isp_companies')
        .select('id')
        .limit(1)
        .single()
      
      if (existingCompany) {
        ispCompanyId = existingCompany.id
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

      if (!updateError) {
        console.log('Updated M-Pesa number for client:', client.name)
      }
    }

    // Calculate package amount
    const currentPackage = client.service_packages
    const baseAmount = currentPackage?.monthly_rate || client.monthly_rate || 100

    // Generate invoice for payment
    const invoiceNumber = `INV-${Date.now()}-${client.id.substring(0, 8)}`
    const dueDate = new Date()
    dueDate.setHours(dueDate.getHours() + 1) // 1 hour to pay

    const serviceStartDate = new Date()
    const serviceEndDate = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000) // 30 days

    const { data: invoice, error: invoiceError } = await supabase
      .from('invoices')
      .insert({
        invoice_number: invoiceNumber,
        client_id: client.id,
        amount: baseAmount,
        vat_amount: 0,
        total_amount: baseAmount,
        due_date: dueDate.toISOString(),
        service_period_start: serviceStartDate.toISOString(),
        service_period_end: serviceEndDate.toISOString(),
        status: 'pending',
        notes: 'Package renewal payment',
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

    console.log('Invoice created:', invoice.id, 'Amount:', baseAmount)

    // Initiate M-Pesa STK Push
    const mpesaPayload = {
      phoneNumber: mpesa_number || client.mpesa_number || client.phone,
      amount: Math.round(baseAmount),
      accountReference: client.id_number || invoiceNumber,
      transactionDesc: `Package renewal for ${client.name} - ${invoiceNumber}`
    }

    console.log('Initiating M-Pesa payment:', mpesaPayload)

    const { data: mpesaResponse, error: mpesaError } = await supabase.functions.invoke('mpesa-stk-push', {
      body: mpesaPayload,
    })

    if (mpesaError || !mpesaResponse?.ResponseCode || mpesaResponse.ResponseCode !== '0') {
      console.error('M-Pesa STK Push failed:', mpesaError || mpesaResponse)
      return new Response(
        JSON.stringify({
          success: false,
          error: 'Failed to initiate M-Pesa payment',
          code: 'MPESA_ERROR',
          details: mpesaResponse,
          invoice_id: invoice.id
        }),
        { 
          status: 500, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      )
    }

    console.log('Package renewal initiated successfully for:', client.name)

    return new Response(
      JSON.stringify({
        success: true,
        data: {
          invoice: {
            id: invoice.id,
            invoice_number: invoiceNumber,
            amount: baseAmount,
            due_date: dueDate.toISOString()
          },
          mpesa_response: mpesaResponse,
          client: {
            name: client.name,
            email: client.email,
            mpesa_number: mpesa_number || client.mpesa_number || client.phone
          },
          checkout_request_id: mpesaResponse.CheckoutRequestID
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
