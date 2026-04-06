-- Core schema for SukoonAI backend (idempotent).
CREATE EXTENSION IF NOT EXISTS pgcrypto;

-- Profiles
CREATE TABLE IF NOT EXISTS public.profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  full_name TEXT NOT NULL,
  email TEXT NOT NULL,
  phone TEXT,
  user_type TEXT NOT NULL CHECK (user_type IN ('patient', 'counsellor')),
  created_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- Counsellor details
CREATE TABLE IF NOT EXISTS public.counsellor_profiles (
  id UUID PRIMARY KEY REFERENCES public.profiles(id) ON DELETE CASCADE,
  specialization TEXT,
  bio TEXT,
  years_of_experience INTEGER,
  license_number TEXT,
  availability_status TEXT NOT NULL DEFAULT 'available'
    CHECK (availability_status IN ('available', 'busy', 'offline')),
  rating NUMERIC(3,2) NOT NULL DEFAULT 0,
  total_sessions INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- Patient request to counsellor
CREATE TABLE IF NOT EXISTS public.consultation_requests (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  patient_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  counsellor_id UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
  subject TEXT NOT NULL,
  description TEXT NOT NULL,
  preferred_date TIMESTAMPTZ,
  status TEXT NOT NULL DEFAULT 'pending'
    CHECK (status IN ('pending', 'accepted', 'rejected', 'completed', 'cancelled')),
  created_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- Scheduled sessions
CREATE TABLE IF NOT EXISTS public.appointments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  consultation_request_id UUID REFERENCES public.consultation_requests(id) ON DELETE SET NULL,
  patient_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  counsellor_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  scheduled_date TIMESTAMPTZ NOT NULL,
  duration_minutes INTEGER NOT NULL DEFAULT 60,
  meeting_link TEXT,
  meeting_platform TEXT CHECK (meeting_platform IN ('zoom', 'google_meet', 'other')),
  status TEXT NOT NULL DEFAULT 'scheduled'
    CHECK (status IN ('scheduled', 'completed', 'cancelled', 'no_show')),
  notes TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- Counsellor-patient continuity
CREATE TABLE IF NOT EXISTS public.patient_history (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  counsellor_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  patient_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  first_session_date TIMESTAMPTZ NOT NULL,
  last_session_date TIMESTAMPTZ,
  total_sessions INTEGER NOT NULL DEFAULT 1,
  notes TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
  UNIQUE (counsellor_id, patient_id)
);

-- AI chat
CREATE TABLE IF NOT EXISTS public.chat_sessions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  mood TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS public.chat_messages (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  session_id UUID NOT NULL REFERENCES public.chat_sessions(id) ON DELETE CASCADE,
  role TEXT NOT NULL CHECK (role IN ('user', 'assistant')),
  content TEXT NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- Wellness content
CREATE TABLE IF NOT EXISTS public.wellness_activities (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title TEXT NOT NULL,
  description TEXT,
  category TEXT NOT NULL CHECK (category IN ('meditation', 'breathing', 'relaxation', 'mindfulness', 'sleep', 'focus')),
  duration_minutes INTEGER,
  audio_url TEXT,
  video_url TEXT,
  thumbnail_url TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- Unified activity logs used by multiple UI paths
CREATE TABLE IF NOT EXISTS public.activity_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  activity_id UUID REFERENCES public.wellness_activities(id) ON DELETE SET NULL,
  activity_type TEXT,
  activity_name TEXT,
  activity_description TEXT,
  started_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
  completed BOOLEAN NOT NULL DEFAULT false,
  completed_at TIMESTAMPTZ,
  duration_played_seconds INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- Gratitude journal
CREATE TABLE IF NOT EXISTS public.gratitude_entries (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  content TEXT NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- Mood tracking
CREATE TABLE IF NOT EXISTS public.mood_entries (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  mood_value INTEGER NOT NULL CHECK (mood_value BETWEEN 0 AND 4),
  mood_label TEXT NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- RLS
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.counsellor_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.consultation_requests ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.appointments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.patient_history ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.chat_sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.chat_messages ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.wellness_activities ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.activity_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.gratitude_entries ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.mood_entries ENABLE ROW LEVEL SECURITY;

-- Policy cleanup for re-runs
DROP POLICY IF EXISTS "profiles_select_own" ON public.profiles;
DROP POLICY IF EXISTS "profiles_select_counsellors" ON public.profiles;
DROP POLICY IF EXISTS "profiles_insert_own" ON public.profiles;
DROP POLICY IF EXISTS "profiles_update_own" ON public.profiles;

DROP POLICY IF EXISTS "counsellor_profiles_select_all_auth" ON public.counsellor_profiles;
DROP POLICY IF EXISTS "counsellor_profiles_insert_own" ON public.counsellor_profiles;
DROP POLICY IF EXISTS "counsellor_profiles_update_own" ON public.counsellor_profiles;

DROP POLICY IF EXISTS "consultation_requests_select_related" ON public.consultation_requests;
DROP POLICY IF EXISTS "consultation_requests_insert_patient" ON public.consultation_requests;
DROP POLICY IF EXISTS "consultation_requests_update_related" ON public.consultation_requests;

DROP POLICY IF EXISTS "appointments_select_related" ON public.appointments;
DROP POLICY IF EXISTS "appointments_insert_counsellor" ON public.appointments;
DROP POLICY IF EXISTS "appointments_update_counsellor" ON public.appointments;

DROP POLICY IF EXISTS "patient_history_select_counsellor" ON public.patient_history;
DROP POLICY IF EXISTS "patient_history_insert_counsellor" ON public.patient_history;
DROP POLICY IF EXISTS "patient_history_update_counsellor" ON public.patient_history;

DROP POLICY IF EXISTS "chat_sessions_select_own" ON public.chat_sessions;
DROP POLICY IF EXISTS "chat_sessions_insert_own" ON public.chat_sessions;

DROP POLICY IF EXISTS "chat_messages_select_own_session" ON public.chat_messages;
DROP POLICY IF EXISTS "chat_messages_insert_own_session" ON public.chat_messages;

DROP POLICY IF EXISTS "wellness_activities_select_authenticated" ON public.wellness_activities;
DROP POLICY IF EXISTS "activity_logs_select_own" ON public.activity_logs;
DROP POLICY IF EXISTS "activity_logs_insert_own" ON public.activity_logs;
DROP POLICY IF EXISTS "activity_logs_update_own" ON public.activity_logs;
DROP POLICY IF EXISTS "gratitude_entries_select_own" ON public.gratitude_entries;
DROP POLICY IF EXISTS "gratitude_entries_insert_own" ON public.gratitude_entries;
DROP POLICY IF EXISTS "mood_entries_select_own" ON public.mood_entries;
DROP POLICY IF EXISTS "mood_entries_insert_own" ON public.mood_entries;

-- Profiles policies
CREATE POLICY "profiles_select_own"
  ON public.profiles FOR SELECT
  USING (auth.uid() = id);

CREATE POLICY "profiles_select_counsellors"
  ON public.profiles FOR SELECT
  USING (user_type = 'counsellor');

CREATE POLICY "profiles_insert_own"
  ON public.profiles FOR INSERT
  WITH CHECK (auth.uid() = id);

CREATE POLICY "profiles_update_own"
  ON public.profiles FOR UPDATE
  USING (auth.uid() = id);

-- Counsellor profile policies
CREATE POLICY "counsellor_profiles_select_all_auth"
  ON public.counsellor_profiles FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "counsellor_profiles_insert_own"
  ON public.counsellor_profiles FOR INSERT
  WITH CHECK (auth.uid() = id);

CREATE POLICY "counsellor_profiles_update_own"
  ON public.counsellor_profiles FOR UPDATE
  USING (auth.uid() = id);

-- Consultation requests policies
CREATE POLICY "consultation_requests_select_related"
  ON public.consultation_requests FOR SELECT
  USING (auth.uid() = patient_id OR auth.uid() = counsellor_id);

CREATE POLICY "consultation_requests_insert_patient"
  ON public.consultation_requests FOR INSERT
  WITH CHECK (auth.uid() = patient_id);

CREATE POLICY "consultation_requests_update_related"
  ON public.consultation_requests FOR UPDATE
  USING (auth.uid() = patient_id OR auth.uid() = counsellor_id);

-- Appointments policies
CREATE POLICY "appointments_select_related"
  ON public.appointments FOR SELECT
  USING (auth.uid() = patient_id OR auth.uid() = counsellor_id);

CREATE POLICY "appointments_insert_counsellor"
  ON public.appointments FOR INSERT
  WITH CHECK (auth.uid() = counsellor_id);

CREATE POLICY "appointments_update_counsellor"
  ON public.appointments FOR UPDATE
  USING (auth.uid() = counsellor_id);

-- Patient history policies
CREATE POLICY "patient_history_select_counsellor"
  ON public.patient_history FOR SELECT
  USING (auth.uid() = counsellor_id);

CREATE POLICY "patient_history_insert_counsellor"
  ON public.patient_history FOR INSERT
  WITH CHECK (auth.uid() = counsellor_id);

CREATE POLICY "patient_history_update_counsellor"
  ON public.patient_history FOR UPDATE
  USING (auth.uid() = counsellor_id);

-- Chat policies
CREATE POLICY "chat_sessions_select_own"
  ON public.chat_sessions FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "chat_sessions_insert_own"
  ON public.chat_sessions FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "chat_messages_select_own_session"
  ON public.chat_messages FOR SELECT
  USING (
    EXISTS (
      SELECT 1
      FROM public.chat_sessions
      WHERE chat_sessions.id = chat_messages.session_id
        AND chat_sessions.user_id = auth.uid()
    )
  );

CREATE POLICY "chat_messages_insert_own_session"
  ON public.chat_messages FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1
      FROM public.chat_sessions
      WHERE chat_sessions.id = chat_messages.session_id
        AND chat_sessions.user_id = auth.uid()
    )
  );

-- Wellness policies
CREATE POLICY "wellness_activities_select_authenticated"
  ON public.wellness_activities FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "activity_logs_select_own"
  ON public.activity_logs FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "activity_logs_insert_own"
  ON public.activity_logs FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "activity_logs_update_own"
  ON public.activity_logs FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "gratitude_entries_select_own"
  ON public.gratitude_entries FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "gratitude_entries_insert_own"
  ON public.gratitude_entries FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "mood_entries_select_own"
  ON public.mood_entries FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "mood_entries_insert_own"
  ON public.mood_entries FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- Indexes
CREATE INDEX IF NOT EXISTS idx_profiles_user_type ON public.profiles(user_type);
CREATE INDEX IF NOT EXISTS idx_consultation_requests_patient ON public.consultation_requests(patient_id);
CREATE INDEX IF NOT EXISTS idx_consultation_requests_counsellor ON public.consultation_requests(counsellor_id);
CREATE INDEX IF NOT EXISTS idx_appointments_patient ON public.appointments(patient_id);
CREATE INDEX IF NOT EXISTS idx_appointments_counsellor ON public.appointments(counsellor_id);
CREATE INDEX IF NOT EXISTS idx_appointments_scheduled_date ON public.appointments(scheduled_date);
CREATE INDEX IF NOT EXISTS idx_patient_history_counsellor ON public.patient_history(counsellor_id);
CREATE INDEX IF NOT EXISTS idx_chat_sessions_user ON public.chat_sessions(user_id);
CREATE INDEX IF NOT EXISTS idx_chat_messages_session ON public.chat_messages(session_id);
CREATE INDEX IF NOT EXISTS idx_wellness_activities_category ON public.wellness_activities(category);
CREATE INDEX IF NOT EXISTS idx_activity_logs_user_started_at ON public.activity_logs(user_id, started_at DESC);
CREATE INDEX IF NOT EXISTS idx_activity_logs_user_completed_at ON public.activity_logs(user_id, completed_at DESC);
CREATE INDEX IF NOT EXISTS idx_gratitude_entries_user_created_at ON public.gratitude_entries(user_id, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_mood_entries_user_created_at ON public.mood_entries(user_id, created_at DESC);
