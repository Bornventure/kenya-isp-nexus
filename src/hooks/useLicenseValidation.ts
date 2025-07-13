
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';

export interface LicenseValidationResult {
  isValid: boolean;
  isExpired: boolean;
  isActive: boolean;
  daysUntilExpiry: number | null;
  expiryDate: string | null;
  canAccessFeatures: boolean;
  restrictionMessage: string | null;
}

export const useLicenseValidation = () => {
  const { profile } = useAuth();

  const { data: validation, isLoading, error } = useQuery({
    queryKey: ['license-validation', profile?.isp_company_id],
    queryFn: async (): Promise<LicenseValidationResult> => {
      if (!profile?.isp_company_id) {
        return {
          isValid: false,
          isExpired: true,
          isActive: false,
          daysUntilExpiry: null,
          expiryDate: null,
          canAccessFeatures: false,
          restrictionMessage: 'No company license found'
        };
      }

      // Super admin bypasses license checks
      if (profile.role === 'super_admin') {
        return {
          isValid: true,
          isExpired: false,
          isActive: true,
          daysUntilExpiry: null,
          expiryDate: null,
          canAccessFeatures: true,
          restrictionMessage: null
        };
      }

      const { data: company, error: companyError } = await supabase
        .from('isp_companies')
        .select('is_active, subscription_end_date, license_type')
        .eq('id', profile.isp_company_id)
        .single();

      if (companyError || !company) {
        console.error('Error fetching company license:', companyError);
        return {
          isValid: false,
          isExpired: true,
          isActive: false,
          daysUntilExpiry: null,
          expiryDate: null,
          canAccessFeatures: false,
          restrictionMessage: 'Unable to verify license'
        };
      }

      const now = new Date();
      const expiryDate = company.subscription_end_date ? new Date(company.subscription_end_date) : null;
      const isExpired = expiryDate ? now > expiryDate : false;
      const isActive = company.is_active && !isExpired;
      
      let daysUntilExpiry = null;
      if (expiryDate) {
        const timeDiff = expiryDate.getTime() - now.getTime();
        daysUntilExpiry = Math.ceil(timeDiff / (1000 * 3600 * 24));
      }

      let restrictionMessage = null;
      if (!company.is_active) {
        restrictionMessage = 'License is inactive. Contact support to reactivate.';
      } else if (isExpired) {
        restrictionMessage = `License expired on ${expiryDate?.toLocaleDateString()}. Please renew to continue using the system.`;
      } else if (daysUntilExpiry !== null && daysUntilExpiry <= 7) {
        restrictionMessage = `License expires in ${daysUntilExpiry} day${daysUntilExpiry !== 1 ? 's' : ''}. Please renew soon.`;
      }

      return {
        isValid: isActive,
        isExpired,
        isActive: company.is_active,
        daysUntilExpiry,
        expiryDate: company.subscription_end_date,
        canAccessFeatures: isActive,
        restrictionMessage
      };
    },
    enabled: !!profile,
    refetchInterval: 300000, // Check every 5 minutes
  });

  return {
    validation: validation || {
      isValid: false,
      isExpired: true,
      isActive: false,
      daysUntilExpiry: null,
      expiryDate: null,
      canAccessFeatures: false,
      restrictionMessage: 'Loading license information...'
    },
    isLoading,
    error
  };
};
