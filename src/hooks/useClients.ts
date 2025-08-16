
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

export interface DatabaseClient {
  id: string;
  created_at: string;
  updated_at: string;
  name: string;
  email: string;
  phone: string;
  address: string;
  county: string;
  sub_county: string;
  id_number: string;
  mpesa_number: string;
  status: string;
  notes: string | null;
  isp_company_id: string;
  service_package_id: string | null;
  rejection_reason: string | null;
  approved_at: string | null;
  approved_by: string | null;
  rejected_at: string | null;
  rejected_by: string | null;
  submitted_by: string | null;
  client_type: string;
  connection_type: string;
  monthly_rate: number;
  installation_status: string;
  installation_date: string | null;
  installation_completed_at: string | null;
  installation_completed_by: string | null;
  service_activated_at: string | null;
  latitude: number | null;
  longitude: number | null;
  balance: number;
  wallet_balance: number;
  subscription_start_date: string | null;
  subscription_end_date: string | null;
  subscription_type: string;
  kra_pin_number: string | null;
  is_active: boolean;
}

const fetchClients = async (): Promise<DatabaseClient[]> => {
  const { data, error } = await supabase
    .from('clients')
    .select('*')
    .order('created_at', { ascending: false });

  if (error) {
    console.error('Error fetching clients:', error);
    throw error;
  }

  return data || [];
};

export const useClients = () => {
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const {
    data: clients = [],
    isLoading,
    error,
    refetch,
  } = useQuery({
    queryKey: ['clients'],
    queryFn: fetchClients,
  });

  const createClientMutation = useMutation({
    mutationFn: async (clientData: Omit<DatabaseClient, 'id' | 'created_at' | 'updated_at'>): Promise<DatabaseClient> => {
      console.log('Creating client with data:', clientData);
      
      const { data, error } = await supabase
        .from('clients')
        .insert([clientData])
        .select()
        .single();

      if (error) {
        console.error('Error creating client:', error);
        throw error;
      }

      console.log('Client created successfully:', data);
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['clients'] });
      toast({
        title: "Success",
        description: "Client created successfully",
      });
    },
    onError: (error: Error) => {
      console.error('Error creating client:', error);
      toast({
        title: "Error",
        description: error.message || "Failed to create client",
        variant: "destructive",
      });
    },
  });

  const updateClientMutation = useMutation({
    mutationFn: async ({ id, updates }: { id: string; updates: Partial<DatabaseClient> }): Promise<DatabaseClient> => {
      console.log('Updating client:', id, 'with updates:', updates);
      
      const { data, error } = await supabase
        .from('clients')
        .update(updates)
        .eq('id', id)
        .select()
        .single();

      if (error) {
        console.error('Error updating client:', error);
        throw error;
      }

      console.log('Client updated successfully:', data);
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['clients'] });
      toast({
        title: "Success",
        description: "Client updated successfully",
      });
    },
    onError: (error: Error) => {
      console.error('Error updating client:', error);
      toast({
        title: "Error",
        description: error.message || "Failed to update client",
        variant: "destructive",
      });
    },
  });

  const deleteClientMutation = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase
        .from('clients')
        .delete()
        .eq('id', id);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['clients'] });
      toast({
        title: "Success",
        description: "Client deleted successfully",
      });
    },
    onError: (error: Error) => {
      toast({
        title: "Error",
        description: error.message || "Failed to delete client",
        variant: "destructive",
      });
    },
  });

  return {
    clients,
    isLoading,
    error,
    refetch,
    createClient: createClientMutation.mutateAsync,
    updateClient: updateClientMutation.mutateAsync,
    deleteClient: deleteClientMutation.mutateAsync,
    isCreating: createClientMutation.isPending,
    isUpdating: updateClientMutation.isPending,
    isDeleting: deleteClientMutation.isPending,
  };
};
