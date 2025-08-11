
import { supabase } from '@/integrations/supabase/client';
import { radiusService } from '@/services/radiusService';
import { enhancedSnmpService } from '@/services/enhancedSnmpService';

export interface DeploymentResult {
  success: boolean;
  message: string;
  radiusUser?: any;
  invoice?: any;
  session?: any;
}

class ClientDeploymentService {
  async deployClientEquipment(clientId: string, equipmentId: string): Promise<DeploymentResult> {
    try {
      console.log(`Starting deployment for client ${clientId} with equipment ${equipmentId}`);

      // 1. Get client details
      const { data: client, error: clientError } = await supabase
        .from('clients')
        .select(`
          *,
          service_packages (
            name,
            speed,
            monthly_rate
          )
        `)
        .eq('id', clientId)
        .single();

      if (clientError || !client) {
        throw new Error('Client not found');
      }

      // 2. Get equipment details
      const { data: equipment, error: equipmentError } = await supabase
        .from('equipment')
        .select('*')
        .eq('id', equipmentId)
        .single();

      if (equipmentError || !equipment) {
        throw new Error('Equipment not found');
      }

      // 3. Create RADIUS user for the client
      console.log('Creating RADIUS user...');
      const radiusSuccess = await radiusService.createRadiusUser(clientId);
      if (!radiusSuccess) {
        console.warn('Failed to create RADIUS user, continuing with deployment...');
      }

      // 4. Update client status to active and set service activation
      await supabase
        .from('clients')
        .update({
          status: 'active',
          service_activated_at: new Date().toISOString(),
          installation_status: 'completed'
        })
        .eq('id', clientId);

      // 5. Generate service invoice
      const invoice = await this.generateServiceInvoice(client);

      // 6. Create network session record
      const session = await this.createNetworkSession(client, equipment);

      // 7. Start monitoring for this equipment
      this.initializeMonitoring(equipmentId, clientId);

      return {
        success: true,
        message: 'Client equipment deployed successfully with full integration',
        radiusUser: radiusSuccess,
        invoice,
        session
      };

    } catch (error) {
      console.error('Deployment error:', error);
      return {
        success: false,
        message: `Deployment failed: ${error.message}`
      };
    }
  }

  private async generateServiceInvoice(client: any) {
    try {
      // Calculate amounts
      const baseAmount = client.monthly_rate || client.service_packages?.monthly_rate || 0;
      const vatAmount = baseAmount * 0.16;
      const totalAmount = baseAmount + vatAmount;

      // Generate invoice number
      const invoiceNumber = `SVC-${Date.now()}-${client.id.substr(-6)}`;

      const invoiceData = {
        invoice_number: invoiceNumber,
        client_id: client.id,
        amount: baseAmount,
        vat_amount: vatAmount,
        total_amount: totalAmount,
        status: 'pending',
        due_date: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0], // 7 days from now
        service_period_start: new Date().toISOString().split('T')[0],
        service_period_end: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0], // 30 days
        notes: `Initial service activation invoice for ${client.service_packages?.name || 'Internet Service'}`,
        isp_company_id: client.isp_company_id
      };

      const { data: invoice, error } = await supabase
        .from('invoices')
        .insert(invoiceData)
        .select()
        .single();

      if (error) {
        console.error('Error creating invoice:', error);
        return null;
      }

      console.log('Service invoice created:', invoice);
      return invoice;
    } catch (error) {
      console.error('Error generating service invoice:', error);
      return null;
    }
  }

  private async createNetworkSession(client: any, equipment: any) {
    try {
      // Create a network session record for monitoring
      const sessionData = {
        client_id: client.id,
        username: client.email || client.phone,
        session_id: `auto-${Date.now()}`,
        ip_address: equipment.ip_address,
        nas_ip_address: equipment.ip_address,
        start_time: new Date().toISOString(),
        bytes_in: 0,
        bytes_out: 0,
        status: 'active',
        equipment_id: equipment.id,
        isp_company_id: client.isp_company_id
      };

      // Use any type to work around potential table structure issues
      const { data: session, error } = await (supabase as any)
        .from('network_sessions')
        .insert(sessionData)
        .select()
        .single();

      if (error) {
        console.warn('Could not create network session:', error);
        return null;
      }

      return session;
    } catch (error) {
      console.warn('Error creating network session:', error);
      return null;
    }
  }

  private initializeMonitoring(equipmentId: string, clientId: string) {
    // Start monitoring this equipment
    console.log(`Initializing monitoring for equipment ${equipmentId} and client ${clientId}`);
    
    // This would integrate with your SNMP monitoring service
    enhancedSnmpService.startMonitoring();
  }

  async getClientNetworkStatus(clientId: string) {
    try {
      // Get active RADIUS sessions
      const { data: radiusSession } = await (supabase as any)
        .from('radius_sessions')
        .select('*')
        .eq('client_id', clientId)
        .eq('status', 'active')
        .order('start_time', { ascending: false })
        .limit(1)
        .maybeSingle();

      // Get network sessions
      const { data: networkSession } = await (supabase as any)
        .from('network_sessions')
        .select('*')
        .eq('client_id', clientId)
        .eq('status', 'active')
        .order('start_time', { ascending: false })
        .limit(1)
        .maybeSingle();

      // Get today's bandwidth usage
      const today = new Date().toISOString().split('T')[0];
      const { data: bandwidth } = await supabase
        .from('bandwidth_statistics')
        .select('*')
        .eq('client_id', clientId)
        .gte('timestamp', `${today}T00:00:00`)
        .order('timestamp', { ascending: false })
        .limit(1)
        .maybeSingle();

      return {
        isOnline: !!(radiusSession || networkSession),
        currentSession: radiusSession || networkSession,
        dataUsage: bandwidth ? {
          in: bandwidth.in_octets || 0,
          out: bandwidth.out_octets || 0,
          total: (bandwidth.in_octets || 0) + (bandwidth.out_octets || 0)
        } : null,
        lastSeen: radiusSession?.start_time || networkSession?.start_time || new Date().toISOString()
      };
    } catch (error) {
      console.error('Error getting client network status:', error);
      return {
        isOnline: false,
        currentSession: null,
        dataUsage: null,
        lastSeen: new Date().toISOString()
      };
    }
  }
}

export const clientDeploymentService = new ClientDeploymentService();
