
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { 
  kenyanPaymentProviders, 
  calculatePaymentFees, 
  PaymentProvider 
} from '@/utils/kenyanPayments';
import { formatKenyanCurrency } from '@/utils/kenyanValidation';
import MpesaPayment from './MpesaPayment';
import { Smartphone, Building2, CreditCard } from 'lucide-react';

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
  const [activeTab, setActiveTab] = useState<'mobile_money' | 'bank' | 'payment_gateway'>('mobile_money');

  const getProvidersByType = (type: 'mobile_money' | 'bank' | 'payment_gateway') => {
    return kenyanPaymentProviders.filter(provider => provider.type === type);
  };

  const getProviderIcon = (provider: PaymentProvider) => {
    switch (provider.type) {
      case 'mobile_money': return <Smartphone className="h-5 w-5" />;
      case 'bank': return <Building2 className="h-5 w-5" />;
      case 'payment_gateway': return <CreditCard className="h-5 w-5" />;
    }
  };

  const renderProviderCard = (provider: PaymentProvider) => {
    const fees = calculatePaymentFees(provider, amount);
    const totalAmount = amount + fees;
    const isSelected = selectedProvider?.id === provider.id;

    return (
      <Card 
        key={provider.id}
        className={`cursor-pointer transition-all ${isSelected ? 'ring-2 ring-blue-500 bg-blue-50' : 'hover:shadow-md'}`}
        onClick={() => onProviderSelect(provider)}
      >
        <CardContent className="p-4">
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center gap-2">
              {getProviderIcon(provider)}
              <span className="font-medium">{provider.name}</span>
            </div>
            {isSelected && <Badge variant="default">Selected</Badge>}
          </div>
          <div className="text-sm text-gray-600 space-y-1">
            <div className="flex justify-between">
              <span>Amount:</span>
              <span>{formatKenyanCurrency(amount)}</span>
            </div>
            {fees > 0 && (
              <div className="flex justify-between">
                <span>Fees:</span>
                <span>{formatKenyanCurrency(fees)}</span>
              </div>
            )}
            <div className="flex justify-between font-medium text-gray-900 border-t pt-1">
              <span>Total:</span>
              <span>{formatKenyanCurrency(totalAmount)}</span>
            </div>
          </div>
        </CardContent>
      </Card>
    );
  };

  return (
    <div className="space-y-6">
      <div>
        <h3 className="text-lg font-medium mb-4">Select Payment Method</h3>
        
        {/* Payment Type Tabs */}
        <div className="flex space-x-4 mb-4">
          {[
            { key: 'mobile_money', label: 'Mobile Money', icon: <Smartphone className="h-4 w-4" /> },
            { key: 'bank', label: 'Bank Transfer', icon: <Building2 className="h-4 w-4" /> },
            { key: 'payment_gateway', label: 'Payment Gateway', icon: <CreditCard className="h-4 w-4" /> },
          ].map((tab) => (
            <button
              key={tab.key}
              onClick={() => setActiveTab(tab.key as any)}
              className={`flex items-center gap-2 px-4 py-2 rounded-md transition-colors ${
                activeTab === tab.key
                  ? 'bg-blue-500 text-white'
                  : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
              }`}
            >
              {tab.icon}
              {tab.label}
            </button>
          ))}
        </div>

        {/* Provider Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {getProvidersByType(activeTab).map(renderProviderCard)}
        </div>
      </div>

      {/* Payment Form */}
      {selectedProvider && selectedProvider.id === 'mpesa' && (
        <div className="border-t pt-6">
          <MpesaPayment
            clientId={clientId}
            amount={amount + calculatePaymentFees(selectedProvider, amount)}
            invoiceId={invoiceId}
            accountReference={accountReference}
            onPaymentComplete={onPaymentComplete}
          />
        </div>
      )}

      {selectedProvider && selectedProvider.id !== 'mpesa' && (
        <div className="border-t pt-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                {getProviderIcon(selectedProvider)}
                {selectedProvider.name} Payment
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-center py-8">
                <p className="text-gray-600 mb-4">
                  {selectedProvider.name} integration is coming soon.
                </p>
                <p className="text-sm text-gray-500">
                  Please use M-Pesa for now or contact support for manual payment processing.
                </p>
              </div>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
};

export default PaymentProviderSelector;
