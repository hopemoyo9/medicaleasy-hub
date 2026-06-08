
-- 1) Institutes registration_key exposure: use column-level grants
REVOKE SELECT ON public.institutes FROM anon, authenticated;
GRANT SELECT (id, name, type, status, address, phone, email, created_by, approved_by, created_at, updated_at) ON public.institutes TO authenticated;
GRANT SELECT (id, name, type, status) ON public.institutes TO anon;
-- Super admins / owners need full access including registration_key
GRANT SELECT (registration_key) ON public.institutes TO authenticated;
-- Note: row visibility still governed by RLS; column grant required for any read.
-- Restrict the column further via a column privilege REVOKE then a targeted GRANT:
REVOKE SELECT (registration_key) ON public.institutes FROM authenticated;
-- Service role keeps full
GRANT ALL ON public.institutes TO service_role;

-- 2) Cross-institute leakage: add institute_id scoping to clinical policies

-- patients
DROP POLICY IF EXISTS "Admins can view all patients" ON public.patients;
CREATE POLICY "Admins view patients in institute" ON public.patients FOR SELECT TO authenticated
  USING (has_role(auth.uid(), 'admin') AND institute_id = get_user_institute_id(auth.uid()));

DROP POLICY IF EXISTS "Doctors can view all patients" ON public.patients;
CREATE POLICY "Doctors view patients in institute" ON public.patients FOR SELECT TO authenticated
  USING (has_role(auth.uid(), 'doctor') AND institute_id = get_user_institute_id(auth.uid()));

DROP POLICY IF EXISTS "Nurses can view patients with appointments" ON public.patients;
CREATE POLICY "Nurses view patients in institute" ON public.patients FOR SELECT TO authenticated
  USING (has_role(auth.uid(), 'nurse') AND institute_id = get_user_institute_id(auth.uid())
         AND EXISTS (SELECT 1 FROM appointments WHERE appointments.patient_id = patients.id));

DROP POLICY IF EXISTS "Pharmacists can view patients with prescriptions" ON public.patients;
CREATE POLICY "Pharmacists view patients in institute" ON public.patients FOR SELECT TO authenticated
  USING (has_role(auth.uid(), 'pharmacist') AND institute_id = get_user_institute_id(auth.uid())
         AND EXISTS (SELECT 1 FROM prescriptions WHERE prescriptions.patient_id = patients.id));

DROP POLICY IF EXISTS "Admins and doctors can insert patients" ON public.patients;
CREATE POLICY "Clinical staff insert patients in institute" ON public.patients FOR INSERT TO authenticated
  WITH CHECK ((has_role(auth.uid(), 'admin') OR has_role(auth.uid(), 'doctor') OR has_role(auth.uid(), 'nurse'))
              AND institute_id = get_user_institute_id(auth.uid()));

DROP POLICY IF EXISTS "Admins and doctors can update patients" ON public.patients;
CREATE POLICY "Clinical staff update patients in institute" ON public.patients FOR UPDATE TO authenticated
  USING ((has_role(auth.uid(), 'admin') OR has_role(auth.uid(), 'doctor') OR has_role(auth.uid(), 'nurse'))
         AND institute_id = get_user_institute_id(auth.uid()));

-- prescriptions
DROP POLICY IF EXISTS "Admins can manage prescriptions" ON public.prescriptions;
CREATE POLICY "Admins manage prescriptions in institute" ON public.prescriptions FOR ALL TO authenticated
  USING (has_role(auth.uid(), 'admin') AND institute_id = get_user_institute_id(auth.uid()))
  WITH CHECK (has_role(auth.uid(), 'admin') AND institute_id = get_user_institute_id(auth.uid()));

DROP POLICY IF EXISTS "Doctors can view all prescriptions" ON public.prescriptions;
CREATE POLICY "Doctors view prescriptions in institute" ON public.prescriptions FOR SELECT TO authenticated
  USING (has_role(auth.uid(), 'doctor') AND institute_id = get_user_institute_id(auth.uid()));

