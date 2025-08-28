-- Add admin role for the authenticated user
-- This will help identify the current user and grant admin access

-- First create a function to temporarily add admin role for development
CREATE OR REPLACE FUNCTION public.add_current_user_as_admin()
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
    -- Only proceed if there's an authenticated user
    IF auth.uid() IS NOT NULL THEN
        -- Insert admin role for current user, ignore if already exists
        INSERT INTO public.user_roles (user_id, role) 
        VALUES (auth.uid(), 'admin'::app_role)
        ON CONFLICT (user_id, role) DO NOTHING;
        
        RAISE NOTICE 'Admin role added for user: %', auth.uid();
    ELSE
        RAISE NOTICE 'No authenticated user found';
    END IF;
END
$$;

-- Call the function to add current user as admin
SELECT public.add_current_user_as_admin();