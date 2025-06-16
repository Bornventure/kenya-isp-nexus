
import React, { useState } from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import PaymentForm from '@/components/billing/PaymentForm';
import PaymentReconciliation from '@/components/billing/PaymentReconciliation';
import WalletCreditForm from '@/components/billing/WalletCreditForm';
import { usePayments } from '@/hooks/usePayments';
import { useWalletTransactions } from '@/hooks/useWalletTransactions';
import { formatKenyanCurrency } from '@/utils/currencyFormat';
import { CreditCard, Wallet, Users, RefreshCw } from 'lucide-react';

const Billing: React.FC = () => {
  const { payments, isLoading: paymentsLoading } = usePayments();
  const { transactions, isLoading: transactionsLoading } = useWalletTransactions();

  const totalPayments = payments.reduce((sum, payment) => sum + payment.amount, 0);
  const totalCredits = transactions
    .filter(t => t.transaction_type === 'credit')
    .reduce((sum, transaction) => sum + transaction.amount, 0);
  const totalDebits = transactions
    .filter(t => t.transaction_type === 'debit')
    .reduce((sum, transaction) => sum + transaction.amount, 0);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold">Billing & Payments</h1>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Payments</CardTitle>
            <CreditCard className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {paymentsLoading ? '...' : formatKenyanCurrency(totalPayments)}
            </div>
            <p className="text-xs text-muted-foreground">
              {payments.length} transactions
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Wallet Credits</CardTitle>
            <Wallet className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">
              {transactionsLoading ? '...' : formatKenyanCurrency(totalCredits)}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Wallet Debits</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-red-600">
              {transactionsLoading ? '...' : formatKenyanCurrency(totalDebits)}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Net Balance</CardTitle>
            <RefreshCw className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {transactionsLoading ? '...' : formatKenyanCurrency(totalCredits - totalDebits)}
            </div>
          </CardContent>
        </Card>
      </div>

      <Tabs defaultValue="record-payment" className="space-y-4">
        <TabsList>
          <TabsTrigger value="record-payment">Record Payment</TabsTrigger>
          <TabsTrigger value="wallet-credit">Wallet Credit</TabsTrigger>
          <TabsTrigger value="reconciliation">Payment Reconciliation</TabsTrigger>
        </TabsList>
        
        <TabsContent value="record-payment">
          <PaymentForm />
        </TabsContent>
        
        <TabsContent value="wallet-credit">
          <WalletCreditForm />
        </TabsContent>
        
        <TabsContent value="reconciliation">
          <PaymentReconciliation />
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default Billing;
