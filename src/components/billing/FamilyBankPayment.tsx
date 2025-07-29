
import React, { useState, useRef } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Smartphone, CheckCircle, Clock, AlertCircle } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { formatKenyanCurrency } from '@/utils/kenyanValidation';
import { useToast } from '@/hooks/use-toast';

interface FamilyBankPaymentProps {
  clientId: string;
  amount: number;
  invoiceId?: string;
  accountReference: string;
  onPaymentComplete?: (paymentData: any) => void;
}

const FamilyBankPayment: React.FC<FamilyBankPaymentProps> = ({
  clientId,
  amount,
  invoiceId,
  accountReference,
  onPaymentComplete,
}) => {
  const [phoneNumber, setPhoneNumber] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [paymentStatus, setPaymentStatus] = useState<'idle' | 'pending' | 'success' | 'failed'>('idle');
  const [transactionId, setTransactionId] = useState('');
  const { toast } = useToast();
  
  // Use refs to track timers and prevent multiple polling instances
  const timeoutRef = useRef<NodeJS.Timeout | null>(null);
  const pollIntervalRef = useRef<NodeJS.Timeout | null>(null);
  const isPollingRef = useRef(false);

  const formatPhoneNumber = (phone: string) => {
    // Remove any non-digits
    const cleaned = phone.replace(/\D/g, '');
    
    // Add country code if not present
    if (cleaned.startsWith('0')) {
      return '254' + cleaned.substring(1);
    } else if (cleaned.startsWith('254')) {
      return cleaned;
    } else if (cleaned.length === 9) {
      return '254' + cleaned;
    }
    
    return cleaned;
  };

  const validatePhoneNumber = (phone: string) => {
    const formatted = formatPhoneNumber(phone);
    return /^254[0-9]{9}$/.test(formatted);
  };

  const cleanup = () => {
    console.log('Cleaning up payment monitoring timers');
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
      timeoutRef.current = null;
    }
    if (pollIntervalRef.current) {
      clearTimeout(pollIntervalRef.current);
      pollIntervalRef.current = null;
    }
    isPollingRef.current = false;
  };

  const initiatePayment = async () => {
    if (!validatePhoneNumber(phoneNumber)) {
      toast({
        title: "Invalid Phone Number",
        description: "Please enter a valid Kenyan phone number (e.g., 0712345678)",
        variant: "destructive",
      });
      return;
    }

    // Clean up any existing polling
    cleanup();

    setIsLoading(true);
    setPaymentStatus('pending');

    try {
      const formattedPhone = formatPhoneNumber(phoneNumber);
      
      console.log('Initiating Family Bank STK Push:', {
        phone_number: formattedPhone,
        amount,
        account_reference: accountReference,
        client_id: clientId,
        invoice_id: invoiceId
      });

      const { data, error } = await supabase.functions.invoke('family-bank-stk-push', {
        body: {
          phone_number: formattedPhone,
          amount: amount,
          account_reference: accountReference,
          client_id: clientId,
          invoice_id: invoiceId
        },
      });

      if (error) {
        console.error('Family Bank STK Push error:', error);
        throw error;
      }

      console.log('Family Bank STK Push response:', data);

      if (data?.success) {
        setTransactionId(data.transaction_id);
        toast({
          title: "Payment Initiated",
          description: data.customer_message || "Please check your phone for the Family Bank payment prompt.",
        });
        
        // Start monitoring payment status
        monitorPaymentStatus(data.transaction_id);
      } else {
        throw new Error(data?.message || 'Failed to initiate payment');
      }
    } catch (error) {
      console.error('Family Bank payment error:', error);
      setPaymentStatus('failed');
      toast({
        title: "Payment Failed",
        description: error.message || "Failed to initiate payment. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const monitorPaymentStatus = (thirdPartyTransId: string) => {
    // Prevent multiple polling instances
    if (isPollingRef.current) {
      console.log('Polling already in progress, skipping');
      return;
    }

    isPollingRef.current = true;
    console.log('Starting payment monitoring for:', thirdPartyTransId);
    
    let attempts = 0;
    const maxAttempts = 120; // 20 minutes with 10-second intervals
    
    const pollStatus = async () => {
      if (!isPollingRef.current) {
        console.log('Polling cancelled');
        return;
      }

      attempts++;
      console.log(`Polling attempt ${attempts}/${maxAttempts} for transaction:`, thirdPartyTransId);
      
      try {
        // Query the Family Bank STK requests table for status updates
        const { data, error } = await supabase
          .from('family_bank_stk_requests')
          .select('status, response_description, callback_raw, customer_message')
          .eq('third_party_trans_id', thirdPartyTransId)
          .maybeSingle();

        console.log('Poll result:', { data, error, thirdPartyTransId });

        if (error) {
          console.error('Polling error:', error);
          // Continue polling despite errors for a few more attempts
          if (attempts < Math.min(10, maxAttempts) && isPollingRef.current) {
            pollIntervalRef.current = setTimeout(pollStatus, 10000);
          } else {
            handlePollingFailure();
          }
          return;
        }

        if (!data) {
          console.log('No STK request found yet, continuing to poll...');
          if (attempts < maxAttempts && isPollingRef.current) {
            pollIntervalRef.current = setTimeout(pollStatus, 10000);
          } else {
            handlePollingTimeout();
          }
          return;
        }

        // Check the status from the database
        console.log('STK request status:', data.status);
        
        if (data.status === 'success') {
          setPaymentStatus('success');
          toast({
            title: "Payment Successful!",
            description: data.customer_message || "Your payment has been processed successfully.",
          });
          if (onPaymentComplete) {
            onPaymentComplete({ 
              transactionId: thirdPartyTransId,
              callbackData: data.callback_raw 
            });
          }
          cleanup();
        } else if (data.status === 'failed') {
          setPaymentStatus('failed');
          toast({
            title: "Payment Failed",
            description: data.response_description || data.customer_message || "Payment was cancelled or failed.",
            variant: "destructive",
          });
          cleanup();
        } else if (attempts < maxAttempts && isPollingRef.current) {
          // Status is still pending, continue polling
          pollIntervalRef.current = setTimeout(pollStatus, 10000);
        } else {
          handlePollingTimeout();
        }
      } catch (error) {
        console.error('Error polling payment status:', error);
        if (attempts < maxAttempts && isPollingRef.current) {
          pollIntervalRef.current = setTimeout(pollStatus, 10000);
        } else {
          handlePollingFailure();
        }
      }
    };

    const handlePollingTimeout = () => {
      setPaymentStatus('failed');
      toast({
        title: "Payment Verification Timeout",
        description: "We couldn't verify your payment status. If you completed the payment, please contact support with transaction ID: " + thirdPartyTransId,
        variant: "destructive",
      });
      cleanup();
    };

    const handlePollingFailure = () => {
      setPaymentStatus('failed');
      toast({
        title: "Payment Verification Error",
        description: "Unable to verify payment status due to a technical error. Please contact support if you made the payment.",
        variant: "destructive",
      });
      cleanup();
    };

    // Start polling immediately, then continue every 10 seconds
    pollStatus();

    // Final timeout after 20 minutes
    timeoutRef.current = setTimeout(() => {
      if (paymentStatus === 'pending' && isPollingRef.current) {
        handlePollingTimeout();
      }
    }, 1200000); // 20 minutes timeout
  };

  // Cleanup on component unmount
  React.useEffect(() => {
    return () => {
      cleanup();
    };
  }, []);

  const getStatusIcon = () => {
    switch (paymentStatus) {
      case 'pending':
        return <Clock className="h-5 w-5 text-yellow-600 animate-spin" />;
      case 'success':
        return <CheckCircle className="h-5 w-5 text-green-600" />;
      case 'failed':
        return <AlertCircle className="h-5 w-5 text-red-600" />;
      default:
        return <Smartphone className="h-5 w-5 text-blue-600" />;
    }
  };

  const getStatusText = () => {
    switch (paymentStatus) {
      case 'pending':
        return 'Processing payment...';
      case 'success':
        return 'Payment successful!';
      case 'failed':
        return 'Payment failed';
      default:
        return 'Ready to pay';
    }
  };

  const resetPayment = () => {
    cleanup();
    setPaymentStatus('idle');
    setTransactionId('');
    setPhoneNumber('');
  };

  return (
    <Card className="w-full max-w-md mx-auto">
      <CardHeader className="text-center">
        <CardTitle className="flex items-center justify-center gap-2">
          <Smartphone className="h-6 w-6 text-purple-600" />
          Family Bank Payment
        </CardTitle>
        <div className="text-2xl font-bold text-purple-600">
          {formatKenyanCurrency(amount)}
        </div>
      </CardHeader>
      
      <CardContent className="space-y-4">
        {paymentStatus === 'idle' && (
          <>
            <div className="space-y-2">
              <Label htmlFor="phone">Phone Number</Label>
              <Input
                id="phone"
                type="tel"
                placeholder="0712345678 or 254712345678"
                value={phoneNumber}
                onChange={(e) => setPhoneNumber(e.target.value)}
                className="text-center"
              />
              <p className="text-sm text-gray-600">
                Enter your Family Bank registered phone number
              </p>
            </div>
            
            <Button
              onClick={initiatePayment}
              disabled={isLoading || !phoneNumber}
              className="w-full bg-purple-600 hover:bg-purple-700"
            >
              {isLoading ? 'Initiating...' : `Pay ${formatKenyanCurrency(amount)}`}
            </Button>
          </>
        )}

        {paymentStatus !== 'idle' && (
          <div className="text-center space-y-4">
            <div className="flex items-center justify-center gap-2">
              {getStatusIcon()}
              <Badge variant={paymentStatus === 'success' ? 'default' : paymentStatus === 'failed' ? 'destructive' : 'secondary'}>
                {getStatusText()}
              </Badge>
            </div>
            
            {transactionId && (
              <div className="text-sm text-gray-600">
                <p>Transaction ID: {transactionId}</p>
              </div>
            )}

            {paymentStatus === 'pending' && (
              <div className="text-sm text-gray-600 space-y-1">
                <p>A payment prompt has been sent to {phoneNumber}</p>
                <p>Please check your phone and enter your PIN to complete the payment</p>
                <p className="text-xs text-orange-600">
                  Payment verification may take a few minutes. Please be patient.
                </p>
              </div>
            )}

            {(paymentStatus === 'failed' || paymentStatus === 'success') && (
              <Button
                onClick={resetPayment}
                variant="outline"
                className="w-full"
              >
                {paymentStatus === 'failed' ? 'Try Again' : 'Make Another Payment'}
              </Button>
            )}
          </div>
        )}

        <div className="text-xs text-gray-500 text-center">
          <p>Powered by Family Bank</p>
          <p>Account Reference: {accountReference}</p>
        </div>
      </CardContent>
    </Card>
  );
};

export default FamilyBankPayment;
