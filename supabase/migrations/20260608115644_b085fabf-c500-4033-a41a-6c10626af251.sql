
DO $$ BEGIN
  CREATE TYPE public.profile_approval_status AS ENUM ('pending','approved','rejected');
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

ALTER TABLE public.profiles
  ADD COLUMN IF NOT EXISTS approval_status public.profile_approval_status NOT NULL DEFAULT 'approved',
  ADD COLUMN IF NOT EXISTS requested_role public.app_role,
  ADD COLUMN IF NOT EXISTS approved_by uuid,
  ADD COLUMN IF NOT EXISTS approved_at timestamptz;

-- New staff signups will explicitly set this to 'pending' from the app.

-- Allow institute admins to update profiles in their own institute (for approval)
DROP POLICY IF EXISTS "Admins can update institute profiles" ON public.profiles;
CREATE POLICY "Admins can update institute profiles"
  ON public.profiles
  FOR UPDATE
  TO authenticated
  USING (
    public.has_role(auth.uid(), 'admin'::app_role)
    AND institute_id = public.get_user_institute_id(auth.uid())
  )
  WITH CHECK (
    public.has_role(auth.uid(), 'admin'::app_role)
    AND institute_id = public.get_user_institute_id(auth.uid())
  );
