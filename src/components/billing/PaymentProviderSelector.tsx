
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { 
  kenyanPaymentProviders, 
  calculatePaymentFees,
  getMobileMoneyProviders,
  getBankProviders,
  getPaymentGatewayProviders,
  type PaymentProvider 
} from '@/utils/kenyanPayments';
import { formatKenyanCurrency } from '@/utils/kenyanValidation';
import { Smartphone, Building2, CreditCard, Wallet } from 'lucide-react';
import MpesaPayment from './MpesaPayment';

interface PaymentProviderSelectorProps {
  clientId: string;
  amount: number;
  invoiceId?: string;
  accountReference: string;
  selectedProvider?: PaymentProvider;
  onProviderSelect: (provider: PaymentProvider) => void;
  onPaymentComplete?: (paymentData: any) => void;
}

const PaymentProviderSelector: React.FC<PaymentProviderSelectorProps> = ({
  clientId,
  amount,
  invoiceId,
  accountReference,
  selectedProvider,
  onProviderSelect,
  onPaymentComplete,
}) => {
  const [showMpesaPayment, setShowMpesaPayment] = useState(false);

  const getProviderIcon = (type: string) => {
    switch (type) {
      case 'mobile_money': return <Smartphone className="h-5 w-5" />;
      case 'bank': return <Building2 className="h-5 w-5" />;
      case 'payment_gateway': return <CreditCard className="h-5 w-5" />;
      default: return <Wallet className="h-5 w-5" />;
    }
  };

  const getTypeColor = (type: string) => {
    switch (type) {
      case 'mobile_money': return 'bg-green-100 text-green-800';
      case 'bank': return 'bg-blue-100 text-blue-800';
      case 'payment_gateway': return 'bg-purple-100 text-purple-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const handleProviderSelect = (provider: PaymentProvider) => {
    onProviderSelect(provider);
    
    if (provider.id === 'mpesa') {
      setShowMpesaPayment(true);
    } else {
      setShowMpesaPayment(false);
    }
  };

  const renderProviderSection = (title: string, providers: PaymentProvider[], icon: React.ReactNode) => (
    <div className="space-y-3">
      <div className="flex items-center gap-2">
        {icon}
        <h3 className="font-semibold text-lg">{title}</h3>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
        {providers.map((provider) => {
          const fee = calculatePaymentFees(provider, amount);
          const total = amount + fee;
          const isSelected = selectedProvider?.id === provider.id;
          
          return (
            <Card 
              key={provider.id} 
              className={`cursor-pointer transition-all hover:shadow-md ${
                isSelected ? 'ring-2 ring-blue-500 bg-blue-50' : ''
              }`}
              onClick={() => handleProviderSelect(provider)}
            >
              <CardContent className="p-4">
                <div className="flex items-center justify-between mb-2">
                  <h4 className="font-medium">{provider.name}</h4>
                  <Badge className={getTypeColor(provider.type)}>
                    {provider.type.replace('_', ' ')}
                  </Badge>
                </div>
                
                <div className="space-y-1 text-sm">
                  <div className="flex justify-between">
                    <span>Amount:</span>
                    <span>{formatKenyanCurrency(amount)}</span>
                  </div>
                  {fee > 0 && (
                    <div className="flex justify-between">
                      <span>Fee:</span>
                      <span>{formatKenyanCurrency(fee)}</span>
                    </div>
                  )}
                  <div className="flex justify-between font-medium border-t pt-1">
                    <span>Total:</span>
                    <span>{formatKenyanCurrency(total)}</span>
                  </div>
                </div>
                
                <div className="mt-3">
                  <Button 
                    variant={isSelected ? "default" : "outline"} 
                    size="sm" 
                    className="w-full"
                  >
                    {isSelected ? 'Selected' : 'Select'}
                  </Button>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>
    </div>
  );

  if (amount <= 0) {
    return (
      <Card>
        <CardContent className="p-6 text-center">
          <p className="text-muted-foreground">Enter an amount to see payment options</p>
        </CardContent>
      </Card>
    );
  }

  if (showMpesaPayment && selectedProvider?.id === 'mpesa') {
    return (
      <div className="space-y-6">
        <MpesaPayment
          clientId={clientId}
          amount={amount}
          invoiceId={invoiceId}
          accountReference={accountReference}
          onPaymentComplete={onPaymentComplete}
        />
        
        <div className="text-center">
          <Button 
            variant="outline" 
            onClick={() => setShowMpesaPayment(false)}
          >
            Choose Different Payment Method
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Select Payment Method</CardTitle>
          <p className="text-sm text-muted-foreground">
            Choose your preferred payment method for {formatKenyanCurrency(amount)}
          </p>
        </CardHeader>
        <CardContent className="space-y-6">
          {renderProviderSection(
            'Mobile Money', 
            getMobileMoneyProviders(), 
            <Smartphone className="h-5 w-5 text-green-600" />
          )}
          
          {renderProviderSection(
            'Bank Transfer', 
            getBankProviders(), 
            <Building2 className="h-5 w-5 text-blue-600" />
          )}
          
          {renderProviderSection(
            'Payment Gateway', 
            getPaymentGatewayProviders(), 
            <CreditCard className="h-5 w-5 text-purple-600" />
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default PaymentProviderSelector;
