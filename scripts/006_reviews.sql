-- 006_reviews.sql
-- Create counsellor_reviews table and average rating triggers

CREATE TABLE IF NOT EXISTS public.counsellor_reviews (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  patient_id uuid REFERENCES public.profiles(id) ON DELETE CASCADE,
  counsellor_id uuid REFERENCES public.counsellor_profiles(id) ON DELETE CASCADE,
  appointment_id uuid REFERENCES public.appointments(id) ON DELETE SET NULL,
  rating integer NOT NULL CHECK (rating >= 1 AND rating <= 5),
  review_text text,
  created_at timestamp with time zone DEFAULT timezone('utc'::text, now()) NOT NULL,
  updated_at timestamp with time zone DEFAULT timezone('utc'::text, now()) NOT NULL,
  UNIQUE(patient_id, appointment_id) -- Only one review per appointment
);

-- RLS Policies
ALTER TABLE public.counsellor_reviews ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can view reviews"
  ON public.counsellor_reviews FOR SELECT
  USING (true);

CREATE POLICY "Patients can insert their own reviews"
  ON public.counsellor_reviews FOR INSERT
  WITH CHECK (auth.uid() = patient_id);

CREATE POLICY "Patients can update their own reviews"
  ON public.counsellor_reviews FOR UPDATE
  USING (auth.uid() = patient_id);

-- Trigger to update counsellor rating automatically
CREATE OR REPLACE FUNCTION update_counsellor_rating()
RETURNS TRIGGER AS $$
BEGIN
  UPDATE public.counsellor_profiles
  SET rating = (
    SELECT ROUND(AVG(rating)::numeric, 2)
    FROM public.counsellor_reviews
    WHERE counsellor_id = COALESCE(NEW.counsellor_id, OLD.counsellor_id)
  )
  WHERE id = COALESCE(NEW.counsellor_id, OLD.counsellor_id);
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE TRIGGER on_review_change
  AFTER INSERT OR UPDATE OR DELETE ON public.counsellor_reviews
  FOR EACH ROW EXECUTE FUNCTION update_counsellor_rating();
