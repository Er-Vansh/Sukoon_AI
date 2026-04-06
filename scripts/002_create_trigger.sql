-- Triggers and helper functions for profile/session consistency.

CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  INSERT INTO public.profiles (id, full_name, email, user_type)
  VALUES (
    NEW.id,
    COALESCE(NEW.raw_user_meta_data->>'full_name', split_part(NEW.email, '@', 1), 'User'),
    NEW.email,
    CASE
      WHEN COALESCE(NEW.raw_user_meta_data->>'user_type', 'patient') = 'counsellor' THEN 'counsellor'
      ELSE 'patient'
    END
  )
  ON CONFLICT (id) DO UPDATE
    SET full_name = EXCLUDED.full_name,
        email = EXCLUDED.email,
        user_type = EXCLUDED.user_type;

  IF COALESCE(NEW.raw_user_meta_data->>'user_type', 'patient') = 'counsellor' THEN
    INSERT INTO public.counsellor_profiles (id, specialization, bio)
    VALUES (
      NEW.id,
      COALESCE(NEW.raw_user_meta_data->>'specialization', 'General Counselling'),
      COALESCE(NEW.raw_user_meta_data->>'bio', '')
    )
    ON CONFLICT (id) DO UPDATE
      SET specialization = COALESCE(EXCLUDED.specialization, public.counsellor_profiles.specialization),
          bio = COALESCE(EXCLUDED.bio, public.counsellor_profiles.bio);
  END IF;

  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_new_user();

CREATE OR REPLACE FUNCTION public.handle_updated_at()
RETURNS TRIGGER
LANGUAGE plpgsql
AS $$
BEGIN
  NEW.updated_at = CURRENT_TIMESTAMP;
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS update_profiles_updated_at ON public.profiles;
CREATE TRIGGER update_profiles_updated_at
  BEFORE UPDATE ON public.profiles
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_updated_at();

DROP TRIGGER IF EXISTS update_consultation_requests_updated_at ON public.consultation_requests;
CREATE TRIGGER update_consultation_requests_updated_at
  BEFORE UPDATE ON public.consultation_requests
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_updated_at();

DROP TRIGGER IF EXISTS update_appointments_updated_at ON public.appointments;
CREATE TRIGGER update_appointments_updated_at
  BEFORE UPDATE ON public.appointments
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_updated_at();

DROP TRIGGER IF EXISTS update_patient_history_updated_at ON public.patient_history;
CREATE TRIGGER update_patient_history_updated_at
  BEFORE UPDATE ON public.patient_history
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_updated_at();

DROP TRIGGER IF EXISTS update_chat_sessions_updated_at ON public.chat_sessions;
CREATE TRIGGER update_chat_sessions_updated_at
  BEFORE UPDATE ON public.chat_sessions
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_updated_at();
