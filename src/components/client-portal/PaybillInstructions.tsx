
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Copy, Smartphone, CreditCard } from 'lucide-react';
import { useClientAuth } from '@/contexts/ClientAuthContext';
import { useToast } from '@/hooks/use-toast';

const PaybillInstructions: React.FC = () => {
  const { client } = useClientAuth();
  const { toast } = useToast();

  if (!client) return null;

  const copyToClipboard = (text: string, label: string) => {
    navigator.clipboard.writeText(text);
    toast({
      title: "Copied!",
      description: `${label} copied to clipboard`,
    });
  };

  const paybillNumber = client.payment_settings?.paybill_number || '174379';
  const accountNumber = client.payment_settings?.account_number || client.id_number;

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Smartphone className="h-5 w-5" />
          M-Pesa Payment Instructions
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-2">
            <label className="text-sm font-medium text-gray-700">Paybill Number</label>
            <div className="flex items-center gap-2">
              <Badge variant="outline" className="text-lg font-mono p-2">
                {paybillNumber}
              </Badge>
              <button
                onClick={() => copyToClipboard(paybillNumber, 'Paybill number')}
                className="p-1 hover:bg-gray-100 rounded"
              >
                <Copy className="h-4 w-4" />
              </button>
            </div>
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium text-gray-700">Account Number</label>
            <div className="flex items-center gap-2">
              <Badge variant="outline" className="text-lg font-mono p-2">
                {accountNumber}
              </Badge>
              <button
                onClick={() => copyToClipboard(accountNumber, 'Account number')}
                className="p-1 hover:bg-gray-100 rounded"
              >
                <Copy className="h-4 w-4" />
              </button>
            </div>
          </div>
        </div>

        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
          <h4 className="font-medium text-blue-900 mb-2 flex items-center gap-2">
            <CreditCard className="h-4 w-4" />
            How to Pay via M-Pesa
          </h4>
          <ol className="text-sm text-blue-800 space-y-1">
            <li>1. Go to M-Pesa menu on your phone</li>
            <li>2. Select "Lipa na M-Pesa"</li>
            <li>3. Select "Pay Bill"</li>
            <li>4. Enter Paybill Number: <strong>{paybillNumber}</strong></li>
            <li>5. Enter Account Number: <strong>{accountNumber}</strong></li>
            <li>6. Enter the amount you want to pay</li>
            <li>7. Enter your M-Pesa PIN</li>
            <li>8. Wait for confirmation SMS</li>
          </ol>
        </div>

        <div className="bg-green-50 border border-green-200 rounded-lg p-3">
          <p className="text-sm text-green-800">
            <strong>Note:</strong> Your wallet will be automatically updated within 5 minutes after successful payment.
            Keep your M-Pesa confirmation message for reference.
          </p>
        </div>
      </CardContent>
    </Card>
  );
};

export default PaybillInstructions;
