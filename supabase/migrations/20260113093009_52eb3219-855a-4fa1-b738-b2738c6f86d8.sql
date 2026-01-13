-- Allow guardians to view employees in their site (for QR code scanning)
CREATE POLICY "Guardians can view employees in their site" 
ON public.employees 
FOR SELECT 
USING (
  company_id IN (
    SELECT c.id FROM companies c
    WHERE c.site_id = get_guardian_site_id(auth.uid())
  )
);

-- Allow guardians to update invitations (to mark as used)
CREATE POLICY "Guardians can update invitations for their site" 
ON public.invitations 
FOR UPDATE 
USING (
  employee_id IN (
    SELECT e.id 
    FROM employees e
    JOIN companies c ON e.company_id = c.id
    WHERE c.site_id = get_guardian_site_id(auth.uid())
  )
)
WITH CHECK (
  employee_id IN (
    SELECT e.id 
    FROM employees e
    JOIN companies c ON e.company_id = c.id
    WHERE c.site_id = get_guardian_site_id(auth.uid())
  )
);