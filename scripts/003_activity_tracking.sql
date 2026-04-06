-- Activity tracking helper APIs.

CREATE OR REPLACE FUNCTION public.get_today_activity_count(p_user_id UUID)
RETURNS INTEGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  activity_count INTEGER;
BEGIN
  SELECT COUNT(*)
  INTO activity_count
  FROM public.activity_logs
  WHERE user_id = p_user_id
    AND completed_at IS NOT NULL
    AND DATE(completed_at) = CURRENT_DATE;

  RETURN COALESCE(activity_count, 0);
END;
$$;
