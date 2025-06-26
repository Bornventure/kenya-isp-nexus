
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/hooks/use-toast';

export interface Invoice {
  id: string;
  invoice_number: string;
  client_id: string;
  amount: number;
  vat_amount: number;
  total_amount: number;
  status: 'draft' | 'pending' | 'paid' | 'overdue';
  due_date: string;
  service_period_start: string;
  service_period_end: string;
  notes: string | null;
  isp_company_id: string;
  created_at: string;
  updated_at: string;
  clients?: {
    name: string;
    email: string;
  };
}

export const useInvoices = () => {
  const { profile } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const { data: invoices = [], isLoading, error } = useQuery({
    queryKey: ['invoices', profile?.isp_company_id],
    queryFn: async () => {
      if (!profile?.isp_company_id) return [];

      const { data, error } = await supabase
        .from('invoices')
        .select(`
          *,
          clients (
            name,
            email
          )
        `)
        .eq('isp_company_id', profile.isp_company_id)
        .order('created_at', { ascending: false });

      if (error) {
        console.error('Error fetching invoices:', error);
        throw error;
      }

      return data as Invoice[];
    },
    enabled: !!profile?.isp_company_id,
  });

  const updateInvoiceMutation = useMutation({
    mutationFn: async ({ id, updates }: { id: string; updates: Partial<Invoice> }) => {
      const { data, error } = await supabase
        .from('invoices')
        .update(updates)
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
    onError: (error) => {
      console.error('Error updating invoice:', error);
      toast({
        title: "Error",
        description: "Failed to update invoice. Please try again.",
        variant: "destructive",
      });
    },
  });

  const createInvoiceMutation = useMutation({
    mutationFn: async (invoiceData: Omit<Invoice, 'id' | 'created_at' | 'updated_at'>) => {
      const { data, error } = await supabase
        .from('invoices')
        .insert({
          ...invoiceData,
          isp_company_id: profile?.isp_company_id,
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
    onError: (error) => {
      console.error('Error creating invoice:', error);
      toast({
        title: "Error",
        description: "Failed to create invoice. Please try again.",
        variant: "destructive",
      });
    },
  });

  return {
    invoices,
    isLoading,
    error,
    updateInvoice: updateInvoiceMutation.mutate,
    createInvoice: createInvoiceMutation.mutate,
    isUpdating: updateInvoiceMutation.isPending,
    isCreating: createInvoiceMutation.isPending,
  };
};
