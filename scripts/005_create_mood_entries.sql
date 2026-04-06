-- Mood tracking entries for personalized suggestions.

CREATE TABLE IF NOT EXISTS public.mood_entries (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  mood_value INTEGER NOT NULL CHECK (mood_value BETWEEN 0 AND 4),
  mood_label TEXT NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP
);

ALTER TABLE public.mood_entries ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "mood_entries_select_own" ON public.mood_entries;
DROP POLICY IF EXISTS "mood_entries_insert_own" ON public.mood_entries;

CREATE POLICY "mood_entries_select_own"
  ON public.mood_entries FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "mood_entries_insert_own"
  ON public.mood_entries FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE INDEX IF NOT EXISTS idx_mood_entries_user_created_at
  ON public.mood_entries(user_id, created_at DESC);
