-- Get current session and add admin role for testing
-- First let's see if we can get the authenticated user somehow
-- We'll add a sample admin user - you'll need to replace this with your actual user ID

-- For now, let's create a temporary solution by making the first authenticated user an admin
-- This is a development helper - in production you'd manage this more carefully

DO $$
DECLARE
    sample_user_id uuid := '00000000-0000-0000-0000-000000000000'; -- placeholder
BEGIN
    -- Insert a sample admin role (you'll need to update this with the real user ID)
    -- INSERT INTO user_roles (user_id, role) VALUES (sample_user_id, 'admin');
    
    -- For now, let's add some debug info
    RAISE NOTICE 'Ready to add admin role - please update with real user ID';
END $$;