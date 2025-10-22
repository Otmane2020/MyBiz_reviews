/*
  # Create Stripe integration tables

  1. New Tables
    - `stripe_customers`
      - Links Supabase users to Stripe customers
      - `user_id` (uuid, references auth.users)
      - `stripe_customer_id` (text, Stripe customer ID)
    - `stripe_subscriptions`
      - Stores subscription data from Stripe
      - `id` (text, Stripe subscription ID)
      - `user_id` (uuid, references auth.users)
      - `status` (text, subscription status)
      - `stripe_price_id` (text, Stripe price ID)
      - Various subscription metadata fields
    - `stripe_orders`
      - Stores one-time payment data from Stripe
      - `id` (text, Stripe payment intent ID)
      - `user_id` (uuid, references auth.users)
      - `status` (text, payment status)
      - `stripe_price_id` (text, Stripe price ID)
      - Payment metadata fields

  2. Security
    - Enable RLS on all tables
    - Add policies for authenticated users to read their own data
*/

-- Create stripe_customers table
CREATE TABLE IF NOT EXISTS stripe_customers (
  user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE,
  stripe_customer_id text NOT NULL,
  created_at timestamptz DEFAULT now(),
  PRIMARY KEY (user_id)
);

-- Create stripe_subscriptions table
CREATE TABLE IF NOT EXISTS stripe_subscriptions (
  id text PRIMARY KEY,
  user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE,
  status text NOT NULL,
  stripe_price_id text NOT NULL,
  quantity integer DEFAULT 1,
  cancel_at_period_end boolean DEFAULT false,
  current_period_start timestamptz,
  current_period_end timestamptz,
  created timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Create stripe_orders table
CREATE TABLE IF NOT EXISTS stripe_orders (
  id text PRIMARY KEY,
  user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE,
  status text NOT NULL,
  stripe_price_id text NOT NULL,
  quantity integer DEFAULT 1,
  amount_total integer,
  currency text DEFAULT 'eur',
  created timestamptz DEFAULT now()
);

-- Enable RLS
ALTER TABLE stripe_customers ENABLE ROW LEVEL SECURITY;
ALTER TABLE stripe_subscriptions ENABLE ROW LEVEL SECURITY;
ALTER TABLE stripe_orders ENABLE ROW LEVEL SECURITY;

-- Create policies for stripe_customers
CREATE POLICY "Users can read own customer data"
  ON stripe_customers
  FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

-- Create policies for stripe_subscriptions
CREATE POLICY "Users can read own subscription data"
  ON stripe_subscriptions
  FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

-- Create policies for stripe_orders
CREATE POLICY "Users can read own order data"
  ON stripe_orders
  FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_stripe_customers_user_id ON stripe_customers(user_id);
CREATE INDEX IF NOT EXISTS idx_stripe_subscriptions_user_id ON stripe_subscriptions(user_id);
CREATE INDEX IF NOT EXISTS idx_stripe_subscriptions_status ON stripe_subscriptions(status);
CREATE INDEX IF NOT EXISTS idx_stripe_orders_user_id ON stripe_orders(user_id);