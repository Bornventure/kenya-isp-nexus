
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

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) return;

    const response = await initiateSTKPush({
      phoneNumber: formData.phoneNumber,
      amount: parseFloat(formData.amount),
      accountReference: client.id_number,
      transactionDesc: 'Wallet Top Up',
    });

    if (response) {
      // Start monitoring payment status
      startPaymentMonitoring(
        'payment-' + Date.now(),
        response.CheckoutRequestID,
        {
          onSuccess: (data) => {
            toast({
              title: "Payment Successful",
              description: `Your wallet has been credited with ${formatKenyanCurrency(parseFloat(formData.amount))}`,
            });
            refreshClientData();
            setFormData({ ...formData, amount: '' });
          },
          onFailure: (data) => {
            toast({
              title: "Payment Failed",
              description: data?.message || "Payment could not be processed",
              variant: "destructive",
            });
          },
          onTimeout: () => {
            toast({
              title: "Payment Timeout",
              description: "Payment is taking longer than expected. Please check your M-Pesa messages.",
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
