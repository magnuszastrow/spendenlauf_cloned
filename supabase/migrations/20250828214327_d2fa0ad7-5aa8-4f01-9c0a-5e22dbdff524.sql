-- Update team lookup policy to also allow name-based lookups for registration
DROP POLICY IF EXISTS "Allow team lookup by readable_team_id" ON public.teams;

-- Create new policy that allows both readable_team_id and name lookups for registration
CREATE POLICY "Allow team lookups for registration"
ON public.teams
FOR SELECT
TO anon
USING (readable_team_id IS NOT NULL OR name IS NOT NULL);