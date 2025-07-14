
import React, { useState } from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import WalletOverview from './WalletOverview';
import MpesaPaymentForm from './MpesaPaymentForm';
import PaybillInstructions from './PaybillInstructions';
import TransactionHistory from './TransactionHistory';

const WalletPage: React.FC = () => {
  const [activeTab, setActiveTab] = useState('overview');

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-gray-900">Wallet</h1>
        <p className="text-gray-600 mt-2">Manage your wallet balance and payment methods</p>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="topup">Top Up</TabsTrigger>
          <TabsTrigger value="instructions">Instructions</TabsTrigger>
          <TabsTrigger value="history">History</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-6">
          <WalletOverview onCreditClick={() => setActiveTab('topup')} />
        </TabsContent>

        <TabsContent value="topup" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <MpesaPaymentForm />
            <PaybillInstructions />
          </div>
        </TabsContent>

        <TabsContent value="instructions" className="space-y-6">
          <PaybillInstructions />
        </TabsContent>

        <TabsContent value="history" className="space-y-6">
          <TransactionHistory />
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default WalletPage;
