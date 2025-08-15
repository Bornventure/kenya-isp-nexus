
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Client } from '@/types/client';
import { useToast } from '@/hooks/use-toast';

export interface DatabaseClient {
  id: string;
  name: string;
  email?: string;
  phone: string;
  address: string;
  county: string;
  sub_county: string;
  id_number: string;
  kra_pin_number?: string;
  mpesa_number?: string;
  client_type: 'individual' | 'business' | 'corporate' | 'government';
  connection_type: 'fiber' | 'wireless' | 'satellite' | 'dsl';
  monthly_rate: number;
  status: 'pending' | 'approved' | 'active' | 'suspended' | 'disconnected';
  service_package_id?: string;
  latitude?: number;
  longitude?: number;
  isp_company_id: string;
  created_at: string;
  updated_at: string;
  balance?: number;
  wallet_balance?: number;
  subscription_start_date?: string;
  subscription_end_date?: string;
  subscription_type?: string;
  is_active?: boolean;
  submitted_by?: string;
  approved_by?: string;
  approved_at?: string;
  installation_status?: string;
  installation_completed_by?: string;
  installation_completed_at?: string;
  service_activated_at?: string;
  installation_date?: string;
  notes?: string;
  rejection_reason?: string;
  rejected_by?: string;
  rejected_at?: string;
}

export const useClients = () => {
  const { toast } = useToast();
  const queryClient = useQueryClient();

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

        service_packages: dbClient.service_packages || {
          id: '',
          name: 'Standard',
          speed: '10Mbps',
          monthly_rate: 2500,
          description: 'Standard package',
          is_active: true,
          isp_company_id: dbClient.isp_company_id,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        },
        servicePackage: dbClient.service_packages?.name || 'Standard',
      }));
    },
  });

  const createClient = useMutation({
    mutationFn: async (clientData: Partial<DatabaseClient>) => {
      const { data, error } = await supabase
        .from('clients')
        .insert(clientData)
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['clients'] });
      toast({
        title: "Success",
        description: "Client created successfully",
      });
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: "Failed to create client",
        variant: "destructive",
      });
      console.error('Error creating client:', error);
    },
  });

  const updateClient = useMutation({
    mutationFn: async ({ id, updates }: { id: string; updates: Partial<Omit<DatabaseClient, 'id' | 'created_at' | 'updated_at'>> }) => {
      const { data, error } = await supabase
        .from('clients')
        .update(updates)
        .eq('id', id)
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['clients'] });
      toast({
        title: "Success",
        description: "Client updated successfully",
      });
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: "Failed to update client",
        variant: "destructive",
      });
      console.error('Error updating client:', error);
    },
  });

  return {
    clients,
    isLoading,
    error,
    refetch,
    createClient: createClient.mutate,
    updateClient: updateClient.mutate,
    isCreating: createClient.isPending,
    isUpdating: updateClient.isPending,
  };
};
