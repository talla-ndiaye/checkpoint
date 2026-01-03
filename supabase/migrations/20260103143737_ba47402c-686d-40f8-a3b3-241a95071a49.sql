-- Create enum for user roles
CREATE TYPE public.app_role AS ENUM ('super_admin', 'manager', 'guardian', 'company_admin', 'employee');

-- Create profiles table (linked to auth.users)
CREATE TABLE public.profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email TEXT NOT NULL,
  first_name TEXT NOT NULL,
  last_name TEXT NOT NULL,
  phone TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL
);

-- Create user_roles table (separate from profiles for security)
CREATE TABLE public.user_roles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  role app_role NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL,
  UNIQUE (user_id, role)
);

-- Create sites table
CREATE TABLE public.sites (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  address TEXT NOT NULL,
  manager_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL
);

-- Create companies table
CREATE TABLE public.companies (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  site_id UUID REFERENCES public.sites(id) ON DELETE CASCADE NOT NULL,
  admin_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL
);

-- Create employees table
CREATE TABLE public.employees (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL UNIQUE,
  company_id UUID REFERENCES public.companies(id) ON DELETE CASCADE NOT NULL,
  qr_code TEXT NOT NULL UNIQUE,
  unique_code CHAR(6) NOT NULL UNIQUE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL
);

-- Create guardians table
CREATE TABLE public.guardians (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL UNIQUE,
  site_id UUID REFERENCES public.sites(id) ON DELETE CASCADE NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL
);

-- Create invitations table
CREATE TABLE public.invitations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  employee_id UUID REFERENCES public.employees(id) ON DELETE CASCADE NOT NULL,
  visitor_name TEXT NOT NULL,
  visitor_phone TEXT NOT NULL,
  visit_date DATE NOT NULL,
  visit_time TIME NOT NULL,
  qr_code TEXT NOT NULL UNIQUE,
  alpha_code CHAR(6) NOT NULL UNIQUE,
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'used', 'expired', 'cancelled')),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL
);

-- Create access_logs table
CREATE TABLE public.access_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  invitation_id UUID REFERENCES public.invitations(id) ON DELETE SET NULL,
  action_type TEXT NOT NULL CHECK (action_type IN ('entry', 'exit', 'invitation_used')),
  site_id UUID REFERENCES public.sites(id) ON DELETE CASCADE NOT NULL,
  scanned_by UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  timestamp TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL
);

-- Enable RLS on all tables
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_roles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.sites ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.companies ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.employees ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.guardians ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.invitations ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.access_logs ENABLE ROW LEVEL SECURITY;

-- Create security definer function to check roles
CREATE OR REPLACE FUNCTION public.has_role(_user_id UUID, _role app_role)
RETURNS BOOLEAN
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1
    FROM public.user_roles
    WHERE user_id = _user_id
      AND role = _role
  )
$$;

-- Create function to get user's site_id (for managers/guardians)
CREATE OR REPLACE FUNCTION public.get_user_site_id(_user_id UUID)
RETURNS UUID
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT COALESCE(
    (SELECT site_id FROM public.guardians WHERE user_id = _user_id),
    (SELECT id FROM public.sites WHERE manager_id = _user_id)
  )
$$;

-- Create function to get user's company_id (for company admins/employees)
CREATE OR REPLACE FUNCTION public.get_user_company_id(_user_id UUID)
RETURNS UUID
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT COALESCE(
    (SELECT company_id FROM public.employees WHERE user_id = _user_id),
    (SELECT id FROM public.companies WHERE admin_id = _user_id)
  )
$$;

-- Profiles policies
CREATE POLICY "Users can view their own profile"
ON public.profiles FOR SELECT
TO authenticated
USING (id = auth.uid());

CREATE POLICY "Super admins can view all profiles"
ON public.profiles FOR SELECT
TO authenticated
USING (public.has_role(auth.uid(), 'super_admin'));

CREATE POLICY "Users can update their own profile"
ON public.profiles FOR UPDATE
TO authenticated
USING (id = auth.uid());

CREATE POLICY "Super admins can manage all profiles"
ON public.profiles FOR ALL
TO authenticated
USING (public.has_role(auth.uid(), 'super_admin'));

-- User roles policies
CREATE POLICY "Users can view their own roles"
ON public.user_roles FOR SELECT
TO authenticated
USING (user_id = auth.uid());

CREATE POLICY "Super admins can manage all roles"
ON public.user_roles FOR ALL
TO authenticated
USING (public.has_role(auth.uid(), 'super_admin'));

-- Sites policies
CREATE POLICY "Super admins can manage all sites"
ON public.sites FOR ALL
TO authenticated
USING (public.has_role(auth.uid(), 'super_admin'));

CREATE POLICY "Managers can view their site"
ON public.sites FOR SELECT
TO authenticated
USING (manager_id = auth.uid() OR public.has_role(auth.uid(), 'super_admin'));

CREATE POLICY "Guardians can view their site"
ON public.sites FOR SELECT
TO authenticated
USING (id = public.get_user_site_id(auth.uid()));

CREATE POLICY "Company users can view their site"
ON public.sites FOR SELECT
TO authenticated
USING (
  id IN (
    SELECT site_id FROM public.companies 
    WHERE id = public.get_user_company_id(auth.uid())
  )
);

