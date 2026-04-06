-- Gratitude journal entries for patient dashboard.

CREATE TABLE IF NOT EXISTS public.gratitude_entries (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  content TEXT NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP
);

ALTER TABLE public.gratitude_entries ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "gratitude_entries_select_own" ON public.gratitude_entries;
DROP POLICY IF EXISTS "gratitude_entries_insert_own" ON public.gratitude_entries;

CREATE POLICY "gratitude_entries_select_own"
  ON public.gratitude_entries FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "gratitude_entries_insert_own"
  ON public.gratitude_entries FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE INDEX IF NOT EXISTS idx_gratitude_entries_user_created_at
  ON public.gratitude_entries(user_id, created_at DESC);
