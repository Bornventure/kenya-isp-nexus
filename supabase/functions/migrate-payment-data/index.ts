
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
    console.log('=== Payment Data Migration Started ===')

    const supabaseUrl = Deno.env.get('SUPABASE_URL')!
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
    const supabase = createClient(supabaseUrl, supabaseServiceKey)

    // Get all wallet credit transactions that don't have corresponding payment records
    const { data: walletCredits, error: walletError } = await supabase
      .from('wallet_transactions')
      .select(`
        id,
        client_id,
        amount,
        description,
        reference_number,
        mpesa_receipt_number,
        created_at,
        isp_company_id,
        clients (
          name
        )
      `)
      .eq('transaction_type', 'credit')
      .order('created_at', { ascending: false })

    if (walletError) {
      console.error('Error fetching wallet transactions:', walletError)
      return new Response(
        JSON.stringify({
          success: false,
          error: 'Failed to fetch wallet transactions'
        }),
        { 
          status: 500, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      )
    }

    console.log(`Found ${walletCredits?.length || 0} wallet credit transactions`)

    let migratedCount = 0
    const errors: string[] = []

    for (const transaction of walletCredits || []) {
      try {
        // Check if payment record already exists
        const { data: existingPayment } = await supabase
          .from('payments')
          .select('id')
          .eq('client_id', transaction.client_id)
          .eq('amount', transaction.amount)
          .eq('reference_number', transaction.reference_number || '')
          .single()

        if (existingPayment) {
          console.log(`Payment record already exists for transaction ${transaction.id}`)
          continue
        }

        // Determine payment method from description
        let paymentMethod = 'cash'
        if (transaction.description?.toLowerCase().includes('mpesa') || transaction.mpesa_receipt_number) {
          paymentMethod = 'mpesa'
        } else if (transaction.description?.toLowerCase().includes('family bank')) {
          paymentMethod = 'family_bank'
        } else if (transaction.description?.toLowerCase().includes('bank')) {
          paymentMethod = 'bank'
        }

        // Create payment record
        const { error: paymentError } = await supabase
          .from('payments')
          .insert({
            client_id: transaction.client_id,
            amount: transaction.amount,
            payment_method: paymentMethod,
            payment_date: transaction.created_at,
            reference_number: transaction.reference_number || `MIGRATED-${transaction.id}`,
            mpesa_receipt_number: transaction.mpesa_receipt_number,
            notes: `Migrated from wallet transaction: ${transaction.description}`,
            isp_company_id: transaction.isp_company_id
          })

        if (paymentError) {
          console.error(`Error creating payment for transaction ${transaction.id}:`, paymentError)
          errors.push(`Transaction ${transaction.id}: ${paymentError.message}`)
        } else {
          migratedCount++
          console.log(`Migrated payment for ${transaction.clients?.name}: KES ${transaction.amount}`)
        }
      } catch (error) {
        console.error(`Error processing transaction ${transaction.id}:`, error)
        errors.push(`Transaction ${transaction.id}: ${error.message}`)
      }
    }

    console.log(`Migration completed: ${migratedCount} payments migrated`)

    return new Response(
      JSON.stringify({
        success: true,
        migrated_count: migratedCount,
        total_transactions: walletCredits?.length || 0,
        errors: errors
      }),
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      }
    )

  } catch (error) {
    console.error('Migration error:', error)
    return new Response(
      JSON.stringify({
        success: false,
        error: 'Migration failed',
        details: error.message
      }),
      { 
        status: 500, 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      }
    )
  }
})
