-- CRITICAL FIX: Completely remove public access to teams table to prevent email exposure
-- The previous policy with USING (true) was still exposing ALL columns including sensitive team_email

-- Remove the dangerous public policy that exposes all team data
DROP POLICY IF EXISTS "Public can read team names and IDs only" ON public.teams;

-- Do NOT create a replacement public policy - public access should only be through secure functions

-- Ensure secure lookup functions have proper search path security
CREATE OR REPLACE FUNCTION public.lookup_team_by_id_or_name(team_identifier text)
RETURNS TABLE(id uuid, name text, readable_team_id text, event_id uuid)
LANGUAGE sql
STABLE SECURITY DEFINER
SET search_path TO 'public'
AS $function$
  -- This function explicitly excludes sensitive email fields
  SELECT t.id, t.name, t.readable_team_id, t.event_id
  FROM public.teams t
  WHERE t.readable_team_id = team_identifier 
     OR t.name = team_identifier;
$function$;

CREATE OR REPLACE FUNCTION public.lookup_team_secure(team_identifier text)
RETURNS TABLE(id uuid, name text, readable_team_id text, event_id uuid)
LANGUAGE sql
STABLE SECURITY DEFINER
SET search_path TO 'public'
AS $function$
  -- Secure version that excludes sensitive fields
  SELECT t.id, t.name, t.readable_team_id, t.event_id
  FROM public.teams t
  WHERE t.readable_team_id = team_identifier 
     OR t.name = team_identifier;
$function$;

CREATE OR REPLACE FUNCTION public.get_team_details_admin(team_identifier text)
RETURNS TABLE(id uuid, name text, readable_team_id text, event_id uuid, team_email text, shared_email boolean)
LANGUAGE sql
STABLE SECURITY DEFINER
SET search_path TO 'public'
AS $function$
  -- Only allow access if user is admin
  SELECT t.id, t.name, t.readable_team_id, t.event_id, t.team_email, t.shared_email
  FROM public.teams t
  WHERE (t.readable_team_id = team_identifier OR t.name = team_identifier)
    AND public.is_admin();
$function$;

-- Fix remaining database functions missing search path security
CREATE OR REPLACE FUNCTION public.set_readable_team_id()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $function$
BEGIN
    IF NEW.readable_team_id IS NULL THEN
        NEW.readable_team_id := public.generate_readable_team_id();
    END IF;
    RETURN NEW;
END;
$function$;

CREATE OR REPLACE FUNCTION public.set_runner_number()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $function$
BEGIN
    IF NEW.runner_number IS NULL THEN
        NEW.runner_number := public.get_next_runner_number();
    END IF;
    RETURN NEW;
END;
$function$;

CREATE OR REPLACE FUNCTION public.add_current_user_as_admin()
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $function$
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
END;
$function$;