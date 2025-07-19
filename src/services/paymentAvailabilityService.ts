
import { supabase } from '@/integrations/supabase/client';

export interface PaymentMethodAvailability {
  method: string;
  available: boolean;
  error?: string;
  adminDisabled?: boolean;
  disabledReason?: string;
}

export interface PaymentAvailabilityResult {
  success: boolean;
  methods: PaymentMethodAvailability[];
  error?: string;
}

interface PaymentMethodSetting {
  payment_method: string;
  is_enabled: boolean;
  disabled_reason?: string | null;
  isp_company_id: string;
}

class PaymentAvailabilityService {
  private async getCurrentUserCompanyId(): Promise<string | null> {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return null;

      const { data: profile } = await supabase
        .from('profiles')
        .select('isp_company_id')
        .eq('id', user.id)
        .single();

      return profile?.isp_company_id || null;
    } catch (error) {
      console.error('Error getting current user company ID:', error);
      return null;
    }
  }

  async checkAdminSettings(): Promise<Record<string, { enabled: boolean; reason?: string }>> {
    try {
      const companyId = await this.getCurrentUserCompanyId();
      if (!companyId) {
        console.log('No company ID found, returning empty settings');
        return {};
      }

      console.log('Checking admin payment method settings for company:', companyId);
      const { data, error } = await supabase
        .from('payment_method_settings')
        .select('payment_method, is_enabled, disabled_reason')
        .eq('isp_company_id', companyId);

      if (error) {
        console.error('Error fetching payment method settings:', error);
        throw error;
      }

      console.log('Admin payment settings fetched:', data);

      const settings: Record<string, { enabled: boolean; reason?: string }> = {};
      (data as PaymentMethodSetting[])?.forEach(setting => {
        settings[setting.payment_method] = {
          enabled: setting.is_enabled,
          reason: setting.disabled_reason || undefined
        };
      });

      console.log('Processed admin settings:', settings);
      return settings;
    } catch (error) {
      console.error('Error fetching admin payment settings:', error);
      return {};
    }
  }

  async checkMpesaAvailability(): Promise<PaymentMethodAvailability> {
    console.log('Checking M-Pesa availability...');
    const adminSettings = await this.checkAdminSettings();
    const mpesaSettings = adminSettings['mpesa'];

    console.log('M-Pesa admin settings:', mpesaSettings);

    if (mpesaSettings && !mpesaSettings.enabled) {
      console.log('M-Pesa is disabled by admin');
      return {
        method: 'mpesa',
        available: false,
        adminDisabled: true,
        disabledReason: mpesaSettings.reason || 'Payment method temporarily disabled'
      };
    }

    console.log('M-Pesa is available (not disabled by admin)');
    return {
      method: 'mpesa',
      available: true
    };
  }

  async checkFamilyBankAvailability(): Promise<PaymentMethodAvailability> {
    console.log('Checking Family Bank availability...');
    const adminSettings = await this.checkAdminSettings();
    const familyBankSettings = adminSettings['family_bank'];

    console.log('Family Bank admin settings:', familyBankSettings);

    if (familyBankSettings && !familyBankSettings.enabled) {
      console.log('Family Bank is disabled by admin');
      return {
        method: 'family_bank',
        available: false,
        adminDisabled: true,
        disabledReason: familyBankSettings.reason || 'Payment method temporarily disabled'
      };
    }

    console.log('Family Bank is available (not disabled by admin)');
    return {
      method: 'family_bank',
      available: true
    };
  }

  async checkStripeAvailability(): Promise<PaymentMethodAvailability> {
    return {
      method: 'stripe',
      available: false,
      error: 'Stripe integration coming soon'
    };
  }

  async checkPayPalAvailability(): Promise<PaymentMethodAvailability> {
    return {
      method: 'paypal',
      available: false,
      error: 'PayPal integration coming soon'
    };
  }

  async checkPesaPalAvailability(): Promise<PaymentMethodAvailability> {
    return {
      method: 'pesapal',
      available: false,
      error: 'PesaPal integration coming soon'
    };
  }

  async checkAllPaymentMethods(): Promise<PaymentAvailabilityResult> {
    try {
      console.log('Checking all payment methods availability...');
      const [mpesa, familyBank, stripe, paypal, pesapal] = await Promise.all([
        this.checkMpesaAvailability(),
        this.checkFamilyBankAvailability(),
        this.checkStripeAvailability(),
        this.checkPayPalAvailability(),
        this.checkPesaPalAvailability()
      ]);

      const methods = [mpesa, familyBank, stripe, paypal, pesapal];
      console.log('Payment methods availability result:', methods);

      return {
        success: true,
        methods
      };
    } catch (error) {
      console.error('Error checking payment methods:', error);
      return {
        success: false,
        methods: [],
        error: 'Failed to check payment method availability'
      };
    }
  }
}

export const paymentAvailabilityService = new PaymentAvailabilityService();
