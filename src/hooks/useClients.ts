
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/hooks/use-toast';

export interface DatabaseClient {
  id: string;
  name: string;
  email: string | null;
  phone: string;
  id_number: string;
  mpesa_number: string | null;
  client_type: 'individual' | 'business' | 'corporate' | 'government';
  status: 'active' | 'suspended' | 'disconnected' | 'pending';
  connection_type: 'fiber' | 'wireless' | 'satellite' | 'dsl';
  monthly_rate: number;
  installation_date: string | null;
  address: string;
  county: string;
  sub_county: string;
  balance: number;
  wallet_balance: number;
  subscription_start_date: string | null;
  subscription_end_date: string | null;
  subscription_type: string;
  is_active: boolean;
  service_package_id: string | null;
  isp_company_id: string;
  created_at: string;
  updated_at: string;
  latitude: number | null;
  longitude: number | null;
  kra_pin_number: string | null;
  service_packages?: {
    name: string;
    speed: string;
    monthly_rate: number;
  };
}

// Legacy Client interface for backwards compatibility
export interface Client {
  id: string;
  name: string;
  email: string;
  phone: string;
  mpesaNumber?: string;
  idNumber: string;
  kraPinNumber?: string;
  clientType: 'individual' | 'business' | 'corporate' | 'government';
  status: 'active' | 'suspended' | 'disconnected' | 'pending';
  connectionType: 'fiber' | 'wireless' | 'satellite' | 'dsl';
  servicePackage: string;
  monthlyRate: number;
  installationDate: string;
  location: {
    address: string;
    county: string;
    subCounty: string;
    coordinates?: {
      lat: number;
      lng: number;
    };
  };
  equipment?: {
    router?: string;
    modem?: string;
    serialNumbers: string[];
  };
  balance: number;
  lastPayment?: {
    date: string;
    amount: number;
    method: 'mpesa' | 'bank' | 'cash';
  };
  payments?: any[];
  invoices?: any[];
  supportTickets?: any[];
}

export const useClients = () => {
  const { profile } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();

  // Real-time subscription to clients table changes
  useQuery({
    queryKey: ['clients-realtime', profile?.isp_company_id],
    queryFn: async () => {
      if (!profile?.isp_company_id) return null;
      
      // Set up real-time subscription
      const channel = supabase
        .channel('clients-changes')
        .on(
          'postgres_changes',
          {
            event: '*',
            schema: 'public',
            table: 'clients',
            filter: `isp_company_id=eq.${profile.isp_company_id}`
          },
          () => {
            // Invalidate clients query when changes occur
            queryClient.invalidateQueries({ queryKey: ['clients'] });
            console.log('Clients data updated - refreshing...');
          }
        )
        .subscribe();

      return () => {
        supabase.removeChannel(channel);
      };
    },
    enabled: !!profile?.isp_company_id,
  });

  const { data: clients = [], isLoading, error } = useQuery({
    queryKey: ['clients', profile?.isp_company_id],
    queryFn: async () => {
      if (!profile?.isp_company_id) return [];

      const { data, error } = await supabase
        .from('clients')
        .select(`
          *,
          service_packages (
            name,
            speed,
            monthly_rate
          )
        `)
        .eq('isp_company_id', profile.isp_company_id)
        .order('created_at', { ascending: false });

      if (error) {
        console.error('Error fetching clients:', error);
        throw error;
      }

      return data as DatabaseClient[];
    },
    enabled: !!profile?.isp_company_id,
    refetchInterval: 30000, // Refetch every 30 seconds for real-time updates
  });

  const updateClientMutation = useMutation({
    mutationFn: async ({ id, updates }: { id: string; updates: Partial<Omit<DatabaseClient, 'id' | 'created_at' | 'updated_at' | 'service_packages'>> }) => {
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
        title: "Client Updated",
        description: "Client information has been updated successfully.",
      });
    },
    onError: (error) => {
      console.error('Error updating client:', error);
      toast({
        title: "Error",
        description: "Failed to update client. Please try again.",
        variant: "destructive",
      });
    },
  });

  const createClientMutation = useMutation({
    mutationFn: async (clientData: Omit<DatabaseClient, 'id' | 'created_at' | 'updated_at' | 'isp_company_id' | 'service_packages'>) => {
      if (!profile?.isp_company_id) {
        throw new Error('No ISP company associated with user');
      }

      const { data, error } = await supabase
        .from('clients')
        .insert({
          ...clientData,
          isp_company_id: profile.isp_company_id,
        })
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['clients'] });
      toast({
        title: "Client Created",
        description: "New client has been added successfully.",
      });
    },
    onError: (error) => {
      console.error('Error creating client:', error);
      toast({
        title: "Error",
        description: "Failed to create client. Please try again.",
        variant: "destructive",
      });
    },
  });

  const deleteClientMutation = useMutation({
    mutationFn: async (clientId: string) => {
      const { error } = await supabase
        .from('clients')
        .delete()
        .eq('id', clientId);

      if (error) throw error;
      return clientId;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['clients'] });
      toast({
        title: "Client Deleted",
        description: "Client has been deleted successfully.",
      });
    },
    onError: (error) => {
      console.error('Error deleting client:', error);
      toast({
        title: "Error",
        description: "Failed to delete client. Please try again.",
        variant: "destructive",
      });
    },
  });

  // Helper functions for client statistics
  const getClientStats = () => {
    const totalClients = clients.length;
    const activeClients = clients.filter(c => c.status === 'active').length;
    const suspendedClients = clients.filter(c => c.status === 'suspended').length;
    const pendingClients = clients.filter(c => c.status === 'pending').length;
    const totalRevenue = clients.reduce((sum, c) => sum + (c.wallet_balance || 0), 0);

    return {
      totalClients,
      activeClients,
      suspendedClients,
      pendingClients,
      totalRevenue
    };
  };

  return {
    clients,
    isLoading,
    error,
    updateClient: updateClientMutation.mutate,
    createClient: createClientMutation.mutate,
    deleteClient: deleteClientMutation.mutate,
    isUpdating: updateClientMutation.isPending,
    isCreating: createClientMutation.isPending,
    isDeleting: deleteClientMutation.isPending,
    getClientStats,
  };
};
