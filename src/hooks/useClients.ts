
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Client } from '@/types/client';

export const useClients = () => {
  const { data: clients = [], isLoading, error, refetch } = useQuery({
    queryKey: ['clients'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('clients')
        .select(`
          *,
          service_packages (
            id,
            name,
            speed,
            monthly_rate,
            setup_fee,
            description,
            is_active,
            isp_company_id,
            created_at,
            updated_at
          )
        `)
        .order('created_at', { ascending: false });

      if (error) {
        console.error('Error fetching clients:', error);
        throw error;
      }

      // Transform database format to Client type
      return (data || []).map((dbClient): Client => ({
        // Database fields
        id: dbClient.id,
        name: dbClient.name,
        email: dbClient.email,
        phone: dbClient.phone,
        address: dbClient.address,
        county: dbClient.county,
        sub_county: dbClient.sub_county,
        id_number: dbClient.id_number,
        kra_pin_number: dbClient.kra_pin_number,
        mpesa_number: dbClient.mpesa_number,
        client_type: dbClient.client_type,
        connection_type: dbClient.connection_type,
        monthly_rate: dbClient.monthly_rate,
        status: dbClient.status,
        service_package_id: dbClient.service_package_id,
        latitude: dbClient.latitude,
        longitude: dbClient.longitude,
        isp_company_id: dbClient.isp_company_id,
        created_at: dbClient.created_at,
        updated_at: dbClient.updated_at,
        balance: dbClient.balance || 0,
        wallet_balance: dbClient.wallet_balance || 0,
        subscription_start_date: dbClient.subscription_start_date,
        subscription_end_date: dbClient.subscription_end_date,
        subscription_type: dbClient.subscription_type,
        is_active: dbClient.is_active,
        submitted_by: dbClient.submitted_by,
        approved_by: dbClient.approved_by,
        approved_at: dbClient.approved_at,
        installation_status: dbClient.installation_status,
        installation_completed_by: dbClient.installation_completed_by,
        installation_completed_at: dbClient.installation_completed_at,
        service_activated_at: dbClient.service_activated_at,
        installation_date: dbClient.installation_date,

        // Legacy camelCase properties for backwards compatibility
        clientType: dbClient.client_type,
        connectionType: dbClient.connection_type,
        monthlyRate: dbClient.monthly_rate,
        installationDate: dbClient.installation_date || new Date().toISOString(),
        idNumber: dbClient.id_number,
        kraPinNumber: dbClient.kra_pin_number,
        mpesaNumber: dbClient.mpesa_number,

        // Nested objects
        location: {
          address: dbClient.address,
          county: dbClient.county,
          subCounty: dbClient.sub_county,
          coordinates: dbClient.latitude && dbClient.longitude ? {
            lat: Number(dbClient.latitude),
            lng: Number(dbClient.longitude),
          } : undefined,
        },

        service_packages: dbClient.service_packages,
        servicePackage: dbClient.service_packages?.name || 'Standard',
      }));
    },
  });

  return {
    clients,
    isLoading,
    error,
    refetch,
  };
};
