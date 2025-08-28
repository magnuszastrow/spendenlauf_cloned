-- Create events table for yearly organization
CREATE TABLE public.events (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name TEXT NOT NULL,
    year INTEGER NOT NULL UNIQUE,
    date DATE,
    description TEXT,
    registration_open BOOLEAN DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Create guardians table for children (separate from participants)
CREATE TABLE public.guardians (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    email TEXT NOT NULL,
    first_name TEXT NOT NULL,
    last_name TEXT NOT NULL,
    phone TEXT,
    address TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Create teams table
CREATE TABLE public.teams (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    event_id UUID NOT NULL REFERENCES public.events(id) ON DELETE CASCADE,
    name TEXT NOT NULL,
    shared_email BOOLEAN DEFAULT false,
    team_email TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
    UNIQUE(event_id, name)
);

-- Create participants table (for both individual and children)
CREATE TABLE public.participants (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    event_id UUID NOT NULL REFERENCES public.events(id) ON DELETE CASCADE,
    team_id UUID REFERENCES public.teams(id) ON DELETE SET NULL,
    guardian_id UUID REFERENCES public.guardians(id) ON DELETE CASCADE,
    email TEXT,
    first_name TEXT NOT NULL,
    last_name TEXT NOT NULL,
    age INTEGER NOT NULL,
    gender TEXT CHECK (gender IN ('male', 'female', 'other')),
    participant_type TEXT NOT NULL CHECK (participant_type IN ('adult', 'child')),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
    -- Email required for adults, guardian_id required for children
    CONSTRAINT email_required_for_adults CHECK (
        (participant_type = 'adult' AND email IS NOT NULL) OR 
        (participant_type = 'child' AND guardian_id IS NOT NULL)
    )
);

-- Enable RLS on all tables
ALTER TABLE public.events ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.guardians ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.teams ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.participants ENABLE ROW LEVEL SECURITY;

-- RLS Policies for public access (since this is registration form)
-- Events - public read access
CREATE POLICY "Events are publicly readable" 
ON public.events FOR SELECT 
USING (registration_open = true);

-- Guardians - can insert and read own records
CREATE POLICY "Anyone can insert guardians" 
ON public.guardians FOR INSERT 
WITH CHECK (true);

CREATE POLICY "Guardians can read their own data" 
ON public.guardians FOR SELECT 
USING (true);

-- Teams - public read and insert
CREATE POLICY "Anyone can read teams" 
ON public.teams FOR SELECT 
USING (true);

CREATE POLICY "Anyone can insert teams" 
ON public.teams FOR INSERT 
WITH CHECK (true);

-- Participants - public read and insert
CREATE POLICY "Anyone can read participants" 
ON public.participants FOR SELECT 
USING (true);

CREATE POLICY "Anyone can insert participants" 
ON public.participants FOR INSERT 
WITH CHECK (true);

-- Create indexes for better performance
CREATE INDEX idx_participants_event_id ON public.participants(event_id);
CREATE INDEX idx_participants_team_id ON public.participants(team_id);
CREATE INDEX idx_participants_guardian_id ON public.participants(guardian_id);
CREATE INDEX idx_participants_type ON public.participants(participant_type);
CREATE INDEX idx_teams_event_id ON public.teams(event_id);
CREATE INDEX idx_guardians_email ON public.guardians(email);

-- Create update timestamp function
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = now();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create triggers for automatic timestamp updates
CREATE TRIGGER update_events_updated_at
    BEFORE UPDATE ON public.events
    FOR EACH ROW
    EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_guardians_updated_at
    BEFORE UPDATE ON public.guardians
    FOR EACH ROW
    EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_teams_updated_at
    BEFORE UPDATE ON public.teams
    FOR EACH ROW
    EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_participants_updated_at
    BEFORE UPDATE ON public.participants
    FOR EACH ROW
    EXECUTE FUNCTION public.update_updated_at_column();

-- Insert current year event as default
INSERT INTO public.events (name, year, date, description) 
VALUES ('Spendenlauf BW-LG 2025', 2025, '2025-06-01', 'Charity run event 2025');