-- Create a trigger to ensure only one event can be active at a time
CREATE OR REPLACE FUNCTION public.ensure_single_active_event()
RETURNS TRIGGER AS $$
BEGIN
    -- If we're setting an event to active, deactivate all others
    IF NEW.is_active = true THEN
        UPDATE public.events 
        SET is_active = false 
        WHERE id != NEW.id AND is_active = true;
    END IF;
    
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path TO 'public';

-- Create trigger for INSERT operations
DROP TRIGGER IF EXISTS ensure_single_active_event_insert ON public.events;
CREATE TRIGGER ensure_single_active_event_insert
    BEFORE INSERT ON public.events
    FOR EACH ROW
    EXECUTE FUNCTION public.ensure_single_active_event();

-- Create trigger for UPDATE operations
DROP TRIGGER IF EXISTS ensure_single_active_event_update ON public.events;
CREATE TRIGGER ensure_single_active_event_update
    BEFORE UPDATE ON public.events
    FOR EACH ROW
    EXECUTE FUNCTION public.ensure_single_active_event();