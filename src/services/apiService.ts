
import { supabase } from '@/integrations/supabase/client';
import type { Database } from '@/integrations/supabase/types';

export interface ApiResponse<T> {
  data: T | null;
  error: string | null;
  success: boolean;
}

// Base Stations API
class BaseStationsApi {
  async getAll(ispCompanyId: string): Promise<ApiResponse<Database['public']['Tables']['base_stations']['Row'][]>> {
    try {
      const { data, error } = await supabase
        .from('base_stations')
        .select('*')
        .eq('isp_company_id', ispCompanyId);

      if (error) throw error;

      return {
        data: data || [],
        error: null,
        success: true,
      };
    } catch (error) {
      console.error('Error fetching base stations:', error);
      return {
        data: null,
        error: error instanceof Error ? error.message : 'Unknown error occurred',
        success: false,
      };
    }
  }

  async create(baseStationData: Database['public']['Tables']['base_stations']['Insert']): Promise<ApiResponse<Database['public']['Tables']['base_stations']['Row']>> {
    try {
      const { data, error } = await supabase
        .from('base_stations')
        .insert(baseStationData)
        .select()
        .single();

      if (error) throw error;

      return {
        data,
        error: null,
        success: true,
      };
    } catch (error) {
      console.error('Error creating base station:', error);
      return {
        data: null,
        error: error instanceof Error ? error.message : 'Unknown error occurred',
        success: false,
      };
    }
  }

  async update(id: string, updates: Database['public']['Tables']['base_stations']['Update']): Promise<ApiResponse<Database['public']['Tables']['base_stations']['Row']>> {
    try {
      const { data, error } = await supabase
        .from('base_stations')
        .update(updates)
        .eq('id', id)
        .select()
        .single();

      if (error) throw error;

      return {
        data,
        error: null,
        success: true,
      };
    } catch (error) {
      console.error('Error updating base station:', error);
      return {
        data: null,
        error: error instanceof Error ? error.message : 'Unknown error occurred',
        success: false,
      };
    }
  }
}

// Clients API
class ClientsApi {
  async getAll(ispCompanyId: string): Promise<ApiResponse<any[]>> {
    try {
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
        .eq('isp_company_id', ispCompanyId);

      if (error) throw error;

      return {
        data: data || [],
        error: null,
        success: true,
      };
    } catch (error) {
      console.error('Error fetching clients:', error);
      return {
        data: null,
        error: error instanceof Error ? error.message : 'Unknown error occurred',
        success: false,
      };
    }
  }

  async create(clientData: Database['public']['Tables']['clients']['Insert']): Promise<ApiResponse<Database['public']['Tables']['clients']['Row']>> {
    try {
      const { data, error } = await supabase
        .from('clients')
        .insert(clientData)
        .select()
        .single();

      if (error) throw error;

      return {
        data,
        error: null,
        success: true,
      };
    } catch (error) {
      console.error('Error creating client:', error);
      return {
        data: null,
        error: error instanceof Error ? error.message : 'Unknown error occurred',
        success: false,
      };
    }
  }

  async update(id: string, updates: Database['public']['Tables']['clients']['Update']): Promise<ApiResponse<Database['public']['Tables']['clients']['Row']>> {
    try {
      const { data, error } = await supabase
        .from('clients')
        .update(updates)
        .eq('id', id)
        .select()
        .single();

      if (error) throw error;

      return {
        data,
        error: null,
        success: true,
      };
    } catch (error) {
      console.error('Error updating client:', error);
      return {
        data: null,
        error: error instanceof Error ? error.message : 'Unknown error occurred',
        success: false,
      };
    }
  }
}

// Service Packages API
class ServicePackagesApi {
  async getAll(ispCompanyId: string): Promise<ApiResponse<Database['public']['Tables']['service_packages']['Row'][]>> {
    try {
      const { data, error } = await supabase
        .from('service_packages')
        .select('*')
        .eq('isp_company_id', ispCompanyId)
        .eq('is_active', true);

      if (error) throw error;

      return {
        data: data || [],
        error: null,
        success: true,
      };
    } catch (error) {
      console.error('Error fetching service packages:', error);
      return {
        data: null,
        error: error instanceof Error ? error.message : 'Unknown error occurred',
        success: false,
      };
    }
  }

  async create(packageData: Database['public']['Tables']['service_packages']['Insert']): Promise<ApiResponse<Database['public']['Tables']['service_packages']['Row']>> {
    try {
      const { data, error } = await supabase
        .from('service_packages')
        .insert(packageData)
        .select()
        .single();

      if (error) throw error;

      return {
        data,
        error: null,
        success: true,
      };
    } catch (error) {
      console.error('Error creating service package:', error);
      return {
        data: null,
        error: error instanceof Error ? error.message : 'Unknown error occurred',
        success: false,
      };
    }
  }
}

// Equipment API
class EquipmentApi {
  async getAll(ispCompanyId: string): Promise<ApiResponse<Database['public']['Tables']['equipment']['Row'][]>> {
    try {
      const { data, error } = await supabase
        .from('equipment')
        .select('*')
        .eq('isp_company_id', ispCompanyId);

      if (error) throw error;

      return {
        data: data || [],
        error: null,
        success: true,
      };
    } catch (error) {
      console.error('Error fetching equipment:', error);
      return {
        data: null,
        error: error instanceof Error ? error.message : 'Unknown error occurred',
        success: false,
      };
    }
  }

