
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { 
  kenyanPaymentProviders, 
  calculatePaymentFees, 
  PaymentProvider 
} from '@/utils/kenyanPayments';
import { formatKenyanCurrency } from '@/utils/kenyanValidation';
import { paymentAvailabilityService, PaymentMethodAvailability } from '@/services/paymentAvailabilityService';
import MpesaPayment from './MpesaPayment';
import FamilyBankPayment from './FamilyBankPayment';
import { Smartphone, Building2, CreditCard, AlertCircle } from 'lucide-react';

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
  const [availablePayments, setAvailablePayments] = useState<PaymentMethodAvailability[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const checkPaymentAvailability = async () => {
      console.log('Checking payment method availability...');
      try {
        const result = await paymentAvailabilityService.checkAllPaymentMethods();
        console.log('Payment availability result:', result);
        
        if (result.success) {
          setAvailablePayments(result.methods);
        } else {
          console.error('Failed to check payment availability:', result.error);
          // Fallback to showing M-Pesa only
          setAvailablePayments([{
            method: 'mpesa',
            available: true
          }]);
        }
      } catch (error) {
        console.error('Error checking payment availability:', error);
        // Fallback to showing M-Pesa only
        setAvailablePayments([{
          method: 'mpesa',
          available: true
        }]);
      } finally {
        setLoading(false);
      }
    };

    checkPaymentAvailability();
  }, []);

  const getProvidersByType = (type: 'mobile_money' | 'bank' | 'payment_gateway') => {
    return kenyanPaymentProviders
      .filter(provider => provider.type === type)
      .filter(provider => {
        // Check if this payment method is available based on admin settings
        const availability = availablePayments.find(a => a.method === provider.id);
        return availability ? availability.available : false;
      });
  };

  const getPaymentAvailability = (providerId: string): PaymentMethodAvailability | undefined => {
    return availablePayments.find(a => a.method === providerId);
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
    const availability = getPaymentAvailability(provider.id);

    return (
      <Card 
        key={provider.id}
        className={`cursor-pointer transition-all ${
          !availability?.available 
            ? 'opacity-50 cursor-not-allowed' 
            : isSelected 
              ? 'ring-2 ring-blue-500 bg-blue-50' 
              : 'hover:shadow-md'
        }`}
        onClick={() => availability?.available && onProviderSelect(provider)}
      >
        <CardContent className="p-4">
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center gap-2">
              {getProviderIcon(provider)}
              <span className="font-medium">{provider.name}</span>
            </div>
            <div className="flex items-center gap-2">
              {isSelected && <Badge variant="default">Selected</Badge>}
              {!availability?.available && (
                <Badge variant="destructive">Disabled</Badge>
              )}
            </div>
          </div>
          
          {availability?.adminDisabled && availability.disabledReason && (
            <Alert className="mb-2">
              <AlertCircle className="h-4 w-4" />
              <AlertDescription className="text-xs">
                {availability.disabledReason}
              </AlertDescription>
            </Alert>
          )}
          
          {availability?.available && (
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
          )}
        </CardContent>
      </Card>
    );
  };

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="animate-pulse">
          <div className="h-4 bg-gray-200 rounded w-1/4 mb-4"></div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {[1, 2, 3].map(i => (
              <div key={i} className="h-32 bg-gray-200 rounded"></div>
            ))}
          </div>
        </div>
      </div>
    );
  }

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
          {getProvidersByType(activeTab).length > 0 ? (
            getProvidersByType(activeTab).map(renderProviderCard)
          ) : (
            <div className="col-span-full text-center py-8">
              <AlertCircle className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <p className="text-gray-600 mb-2">No payment methods available</p>
              <p className="text-sm text-gray-500">
                Contact support to enable payment methods for this category.
              </p>
            </div>
          )}
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

      {selectedProvider && selectedProvider.id === 'family_bank' && (
        <div className="border-t pt-6">
          <FamilyBankPayment
            clientId={clientId}
            amount={amount + calculatePaymentFees(selectedProvider, amount)}
            invoiceId={invoiceId}
            accountReference={accountReference}
            onPaymentComplete={onPaymentComplete}
          />
        </div>
      )}

      {selectedProvider && selectedProvider.id !== 'mpesa' && selectedProvider.id !== 'family_bank' && (
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
