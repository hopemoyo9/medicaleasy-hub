UPDATE public.profiles p
   SET approval_status = 'pending'::public.profile_approval_status,
       updated_at = now()
 WHERE p.institute_id IS NOT NULL
   AND NOT EXISTS (SELECT 1 FROM public.user_roles ur WHERE ur.user_id = p.id)
   AND NOT EXISTS (SELECT 1 FROM public.institutes i WHERE i.created_by = p.id);

UPDATE public.profiles p
   SET requested_role = 'doctor'::public.app_role,
       updated_at = now()
 WHERE p.approval_status = 'pending'::public.profile_approval_status
   AND p.institute_id IS NOT NULL
   AND p.requested_role IS NULL
   AND NOT EXISTS (SELECT 1 FROM public.user_roles ur WHERE ur.user_id = p.id)
   AND NOT EXISTS (SELECT 1 FROM public.institutes i WHERE i.created_by = p.id);