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

        // Mettre à jour le profil utilisateur
        const { error: profileError } = await supabase
          .from('profiles')
          .update({
            stripe_customer_id: session.customer,
            stripe_subscription_id: session.subscription,
            subscription_status: 'trialing', // 14 jours d'essai
            plan_id: session.metadata?.plan_id || 'starter',
            billing_cycle: session.metadata?.billing_cycle || 'monthly',
            trial_end: new Date(subscription.trial_end * 1000).toISOString(),
            updated_at: new Date().toISOString()
          })
          .eq('id', session.metadata?.user_id)

        if (profileError) {
          console.error('Error updating profile:', profileError)
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

        // Mettre à jour le statut de l'abonnement
        const { error } = await supabase
          .from('profiles')
          .update({
            subscription_status: subscription.status,
            current_period_start: new Date(subscription.current_period_start * 1000).toISOString(),
            current_period_end: new Date(subscription.current_period_end * 1000).toISOString(),
            trial_end: subscription.trial_end ? new Date(subscription.trial_end * 1000).toISOString() : null,
            updated_at: new Date().toISOString()
          })
          .eq('stripe_subscription_id', subscription.id)

        if (error) {
          console.error('Error updating subscription:', error)
        }

        break
      }

      case 'customer.subscription.deleted': {
        const subscription = event.data.object
        console.log('Subscription cancelled:', subscription.id)

        // Marquer l'abonnement comme annulé
        const { error } = await supabase
          .from('profiles')
          .update({
            subscription_status: 'cancelled',
            stripe_subscription_id: null,
            updated_at: new Date().toISOString()
          })
          .eq('stripe_subscription_id', subscription.id)

        if (error) {
          console.error('Error cancelling subscription:', error)
        }

        break
      }

      case 'invoice.payment_succeeded': {
        const invoice = event.data.object
        console.log('Payment succeeded:', invoice.id)

        // Si c'est le premier paiement après l'essai
        if (invoice.billing_reason === 'subscription_cycle') {
          const { error } = await supabase
            .from('profiles')
            .update({
              subscription_status: 'active',
              updated_at: new Date().toISOString()
            })
            .eq('stripe_subscription_id', invoice.subscription)

          if (error) {
            console.error('Error activating subscription:', error)
          }
        }

        break
      }

      case 'invoice.payment_failed': {
        const invoice = event.data.object
        console.log('Payment failed:', invoice.id)

        // Marquer comme impayé
        const { error } = await supabase
          .from('profiles')
          .update({
            subscription_status: 'past_due',
            updated_at: new Date().toISOString()
          })
          .eq('stripe_subscription_id', invoice.subscription)

        if (error) {
          console.error('Error updating payment failure:', error)
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