-- Companies policies
CREATE POLICY "Super admins can manage all companies"
ON public.companies FOR ALL
TO authenticated
USING (public.has_role(auth.uid(), 'super_admin'));

CREATE POLICY "Managers can manage companies in their site"
ON public.companies FOR ALL
TO authenticated
USING (
  site_id IN (SELECT id FROM public.sites WHERE manager_id = auth.uid())
);

CREATE POLICY "Company admins can view their company"
ON public.companies FOR SELECT
TO authenticated
USING (admin_id = auth.uid());

CREATE POLICY "Employees can view their company"
ON public.companies FOR SELECT
TO authenticated
USING (id = public.get_user_company_id(auth.uid()));

-- Employees policies
CREATE POLICY "Super admins can manage all employees"
ON public.employees FOR ALL
TO authenticated
USING (public.has_role(auth.uid(), 'super_admin'));

CREATE POLICY "Company admins can manage their employees"
ON public.employees FOR ALL
TO authenticated
USING (
  company_id IN (SELECT id FROM public.companies WHERE admin_id = auth.uid())
);

CREATE POLICY "Employees can view their own record"
ON public.employees FOR SELECT
TO authenticated
USING (user_id = auth.uid());

CREATE POLICY "Managers can view employees in their site"
ON public.employees FOR SELECT
TO authenticated
USING (
  company_id IN (
    SELECT id FROM public.companies 
    WHERE site_id IN (SELECT id FROM public.sites WHERE manager_id = auth.uid())
  )
);

-- Guardians policies
CREATE POLICY "Super admins can manage all guardians"
ON public.guardians FOR ALL
TO authenticated
USING (public.has_role(auth.uid(), 'super_admin'));

CREATE POLICY "Managers can manage guardians in their site"
ON public.guardians FOR ALL
TO authenticated
USING (
  site_id IN (SELECT id FROM public.sites WHERE manager_id = auth.uid())
);

CREATE POLICY "Guardians can view their own record"
ON public.guardians FOR SELECT
TO authenticated
USING (user_id = auth.uid());

-- Invitations policies
CREATE POLICY "Employees can manage their invitations"
ON public.invitations FOR ALL
TO authenticated
USING (
  employee_id IN (SELECT id FROM public.employees WHERE user_id = auth.uid())
);

CREATE POLICY "Super admins can view all invitations"
ON public.invitations FOR SELECT
TO authenticated
USING (public.has_role(auth.uid(), 'super_admin'));

CREATE POLICY "Managers can view invitations in their site"
ON public.invitations FOR SELECT
TO authenticated
USING (
  employee_id IN (
    SELECT e.id FROM public.employees e
    JOIN public.companies c ON e.company_id = c.id
    WHERE c.site_id IN (SELECT id FROM public.sites WHERE manager_id = auth.uid())
  )
);

CREATE POLICY "Guardians can view invitations for their site"
ON public.invitations FOR SELECT
TO authenticated
USING (
  employee_id IN (
    SELECT e.id FROM public.employees e
    JOIN public.companies c ON e.company_id = c.id
    WHERE c.site_id = public.get_user_site_id(auth.uid())
  )
);

-- Access logs policies
CREATE POLICY "Super admins can manage all access logs"
ON public.access_logs FOR ALL
TO authenticated
USING (public.has_role(auth.uid(), 'super_admin'));

CREATE POLICY "Guardians can create access logs for their site"
ON public.access_logs FOR INSERT
TO authenticated
WITH CHECK (
  site_id = public.get_user_site_id(auth.uid())
  AND public.has_role(auth.uid(), 'guardian')
);

CREATE POLICY "Guardians can view access logs for their site"
ON public.access_logs FOR SELECT
TO authenticated
USING (site_id = public.get_user_site_id(auth.uid()));

CREATE POLICY "Managers can view access logs for their site"
ON public.access_logs FOR SELECT
TO authenticated
USING (
  site_id IN (SELECT id FROM public.sites WHERE manager_id = auth.uid())
);

CREATE POLICY "Users can view their own access logs"
ON public.access_logs FOR SELECT
TO authenticated
USING (user_id = auth.uid());

-- Create trigger for automatic profile creation on signup
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  INSERT INTO public.profiles (id, email, first_name, last_name)
  VALUES (
    NEW.id,
    NEW.email,
    COALESCE(NEW.raw_user_meta_data ->> 'first_name', ''),
    COALESCE(NEW.raw_user_meta_data ->> 'last_name', '')
  );
  RETURN NEW;
END;
$$;

CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- Create function to generate unique 6-character code
CREATE OR REPLACE FUNCTION public.generate_unique_code()
RETURNS CHAR(6)
LANGUAGE plpgsql
AS $$
DECLARE
  chars TEXT := 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
  result CHAR(6) := '';
  i INTEGER;
BEGIN
  FOR i IN 1..6 LOOP
    result := result || substr(chars, floor(random() * length(chars) + 1)::integer, 1);
  END LOOP;
  RETURN result;
END;
$$;

-- Create updated_at trigger function
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER
LANGUAGE plpgsql
AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$;

-- Apply updated_at triggers
CREATE TRIGGER update_profiles_updated_at
  BEFORE UPDATE ON public.profiles
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_sites_updated_at
  BEFORE UPDATE ON public.sites
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_companies_updated_at
  BEFORE UPDATE ON public.companies
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_invitations_updated_at
  BEFORE UPDATE ON public.invitations
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();