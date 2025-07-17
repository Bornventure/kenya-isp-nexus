
import { supabase } from '@/integrations/supabase/client';

export interface PaymentMethodAvailability {
  method: string;
  available: boolean;
  error?: string;
}

export interface PaymentAvailabilityResult {
  success: boolean;
  methods: PaymentMethodAvailability[];
  error?: string;
}

class PaymentAvailabilityService {
  async checkMpesaAvailability(): Promise<PaymentMethodAvailability> {
    try {
      // Check if M-Pesa is configured by testing with minimal parameters
      const { data, error } = await supabase.functions.invoke('mpesa-stk-push', {
        body: {
          phone: '254700000000',
          amount: 1,
          accountReference: 'TEST',
          transactionDesc: 'Availability Test'
        }
      });

      // If we get a structured response (even if it's an error), M-Pesa is available
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
    try {
      // Check if Family Bank is configured by testing with minimal parameters
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

      // If we get a structured response (even if it's an error), Family Bank is available
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
    // Stripe is not implemented yet
    return {
      method: 'stripe',
      available: false,
      error: 'Stripe integration coming soon'
    };
  }

  async checkPayPalAvailability(): Promise<PaymentMethodAvailability> {
    // PayPal is not implemented yet
    return {
      method: 'paypal',
      available: false,
      error: 'PayPal integration coming soon'
    };
  }

  async checkPesaPalAvailability(): Promise<PaymentMethodAvailability> {
    // PesaPal is not implemented yet
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