  async create(equipmentData: Database['public']['Tables']['equipment']['Insert']): Promise<ApiResponse<Database['public']['Tables']['equipment']['Row']>> {
    try {
      const { data, error } = await supabase
        .from('equipment')
        .insert(equipmentData)
        .select()
        .single();

      if (error) throw error;

      return {
        data,
        error: null,
        success: true,
      };
    } catch (error) {
      console.error('Error creating equipment:', error);
      return {
        data: null,
        error: error instanceof Error ? error.message : 'Unknown error occurred',
        success: false,
      };
    }
  }
}

// Invoices API
class InvoicesApi {
  async getAll(ispCompanyId: string): Promise<ApiResponse<any[]>> {
    try {
      const { data, error } = await supabase
        .from('invoices')
        .select(`
          *,
          clients (
            name,
            email
          )
        `)
        .eq('isp_company_id', ispCompanyId);

      if (error) throw error;

      return {
        data: data || [],
        error: null,
        success: true,
      };
    } catch (error) {
      console.error('Error fetching invoices:', error);
      return {
        data: null,
        error: error instanceof Error ? error.message : 'Unknown error occurred',
        success: false,
      };
    }
  }

  async create(invoiceData: Database['public']['Tables']['invoices']['Insert']): Promise<ApiResponse<Database['public']['Tables']['invoices']['Row']>> {
    try {
      const { data, error } = await supabase
        .from('invoices')
        .insert(invoiceData)
        .select()
        .single();

      if (error) throw error;

      return {
        data,
        error: null,
        success: true,
      };
    } catch (error) {
      console.error('Error creating invoice:', error);
      return {
        data: null,
        error: error instanceof Error ? error.message : 'Unknown error occurred',
        success: false,
      };
    }
  }
}

// Payments API
class PaymentsApi {
  async getAll(ispCompanyId: string): Promise<ApiResponse<any[]>> {
    try {
      const { data, error } = await supabase
        .from('payments')
        .select(`
          *,
          clients (
            name,
            email
          )
        `)
        .eq('isp_company_id', ispCompanyId);

      if (error) throw error;

      return {
        data: data || [],
        error: null,
        success: true,
      };
    } catch (error) {
      console.error('Error fetching payments:', error);
      return {
        data: null,
        error: error instanceof Error ? error.message : 'Unknown error occurred',
        success: false,
      };
    }
  }

  async create(paymentData: Database['public']['Tables']['payments']['Insert']): Promise<ApiResponse<Database['public']['Tables']['payments']['Row']>> {
    try {
      const { data, error } = await supabase
        .from('payments')
        .insert(paymentData)
        .select()
        .single();

      if (error) throw error;

      return {
        data,
        error: null,
        success: true,
      };
    } catch (error) {
      console.error('Error creating payment:', error);
      return {
        data: null,
        error: error instanceof Error ? error.message : 'Unknown error occurred',
        success: false,
      };
    }
  }
}

// Support Tickets API
class SupportTicketsApi {
  async getAll(ispCompanyId: string): Promise<ApiResponse<any[]>> {
    try {
      const { data, error } = await supabase
        .from('support_tickets')
        .select(`
          *,
          clients (
            name,
            email
          )
        `)
        .eq('isp_company_id', ispCompanyId);

      if (error) throw error;

      return {
        data: data || [],
        error: null,
        success: true,
      };
    } catch (error) {
      console.error('Error fetching support tickets:', error);
      return {
        data: null,
        error: error instanceof Error ? error.message : 'Unknown error occurred',
        success: false,
      };
    }
  }

  async create(ticketData: Database['public']['Tables']['support_tickets']['Insert']): Promise<ApiResponse<Database['public']['Tables']['support_tickets']['Row']>> {
    try {
      const { data, error } = await supabase
        .from('support_tickets')
        .insert(ticketData)
        .select()
        .single();

      if (error) throw error;

      return {
        data,
        error: null,
        success: true,
      };
    } catch (error) {
      console.error('Error creating support ticket:', error);
      return {
        data: null,
        error: error instanceof Error ? error.message : 'Unknown error occurred',
        success: false,
      };
    }
  }

  async update(id: string, updates: Database['public']['Tables']['support_tickets']['Update']): Promise<ApiResponse<Database['public']['Tables']['support_tickets']['Row']>> {
    try {
      const { data, error } = await supabase
        .from('support_tickets')
        .update(updates)
        .eq('id', id)
        .select()
        .single();

      if (error) throw error;

      return {
        data,
        error: null,
        success: true,
      };
    } catch (error) {
      console.error('Error updating support ticket:', error);
      return {
        data: null,
        error: error instanceof Error ? error.message : 'Unknown error occurred',
        success: false,
      };
    }
  }
}

// Export API instances
export const baseStationsApi = new BaseStationsApi();
export const clientsApi = new ClientsApi();
export const servicePackagesApi = new ServicePackagesApi();
export const equipmentApi = new EquipmentApi();
export const invoicesApi = new InvoicesApi();
export const paymentsApi = new PaymentsApi();
export const supportTicketsApi = new SupportTicketsApi();
