-- Fix appointments table policies
DROP POLICY IF EXISTS "Authenticated users can view appointments" ON public.appointments;
DROP POLICY IF EXISTS "Medical staff can manage appointments" ON public.appointments;

-- Admins can manage all appointments
CREATE POLICY "Admins can manage appointments"
ON public.appointments
FOR ALL
TO authenticated
USING (public.has_role(auth.uid(), 'admin'))
WITH CHECK (public.has_role(auth.uid(), 'admin'));

-- Doctors can view and manage their own appointments
CREATE POLICY "Doctors can manage their appointments"
ON public.appointments
FOR ALL
TO authenticated
USING (
  public.has_role(auth.uid(), 'doctor') AND 
  (doctor_id = auth.uid() OR doctor_id IS NULL)
)
WITH CHECK (
  public.has_role(auth.uid(), 'doctor')
);

-- Nurses can view all appointments and create/update them
CREATE POLICY "Nurses can view appointments"
ON public.appointments
FOR SELECT
TO authenticated
USING (public.has_role(auth.uid(), 'nurse'));

CREATE POLICY "Nurses can insert appointments"
ON public.appointments
FOR INSERT
TO authenticated
WITH CHECK (public.has_role(auth.uid(), 'nurse'));

CREATE POLICY "Nurses can update appointments"
ON public.appointments
FOR UPDATE
TO authenticated
USING (public.has_role(auth.uid(), 'nurse'));

-- Fix prescriptions table policies
DROP POLICY IF EXISTS "Authenticated users can view prescriptions" ON public.prescriptions;
DROP POLICY IF EXISTS "Medical staff can insert prescriptions" ON public.prescriptions;
DROP POLICY IF EXISTS "Medical staff can update prescriptions" ON public.prescriptions;

-- Admins can manage all prescriptions
CREATE POLICY "Admins can manage prescriptions"
ON public.prescriptions
FOR ALL
TO authenticated
USING (public.has_role(auth.uid(), 'admin'))
WITH CHECK (public.has_role(auth.uid(), 'admin'));

-- Doctors can view and manage prescriptions they created
CREATE POLICY "Doctors can view all prescriptions"
ON public.prescriptions
FOR SELECT
TO authenticated
USING (public.has_role(auth.uid(), 'doctor'));

CREATE POLICY "Doctors can insert prescriptions"
ON public.prescriptions
FOR INSERT
TO authenticated
WITH CHECK (public.has_role(auth.uid(), 'doctor'));

CREATE POLICY "Doctors can update their prescriptions"
ON public.prescriptions
FOR UPDATE
TO authenticated
USING (
  public.has_role(auth.uid(), 'doctor') AND 
  (prescribed_by = auth.uid() OR prescribed_by IS NULL)
);

-- Pharmacists can view and update prescriptions (to add notes, mark as completed)
CREATE POLICY "Pharmacists can view prescriptions"
ON public.prescriptions
FOR SELECT
TO authenticated
USING (public.has_role(auth.uid(), 'pharmacist'));

CREATE POLICY "Pharmacists can update prescriptions"
ON public.prescriptions
FOR UPDATE
TO authenticated
USING (public.has_role(auth.uid(), 'pharmacist'));

-- Fix medical_history table policies
DROP POLICY IF EXISTS "Authenticated users can view medical history" ON public.medical_history;
DROP POLICY IF EXISTS "Medical staff can insert medical history" ON public.medical_history;
DROP POLICY IF EXISTS "Medical staff can update medical history" ON public.medical_history;

-- Only admins and doctors can view medical history
CREATE POLICY "Admins can view medical history"
ON public.medical_history
FOR SELECT
TO authenticated
USING (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Doctors can view medical history"
ON public.medical_history
FOR SELECT
TO authenticated
USING (public.has_role(auth.uid(), 'doctor'));

-- Only doctors can insert/update medical history
CREATE POLICY "Doctors can insert medical history"
ON public.medical_history
FOR INSERT
TO authenticated
WITH CHECK (public.has_role(auth.uid(), 'doctor'));

CREATE POLICY "Doctors can update medical history"
ON public.medical_history
FOR UPDATE
TO authenticated
USING (public.has_role(auth.uid(), 'doctor'));

-- Admins can also manage medical history
CREATE POLICY "Admins can insert medical history"
ON public.medical_history
FOR INSERT
TO authenticated
WITH CHECK (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Admins can update medical history"
ON public.medical_history
FOR UPDATE
TO authenticated
USING (public.has_role(auth.uid(), 'admin'));

-- Fix donations table policies
DROP POLICY IF EXISTS "Authenticated users can view donations" ON public.donations;
DROP POLICY IF EXISTS "Authenticated users can create donations" ON public.donations;
DROP POLICY IF EXISTS "Admins can update donations" ON public.donations;

-- Only admins and nurses can view donations
CREATE POLICY "Admins can view donations"
ON public.donations
FOR SELECT
TO authenticated
USING (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Nurses can view donations"
ON public.donations
FOR SELECT
TO authenticated
USING (public.has_role(auth.uid(), 'nurse'));

-- Admins and nurses can create donations
CREATE POLICY "Admins can create donations"
ON public.donations
FOR INSERT
TO authenticated
WITH CHECK (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Nurses can create donations"
ON public.donations
FOR INSERT
TO authenticated
WITH CHECK (public.has_role(auth.uid(), 'nurse'));

-- Admins can update donations
CREATE POLICY "Admins can update all donations"
ON public.donations
FOR UPDATE
TO authenticated
USING (public.has_role(auth.uid(), 'admin'));