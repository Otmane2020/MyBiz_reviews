import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from 'npm:@supabase/supabase-js@2'

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "GET, POST, PUT, DELETE, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type, Authorization",
}

const STRIPE_SECRET_KEY = Deno.env.get('STRIPE_SECRET_KEY')

serve(async (req: Request) => {
  if (req.method === "OPTIONS") {
    return new Response(null, {
      status: 200,
      headers: corsHeaders,
    })
  }

  try {
    if (!STRIPE_SECRET_KEY) {
      throw new Error('Stripe secret key not configured')
    }

    // Initialize Supabase client
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
    const supabase = createClient(supabaseUrl, supabaseServiceKey)

    const { priceId, userId, userEmail, planId, billingCycle, successUrl, cancelUrl } = await req.json()

    if (!priceId || !userId || !userEmail) {
      throw new Error('Missing required parameters: priceId, userId, userEmail')
    }

    // Créer une session Stripe Checkout
    const checkoutResponse = await fetch('https://api.stripe.com/v1/checkout/sessions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${STRIPE_SECRET_KEY}`,
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      body: new URLSearchParams({
        'payment_method_types[]': 'card',
        'line_items[0][price]': priceId,
        'line_items[0][quantity]': '1',
        mode: 'subscription',
        success_url: successUrl || `${req.headers.get('origin')}/success?session_id={CHECKOUT_SESSION_ID}`,
        cancel_url: cancelUrl || `${req.headers.get('origin')}/settings?tab=billing`,
        customer_email: userEmail,
        'metadata[user_id]': userId,
        'metadata[plan_id]': planId || '',
        'metadata[billing_cycle]': billingCycle || 'monthly',
        'subscription_data[metadata][user_id]': userId,
        'subscription_data[metadata][plan_id]': planId || '',
        'subscription_data[metadata][billing_cycle]': billingCycle || 'monthly',
        'subscription_data[trial_period_days]': '14', // 14 jours d'essai gratuit
        allow_promotion_codes: 'true',
        billing_address_collection: 'required',
        'tax_id_collection[enabled]': 'true',
      }),
    })

    const session = await checkoutResponse.json()

    if (!checkoutResponse.ok) {
      console.error('Stripe checkout error:', session)
      throw new Error(`Stripe checkout failed: ${session.error?.message || 'Unknown error'}`)
    }

    // Enregistrer la session dans Supabase pour le suivi
    const { error: dbError } = await supabase
      .from('stripe_sessions')
      .insert([{
        session_id: session.id,
        user_id: userId,
        plan_id: planId,
        billing_cycle: billingCycle,
        price_id: priceId,
        status: 'pending',
        created_at: new Date().toISOString()
      }])

    if (dbError) {
      console.error('Database error:', dbError)
      // Ne pas faire échouer la requête pour une erreur de DB
    }

    return new Response(
      JSON.stringify({
        success: true,
        sessionId: session.id,
        url: session.url
      }),
      {
        headers: {
          'Content-Type': 'application/json',
          ...corsHeaders,
        },
      }
    )

  } catch (error) {
    console.error('Error:', error)
    return new Response(
      JSON.stringify({ 
        success: false,
        error: error.message 
      }),
      {
        status: 500,
        headers: {
          'Content-Type': 'application/json',
          ...corsHeaders,
        },
      }
    )
  }
})