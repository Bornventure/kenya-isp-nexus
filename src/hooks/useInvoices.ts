
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/hooks/use-toast';

export interface Invoice {
  id: string;
  invoice_number: string;
  client_id?: string;
  amount: number;
  vat_amount: number;
  total_amount: number;
  status: string;
  due_date: string;
  service_period_start: string;
  service_period_end: string;
  notes?: string;
  isp_company_id?: string;
  created_at: string;
  updated_at: string;
  clients?: {
    id: string;
    name: string;
    email?: string;
    phone: string;
  };
}

export type CreateInvoiceData = Omit<Invoice, 'id' | 'invoice_number' | 'created_at' | 'updated_at' | 'isp_company_id' | 'clients'>;

export const useInvoices = () => {
  const { profile } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const { data: invoices = [], isLoading, error, refetch } = useQuery({
    queryKey: ['invoices', profile?.isp_company_id],
    queryFn: async () => {
      if (!profile?.isp_company_id) return [];

      console.log('Fetching invoices for company:', profile.isp_company_id);

      const { data, error } = await supabase
        .from('invoices')
        .select(`
          *,
          clients (
            id,
            name,
            email,
            phone
          )
        `)
        .eq('isp_company_id', profile.isp_company_id)
        .order('created_at', { ascending: false });

      if (error) {
        console.error('Error fetching invoices:', error);
        throw error;
      }

      console.log(`Fetched ${data?.length || 0} invoices for company ${profile.isp_company_id}`);
      return (data || []) as Invoice[];
    },
    enabled: !!profile?.isp_company_id,
  });

  const createInvoice = useMutation({
    mutationFn: async (invoiceData: CreateInvoiceData) => {
      if (!profile?.isp_company_id) {
        throw new Error('No ISP company associated with user');
      }

      // Generate invoice number
      const invoiceNumber = `INV-${Date.now()}`;

      const { data, error } = await supabase
        .from('invoices')
        .insert({
          ...invoiceData,
          invoice_number: invoiceNumber,
          isp_company_id: profile.isp_company_id,
        })
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['invoices'] });
      toast({
        title: "Invoice Created",
        description: "Invoice has been created successfully.",
      });
    },
    onError: (error: any) => {
      console.error('Error creating invoice:', error);
      toast({
        title: "Error",
        description: error.message || "Failed to create invoice. Please try again.",
        variant: "destructive",
      });
    },
  });

  const updateInvoice = useMutation({
    mutationFn: async ({ id, updates }: { id: string; updates: Partial<Invoice> }) => {
      const { data, error } = await supabase
        .from('invoices')
        .update({ ...updates, updated_at: new Date().toISOString() })
        .eq('id', id)
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['invoices'] });
      toast({
        title: "Invoice Updated",
        description: "Invoice has been updated successfully.",
      });
    },
    onError: (error: any) => {
      console.error('Error updating invoice:', error);
      toast({
        title: "Error",
        description: "Failed to update invoice. Please try again.",
        variant: "destructive",
      });
    },
  });

  const deleteInvoice = useMutation({
    mutationFn: async (invoiceId: string) => {
      const { error } = await supabase
        .from('invoices')
        .delete()
        .eq('id', invoiceId);

      if (error) throw error;
      return invoiceId;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['invoices'] });
      toast({
        title: "Invoice Deleted",
        description: "Invoice has been deleted successfully.",
      });
    },
    onError: (error: any) => {
      console.error('Error deleting invoice:', error);
      toast({
        title: "Error",
        description: "Failed to delete invoice. Please try again.",
        variant: "destructive",
      });
    },
  });

  return {
    invoices,
    isLoading,
    error,
    refetch,
    createInvoice: createInvoice.mutate,
    updateInvoice: updateInvoice.mutate,
    deleteInvoice: deleteInvoice.mutate,
    isCreating: createInvoice.isPending,
    isUpdating: updateInvoice.isPending,
    isDeleting: deleteInvoice.isPending,
  };
};
