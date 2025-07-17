
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

class PaymentAvailabilityService {
  async checkAdminSettings(): Promise<Record<string, { enabled: boolean; reason?: string }>> {
    try {
      const { data, error } = await supabase
        .from('payment_method_settings')
        .select('payment_method, is_enabled, disabled_reason');

      if (error) throw error;

      const settings: Record<string, { enabled: boolean; reason?: string }> = {};
      data?.forEach(setting => {
        settings[setting.payment_method] = {
          enabled: setting.is_enabled,
          reason: setting.disabled_reason
        };
      });

      return settings;
    } catch (error) {
      console.error('Error fetching admin payment settings:', error);
      return {};
    }
  }

  async checkMpesaAvailability(): Promise<PaymentMethodAvailability> {
    const adminSettings = await this.checkAdminSettings();
    const mpesaSettings = adminSettings['mpesa'];

    if (mpesaSettings && !mpesaSettings.enabled) {
      return {
        method: 'mpesa',
        available: false,
        adminDisabled: true,
        disabledReason: mpesaSettings.reason || 'Payment method temporarily disabled'
      };
    }

    try {
      const { data, error } = await supabase.functions.invoke('mpesa-stk-push', {
        body: {
          phone: '254700000000',
          amount: 1,
          accountReference: 'TEST',
          transactionDesc: 'Availability Test'
        }
      });

      if (data || (error && error.message)) {
        return {
          method: 'mpesa',
          available: true
        };
      }

      return {
        method: 'mpesa',
        available: false,
        error: 'M-Pesa service not configured'
      };
    } catch (error) {
      return {
        method: 'mpesa',
        available: false,
        error: 'M-Pesa service unavailable'
      };
    }
  }

  async checkFamilyBankAvailability(): Promise<PaymentMethodAvailability> {
    const adminSettings = await this.checkAdminSettings();
    const familyBankSettings = adminSettings['family_bank'];

    if (familyBankSettings && !familyBankSettings.enabled) {
      return {
        method: 'family_bank',
        available: false,
        adminDisabled: true,
        disabledReason: familyBankSettings.reason || 'Payment method temporarily disabled'
      };
    }

    try {
      const { data, error } = await supabase.functions.invoke('family-bank-stk-push', {
        body: {
          phone: '254700000000',
          amount: 1,
          accountRef: 'TEST',
          clientId: 'test-client',
          invoiceId: null,
          ispCompanyId: null
        }
      });

      if (data || (error && error.message)) {
        return {
          method: 'family_bank',
          available: true
        };
      }

      return {
        method: 'family_bank',
        available: false,
        error: 'Family Bank service not configured'
      };
    } catch (error) {
      return {
        method: 'family_bank',
        available: false,
        error: 'Family Bank service unavailable'
      };
    }
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
      const [mpesa, familyBank, stripe, paypal, pesapal] = await Promise.all([
        this.checkMpesaAvailability(),
        this.checkFamilyBankAvailability(),
        this.checkStripeAvailability(),
        this.checkPayPalAvailability(),
        this.checkPesaPalAvailability()
      ]);

      return {
        success: true,
        methods: [mpesa, familyBank, stripe, paypal, pesapal]
      };
    } catch (error) {
      return {
        success: false,
        methods: [],
        error: 'Failed to check payment method availability'
      };
    }
  }
}

export const paymentAvailabilityService = new PaymentAvailabilityService();
