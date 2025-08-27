
import { supabase } from '@/integrations/supabase/client';
import { formatSpeedForRadius } from '@/utils/speedConverter';

export class RadiusService {
  async createRadiusUser(clientId: string, username: string, password: string) {
    try {
      // Get client with service package details
      const { data: client } = await supabase
        .from('clients')
        .select('*, service_packages(*)')
        .eq('id', clientId)
        .single();

      if (!client || !client.service_packages) {
        throw new Error('Client or service package not found');
      }

      // Convert speed from service package to proper format for RADIUS
      const speedLimits = formatSpeedForRadius(client.service_packages.speed);

      // Create RADIUS user with proper speed limits
      const { data, error } = await supabase
        .from('radius_users')
        .insert({
          username,
          password,
          profile: 'default',
          status: 'active',
          client_id: clientId,
          isp_company_id: client.isp_company_id,
          // Store speed limits for QoS
          download_speed: speedLimits.download,
          upload_speed: speedLimits.upload,
          monthly_quota: client.service_packages.data_limit || null
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

      // Get RADIUS user for this client
      const { data: radiusUser } = await supabase
        .from('radius_users')
        .select('*')
        .eq('client_id', clientId)
        .single();

      if (!radiusUser) {
        console.log('No RADIUS user found for client:', clientId);
        return;
      }

      // Convert speed and update RADIUS user
      const speedLimits = formatSpeedForRadius(servicePackage.speed);

      const { error } = await supabase
        .from('radius_users')
        .update({
          download_speed: speedLimits.download,
          upload_speed: speedLimits.upload,
          monthly_quota: servicePackage.data_limit || null
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
        .update({ status: 'blocked' })
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
        .update({ status: 'active' })
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
