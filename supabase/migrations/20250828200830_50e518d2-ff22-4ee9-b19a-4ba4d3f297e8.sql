-- Insert a test event for registration testing
INSERT INTO public.events (name, year, date, registration_open, description) 
VALUES ('Charity Run 2024', 2024, '2024-06-15', true, 'Annual charity run for a good cause');

-- Insert some test timeslots for the event
INSERT INTO public.timeslots (event_id, name, time, max_participants)
SELECT e.id, 'Durchlauf 1', '11:00:00', 100
FROM public.events e WHERE e.name = 'Charity Run 2024';

INSERT INTO public.timeslots (event_id, name, time, max_participants)
SELECT e.id, 'Durchlauf 2', '14:30:00', 100  
FROM public.events e WHERE e.name = 'Charity Run 2024';

INSERT INTO public.timeslots (event_id, name, time, max_participants)
SELECT e.id, 'Kinderlauf', '13:30:00', 50
FROM public.events e WHERE e.name = 'Charity Run 2024';