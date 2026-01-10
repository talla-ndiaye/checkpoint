-- Drop problematic policies on sites table
DROP POLICY IF EXISTS "Company users can view their site" ON public.sites;
DROP POLICY IF EXISTS "Guardians can view their site" ON public.sites;
DROP POLICY IF EXISTS "Managers can view their site" ON public.sites;
DROP POLICY IF EXISTS "Super admins can manage all sites" ON public.sites;

-- Drop problematic policies on profiles that cause recursion
DROP POLICY IF EXISTS "Company admins can view employee profiles" ON public.profiles;
DROP POLICY IF EXISTS "Managers can view manager profiles" ON public.profiles;
DROP POLICY IF EXISTS "Managers can view profiles in their site" ON public.profiles;
DROP POLICY IF EXISTS "Super admins can manage all profiles" ON public.profiles;
DROP POLICY IF EXISTS "Super admins can view all profiles" ON public.profiles;
DROP POLICY IF EXISTS "Users can update their own profile" ON public.profiles;
DROP POLICY IF EXISTS "Users can view their own profile" ON public.profiles;

-- Create helper function to check super_admin without recursion
CREATE OR REPLACE FUNCTION public.is_super_admin(_user_id uuid)
RETURNS boolean
LANGUAGE sql
STABLE SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.user_roles
    WHERE user_id = _user_id AND role = 'super_admin'
  )
$$;

-- Create helper function to get manager's site ID without RLS
CREATE OR REPLACE FUNCTION public.get_manager_site_id(_user_id uuid)
RETURNS uuid
LANGUAGE sql
STABLE SECURITY DEFINER
SET search_path = public
AS $$
  SELECT id FROM public.sites WHERE manager_id = _user_id LIMIT 1
$$;

-- Create helper function to get guardian's site ID without RLS
CREATE OR REPLACE FUNCTION public.get_guardian_site_id(_user_id uuid)
RETURNS uuid
LANGUAGE sql
STABLE SECURITY DEFINER
SET search_path = public
AS $$
  SELECT site_id FROM public.guardians WHERE user_id = _user_id LIMIT 1
$$;

-- Create helper function to get company's site ID for a user
CREATE OR REPLACE FUNCTION public.get_company_site_id_for_user(_user_id uuid)
RETURNS uuid
LANGUAGE sql
STABLE SECURITY DEFINER
SET search_path = public
AS $$
  SELECT c.site_id 
  FROM public.companies c
  JOIN public.employees e ON e.company_id = c.id
  WHERE e.user_id = _user_id
  LIMIT 1
$$;

-- Recreate sites policies using SECURITY DEFINER functions
CREATE POLICY "Super admins can manage all sites"
ON public.sites FOR ALL
TO authenticated
USING (is_super_admin(auth.uid()))
WITH CHECK (is_super_admin(auth.uid()));

CREATE POLICY "Managers can view their site"
ON public.sites FOR SELECT
TO authenticated
USING (manager_id = auth.uid());

CREATE POLICY "Guardians can view their site"
ON public.sites FOR SELECT
TO authenticated
USING (id = get_guardian_site_id(auth.uid()));

CREATE POLICY "Company users can view their site"
ON public.sites FOR SELECT
TO authenticated
USING (id = get_company_site_id_for_user(auth.uid()));

-- Recreate profiles policies without recursion
CREATE POLICY "Users can view their own profile"
ON public.profiles FOR SELECT
TO authenticated
USING (id = auth.uid());

CREATE POLICY "Users can update their own profile"
ON public.profiles FOR UPDATE
TO authenticated
USING (id = auth.uid())
WITH CHECK (id = auth.uid());

CREATE POLICY "Super admins can manage all profiles"
ON public.profiles FOR ALL
TO authenticated
USING (is_super_admin(auth.uid()))
WITH CHECK (is_super_admin(auth.uid()));

CREATE POLICY "Managers can view profiles in their site"
ON public.profiles FOR SELECT
TO authenticated
USING (
  has_role(auth.uid(), 'manager'::app_role) AND (
    -- View guardians in their site
    id IN (SELECT g.user_id FROM public.guardians g WHERE g.site_id = get_manager_site_id(auth.uid()))
    OR
    -- View employees in their site's companies
    id IN (
      SELECT e.user_id FROM public.employees e
      JOIN public.companies c ON e.company_id = c.id
      WHERE c.site_id = get_manager_site_id(auth.uid())
    )
    OR
    -- View company admins in their site
    id IN (
      SELECT c.admin_id FROM public.companies c
      WHERE c.site_id = get_manager_site_id(auth.uid())
    )
  )
);

CREATE POLICY "Company admins can view employee profiles"
ON public.profiles FOR SELECT
TO authenticated
USING (
  has_role(auth.uid(), 'company_admin'::app_role) AND
  id IN (
    SELECT e.user_id FROM public.employees e
    JOIN public.companies c ON e.company_id = c.id
    WHERE c.admin_id = auth.uid()
  )
);