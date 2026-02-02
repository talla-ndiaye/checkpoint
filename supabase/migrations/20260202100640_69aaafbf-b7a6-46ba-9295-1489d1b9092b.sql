
-- Drop and recreate get_guardian_site_id with proper SECURITY DEFINER and search_path
CREATE OR REPLACE FUNCTION public.get_guardian_site_id(_user_id uuid)
RETURNS uuid
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT site_id FROM public.guardians WHERE user_id = _user_id LIMIT 1
$$;

-- Drop existing guardian policies on employees
DROP POLICY IF EXISTS "Guardians can view employees in their site" ON public.employees;

-- Create a simpler, more direct policy for guardians to view employees
CREATE POLICY "Guardians can view employees in their site" 
ON public.employees 
FOR SELECT 
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM guardians g
    JOIN companies c ON c.site_id = g.site_id
    WHERE g.user_id = auth.uid()
    AND c.id = employees.company_id
  )
);

-- Drop existing guardian policies on invitations
DROP POLICY IF EXISTS "Guardians can view invitations for their site" ON public.invitations;
DROP POLICY IF EXISTS "Guardians can update invitations for their site" ON public.invitations;

-- Create simpler policies for guardians on invitations
CREATE POLICY "Guardians can view invitations for their site" 
ON public.invitations 
FOR SELECT 
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM guardians g
    JOIN companies c ON c.site_id = g.site_id
    JOIN employees e ON e.company_id = c.id
    WHERE g.user_id = auth.uid()
    AND e.id = invitations.employee_id
  )
);

CREATE POLICY "Guardians can update invitations for their site" 
ON public.invitations 
FOR UPDATE 
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM guardians g
    JOIN companies c ON c.site_id = g.site_id
    JOIN employees e ON e.company_id = c.id
    WHERE g.user_id = auth.uid()
    AND e.id = invitations.employee_id
  )
)
WITH CHECK (
  EXISTS (
    SELECT 1 FROM guardians g
    JOIN companies c ON c.site_id = g.site_id
    JOIN employees e ON e.company_id = c.id
    WHERE g.user_id = auth.uid()
    AND e.id = invitations.employee_id
  )
);

-- Ensure guardians can view profiles of employees in their site
DROP POLICY IF EXISTS "Guardians can view employee profiles in their site" ON public.profiles;

CREATE POLICY "Guardians can view employee profiles in their site" 
ON public.profiles 
FOR SELECT 
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM guardians g
    JOIN companies c ON c.site_id = g.site_id
    JOIN employees e ON e.company_id = c.id
    WHERE g.user_id = auth.uid()
    AND e.user_id = profiles.id
  )
);

-- Ensure guardians can view companies in their site
DROP POLICY IF EXISTS "Guardians can view companies in their site" ON public.companies;

CREATE POLICY "Guardians can view companies in their site" 
ON public.companies 
FOR SELECT 
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM guardians g
    WHERE g.user_id = auth.uid()
    AND g.site_id = companies.site_id
  )
);
