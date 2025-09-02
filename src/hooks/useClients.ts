
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/contexts/AuthContext';

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
  status: 'pending' | 'approved' | 'active' | 'suspended' | 'cancelled' | 'rejected' | 'disconnected';
  service_package_id?: string;
  monthly_rate: number;
  latitude?: number;
  longitude?: number;
  installation_date?: string;
  installation_status?: string;
  service_activated_at?: string;
  subscription_start_date?: string;
  subscription_end_date?: string;
  wallet_balance?: number;
  balance?: number;
  submitted_by?: string;
  rejected_at?: string;
  rejection_reason?: string;
  created_at: string;
  updated_at: string;
  isp_company_id: string;
  // Aliases for existing Client interface compatibility
  clientType: 'individual' | 'business' | 'corporate' | 'government';
  connectionType: 'fiber' | 'wireless' | 'satellite' | 'dsl';
  monthlyRate: number;
  idNumber: string;
  service_packages?: {
    id: string;
    name: string;
    speed: string;
    monthly_rate: number;
    setup_fee?: number;
    description?: string;
    is_active: boolean;
    isp_company_id: string;
    created_at: string;
    updated_at: string;
  };
}

export const useClients = () => {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const { profile } = useAuth();

  const { data: clients = [], isLoading, error } = useQuery({
    queryKey: ['clients'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('clients')
        .select(`
          *,
          service_packages (
            id,
            name,
            speed
          )
        `)
        .order('created_at', { ascending: false });

      if (error) throw error;
      // Transform data to include alias properties for compatibility
      return data?.map((client: any) => ({
        ...client,
        clientType: client.client_type,
        connectionType: client.connection_type,
        monthlyRate: client.monthly_rate,
        idNumber: client.id_number,
      })) as DatabaseClient[];
    },
  });

  const createClient = useMutation({
    mutationFn: async (clientData: any) => {
      const { data, error } = await supabase
        .from('clients')
        .insert({
          ...clientData,
          isp_company_id: profile?.isp_company_id || '',
          status: clientData.status || 'pending'
        })
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
        description: "Failed to create client: " + error.message,
        variant: "destructive",
      });
    },
  });

  const updateClient = useMutation({
    mutationFn: async ({ id, updates }: { id: string; updates: any }) => {
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
        description: "Failed to update client: " + error.message,
        variant: "destructive",
      });
    },
  });

  return {
    clients,
    isLoading,
    error,
    createClient: createClient.mutate,
    updateClient: updateClient.mutate,
    isCreating: createClient.isPending,
    isUpdating: updateClient.isPending,
  };
};
