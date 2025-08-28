-- Make max_participants NOT NULL for timeslots table
ALTER TABLE public.timeslots 
ALTER COLUMN max_participants SET NOT NULL;

-- Add a default value for existing records if needed
UPDATE public.timeslots 
SET max_participants = 50 
WHERE max_participants IS NULL;