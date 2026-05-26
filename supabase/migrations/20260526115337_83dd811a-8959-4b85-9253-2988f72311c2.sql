CREATE POLICY "Pharmacists can insert medical history"
ON public.medical_history
FOR INSERT
TO authenticated
WITH CHECK (has_role(auth.uid(), 'pharmacist'::app_role));

CREATE POLICY "Pharmacists can view medical history they created"
ON public.medical_history
FOR SELECT
TO authenticated
USING (has_role(auth.uid(), 'pharmacist'::app_role) AND created_by = auth.uid());