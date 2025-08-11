
import { supabase } from '@/integrations/supabase/client';

export interface RadiusUser {
  client_id: string;
  username: string;
  password: string;
  group_name: string;
  max_upload: string;
  max_download: string;
  expiration?: string;
  is_active: boolean;
}

class RadiusService {
  async createUser(userData: RadiusUser): Promise<boolean> {
    try {
      const { error } = await supabase
        .from('radius_users')
        .insert(userData);

      if (error) {
        console.error('Error creating RADIUS user:', error);
        return false;
      }

      console.log('RADIUS user created successfully');
      return true;
    } catch (error) {
      console.error('Error in RADIUS service:', error);
      return false;
    }
  }

  async updateUser(clientId: string, updates: Partial<RadiusUser>): Promise<boolean> {
    try {
      const { error } = await supabase
        .from('radius_users')
        .update(updates)
        .eq('client_id', clientId);

      if (error) {
        console.error('Error updating RADIUS user:', error);
        return false;
      }

      return true;
    } catch (error) {
      console.error('Error updating RADIUS user:', error);
      return false;
    }
  }

  async deleteUser(clientId: string): Promise<boolean> {
    try {
      const { error } = await supabase
        .from('radius_users')
        .delete()
        .eq('client_id', clientId);

      if (error) {
        console.error('Error deleting RADIUS user:', error);
        return false;
      }

      return true;
    } catch (error) {
      console.error('Error deleting RADIUS user:', error);
      return false;
    }
  }
}

export const radiusService = new RadiusService();
