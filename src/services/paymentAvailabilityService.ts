
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
    // M-Pesa is available since we have the edge function and hook
    return {
      method: 'mpesa',
      available: true,
      configured: true
    };
  } catch (error) {
    return {
      method: 'mpesa',
      available: false,
      configured: false,
      error: 'M-Pesa integration not configured'
    };
  }
};

const checkStripeAvailability = async (): Promise<PaymentMethodAvailability> => {
  // Stripe not implemented yet
  return {
    method: 'stripe',
    available: false,
    configured: false,
    error: 'Stripe integration not implemented'
  };
};

const checkPaypalAvailability = async (): Promise<PaymentMethodAvailability> => {
  // PayPal not implemented yet
  return {
    method: 'paypal',
    available: false,
    configured: false,
    error: 'PayPal integration not implemented'
  };
};

const checkPesapalAvailability = async (): Promise<PaymentMethodAvailability> => {
  // PesaPal not implemented yet
  return {
    method: 'pesapal',
    available: false,
    configured: false,
    error: 'PesaPal integration not implemented'
  };
};

const checkAllPaymentMethods = async (): Promise<PaymentAvailabilityResult> => {
  try {
    console.log('Checking payment methods availability...');
    
    const [mpesa, stripe, paypal, pesapal] = await Promise.all([
      checkMpesaAvailability(),
      checkStripeAvailability(),
      checkPaypalAvailability(),
      checkPesapalAvailability()
    ]);

    const methods = [mpesa, stripe, paypal, pesapal];
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
  checkStripeAvailability,
  checkPaypalAvailability,
  checkPesapalAvailability
};
