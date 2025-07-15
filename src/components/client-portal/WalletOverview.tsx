
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Wallet, TrendingUp, RefreshCw } from 'lucide-react';
import { useClientAuth } from '@/contexts/ClientAuthContext';
import { formatKenyanCurrency } from '@/utils/kenyanValidation';

interface WalletOverviewProps {
  onCreditClick?: () => void; // Make optional since we're removing the button
}

const WalletOverview: React.FC<WalletOverviewProps> = () => {
  const { client, refreshClientData } = useClientAuth();

  if (!client) return null;

  const isLowBalance = client.wallet_balance < client.monthly_rate;
  const balancePercentage = (client.wallet_balance / client.monthly_rate) * 100;

  return (
    <Card className={`transition-colors ${isLowBalance ? 'border-red-200 bg-red-50' : 'border-green-200 bg-green-50'}`}>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-lg font-medium flex items-center gap-2">
          <Wallet className="h-5 w-5" />
          Wallet Balance
        </CardTitle>
        <Button
          variant="outline"
          size="sm"
          onClick={refreshClientData}
          className="h-8 w-8 p-0"
        >
          <RefreshCw className="h-4 w-4" />
        </Button>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          <div>
            <div className="text-3xl font-bold text-gray-900">
              {formatKenyanCurrency(client.wallet_balance)}
            </div>
            <p className="text-sm text-gray-600 mt-1">
              Monthly rate: {formatKenyanCurrency(client.monthly_rate)}
            </p>
          </div>

          {/* Balance Progress Bar */}
          <div className="space-y-2">
            <div className="flex justify-between text-sm">
              <span>Balance Status</span>
              <span className={isLowBalance ? 'text-red-600' : 'text-green-600'}>
                {Math.min(balancePercentage, 100).toFixed(0)}%
              </span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-2">
              <div
                className={`h-2 rounded-full transition-all ${
                  isLowBalance ? 'bg-red-500' : 'bg-green-500'
                }`}
                style={{ width: `${Math.min(balancePercentage, 100)}%` }}
              />
            </div>
          </div>

          {isLowBalance && (
            <div className="p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
              <div className="flex items-center gap-2 text-yellow-800">
                <TrendingUp className="h-4 w-4" />
                <span className="text-sm font-medium">Low Balance Warning</span>
              </div>
              <p className="text-sm text-yellow-700 mt-1">
                Your balance is below your monthly rate. Consider topping up using the M-Pesa payment form below.
              </p>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
};

export default WalletOverview;
