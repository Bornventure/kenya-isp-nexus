
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useToast } from '@/hooks/use-toast';
import { usePaymentStatus } from '@/hooks/usePaymentStatus';
import { supabase } from '@/integrations/supabase/client';
import { Loader2, CreditCard, CheckCircle } from 'lucide-react';

interface MpesaPaymentFormProps {
  amount: number;
  onSuccess: () => void;
  onCancel: () => void;
  clientId?: string;
}

const MpesaPaymentForm: React.FC<MpesaPaymentFormProps> = ({ 
  amount, 
  onSuccess, 
  onCancel, 
  clientId 
}) => {
  const [phoneNumber, setPhoneNumber] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);
  const [paymentInitiated, setPaymentInitiated] = useState(false);
  const { toast } = useToast();
  const { startPaymentMonitoring, isMonitoring } = usePaymentStatus();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!phoneNumber || phoneNumber.length < 10) {
      toast({
        title: "Invalid Phone Number",
        description: "Please enter a valid phone number",
        variant: "destructive",
      });
      return;
    }

    setIsProcessing(true);
    try {
      // Initiate STK push
      const { data: stkResponse, error } = await supabase.functions.invoke('mpesa-stk-push', {
        body: {
          phone: phoneNumber,
          amount: amount,
          accountReference: 'WALLET_TOPUP',
          transactionDesc: 'Wallet Top Up'
        }
      });

      if (error) throw error;

      if (stkResponse && stkResponse.ResponseCode === "0") {
        setPaymentInitiated(true);
        
        // Start monitoring payment status
        await startPaymentMonitoring(
          'wallet-topup',
          stkResponse.CheckoutRequestID,
          {
            onSuccess: () => {
              toast({
                title: "Payment Successful",
                description: "Your wallet has been topped up successfully!",
              });
              onSuccess();
            },
            onFailure: (error) => {
              toast({
                title: "Payment Failed",
                description: error || "Payment was not completed",
                variant: "destructive",
              });
              setPaymentInitiated(false);
            }
          },
          clientId,
          amount
        );
        
        toast({
          title: "Payment Request Sent",
          description: "Please check your phone and enter your M-Pesa PIN to complete the payment",
        });
      } else {
        throw new Error(stkResponse?.errorMessage || 'Failed to initiate payment');
      }
    } catch (error: any) {
      console.error('Payment initiation error:', error);
      toast({
        title: "Payment Failed",
        description: error.message || "Failed to initiate payment",
        variant: "destructive",
      });
      setPaymentInitiated(false);
    } finally {
      setIsProcessing(false);
    }
  };

  if (paymentInitiated) {
    return (
      <Card className="w-full max-w-md mx-auto">
        <CardHeader className="text-center">
          <CardTitle className="flex items-center justify-center gap-2">
            <Loader2 className="h-5 w-5 animate-spin" />
            Payment in Progress
          </CardTitle>
        </CardHeader>
        <CardContent className="text-center space-y-4">
          <div className="p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
            <p className="text-sm">
              Please check your phone and enter your M-Pesa PIN to complete the payment of <strong>KES {amount}</strong>
            </p>
          </div>
          
          <div className="space-y-2">
            <div className="flex items-center justify-center gap-2 text-sm text-gray-600 dark:text-gray-300">
              <CheckCircle className="h-4 w-4" />
              Payment request sent to {phoneNumber}
            </div>
            <div className="text-xs text-gray-500">
              {isMonitoring ? 'Monitoring payment status...' : 'Waiting for payment confirmation...'}
            </div>
          </div>
          
          <Button 
            variant="outline" 
            onClick={() => {
              setPaymentInitiated(false);
              onCancel();
            }}
            className="w-full"
          >
            Cancel Payment
          </Button>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="w-full max-w-md mx-auto">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <CreditCard className="h-5 w-5" />
          M-Pesa Payment
        </CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <Label htmlFor="amount">Amount (KES)</Label>
            <Input
              id="amount"
              type="number"
              value={amount}
              readOnly
              className="bg-gray-50 dark:bg-gray-800"
            />
          </div>
          
          <div>
            <Label htmlFor="phone">Phone Number</Label>
            <Input
              id="phone"
              type="tel"
              value={phoneNumber}
              onChange={(e) => setPhoneNumber(e.target.value)}
              placeholder="254712345678"
              required
            />
            <p className="text-xs text-gray-500 mt-1">
              Enter your M-Pesa registered phone number
            </p>
          </div>
          
          <div className="flex gap-3">
            <Button 
              type="button" 
              variant="outline" 
              onClick={onCancel}
              className="flex-1"
            >
              Cancel
            </Button>
            <Button 
              type="submit" 
              disabled={isProcessing}
              className="flex-1"
            >
              {isProcessing ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin mr-2" />
                  Processing...
                </>
              ) : (
                'Pay Now'
              )}
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
};

export default MpesaPaymentForm;
