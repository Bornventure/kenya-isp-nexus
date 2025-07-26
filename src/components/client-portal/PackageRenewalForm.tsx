
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useClientAuth } from '@/contexts/ClientAuthContext';
import { formatKenyanCurrency } from '@/utils/kenyanValidation';
import { RefreshCw } from 'lucide-react';
import PaymentMethodSelector from '@/components/customers/PaymentMethodSelector';

const PackageRenewalForm: React.FC = () => {
  const { client, refreshClientData } = useClientAuth();
  const [isProcessing, setIsProcessing] = useState(false);

  const handlePaymentComplete = async (paymentData: any) => {
    console.log('Package renewal payment completed:', paymentData);
    setIsProcessing(false);
    
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
      <CardContent className="space-y-4">
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

        <PaymentMethodSelector
          clientId={client.id}
          amount={packageAmount}
          accountReference={`PACKAGE_RENEWAL_${client.id}`}
          onPaymentComplete={handlePaymentComplete}
        />

        <div className="text-xs text-gray-500 space-y-1">
          <p>• Payment will be processed via your selected payment method</p>
          <p>• Your service will be renewed immediately after payment</p>
          <p>• You will receive an SMS confirmation</p>
        </div>
      </CardContent>
    </Card>
  );
};

export default PackageRenewalForm;
