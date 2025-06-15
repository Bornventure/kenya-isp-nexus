
import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

interface ReceiptRequest {
  client_email: string;
  client_id_number?: string;
  payment_id?: string;
  invoice_id?: string;
  amount?: number;
  payment_method?: string;
  reference_number?: string;
  description?: string;
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    console.log('=== Receipt Generation Request Started ===')

    const supabaseUrl = Deno.env.get('SUPABASE_URL')!
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
    const supabase = createClient(supabaseUrl, supabaseServiceKey)

    const requestBody: ReceiptRequest = await req.json()
    console.log('Generating receipt for:', requestBody.client_email)

    const { 
      client_email, 
      client_id_number, 
      payment_id, 
      invoice_id, 
      amount, 
      payment_method, 
      reference_number, 
      description 
    } = requestBody

    // Find client
    let clientQuery = supabase
      .from('clients')
      .select('*')
      .eq('email', client_email)

    if (client_id_number) {
      clientQuery = clientQuery.eq('id_number', client_id_number)
    }

    const { data: client, error: clientError } = await clientQuery.single()

    if (clientError || !client) {
      console.error('Client not found for receipt:', clientError)
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

    // Get payment or invoice details
    let receiptData: any = {
      client_name: client.name,
      client_email: client.email,
      client_phone: client.phone,
      date: new Date().toISOString(),
      receipt_number: `RCP-${Date.now()}`,
    }

    if (payment_id) {
      const { data: payment } = await supabase
        .from('payments')
        .select('*')
        .eq('id', payment_id)
        .single()

      if (payment) {
        receiptData = {
          ...receiptData,
          amount: payment.amount,
          payment_method: payment.payment_method,
          reference_number: payment.reference_number,
          mpesa_receipt: payment.mpesa_receipt_number,
          description: payment.notes || 'Payment received',
          payment_date: payment.payment_date
        }
      }
    } else if (invoice_id) {
      const { data: invoice } = await supabase
        .from('invoices')
        .select('*')
        .eq('id', invoice_id)
        .single()

      if (invoice) {
        receiptData = {
          ...receiptData,
          amount: invoice.total_amount,
          invoice_number: invoice.invoice_number,
          description: invoice.notes || 'Invoice payment',
          service_period: `${invoice.service_period_start} to ${invoice.service_period_end}`
        }
      }
    } else {
      // Direct receipt generation
      receiptData = {
        ...receiptData,
        amount: amount || 0,
        payment_method: payment_method || 'mpesa',
        reference_number: reference_number,
        description: description || 'Payment received'
      }
    }

    // Generate receipt HTML/PDF content
    const receiptHTML = generateReceiptHTML(receiptData)

    console.log('Receipt generated for:', client.name)

    // Send receipt via email if notification service is available
    try {
      await supabase.functions.invoke('send-notifications', {
        body: {
          client_id: client.id,
          type: 'receipt',
          data: {
            receipt_html: receiptHTML,
            receipt_data: receiptData
          }
        }
      })
      console.log('Receipt sent via email to:', client.email)
    } catch (emailError) {
      console.error('Failed to send receipt email:', emailError)
    }

    return new Response(
      JSON.stringify({
        success: true,
        receipt: receiptData,
        receipt_html: receiptHTML
      }),
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      }
    )

  } catch (error) {
    console.error('Receipt generation error:', error)
    return new Response(
      JSON.stringify({
        success: false,
        error: 'Failed to generate receipt',
        code: 'INTERNAL_ERROR'
      }),
      { 
        status: 500, 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      }
    )
  }
})

function generateReceiptHTML(data: any): string {
  return `
    <!DOCTYPE html>
    <html>
    <head>
        <style>
            body { font-family: Arial, sans-serif; margin: 20px; }
            .header { text-align: center; border-bottom: 2px solid #333; padding-bottom: 20px; }
            .details { margin: 20px 0; }
            .amount { font-size: 24px; font-weight: bold; color: #2563eb; }
            .footer { margin-top: 30px; text-align: center; font-size: 12px; color: #666; }
        </style>
    </head>
    <body>
        <div class="header">
            <h1>Payment Receipt</h1>
            <p>Receipt #: ${data.receipt_number}</p>
            <p>Date: ${new Date(data.date).toLocaleDateString()}</p>
        </div>
        
        <div class="details">
            <p><strong>Client:</strong> ${data.client_name}</p>
            <p><strong>Email:</strong> ${data.client_email}</p>
            <p><strong>Phone:</strong> ${data.client_phone}</p>
            ${data.invoice_number ? `<p><strong>Invoice:</strong> ${data.invoice_number}</p>` : ''}
            <p><strong>Description:</strong> ${data.description}</p>
            ${data.service_period ? `<p><strong>Service Period:</strong> ${data.service_period}</p>` : ''}
            <p><strong>Payment Method:</strong> ${data.payment_method?.toUpperCase() || 'N/A'}</p>
            ${data.reference_number ? `<p><strong>Reference:</strong> ${data.reference_number}</p>` : ''}
            ${data.mpesa_receipt ? `<p><strong>M-Pesa Receipt:</strong> ${data.mpesa_receipt}</p>` : ''}
            <p class="amount"><strong>Amount Paid: KES ${data.amount?.toLocaleString() || '0'}</strong></p>
        </div>
        
        <div class="footer">
            <p>Thank you for your payment!</p>
            <p>This is an automatically generated receipt.</p>
        </div>
    </body>
    </html>
  `
}
