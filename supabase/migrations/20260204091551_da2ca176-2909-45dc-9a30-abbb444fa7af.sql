-- Allow anonymous/public read access to invitations by alpha_code
-- This is needed for the public invitation page

CREATE POLICY "Anyone can view invitations by alpha_code"
ON public.invitations
FOR SELECT
TO anon
USING (true);
