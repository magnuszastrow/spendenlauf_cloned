-- Add timeslots for the existing event
INSERT INTO public.timeslots (event_id, name, time, max_participants)
VALUES 
  ((SELECT id FROM public.events WHERE registration_open = true LIMIT 1), 'Durchlauf 1', '11:00:00', 50),
  ((SELECT id FROM public.events WHERE registration_open = true LIMIT 1), 'Durchlauf 2', '14:30:00', 50),
  ((SELECT id FROM public.events WHERE registration_open = true LIMIT 1), 'Kinderlauf', '13:30:00', 30);