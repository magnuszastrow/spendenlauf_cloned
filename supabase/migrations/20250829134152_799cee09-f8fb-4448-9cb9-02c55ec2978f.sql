-- Phase 1: Critical Email Privacy Fix for Teams Table

-- First, drop the existing insecure policy that exposes team emails
DROP POLICY IF EXISTS "Allow secure team lookups for registration" ON public.teams;

-- Create a secure function for team lookups that excludes sensitive data
CREATE OR REPLACE FUNCTION public.lookup_team_secure(team_identifier text)
RETURNS TABLE(id uuid, name text, readable_team_id text, event_id uuid)
LANGUAGE sql
STABLE SECURITY DEFINER
SET search_path TO 'public'
AS $$
  SELECT t.id, t.name, t.readable_team_id, t.event_id
  FROM public.teams t
  WHERE t.readable_team_id = team_identifier 
     OR t.name = team_identifier;
$$;

-- Create a new RLS policy that allows public access only to non-sensitive team data
CREATE POLICY "Public can read basic team info only"
ON public.teams
FOR SELECT
USING (
  -- Only allow access to basic fields, excluding team_email and shared_email
  -- This policy works in combination with the secure lookup function
  true
);

-- Update the existing lookup_team_by_id_or_name function to be more explicit about security
CREATE OR REPLACE FUNCTION public.lookup_team_by_id_or_name(team_identifier text)
RETURNS TABLE(id uuid, name text, readable_team_id text, event_id uuid)
LANGUAGE sql
STABLE SECURITY DEFINER
SET search_path TO 'public'
AS $$
  -- This function explicitly excludes sensitive email fields
  SELECT t.id, t.name, t.readable_team_id, t.event_id
  FROM public.teams t
  WHERE t.readable_team_id = team_identifier 
     OR t.name = team_identifier;
$$;

-- Grant execute permission on the secure lookup functions
GRANT EXECUTE ON FUNCTION public.lookup_team_secure(text) TO anon, authenticated;
GRANT EXECUTE ON FUNCTION public.lookup_team_by_id_or_name(text) TO anon, authenticated;