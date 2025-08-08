
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/hooks/use-toast';

interface SystemSettings {
  company_name: string;
  timezone: string;
  date_format: string;
  currency: string;
  backup_enabled: boolean;
  backup_frequency: string;
  maintenance_mode: boolean;
  smtp_host: string;
  smtp_port: string;
  smtp_username: string;
  email_from_address: string;
  notifications_enabled: boolean;
}

export const useSystemSettings = () => {
  const { profile } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const { data: settings, isLoading } = useQuery({
    queryKey: ['system-settings', profile?.isp_company_id],
    queryFn: async () => {
      if (!profile?.isp_company_id) return null;

      const { data, error } = await supabase
        .rpc('get_system_settings', { company_id: profile.isp_company_id });

      if (error) {
        console.error('Error fetching system settings:', error);
        return getDefaultSettings();
      }

      return data[0] || getDefaultSettings();
    },
    enabled: !!profile?.isp_company_id,
  });

  const updateSettings = useMutation({
    mutationFn: async (settingsData: Partial<SystemSettings>) => {
      if (!profile?.isp_company_id) {
        throw new Error('Company ID not found');
      }

      const { error } = await supabase
        .rpc('upsert_system_settings', {
          company_id: profile.isp_company_id,
          settings_data: settingsData
        });

      if (error) {
        console.error('Error saving settings:', error);
        throw error;
      }

      return settingsData;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['system-settings'] });
      toast({
        title: "Settings Saved",
        description: "System settings have been updated successfully.",
      });
    },
    onError: (error: any) => {
      console.error('Settings update error:', error);
      toast({
        title: "Error",
        description: "Failed to save settings. Please try again.",
        variant: "destructive",
      });
    },
  });

  const getDefaultSettings = (): SystemSettings => ({
    company_name: profile?.isp_company_id ? 'Your ISP Company' : '',
    timezone: 'Africa/Nairobi',
    date_format: 'YYYY-MM-DD',
    currency: 'KES',
    backup_enabled: false,
    backup_frequency: 'daily',
    maintenance_mode: false,
    smtp_host: '',
    smtp_port: '587',
    smtp_username: '',
    email_from_address: '',
    notifications_enabled: true,
  });

  return {
    settings: settings || getDefaultSettings(),
    isLoading,
    updateSettings: updateSettings.mutate,
    isUpdating: updateSettings.isPending,
  };
};
