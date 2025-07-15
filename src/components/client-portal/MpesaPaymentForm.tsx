
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { useClientAuth } from '@/contexts/ClientAuthContext';
import { useMpesa } from '@/hooks/useMpesa';
import { usePaymentStatus } from '@/hooks/usePaymentStatus';
import { formatKenyanCurrency } from '@/utils/kenyanValidation';
import { Loader2, CreditCard, CheckCircle, XCircle } from 'lucide-react';

const MpesaPaymentForm: React.FC = () => {
  const { client, refreshClientData } = useClientAuth();
  const { processPayment, isLoading } = useMpesa();
  const { startPaymentMonitoring, isMonitoring } = usePaymentStatus();
  const [amount, setAmount] = useState('');
  const [mpesaNumber, setMpesaNumber] = useState('');
  const [paymentStatus, setPaymentStatus] = useState<{
    status: 'idle' | 'processing' | 'success' | 'failed';
    message: string;
  }>({ status: 'idle', message: '' });

  React.useEffect(() => {
    if (client?.mpesa_number || client?.phone) {
      setMpesaNumber(client.mpesa_number || client.phone);
    }
  }, [client]);

  const handlePayment = async () => {
    if (!client || !amount || !mpesaNumber) return;

    const paymentAmount = parseFloat(amount);
    if (paymentAmount <= 0) return;

    setPaymentStatus({ status: 'processing', message: 'Initiating payment...' });

    try {
      const response = await processPayment({
        phoneNumber: mpesaNumber,
        amount: paymentAmount,
        accountReference: client.id_number,
        transactionDesc: `Wallet topup for ${client.name}`
      });

      if (response?.success && response.data?.CheckoutRequestID) {
        setPaymentStatus({ 
          status: 'processing', 
          message: 'Payment request sent. Please check your phone and complete the M-Pesa transaction.' 
        });

        // Start monitoring payment status
        startPaymentMonitoring(
          response.data.CheckoutRequestID, // Use as invoice ID for now
          response.data.CheckoutRequestID,
          {
            onSuccess: async (statusData) => {
              setPaymentStatus({ 
                status: 'success', 
                message: 'Payment successful! Your wallet has been updated.' 
              });
              
              // Refresh client data to show updated wallet balance
              await refreshClientData();
              
              // Reset form
              setAmount('');
              
              // Clear success message after 5 seconds
              setTimeout(() => {
                setPaymentStatus({ status: 'idle', message: '' });
              }, 5000);
            },
            onFailure: (statusData) => {
              setPaymentStatus({ 
                status: 'failed', 
                message: statusData.message || 'Payment failed. Please try again.' 
              });
            },
            onTimeout: () => {
              setPaymentStatus({ 
                status: 'failed', 
                message: 'Payment status could not be confirmed. Please check your account or contact support.' 
              });
            }
          }
        );
      } else {
        throw new Error(response?.error || 'Payment initiation failed');
      }
    } catch (error: any) {
      setPaymentStatus({ 
        status: 'failed', 
        message: error.message || 'Payment failed. Please try again.' 
      });
    }
  };

  const getStatusIcon = () => {
    switch (paymentStatus.status) {
      case 'processing':
        return <Loader2 className="h-4 w-4 animate-spin" />;
      case 'success':
        return <CheckCircle className="h-4 w-4 text-green-600" />;
      case 'failed':
        return <XCircle className="h-4 w-4 text-red-600" />;
      default:
        return null;
    }
  };

  const getStatusColor = () => {
    switch (paymentStatus.status) {
      case 'success':
        return 'border-green-200 bg-green-50';
      case 'failed':
        return 'border-red-200 bg-red-50';
      default:
        return 'border-blue-200 bg-blue-50';
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <CreditCard className="h-5 w-5" />
          M-Pesa Payment
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="amount">Amount (KES)</Label>
          <Input
            id="amount"
            type="number"
            placeholder="Enter amount"
            value={amount}
            onChange={(e) => setAmount(e.target.value)}
            disabled={isLoading || isMonitoring}
            min="1"
            step="1"
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="mpesa-number">M-Pesa Number</Label>
          <Input
            id="mpesa-number"
            type="tel"
            placeholder="254700000000"
            value={mpesaNumber}
            onChange={(e) => setMpesaNumber(e.target.value)}
            disabled={isLoading || isMonitoring}
          />
        </div>

        {paymentStatus.status !== 'idle' && (
          <Alert className={getStatusColor()}>
            <div className="flex items-center gap-2">
              {getStatusIcon()}
              <AlertDescription>{paymentStatus.message}</AlertDescription>
            </div>
          </Alert>
        )}

        <Button 
          onClick={handlePayment} 
          disabled={isLoading || isMonitoring || !amount || !mpesaNumber}
          className="w-full"
        >
          {isLoading || isMonitoring ? (
            <>
              <Loader2 className="h-4 w-4 mr-2 animate-spin" />
              {isLoading ? 'Processing...' : 'Monitoring Payment...'}
            </>
          ) : (
            <>
              <CreditCard className="h-4 w-4 mr-2" />
              Pay {amount ? formatKenyanCurrency(parseFloat(amount)) : 'Now'}
            </>
          )}
        </Button>

        <div className="text-xs text-gray-500 space-y-1">
          <p>• You will receive an STK push notification on your phone</p>
          <p>• Enter your M-Pesa PIN to complete the transaction</p>
          <p>• Your wallet will be updated automatically after payment</p>
        </div>
      </CardContent>
    </Card>
  );
};

export default MpesaPaymentForm;
