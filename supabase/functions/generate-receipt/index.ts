
import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

interface ReceiptRequest {
  payment_id?: string;
  invoice_id?: string;
  client_email: string;
  client_id_number?: string;
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
    console.log('Receipt generation request:', requestBody)

    const { payment_id, invoice_id, client_email, client_id_number } = requestBody

    if (!client_email) {
      return new Response(
        JSON.stringify({
          success: false,
          error: 'Client email is required',
          code: 'MISSING_EMAIL'
        }),
        { 
          status: 400, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      )
    }

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

    // Get payment and invoice data
    let receiptData: any = {}

    if (payment_id) {
      const { data: payment, error: paymentError } = await supabase
        .from('payments')
        .select(`
          *,
          invoices (
            invoice_number,
            service_period_start,
            service_period_end,
            amount,
            total_amount
          )
        `)
        .eq('id', payment_id)
        .eq('client_id', client.id)
        .single()

      if (payment) {
        receiptData = {
          type: 'payment',
          receipt_number: `RCP-${payment.id.substring(0, 8).toUpperCase()}`,
          payment_id: payment.id,
          invoice_number: payment.invoices?.invoice_number || 'N/A',
          amount: payment.amount,
          payment_method: payment.payment_method,
          payment_date: payment.payment_date,
          reference_number: payment.reference_number,
          mpesa_receipt: payment.mpesa_receipt_number,
          service_period: payment.invoices ? {
            start: payment.invoices.service_period_start,
            end: payment.invoices.service_period_end
          } : null
        }
      }
    }

    if (invoice_id && !receiptData.type) {
      const { data: invoice, error: invoiceError } = await supabase
        .from('invoices')
        .select('*')
        .eq('id', invoice_id)
        .eq('client_id', client.id)
        .single()

      if (invoice) {
        receiptData = {
          type: 'invoice',
          receipt_number: `INV-${invoice.id.substring(0, 8).toUpperCase()}`,
          invoice_id: invoice.id,
          invoice_number: invoice.invoice_number,
          amount: invoice.total_amount,
          status: invoice.status,
          due_date: invoice.due_date,
          service_period: {
            start: invoice.service_period_start,
            end: invoice.service_period_end
          }
        }
      }
    }

    if (!receiptData.type) {
      return new Response(
        JSON.stringify({
          success: false,
          error: 'No payment or invoice found',
          code: 'NO_DATA_FOUND'
        }),
        { 
          status: 404, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      )
    }

    // Generate receipt HTML
    const receiptHtml = generateReceiptHtml(client, receiptData)

    return new Response(
      JSON.stringify({
        success: true,
        receipt: {
          ...receiptData,
          client: {
            name: client.name,
            email: client.email,
            phone: client.phone,
            id_number: client.id_number
          },
          generated_at: new Date().toISOString()
        },
        html: receiptHtml
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
        error: 'Receipt generation failed',
        code: 'INTERNAL_ERROR'
      }),
      { 
        status: 500, 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      }
    )
  }
})

function generateReceiptHtml(client: any, receiptData: any): string {
  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-KE', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    })
  }

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-KE', {
      style: 'currency',
      currency: 'KES'
    }).format(amount)
  }

  return `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="UTF-8">
      <title>Receipt - ${receiptData.receipt_number}</title>
      <style>
        body { font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; }
        .header { text-align: center; border-bottom: 2px solid #333; padding-bottom: 20px; margin-bottom: 20px; }
        .company-name { font-size: 24px; font-weight: bold; color: #333; }
        .receipt-title { font-size: 20px; color: #666; margin-top: 10px; }
        .section { margin-bottom: 20px; }
        .section-title { font-weight: bold; color: #333; margin-bottom: 10px; border-bottom: 1px solid #ddd; padding-bottom: 5px; }
        .row { display: flex; justify-content: space-between; margin-bottom: 8px; }
        .label { font-weight: bold; }
        .total { border-top: 2px solid #333; padding-top: 10px; font-size: 18px; font-weight: bold; }
        .footer { text-align: center; margin-top: 30px; padding-top: 20px; border-top: 1px solid #ddd; color: #666; }
        @media print { body { margin: 0; } }
      </style>
    </head>
    <body>
      <div class="header">
        <div class="company-name">ISP Management System</div>
        <div class="receipt-title">${receiptData.type === 'payment' ? 'Payment Receipt' : 'Invoice'}</div>
        <div>Receipt #: ${receiptData.receipt_number}</div>
      </div>

      <div class="section">
        <div class="section-title">Client Information</div>
        <div class="row"><span class="label">Name:</span><span>${client.name}</span></div>
        <div class="row"><span class="label">Email:</span><span>${client.email}</span></div>
        <div class="row"><span class="label">Phone:</span><span>${client.phone}</span></div>
        <div class="row"><span class="label">ID Number:</span><span>${client.id_number}</span></div>
      </div>

      ${receiptData.type === 'payment' ? `
      <div class="section">
        <div class="section-title">Payment Details</div>
        <div class="row"><span class="label">Payment Date:</span><span>${formatDate(receiptData.payment_date)}</span></div>
        <div class="row"><span class="label">Payment Method:</span><span>${receiptData.payment_method.toUpperCase()}</span></div>
        <div class="row"><span class="label">Reference:</span><span>${receiptData.reference_number || 'N/A'}</span></div>
        ${receiptData.mpesa_receipt ? `<div class="row"><span class="label">M-Pesa Receipt:</span><span>${receiptData.mpesa_receipt}</span></div>` : ''}
        <div class="row"><span class="label">Invoice:</span><span>${receiptData.invoice_number}</span></div>
      </div>
      ` : `
      <div class="section">
        <div class="section-title">Invoice Details</div>
        <div class="row"><span class="label">Invoice Number:</span><span>${receiptData.invoice_number}</span></div>
        <div class="row"><span class="label">Status:</span><span>${receiptData.status.toUpperCase()}</span></div>
        <div class="row"><span class="label">Due Date:</span><span>${formatDate(receiptData.due_date)}</span></div>
      </div>
      `}

      ${receiptData.service_period ? `
      <div class="section">
        <div class="section-title">Service Period</div>
        <div class="row"><span class="label">From:</span><span>${formatDate(receiptData.service_period.start)}</span></div>
        <div class="row"><span class="label">To:</span><span>${formatDate(receiptData.service_period.end)}</span></div>
      </div>
      ` : ''}

      <div class="section">
        <div class="total">
          <div class="row"><span class="label">Total Amount:</span><span>${formatCurrency(receiptData.amount)}</span></div>
        </div>
      </div>

      <div class="footer">
        <p>Thank you for your business!</p>
        <p>Generated on ${formatDate(new Date().toISOString())}</p>
      </div>
    </body>
    </html>
  `
}
