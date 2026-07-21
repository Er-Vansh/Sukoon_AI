-- Advanced Features: Streaks, Points, Availability, and Private Notes

-- Table for tracking user streaks and points
CREATE TABLE IF NOT EXISTS public.user_stats (
  user_id UUID PRIMARY KEY REFERENCES public.profiles(id) ON DELETE CASCADE,
  points INTEGER NOT NULL DEFAULT 0,
  current_streak INTEGER NOT NULL DEFAULT 0,
  max_streak INTEGER NOT NULL DEFAULT 0,
  last_activity_date DATE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- Table for counsellor availability slots
CREATE TABLE IF NOT EXISTS public.counsellor_slots (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  counsellor_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  start_time TIMESTAMPTZ NOT NULL,
  end_time TIMESTAMPTZ NOT NULL,
  is_booked BOOLEAN NOT NULL DEFAULT false,
  created_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
  UNIQUE(counsellor_id, start_time)
);

-- Table for private session notes (visible only to counsellor)
CREATE TABLE IF NOT EXISTS public.appointment_notes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  appointment_id UUID UNIQUE NOT NULL REFERENCES public.appointments(id) ON DELETE CASCADE,
  counsellor_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  notes TEXT NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- RLS
ALTER TABLE public.user_stats ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.counsellor_slots ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.appointment_notes ENABLE ROW LEVEL SECURITY;

-- Policies for user_stats
CREATE POLICY "user_stats_select_own" ON public.user_stats
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "user_stats_update_own" ON public.user_stats
  FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "user_stats_insert_own" ON public.user_stats
  FOR INSERT WITH CHECK (auth.uid() = user_id);

-- Policies for counsellor_slots
CREATE POLICY "counsellor_slots_select_all" ON public.counsellor_slots
  FOR SELECT TO authenticated USING (true);

CREATE POLICY "counsellor_slots_manage_own" ON public.counsellor_slots
  FOR ALL USING (auth.uid() = counsellor_id);

-- Policies for appointment_notes (Only counsellor can see their own notes)
CREATE POLICY "appointment_notes_manage_own" ON public.appointment_notes
  FOR ALL USING (auth.uid() = counsellor_id);

-- Trigger to create user_stats on profile creation (optional but helpful)
-- Note: Requires a function, keeping it simple for now as we can handle creation in-app.
