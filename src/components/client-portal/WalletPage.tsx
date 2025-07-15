
import React, { useState } from 'react';
import WalletOverview from './WalletOverview';
import TransactionHistory from './TransactionHistory';
import MpesaPaymentForm from './MpesaPaymentForm';
import { Button } from '@/components/ui/button';
import { Plus, ArrowLeft } from 'lucide-react';

const WalletPage = () => {
  const [showTopUp, setShowTopUp] = useState(false);
  const [topUpAmount, setTopUpAmount] = useState(100);

  const handleTopUpClick = () => {
    setShowTopUp(true);
  };

  const handleTopUpSuccess = () => {
    setShowTopUp(false);
    // The wallet balance will be updated via the payment success callback
  };

  const handleTopUpCancel = () => {
    setShowTopUp(false);
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
        
        <MpesaPaymentForm
          amount={topUpAmount}
          onSuccess={handleTopUpSuccess}
          onCancel={handleTopUpCancel}
        />
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
