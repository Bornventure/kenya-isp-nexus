import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { AlertCircle, CheckCircle, XCircle, Loader2, Wifi } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';

interface ConnectionStatus {
  isOnline: boolean;
  message: string;
  details?: any;
  lastChecked?: Date;
}

export const FamilyBankDiagnostics = () => {
  const [status, setStatus] = useState<ConnectionStatus | null>(null);
  const [isChecking, setIsChecking] = useState(false);
  const { toast } = useToast();

  const checkFamilyBankConnection = async () => {
    setIsChecking(true);
    
    try {
      // First try the new validation function
      const { data, error } = await supabase.functions.invoke('validate-family-bank-config');
      
      if (error) {
        setStatus({
          isOnline: false,
          message: `Connection failed: ${error.message}`,
          details: error,
          lastChecked: new Date()
        });
        
        toast({
          title: "Connection Test Failed",
          description: "Family Bank API appears to be offline",
          variant: "destructive"
        });
        return;
      }

      setStatus({
        isOnline: data.success,
        message: data.message,
        details: data,
        lastChecked: new Date()
      });

      toast({
        title: data.success ? "Connection Successful" : "Connection Failed",
        description: data.message,
        variant: data.success ? "default" : "destructive"
      });
      
    } catch (error: any) {
      console.error('Family Bank connection test error:', error);
      setStatus({
        isOnline: false,
        message: `Test failed: ${error.message}`,
        details: error,
        lastChecked: new Date()
      });
      
      toast({
        title: "Test Error",
        description: "Failed to run connection test",
        variant: "destructive"
      });
    } finally {
      setIsChecking(false);
    }
  };

  const getStatusIcon = () => {
    if (isChecking) return <Loader2 className="h-5 w-5 animate-spin" />;
    if (!status) return <Wifi className="h-5 w-5 text-muted-foreground" />;
    if (status.isOnline) return <CheckCircle className="h-5 w-5 text-green-500" />;
    return <XCircle className="h-5 w-5 text-red-500" />;
  };

  const getStatusBadge = () => {
    if (isChecking) return <Badge variant="secondary">Checking...</Badge>;
    if (!status) return <Badge variant="outline">Not Tested</Badge>;
    if (status.isOnline) return <Badge className="bg-green-500">Online</Badge>;
    return <Badge variant="destructive">Offline</Badge>;
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            {getStatusIcon()}
            Family Bank API Diagnostics
          </div>
          {getStatusBadge()}
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="space-y-2">
          <Button 
            onClick={checkFamilyBankConnection}
            disabled={isChecking}
            className="w-full"
          >
            {isChecking ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Testing Connection...
              </>
            ) : (
              <>
                <Wifi className="mr-2 h-4 w-4" />
                Test Family Bank Connection
              </>
            )}
          </Button>
          
          {status && (
            <div className="space-y-3 mt-4">
              <div className="p-3 rounded-lg bg-muted">
                <div className="flex items-center gap-2 mb-2">
                  {status.isOnline ? (
                    <CheckCircle className="h-4 w-4 text-green-500" />
                  ) : (
                    <XCircle className="h-4 w-4 text-red-500" />
                  )}
                  <span className="font-medium">Connection Status</span>
                </div>
                <p className={status.isOnline ? "text-green-600" : "text-red-600"}>
                  {status.message}
                </p>
                {status.lastChecked && (
                  <p className="text-xs text-muted-foreground mt-1">
                    Last checked: {status.lastChecked.toLocaleString()}
                  </p>
                )}
              </div>

              {status.details && (
                <div className="p-3 rounded-lg bg-muted">
                  <p className="font-medium mb-2">Technical Details:</p>
                  <pre className="text-xs overflow-auto max-h-32 bg-background p-2 rounded border">
                    {JSON.stringify(status.details, null, 2)}
                  </pre>
                </div>
              )}

              {!status.isOnline && (
                <div className="p-3 rounded-lg bg-yellow-50 dark:bg-yellow-950 border border-yellow-200 dark:border-yellow-800">
                  <div className="flex items-start gap-2">
                    <AlertCircle className="h-4 w-4 text-yellow-600 mt-0.5" />
                    <div className="text-yellow-800 dark:text-yellow-200 text-sm">
                      <p className="font-medium mb-1">Family Bank API Status</p>
                      <p>The Family Bank servers appear to be unreachable. This could be due to:</p>
                      <ul className="list-disc list-inside mt-1 space-y-1">
                        <li>Family Bank server maintenance</li>
                        <li>Network connectivity issues</li>
                        <li>Temporary server downtime</li>
                      </ul>
                      <p className="mt-2">Please try again later or contact Family Bank for status updates.</p>
                    </div>
                  </div>
                </div>
              )}
            </div>
          )}
        </div>

        <div className="p-3 rounded-lg bg-muted text-sm">
          <p><strong>API Endpoint:</strong> https://openbank.familybank.co.ke:8083/connect/token</p>
          <p><strong>STK Push Endpoint:</strong> https://openbank.familybank.co.ke:8084/api/v1/Mpesa/stkpush</p>
          <p><strong>Business Code:</strong> 026026</p>
          <p><strong>Client ID:</strong> LAKELINK</p>
        </div>
      </CardContent>
    </Card>
  );
};