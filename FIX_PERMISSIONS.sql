-- RUN THIS IN SUPABASE SQL EDITOR TO FIX PERMISSIONS
-- This allows anyone (including users logged in via PIN or Google) to update the status of a request.
-- This solves the issue where declines/approvals appear to work but don't persist.

DO $$ 
BEGIN
    -- Check if policy exists, if not, create it
    IF NOT EXISTS (
        SELECT 1 FROM pg_policies 
        WHERE tablename = 'winnings_requests' 
        AND policyname = 'Allow public update requests'
    ) THEN
        CREATE POLICY "Allow public update requests" 
        ON winnings_requests FOR UPDATE 
        TO public 
        USING (true);
    END IF;
END $$;

-- Verify the table has RLS enabled
ALTER TABLE winnings_requests ENABLE ROW LEVEL SECURITY;
