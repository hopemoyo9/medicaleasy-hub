
-- 1. Create enums for institute type and status
CREATE TYPE public.institute_type AS ENUM ('hospital', 'clinic', 'surgery', 'pharmacy');
CREATE TYPE public.institute_status AS ENUM ('pending', 'approved', 'rejected');

-- 2. Create institutes table
CREATE TABLE public.institutes (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  type institute_type NOT NULL,
  registration_key text NOT NULL UNIQUE,
  status institute_status NOT NULL DEFAULT 'pending',
  address text,
  phone text,
  email text,
  created_by uuid,
  approved_by uuid,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE public.institutes ENABLE ROW LEVEL SECURITY;

-- 3. Add institute_id to existing tables
ALTER TABLE public.profiles ADD COLUMN institute_id uuid REFERENCES public.institutes(id);
ALTER TABLE public.patients ADD COLUMN institute_id uuid REFERENCES public.institutes(id);
ALTER TABLE public.appointments ADD COLUMN institute_id uuid REFERENCES public.institutes(id);
ALTER TABLE public.prescriptions ADD COLUMN institute_id uuid REFERENCES public.institutes(id);
ALTER TABLE public.donations ADD COLUMN institute_id uuid REFERENCES public.institutes(id);
ALTER TABLE public.medical_history ADD COLUMN institute_id uuid REFERENCES public.institutes(id);

-- 4. Helper function to get user's institute
CREATE OR REPLACE FUNCTION public.get_user_institute_id(_user_id uuid)
RETURNS uuid
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT institute_id FROM public.profiles WHERE id = _user_id LIMIT 1
$$;

-- 5. RLS policies for institutes table
CREATE POLICY "View approved or own institutes" ON public.institutes
FOR SELECT TO authenticated
USING (
  status = 'approved' 
  OR created_by = auth.uid() 
  OR has_role(auth.uid(), 'super_admin')
);

CREATE POLICY "Authenticated can register institute" ON public.institutes
FOR INSERT TO authenticated
WITH CHECK (true);

CREATE POLICY "Super admin can update institutes" ON public.institutes
FOR UPDATE TO authenticated
USING (has_role(auth.uid(), 'super_admin'))
WITH CHECK (has_role(auth.uid(), 'super_admin'));

CREATE POLICY "Super admin can delete institutes" ON public.institutes
FOR DELETE TO authenticated
USING (has_role(auth.uid(), 'super_admin'));

-- 6. Trigger for updated_at
CREATE TRIGGER handle_institutes_updated_at
  BEFORE UPDATE ON public.institutes
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_updated_at();

-- 7. Allow admins to view institute profiles
CREATE POLICY "Admins can view institute profiles" ON public.profiles
FOR SELECT TO authenticated
USING (
  has_role(auth.uid(), 'admin') 
  AND institute_id = get_user_institute_id(auth.uid())
);

-- 8. Super admins can view all profiles
CREATE POLICY "Super admins can view all profiles" ON public.profiles
FOR SELECT TO authenticated
USING (has_role(auth.uid(), 'super_admin'));

-- 9. Allow anon users to view approved institutes (for registration dropdown)
CREATE POLICY "Anon can view approved institutes" ON public.institutes
FOR SELECT TO anon
USING (status = 'approved');
