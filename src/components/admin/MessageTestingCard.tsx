import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { MessageSquare, Loader2, CheckCircle, XCircle } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';

interface TestMessageRequest {
  paymentMethod: 'mpesa' | 'family_bank';
  amount: string;
  message: string;
  phoneNumber: string;
}

interface TestResult {
  success: boolean;
  message: string;
  details?: any;
}

export const MessageTestingCard = () => {
  const [testData, setTestData] = useState<TestMessageRequest>({
    paymentMethod: 'mpesa',
    amount: '',
    message: '',
    phoneNumber: ''
  });
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [testResult, setTestResult] = useState<TestResult | null>(null);
  const { toast } = useToast();

  const handleTestMessage = async () => {
    if (!testData.phoneNumber || !testData.message || !testData.amount) {
      toast({
        title: "Validation Error",
        description: "Please fill in all required fields",
        variant: "destructive"
      });
      return;
    }

    setIsLoading(true);
    setIsDialogOpen(true);
    setTestResult(null);

    try {
      const { data, error } = await supabase.functions.invoke('send-test-message', {
        body: {
          paymentMethod: testData.paymentMethod,
          amount: parseFloat(testData.amount),
          message: testData.message,
          phoneNumber: testData.phoneNumber
        }
      });

      if (error) throw error;

      setTestResult({
        success: true,
        message: 'Test message sent successfully',
        details: data
      });

      toast({
        title: "Test Message Sent",
        description: "Check the dialog for detailed results"
      });
    } catch (error: any) {
      console.error('Test message error:', error);
      setTestResult({
        success: false,
        message: error.message || 'Failed to send test message',
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

  return (
    <>
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <MessageSquare className="h-5 w-5 text-primary" />
            Message Testing (Super Admin)
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="payment-method">Payment Method</Label>
              <Select
                value={testData.paymentMethod}
                onValueChange={(value: 'mpesa' | 'family_bank') => 
                  setTestData(prev => ({ ...prev, paymentMethod: value }))
                }
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select payment method" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="mpesa">M-Pesa</SelectItem>
                  <SelectItem value="family_bank">Family Bank</SelectItem>
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
                placeholder="100"
                value={testData.amount}
                onChange={(e) => setTestData(prev => ({ ...prev, amount: e.target.value }))}
              />
            </div>

            <div className="space-y-2 md:col-span-2">
              <Label htmlFor="message">Test Message</Label>
              <Textarea
                id="message"
                placeholder="Enter your test message here..."
                value={testData.message}
                onChange={(e) => setTestData(prev => ({ ...prev, message: e.target.value }))}
                rows={3}
              />
            </div>
          </div>

          <div className="flex justify-end">
            <Button 
              onClick={handleTestMessage}
              disabled={isLoading}
              className="w-full md:w-auto"
            >
              {isLoading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Sending Test...
                </>
              ) : (
                <>
                  <MessageSquare className="mr-2 h-4 w-4" />
                  Send Test Message
                </>
              )}
            </Button>
          </div>
        </CardContent>
      </Card>

      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              {isLoading ? (
                <Loader2 className="h-5 w-5 animate-spin" />
              ) : testResult?.success ? (
                <CheckCircle className="h-5 w-5 text-green-500" />
              ) : (
                <XCircle className="h-5 w-5 text-red-500" />
              )}
              Test Message Status
            </DialogTitle>
          </DialogHeader>
          
          <div className="space-y-4">
            {isLoading ? (
              <div className="text-center py-4">
                <p className="text-muted-foreground">Sending test message...</p>
              </div>
            ) : testResult ? (
              <div className="space-y-3">
                <div className="p-3 rounded-lg bg-muted">
                  <p className="font-medium">Result:</p>
                  <p className={testResult.success ? "text-green-600" : "text-red-600"}>
                    {testResult.message}
                  </p>
                </div>
                
                {testResult.details && (
                  <div className="p-3 rounded-lg bg-muted">
                    <p className="font-medium mb-2">Details:</p>
                    <pre className="text-sm overflow-auto max-h-32">
                      {JSON.stringify(testResult.details, null, 2)}
                    </pre>
                  </div>
                )}
                
                <div className="flex justify-end">
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