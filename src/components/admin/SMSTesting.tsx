
import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { Loader2, Send, TestTube } from 'lucide-react';

const SMSTesting = () => {
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(false);
  const [phoneNumber, setPhoneNumber] = useState('');
  const [message, setMessage] = useState('Test message from ISP Management System - Celcomafrica SMS Gateway');
  const [lastResult, setLastResult] = useState<any>(null);

  const handleSendTestSMS = async () => {
    if (!phoneNumber.trim()) {
      toast({
        title: "Phone Number Required",
        description: "Please enter a phone number to send the test SMS",
        variant: "destructive",
      });
      return;
    }

    if (!message.trim()) {
      toast({
        title: "Message Required",
        description: "Please enter a message to send",
        variant: "destructive",
      });
      return;
    }

    setIsLoading(true);
    
    try {
      console.log('Sending test SMS via Celcomafrica:', { phoneNumber, message });
      
      const { data, error } = await supabase.functions.invoke('send-sms-celcomafrica', {
        body: {
          phone: phoneNumber,
          message: message,
          type: 'test',
          client_id: null
        }
      });

      console.log('SMS API Response:', data, error);
      setLastResult({ data, error, timestamp: new Date().toISOString() });

      if (error) {
        toast({
          title: "SMS Test Failed",
          description: `Error: ${error.message}`,
          variant: "destructive",
        });
      } else if (data?.success) {
        toast({
          title: "SMS Test Successful",
          description: `SMS sent successfully. Message ID: ${data.messageId || 'N/A'}`,
        });
      } else {
        toast({
          title: "SMS Test Failed",
          description: data?.error || "Unknown error occurred",
          variant: "destructive",
        });
      }
    } catch (error: any) {
      console.error('SMS test error:', error);
      toast({
        title: "SMS Test Error",
        description: error.message || "Failed to send test SMS",
        variant: "destructive",
      });
      setLastResult({ error: error.message, timestamp: new Date().toISOString() });
    } finally {
      setIsLoading(false);
    }
  };

  const handleSendPredefinedTests = async () => {
    const testCases = [
      {
        phone: '254700000000',
        message: 'Test 1: Basic connectivity test - Celcomafrica SMS Gateway'
      },
      {
        phone: '254711000000', 
        message: 'Test 2: Payment notification test - Dear Customer, your payment of KES 1500 has been received. Thank you!'
      }
    ];

    setIsLoading(true);
    const results = [];

    for (const testCase of testCases) {
      try {
        const { data, error } = await supabase.functions.invoke('send-sms-celcomafrica', {
          body: {
            phone: testCase.phone,
            message: testCase.message,
            type: 'test'
          }
        });
        results.push({ testCase, data, error });
      } catch (error: any) {
        results.push({ testCase, error: error.message });
      }
    }

    setLastResult({ batchResults: results, timestamp: new Date().toISOString() });
    setIsLoading(false);

    toast({
      title: "Batch SMS Tests Completed",
      description: `Sent ${testCases.length} test messages. Check results below.`,
    });
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <TestTube className="h-5 w-5" />
            SMS Testing - Celcomafrica Gateway
          </CardTitle>
          <CardDescription>
            Test SMS functionality using the Celcomafrica SMS gateway. Only super-admin users can access this feature.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <Label htmlFor="phone">Phone Number</Label>
            <Input
              id="phone"
              type="tel"
              placeholder="254712345678 or 0712345678"
              value={phoneNumber}
              onChange={(e) => setPhoneNumber(e.target.value)}
            />
            <p className="text-sm text-muted-foreground mt-1">
              Enter phone number in Kenya format (254XXXXXXXXX or 07XXXXXXXX)
            </p>
          </div>

          <div>
            <Label htmlFor="message">Message</Label>
            <Textarea
              id="message"
              placeholder="Enter test message..."
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              rows={3}
            />
            <p className="text-sm text-muted-foreground mt-1">
              Message should be under 160 characters for single SMS
            </p>
          </div>

          <div className="flex gap-2">
            <Button 
              onClick={handleSendTestSMS}
              disabled={isLoading}
              className="flex-1"
            >
              {isLoading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Sending...
                </>
              ) : (
                <>
                  <Send className="mr-2 h-4 w-4" />
                  Send Test SMS
                </>
              )}
            </Button>

            <Button 
              variant="outline"
              onClick={handleSendPredefinedTests}
              disabled={isLoading}
            >
              Run Batch Tests
            </Button>
          </div>
        </CardContent>
      </Card>

      {lastResult && (
        <Card>
          <CardHeader>
            <CardTitle>Test Results</CardTitle>
            <CardDescription>
              Latest test results from {new Date(lastResult.timestamp).toLocaleString()}
            </CardDescription>
          </CardHeader>
          <CardContent>
            <pre className="bg-muted p-4 rounded-md text-sm overflow-auto max-h-96">
              {JSON.stringify(lastResult, null, 2)}
            </pre>
          </CardContent>
        </Card>
      )}

      <Card>
        <CardHeader>
          <CardTitle>SMS Gateway Configuration</CardTitle>
        </CardHeader>
        <CardContent className="space-y-2 text-sm">
          <p><strong>Provider:</strong> Celcomafrica</p>
          <p><strong>API URL:</strong> https://isms.celcomafrica.com/api/services/sendsms</p>
          <p><strong>Shortcode:</strong> LAKELINK</p>
          <p><strong>Partner ID:</strong> 800</p>
          <p><strong>API Key:</strong> 3230abd57d39aa89fc407618f3faaacc</p>
        </CardContent>
      </Card>
    </div>
  );
};

export default SMSTesting;
