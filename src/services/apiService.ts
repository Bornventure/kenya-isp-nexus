
import { supabase } from '@/integrations/supabase/client';
import type { Database } from '@/integrations/supabase/types';

// Type definitions for our API responses
export type ApiResponse<T> = {
  data: T | null;
  error: string | null;
  success: boolean;
};

// Base service class with common functionality
class BaseApiService {
  protected async handleQuery<T>(queryPromise: Promise<any>): Promise<ApiResponse<T>> {
    try {
      const { data, error } = await queryPromise;
      
      if (error) {
        console.error('Database error:', error);
        return {
          data: null,
          error: error.message,
          success: false,
        };
      }

      return {
        data,
        error: null,
        success: true,
      };
    } catch (error) {
      console.error('Unexpected error:', error);
      return {
        data: null,
        error: error instanceof Error ? error.message : 'Unknown error occurred',
        success: false,
      };
    }
  }
}

// Clients API Service
export class ClientsApiService extends BaseApiService {
  async getAll(ispCompanyId: string) {
    return this.handleQuery(
      supabase
        .from('clients')
        .select(`
          *,
          service_packages (
            id,
            name,
            speed,
            monthly_rate
          )
        `)
        .eq('isp_company_id', ispCompanyId)
        .order('created_at', { ascending: false })
    );
  }

  async getById(id: string) {
    return this.handleQuery(
      supabase
        .from('clients')
        .select(`
          *,
          service_packages (
            id,
            name,
            speed,
            monthly_rate
          )
        `)
        .eq('id', id)
        .single()
    );
  }

  async create(clientData: Database['public']['Tables']['clients']['Insert']) {
    return this.handleQuery(
      supabase
        .from('clients')
        .insert(clientData)
        .select()
        .single()
    );
  }

  async update(id: string, updates: Database['public']['Tables']['clients']['Update']) {
    return this.handleQuery(
      supabase
        .from('clients')
        .update(updates)
        .eq('id', id)
        .select()
        .single()
    );
  }

  async delete(id: string) {
    return this.handleQuery(
      supabase
        .from('clients')
        .delete()
        .eq('id', id)
    );
  }
}

// Service Packages API Service
export class ServicePackagesApiService extends BaseApiService {
  async getAll(ispCompanyId: string) {
    return this.handleQuery(
      supabase
        .from('service_packages')
        .select('*')
        .eq('isp_company_id', ispCompanyId)
        .eq('is_active', true)
        .order('monthly_rate', { ascending: true })
    );
  }

  async create(packageData: Database['public']['Tables']['service_packages']['Insert']) {
    return this.handleQuery(
      supabase
        .from('service_packages')
        .insert(packageData)
        .select()
        .single()
    );
  }

  async update(id: string, updates: Database['public']['Tables']['service_packages']['Update']) {
    return this.handleQuery(
      supabase
        .from('service_packages')
        .update(updates)
        .eq('id', id)
        .select()
        .single()
    );
  }
}

// Equipment API Service
export class EquipmentApiService extends BaseApiService {
  async getAll(ispCompanyId: string) {
    return this.handleQuery(
      supabase
        .from('equipment')
        .select(`
          *,
          clients (
            id,
            name,
            phone
          )
        `)
        .eq('isp_company_id', ispCompanyId)
        .order('created_at', { ascending: false })
    );
  }

  async create(equipmentData: Database['public']['Tables']['equipment']['Insert']) {
    return this.handleQuery(
      supabase
        .from('equipment')
        .insert(equipmentData)
        .select()
        .single()
    );
  }

  async update(id: string, updates: Database['public']['Tables']['equipment']['Update']) {
    return this.handleQuery(
      supabase
        .from('equipment')
        .update(updates)
        .eq('id', id)
        .select()
        .single()
    );
  }
}

// Invoices API Service
export class InvoicesApiService extends BaseApiService {
  async getAll(ispCompanyId: string) {
    return this.handleQuery(
      supabase
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
        .eq('isp_company_id', ispCompanyId)
        .order('created_at', { ascending: false })
    );
  }

  async create(invoiceData: Database['public']['Tables']['invoices']['Insert']) {
    return this.handleQuery(
      supabase
        .from('invoices')
        .insert(invoiceData)
        .select()
        .single()
    );
  }

  async update(id: string, updates: Database['public']['Tables']['invoices']['Update']) {
    return this.handleQuery(
      supabase
        .from('invoices')
        .update(updates)
        .eq('id', id)
        .select()
        .single()
    );
  }
}

// Payments API Service
export class PaymentsApiService extends BaseApiService {
  async getAll(ispCompanyId: string) {
    return this.handleQuery(
      supabase
        .from('payments')
        .select(`
          *,
          clients (
            id,
            name,
            phone
          ),
          invoices (
            id,
            invoice_number,
            amount
          )
        `)
        .eq('isp_company_id', ispCompanyId)
        .order('created_at', { ascending: false })
    );
  }

  async create(paymentData: Database['public']['Tables']['payments']['Insert']) {
    return this.handleQuery(
      supabase
        .from('payments')
        .insert(paymentData)
        .select()
        .single()
    );
  }
}

// Support Tickets API Service
export class SupportTicketsApiService extends BaseApiService {
  async getAll(ispCompanyId: string) {
    return this.handleQuery(
      supabase
        .from('support_tickets')
        .select(`
          *,
          clients (
            id,
            name,
            phone
          ),
          created_by_profile:profiles!support_tickets_created_by_fkey (
            id,
            first_name,
            last_name
          ),
          assigned_to_profile:profiles!support_tickets_assigned_to_fkey (
            id,
            first_name,
            last_name
          )
        `)
        .eq('isp_company_id', ispCompanyId)
        .order('created_at', { ascending: false })
    );
  }

  async create(ticketData: Database['public']['Tables']['support_tickets']['Insert']) {
    return this.handleQuery(
      supabase
        .from('support_tickets')
        .insert(ticketData)
        .select()
        .single()
    );
  }

  async update(id: string, updates: Database['public']['Tables']['support_tickets']['Update']) {
    return this.handleQuery(
      supabase
        .from('support_tickets')
        .update(updates)
        .eq('id', id)
        .select()
        .single()
    );
  }
}

// Base Stations API Service
export class BaseStationsApiService extends BaseApiService {
  async getAll(ispCompanyId: string) {
    return this.handleQuery(
      supabase
        .from('base_stations')
        .select('*')
        .eq('isp_company_id', ispCompanyId)
        .order('created_at', { ascending: false })
    );
  }

  async create(stationData: Database['public']['Tables']['base_stations']['Insert']) {
    return this.handleQuery(
      supabase
        .from('base_stations')
        .insert(stationData)
        .select()
        .single()
    );
  }

  async update(id: string, updates: Database['public']['Tables']['base_stations']['Update']) {
    return this.handleQuery(
      supabase
        .from('base_stations')
        .update(updates)
        .eq('id', id)
        .select()
        .single()
    );
  }
}

// Export service instances
export const clientsApi = new ClientsApiService();
export const servicePackagesApi = new ServicePackagesApiService();
export const equipmentApi = new EquipmentApiService();
export const invoicesApi = new InvoicesApiService();
export const paymentsApi = new PaymentsApiService();
export const supportTicketsApi = new SupportTicketsApiService();
export const baseStationsApi = new BaseStationsApiService();
