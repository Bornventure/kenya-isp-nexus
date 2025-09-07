import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { CreditCard, Loader2, CheckCircle, XCircle, AlertCircle } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';

interface PaymentTestRequest {
  gateway: 'mpesa' | 'family_bank';
  phoneNumber: string;
  amount: string;
  reference: string;
}

interface TestResult {
  success: boolean;
  message: string;
  details?: any;
  transactionId?: string;
}

export const PaymentGatewayTestingCard = () => {
  const [testData, setTestData] = useState<PaymentTestRequest>({
    gateway: 'mpesa',
    phoneNumber: '',
    amount: '10',
    reference: ''
  });
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [testResult, setTestResult] = useState<TestResult | null>(null);
  const { toast } = useToast();

  const handleSTKPushTest = async () => {
    if (!testData.phoneNumber || !testData.amount) {
      toast({
        title: "Validation Error",
        description: "Please fill in phone number and amount",
        variant: "destructive"
      });
      return;
    }

    setIsLoading(true);
    setIsDialogOpen(true);
    setTestResult(null);

    try {
      let result;
      
      if (testData.gateway === 'mpesa') {
        const { data, error } = await supabase.functions.invoke('mpesa-stk-push', {
          body: {
            phone: testData.phoneNumber,
            amount: parseFloat(testData.amount),
            account_reference: testData.reference || 'TEST_REF',
            transaction_description: 'Payment Gateway Test'
          }
        });

        if (error) throw error;
        result = data;
      } else {
        // For Family Bank, we need different parameters
        const { data, error } = await supabase.functions.invoke('family-bank-stk-push', {
          body: {
            client_id: 'test-client-id', // Use a test client ID
            invoice_id: null,
            amount: parseFloat(testData.amount),
            phone_number: testData.phoneNumber,
            account_reference: testData.reference || 'TEST_REF'
          }
        });

        if (error) throw error;
        result = data;
      }

      setTestResult({
        success: result.success || result.ResponseCode === '0',
        message: result.success ? 'STK Push initiated successfully' : result.message || 'STK Push failed',
        details: result,
        transactionId: result.CheckoutRequestID || result.checkoutRequestId || result.transaction_id
      });

      toast({
        title: result.success ? "STK Push Sent" : "STK Push Failed",
        description: result.success ? "Check your phone for the payment prompt" : result.message,
        variant: result.success ? "default" : "destructive"
      });
    } catch (error: any) {
      console.error('Payment gateway test error:', error);
      setTestResult({
        success: false,
        message: error.message || 'Failed to initiate STK push',
        details: error
      });

      toast({
        title: "Test Failed",
        description: "Check the dialog for error details",
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleStatusCheck = async () => {
    if (!testResult?.transactionId) {
      toast({
        title: "No Transaction ID",
        description: "Please initiate an STK push first",
        variant: "destructive"
      });
      return;
    }

    setIsLoading(true);

    try {
      let requestBody;
      if (testData.gateway === 'mpesa') {
        requestBody = {
          checkoutRequestId: testResult.transactionId,
          paymentMethod: 'mpesa'
        };
      } else {
        requestBody = {
          third_party_trans_id: testResult.transactionId,
          paymentMethod: 'family_bank'
        };
      }

      const { data, error } = await supabase.functions.invoke('check-payment-status', {
        body: requestBody
      });

      if (error) throw error;

      setTestResult(prev => ({
        ...prev!,
        details: { ...prev!.details, statusCheck: data }
      }));

      toast({
        title: "Status Updated",
        description: `Payment status: ${data.status || 'Unknown'}`
      });
    } catch (error: any) {
      console.error('Status check error:', error);
      toast({
        title: "Status Check Failed",
        description: error.message,
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <>
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <CreditCard className="h-5 w-5 text-primary" />
            Payment Gateway Testing (Super Admin)
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="gateway">Payment Gateway</Label>
              <Select
                value={testData.gateway}
                onValueChange={(value: 'mpesa' | 'family_bank') => 
                  setTestData(prev => ({ ...prev, gateway: value }))
                }
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select gateway" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="mpesa">
                    <div className="flex items-center gap-2">
                      M-Pesa STK Push
                      <Badge variant="secondary">Active</Badge>
                    </div>
                  </SelectItem>
                  <SelectItem value="family_bank">
                    <div className="flex items-center gap-2">
                      Family Bank STK Push
                      <Badge variant="secondary">Active</Badge>
                    </div>
                  </SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="phone-number">Test Phone Number</Label>
              <Input
                id="phone-number"
                placeholder="254XXXXXXXXX"
                value={testData.phoneNumber}
                onChange={(e) => setTestData(prev => ({ ...prev, phoneNumber: e.target.value }))}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="amount">Amount (KES)</Label>
              <Input
                id="amount"
                type="number"
                placeholder="10"
                value={testData.amount}
                onChange={(e) => setTestData(prev => ({ ...prev, amount: e.target.value }))}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="reference">Reference (Optional)</Label>
              <Input
                id="reference"
                placeholder="TEST_REF"
                value={testData.reference}
                onChange={(e) => setTestData(prev => ({ ...prev, reference: e.target.value }))}
              />
            </div>
          </div>

          <div className="flex flex-col sm:flex-row gap-2">
            <Button 
              onClick={handleSTKPushTest}
              disabled={isLoading}
              className="flex-1"
            >
              {isLoading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Testing STK Push...
                </>
              ) : (
                <>
                  <CreditCard className="mr-2 h-4 w-4" />
                  Test STK Push
                </>
              )}
            </Button>

            {testResult?.transactionId && (
              <Button 
                onClick={handleStatusCheck}
                disabled={isLoading}
                variant="outline"
                className="flex-1"
              >
                {isLoading ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Checking...
                  </>
                ) : (
                  <>
                    <AlertCircle className="mr-2 h-4 w-4" />
                    Check Status
                  </>
                )}
              </Button>
            )}
          </div>

          <div className="p-3 rounded-lg bg-muted">
            <p className="text-sm text-muted-foreground">
              <strong>Note:</strong> This will initiate a real payment request. Use small amounts (like KES 10) for testing.
              The payment prompt will appear on the specified phone number.
            </p>
          </div>
        </CardContent>
      </Card>

      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              {isLoading ? (
                <Loader2 className="h-5 w-5 animate-spin" />
              ) : testResult?.success ? (
                <CheckCircle className="h-5 w-5 text-green-500" />
              ) : (
                <XCircle className="h-5 w-5 text-red-500" />
              )}
              Payment Gateway Test Results
            </DialogTitle>
            <DialogDescription>
              View the results of your payment gateway test.
            </DialogDescription>
          </DialogHeader>
          
          <div className="space-y-4">
            {isLoading ? (
              <div className="text-center py-4">
                <p className="text-muted-foreground">Testing payment gateway...</p>
              </div>
            ) : testResult ? (
              <div className="space-y-3">
                <div className="p-3 rounded-lg bg-muted">
                  <p className="font-medium">Gateway:</p>
                  <p className="capitalize">{testData.gateway.replace('_', ' ')}</p>
                </div>

                <div className="p-3 rounded-lg bg-muted">
                  <p className="font-medium">Result:</p>
                  <p className={testResult.success ? "text-green-600" : "text-red-600"}>
                    {testResult.message}
                  </p>
                </div>

                {testResult.transactionId && (
                  <div className="p-3 rounded-lg bg-muted">
                    <p className="font-medium">Transaction ID:</p>
                    <p className="font-mono text-sm">{testResult.transactionId}</p>
                  </div>
                )}
                
                {testResult.details && (
                  <div className="p-3 rounded-lg bg-muted">
                    <p className="font-medium mb-2">Technical Details:</p>
                    <pre className="text-xs overflow-auto max-h-40 bg-background p-2 rounded border">
                      {JSON.stringify(testResult.details, null, 2)}
                    </pre>
                  </div>
                )}

                {testResult.success && (
                  <div className="p-3 rounded-lg bg-green-50 dark:bg-green-950 border border-green-200 dark:border-green-800">
                    <p className="text-green-800 dark:text-green-200 text-sm">
                      ✅ STK push sent successfully! Check the phone {testData.phoneNumber} for the payment prompt.
                      Use the "Check Status" button above to verify the payment status.
                    </p>
                  </div>
                )}
                
                <div className="flex justify-end gap-2">
                  {testResult.transactionId && (
                    <Button onClick={handleStatusCheck} variant="outline" disabled={isLoading}>
                      Check Status
                    </Button>
                  )}
                  <Button onClick={() => setIsDialogOpen(false)}>
                    Close
                  </Button>
                </div>
              </div>
            ) : null}
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
};