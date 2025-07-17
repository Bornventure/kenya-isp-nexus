
import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Smartphone, CheckCircle, Clock, AlertCircle } from 'lucide-react';
import { useMpesa } from '@/hooks/useMpesa';
import { usePaymentStatus } from '@/hooks/usePaymentStatus';
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

  const { initiateSTKPush, isLoading } = useMpesa();
  const { startPaymentMonitoring } = usePaymentStatus();

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

    console.log('Initiating M-Pesa STK Push:', { accountReference, amount, clientId });

    const stkResponse = await initiateSTKPush({
      phoneNumber,
      amount,
      accountReference,
      transactionDesc: `Payment for ${accountReference}`,
    });

    console.log('STK Push response:', stkResponse);

    if (stkResponse && stkResponse.ResponseCode === '0') {
      setCheckoutRequestID(stkResponse.CheckoutRequestID);
      setPaymentStatus('pending');
      
      // For wallet top-ups, use a different payment ID format
      const paymentId = accountReference === 'WALLET_TOPUP' 
        ? `wallet-topup-${Date.now()}` 
        : invoiceId || `payment-${Date.now()}`;
      
      console.log('Starting payment monitoring for:', {
        paymentId,
        checkoutRequestId: stkResponse.CheckoutRequestID
      });

      startPaymentMonitoring(
        paymentId,
        stkResponse.CheckoutRequestID,
        {
          onSuccess: (statusData) => {
            console.log('Payment monitoring success:', statusData);
            setPaymentStatus('success');
            
            if (onPaymentComplete) {
              onPaymentComplete({
                client_id: clientId,
                amount,
                payment_method: 'mpesa',
                payment_date: new Date().toISOString(),
                reference_number: phoneNumber,
                mpesa_receipt_number: stkResponse.CheckoutRequestID,
                notes: `M-Pesa payment for ${accountReference}`,
                invoice_id: invoiceId || null,
              });
            }
          },
          onFailure: (statusData) => {
            console.log('Payment monitoring failure:', statusData);
            setPaymentStatus('failed');
          },
          onTimeout: () => {
            console.log('Payment monitoring timeout');
            setPaymentStatus('failed');
          }
        }
      );
    } else {
      console.error('STK Push failed:', stkResponse);
      setPaymentStatus('failed');
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
    <div className="space-y-4">
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
        {invoiceId && (
          <div className="flex justify-between items-center mt-1">
            <span className="text-sm text-gray-600">Invoice ID:</span>
            <span className="text-sm font-medium">{invoiceId}</span>
          </div>
        )}
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
              <p className="text-xs mt-2 text-blue-600">
                Payment processing may take a few seconds...
              </p>
            </div>
          )}

          {paymentStatus === 'success' && (
            <div className="text-center">
              <div className="text-sm text-green-600 mb-3">
                <p>✅ Payment processed successfully!</p>
                <p>Your account has been updated.</p>
              </div>
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
              <div className="text-sm text-red-600 mb-3">
                <p>Payment was not completed successfully.</p>
                <p>Please try again or contact support.</p>
              </div>
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
    </div>
  );
};

export default MpesaPayment;
