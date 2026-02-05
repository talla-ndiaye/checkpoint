-- Add receipt code columns to walk_in_visitors table for exit validation
ALTER TABLE public.walk_in_visitors 
ADD COLUMN receipt_code VARCHAR(8) UNIQUE,
ADD COLUMN receipt_qr_code TEXT,
ADD COLUMN exit_validated BOOLEAN DEFAULT false,
ADD COLUMN exit_at TIMESTAMP WITH TIME ZONE;

-- Create a function to generate unique receipt codes
CREATE OR REPLACE FUNCTION public.generate_receipt_code()
RETURNS VARCHAR(8) AS $$
DECLARE
  chars TEXT := 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
  result VARCHAR(8) := '';
  i INTEGER;
  exists_count INTEGER;
BEGIN
  LOOP
    result := '';
    FOR i IN 1..8 LOOP
      result := result || substr(chars, floor(random() * length(chars) + 1)::integer, 1);
    END LOOP;
    
    SELECT COUNT(*) INTO exists_count FROM public.walk_in_visitors WHERE receipt_code = result;
    EXIT WHEN exists_count = 0;
  END LOOP;
  
  RETURN result;
END;
$$ LANGUAGE plpgsql SET search_path = public;

-- Create index for faster receipt code lookups
CREATE INDEX idx_walk_in_visitors_receipt_code ON public.walk_in_visitors(receipt_code);

-- Update the guardians RLS policy to allow updating walk_in_visitors (for exit validation)
DROP POLICY IF EXISTS "Guardians can update walk-in visitors on their site" ON public.walk_in_visitors;
CREATE POLICY "Guardians can update walk-in visitors on their site"
ON public.walk_in_visitors FOR UPDATE
USING (
  EXISTS (
    SELECT 1 FROM public.guardians g
    WHERE g.user_id = auth.uid()
    AND g.site_id = walk_in_visitors.site_id
  )
);