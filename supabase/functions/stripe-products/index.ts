import { serve } from "https://deno.land/std@0.168.0/http/server.ts"

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

    const { action } = await req.json()

    if (action === 'create-products') {
      // Créer les produits Starlinko dans Stripe
      const products = [
        {
          id: 'starter',
          name: 'Starter',
          description: 'Plan Starter - 1 établissement, 50 avis/mois, IA basique',
          monthlyPrice: 990, // €9.90 en centimes
          annualPrice: 9504, // €95.04 en centimes (20% de réduction)
        },
        {
          id: 'pro',
          name: 'Pro',
          description: 'Plan Pro - 3 établissements, 300 avis/mois, IA premium',
          monthlyPrice: 2990, // €29.90 en centimes
          annualPrice: 28704, // €287.04 en centimes (20% de réduction)
        },
        {
          id: 'business',
          name: 'Business',
          description: 'Plan Business - Établissements illimités, 1000 avis/mois, IA premium + posts auto',
          monthlyPrice: 7990, // €79.90 en centimes
          annualPrice: 76704, // €767.04 en centimes (20% de réduction)
        }
      ]

      const createdProducts = []

      for (const product of products) {
        // Créer le produit
        const productResponse = await fetch('https://api.stripe.com/v1/products', {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${STRIPE_SECRET_KEY}`,
            'Content-Type': 'application/x-www-form-urlencoded',
          },
          body: new URLSearchParams({
            id: `starlinko_${product.id}`,
            name: `Starlinko ${product.name}`,
            description: product.description,
            metadata: JSON.stringify({
              plan_id: product.id,
              features: product.id === 'starter' ? '1_establishment,50_reviews,basic_ai' : 
                       product.id === 'pro' ? '3_establishments,300_reviews,premium_ai' :
                       'unlimited_establishments,1000_reviews,premium_ai_plus_posts'
            })
          }),
        })

        const stripeProduct = await productResponse.json()

        if (!productResponse.ok) {
          console.error('Error creating product:', stripeProduct)
          continue
        }

        // Créer le prix mensuel
        const monthlyPriceResponse = await fetch('https://api.stripe.com/v1/prices', {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${STRIPE_SECRET_KEY}`,
            'Content-Type': 'application/x-www-form-urlencoded',
          },
          body: new URLSearchParams({
            product: stripeProduct.id,
            unit_amount: product.monthlyPrice.toString(),
            currency: 'eur',
            recurring: JSON.stringify({ interval: 'month' }),
            nickname: `${product.name} Monthly`,
            metadata: JSON.stringify({
              plan_id: product.id,
              billing_cycle: 'monthly'
            })
          }),
        })

        const monthlyPrice = await monthlyPriceResponse.json()

        // Créer le prix annuel
        const annualPriceResponse = await fetch('https://api.stripe.com/v1/prices', {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${STRIPE_SECRET_KEY}`,
            'Content-Type': 'application/x-www-form-urlencoded',
          },
          body: new URLSearchParams({
            product: stripeProduct.id,
            unit_amount: product.annualPrice.toString(),
            currency: 'eur',
            recurring: JSON.stringify({ interval: 'year' }),
            nickname: `${product.name} Annual`,
            metadata: JSON.stringify({
              plan_id: product.id,
              billing_cycle: 'annual'
            })
          }),
        })

        const annualPrice = await annualPriceResponse.json()

        createdProducts.push({
          product: stripeProduct,
          monthlyPrice,
          annualPrice
        })
      }

      return new Response(
        JSON.stringify({
          success: true,
          products: createdProducts
        }),
        {
          headers: {
            'Content-Type': 'application/json',
            ...corsHeaders,
          },
        }
      )
    }

    if (action === 'list-products') {
      // Lister tous les produits Starlinko
      const productsResponse = await fetch('https://api.stripe.com/v1/products?active=true&limit=100', {
        headers: {
          'Authorization': `Bearer ${STRIPE_SECRET_KEY}`,
        },
      })

      const products = await productsResponse.json()

      // Filtrer les produits Starlinko
      const starlinkoProducts = products.data.filter((product: any) => 
        product.id.startsWith('starlinko_')
      )

      // Récupérer les prix pour chaque produit
      const productsWithPrices = await Promise.all(
        starlinkoProducts.map(async (product: any) => {
          const pricesResponse = await fetch(`https://api.stripe.com/v1/prices?product=${product.id}&active=true`, {
            headers: {
              'Authorization': `Bearer ${STRIPE_SECRET_KEY}`,
            },
          })
          const prices = await pricesResponse.json()
          return {
            ...product,
            prices: prices.data
          }
        })
      )

      return new Response(
        JSON.stringify({
          success: true,
          products: productsWithPrices
        }),
        {
          headers: {
            'Content-Type': 'application/json',
            ...corsHeaders,
          },
        }
      )
    }

    return new Response(
      JSON.stringify({ error: 'Action not supported' }),
      {
        status: 400,
        headers: {
          'Content-Type': 'application/json',
          ...corsHeaders,
        },
      }
    )

  } catch (error) {
    console.error('Error:', error)
    return new Response(
      JSON.stringify({ error: error.message }),
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