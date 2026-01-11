-- Add INSERT policy for employees to create invitations
CREATE POLICY "Employees can create invitations"
ON public.invitations
FOR INSERT
TO authenticated
WITH CHECK (
  employee_id IN (
    SELECT id FROM public.employees WHERE user_id = auth.uid()
  )
);

-- Add UPDATE policy for employees to update their invitations
CREATE POLICY "Employees can update their invitations"
ON public.invitations
FOR UPDATE
TO authenticated
USING (
  employee_id IN (
    SELECT id FROM public.employees WHERE user_id = auth.uid()
  )
)
WITH CHECK (
  employee_id IN (
    SELECT id FROM public.employees WHERE user_id = auth.uid()
  )
);