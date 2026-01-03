-- Create a function to auto-assign super_admin role to the first user
-- This is for initial setup only
CREATE OR REPLACE FUNCTION public.auto_assign_first_super_admin()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  -- Check if there are no super_admin users yet
  IF NOT EXISTS (SELECT 1 FROM public.user_roles WHERE role = 'super_admin') THEN
    INSERT INTO public.user_roles (user_id, role) VALUES (NEW.id, 'super_admin');
  END IF;
  RETURN NEW;
END;
$$;

-- Create trigger to auto-assign first user as super_admin
CREATE TRIGGER on_first_user_super_admin
  AFTER INSERT ON public.profiles
  FOR EACH ROW EXECUTE FUNCTION public.auto_assign_first_super_admin();