
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';

export interface LicenseValidationResult {
  isValid: boolean;
  isExpired: boolean;
  isActive: boolean;
  isDeactivated: boolean;
  daysUntilExpiry: number | null;
  expiryDate: string | null;
  canAccessFeatures: boolean;
  restrictionMessage: string | null;
  deactivationReason: string | null;
  deactivatedAt: string | null;
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
          isDeactivated: false,
          daysUntilExpiry: null,
          expiryDate: null,
          canAccessFeatures: false,
          restrictionMessage: 'No company license found',
          deactivationReason: null,
          deactivatedAt: null
        };
      }

      // Super admin bypasses license checks
      if (profile.role === 'super_admin') {
        return {
          isValid: true,
          isExpired: false,
          isActive: true,
          isDeactivated: false,
          daysUntilExpiry: null,
          expiryDate: null,
          canAccessFeatures: true,
          restrictionMessage: null,
          deactivationReason: null,
          deactivatedAt: null
        };
      }

      const { data: company, error: companyError } = await supabase
        .from('isp_companies')
        .select('is_active, subscription_end_date, license_type, deactivation_reason, deactivated_at')
        .eq('id', profile.isp_company_id)
        .single();

      if (companyError || !company) {
        console.error('Error fetching company license:', companyError);
        return {
          isValid: false,
          isExpired: true,
          isActive: false,
          isDeactivated: false,
          daysUntilExpiry: null,
          expiryDate: null,
          canAccessFeatures: false,
          restrictionMessage: 'Unable to verify license',
          deactivationReason: null,
          deactivatedAt: null
        };
      }

      const now = new Date();
      const expiryDate = company.subscription_end_date ? new Date(company.subscription_end_date) : null;
      const isExpired = expiryDate ? now > expiryDate : false;
      const isDeactivated = !company.is_active;
      const isActive = company.is_active && !isExpired;
      
      let daysUntilExpiry = null;
      if (expiryDate) {
        const timeDiff = expiryDate.getTime() - now.getTime();
        daysUntilExpiry = Math.ceil(timeDiff / (1000 * 3600 * 24));
      }

      let restrictionMessage = null;
      if (isDeactivated) {
        restrictionMessage = company.deactivation_reason || 'License is inactive. Contact support to reactivate.';
      } else if (isExpired) {
        restrictionMessage = `License expired on ${expiryDate?.toLocaleDateString()}. Please renew to continue using the system.`;
      } else if (daysUntilExpiry !== null && daysUntilExpiry <= 7) {
        restrictionMessage = `License expires in ${daysUntilExpiry} day${daysUntilExpiry !== 1 ? 's' : ''}. Please renew soon.`;
      }

      return {
        isValid: isActive,
        isExpired,
        isActive: company.is_active,
        isDeactivated,
        daysUntilExpiry,
        expiryDate: company.subscription_end_date,
        canAccessFeatures: isActive,
        restrictionMessage,
        deactivationReason: company.deactivation_reason,
        deactivatedAt: company.deactivated_at
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
      isDeactivated: false,
      daysUntilExpiry: null,
      expiryDate: null,
      canAccessFeatures: false,
      restrictionMessage: 'Loading license information...',
      deactivationReason: null,
      deactivatedAt: null
    },
    isLoading,
    error
  };
};
