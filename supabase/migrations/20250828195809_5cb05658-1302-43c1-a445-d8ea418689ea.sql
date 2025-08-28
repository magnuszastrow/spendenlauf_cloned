-- Create timeSlots table
CREATE TABLE public.timeslots (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  event_id UUID NOT NULL REFERENCES public.events(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  time TIME NOT NULL,
  max_participants INTEGER NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS on timeSlots
ALTER TABLE public.timeslots ENABLE ROW LEVEL SECURITY;

-- Create policies for timeSlots
CREATE POLICY "Anyone can read timeslots" 
ON public.timeslots 
FOR SELECT 
USING (true);

CREATE POLICY "Anyone can insert timeslots" 
ON public.timeslots 
FOR INSERT 
WITH CHECK (true);

-- Add timeslot_id to participants table
ALTER TABLE public.participants 
ADD COLUMN timeslot_id UUID REFERENCES public.timeslots(id) ON DELETE SET NULL;

-- Create trigger for timeslots timestamp updates
CREATE TRIGGER update_timeslots_updated_at
BEFORE UPDATE ON public.timeslots
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

-- Create index for better performance
CREATE INDEX idx_timeslots_event_id ON public.timeslots(event_id);
CREATE INDEX idx_participants_timeslot_id ON public.participants(timeslot_id);