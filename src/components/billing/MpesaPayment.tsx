
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Loader2, Smartphone, CheckCircle, AlertCircle } from 'lucide-react';
import { useMpesa } from '@/hooks/useMpesa';
import { usePaymentStatus } from '@/hooks/usePaymentStatus';
import { useToast } from '@/hooks/use-toast';
import PaymentErrorHandler from '@/components/payment/PaymentErrorHandler';

interface MpesaPaymentProps {
  clientId: string;
  amount: number;
  invoiceId?: string;
  accountReference: string;
  onPaymentComplete?: (data: any) => void;
}

const MpesaPayment: React.FC<MpesaPaymentProps> = ({
  clientId,
  amount,
  invoiceId,
  accountReference,
  onPaymentComplete,
}) => {
  const [phoneNumber, setPhoneNumber] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);
  const [paymentStatus, setPaymentStatus] = useState<'idle' | 'processing' | 'success' | 'failed'>('idle');
  const [error, setError] = useState<string | null>(null);

  const { initiateSTKPush } = useMpesa();
  const { startPaymentMonitoring, isMonitoring } = usePaymentStatus();
  const { toast } = useToast();

  const handlePayment = async () => {
    if (!phoneNumber) {
      setError('Please enter a valid phone number');
      return;
    }

    setIsProcessing(true);
    setPaymentStatus('processing');
    setError(null);

    try {
      console.log('Initiating M-Pesa STK Push:', { accountReference, amount, clientId });

      const response = await initiateSTKPush({
        phoneNumber,
        amount,
        accountReference,
        transactionDesc: `Payment for ${accountReference}`,
      });

      console.log('STK Push response:', response);

      // Fix TypeScript error by checking for ResponseCode instead of success
      if (response && response.ResponseCode === '0' && response.CheckoutRequestID) {
        const paymentId = invoiceId || `wallet-topup-${Date.now()}`;
        
        console.log('Starting payment monitoring for:', { paymentId, checkoutRequestId: response.CheckoutRequestID });

        await startPaymentMonitoring(
          paymentId,
          response.CheckoutRequestID,
          {
            onSuccess: (data) => {
              setPaymentStatus('success');
              setIsProcessing(false);
              toast({
                title: "Payment Successful",
                description: `Your payment of KES ${amount} has been processed successfully.`,
              });
              if (onPaymentComplete) {
                onPaymentComplete(data);
              }
            },
            onFailure: (data) => {
              setPaymentStatus('failed');
              setIsProcessing(false);
              setError(`Payment failed: ${data.message || 'Unknown error'}`);
            },
            onTimeout: () => {
              setPaymentStatus('failed');
              setIsProcessing(false);
              setError('Payment timeout. Please check your phone and try again, or contact support if you were charged.');
            }
          },
          clientId,
          amount
        );
      } else {
        throw new Error(response?.ResponseDescription || 'Failed to initiate payment');
      }
    } catch (error: any) {
      console.error('Payment initiation error:', error);
      setPaymentStatus('failed');
      setIsProcessing(false);
      setError(error.message || 'Failed to initiate payment. Please try again.');
    }
  };

  const handleRetry = () => {
    setError(null);
    setPaymentStatus('idle');
    handlePayment();
  };

  const handleContactSupport = () => {
    // In a real app, this would open a support ticket or contact form
    toast({
      title: "Contact Support",
      description: "Please contact our support team for assistance with your payment.",
    });
  };

  const formatPhoneNumber = (value: string) => {
    // Remove all non-digits
    const digits = value.replace(/\D/g, '');
    
    // Format as Kenyan number
    if (digits.startsWith('254')) {
      return `+${digits}`;
    } else if (digits.startsWith('0')) {
      return `+254${digits.slice(1)}`;
    } else if (digits.length >= 9) {
      return `+254${digits}`;
    }
    
    return value;
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
        <div className="space-y-2">
          <Label htmlFor="phone">Phone Number</Label>
          <Input
            id="phone"
            type="tel"
            placeholder="e.g., 0712345678"
            value={phoneNumber}
            onChange={(e) => setPhoneNumber(formatPhoneNumber(e.target.value))}
            disabled={isProcessing}
          />
        </div>

        <div className="p-3 bg-muted rounded-lg">
          <p className="text-sm text-muted-foreground">
            Amount to pay: <span className="font-semibold">KES {amount}</span>
          </p>
        </div>

        <PaymentErrorHandler
          error={error}
          onRetry={handleRetry}
          onContactSupport={handleContactSupport}
          isRetrying={isProcessing}
        />

        {paymentStatus === 'processing' && (
          <div className="flex items-center justify-center p-4 bg-blue-50 rounded-lg">
            <div className="text-center">
              <Loader2 className="h-8 w-8 animate-spin mx-auto mb-2 text-blue-600" />
              <p className="text-sm text-blue-600 font-medium">
                {isMonitoring ? 'Processing payment...' : 'Initiating payment...'}
              </p>
              <p className="text-xs text-muted-foreground mt-1">
                Please check your phone for the M-Pesa prompt
              </p>
            </div>
          </div>
        )}

        {paymentStatus === 'success' && (
          <div className="flex items-center justify-center p-4 bg-green-50 rounded-lg">
            <div className="text-center">
              <CheckCircle className="h-8 w-8 mx-auto mb-2 text-green-600" />
              <p className="text-sm text-green-600 font-medium">Payment Successful!</p>
            </div>
          </div>
        )}

        <Button
          onClick={handlePayment}
          disabled={!phoneNumber || isProcessing || paymentStatus === 'success'}
          className="w-full"
        >
          {isProcessing ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Processing...
            </>
          ) : paymentStatus === 'success' ? (
            'Payment Completed'
          ) : (
            `Pay KES ${amount}`
          )}
        </Button>

        <p className="text-xs text-muted-foreground text-center">
          You will receive an M-Pesa prompt on your phone to complete the payment
        </p>
      </CardContent>
    </Card>
  );
};

export default MpesaPayment;
