-- Add pharmacist feedback columns to prescriptions table
ALTER TABLE public.prescriptions 
ADD COLUMN IF NOT EXISTS pharmacist_notes text,
ADD COLUMN IF NOT EXISTS medication_available boolean DEFAULT true,
ADD COLUMN IF NOT EXISTS medication_substituted boolean DEFAULT false,
ADD COLUMN IF NOT EXISTS substituted_medication text,
ADD COLUMN IF NOT EXISTS pharmacist_updated_at timestamp with time zone,
ADD COLUMN IF NOT EXISTS pharmacist_id uuid REFERENCES auth.users(id);

-- Create index for faster pharmacist queries
CREATE INDEX IF NOT EXISTS idx_prescriptions_status ON public.prescriptions(status);
CREATE INDEX IF NOT EXISTS idx_prescriptions_pharmacist ON public.prescriptions(pharmacist_id);