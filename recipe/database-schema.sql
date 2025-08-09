-- Create tables for My Cherthala app
-- Run this in your Supabase SQL editor

-- Enable Row Level Security (RLS)
-- Create users table (extends Supabase auth.users)
CREATE TABLE IF NOT EXISTS public.users (
  id UUID REFERENCES auth.users(id) PRIMARY KEY,
  full_name TEXT NOT NULL,
  email TEXT UNIQUE NOT NULL,
  hometown TEXT,
  avatar_url TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Create categories table
CREATE TABLE IF NOT EXISTS public.categories (
  category_id SERIAL PRIMARY KEY,
  category_name TEXT NOT NULL UNIQUE,
  description TEXT,
  icon_url TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Create locations table
CREATE TABLE IF NOT EXISTS public.locations (
  location_id SERIAL PRIMARY KEY,
  location_name TEXT NOT NULL,
  description TEXT NOT NULL,
  address TEXT,
  latitude DECIMAL(10, 8),
  longitude DECIMAL(11, 8),
  category_id INTEGER REFERENCES public.categories(category_id) ON DELETE SET NULL,
  added_by_id UUID REFERENCES public.users(id) ON DELETE SET NULL,
  date_added TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
  is_verified BOOLEAN DEFAULT false,
  photo_urls TEXT[] DEFAULT '{}'
);

-- Create reviews table
CREATE TABLE IF NOT EXISTS public.reviews (
  review_id SERIAL PRIMARY KEY,
  location_id INTEGER REFERENCES public.locations(location_id) ON DELETE CASCADE,
  user_id UUID REFERENCES public.users(id) ON DELETE SET NULL,
  rating INTEGER CHECK (rating >= 1 AND rating <= 5) NOT NULL,
  review_text TEXT NOT NULL,
  photo_url TEXT,
  review_date TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
  is_verified BOOLEAN DEFAULT false
);

-- Insert some default categories
INSERT INTO public.categories (category_name, description, icon_url) VALUES
('Toddy Shop', 'Traditional toddy shops and palm wine spots', '🥥'),
('Temple', 'Historic temples and religious sites', '🏛️'),
('Restaurant', 'Local restaurants and eateries', '🍛'),
('Beach', 'Beautiful beaches and coastal areas', '🏖️'),
('Market', 'Local markets and shopping areas', '🛒'),
('Heritage', 'Historical and cultural heritage sites', '🏛️'),
('Nature', 'Parks, gardens, and natural attractions', '🌳'),
('Viewpoint', 'Scenic viewpoints and photo spots', '📸')
ON CONFLICT (category_name) DO NOTHING;

-- Enable Row Level Security
ALTER TABLE public.users ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.locations ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.reviews ENABLE ROW LEVEL SECURITY;

-- Create policies for users table
CREATE POLICY "Users can view their own profile" ON public.users
  FOR SELECT USING (auth.uid() = id);

CREATE POLICY "Users can update their own profile" ON public.users
  FOR UPDATE USING (auth.uid() = id);

CREATE POLICY "Users can insert their own profile" ON public.users
  FOR INSERT WITH CHECK (auth.uid() = id);

-- Create policies for categories (public read, authenticated users can contribute)
CREATE POLICY "Anyone can view categories" ON public.categories
  FOR SELECT USING (true);

CREATE POLICY "Authenticated users can insert categories" ON public.categories
  FOR INSERT TO authenticated WITH CHECK (true);

-- Create policies for locations
CREATE POLICY "Anyone can view locations" ON public.locations
  FOR SELECT USING (true);

CREATE POLICY "Authenticated users can insert locations" ON public.locations
  FOR INSERT TO authenticated WITH CHECK (auth.uid() = added_by_id);

CREATE POLICY "Users can update their own locations" ON public.locations
  FOR UPDATE USING (auth.uid() = added_by_id);

CREATE POLICY "Users can delete their own locations" ON public.locations
  FOR DELETE USING (auth.uid() = added_by_id);

-- Create policies for reviews
CREATE POLICY "Anyone can view reviews" ON public.reviews
  FOR SELECT USING (true);

CREATE POLICY "Authenticated users can insert reviews" ON public.reviews
  FOR INSERT TO authenticated WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own reviews" ON public.reviews
  FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own reviews" ON public.reviews
  FOR DELETE USING (auth.uid() = user_id);

-- Create function to automatically create user profile
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger AS $$
BEGIN
  INSERT INTO public.users (id, full_name, email)
  VALUES (new.id, new.raw_user_meta_data->>'full_name', new.email);
  RETURN new;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create trigger for new user registration
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE PROCEDURE public.handle_new_user();
