
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useClientAuth } from '@/contexts/ClientAuthContext';
import { formatKenyanCurrency } from '@/utils/kenyanValidation';
import { RefreshCw } from 'lucide-react';
import PaymentMethodSelector from '@/components/customers/PaymentMethodSelector';

const PackageRenewalForm: React.FC = () => {
  const { client, refreshClientData } = useClientAuth();
  const [selectedPaymentMethod, setSelectedPaymentMethod] = useState<string>('');
  const [showPaymentForm, setShowPaymentForm] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);

  const handlePaymentMethodSelect = (value: string) => {
    setSelectedPaymentMethod(value);
    setShowPaymentForm(false);
  };

  const handleProceedToPay = () => {
    if (selectedPaymentMethod) {
      setShowPaymentForm(true);
    }
  };

  const handlePaymentComplete = async (paymentData: any) => {
    console.log('Package renewal payment completed:', paymentData);
    setIsProcessing(false);
    setShowPaymentForm(false);
    setSelectedPaymentMethod('');
    
    // Refresh client data to show updated status
    await refreshClientData();
  };

  if (!client) return null;

  const currentPackage = client.service_package;
  const packageAmount = client.monthly_rate;

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <RefreshCw className="h-5 w-5" />
          Renew Package
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        {currentPackage && (
          <div className="bg-blue-50 p-4 rounded-lg">
            <h3 className="font-medium text-blue-900">Current Package</h3>
            <p className="text-blue-700">{currentPackage.name}</p>
            <p className="text-sm text-blue-600">Speed: {currentPackage.speed}</p>
            <p className="text-lg font-semibold text-blue-900">
              {formatKenyanCurrency(packageAmount)} / month
            </p>
          </div>
        )}

        {!showPaymentForm ? (
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium mb-2">
                Select Payment Method
              </label>
              <Select value={selectedPaymentMethod} onValueChange={handlePaymentMethodSelect}>
                <SelectTrigger className="w-full">
                  <SelectValue placeholder="Choose how you'd like to pay" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="mpesa">M-Pesa Mobile Money</SelectItem>
                  <SelectItem value="family_bank">Family Bank Mobile Money</SelectItem>
                  <SelectItem value="bank_transfer">Bank Transfer</SelectItem>
                  <SelectItem value="card">Credit/Debit Card</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {selectedPaymentMethod && (
              <Button 
                onClick={handleProceedToPay}
                className="w-full"
                disabled={isProcessing}
              >
                Proceed to Pay {formatKenyanCurrency(packageAmount)}
              </Button>
            )}
          </div>
        ) : (
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="font-medium">Complete Payment</h3>
              <Button 
                variant="outline" 
                size="sm"
                onClick={() => setShowPaymentForm(false)}
              >
                Change Method
              </Button>
            </div>

            <PaymentMethodSelector
              clientId={client.id}
              amount={packageAmount}
              accountReference={`PACKAGE_RENEWAL_${client.id}`}
              onPaymentComplete={handlePaymentComplete}
            />
          </div>
        )}

        <div className="text-xs text-gray-500 space-y-1 border-t pt-4">
          <p>• Select your preferred payment method from the dropdown</p>
          <p>• Your service will be renewed immediately after payment</p>
          <p>• You will receive an SMS confirmation</p>
        </div>
      </CardContent>
    </Card>
  );
};

export default PackageRenewalForm;
