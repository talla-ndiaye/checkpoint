-- Create table for walk-in visitors (visitors without prior invitation)
CREATE TABLE public.walk_in_visitors (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  site_id UUID NOT NULL REFERENCES public.sites(id) ON DELETE CASCADE,
  first_name TEXT NOT NULL,
  last_name TEXT NOT NULL,
  id_card_number TEXT NOT NULL,
  birth_date DATE,
  gender TEXT,
  nationality TEXT DEFAULT 'SEN',
  address TEXT,
  id_card_expiry DATE,
  photo_url TEXT,
  scanned_by UUID REFERENCES auth.users(id),
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.walk_in_visitors ENABLE ROW LEVEL SECURITY;

-- Policies for walk_in_visitors
CREATE POLICY "Guardians can create walk-in visitors for their site"
ON public.walk_in_visitors
FOR INSERT
WITH CHECK (
  site_id = get_guardian_site_id(auth.uid()) 
  AND has_role(auth.uid(), 'guardian'::app_role)
);

CREATE POLICY "Guardians can view walk-in visitors for their site"
ON public.walk_in_visitors
FOR SELECT
USING (site_id = get_user_site_id(auth.uid()));

CREATE POLICY "Managers can view walk-in visitors for their site"
ON public.walk_in_visitors
FOR SELECT
USING (site_id IN (SELECT id FROM sites WHERE manager_id = auth.uid()));

CREATE POLICY "Super admins can manage all walk-in visitors"
ON public.walk_in_visitors
FOR ALL
USING (has_role(auth.uid(), 'super_admin'::app_role));

-- Add walk_in_visitor_id to access_logs for linking
ALTER TABLE public.access_logs 
ADD COLUMN walk_in_visitor_id UUID REFERENCES public.walk_in_visitors(id);