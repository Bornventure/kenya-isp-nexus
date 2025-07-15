
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useToast } from '@/hooks/use-toast';
import { useMpesa } from '@/hooks/useMpesa';
import { usePaymentStatus } from '@/hooks/usePaymentStatus';
import { Loader2, Smartphone, CreditCard } from 'lucide-react';

interface MpesaPaymentFormProps {
  amount: number;
  onSuccess?: () => void;
  onCancel?: () => void;
}

const MpesaPaymentForm: React.FC<MpesaPaymentFormProps> = ({ 
  amount, 
  onSuccess, 
  onCancel 
}) => {
  const [phoneNumber, setPhoneNumber] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);
  const { toast } = useToast();
  const { initiateSTKPush, isLoading } = useMpesa();
  const { checkPaymentStatus } = usePaymentStatus();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!phoneNumber) {
      toast({
        title: "Error",
        description: "Please enter your phone number",
        variant: "destructive",
      });
      return;
    }

    // Format phone number to international format
    const formattedPhone = phoneNumber.startsWith('254') 
      ? phoneNumber 
      : phoneNumber.startsWith('0') 
        ? `254${phoneNumber.slice(1)}`
        : `254${phoneNumber}`;

    try {
      setIsProcessing(true);
      
      const response = await initiateSTKPush({
        phoneNumber: formattedPhone,
        amount: amount,
        accountReference: formattedPhone,
        transactionDesc: `Wallet top-up - KES ${amount}`,
      });

      if (response.success) {
        toast({
          title: "Payment Initiated",
          description: "Please check your phone for the M-Pesa prompt",
        });

        // Start checking payment status
        const checkoutRequestId = response.checkoutRequestId;
        if (checkoutRequestId) {
          // Check payment status every 5 seconds for up to 2 minutes
          const statusInterval = setInterval(async () => {
            try {
              const status = await checkPaymentStatus(checkoutRequestId);
              if (status.success) {
                clearInterval(statusInterval);
                toast({
                  title: "Payment Successful",
                  description: "Your wallet has been topped up successfully",
                });
                onSuccess?.();
              } else if (status.failed) {
                clearInterval(statusInterval);
                toast({
                  title: "Payment Failed",
                  description: status.message || "Payment was not completed",
                  variant: "destructive",
                });
              }
            } catch (error) {
              console.error('Error checking payment status:', error);
            }
          }, 5000);

          // Clear interval after 2 minutes
          setTimeout(() => {
            clearInterval(statusInterval);
          }, 120000);
        }
      } else {
        throw new Error(response.message || 'Payment initiation failed');
      }
    } catch (error) {
      console.error('Payment error:', error);
      toast({
        title: "Payment Error",
        description: error instanceof Error ? error.message : "Failed to initiate payment",
        variant: "destructive",
      });
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <Card className="w-full max-w-md mx-auto">
      <CardHeader className="text-center">
        <div className="flex justify-center mb-4">
          <div className="p-3 bg-green-100 dark:bg-green-900 rounded-full">
            <Smartphone className="h-6 w-6 text-green-600 dark:text-green-400" />
          </div>
        </div>
        <CardTitle className="text-xl font-bold text-gray-900 dark:text-gray-100">
          M-Pesa Payment
        </CardTitle>
        <p className="text-gray-600 dark:text-gray-300">
          Top up your wallet with KES {amount.toFixed(2)}
        </p>
      </CardHeader>
      
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <Label htmlFor="phone" className="text-sm font-medium">
              M-Pesa Phone Number
            </Label>
            <Input
              id="phone"
              type="tel"
              placeholder="0700000000"
              value={phoneNumber}
              onChange={(e) => setPhoneNumber(e.target.value)}
              className="mt-1"
              required
            />
            <p className="text-xs text-gray-500 mt-1">
              Enter your Safaricom number registered with M-Pesa
            </p>
          </div>

          <div className="bg-gray-50 dark:bg-gray-800 p-4 rounded-lg">
            <div className="flex items-center gap-2 mb-2">
              <CreditCard className="h-4 w-4 text-gray-600 dark:text-gray-400" />
              <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                Payment Summary
              </span>
            </div>
            <div className="space-y-1 text-sm">
              <div className="flex justify-between">
                <span className="text-gray-600 dark:text-gray-400">Amount:</span>
                <span className="font-medium">KES {amount.toFixed(2)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600 dark:text-gray-400">Payment Method:</span>
                <span className="font-medium">M-Pesa</span>
              </div>
            </div>
          </div>

          <div className="flex gap-3">
            <Button
              type="submit"
              disabled={isLoading || isProcessing}
              className="flex-1 bg-green-600 hover:bg-green-700 text-white"
            >
              {isLoading || isProcessing ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Processing...
                </>
              ) : (
                <>
                  <Smartphone className="h-4 w-4 mr-2" />
                  Pay Now
                </>
              )}
            </Button>
            
            {onCancel && (
              <Button
                type="button"
                variant="outline"
                onClick={onCancel}
                disabled={isLoading || isProcessing}
              >
                Cancel
              </Button>
            )}
          </div>
        </form>

        <div className="mt-6 p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
          <p className="text-xs text-blue-800 dark:text-blue-200">
            <strong>Instructions:</strong> After clicking "Pay Now", you'll receive an M-Pesa prompt on your phone. 
            Enter your M-Pesa PIN to complete the payment. The transaction will be processed automatically.
          </p>
        </div>
      </CardContent>
    </Card>
  );
};

export default MpesaPaymentForm;
