
-- Drop the incorrectly configured policies
DROP POLICY IF EXISTS "Guardians can view employees in their site" ON public.employees;
DROP POLICY IF EXISTS "Guardians can update invitations for their site" ON public.invitations;
DROP POLICY IF EXISTS "Guardians can view invitations for their site" ON public.invitations;

-- Recreate policy for guardians to view employees (with correct role)
CREATE POLICY "Guardians can view employees in their site" 
ON public.employees 
FOR SELECT 
TO authenticated
USING (
  company_id IN (
    SELECT c.id FROM companies c
    WHERE c.site_id = get_guardian_site_id(auth.uid())
  )
);

-- Recreate policy for guardians to view invitations (with correct function)
CREATE POLICY "Guardians can view invitations for their site" 
ON public.invitations 
FOR SELECT 
TO authenticated
USING (
  employee_id IN (
    SELECT e.id 
    FROM employees e
    JOIN companies c ON e.company_id = c.id
    WHERE c.site_id = get_guardian_site_id(auth.uid())
  )
);

-- Recreate policy for guardians to update invitations (to mark as used)
CREATE POLICY "Guardians can update invitations for their site" 
ON public.invitations 
FOR UPDATE 
TO authenticated
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

-- Add policy for guardians to view profiles of employees in their site (needed to get names)
CREATE POLICY "Guardians can view employee profiles in their site" 
ON public.profiles 
FOR SELECT 
TO authenticated
USING (
  has_role(auth.uid(), 'guardian'::app_role) AND 
  id IN (
    SELECT e.user_id 
    FROM employees e
    JOIN companies c ON e.company_id = c.id
    WHERE c.site_id = get_guardian_site_id(auth.uid())
  )
);
