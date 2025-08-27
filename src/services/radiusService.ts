
import { supabase } from '@/integrations/supabase/client';
import { formatSpeedForRadius } from '@/utils/speedConverter';

export class RadiusService {
  async createRadiusUser(clientId: string, companyId: string) {
    try {
      // Get client with service package details
      const { data: client } = await supabase
        .from('clients')
        .select('*, service_packages:service_package_id(*)')
        .eq('id', clientId)
        .single();

      if (!client || !client.service_packages) {
        throw new Error('Client or service package not found');
      }

      // Convert speed from service package to proper format for RADIUS
      const speedLimits = formatSpeedForRadius(client.service_packages.speed);

      // Generate username and password
      const username = `${client.name.replace(/\s+/g, '').toLowerCase()}_${clientId.slice(0, 8)}`;
      const password = Math.random().toString(36).slice(-8);

      // Check if radius_users table exists and has the expected columns
      const { data, error } = await supabase
        .from('radius_users')
        .insert({
          username,
          password,
          group_name: 'default',
          is_active: true,
          client_id: clientId,
          isp_company_id: companyId,
          // Use the existing column names from the schema
          max_download: speedLimits.download.toString(),
          max_upload: speedLimits.upload.toString(),
        })
        .select()
        .single();

      if (error) {
        console.error('Error creating RADIUS user:', error);
        throw error;
      }

      console.log(`RADIUS user created: ${username} with speeds ${speedLimits.download}/${speedLimits.upload} Kbps`);
      return data;
    } catch (error) {
      console.error('RADIUS user creation error:', error);
      throw error;
    }
  }

  async updateClientQoS(clientId: string, servicePackageId: string) {
    try {
      // Get service package details
      const { data: servicePackage } = await supabase
        .from('service_packages')
        .select('*')
        .eq('id', servicePackageId)
        .single();

      if (!servicePackage) {
        throw new Error('Service package not found');
      }

      // Convert speed and update RADIUS user
      const speedLimits = formatSpeedForRadius(servicePackage.speed);

      const { error } = await supabase
        .from('radius_users')
        .update({
          max_download: speedLimits.download.toString(),
          max_upload: speedLimits.upload.toString(),
        })
        .eq('client_id', clientId);

      if (error) {
        console.error('Error updating RADIUS QoS:', error);
        throw error;
      }

      console.log(`Updated QoS for client ${clientId}: ${speedLimits.download}/${speedLimits.upload} Kbps`);
    } catch (error) {
      console.error('QoS update error:', error);
      throw error;
    }
  }

  async disconnectClient(clientId: string) {
    try {
      const { error } = await supabase
        .from('radius_users')
        .update({ is_active: false })
        .eq('client_id', clientId);

      if (error) throw error;

      console.log(`Client ${clientId} disconnected from RADIUS`);
      return true;
    } catch (error) {
      console.error('Error disconnecting client:', error);
      return false;
    }
  }

  async reconnectClient(clientId: string) {
    try {
      const { error } = await supabase
        .from('radius_users')
        .update({ is_active: true })
        .eq('client_id', clientId);

      if (error) throw error;

      console.log(`Client ${clientId} reconnected to RADIUS`);
      return true;
    } catch (error) {
      console.error('Error reconnecting client:', error);
      return false;
    }
  }
}

export const radiusService = new RadiusService();
