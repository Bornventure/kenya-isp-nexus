
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Smartphone, Loader } from 'lucide-react';
import { useClientAuth } from '@/contexts/ClientAuthContext';
import { useMpesa } from '@/hooks/useMpesa';
import { usePaymentStatus } from '@/hooks/usePaymentStatus';
import { validateMpesaNumber, formatMpesaNumber, formatKenyanCurrency } from '@/utils/kenyanValidation';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';

const MpesaPaymentForm: React.FC = () => {
  const { client, refreshClientData } = useClientAuth();
  const { initiateSTKPush, isLoading } = useMpesa();
  const { startPaymentMonitoring, isMonitoring } = usePaymentStatus();
  const { toast } = useToast();

  const [formData, setFormData] = useState({
    phoneNumber: client?.mpesa_number || client?.phone || '',
    amount: '',
  });
  const [errors, setErrors] = useState<Record<string, string>>({});

  if (!client) return null;

  const validateForm = () => {
    const newErrors: Record<string, string> = {};

    if (!formData.phoneNumber) {
      newErrors.phoneNumber = 'Phone number is required';
    } else if (!validateMpesaNumber(formData.phoneNumber)) {
      newErrors.phoneNumber = 'Please enter a valid M-Pesa number';
    }

    if (!formData.amount || parseFloat(formData.amount) <= 0) {
      newErrors.amount = 'Please enter a valid amount';
    } else if (parseFloat(formData.amount) < 10) {
      newErrors.amount = 'Minimum payment amount is KES 10';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const processPaymentSuccess = async (checkoutRequestId: string, amount: number) => {
    try {
      console.log('Processing payment success for checkout request:', checkoutRequestId);
      
      // Call the process-payment function to update wallet balance
      const { data, error } = await supabase.functions.invoke('process-payment', {
        body: {
          checkoutRequestId: checkoutRequestId,
          clientId: client.id,
          amount: amount,
          paymentMethod: 'mpesa',
          phoneNumber: formData.phoneNumber
        }
      });

      if (error) {
        console.error('Error processing payment:', error);
        throw error;
      }

      console.log('Payment processed successfully:', data);

      // Refresh client data to show updated wallet balance
      await refreshClientData();

      toast({
        title: "Payment Successful",
        description: `Your wallet has been credited with ${formatKenyanCurrency(amount)}`,
      });

      // Reset form
      setFormData({ ...formData, amount: '' });

    } catch (error) {
      console.error('Error in payment processing:', error);
      toast({
        title: "Payment Processing Error",
        description: "Payment was successful but there was an issue updating your wallet. Please contact support.",
        variant: "destructive",
      });
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) return;

    const amount = parseFloat(formData.amount);
    const response = await initiateSTKPush({
      phoneNumber: formData.phoneNumber,
      amount: amount,
      accountReference: client.id_number,
      transactionDesc: 'Wallet Top Up',
    });

    if (response && response.CheckoutRequestID) {
      console.log('STK Push successful, starting payment monitoring for:', response.CheckoutRequestID);
      
      // Start monitoring payment status
      startPaymentMonitoring(
        'payment-' + Date.now(),
        response.CheckoutRequestID,
        {
          onSuccess: async (data) => {
            console.log('Payment monitoring detected success:', data);
            // Process the payment to update wallet balance
            await processPaymentSuccess(response.CheckoutRequestID, amount);
          },
          onFailure: (data) => {
            console.log('Payment monitoring detected failure:', data);
            toast({
              title: "Payment Failed",
              description: data?.message || "Payment could not be processed",
              variant: "destructive",
            });
          },
          onTimeout: () => {
            console.log('Payment monitoring timeout');
            toast({
              title: "Payment Timeout",
              description: "Payment is taking longer than expected. Please check your M-Pesa messages and contact support if payment was successful.",
              variant: "destructive",
            });
          },
        }
      );
    }
  };

  const isProcessing = isLoading || isMonitoring;

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Smartphone className="h-5 w-5" />
          Pay via M-Pesa STK Push
        </CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <Label htmlFor="phoneNumber">M-Pesa Phone Number</Label>
            <Input
              id="phoneNumber"
              type="tel"
              value={formData.phoneNumber}
              onChange={(e) => setFormData({ ...formData, phoneNumber: formatMpesaNumber(e.target.value) })}
              placeholder="+254712345678"
              disabled={isProcessing}
            />
            {errors.phoneNumber && (
              <p className="text-sm text-red-600 mt-1">{errors.phoneNumber}</p>
            )}
          </div>

          <div>
            <Label htmlFor="amount">Amount (KES)</Label>
            <Input
              id="amount"
              type="number"
              value={formData.amount}
              onChange={(e) => setFormData({ ...formData, amount: e.target.value })}
              placeholder="Enter amount"
              min="10"
              disabled={isProcessing}
            />
            {errors.amount && (
              <p className="text-sm text-red-600 mt-1">{errors.amount}</p>
            )}
            {formData.amount && parseFloat(formData.amount) > 0 && (
              <p className="text-sm text-gray-600 mt-1">
                Amount: {formatKenyanCurrency(parseFloat(formData.amount))}
              </p>
            )}
          </div>

          <Button type="submit" disabled={isProcessing} className="w-full">
            {isProcessing ? (
              <>
                <Loader className="h-4 w-4 mr-2 animate-spin" />
                {isLoading ? 'Initiating Payment...' : 'Processing Payment...'}
              </>
            ) : (
              'Pay Now'
            )}
          </Button>

          {isMonitoring && (
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
              <p className="text-sm text-blue-800">
                <strong>Payment Initiated:</strong> Please check your phone for the M-Pesa payment prompt and enter your PIN to complete the transaction.
              </p>
            </div>
          )}
        </form>
      </CardContent>
    </Card>
  );
};

export default MpesaPaymentForm;
