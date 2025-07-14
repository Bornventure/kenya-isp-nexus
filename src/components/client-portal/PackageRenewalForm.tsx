
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { useClientAuth } from '@/contexts/ClientAuthContext';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { formatKenyanCurrency } from '@/utils/kenyanValidation';
import { Loader2, CreditCard, RefreshCw } from 'lucide-react';

const PackageRenewalForm: React.FC = () => {
  const { client, refreshClientData } = useClientAuth();
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);
  const [mpesaNumber, setMpesaNumber] = useState('');
  const [paymentStatus, setPaymentStatus] = useState<{
    status: string;
    checkoutRequestId?: string;
    message?: string;
  } | null>(null);

  React.useEffect(() => {
    if (client?.mpesa_number || client?.phone) {
      setMpesaNumber(client.mpesa_number || client.phone);
    }
  }, [client]);

  const handleRenewal = async () => {
    if (!client) return;
    
    if (!mpesaNumber) {
      toast({
        title: "Error",
        description: "Please enter your M-Pesa number",
        variant: "destructive",
      });
      return;
    }

    setLoading(true);
    setPaymentStatus(null);

    try {
      const { data, error } = await supabase.functions.invoke('package-renewal', {
        body: {
          client_email: client.email,
          client_id_number: client.id_number,
          mpesa_number: mpesaNumber,
        }
      });

      if (error) throw error;

      if (data?.success) {
        setPaymentStatus({
          status: 'initiated',
          checkoutRequestId: data.data?.checkout_request_id,
          message: 'Payment request sent to your phone. Please complete the M-Pesa transaction.'
        });
        
        toast({
          title: "Payment Initiated",
          description: "Check your phone for M-Pesa payment prompt",
        });

        // Start polling for payment status
        pollPaymentStatus(data.data?.checkout_request_id);
      } else {
        throw new Error(data?.error || 'Payment initiation failed');
      }
    } catch (error: any) {
      console.error('Renewal error:', error);
      toast({
        title: "Error",
        description: error.message || "Failed to initiate payment. Please try again.",
        variant: "destructive",
      });
      setPaymentStatus({
        status: 'failed',
        message: error.message || 'Payment failed'
      });
    } finally {
      setLoading(false);
    }
  };

  const pollPaymentStatus = async (checkoutRequestId: string) => {
    if (!checkoutRequestId) return;

    const maxAttempts = 30; // 5 minutes of polling
    let attempts = 0;

    const pollInterval = setInterval(async () => {
      attempts++;
      
      try {
        const { data } = await supabase.functions.invoke('check-payment-status', {
          body: { checkout_request_id: checkoutRequestId }
        });

        if (data?.success && data?.status === 'completed') {
          clearInterval(pollInterval);
          setPaymentStatus({
            status: 'completed',
            message: 'Payment successful! Your service has been renewed.'
          });
          
          toast({
            title: "Payment Successful",
            description: "Your package has been renewed successfully!",
          });

          // Refresh client data to show updated status
          await refreshClientData();
        } else if (data?.status === 'failed') {
          clearInterval(pollInterval);
          setPaymentStatus({
            status: 'failed',
            message: 'Payment failed. Please try again.'
          });
        }
      } catch (error) {
        console.error('Status check error:', error);
      }

      if (attempts >= maxAttempts) {
        clearInterval(pollInterval);
        setPaymentStatus({
          status: 'timeout',
          message: 'Payment status check timed out. Please check your account or contact support.'
        });
      }
    }, 10000); // Check every 10 seconds
  };

  if (!client) return null;

  const currentPackage = client.service_package;
  const packageAmount = client.monthly_rate;

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <RefreshCw className="h-5 w-5" />
          Renew Package
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {currentPackage && (
          <div className="bg-blue-50 p-4 rounded-lg">
            <h3 className="font-medium text-blue-900">Current Package</h3>
            <p className="text-blue-700">{currentPackage.name}</p>
            <p className="text-sm text-blue-600">Speed: {currentPackage.speed}</p>
            <p className="text-lg font-semibold text-blue-900">
              {formatKenyanCurrency(packageAmount)} / month
            </p>
          </div>
        )}

        <div className="space-y-2">
          <Label htmlFor="mpesa-number">M-Pesa Number</Label>
          <Input
            id="mpesa-number"
            type="tel"
            placeholder="254700000000"
            value={mpesaNumber}
            onChange={(e) => setMpesaNumber(e.target.value)}
            disabled={loading}
          />
          <p className="text-sm text-gray-600">
            Enter the M-Pesa number to receive payment prompt
          </p>
        </div>

        {paymentStatus && (
          <Alert className={
            paymentStatus.status === 'completed' ? 'border-green-200 bg-green-50' :
            paymentStatus.status === 'failed' ? 'border-red-200 bg-red-50' :
            'border-blue-200 bg-blue-50'
          }>
            <AlertDescription>
              {paymentStatus.message}
            </AlertDescription>
          </Alert>
        )}

        <Button 
          onClick={handleRenewal} 
          disabled={loading || !mpesaNumber}
          className="w-full"
        >
          {loading ? (
            <>
              <Loader2 className="h-4 w-4 mr-2 animate-spin" />
              Processing...
            </>
          ) : (
            <>
              <CreditCard className="h-4 w-4 mr-2" />
              Renew for {formatKenyanCurrency(packageAmount)}
            </>
          )}
        </Button>

        <div className="text-xs text-gray-500 space-y-1">
          <p>• Payment will be processed via M-Pesa STK Push</p>
          <p>• Your service will be renewed immediately after payment</p>
          <p>• You will receive an SMS confirmation</p>
        </div>
      </CardContent>
    </Card>
  );
};

export default PackageRenewalForm;
