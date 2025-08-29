
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';

export interface MpesaSettings {
  id: string;
  isp_company_id: string;
  shortcode: string;
  consumer_key?: string;
  consumer_secret?: string;
  passkey?: string;
  callback_url?: string;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export interface FamilyBankSettings {
  id: string;
  isp_company_id: string;
  merchant_code: string;
  paybill_number: string;
  client_id?: string;
  client_secret?: string;
  token_url?: string;
  stk_url?: string;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export const usePaymentSettings = () => {
  const { profile } = useAuth();

  const { data: mpesaSettings, isLoading: mpesaLoading } = useQuery({
    queryKey: ['mpesa-settings', profile?.isp_company_id],
    queryFn: async (): Promise<MpesaSettings | null> => {
      if (!profile?.isp_company_id) return null;

      const { data, error } = await supabase
        .from('mpesa_settings')
        .select('*')
        .eq('isp_company_id', profile.isp_company_id)
        .eq('is_active', true)
        .single();

      if (error && error.code !== 'PGRST116') {
        console.error('Error fetching M-Pesa settings:', error);
        throw error;
      }

      return data;
    },
    enabled: !!profile?.isp_company_id,
  });

  const { data: familyBankSettings, isLoading: familyBankLoading } = useQuery({
    queryKey: ['family-bank-settings', profile?.isp_company_id],
    queryFn: async (): Promise<FamilyBankSettings | null> => {
      if (!profile?.isp_company_id) return null;

      const { data, error } = await supabase
        .from('family_bank_settings')
        .select('*')
        .eq('isp_company_id', profile.isp_company_id)
        .eq('is_active', true)
        .single();

      if (error && error.code !== 'PGRST116') {
        console.error('Error fetching Family Bank settings:', error);
        throw error;
      }

      return data;
    },
    enabled: !!profile?.isp_company_id,
  });

  return {
    mpesaSettings,
    familyBankSettings,
    isLoading: mpesaLoading || familyBankLoading,
  };
};
