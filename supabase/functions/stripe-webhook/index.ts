import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from 'npm:@supabase/supabase-js@2'

const STRIPE_SECRET_KEY = Deno.env.get('STRIPE_SECRET_KEY')
const STRIPE_WEBHOOK_SECRET = Deno.env.get('STRIPE_WEBHOOK_SECRET')

serve(async (req: Request) => {
  try {
    if (!STRIPE_SECRET_KEY || !STRIPE_WEBHOOK_SECRET) {
      throw new Error('Stripe keys not configured')
    }

    // Initialize Supabase client
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
    const supabase = createClient(supabaseUrl, supabaseServiceKey)

    const body = await req.text()
    const signature = req.headers.get('stripe-signature')

    if (!signature) {
      throw new Error('No Stripe signature found')
    }

    // Vérifier la signature du webhook
    const event = await verifyStripeWebhook(body, signature, STRIPE_WEBHOOK_SECRET)

    console.log('Webhook event:', event.type)

    switch (event.type) {
      case 'checkout.session.completed': {
        const session = event.data.object
        console.log('Checkout session completed:', session.id)

        // Récupérer les détails de l'abonnement
        const subscription = await fetch(`https://api.stripe.com/v1/subscriptions/${session.subscription}`, {
          headers: {
            'Authorization': `Bearer ${STRIPE_SECRET_KEY}`,
          },
        }).then(res => res.json())

        // Update client profile
        const planTypeMap: { [key: string]: string } = {
          'starter': 'starter',
          'pro': 'pro',
          'business': 'business'
        };

        const maxLocationsMap: { [key: string]: number } = {
          'starter': 1,
          'pro': 3,
          'business': 999
        };

        const planId = session.metadata?.plan_id || 'starter';

        const { error: clientError } = await supabase
          .from('clients')
          .update({
            plan_type: planTypeMap[planId] || 'starter',
            plan_status: 'trial',
            trial_ends_at: new Date(subscription.trial_end * 1000).toISOString(),
            max_locations: maxLocationsMap[planId] || 1,
            updated_at: new Date().toISOString()
          })
          .eq('id', session.metadata?.user_id);

        if (clientError) {
          console.error('Error updating client:', clientError);
        }

        // Update usage tracking limit based on plan
        const aiLimitsMap: { [key: string]: number } = {
          'starter': 50,
          'pro': 300,
          'business': 1000
        };

        const currentMonth = new Date().toISOString().slice(0, 7) + '-01';
        const { error: usageError } = await supabase
          .from('usage_tracking')
          .update({
            ai_replies_limit: aiLimitsMap[planId] || 50
          })
          .eq('user_id', session.metadata?.user_id)
          .eq('month', currentMonth);

        if (usageError) {
          console.error('Error updating usage tracking:', usageError);
        }

        // Mettre à jour la session dans la DB
        const { error: sessionError } = await supabase
          .from('stripe_sessions')
          .update({
            status: 'completed',
            stripe_customer_id: session.customer,
            stripe_subscription_id: session.subscription,
            updated_at: new Date().toISOString()
          })
          .eq('session_id', session.id)

        if (sessionError) {
          console.error('Error updating session:', sessionError)
        }

        break
      }

      case 'customer.subscription.updated': {
        const subscription = event.data.object
        console.log('Subscription updated:', subscription.id)

        // Map Stripe status to our plan_status
        const statusMap: { [key: string]: string } = {
          'active': 'active',
          'trialing': 'trial',
          'past_due': 'active',
          'canceled': 'cancelled',
          'unpaid': 'expired'
        };

        const planStatus = statusMap[subscription.status] || 'active';

        const { error } = await supabase
          .from('clients')
          .update({
            plan_status: planStatus,
            trial_ends_at: subscription.trial_end ? new Date(subscription.trial_end * 1000).toISOString() : null,
            updated_at: new Date().toISOString()
          })
          .eq('id', subscription.metadata?.user_id);

        if (error) {
          console.error('Error updating subscription:', error);
        }

        break
      }

      case 'customer.subscription.deleted': {
        const subscription = event.data.object
        console.log('Subscription cancelled:', subscription.id)

        // Mark subscription as cancelled
        const { error } = await supabase
          .from('clients')
          .update({
            plan_status: 'cancelled',
            updated_at: new Date().toISOString()
          })
          .eq('id', subscription.metadata?.user_id);

        if (error) {
          console.error('Error cancelling subscription:', error);
        }

        break
      }

      case 'invoice.payment_succeeded': {
        const invoice = event.data.object
        console.log('Payment succeeded:', invoice.id)

        // If this is the first payment after trial
        if (invoice.billing_reason === 'subscription_cycle') {
          const { error } = await supabase
            .from('clients')
            .update({
              plan_status: 'active',
              updated_at: new Date().toISOString()
            })
            .eq('id', invoice.metadata?.user_id);

          if (error) {
            console.error('Error activating subscription:', error);
          }
        }

        break
      }

      case 'invoice.payment_failed': {
        const invoice = event.data.object
        console.log('Payment failed:', invoice.id)

        // Mark as past due
        const { error } = await supabase
          .from('clients')
          .update({
            plan_status: 'active',
            updated_at: new Date().toISOString()
          })
          .eq('id', invoice.metadata?.user_id);

        if (error) {
          console.error('Error updating payment failure:', error);
        }

        break
      }

      default:
        console.log('Unhandled event type:', event.type)
    }

    return new Response(JSON.stringify({ received: true }), {
      status: 200,
      headers: { 'Content-Type': 'application/json' },
    })

  } catch (error) {
    console.error('Webhook error:', error)
    return new Response(
      JSON.stringify({ error: error.message }),
      {
        status: 400,
        headers: { 'Content-Type': 'application/json' },
      }
    )
  }
})

async function verifyStripeWebhook(body: string, signature: string, secret: string) {
  // Simplified webhook verification for Deno
  // In production, you should use the official Stripe library
  const elements = signature.split(',')
  const timestamp = elements.find(el => el.startsWith('t='))?.split('=')[1]
  const signatures = elements.filter(el => el.startsWith('v1='))

  if (!timestamp || signatures.length === 0) {
    throw new Error('Invalid signature format')
  }

  // Create the signed payload
  const payload = `${timestamp}.${body}`
  
  // Create HMAC
  const encoder = new TextEncoder()
  const key = await crypto.subtle.importKey(
    'raw',
    encoder.encode(secret),
    { name: 'HMAC', hash: 'SHA-256' },
    false,
    ['sign']
  )
  
  const signature_bytes = await crypto.subtle.sign('HMAC', key, encoder.encode(payload))
  const expected_signature = Array.from(new Uint8Array(signature_bytes))
    .map(b => b.toString(16).padStart(2, '0'))
    .join('')

  // Verify signature
  const provided_signature = signatures[0].split('=')[1]
  if (expected_signature !== provided_signature) {
    throw new Error('Invalid signature')
  }

  // Parse and return the event
  return JSON.parse(body)
}