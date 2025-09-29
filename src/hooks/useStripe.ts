import { useState, useEffect } from 'react';

interface StripeProduct {
  id: string;
  name: string;
  description: string;
  prices: {
    id: string;
    unit_amount: number;
    currency: string;
    recurring: {
      interval: string;
    };
    nickname: string;
    metadata: {
      plan_id: string;
      billing_cycle: string;
    };
  }[];
}

interface CheckoutSession {
  sessionId: string;
  url: string;
}

export const useStripe = () => {
  const [products, setProducts] = useState<StripeProduct[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const createProducts = async () => {
    setLoading(true);
    setError(null);
    
    try {
      const response = await fetch(`${import.meta.env.VITE_SUPABASE_URL}/functions/v1/stripe-products`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${import.meta.env.VITE_SUPABASE_ANON_KEY}`,
        },
        body: JSON.stringify({
          action: 'create-products'
        }),
      });

      const data = await response.json();
      
      if (!response.ok) {
        throw new Error(data.error || 'Failed to create products');
      }

      console.log('Products created successfully:', data.products);
      await fetchProducts(); // Refresh the products list
      
      return data.products;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Unknown error';
      setError(errorMessage);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const fetchProducts = async () => {
    setLoading(true);
    setError(null);
    
    try {
      const response = await fetch(`${import.meta.env.VITE_SUPABASE_URL}/functions/v1/stripe-products`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${import.meta.env.VITE_SUPABASE_ANON_KEY}`,
        },
        body: JSON.stringify({
          action: 'list-products'
        }),
      });

      const data = await response.json();
      
      if (!response.ok) {
        throw new Error(data.error || 'Failed to fetch products');
      }

      setProducts(data.products);
      return data.products;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Unknown error';
      setError(errorMessage);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const createCheckoutSession = async (
    priceId: string,
    userId: string,
    userEmail: string,
    planId: string,
    billingCycle: 'monthly' | 'annual' = 'monthly'
  ): Promise<CheckoutSession> => {
    setLoading(true);
    setError(null);
    
    try {
      const response = await fetch(`${import.meta.env.VITE_SUPABASE_URL}/functions/v1/stripe-checkout`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${import.meta.env.VITE_SUPABASE_ANON_KEY}`,
        },
        body: JSON.stringify({
          priceId,
          userId,
          userEmail,
          planId,
          billingCycle,
          successUrl: `${window.location.origin}/success?session_id={CHECKOUT_SESSION_ID}`,
          cancelUrl: `${window.location.origin}/settings?tab=billing`,
        }),
      });

      const data = await response.json();
      
      if (!response.ok || !data.success) {
        throw new Error(data.error || 'Failed to create checkout session');
      }

      return {
        sessionId: data.sessionId,
        url: data.url
      };
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Unknown error';
      setError(errorMessage);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const redirectToCheckout = async (
    priceId: string,
    userId: string,
    userEmail: string,
    planId: string,
    billingCycle: 'monthly' | 'annual' = 'monthly'
  ) => {
    try {
      const session = await createCheckoutSession(priceId, userId, userEmail, planId, billingCycle);
      
      // Redirect to Stripe Checkout
      window.location.href = session.url;
    } catch (err) {
      console.error('Error redirecting to checkout:', err);
      throw err;
    }
  };

  return {
    products,
    loading,
    error,
    createProducts,
    fetchProducts,
    createCheckoutSession,
    redirectToCheckout,
  };
};