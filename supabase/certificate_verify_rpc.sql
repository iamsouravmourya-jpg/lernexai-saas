-- Public certificate verification (run in Supabase SQL editor)
-- Exposes only non-sensitive fields; no auth required.

CREATE OR REPLACE FUNCTION verify_certificate_public(p_certificate_id TEXT)
RETURNS JSON
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  rec certificate_purchases%ROWTYPE;
BEGIN
  SELECT *
  INTO rec
  FROM certificate_purchases
  WHERE certificate_id = trim(p_certificate_id)
  LIMIT 1;

  IF NOT FOUND THEN
    RETURN json_build_object('valid', false);
  END IF;

  RETURN json_build_object(
    'valid', true,
    'certificate_id', rec.certificate_id,
    'full_name', rec.full_name,
    'course_title', rec.course_title,
    'grade', rec.grade,
    'score', rec.score,
    'issued_at', rec.issued_at
  );
END;
$$;

GRANT EXECUTE ON FUNCTION verify_certificate_public(TEXT) TO anon, authenticated;
