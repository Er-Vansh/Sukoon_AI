-- Wellness seed data (safe to re-run).

INSERT INTO public.wellness_activities (title, description, category, duration_minutes)
VALUES
  ('Guided Meditation', 'A peaceful 10-minute guided meditation to calm your mind.', 'meditation', 10),
  ('Deep Breathing Exercise', 'A 5-minute breathing exercise to reduce stress and anxiety.', 'breathing', 5),
  ('Progressive Muscle Relaxation', 'Release tension through systematic muscle relaxation.', 'relaxation', 15),
  ('Mindful Body Scan', 'Connect with your body through mindful awareness.', 'mindfulness', 12),
  ('Sleep Relaxation', 'Gentle sounds to help you fall asleep peacefully.', 'sleep', 20),
  ('Focus Enhancement', 'Audio support to improve concentration and focus.', 'focus', 15)
ON CONFLICT DO NOTHING;
