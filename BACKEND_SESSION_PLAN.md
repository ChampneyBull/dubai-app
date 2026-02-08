# Backend Session Handling Implementation Plan

This document outlines the strategy for integrating Supabase Auth (social login) with the existing "Race to Dubai" golfer database.

## 1. Objective
Enable seamless login via Google and Facebook while ensuring that social users are correctly mapped to their corresponding golfer profiles in the `golfers` table.

## 2. Shared Identity Architecture

Currently, the app uses a manual PIN system with a local `localStorage` session. To move to a robust backend session system:

### A. Database Schema Updates
We need to link Supabase `auth.users` to our `public.golfers` table.
1. Add a `supabase_id` (UUID) column to the `golfers` table.
2. Create a unique constraint on `email` in the `golfers` table.

```sql
ALTER TABLE golfers ADD COLUMN supabase_id UUID REFERENCES auth.users(id);
ALTER TABLE golfers ADD COLUMN email TEXT UNIQUE;
```

### B. Automated Mapping (Triggers)
When a user signs up via Google/Facebook, we can use a PostgreSQL trigger to automatically link them to their existing golfer record based on their email.

```sql
CREATE OR REPLACE FUNCTION public.handle_social_login()
RETURNS TRIGGER AS $$
BEGIN
  -- Link user to golfer if email matches
  UPDATE public.golfers
  SET supabase_id = NEW.id
  WHERE email = NEW.email;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_social_login();
```

## 3. Session Lifecycle Management

### Frontend (Implemented)
- **Persistent Listeners**: Use `supabase.auth.onAuthStateChange` in `App.jsx` to keep the UI in sync with the session.
- **Hybrid Support**: The app currently supports both legacy PIN sessions and Supabase sessions.

### Security (RLS)
Enable **Row Level Security (RLS)** in Supabase to protect winnings requests:
- Users should only be able to submit winnings for *themselves* (their linked golfer ID).
- Admins (Phil/Bully) should have full access.

```sql
-- Example RLS Policy
CREATE POLICY "Golfers can submit their own winnings"
ON winnings_requests
FOR INSERT
WITH CHECK (
  player_id IN (
    SELECT id FROM golfers WHERE supabase_id = auth.uid()
  )
);
```

## 4. Next Steps
1. **Configure Supabase Dashboard**: Add Google and Facebook Client IDs/Secrets in the Authentication > Providers section.
2. **Set Redirect URLs**: Ensure `http://localhost:5173` is added as a valid redirect URI.
3. **Migrate Data**: Add golfer emails to the `golfers` table so the auto-mapping trigger works.
