
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/hooks/use-toast';
import {
  clientsApi,
  servicePackagesApi,
  equipmentApi,
  invoicesApi,
  paymentsApi,
  supportTicketsApi,
  baseStationsApi,
} from '@/services/apiService';

// Clients hooks
export const useClients = () => {
  const { profile } = useAuth();
  
  return useQuery({
    queryKey: ['clients', profile?.isp_company_id],
    queryFn: () => clientsApi.getAll(profile?.isp_company_id || ''),
    enabled: !!profile?.isp_company_id,
  });
};

export const useClientMutations = () => {
  const { profile } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const createClient = useMutation({
    mutationFn: clientsApi.create,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['clients'] });
      toast({ title: "Client created successfully" });
    },
    onError: (error: any) => {
      toast({
        title: "Error creating client",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const updateClient = useMutation({
    mutationFn: ({ id, updates }: { id: string; updates: any }) =>
      clientsApi.update(id, updates),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['clients'] });
      toast({ title: "Client updated successfully" });
    },
    onError: (error: any) => {
      toast({
        title: "Error updating client",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  return { createClient, updateClient };
};

// Service Packages hooks
export const useServicePackagesQuery = () => {
  const { profile } = useAuth();
  
  return useQuery({
    queryKey: ['service-packages', profile?.isp_company_id],
    queryFn: () => servicePackagesApi.getAll(profile?.isp_company_id || ''),
    enabled: !!profile?.isp_company_id,
  });
};

// Equipment hooks
export const useEquipment = () => {
  const { profile } = useAuth();
  
  return useQuery({
    queryKey: ['equipment', profile?.isp_company_id],
    queryFn: () => equipmentApi.getAll(profile?.isp_company_id || ''),
    enabled: !!profile?.isp_company_id,
  });
};

// Invoices hooks
export const useInvoices = () => {
  const { profile } = useAuth();
  
  return useQuery({
    queryKey: ['invoices', profile?.isp_company_id],
    queryFn: () => invoicesApi.getAll(profile?.isp_company_id || ''),
    enabled: !!profile?.isp_company_id,
  });
};

export const useInvoiceMutations = () => {
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const createInvoice = useMutation({
    mutationFn: invoicesApi.create,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['invoices'] });
      toast({ title: "Invoice created successfully" });
    },
    onError: (error: any) => {
      toast({
        title: "Error creating invoice",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  return { createInvoice };
};

// Payments hooks
export const usePayments = () => {
  const { profile } = useAuth();
  
  return useQuery({
    queryKey: ['payments', profile?.isp_company_id],
    queryFn: () => paymentsApi.getAll(profile?.isp_company_id || ''),
    enabled: !!profile?.isp_company_id,
  });
};

// Support Tickets hooks
export const useSupportTickets = () => {
  const { profile } = useAuth();
  
  return useQuery({
    queryKey: ['support-tickets', profile?.isp_company_id],
    queryFn: () => supportTicketsApi.getAll(profile?.isp_company_id || ''),
    enabled: !!profile?.isp_company_id,
  });
};

export const useTicketMutations = () => {
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const createTicket = useMutation({
    mutationFn: supportTicketsApi.create,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['support-tickets'] });
      toast({ title: "Support ticket created successfully" });
    },
    onError: (error: any) => {
      toast({
        title: "Error creating ticket",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const updateTicket = useMutation({
    mutationFn: ({ id, updates }: { id: string; updates: any }) =>
      supportTicketsApi.update(id, updates),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['support-tickets'] });
      toast({ title: "Ticket updated successfully" });
    },
    onError: (error: any) => {
      toast({
        title: "Error updating ticket",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  return { createTicket, updateTicket };
};

// Base Stations hooks
export const useBaseStations = () => {
  const { profile } = useAuth();
  
  return useQuery({
    queryKey: ['base-stations', profile?.isp_company_id],
    queryFn: () => baseStationsApi.getAll(profile?.isp_company_id || ''),
    enabled: !!profile?.isp_company_id,
  });
};
