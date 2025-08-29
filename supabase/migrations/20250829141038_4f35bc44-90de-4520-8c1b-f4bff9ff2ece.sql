-- Update the auto_assign_timeslot trigger to only work for children
DROP TRIGGER IF EXISTS auto_assign_timeslot ON public.participants;

CREATE OR REPLACE FUNCTION public.auto_assign_timeslot()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $function$
BEGIN
    -- Only assign if timeslot_id is not already set AND participant is a child (under 10)
    IF NEW.timeslot_id IS NULL AND (NEW.participant_type = 'child' OR NEW.age < 10) THEN
        NEW.timeslot_id := public.get_appropriate_timeslot(NEW.event_id, NEW.participant_type, NEW.age);
    END IF;
    RETURN NEW;
END;
$function$;

-- Recreate the trigger
CREATE TRIGGER auto_assign_timeslot
    BEFORE INSERT ON public.participants
    FOR EACH ROW
    EXECUTE FUNCTION public.auto_assign_timeslot();