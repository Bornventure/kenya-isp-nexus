import { supabase } from '@/integrations/supabase/client';

export interface PaymentMethodAvailability {
  method: string;
  available: boolean;
  configured: boolean;
  error?: string;
}

export interface PaymentAvailabilityResult {
  success: boolean;
  methods: PaymentMethodAvailability[];
  message: string;
}

// For now, we'll check based on what's actually implemented
const checkMpesaAvailability = async (): Promise<PaymentMethodAvailability> => {
  try {
    // Test the actual M-Pesa edge function to see if it's working
    const { data, error } = await supabase.functions.invoke('mpesa-stk-push', {
      body: {
        phone: '+254700000000', // Test phone number
        amount: 1, // Minimal test amount
        account_reference: 'test',
        transaction_description: 'availability test'
      }
    });

    // Even if the test fails due to invalid credentials, the function should exist
    // 404 means the function doesn't exist, other errors mean it exists but has issues
    return {
      method: 'mpesa',
      available: true,
      configured: error ? false : true,
      error: error ? `M-Pesa function exists but has configuration issues: ${error.message}` : undefined
    };
  } catch (error: any) {
    // Check if it's a 404 (function not found) vs other errors
    if (error.message?.includes('404') || error.message?.includes('not found')) {
      return {
        method: 'mpesa',
        available: false,
        configured: false,
        error: 'M-Pesa edge function not found (404 error)'
      };
    }
    
    return {
      method: 'mpesa',
      available: true, // Function exists but has issues
      configured: false,
      error: `M-Pesa function error: ${error.message}`
    };
  }
};

const checkFamilyBankAvailability = async (): Promise<PaymentMethodAvailability> => {
  try {
    const { data, error } = await supabase.functions.invoke('family-bank-stk-push', {
      body: {
        phone: '+254700000000', // Test phone number
        amount: 1, // Minimal test amount
        accountRef: 'test',
        clientId: 'test',
        invoiceId: null,
        ispCompanyId: 'test'
      }
    });

    return {
      method: 'family_bank',
      available: true,
      configured: error ? false : true,
      error: error ? `Family Bank function exists but has configuration issues: ${error.message}` : undefined
    };
  } catch (error: any) {
    if (error.message?.includes('404') || error.message?.includes('not found')) {
      return {
        method: 'family_bank',
        available: false,
        configured: false,
        error: 'Family Bank edge function not found (404 error)'
      };
    }
    
    return {
      method: 'family_bank',
      available: true,
      configured: false,
      error: `Family Bank function error: ${error.message}`
    };
  }
};

const checkStripeAvailability = async (): Promise<PaymentMethodAvailability> => {
  try {
    const { error } = await supabase.functions.invoke('stripe-checkout', {
      body: { test: true }
    });
    
    return {
      method: 'stripe',
      available: true,
      configured: !error,
      error: error ? `Stripe configuration issue: ${error.message}` : undefined
    };
  } catch (error: any) {
    return {
      method: 'stripe',
      available: false,
      configured: false,
      error: error.message?.includes('404') ? 'Stripe edge function not found' : `Stripe error: ${error.message}`
    };
  }
};

const checkPaypalAvailability = async (): Promise<PaymentMethodAvailability> => {
  try {
    const { error } = await supabase.functions.invoke('paypal-checkout', {
      body: { test: true }
    });
    
    return {
      method: 'paypal',
      available: true,
      configured: !error,
      error: error ? `PayPal configuration issue: ${error.message}` : undefined
    };
  } catch (error: any) {
    return {
      method: 'paypal',
      available: false,
      configured: false,
      error: error.message?.includes('404') ? 'PayPal edge function not found' : `PayPal error: ${error.message}`
    };
  }
};

const checkPesapalAvailability = async (): Promise<PaymentMethodAvailability> => {
  try {
    const { error } = await supabase.functions.invoke('pesapal-checkout', {
      body: { test: true }
    });
    
    return {
      method: 'pesapal',
      available: true,
      configured: !error,
      error: error ? `PesaPal configuration issue: ${error.message}` : undefined
    };
  } catch (error: any) {
    return {
      method: 'pesapal',
      available: false,
      configured: false,
      error: error.message?.includes('404') ? 'PesaPal edge function not found' : `PesaPal error: ${error.message}`
    };
  }
};

const checkAllPaymentMethods = async (): Promise<PaymentAvailabilityResult> => {
  try {
    console.log('Checking payment methods availability...');
    
    const [mpesa, familyBank, stripe, paypal, pesapal] = await Promise.all([
      checkMpesaAvailability(),
      checkFamilyBankAvailability(),
      checkStripeAvailability(),
      checkPaypalAvailability(),
      checkPesapalAvailability()
    ]);

    const methods = [mpesa, familyBank, stripe, paypal, pesapal];
    const availableCount = methods.filter(method => method.available).length;

    console.log('Payment methods availability:', {
      success: true,
      methods,
      message: `Payment methods availability checked successfully`
    });

    return {
      success: true,
      methods,
      message: `${availableCount} payment method(s) available`
    };
  } catch (error) {
    console.error('Error checking payment methods:', error);
    return {
      success: false,
      methods: [],
      message: 'Failed to check payment methods availability'
    };
  }
};

export const paymentAvailabilityService = {
  checkAllPaymentMethods,
  checkMpesaAvailability,
  checkFamilyBankAvailability,
  checkStripeAvailability,
  checkPaypalAvailability,
  checkPesapalAvailability
};
