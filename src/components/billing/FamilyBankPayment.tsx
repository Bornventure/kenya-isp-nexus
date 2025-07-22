
import React, { useState } from 'react';
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

  const initiatePayment = async () => {
    if (!validatePhoneNumber(phoneNumber)) {
      toast({
        title: "Invalid Phone Number",
        description: "Please enter a valid Kenyan phone number (e.g., 0712345678)",
        variant: "destructive",
      });
      return;
    }

    setIsLoading(true);
    setPaymentStatus('pending');

    try {
      const formattedPhone = formatPhoneNumber(phoneNumber);
      
      console.log('Initiating Family Bank STK Push:', {
        phone: formattedPhone,
        amount,
        accountRef: accountReference,
        clientId,
        invoiceId
      });

      const { data, error } = await supabase.functions.invoke('family-bank-stk-push', {
        body: {
          phone: formattedPhone,
          amount: amount,
          accountRef: accountReference,
          clientId: clientId,
          invoiceId: invoiceId,
          ispCompanyId: null // Will be set by the function
        },
      });

      if (error) {
        throw error;
      }

      console.log('Family Bank STK Push response:', data);

      if (data?.success) {
        setTransactionId(data.ThirdPartyTransID);
        toast({
          title: "Payment Initiated",
          description: "Please check your phone for the Family Bank payment prompt.",
        });
        
        // Start monitoring payment status with multiple methods
        monitorPaymentStatus(data.ThirdPartyTransID);
      } else {
        throw new Error(data?.ResponseDescription || 'Failed to initiate payment');
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
    let timeoutId: NodeJS.Timeout;
    let pollIntervalId: NodeJS.Timeout;
    let channelSubscribed = false;
    
    console.log('Starting payment monitoring for:', thirdPartyTransId);
    
    // Method 1: Try realtime subscription first
    const channel = supabase
      .channel(`family_bank_payment_${thirdPartyTransId}_${Date.now()}`)
      .on(
        'postgres_changes',
        {
          event: 'UPDATE',
          schema: 'public',
          table: 'family_bank_stk_requests',
          filter: `third_party_trans_id=eq.${thirdPartyTransId}`
        },
        (payload) => {
          console.log('Realtime payment status update received:', payload);
          const newRecord = payload.new;
          
          if (newRecord?.status === 'success') {
            setPaymentStatus('success');
            toast({
              title: "Payment Successful!",
              description: "Your payment has been processed successfully.",
            });
            if (onPaymentComplete) {
              onPaymentComplete({ transactionId: thirdPartyTransId });
            }
            cleanup();
          } else if (newRecord?.status === 'failed') {
            setPaymentStatus('failed');
            toast({
              title: "Payment Failed",
              description: newRecord.response_description || "Payment was cancelled or failed.",
              variant: "destructive",
            });
            cleanup();
          }
        }
      )
      .subscribe((status) => {
        console.log('Realtime subscription status:', status);
        if (status === 'SUBSCRIBED') {
          channelSubscribed = true;
          console.log('Successfully subscribed to realtime updates');
        }
      });

    // Method 2: Fallback polling (starts after 10 seconds if realtime not working)
    const startPolling = () => {
      console.log('Starting polling fallback');
      let attempts = 0;
      const maxAttempts = 30; // 5 minutes with 10-second intervals
      
      const pollStatus = async () => {
        attempts++;
        console.log(`Polling attempt ${attempts}/${maxAttempts}`);
        
        try {
          // Use service role for direct query to avoid RLS issues
          const { data, error } = await supabase
            .from('family_bank_stk_requests')
            .select('status, response_description')
            .eq('third_party_trans_id', thirdPartyTransId)
            .single();

          console.log('Poll result:', { data, error });

          if (error) {
            console.error('Polling error:', error);
            return;
          }

          if (data?.status === 'success') {
            setPaymentStatus('success');
            toast({
              title: "Payment Successful!",
              description: "Your payment has been processed successfully.",
            });
            if (onPaymentComplete) {
              onPaymentComplete({ transactionId: thirdPartyTransId });
            }
            cleanup();
          } else if (data?.status === 'failed') {
            setPaymentStatus('failed');
            toast({
              title: "Payment Failed",
              description: data.response_description || "Payment was cancelled or failed.",
              variant: "destructive",
            });
            cleanup();
          } else if (attempts < maxAttempts) {
            pollIntervalId = setTimeout(pollStatus, 10000);
          }
        } catch (error) {
          console.error('Error polling payment status:', error);
          if (attempts < maxAttempts) {
            pollIntervalId = setTimeout(pollStatus, 10000);
          }
        }
      };
      
      pollStatus();
    };

    // Start polling after 10 seconds if realtime isn't working
    setTimeout(() => {
      if (!channelSubscribed || paymentStatus === 'pending') {
        console.log('Realtime not working or status still pending, starting polling');
        startPolling();
      }
    }, 10000);

    // Cleanup function
    const cleanup = () => {
      console.log('Cleaning up payment monitoring');
      if (timeoutId) clearTimeout(timeoutId);
      if (pollIntervalId) clearTimeout(pollIntervalId);
      supabase.removeChannel(channel);
    };

    // Final timeout after 10 minutes
    timeoutId = setTimeout(() => {
      if (paymentStatus === 'pending') {
        setPaymentStatus('failed');
        toast({
          title: "Payment Timeout",
          description: "Payment verification timed out. Please contact support if you made the payment.",
          variant: "destructive",
        });
      }
      cleanup();
    }, 600000); // 10 minutes timeout
  };

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
              </div>
            )}

            {(paymentStatus === 'failed' || paymentStatus === 'success') && (
              <Button
                onClick={() => {
                  setPaymentStatus('idle');
                  setTransactionId('');
                  setPhoneNumber('');
                }}
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
