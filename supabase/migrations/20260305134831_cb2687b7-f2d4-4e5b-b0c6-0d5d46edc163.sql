
-- Fix overly permissive INSERT policy
DROP POLICY "Authenticated can register institute" ON public.institutes;
CREATE POLICY "Authenticated can register institute" ON public.institutes
FOR INSERT TO authenticated
WITH CHECK (created_by = auth.uid());
