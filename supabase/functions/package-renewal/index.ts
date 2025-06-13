
import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

interface PackageRenewalRequest {
  client_email: string;
  client_id_number: string;
  mpesa_number?: string; // Optional, will use existing if not provided
  package_id?: string; // Optional, will use current package if not provided
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

    // Get package details
    const currentPackage = client.service_packages
    const renewalAmount = currentPackage?.monthly_rate || client.monthly_rate || 10

    // Generate invoice for renewal
    const invoiceNumber = `INV-${Date.now()}`
    const dueDate = new Date()
    dueDate.setMinutes(dueDate.getMinutes() + 30) // 30 minutes for testing

    const vatAmount = renewalAmount * 0.16
    const totalAmount = renewalAmount + vatAmount

    const { data: invoice, error: invoiceError } = await supabase
      .from('invoices')
      .insert({
        invoice_number: invoiceNumber,
        client_id: client.id,
        amount: renewalAmount,
        vat_amount: vatAmount,
        total_amount: totalAmount,
        due_date: dueDate.toISOString(),
        service_period_start: new Date().toISOString(),
        service_period_end: dueDate.toISOString(),
        status: 'pending',
        notes: 'Package renewal - Testing',
        isp_company_id: client.isp_company_id || '00000000-0000-0000-0000-000000000000'
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

    // Initiate M-Pesa STK Push
    const mpesaPayload = {
      phoneNumber: mpesa_number || client.mpesa_number,
      amount: Math.round(totalAmount),
      accountReference: invoiceNumber,
      transactionDesc: `Package renewal for ${client.name}`
    }

    console.log('Initiating M-Pesa payment:', mpesaPayload)

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

    return new Response(
      JSON.stringify({
        success: true,
        data: {
          invoice: {
            id: invoice.id,
            invoice_number: invoiceNumber,
            amount: totalAmount,
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
