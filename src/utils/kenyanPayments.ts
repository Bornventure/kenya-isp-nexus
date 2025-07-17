export interface PaymentProvider {
  id: string;
  name: string;
  type: 'mobile_money' | 'bank' | 'payment_gateway';
  supported_countries: string[];
  currencies: string[];
  fees?: {
    percentage?: number;
    fixed?: number;
    min?: number;
    max?: number;
  };
}

export const kenyanPaymentProviders: PaymentProvider[] = [
  {
    id: 'mpesa',
    name: 'M-Pesa',
    type: 'mobile_money',
    supported_countries: ['KE'],
    currencies: ['KES'],
    fees: {
      percentage: 0,
      fixed: 0, // Customer pays fees
    }
  },
  {
    id: 'airtel_money',
    name: 'Airtel Money',
    type: 'mobile_money',
    supported_countries: ['KE'],
    currencies: ['KES'],
    fees: {
      percentage: 0,
      fixed: 0,
    }
  },
  {
    id: 'tkash',
    name: 'T-Kash',
    type: 'mobile_money',
    supported_countries: ['KE'],
    currencies: ['KES'],
    fees: {
      percentage: 0,
      fixed: 0,
    }
  },
  {
    id: 'family_bank',
    name: 'Family Bank',
    type: 'mobile_money',
    supported_countries: ['KE'],
    currencies: ['KES'],
    fees: {
      percentage: 0,
      fixed: 0, // Customer pays fees
    }
  },
  {
    id: 'equity_bank',
    name: 'Equity Bank',
    type: 'bank',
    supported_countries: ['KE'],
    currencies: ['KES'],
    fees: {
      fixed: 30, // Typical bank transfer fee
    }
  },
  {
    id: 'kcb',
    name: 'KCB Bank',
    type: 'bank',
    supported_countries: ['KE'],
    currencies: ['KES'],
    fees: {
      fixed: 30,
    }
  },
  {
    id: 'coop_bank',
    name: 'Co-operative Bank',
    type: 'bank',
    supported_countries: ['KE'],
    currencies: ['KES'],
    fees: {
      fixed: 25,
    }
  },
  {
    id: 'pesapal',
    name: 'PesaPal',
    type: 'payment_gateway',
    supported_countries: ['KE', 'UG', 'TZ', 'RW'],
    currencies: ['KES', 'UGX', 'TZS', 'RWF', 'USD'],
    fees: {
      percentage: 3.5,
      min: 10,
    }
  },
  {
    id: 'flutterwave',
    name: 'Flutterwave',
    type: 'payment_gateway',
    supported_countries: ['KE', 'NG', 'GH', 'UG', 'TZ'],
    currencies: ['KES', 'NGN', 'GHS', 'UGX', 'TZS', 'USD'],
    fees: {
      percentage: 3.8,
      min: 10,
    }
  },
];

export const calculatePaymentFees = (provider: PaymentProvider, amount: number): number => {
  if (!provider.fees) return 0;
  
  let fee = 0;
  
  if (provider.fees.percentage) {
    fee += amount * (provider.fees.percentage / 100);
  }
  
  if (provider.fees.fixed) {
    fee += provider.fees.fixed;
  }
  
  if (provider.fees.min && fee < provider.fees.min) {
    fee = provider.fees.min;
  }
  
  if (provider.fees.max && fee > provider.fees.max) {
    fee = provider.fees.max;
  }
  
  return Math.round(fee * 100) / 100; // Round to 2 decimal places
};

export const getProviderByType = (type: 'mobile_money' | 'bank' | 'payment_gateway'): PaymentProvider[] => {
  return kenyanPaymentProviders.filter(provider => provider.type === type);
};

export const getMobileMoneyProviders = () => getProviderByType('mobile_money');
export const getBankProviders = () => getProviderByType('bank');
export const getPaymentGatewayProviders = () => getProviderByType('payment_gateway');

export const formatPaymentReference = (provider: string, reference: string): string => {
  switch (provider) {
    case 'mpesa':
      return reference.toUpperCase();
    case 'airtel_money':
      return `AM${reference}`;
    case 'tkash':
      return `TK${reference}`;
    case 'family_bank':
      return `FBL${reference}`;
    default:
      return reference;
  }
};

export const validatePaymentReference = (provider: string, reference: string): boolean => {
  switch (provider) {
    case 'mpesa':
      // M-Pesa receipt format: 10 characters (letters and numbers)
      return /^[A-Z0-9]{10}$/.test(reference);
    case 'airtel_money':
      // Airtel Money transaction ID format
      return /^[A-Z0-9]{8,15}$/.test(reference);
    case 'tkash':
      // T-Kash transaction ID format
      return /^[A-Z0-9]{8,12}$/.test(reference);
    case 'family_bank':
      // Family Bank transaction ID format
      return /^[A-Z0-9]{8,15}$/.test(reference);
    default:
      return reference.length > 0;
  }
};
