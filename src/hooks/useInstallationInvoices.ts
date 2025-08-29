
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/hooks/use-toast';

export interface InstallationInvoice {
  id: string;
  client_id: string;
  invoice_number: string;
  amount: number;
  vat_amount: number;
  total_amount: number;
  status: string;
  payment_method?: string;
  payment_reference?: string;
  paid_at?: string;
  created_at: string;
  updated_at: string;
  isp_company_id: string;
  equipment_details?: any;
  notes?: string;
  tracking_number?: string;
  manual_payment_details?: any;
  clients?: {
    name: string;
    email: string;
    phone: string;
    address: string;
  };
}

export const useInstallationInvoices = () => {
  const { profile } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const { data: invoices = [], isLoading, error } = useQuery({
    queryKey: ['installation-invoices', profile?.isp_company_id],
    queryFn: async () => {
      if (!profile?.isp_company_id) return [];

      const { data, error } = await supabase
        .from('installation_invoices')
        .select(`
          *,
          clients (
            name,
            email,
            phone,
            address
          )
        `)
        .eq('isp_company_id', profile.isp_company_id)
        .order('created_at', { ascending: false });

      if (error) {
        console.error('Error fetching installation invoices:', error);
        throw error;
      }

      return data as InstallationInvoice[];
    },
    enabled: !!profile?.isp_company_id,
  });

  const createInstallationInvoice = useMutation({
    mutationFn: async (invoiceData: {
      client_id: string;
      equipment_details: any;
      notes?: string;
    }) => {
      if (!profile?.isp_company_id) {
        throw new Error('No ISP company associated with user');
      }

      // Call the edge function to generate the installation invoice
      const { data, error } = await supabase.functions.invoke('generate-installation-invoice', {
        body: { client_id: invoiceData.client_id }
      });

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['installation-invoices'] });
      toast({
        title: "Installation Invoice Created",
        description: "Installation invoice has been generated and sent to client.",
      });
    },
    onError: (error) => {
      console.error('Error creating installation invoice:', error);
      toast({
        title: "Error",
        description: "Failed to create installation invoice. Please try again.",
        variant: "destructive",
      });
    },
  });

  const updateInstallationInvoice = useMutation({
    mutationFn: async ({ id, updates }: { id: string; updates: Partial<InstallationInvoice> }) => {
      const { data, error } = await supabase
        .from('installation_invoices')
        .update(updates)
        .eq('id', id)
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['installation-invoices'] });
      toast({
        title: "Installation Invoice Updated",
        description: "Installation invoice has been updated successfully.",
      });
    },
    onError: (error) => {
      console.error('Error updating installation invoice:', error);
      toast({
        title: "Error",
        description: "Failed to update installation invoice. Please try again.",
        variant: "destructive",
      });
    },
  });

  return {
    invoices,
    isLoading,
    error,
    createInstallationInvoice: createInstallationInvoice.mutate,
    updateInstallationInvoice: updateInstallationInvoice.mutate,
    isCreating: createInstallationInvoice.isPending,
    isUpdating: updateInstallationInvoice.isPending,
  };
};
