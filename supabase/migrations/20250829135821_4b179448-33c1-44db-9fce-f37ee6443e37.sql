-- Ensure each event has exactly one child timeslot
-- First, let's add a unique constraint to ensure only one 'children' type timeslot per event
ALTER TABLE public.timeslots 
ADD CONSTRAINT unique_children_timeslot_per_event 
UNIQUE (event_id, type) 
DEFERRABLE INITIALLY DEFERRED;

-- Create a function to automatically assign timeslots based on participant type
CREATE OR REPLACE FUNCTION public.get_appropriate_timeslot(p_event_id uuid, p_participant_type text, p_age integer)
RETURNS uuid
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = 'public'
AS $$
DECLARE
    timeslot_id uuid;
BEGIN
    -- For children (under 10), find the children timeslot
    IF p_participant_type = 'child' OR p_age < 10 THEN
        SELECT id INTO timeslot_id
        FROM public.timeslots
        WHERE event_id = p_event_id 
        AND type = 'children'
        LIMIT 1;
    ELSE
        -- For adults, find a normal timeslot with available space
        SELECT id INTO timeslot_id
        FROM public.timeslots t
        WHERE t.event_id = p_event_id 
        AND t.type = 'normal'
        AND (
            SELECT COUNT(*) 
            FROM public.participants p 
            WHERE p.timeslot_id = t.id
        ) < t.max_participants
        ORDER BY (
            SELECT COUNT(*) 
            FROM public.participants p 
            WHERE p.timeslot_id = t.id
        ) ASC
        LIMIT 1;
        
        -- If no timeslot with space, just get the first normal one
        IF timeslot_id IS NULL THEN
            SELECT id INTO timeslot_id
            FROM public.timeslots
            WHERE event_id = p_event_id 
            AND type = 'normal'
            ORDER BY time
            LIMIT 1;
        END IF;
    END IF;
    
    RETURN timeslot_id;
END;
$$;

-- Create a trigger to automatically assign timeslots when participants are inserted
CREATE OR REPLACE FUNCTION public.auto_assign_timeslot()
RETURNS trigger
LANGUAGE plpgsql
SET search_path = 'public'
AS $$
BEGIN
    -- Only assign if timeslot_id is not already set
    IF NEW.timeslot_id IS NULL THEN
        NEW.timeslot_id := public.get_appropriate_timeslot(NEW.event_id, NEW.participant_type, NEW.age);
    END IF;
    RETURN NEW;
END;
$$;

-- Drop the trigger if it exists and recreate it
DROP TRIGGER IF EXISTS auto_assign_timeslot_trigger ON public.participants;
CREATE TRIGGER auto_assign_timeslot_trigger
    BEFORE INSERT ON public.participants
    FOR EACH ROW
    EXECUTE FUNCTION public.auto_assign_timeslot();