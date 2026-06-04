
-- 1. Add patient role
ALTER TYPE public.app_role ADD VALUE IF NOT EXISTS 'patient';

-- 2. Link patient record to a user account
ALTER TABLE public.patients
  ADD COLUMN IF NOT EXISTS patient_user_id uuid REFERENCES auth.users(id) ON DELETE SET NULL;
CREATE INDEX IF NOT EXISTS idx_patients_patient_user_id ON public.patients(patient_user_id);

-- Patients can view their own record / prescriptions / appointments / history
CREATE POLICY "Patients view own record"
  ON public.patients FOR SELECT
  TO authenticated
  USING (patient_user_id = auth.uid());

CREATE POLICY "Patients view own prescriptions"
  ON public.prescriptions FOR SELECT
  TO authenticated
  USING (EXISTS (SELECT 1 FROM public.patients p WHERE p.id = prescriptions.patient_id AND p.patient_user_id = auth.uid()));

CREATE POLICY "Patients view own appointments"
  ON public.appointments FOR SELECT
  TO authenticated
  USING (EXISTS (SELECT 1 FROM public.patients p WHERE p.id = appointments.patient_id AND p.patient_user_id = auth.uid()));

CREATE POLICY "Patients view own history"
  ON public.medical_history FOR SELECT
  TO authenticated
  USING (EXISTS (SELECT 1 FROM public.patients p WHERE p.id = medical_history.patient_id AND p.patient_user_id = auth.uid()));

-- 3. Notifications
CREATE TABLE public.notifications (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  institute_id uuid REFERENCES public.institutes(id) ON DELETE CASCADE,
  title text NOT NULL,
  body text,
  kind text NOT NULL DEFAULT 'info',
  link text,
  read boolean NOT NULL DEFAULT false,
  created_by uuid REFERENCES auth.users(id),
  created_at timestamptz NOT NULL DEFAULT now()
);
CREATE INDEX idx_notifications_user ON public.notifications(user_id, read, created_at DESC);

GRANT SELECT, INSERT, UPDATE, DELETE ON public.notifications TO authenticated;
GRANT ALL ON public.notifications TO service_role;
ALTER TABLE public.notifications ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users view own notifications" ON public.notifications FOR SELECT
  TO authenticated USING (user_id = auth.uid());
CREATE POLICY "Users update own notifications" ON public.notifications FOR UPDATE
  TO authenticated USING (user_id = auth.uid());
CREATE POLICY "Staff create notifications in institute" ON public.notifications FOR INSERT
  TO authenticated WITH CHECK (
    institute_id IS NULL OR institute_id = public.get_user_institute_id(auth.uid())
  );

-- 4. Chat
CREATE TABLE public.chat_messages (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  sender_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  recipient_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  institute_id uuid REFERENCES public.institutes(id) ON DELETE CASCADE,
  body text NOT NULL,
  read boolean NOT NULL DEFAULT false,
  created_at timestamptz NOT NULL DEFAULT now()
);
CREATE INDEX idx_chat_pair ON public.chat_messages(sender_id, recipient_id, created_at DESC);

GRANT SELECT, INSERT, UPDATE, DELETE ON public.chat_messages TO authenticated;
GRANT ALL ON public.chat_messages TO service_role;
ALTER TABLE public.chat_messages ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Chat participants view" ON public.chat_messages FOR SELECT
  TO authenticated USING (sender_id = auth.uid() OR recipient_id = auth.uid());
CREATE POLICY "Sender sends" ON public.chat_messages FOR INSERT
  TO authenticated WITH CHECK (sender_id = auth.uid());
CREATE POLICY "Recipient marks read" ON public.chat_messages FOR UPDATE
  TO authenticated USING (recipient_id = auth.uid());

-- 5. Pharmacy inventory
CREATE TABLE public.pharmacy_inventory (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  institute_id uuid NOT NULL REFERENCES public.institutes(id) ON DELETE CASCADE,
  medication_name text NOT NULL,
  sku text,
  unit text NOT NULL DEFAULT 'unit',
  quantity integer NOT NULL DEFAULT 0,
  reorder_level integer NOT NULL DEFAULT 10,
  expiry_date date,
  notes text,
  updated_by uuid REFERENCES auth.users(id),
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE (institute_id, medication_name)
);
CREATE INDEX idx_inventory_institute ON public.pharmacy_inventory(institute_id);

GRANT SELECT, INSERT, UPDATE, DELETE ON public.pharmacy_inventory TO authenticated;
GRANT ALL ON public.pharmacy_inventory TO service_role;
ALTER TABLE public.pharmacy_inventory ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Inventory: institute staff view" ON public.pharmacy_inventory FOR SELECT
  TO authenticated USING (
    institute_id = public.get_user_institute_id(auth.uid())
    AND (
      public.has_role(auth.uid(), 'pharmacist') OR
      public.has_role(auth.uid(), 'admin') OR
      public.has_role(auth.uid(), 'doctor') OR
      public.has_role(auth.uid(), 'nurse')
    )
  );
CREATE POLICY "Inventory: pharmacist/admin manage" ON public.pharmacy_inventory FOR ALL
  TO authenticated
  USING (
    institute_id = public.get_user_institute_id(auth.uid())
    AND (public.has_role(auth.uid(), 'pharmacist') OR public.has_role(auth.uid(), 'admin'))
  )
  WITH CHECK (
    institute_id = public.get_user_institute_id(auth.uid())
    AND (public.has_role(auth.uid(), 'pharmacist') OR public.has_role(auth.uid(), 'admin'))
  );

