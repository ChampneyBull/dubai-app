-- SOCIAL AUTH SETUP (Supabase SQL Editor)
-- Run this in your Supabase SQL Editor to enable automatic linkage between Social Logins and Golfers.

-- 1. Add columns to link Supabase Users to Golfers
ALTER TABLE golfers ADD COLUMN IF NOT EXISTS supabase_id UUID REFERENCES auth.users(id);
ALTER TABLE golfers ADD COLUMN IF NOT EXISTS email TEXT UNIQUE;

-- 2. Create the linking function
-- This function runs whenever a new user is created in Supabase Auth.
-- It checks if the email matches an existing golfer and links them.
CREATE OR REPLACE FUNCTION public.handle_social_login()
RETURNS TRIGGER AS $$
BEGIN
  -- Link user to golfer if email matches
  UPDATE public.golfers
  SET supabase_id = NEW.id
  WHERE email = NEW.email;
  
  -- You can also sync the image_url from social provider if empty
  -- UPDATE public.golfers SET photo_url = NEW.raw_user_meta_data->>'avatar_url' 
  -- WHERE email = NEW.email AND photo_url IS NULL;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 3. Create the trigger
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_social_login();

-- 4. Enable RLS for identity mapping
-- This ensures only the owner can see their own sensitive data if we add it later.
ALTER TABLE golfers ENABLE ROW LEVEL SECURITY;

-- 5. Helper: Add emails to existing golfers (Example)
-- Replace these with the actual emails your players will use for Google/Facebook
-- UPDATE golfers SET email = 'phil@example.com' WHERE name = 'Phil';
-- UPDATE golfers SET email = 'bully@example.com' WHERE name = 'Bully';
