-- Add column to store consent for future event communication
ALTER TABLE public.participants 
ADD COLUMN future_event_consent boolean DEFAULT false;