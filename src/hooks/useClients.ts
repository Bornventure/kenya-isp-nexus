import { useState, useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/hooks/use-toast';

export interface DatabaseClient {
  id: string;
  name: string;
  email: string | null;
  phone: string;
  mpesa_number: string | null;
  id_number: string;
  kra_pin_number: string | null;
  client_type: 'individual' | 'business' | 'corporate' | 'government';
  status: 'active' | 'suspended' | 'disconnected' | 'pending';
  connection_type: 'fiber' | 'wireless' | 'satellite' | 'dsl';
  monthly_rate: number;
  installation_date: string | null;
  address: string;
  county: string;
  sub_county: string;
  latitude: number | null;
  longitude: number | null;
  balance: number;
  created_at: string;
  updated_at: string;
  service_packages?: {
    id: string;
    name: string;
    speed: string;
  };
}

export const useClients = () => {
  const { user, profile } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const { data: clients = [], isLoading, error } = useQuery({
    queryKey: ['clients', user?.id],
    queryFn: async () => {
      if (!user || !profile?.isp_company_id) return [];

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
        .eq('isp_company_id', profile.isp_company_id)
        .order('created_at', { ascending: false });

      if (error) {
        console.error('Error fetching clients:', error);
        throw error;
      }

      return data as DatabaseClient[];
    },
    enabled: !!user && !!profile?.isp_company_id,
  });

  const addClientMutation = useMutation({
    mutationFn: async (clientData: Omit<DatabaseClient, 'id' | 'created_at' | 'updated_at' | 'service_packages'>) => {
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
        title: "Client Added",
        description: "New client has been successfully added.",
      });
    },
    onError: (error) => {
      console.error('Error adding client:', error);
      toast({
        title: "Error",
        description: "Failed to add client. Please try again.",
        variant: "destructive",
      });
    },
  });

  const updateClientMutation = useMutation({
    mutationFn: async ({ id, updates }: { id: string; updates: Partial<DatabaseClient> }) => {
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
        description: "Client information has been updated.",
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
        description: "Client has been successfully deleted.",
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

  return {
    clients,
    isLoading,
    error,
    addClient: addClientMutation.mutate,
    updateClient: updateClientMutation.mutate,
    deleteClient: deleteClientMutation.mutate,
    isAddingClient: addClientMutation.isPending,
    isUpdatingClient: updateClientMutation.isPending,
    isDeletingClient: deleteClientMutation.isPending,
  };
};
