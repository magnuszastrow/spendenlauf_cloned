-- Insert sample data for testing the dashboard

-- Insert sample events
INSERT INTO public.events (name, description, year, date, registration_open) VALUES
('Spendenlauf 2025', 'Jährlicher Spendenlauf für den guten Zweck', 2025, '2025-06-15', true),
('Herbstlauf 2024', 'Herbstlicher Spendenlauf', 2024, '2024-09-20', false)
ON CONFLICT DO NOTHING;

-- Insert sample timeslots (using the first event)
INSERT INTO public.timeslots (name, time, max_participants, event_id) 
SELECT 
  slot.name, 
  slot.time, 
  slot.max_participants, 
  e.id
FROM (VALUES 
  ('Vormittag Gruppe 1', '09:00:00', 30),
  ('Vormittag Gruppe 2', '10:00:00', 25),
  ('Mittag Gruppe', '12:00:00', 20),
  ('Nachmittag Gruppe 1', '14:00:00', 35),
  ('Nachmittag Gruppe 2', '15:30:00', 25)
) AS slot(name, time, max_participants)
CROSS JOIN public.events e 
WHERE e.name = 'Spendenlauf 2025'
ON CONFLICT DO NOTHING;

-- Insert sample participants (using the first event and various timeslots)
INSERT INTO public.participants (first_name, last_name, age, participant_type, event_id, timeslot_id) 
SELECT 
  p.first_name,
  p.last_name,
  p.age,
  p.participant_type,
  e.id as event_id,
  t.id as timeslot_id
FROM (VALUES 
  ('Max', 'Mustermann', 25, 'adult'),
  ('Anna', 'Schmidt', 12, 'child'),
  ('Peter', 'Mueller', 30, 'adult'),
  ('Lisa', 'Weber', 8, 'child'),
  ('Thomas', 'Fischer', 35, 'adult'),
  ('Emma', 'Wagner', 10, 'child'),
  ('Michael', 'Becker', 28, 'adult'),
  ('Sophie', 'Schulz', 14, 'child'),
  ('Daniel', 'Hoffmann', 32, 'adult'),
  ('Lena', 'Klein', 9, 'child')
) AS p(first_name, last_name, age, participant_type)
CROSS JOIN public.events e 
CROSS JOIN (
  SELECT id FROM public.timeslots ORDER BY RANDOM() LIMIT 1
) t
WHERE e.name = 'Spendenlauf 2025'
ON CONFLICT DO NOTHING;