-- Allow admins to update and delete records in all tables

-- Participants table - add UPDATE and DELETE policies for admins
CREATE POLICY "Admins can update participants" 
ON public.participants 
FOR UPDATE 
USING (is_admin());

CREATE POLICY "Admins can delete participants" 
ON public.participants 
FOR DELETE 
USING (is_admin());

-- Events table - add all CRUD policies for admins
CREATE POLICY "Admins can read all events" 
ON public.events 
FOR SELECT 
USING (is_admin());

CREATE POLICY "Admins can insert events" 
ON public.events 
FOR INSERT 
WITH CHECK (is_admin());

CREATE POLICY "Admins can update events" 
ON public.events 
FOR UPDATE 
USING (is_admin());

CREATE POLICY "Admins can delete events" 
ON public.events 
FOR DELETE 
USING (is_admin());

-- Teams table - add UPDATE and DELETE policies for admins
CREATE POLICY "Admins can update teams" 
ON public.teams 
FOR UPDATE 
USING (is_admin());

CREATE POLICY "Admins can delete teams" 
ON public.teams 
FOR DELETE 
USING (is_admin());

-- Timeslots table - add UPDATE and DELETE policies for admins
CREATE POLICY "Admins can update timeslots" 
ON public.timeslots 
FOR UPDATE 
USING (is_admin());

CREATE POLICY "Admins can delete timeslots" 
ON public.timeslots 
FOR DELETE 
USING (is_admin());

-- Guardians table - add UPDATE and DELETE policies for admins
CREATE POLICY "Admins can update guardians" 
ON public.guardians 
FOR UPDATE 
USING (is_admin());

CREATE POLICY "Admins can delete guardians" 
ON public.guardians 
FOR DELETE 
USING (is_admin());