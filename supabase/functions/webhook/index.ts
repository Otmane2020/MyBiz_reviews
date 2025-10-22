import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'
import Stripe from 'https://esm.sh/stripe@14.21.0'

const stripe = new Stripe(Deno.env.get('STRIPE_SECRET_KEY') || '', {
  apiVersion: '2023-10-16',
})

const cryptoProvider = Stripe.createSubtleCryptoProvider()

serve(async (request) => {
  const signature = request.headers.get('Stripe-Signature')

  if (!signature) {
    return new Response('No signature', { status: 400 })
  }

  const body = await request.text()
  let receivedEvent: Stripe.Event

  try {
    receivedEvent = await stripe.webhooks.constructEventAsync(
      body,
      signature,
      Deno.env.get('STRIPE_WEBHOOK_SECRET') || '',
      undefined,
      cryptoProvider
    )
  } catch (err) {
    console.log(`Webhook signature verification failed.`, err.message)
    return new Response(err.message, { status: 400 })
  }

  const supabaseClient = createClient(
    Deno.env.get('SUPABASE_URL') ?? '',
    Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
  )

  switch (receivedEvent.type) {
    case 'checkout.session.completed': {
      const session = receivedEvent.data.object as Stripe.Checkout.Session
      
      if (session.mode === 'subscription') {
        const subscription = await stripe.subscriptions.retrieve(session.subscription as string)
        
        await supabaseClient
          .from('stripe_subscriptions')
          .insert({
            id: subscription.id,
            user_id: session.metadata?.user_id,
            status: subscription.status,
            stripe_price_id: subscription.items.data[0].price.id,
            quantity: subscription.items.data[0].quantity,
            cancel_at_period_end: subscription.cancel_at_period_end,
            current_period_start: new Date(subscription.current_period_start * 1000).toISOString(),
            current_period_end: new Date(subscription.current_period_end * 1000).toISOString(),
            created: new Date(subscription.created * 1000).toISOString(),
          })
      }
      break
    }

    case 'customer.subscription.updated': {
      const subscription = receivedEvent.data.object as Stripe.Subscription
      
      await supabaseClient
        .from('stripe_subscriptions')
        .update({
          status: subscription.status,
          cancel_at_period_end: subscription.cancel_at_period_end,
          current_period_start: new Date(subscription.current_period_start * 1000).toISOString(),
          current_period_end: new Date(subscription.current_period_end * 1000).toISOString(),
        })
        .eq('id', subscription.id)
      break
    }

    case 'customer.subscription.deleted': {
      const subscription = receivedEvent.data.object as Stripe.Subscription
      
      await supabaseClient
        .from('stripe_subscriptions')
        .update({ status: 'canceled' })
        .eq('id', subscription.id)
      break
    }

    default:
      console.log(`Unhandled event type: ${receivedEvent.type}`)
  }

  return new Response(JSON.stringify({ received: true }), {
    headers: { 'Content-Type': 'application/json' },
    status: 200,
  })
})