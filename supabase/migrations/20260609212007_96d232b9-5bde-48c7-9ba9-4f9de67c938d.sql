
-- 1. institutes.registration_key: column-level revoke
REVOKE SELECT (registration_key) ON public.institutes FROM anon, authenticated;

-- 2. notifications INSERT: require clinical role + target same institute
DROP POLICY IF EXISTS "Staff create notifications in institute" ON public.notifications;
CREATE POLICY "Staff create notifications in institute"
  ON public.notifications FOR INSERT TO authenticated
  WITH CHECK (
    (public.has_role(auth.uid(), 'admin'::app_role)
     OR public.has_role(auth.uid(), 'doctor'::app_role)
     OR public.has_role(auth.uid(), 'nurse'::app_role)
     OR public.has_role(auth.uid(), 'pharmacist'::app_role))
    AND (institute_id IS NULL OR institute_id = public.get_user_institute_id(auth.uid()))
    AND (created_by = auth.uid())
  );

-- 3. theatre_bookings: restrict SELECT to clinical staff
DROP POLICY IF EXISTS "Bookings view in institute" ON public.theatre_bookings;
CREATE POLICY "Bookings view in institute"
  ON public.theatre_bookings FOR SELECT TO authenticated
  USING (
    institute_id = public.get_user_institute_id(auth.uid())
    AND (public.has_role(auth.uid(), 'admin'::app_role)
         OR public.has_role(auth.uid(), 'doctor'::app_role)
         OR public.has_role(auth.uid(), 'nurse'::app_role))
  );

-- 4. theatre_rooms: restrict SELECT to clinical staff
DROP POLICY IF EXISTS "Rooms view in institute" ON public.theatre_rooms;
CREATE POLICY "Rooms view in institute"
  ON public.theatre_rooms FOR SELECT TO authenticated
  USING (
    institute_id = public.get_user_institute_id(auth.uid())
    AND (public.has_role(auth.uid(), 'admin'::app_role)
         OR public.has_role(auth.uid(), 'doctor'::app_role)
         OR public.has_role(auth.uid(), 'nurse'::app_role))
  );

-- 5. user_roles: scope admin policies to authenticated only
DROP POLICY IF EXISTS "Admins can manage roles" ON public.user_roles;
DROP POLICY IF EXISTS "Admins can view all roles" ON public.user_roles;
CREATE POLICY "Admins can manage roles"
  ON public.user_roles FOR ALL TO authenticated
  USING (public.has_role(auth.uid(), 'admin'::app_role))
  WITH CHECK (public.has_role(auth.uid(), 'admin'::app_role));
CREATE POLICY "Admins can view all roles"
  ON public.user_roles FOR SELECT TO authenticated
  USING (public.has_role(auth.uid(), 'admin'::app_role));

-- 6. Revoke public/anon EXECUTE on SECURITY DEFINER helper functions
REVOKE EXECUTE ON FUNCTION public.has_role(uuid, app_role) FROM PUBLIC, anon;
REVOKE EXECUTE ON FUNCTION public.get_user_institute_id(uuid) FROM PUBLIC, anon;
REVOKE EXECUTE ON FUNCTION public.dispense_medication(uuid, integer) FROM PUBLIC, anon;
REVOKE EXECUTE ON FUNCTION public.handle_updated_at() FROM PUBLIC, anon;
REVOKE EXECUTE ON FUNCTION public.handle_new_user() FROM PUBLIC, anon;
GRANT EXECUTE ON FUNCTION public.has_role(uuid, app_role) TO authenticated;
GRANT EXECUTE ON FUNCTION public.get_user_institute_id(uuid) TO authenticated;
GRANT EXECUTE ON FUNCTION public.dispense_medication(uuid, integer) TO authenticated;
