
-- Backfill admin/pharmacist role for institute creators that have no role yet
INSERT INTO public.user_roles (user_id, role)
SELECT DISTINCT i.created_by,
  CASE WHEN i.type = 'pharmacy' THEN 'pharmacist'::app_role ELSE 'admin'::app_role END
FROM public.institutes i
WHERE i.created_by IS NOT NULL
  AND NOT EXISTS (
    SELECT 1 FROM public.user_roles ur WHERE ur.user_id = i.created_by
  )
ON CONFLICT DO NOTHING;

-- Ensure profile is linked to the institute and approved for institute creators
UPDATE public.profiles p
   SET institute_id = i.id,
       approval_status = 'approved'
  FROM public.institutes i
 WHERE i.created_by = p.id
   AND (p.institute_id IS NULL OR p.approval_status <> 'approved');
