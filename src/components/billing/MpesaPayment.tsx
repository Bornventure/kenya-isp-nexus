import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Smartphone, CheckCircle, Clock, AlertCircle } from 'lucide-react';
import { useMpesa } from '@/hooks/useMpesa';
import { usePayments } from '@/hooks/usePayments';
import { validateMpesaNumber, formatMpesaNumber, formatKenyanCurrency } from '@/utils/kenyanValidation';

interface MpesaPaymentProps {
  clientId: string;
  amount: number;
  invoiceId?: string;
  accountReference: string;
  onPaymentComplete?: (paymentData: any) => void;
}

const MpesaPayment: React.FC<MpesaPaymentProps> = ({
  clientId,
  amount,
  invoiceId,
  accountReference,
  onPaymentComplete,
}) => {
  const [phoneNumber, setPhoneNumber] = useState('');
  const [paymentStatus, setPaymentStatus] = useState<'idle' | 'pending' | 'checking' | 'success' | 'failed'>('idle');
  const [checkoutRequestID, setCheckoutRequestID] = useState<string>('');
  const [errors, setErrors] = useState<Record<string, string>>({});

  const { initiateSTKPush, queryPaymentStatus, isLoading } = useMpesa();
  const { createPayment } = usePayments();

  const validateForm = () => {
    const newErrors: Record<string, string> = {};
    
    if (!phoneNumber) {
      newErrors.phoneNumber = 'Phone number is required';
    } else if (!validateMpesaNumber(phoneNumber)) {
      newErrors.phoneNumber = 'Invalid M-Pesa number format';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handlePayment = async () => {
    if (!validateForm()) return;

    const stkResponse = await initiateSTKPush({
      phoneNumber,
      amount,
      accountReference,
      transactionDesc: `Payment for ${accountReference}`,
    });

    if (stkResponse && stkResponse.ResponseCode === '0') {
      setCheckoutRequestID(stkResponse.CheckoutRequestID);
      setPaymentStatus('pending');
      
      // Start checking payment status
      setTimeout(() => {
        checkPaymentStatus(stkResponse.CheckoutRequestID);
      }, 10000); // Wait 10 seconds before first check
    }
  };

  const checkPaymentStatus = async (requestID: string) => {
    setPaymentStatus('checking');
    
    const statusResponse = await queryPaymentStatus(requestID);
    
    if (statusResponse) {
      if (statusResponse.ResultCode === '0') {
        // Payment successful
        setPaymentStatus('success');
        
        // Record payment in database
        const paymentData = {
          client_id: clientId,
          amount,
          payment_method: 'mpesa' as const,
          payment_date: new Date().toISOString(),
          reference_number: phoneNumber,
          mpesa_receipt_number: requestID,
          notes: `M-Pesa payment for ${accountReference}`,
          invoice_id: invoiceId || null,
        };

        createPayment(paymentData);
        
        if (onPaymentComplete) {
          onPaymentComplete(paymentData);
        }
      } else if (statusResponse.ResultCode === '1032') {
        // User cancelled
        setPaymentStatus('failed');
      } else {
        // Other failure
        setPaymentStatus('failed');
      }
    } else {
      // Still pending, check again
      setTimeout(() => {
        checkPaymentStatus(requestID);
      }, 15000);
    }
  };

  const getStatusDisplay = () => {
    switch (paymentStatus) {
      case 'pending':
        return (
          <div className="flex items-center gap-2 text-blue-600">
            <Clock className="h-4 w-4 animate-spin" />
            <span>Waiting for payment confirmation...</span>
          </div>
        );
      case 'checking':
        return (
          <div className="flex items-center gap-2 text-yellow-600">
            <Clock className="h-4 w-4 animate-spin" />
            <span>Checking payment status...</span>
          </div>
        );
      case 'success':
        return (
          <div className="flex items-center gap-2 text-green-600">
            <CheckCircle className="h-4 w-4" />
            <span>Payment successful!</span>
          </div>
        );
      case 'failed':
        return (
          <div className="flex items-center gap-2 text-red-600">
            <AlertCircle className="h-4 w-4" />
            <span>Payment failed or cancelled</span>
          </div>
        );
      default:
        return null;
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Smartphone className="h-5 w-5 text-green-600" />
          M-Pesa Payment
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="bg-green-50 p-4 rounded-lg">
          <div className="flex justify-between items-center">
            <span className="font-medium">Amount to Pay:</span>
            <span className="text-xl font-bold text-green-600">
              {formatKenyanCurrency(amount)}
            </span>
          </div>
          <div className="flex justify-between items-center mt-2">
            <span className="text-sm text-gray-600">Reference:</span>
            <span className="text-sm font-medium">{accountReference}</span>
          </div>
        </div>

        {paymentStatus === 'idle' && (
          <div className="space-y-4">
            <div>
              <Label htmlFor="mpesaNumber">M-Pesa Phone Number</Label>
              <Input
                id="mpesaNumber"
                value={phoneNumber}
                onChange={(e) => setPhoneNumber(formatMpesaNumber(e.target.value))}
                placeholder="e.g., +254712345678"
                disabled={isLoading}
              />
              {errors.phoneNumber && (
                <p className="text-sm text-red-600 mt-1">{errors.phoneNumber}</p>
              )}
            </div>

            <Button 
              onClick={handlePayment} 
              disabled={isLoading || !phoneNumber}
              className="w-full bg-green-600 hover:bg-green-700"
            >
              {isLoading ? 'Initiating Payment...' : 'Pay with M-Pesa'}
            </Button>
          </div>
        )}

        {paymentStatus !== 'idle' && (
          <div className="space-y-4">
            <div className="text-center">
              <Badge variant={paymentStatus === 'success' ? 'default' : 'secondary'}>
                {getStatusDisplay()}
              </Badge>
            </div>

            {paymentStatus === 'pending' && (
              <div className="text-center text-sm text-gray-600">
                <p>Check your phone for the M-Pesa payment prompt.</p>
                <p>Enter your M-Pesa PIN to complete the payment.</p>
              </div>
            )}

            {paymentStatus === 'success' && (
              <div className="text-center">
                <Button 
                  variant="outline" 
                  onClick={() => {
                    setPaymentStatus('idle');
                    setPhoneNumber('');
                    setCheckoutRequestID('');
                  }}
                >
                  Make Another Payment
                </Button>
              </div>
            )}

            {paymentStatus === 'failed' && (
              <div className="text-center">
                <Button 
                  variant="outline" 
                  onClick={() => {
                    setPaymentStatus('idle');
                  }}
                >
                  Try Again
                </Button>
              </div>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default MpesaPayment;
