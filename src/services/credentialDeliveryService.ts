
import { supabase } from '@/integrations/supabase/client';

interface SendCredentialsData {
  email: string;
  phone?: string;
  first_name: string;
  last_name: string;
  password: string;
  role: string;
}

export const credentialDeliveryService = {
  async sendCredentials(userData: SendCredentialsData) {
    try {
      console.log('Sending credentials to user:', userData.email);

      // Call the edge function to send credentials
      const { data, error } = await supabase.functions.invoke('send-user-credentials', {
        body: {
          email: userData.email,
          phone: userData.phone,
          first_name: userData.first_name,
          last_name: userData.last_name,
          password: userData.password,
          role: userData.role,
        },
      });

      if (error) {
        console.error('Error sending credentials:', error);
        throw new Error(`Failed to send credentials: ${error.message}`);
      }

      console.log('Credentials sent successfully:', data);
      return data;
    } catch (error) {
      console.error('Credential delivery error:', error);
      throw error;
    }
  },
};
