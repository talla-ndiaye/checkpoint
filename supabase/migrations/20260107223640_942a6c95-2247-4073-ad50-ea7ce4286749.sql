-- Allow managers to view profiles of users in their site
CREATE POLICY "Managers can view profiles in their site" 
ON public.profiles 
FOR SELECT 
USING (
  -- Can view profiles of guardians in their site
  id IN (
    SELECT g.user_id FROM guardians g
    JOIN sites s ON g.site_id = s.id
    WHERE s.manager_id = auth.uid()
  )
  OR
  -- Can view profiles of employees in companies of their site
  id IN (
    SELECT e.user_id FROM employees e
    JOIN companies c ON e.company_id = c.id
    JOIN sites s ON c.site_id = s.id
    WHERE s.manager_id = auth.uid()
  )
  OR
  -- Can view profiles of company admins in their site
  id IN (
    SELECT c.admin_id FROM companies c
    JOIN sites s ON c.site_id = s.id
    WHERE s.manager_id = auth.uid()
  )
);

-- Allow company admins to view profiles of employees in their company
CREATE POLICY "Company admins can view employee profiles" 
ON public.profiles 
FOR SELECT 
USING (
  id IN (
    SELECT e.user_id FROM employees e
    JOIN companies c ON e.company_id = c.id
    WHERE c.admin_id = auth.uid()
  )
);

-- Allow managers to view all manager profiles (for site assignment)
CREATE POLICY "Managers can view manager profiles" 
ON public.profiles 
FOR SELECT 
USING (
  id IN (
    SELECT ur.user_id FROM user_roles ur
    WHERE ur.role = 'manager'
  )
  AND has_role(auth.uid(), 'manager')
);