import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Smartphone, CreditCard, Building2, AlertCircle, CheckCircle } from 'lucide-react';
import { paymentAvailabilityService, PaymentMethodAvailability } from '@/services/paymentAvailabilityService';
import MpesaPayment from '@/components/billing/MpesaPayment';
import FamilyBankPayment from '@/components/billing/FamilyBankPayment';

interface PaymentMethodSelectorProps {
  clientId: string;
  amount: number;
  invoiceId?: string;
  accountReference: string;
  onPaymentComplete?: (paymentData: any) => void;
}

const PaymentMethodSelector: React.FC<PaymentMethodSelectorProps> = ({
  clientId,
  amount,
  invoiceId,
  accountReference,
  onPaymentComplete,
}) => {
  const [selectedMethod, setSelectedMethod] = useState<string>('');
  const [paymentMethods, setPaymentMethods] = useState<PaymentMethodAvailability[]>([]);
  const [loading, setLoading] = useState(true);
  const [showPaymentDialog, setShowPaymentDialog] = useState(false);

  useEffect(() => {
    checkPaymentMethodsAvailability();
  }, []);

  const checkPaymentMethodsAvailability = async () => {
    setLoading(true);
    try {
      const result = await paymentAvailabilityService.checkAllPaymentMethods();
      if (result.success) {
        setPaymentMethods(result.methods);
      }
    } catch (error) {
      console.error('Error checking payment methods:', error);
    } finally {
      setLoading(false);
    }
  };

  const getMethodIcon = (method: string) => {
    switch (method) {
      case 'mpesa': return <Smartphone className="h-5 w-5 text-green-600" />;
      case 'family_bank': return <Smartphone className="h-5 w-5 text-purple-600" />;
      case 'stripe': return <CreditCard className="h-5 w-5 text-blue-600" />;
      case 'paypal': return <CreditCard className="h-5 w-5 text-blue-800" />;
      case 'pesapal': return <Building2 className="h-5 w-5 text-orange-600" />;
      default: return <CreditCard className="h-5 w-5" />;
    }
  };

  const getMethodDisplayName = (method: string) => {
    switch (method) {
      case 'mpesa': return 'M-Pesa';
      case 'family_bank': return 'Family Bank';
      case 'stripe': return 'Stripe';
      case 'paypal': return 'PayPal';
      case 'pesapal': return 'PesaPal';
      default: return method;
    }
  };

  const handleMethodSelect = (method: PaymentMethodAvailability) => {
    if (!method.available) return;
    
    setSelectedMethod(method.method);
    if (method.method === 'mpesa' || method.method === 'family_bank') {
      setShowPaymentDialog(true);
    }
  };

  const handlePaymentComplete = (paymentData: any) => {
    setShowPaymentDialog(false);
    setSelectedMethod('');
    if (onPaymentComplete) {
      onPaymentComplete(paymentData);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center p-8">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-2"></div>
          <p className="text-gray-600">Checking payment methods...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h3 className="text-lg font-medium mb-4">Select Payment Method</h3>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {paymentMethods.map((method) => (
            <Card 
              key={method.method}
              className={`cursor-pointer transition-all ${
                method.available 
                  ? 'hover:shadow-md hover:border-blue-300' 
                  : 'opacity-60 cursor-not-allowed'
              } ${selectedMethod === method.method ? 'ring-2 ring-blue-500 bg-blue-50' : ''}`}
              onClick={() => handleMethodSelect(method)}
            >
              <CardContent className="p-4">
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-2">
                    {getMethodIcon(method.method)}
                    <span className="font-medium">{getMethodDisplayName(method.method)}</span>
                  </div>
                  {method.available ? (
                    <Badge variant="default" className="bg-green-100 text-green-800">
                      <CheckCircle className="h-3 w-3 mr-1" />
                      Available
                    </Badge>
                  ) : (
                    <Badge variant="secondary" className="bg-red-100 text-red-800">
                      <AlertCircle className="h-3 w-3 mr-1" />
                      Unavailable
                    </Badge>
                  )}
                </div>
                {method.error && (
                  <p className="text-sm text-gray-500">{method.error}</p>
                )}
              </CardContent>
            </Card>
          ))}
        </div>
      </div>

      {/* Payment Dialog */}
      <Dialog open={showPaymentDialog} onOpenChange={setShowPaymentDialog}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>
              {selectedMethod === 'mpesa' ? 'M-Pesa Payment' : 'Family Bank Payment'}
            </DialogTitle>
            <DialogDescription>
              Complete your payment using {selectedMethod === 'mpesa' ? 'M-Pesa' : 'Family Bank'} mobile money service.
            </DialogDescription>
          </DialogHeader>
          
          {selectedMethod === 'mpesa' ? (
            <MpesaPayment
              clientId={clientId}
              amount={amount}
              invoiceId={invoiceId}
              accountReference={accountReference}
              onPaymentComplete={handlePaymentComplete}
            />
          ) : selectedMethod === 'family_bank' ? (
            <FamilyBankPayment
              clientId={clientId}
              amount={amount}
              invoiceId={invoiceId}
              accountReference={accountReference}
              onPaymentComplete={handlePaymentComplete}
            />
          ) : null}
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default PaymentMethodSelector;
