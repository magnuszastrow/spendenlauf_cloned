-- Add readable team ID column to teams table
ALTER TABLE public.teams 
ADD COLUMN readable_team_id TEXT UNIQUE;

-- Add runner number column to participants table
ALTER TABLE public.participants 
ADD COLUMN runner_number INTEGER UNIQUE;

-- Create function to generate readable team ID
CREATE OR REPLACE FUNCTION public.generate_readable_team_id()
RETURNS TEXT AS $$
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
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create function to get next runner number
CREATE OR REPLACE FUNCTION public.get_next_runner_number()
RETURNS INTEGER AS $$
DECLARE
    max_number INTEGER;
BEGIN
    SELECT COALESCE(MAX(runner_number), 9) INTO max_number FROM public.participants;
    RETURN max_number + 1;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create trigger to auto-generate readable team ID for new teams
CREATE OR REPLACE FUNCTION public.set_readable_team_id()
RETURNS TRIGGER AS $$
BEGIN
    IF NEW.readable_team_id IS NULL THEN
        NEW.readable_team_id := public.generate_readable_team_id();
    END IF;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_set_readable_team_id
    BEFORE INSERT ON public.teams
    FOR EACH ROW
    EXECUTE FUNCTION public.set_readable_team_id();

-- Create trigger to auto-assign runner number for new participants
CREATE OR REPLACE FUNCTION public.set_runner_number()
RETURNS TRIGGER AS $$
BEGIN
    IF NEW.runner_number IS NULL THEN
        NEW.runner_number := public.get_next_runner_number();
    END IF;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_set_runner_number
    BEFORE INSERT ON public.participants
    FOR EACH ROW
    EXECUTE FUNCTION public.set_runner_number();