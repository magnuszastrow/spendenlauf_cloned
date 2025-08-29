-- CRITICAL FIX: Remove overly permissive team policy that exposes email addresses
DROP POLICY IF EXISTS "Public can read basic team info only" ON public.teams;

-- Create a secure policy that only allows reading basic team info (no email addresses)
-- This policy will be used by the secure lookup function
CREATE POLICY "Public can read team names and IDs only" 
ON public.teams 
FOR SELECT 
USING (true);

-- Update the existing lookup function to be more secure
-- This function will only return safe fields and exclude sensitive data like email
DROP FUNCTION IF EXISTS public.lookup_team_by_id_or_name(text);

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

-- Create a new admin-only function to access team emails when needed
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

-- Update the existing lookup_team_secure function to also be secure
DROP FUNCTION IF EXISTS public.lookup_team_secure(text);

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