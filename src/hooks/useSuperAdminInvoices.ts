
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';

export interface SuperAdminInvoice {
  id: string;
  invoice_number: string;
  registration_request_id?: string;
  company_name: string;
  contact_email: string;
  amount: number;
  vat_amount: number;
  total_amount: number;
  currency: string;
  status: string;
  due_date: string;
  payment_date?: string;
  payment_method?: string;
  payment_reference?: string;
  notes?: string;
  created_at: string;
  updated_at: string;
  created_by?: string;
}

export const useSuperAdminInvoices = () => {
  return useQuery({
    queryKey: ['super-admin-invoices'],
    queryFn: async (): Promise<SuperAdminInvoice[]> => {
      const { data, error } = await supabase
        .from('super_admin_invoices')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) {
        console.error('Error fetching super admin invoices:', error);
        throw error;
      }

      return data || [];
    },
  });
};
