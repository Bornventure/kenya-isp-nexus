
import React, { useState } from 'react';
import WalletOverview from './WalletOverview';
import TransactionHistory from './TransactionHistory';
import PaymentMethodSelector from '@/components/customers/PaymentMethodSelector';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Plus, ArrowLeft } from 'lucide-react';
import { useClientAuth } from '@/contexts/ClientAuthContext';

const WalletPage = () => {
  const [showTopUp, setShowTopUp] = useState(false);
  const [topUpAmount, setTopUpAmount] = useState('');
  const { client, refreshClientData } = useClientAuth();

  const handleTopUpClick = () => {
    setShowTopUp(true);
  };

  const handleTopUpSuccess = (paymentData: any) => {
    console.log('Top-up successful:', paymentData);
    setShowTopUp(false);
    setTopUpAmount('');
    // Refresh client data to update wallet balance
    refreshClientData();
  };

  const handleTopUpCancel = () => {
    setShowTopUp(false);
    setTopUpAmount('');
  };

  const handleAmountChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    // Only allow numbers and decimal points
    if (value === '' || /^\d*\.?\d*$/.test(value)) {
      setTopUpAmount(value);
    }
  };

  if (showTopUp) {
    return (
      <div className="space-y-6">
        <div className="flex items-center gap-4">
          <Button
            variant="outline"
            size="sm"
            onClick={handleTopUpCancel}
            className="flex items-center gap-2"
          >
            <ArrowLeft className="h-4 w-4" />
            Back to Wallet
          </Button>
          <h1 className="text-2xl font-bold">Top Up Wallet</h1>
        </div>
        
        <div className="max-w-md mx-auto space-y-4">
          <div className="space-y-2">
            <Label htmlFor="topup-amount">Amount (KES)</Label>
            <Input
              id="topup-amount"
              type="number"
              value={topUpAmount}
              onChange={handleAmountChange}
              placeholder="Enter amount"
              min="1"
              step="0.01"
              className="text-center text-lg"
            />
          </div>
          
          {topUpAmount && parseFloat(topUpAmount) > 0 && (
            <PaymentMethodSelector
              clientId={client?.id || ''}
              amount={parseFloat(topUpAmount)}
              accountReference="WALLET_TOPUP"
              onPaymentComplete={handleTopUpSuccess}
            />
          )}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold mb-2">Wallet</h1>
          <p className="text-gray-600 dark:text-gray-300">
            Manage your wallet balance and view transaction history
          </p>
        </div>
        <Button onClick={handleTopUpClick} className="flex items-center gap-2">
          <Plus className="h-4 w-4" />
          Top Up Wallet
        </Button>
      </div>

      <WalletOverview />
      <TransactionHistory />
    </div>
  );
};

export default WalletPage;
