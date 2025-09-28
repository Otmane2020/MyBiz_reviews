/*
  # Create reviews table and notification system

  1. New Tables
    - `reviews`
      - `id` (bigint, primary key)
      - `review_id` (text, unique)
      - `location_id` (text)
      - `author` (text)
      - `rating` (integer)
      - `comment` (text)
      - `review_date` (timestamptz)
      - `replied` (boolean)
      - `created_at` (timestamptz)
      - `updated_at` (timestamptz)

  2. Security
    - Enable RLS on `reviews` table
    - Add policies for authenticated users
    - Enable realtime for notifications

  3. Indexes
    - Index on review_id for fast lookups
    - Index on location_id for filtering
    - Index on created_at for ordering
*/

CREATE TABLE IF NOT EXISTS reviews (
  id bigint GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  review_id text UNIQUE NOT NULL,
  location_id text NOT NULL,
  author text NOT NULL,
  rating integer NOT NULL CHECK (rating >= 1 AND rating <= 5),
  comment text DEFAULT '',
  review_date timestamptz NOT NULL,
  replied boolean DEFAULT false,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Indexes for performance
CREATE INDEX IF NOT EXISTS idx_reviews_review_id ON reviews (review_id);
CREATE INDEX IF NOT EXISTS idx_reviews_location_id ON reviews (location_id);
CREATE INDEX IF NOT EXISTS idx_reviews_created_at ON reviews (created_at DESC);
CREATE INDEX IF NOT EXISTS idx_reviews_rating ON reviews (rating);

-- Enable Row Level Security
ALTER TABLE reviews ENABLE ROW LEVEL SECURITY;

-- Policies
CREATE POLICY "Authenticated users can read all reviews"
  ON reviews
  FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Authenticated users can insert reviews"
  ON reviews
  FOR INSERT
  TO authenticated
  WITH CHECK (true);

CREATE POLICY "Authenticated users can update reviews"
  ON reviews
  FOR UPDATE
  TO authenticated
  USING (true);

-- Enable realtime
ALTER PUBLICATION supabase_realtime ADD TABLE reviews;