CREATE TRIGGER set_pharm_inv_updated_at BEFORE UPDATE ON public.pharmacy_inventory
  FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();

-- Dispense function: atomic decrement
CREATE OR REPLACE FUNCTION public.dispense_medication(_inventory_id uuid, _qty integer)
RETURNS public.pharmacy_inventory
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  row public.pharmacy_inventory;
BEGIN
  IF _qty <= 0 THEN RAISE EXCEPTION 'Quantity must be positive'; END IF;
  UPDATE public.pharmacy_inventory
     SET quantity = quantity - _qty,
         updated_by = auth.uid(),
         updated_at = now()
   WHERE id = _inventory_id
     AND quantity >= _qty
     AND institute_id = public.get_user_institute_id(auth.uid())
  RETURNING * INTO row;
  IF row.id IS NULL THEN RAISE EXCEPTION 'Insufficient stock or not authorized'; END IF;
  RETURN row;
END;
$$;

-- 6. Theatre scheduling
CREATE TABLE public.theatre_rooms (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  institute_id uuid NOT NULL REFERENCES public.institutes(id) ON DELETE CASCADE,
  name text NOT NULL,
  description text,
  active boolean NOT NULL DEFAULT true,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE (institute_id, name)
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.theatre_rooms TO authenticated;
GRANT ALL ON public.theatre_rooms TO service_role;
ALTER TABLE public.theatre_rooms ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Rooms view in institute" ON public.theatre_rooms FOR SELECT
  TO authenticated USING (institute_id = public.get_user_institute_id(auth.uid()));
CREATE POLICY "Rooms manage by admin" ON public.theatre_rooms FOR ALL
  TO authenticated
  USING (institute_id = public.get_user_institute_id(auth.uid()) AND public.has_role(auth.uid(), 'admin'))
  WITH CHECK (institute_id = public.get_user_institute_id(auth.uid()) AND public.has_role(auth.uid(), 'admin'));

CREATE TRIGGER set_rooms_updated_at BEFORE UPDATE ON public.theatre_rooms
  FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();

CREATE TABLE public.theatre_bookings (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  institute_id uuid NOT NULL REFERENCES public.institutes(id) ON DELETE CASCADE,
  room_id uuid NOT NULL REFERENCES public.theatre_rooms(id) ON DELETE CASCADE,
  patient_id uuid REFERENCES public.patients(id) ON DELETE SET NULL,
  surgeon_id uuid REFERENCES auth.users(id) ON DELETE SET NULL,
  procedure text NOT NULL,
  starts_at timestamptz NOT NULL,
  ends_at timestamptz NOT NULL,
  status text NOT NULL DEFAULT 'scheduled',
  notes text,
  created_by uuid REFERENCES auth.users(id),
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
CREATE INDEX idx_bookings_room_time ON public.theatre_bookings(room_id, starts_at, ends_at);

GRANT SELECT, INSERT, UPDATE, DELETE ON public.theatre_bookings TO authenticated;
GRANT ALL ON public.theatre_bookings TO service_role;
ALTER TABLE public.theatre_bookings ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Bookings view in institute" ON public.theatre_bookings FOR SELECT
  TO authenticated USING (institute_id = public.get_user_institute_id(auth.uid()));
CREATE POLICY "Bookings manage by clinical staff" ON public.theatre_bookings FOR ALL
  TO authenticated
  USING (
    institute_id = public.get_user_institute_id(auth.uid())
    AND (public.has_role(auth.uid(), 'admin') OR public.has_role(auth.uid(), 'doctor') OR public.has_role(auth.uid(), 'nurse'))
  )
  WITH CHECK (
    institute_id = public.get_user_institute_id(auth.uid())
    AND (public.has_role(auth.uid(), 'admin') OR public.has_role(auth.uid(), 'doctor') OR public.has_role(auth.uid(), 'nurse'))
  );

CREATE TRIGGER set_bookings_updated_at BEFORE UPDATE ON public.theatre_bookings
  FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();

-- Conflict-check trigger
CREATE OR REPLACE FUNCTION public.check_theatre_booking_conflict()
RETURNS trigger
LANGUAGE plpgsql
SET search_path = public
AS $$
BEGIN
  IF NEW.ends_at <= NEW.starts_at THEN
    RAISE EXCEPTION 'ends_at must be after starts_at';
  END IF;
  IF EXISTS (
    SELECT 1 FROM public.theatre_bookings b
    WHERE b.room_id = NEW.room_id
      AND b.id <> COALESCE(NEW.id, '00000000-0000-0000-0000-000000000000'::uuid)
      AND b.status <> 'cancelled'
      AND tstzrange(b.starts_at, b.ends_at, '[)') && tstzrange(NEW.starts_at, NEW.ends_at, '[)')
  ) THEN
    RAISE EXCEPTION 'Room already booked for that time';
  END IF;
  RETURN NEW;
END;
$$;
CREATE TRIGGER trg_bookings_conflict BEFORE INSERT OR UPDATE ON public.theatre_bookings
  FOR EACH ROW EXECUTE FUNCTION public.check_theatre_booking_conflict();

-- 7. Realtime
ALTER TABLE public.notifications REPLICA IDENTITY FULL;
ALTER TABLE public.chat_messages REPLICA IDENTITY FULL;
ALTER PUBLICATION supabase_realtime ADD TABLE public.notifications;
ALTER PUBLICATION supabase_realtime ADD TABLE public.chat_messages;
