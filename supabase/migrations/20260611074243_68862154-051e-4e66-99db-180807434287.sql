CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
DECLARE
  requested_role public.app_role;
  requested_institute_id uuid;
  metadata_institute_id text;
BEGIN
  IF NEW.raw_user_meta_data ? 'requested_role'
     AND NEW.raw_user_meta_data->>'requested_role' IN ('doctor', 'nurse', 'pharmacist') THEN
    requested_role := (NEW.raw_user_meta_data->>'requested_role')::public.app_role;
  END IF;

  metadata_institute_id := NEW.raw_user_meta_data->>'institute_id';
  IF metadata_institute_id ~* '^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$' THEN
    SELECT i.id
      INTO requested_institute_id
      FROM public.institutes i
     WHERE i.id = metadata_institute_id::uuid
       AND i.status = 'approved'
     LIMIT 1;
  END IF;

  INSERT INTO public.profiles (
    id,
    full_name,
    email,
    institute_id,
    approval_status,
    requested_role
  )
  VALUES (
    NEW.id,
    COALESCE(NULLIF(NEW.raw_user_meta_data->>'full_name', ''), 'User'),
    NEW.email,
    requested_institute_id,
    CASE WHEN requested_role IS NOT NULL THEN 'pending'::public.profile_approval_status ELSE 'approved'::public.profile_approval_status END,
    requested_role
  )
  ON CONFLICT (id) DO UPDATE SET
    full_name = EXCLUDED.full_name,
    email = EXCLUDED.email,
    institute_id = COALESCE(public.profiles.institute_id, EXCLUDED.institute_id),
    approval_status = CASE
      WHEN EXCLUDED.requested_role IS NOT NULL THEN 'pending'::public.profile_approval_status
      ELSE public.profiles.approval_status
    END,
    requested_role = COALESCE(public.profiles.requested_role, EXCLUDED.requested_role),
    updated_at = now();

  RETURN NEW;
END;
$$;

CREATE OR REPLACE FUNCTION public.set_patient_insert_defaults()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
BEGIN
  IF NEW.created_by IS NULL THEN
    NEW.created_by := auth.uid();
  END IF;

  IF NEW.institute_id IS NULL THEN
    NEW.institute_id := public.get_user_institute_id(auth.uid());
  END IF;

  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS set_patient_insert_defaults ON public.patients;
CREATE TRIGGER set_patient_insert_defaults
BEFORE INSERT ON public.patients
FOR EACH ROW
EXECUTE FUNCTION public.set_patient_insert_defaults();

CREATE OR REPLACE FUNCTION public.set_prescription_insert_defaults()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
DECLARE
  patient_institute_id uuid;
BEGIN
  IF NEW.prescribed_by IS NULL THEN
    NEW.prescribed_by := auth.uid();
  END IF;

  IF NEW.institute_id IS NULL THEN
    SELECT p.institute_id
      INTO patient_institute_id
      FROM public.patients p
     WHERE p.id = NEW.patient_id
     LIMIT 1;

    NEW.institute_id := COALESCE(patient_institute_id, public.get_user_institute_id(auth.uid()));
  END IF;

  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS set_prescription_insert_defaults ON public.prescriptions;
CREATE TRIGGER set_prescription_insert_defaults
BEFORE INSERT ON public.prescriptions
FOR EACH ROW
EXECUTE FUNCTION public.set_prescription_insert_defaults();

WITH institute_domains AS (
  SELECT id, lower(split_part(email, '@', 2)) AS email_domain
    FROM public.institutes
   WHERE email IS NOT NULL AND position('@' in email) > 0
  UNION
  SELECT id, lower(domain) AS email_domain
    FROM public.institutes
   WHERE domain IS NOT NULL
)
UPDATE public.profiles p
   SET institute_id = d.id,
       updated_at = now()
  FROM institute_domains d
 WHERE p.institute_id IS NULL
   AND position('@' in p.email) > 0
   AND lower(split_part(p.email, '@', 2)) = d.email_domain;

UPDATE public.profiles p
   SET institute_id = i.id,
       updated_at = now()
  FROM public.institutes i
 WHERE p.institute_id IS NULL
   AND lower(split_part(p.email, '@', 2)) = 'impilo.ac.zw'
   AND lower(i.name) = 'mpilo';

UPDATE public.patients pa
   SET institute_id = pr.institute_id,
       updated_at = now()
  FROM public.profiles pr
 WHERE pa.institute_id IS NULL
   AND pa.created_by = pr.id
   AND pr.institute_id IS NOT NULL;

UPDATE public.prescriptions rx
   SET institute_id = pa.institute_id,
       updated_at = now()
  FROM public.patients pa
 WHERE rx.institute_id IS NULL
   AND rx.patient_id = pa.id
   AND pa.institute_id IS NOT NULL;

REVOKE EXECUTE ON FUNCTION public.handle_new_user() FROM PUBLIC, anon;
REVOKE EXECUTE ON FUNCTION public.set_patient_insert_defaults() FROM PUBLIC, anon;
REVOKE EXECUTE ON FUNCTION public.set_prescription_insert_defaults() FROM PUBLIC, anon;
GRANT EXECUTE ON FUNCTION public.set_patient_insert_defaults() TO authenticated;
GRANT EXECUTE ON FUNCTION public.set_prescription_insert_defaults() TO authenticated;