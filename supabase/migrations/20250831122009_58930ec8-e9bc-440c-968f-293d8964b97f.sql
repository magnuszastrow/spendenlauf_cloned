-- Remove the year column from events table since it's redundant with the date field
ALTER TABLE public.events DROP COLUMN IF EXISTS year;