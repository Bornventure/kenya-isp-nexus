
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';

export interface LicenseInfo {
  license_type: 'starter' | 'professional' | 'enterprise';
  client_limit: number;
  current_client_count: number;
  is_active: boolean;
  subscription_end_date: string | null;
  features: {
    canAddClients: boolean;
    canManageUsers: boolean;
    canExportData: boolean;
    canCustomizeBranding: boolean;
  };
}

export const useLicenseManagement = () => {
  const { profile } = useAuth();

  const { data: licenseInfo, isLoading, error } = useQuery({
    queryKey: ['license-info', profile?.isp_company_id],
    queryFn: async (): Promise<LicenseInfo | null> => {
      if (!profile?.isp_company_id) return null;

      // Get ISP company info
      const { data: company, error: companyError } = await supabase
        .from('isp_companies')
        .select('license_type, client_limit, is_active, subscription_end_date')
        .eq('id', profile.isp_company_id)
        .single();

      if (companyError) {
        console.error('Error fetching company info:', companyError);
        throw companyError;
      }

      // Get current client count
      const { count: clientCount, error: countError } = await supabase
        .from('clients')
        .select('*', { count: 'exact', head: true })
        .eq('isp_company_id', profile.isp_company_id);

      if (countError) {
        console.error('Error fetching client count:', countError);
        throw countError;
      }

      const features = getLicenseFeatures(company.license_type);

      return {
        license_type: company.license_type as 'starter' | 'professional' | 'enterprise',
        client_limit: company.client_limit || 0,
        current_client_count: clientCount || 0,
        is_active: company.is_active || false,
        subscription_end_date: company.subscription_end_date,
        features,
      };
    },
    enabled: !!profile?.isp_company_id,
  });

  const getLicenseFeatures = (licenseType: string) => {
    switch (licenseType) {
      case 'starter':
        return {
          canAddClients: true,
          canManageUsers: false,
          canExportData: false,
          canCustomizeBranding: false,
        };
      case 'professional':
        return {
          canAddClients: true,
          canManageUsers: true,
          canExportData: true,
          canCustomizeBranding: false,
        };
      case 'enterprise':
        return {
          canAddClients: true,
          canManageUsers: true,
          canExportData: true,
          canCustomizeBranding: true,
        };
      default:
        return {
          canAddClients: false,
          canManageUsers: false,
          canExportData: false,
          canCustomizeBranding: false,
        };
    }
  };

  const canAddMoreClients = () => {
    if (!licenseInfo) return false;
    return licenseInfo.current_client_count < licenseInfo.client_limit;
  };

  const getRemainingClients = () => {
    if (!licenseInfo) return 0;
    return Math.max(0, licenseInfo.client_limit - licenseInfo.current_client_count);
  };

  return {
    licenseInfo,
    isLoading,
    error,
    canAddMoreClients: canAddMoreClients(),
    remainingClients: getRemainingClients(),
  };
};
