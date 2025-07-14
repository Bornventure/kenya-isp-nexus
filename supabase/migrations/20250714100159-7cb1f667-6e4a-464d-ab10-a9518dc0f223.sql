
-- Grant INSERT permission to anon role for registration submissions
GRANT INSERT ON public.company_registration_requests TO anon;

-- Grant SELECT permission to anon role for the .single() operation after insert
GRANT SELECT ON public.company_registration_requests TO anon;

-- Ensure authenticated role has necessary permissions too
GRANT INSERT, SELECT ON public.company_registration_requests TO authenticated;
