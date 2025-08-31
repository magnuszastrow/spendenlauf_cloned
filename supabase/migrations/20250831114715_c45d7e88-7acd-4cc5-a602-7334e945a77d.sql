-- Add a proper is_active boolean column to events table
ALTER TABLE public.events ADD COLUMN IF NOT EXISTS is_active BOOLEAN DEFAULT false;

-- Update existing events to have is_active = false by default
UPDATE public.events SET is_active = false WHERE is_active IS NULL;

-- Drop the existing triggers since we'll replace them
DROP TRIGGER IF EXISTS ensure_single_active_event_insert ON public.events;
DROP TRIGGER IF EXISTS ensure_single_active_event_update ON public.events;

-- Create an improved function that allows zero active events
CREATE OR REPLACE FUNCTION public.ensure_single_active_event()
RETURNS TRIGGER AS $$
BEGIN
    -- If we're setting an event to active, deactivate all others
    -- This allows setting to false without restriction
    IF NEW.is_active = true THEN
        UPDATE public.events 
        SET is_active = false 
        WHERE id != NEW.id AND is_active = true;
    END IF;
    
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path TO 'public';

-- Recreate triggers for both INSERT and UPDATE
CREATE TRIGGER ensure_single_active_event_insert
    BEFORE INSERT ON public.events
    FOR EACH ROW
    EXECUTE FUNCTION public.ensure_single_active_event();

CREATE TRIGGER ensure_single_active_event_update
    BEFORE UPDATE ON public.events
    FOR EACH ROW
    EXECUTE FUNCTION public.ensure_single_active_event();