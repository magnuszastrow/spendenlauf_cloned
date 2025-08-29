-- Fix search_path security issue for the functions we created
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

CREATE OR REPLACE FUNCTION public.auto_assign_timeslot()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
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

CREATE OR REPLACE FUNCTION public.ensure_children_timeslot_exists(p_event_id uuid)
RETURNS uuid
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = 'public'
AS $$
DECLARE
    children_timeslot_id uuid;
BEGIN
    -- Check if children timeslot already exists for this event
    SELECT id INTO children_timeslot_id
    FROM public.timeslots
    WHERE event_id = p_event_id AND type = 'children'
    LIMIT 1;
    
    -- If not found, create one
    IF children_timeslot_id IS NULL THEN
        INSERT INTO public.timeslots (event_id, name, time, max_participants, type)
        VALUES (p_event_id, 'Kinderlauf', '09:00:00', 100, 'children')
        RETURNING id INTO children_timeslot_id;
    END IF;
    
    RETURN children_timeslot_id;
END;
$$;