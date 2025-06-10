
-- Insert some initial service packages for testing with proper type casting
DO $$
DECLARE
    company_id UUID;
BEGIN
    -- Get the first ISP company ID (or create one if none exists)
    SELECT id INTO company_id FROM public.isp_companies LIMIT 1;
    
    IF company_id IS NULL THEN
        -- Create a default ISP company if none exists
        INSERT INTO public.isp_companies (name, license_key, license_type, email, phone)
        VALUES ('Default ISP', 'DEFAULT-LICENSE-001', 'starter', 'admin@defaultisp.com', '+254700000000')
        RETURNING id INTO company_id;
    END IF;
    
    -- Insert service packages for this company with proper type casting
    INSERT INTO public.service_packages (
        id,
        isp_company_id,
        name,
        speed,
        monthly_rate,
        connection_types,
        description,
        is_active
    ) VALUES 
    (
        '84ea1832-7fc7-45a2-a3af-4fb8eef40ba6',
        company_id,
        'Basic Plan',
        '5 Mbps',
        2500,
        ARRAY['fiber', 'wireless']::connection_type[],
        'Perfect for basic internet browsing and social media',
        true
    ),
    (
        '7b2d7e69-f1a5-413e-9597-31cda65d03f1',
        company_id,
        'Standard Plan',
        '10 Mbps',
        3500,
        ARRAY['fiber', 'wireless']::connection_type[],
        'Great for streaming and video calls',
        true
    ),
    (
        'df4712c7-7582-46c9-a72c-049fd2b4c378',
        company_id,
        'Premium Plan',
        '25 Mbps',
        5500,
        ARRAY['fiber', 'wireless', 'satellite']::connection_type[],
        'High-speed internet for heavy usage',
        true
    ),
    (
        '02d16326-a1bb-47c3-8045-0ae11b8c3c57',
        company_id,
        'Enterprise Plan',
        '50 Mbps',
        8500,
        ARRAY['fiber']::connection_type[],
        'Business-grade internet for enterprises',
        true
    )
    ON CONFLICT (id) DO UPDATE SET
        name = EXCLUDED.name,
        speed = EXCLUDED.speed,
        monthly_rate = EXCLUDED.monthly_rate,
        connection_types = EXCLUDED.connection_types,
        description = EXCLUDED.description,
        is_active = EXCLUDED.is_active,
        updated_at = now();
END $$;
