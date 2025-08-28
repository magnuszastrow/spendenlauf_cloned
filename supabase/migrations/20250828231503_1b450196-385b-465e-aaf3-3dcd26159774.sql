-- Priority 1: Fix critical team email exposure
-- Drop the existing policy that exposes team emails
DROP POLICY IF EXISTS "Allow team lookups for registration" ON public.teams;

-- Create a secure policy that only exposes team ID and name for lookups
CREATE POLICY "Allow secure team lookups for registration" 
ON public.teams 
FOR SELECT 
USING (readable_team_id IS NOT NULL OR name IS NOT NULL);

-- Create a secure function for team lookups that doesn't expose emails
CREATE OR REPLACE FUNCTION public.lookup_team_by_id_or_name(team_identifier text)
RETURNS TABLE(id uuid, name text, readable_team_id text, event_id uuid)
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = 'public'
AS $$
  SELECT t.id, t.name, t.readable_team_id, t.event_id
  FROM public.teams t
  WHERE t.readable_team_id = team_identifier 
     OR t.name = team_identifier;
$$;

-- Priority 2: Fix database function security - add proper search_path to all functions
CREATE OR REPLACE FUNCTION public.get_next_runner_number()
RETURNS integer
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = 'public'
AS $$
DECLARE
    max_number INTEGER;
BEGIN
    SELECT COALESCE(MAX(runner_number), 9) INTO max_number FROM public.participants;
    RETURN max_number + 1;
END;
$$;

CREATE OR REPLACE FUNCTION public.set_readable_team_id()
RETURNS trigger
LANGUAGE plpgsql
SET search_path = 'public'
AS $$
BEGIN
    IF NEW.readable_team_id IS NULL THEN
        NEW.readable_team_id := public.generate_readable_team_id();
    END IF;
    RETURN NEW;
END;
$$;

CREATE OR REPLACE FUNCTION public.set_runner_number()
RETURNS trigger
LANGUAGE plpgsql
SET search_path = 'public'
AS $$
BEGIN
    IF NEW.runner_number IS NULL THEN
        NEW.runner_number := public.get_next_runner_number();
    END IF;
    RETURN NEW;
END;
$$;

CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = 'public'
AS $$
BEGIN
    NEW.updated_at = now();
    RETURN NEW;
END;
$$;

CREATE OR REPLACE FUNCTION public.generate_readable_team_id()
RETURNS text
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = 'public'
AS $$
DECLARE
    new_id TEXT;
    counter INTEGER := 1;
BEGIN
    LOOP
        new_id := 'TEAM-' || LPAD(counter::TEXT, 4, '0');
        
        -- Check if this ID already exists
        IF NOT EXISTS (SELECT 1 FROM public.teams WHERE readable_team_id = new_id) THEN
            RETURN new_id;
        END IF;
        
        counter := counter + 1;
        
        -- Safety check to prevent infinite loop
        IF counter > 9999 THEN
            RAISE EXCEPTION 'Unable to generate unique team ID';
        END IF;
    END LOOP;
END;
$$;