DROP POLICY IF EXISTS "Doctors can insert prescriptions" ON public.prescriptions;
CREATE POLICY "Doctors insert prescriptions in institute" ON public.prescriptions FOR INSERT TO authenticated
  WITH CHECK (has_role(auth.uid(), 'doctor') AND institute_id = get_user_institute_id(auth.uid()));

DROP POLICY IF EXISTS "Doctors can update their prescriptions" ON public.prescriptions;
CREATE POLICY "Doctors update own prescriptions in institute" ON public.prescriptions FOR UPDATE TO authenticated
  USING (has_role(auth.uid(), 'doctor') AND institute_id = get_user_institute_id(auth.uid())
         AND (prescribed_by = auth.uid() OR prescribed_by IS NULL));

DROP POLICY IF EXISTS "Pharmacists can view prescriptions" ON public.prescriptions;
CREATE POLICY "Pharmacists view prescriptions in institute" ON public.prescriptions FOR SELECT TO authenticated
  USING (has_role(auth.uid(), 'pharmacist') AND institute_id = get_user_institute_id(auth.uid()));

DROP POLICY IF EXISTS "Pharmacists can update prescriptions" ON public.prescriptions;
CREATE POLICY "Pharmacists update prescriptions in institute" ON public.prescriptions FOR UPDATE TO authenticated
  USING (has_role(auth.uid(), 'pharmacist') AND institute_id = get_user_institute_id(auth.uid()));

-- medical_history
DROP POLICY IF EXISTS "Admins can view medical history" ON public.medical_history;
CREATE POLICY "Admins view history in institute" ON public.medical_history FOR SELECT TO authenticated
  USING (has_role(auth.uid(), 'admin') AND institute_id = get_user_institute_id(auth.uid()));

DROP POLICY IF EXISTS "Admins can insert medical history" ON public.medical_history;
CREATE POLICY "Admins insert history in institute" ON public.medical_history FOR INSERT TO authenticated
  WITH CHECK (has_role(auth.uid(), 'admin') AND institute_id = get_user_institute_id(auth.uid()));

DROP POLICY IF EXISTS "Admins can update medical history" ON public.medical_history;
CREATE POLICY "Admins update history in institute" ON public.medical_history FOR UPDATE TO authenticated
  USING (has_role(auth.uid(), 'admin') AND institute_id = get_user_institute_id(auth.uid()));

DROP POLICY IF EXISTS "Doctors can view medical history" ON public.medical_history;
CREATE POLICY "Doctors view history in institute" ON public.medical_history FOR SELECT TO authenticated
  USING (has_role(auth.uid(), 'doctor') AND institute_id = get_user_institute_id(auth.uid()));

DROP POLICY IF EXISTS "Doctors can insert medical history" ON public.medical_history;
CREATE POLICY "Doctors insert history in institute" ON public.medical_history FOR INSERT TO authenticated
  WITH CHECK (has_role(auth.uid(), 'doctor') AND institute_id = get_user_institute_id(auth.uid()));

DROP POLICY IF EXISTS "Doctors can update medical history" ON public.medical_history;
CREATE POLICY "Doctors update history in institute" ON public.medical_history FOR UPDATE TO authenticated
  USING (has_role(auth.uid(), 'doctor') AND institute_id = get_user_institute_id(auth.uid()));

DROP POLICY IF EXISTS "Pharmacists can view medical history they created" ON public.medical_history;
CREATE POLICY "Pharmacists view own history in institute" ON public.medical_history FOR SELECT TO authenticated
  USING (has_role(auth.uid(), 'pharmacist') AND created_by = auth.uid() AND institute_id = get_user_institute_id(auth.uid()));

DROP POLICY IF EXISTS "Pharmacists can insert medical history" ON public.medical_history;
CREATE POLICY "Pharmacists insert history in institute" ON public.medical_history FOR INSERT TO authenticated
  WITH CHECK (has_role(auth.uid(), 'pharmacist') AND institute_id = get_user_institute_id(auth.uid()));

