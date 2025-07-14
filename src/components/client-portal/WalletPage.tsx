
import React, { useState } from 'react';
import WalletOverview from './WalletOverview';
import MpesaPaymentForm from './MpesaPaymentForm';
import PaybillInstructions from './PaybillInstructions';
import TransactionHistory from './TransactionHistory';
import PaymentHistoryExport from './PaymentHistoryExport';

const WalletPage: React.FC = () => {
  const [showCreditForm, setShowCreditForm] = useState(false);

  const handleCreditClick = () => {
    setShowCreditForm(true);
  };

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold tracking-tight">Wallet Management</h2>
        <p className="text-muted-foreground">
          Top up your wallet and manage your payment history
        </p>
      </div>

      <WalletOverview onCreditClick={handleCreditClick} />
      
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <MpesaPaymentForm />
        <PaybillInstructions />
      </div>
      
      <PaymentHistoryExport />
      
      <TransactionHistory />
    </div>
  );
};

export default WalletPage;
