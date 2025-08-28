-- Create user roles enum
CREATE TYPE public.app_role AS ENUM ('admin', 'viewer');

-- Create user roles table
CREATE TABLE public.user_roles (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
    role app_role NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
    UNIQUE (user_id, role)
);

-- Enable RLS on user_roles
ALTER TABLE public.user_roles ENABLE ROW LEVEL SECURITY;

-- Create security definer function to check user roles
CREATE OR REPLACE FUNCTION public.has_role(_user_id UUID, _role app_role)
RETURNS BOOLEAN
LANGUAGE SQL
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1
    FROM public.user_roles
    WHERE user_id = _user_id
      AND role = _role
  )
$$;

-- Create function to check if user is admin
CREATE OR REPLACE FUNCTION public.is_admin()
RETURNS BOOLEAN
LANGUAGE SQL
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT public.has_role(auth.uid(), 'admin'::app_role)
$$;

-- Update RLS policies to restrict access to sensitive data

-- Drop existing public read policies for sensitive tables
DROP POLICY IF EXISTS "Guardians can read their own data" ON public.guardians;
DROP POLICY IF EXISTS "Anyone can read participants" ON public.participants;
DROP POLICY IF EXISTS "Anyone can read teams" ON public.teams;

-- Create new restricted policies for guardians
CREATE POLICY "Only admins can read guardians"
ON public.guardians
FOR SELECT
TO authenticated
USING (public.is_admin());

-- Create new restricted policies for participants  
CREATE POLICY "Only admins can read participants"
ON public.participants
FOR SELECT
TO authenticated
USING (public.is_admin());

-- Create new restricted policies for teams
CREATE POLICY "Only admins can read teams"
ON public.teams
FOR SELECT
TO authenticated
USING (public.is_admin());

-- Allow team lookup by readable_team_id for registration (limited info)
CREATE POLICY "Allow team lookup by readable_team_id"
ON public.teams
FOR SELECT
TO anon
USING (readable_team_id IS NOT NULL);

-- User roles policies
CREATE POLICY "Users can read their own roles"
ON public.user_roles
FOR SELECT
TO authenticated
USING (user_id = auth.uid());

CREATE POLICY "Admins can read all roles"
ON public.user_roles
FOR SELECT
TO authenticated
USING (public.is_admin());

CREATE POLICY "Only admins can insert roles"
ON public.user_roles
FOR INSERT
TO authenticated
WITH CHECK (public.is_admin());