-- donations
DROP POLICY IF EXISTS "Admins can view donations" ON public.donations;
CREATE POLICY "Admins view donations in institute" ON public.donations FOR SELECT TO authenticated
  USING (has_role(auth.uid(), 'admin') AND institute_id = get_user_institute_id(auth.uid()));

DROP POLICY IF EXISTS "Admins can create donations" ON public.donations;
CREATE POLICY "Admins create donations in institute" ON public.donations FOR INSERT TO authenticated
  WITH CHECK (has_role(auth.uid(), 'admin') AND institute_id = get_user_institute_id(auth.uid()));

DROP POLICY IF EXISTS "Admins can update all donations" ON public.donations;
CREATE POLICY "Admins update donations in institute" ON public.donations FOR UPDATE TO authenticated
  USING (has_role(auth.uid(), 'admin') AND institute_id = get_user_institute_id(auth.uid()));

DROP POLICY IF EXISTS "Nurses can view donations" ON public.donations;
CREATE POLICY "Nurses view donations in institute" ON public.donations FOR SELECT TO authenticated
  USING (has_role(auth.uid(), 'nurse') AND institute_id = get_user_institute_id(auth.uid()));

DROP POLICY IF EXISTS "Nurses can create donations" ON public.donations;
CREATE POLICY "Nurses create donations in institute" ON public.donations FOR INSERT TO authenticated
  WITH CHECK (has_role(auth.uid(), 'nurse') AND institute_id = get_user_institute_id(auth.uid()));

-- appointments
DROP POLICY IF EXISTS "Admins can manage appointments" ON public.appointments;
CREATE POLICY "Admins manage appointments in institute" ON public.appointments FOR ALL TO authenticated
  USING (has_role(auth.uid(), 'admin') AND institute_id = get_user_institute_id(auth.uid()))
  WITH CHECK (has_role(auth.uid(), 'admin') AND institute_id = get_user_institute_id(auth.uid()));

DROP POLICY IF EXISTS "Doctors can manage their appointments" ON public.appointments;
CREATE POLICY "Doctors manage appointments in institute" ON public.appointments FOR ALL TO authenticated
  USING (has_role(auth.uid(), 'doctor') AND institute_id = get_user_institute_id(auth.uid())
         AND (doctor_id = auth.uid() OR doctor_id IS NULL))
  WITH CHECK (has_role(auth.uid(), 'doctor') AND institute_id = get_user_institute_id(auth.uid()));

DROP POLICY IF EXISTS "Nurses can view appointments" ON public.appointments;
CREATE POLICY "Nurses view appointments in institute" ON public.appointments FOR SELECT TO authenticated
  USING (has_role(auth.uid(), 'nurse') AND institute_id = get_user_institute_id(auth.uid()));

DROP POLICY IF EXISTS "Nurses can insert appointments" ON public.appointments;
CREATE POLICY "Nurses insert appointments in institute" ON public.appointments FOR INSERT TO authenticated
  WITH CHECK (has_role(auth.uid(), 'nurse') AND institute_id = get_user_institute_id(auth.uid()));

DROP POLICY IF EXISTS "Nurses can update appointments" ON public.appointments;
CREATE POLICY "Nurses update appointments in institute" ON public.appointments FOR UPDATE TO authenticated
  USING (has_role(auth.uid(), 'nurse') AND institute_id = get_user_institute_id(auth.uid()));

-- 3) Revoke EXECUTE on SECURITY DEFINER helpers from anon (not needed pre-auth)
REVOKE EXECUTE ON FUNCTION public.has_role(uuid, app_role) FROM anon, public;
REVOKE EXECUTE ON FUNCTION public.get_user_institute_id(uuid) FROM anon, public;
REVOKE EXECUTE ON FUNCTION public.dispense_medication(uuid, integer) FROM anon, public;
GRANT EXECUTE ON FUNCTION public.has_role(uuid, app_role) TO authenticated;
GRANT EXECUTE ON FUNCTION public.get_user_institute_id(uuid) TO authenticated;
GRANT EXECUTE ON FUNCTION public.dispense_medication(uuid, integer) TO authenticated;
