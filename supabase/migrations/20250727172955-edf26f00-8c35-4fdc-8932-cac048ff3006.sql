
-- Update the client_status enum to include 'approved' status
ALTER TYPE client_status ADD VALUE 'approved';

-- Create a comprehensive company deletion function for super-admin use
CREATE OR REPLACE FUNCTION delete_company_cascade(company_id_param UUID)
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
    deletion_summary jsonb := '{}';
    users_count INTEGER := 0;
    clients_count INTEGER := 0;
    equipment_count INTEGER := 0;
    invoices_count INTEGER := 0;
    company_name TEXT;
BEGIN
    -- Only super_admin can execute this function
    IF NOT EXISTS (
        SELECT 1 FROM profiles 
        WHERE id = auth.uid() AND role = 'super_admin'
    ) THEN
        RAISE EXCEPTION 'Only super administrators can delete companies';
    END IF;
    
    -- Get company name for logging
    SELECT name INTO company_name FROM isp_companies WHERE id = company_id_param;
    
    IF company_name IS NULL THEN
        RAISE EXCEPTION 'Company not found';
    END IF;
    
    -- Count records before deletion for summary
    SELECT COUNT(*) INTO users_count FROM profiles WHERE isp_company_id = company_id_param;
    SELECT COUNT(*) INTO clients_count FROM clients WHERE isp_company_id = company_id_param;
    SELECT COUNT(*) INTO equipment_count FROM equipment WHERE isp_company_id = company_id_param;
    SELECT COUNT(*) INTO invoices_count FROM invoices WHERE isp_company_id = company_id_param;
    
    -- Delete in cascade order to avoid foreign key violations
    
    -- 1. Delete user profiles (this will also delete auth users via trigger)
    DELETE FROM profiles WHERE isp_company_id = company_id_param;
    
    -- 2. Delete client-related data
    DELETE FROM client_equipment WHERE client_id IN (
        SELECT id FROM clients WHERE isp_company_id = company_id_param
    );
    DELETE FROM client_service_assignments WHERE isp_company_id = company_id_param;
    DELETE FROM client_hotspot_access WHERE isp_company_id = company_id_param;
    DELETE FROM wallet_transactions WHERE isp_company_id = company_id_param;
    DELETE FROM installation_invoices WHERE isp_company_id = company_id_param;
    DELETE FROM mpesa_payments WHERE isp_company_id = company_id_param;
    DELETE FROM family_bank_payments WHERE isp_company_id = company_id_param;
    DELETE FROM family_bank_stk_requests WHERE isp_company_id = company_id_param;
    DELETE FROM invoices WHERE isp_company_id = company_id_param;
    DELETE FROM clients WHERE isp_company_id = company_id_param;
    
    -- 3. Delete equipment and inventory
    DELETE FROM equipment_assignments WHERE isp_company_id = company_id_param;
    DELETE FROM inventory_history WHERE isp_company_id = company_id_param;
    DELETE FROM inventory_items WHERE isp_company_id = company_id_param;
    DELETE FROM equipment WHERE isp_company_id = company_id_param;
    
    -- 4. Delete hotspot-related data
    DELETE FROM hotspot_sessions WHERE isp_company_id = company_id_param;
    DELETE FROM hotspot_vouchers WHERE isp_company_id = company_id_param;
    DELETE FROM hotspot_analytics WHERE isp_company_id = company_id_param;
    DELETE FROM hotspots WHERE isp_company_id = company_id_param;
    
    -- 5. Delete support and messaging data
    DELETE FROM support_tickets WHERE isp_company_id = company_id_param;
    DELETE FROM internal_messages WHERE isp_company_id = company_id_param;
    DELETE FROM external_users WHERE isp_company_id = company_id_param;
    DELETE FROM departments WHERE isp_company_id = company_id_param;
    
    -- 6. Delete network and analytics data
    DELETE FROM network_events WHERE isp_company_id = company_id_param;
    DELETE FROM bandwidth_statistics WHERE isp_company_id = company_id_param;
    DELETE FROM interface_statistics WHERE isp_company_id = company_id_param;
    
    -- 7. Delete service packages and settings
    DELETE FROM service_packages WHERE isp_company_id = company_id_param;
    DELETE FROM base_stations WHERE isp_company_id = company_id_param;
    DELETE FROM mpesa_settings WHERE isp_company_id = company_id_param;
    DELETE FROM payment_method_settings WHERE isp_company_id = company_id_param;
    DELETE FROM system_settings WHERE isp_company_id = company_id_param;
    
    -- 8. Finally delete the company
    DELETE FROM isp_companies WHERE id = company_id_param;
    
    -- Build deletion summary
    deletion_summary := jsonb_build_object(
        'success', true,
        'company_name', company_name,
        'company_id', company_id_param,
        'deleted_counts', jsonb_build_object(
            'users', users_count,
            'clients', clients_count,
            'equipment', equipment_count,
            'invoices', invoices_count
        ),
        'deleted_at', NOW()
    );
    
    RETURN deletion_summary;
    
EXCEPTION
    WHEN OTHERS THEN
        RETURN jsonb_build_object(
            'success', false,
            'error', SQLERRM,
            'company_name', company_name
        );
END;
$$;
