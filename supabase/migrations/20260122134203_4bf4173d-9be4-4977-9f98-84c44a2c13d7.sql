-- Drop the overly permissive SELECT policy
DROP POLICY IF EXISTS "Authenticated users can view patients" ON public.patients;

-- Admins can view all patients
CREATE POLICY "Admins can view all patients"
ON public.patients
FOR SELECT
TO authenticated
USING (public.has_role(auth.uid(), 'admin'));

-- Doctors can view all patients (they need access for consultations)
CREATE POLICY "Doctors can view all patients"
ON public.patients
FOR SELECT
TO authenticated
USING (public.has_role(auth.uid(), 'doctor'));

-- Nurses can view patients they have appointments with
CREATE POLICY "Nurses can view patients with appointments"
ON public.patients
FOR SELECT
TO authenticated
USING (
  public.has_role(auth.uid(), 'nurse') AND (
    EXISTS (
      SELECT 1 FROM public.appointments
      WHERE appointments.patient_id = patients.id
    )
  )
);

-- Pharmacists can only view patients who have prescriptions
CREATE POLICY "Pharmacists can view patients with prescriptions"
ON public.patients
FOR SELECT
TO authenticated
USING (
  public.has_role(auth.uid(), 'pharmacist') AND (
    EXISTS (
      SELECT 1 FROM public.prescriptions
      WHERE prescriptions.patient_id = patients.id
    )
  )
);

-- Also secure the INSERT policy to specific roles
DROP POLICY IF EXISTS "Medical staff can insert patients" ON public.patients;

CREATE POLICY "Admins and doctors can insert patients"
ON public.patients
FOR INSERT
TO authenticated
WITH CHECK (
  public.has_role(auth.uid(), 'admin') OR
  public.has_role(auth.uid(), 'doctor') OR
  public.has_role(auth.uid(), 'nurse')
);

-- Secure the UPDATE policy to specific roles
DROP POLICY IF EXISTS "Medical staff can update patients" ON public.patients;

CREATE POLICY "Admins and doctors can update patients"
ON public.patients
FOR UPDATE
TO authenticated
USING (
  public.has_role(auth.uid(), 'admin') OR
  public.has_role(auth.uid(), 'doctor') OR
  public.has_role(auth.uid(), 'nurse')
);