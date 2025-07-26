
import React, { useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useClientAuth } from '@/contexts/ClientAuthContext';
import { formatKenyanCurrency } from '@/utils/kenyanValidation';
import { Loader2, RefreshCw, CreditCard, Smartphone, Building2 } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface WalletTransaction {
  id: string;
  transaction_type: 'credit' | 'debit' | 'payment' | 'refund';
  amount: number;
  description: string | null;
  reference_number: string | null;
  mpesa_receipt_number: string | null;
  payment_method?: string | null;
  created_at: string;
}

const TransactionHistory: React.FC = () => {
  const { client, refreshClientData } = useClientAuth();
  const queryClient = useQueryClient();

  const { data: transactions = [], isLoading, error, refetch } = useQuery({
    queryKey: ['wallet-transactions', client?.id],
    queryFn: async () => {
      if (!client?.id) return [];

      console.log('Fetching wallet transactions for client:', client.id);
      
      const { data, error } = await supabase
        .from('wallet_transactions')
        .select('*')
        .eq('client_id', client.id)
        .order('created_at', { ascending: false })
        .limit(50);

      if (error) {
        console.error('Error fetching wallet transactions:', error);
        throw error;
      }

      console.log('Wallet transactions fetched:', data);
      return data as WalletTransaction[];
    },
    enabled: !!client?.id,
    refetchInterval: 3000,
  });

  // Set up real-time subscription for wallet transactions
  useEffect(() => {
    if (!client?.id) return;

    console.log('Setting up real-time subscription for wallet transactions, client:', client.id);

    const channel = supabase
      .channel(`wallet_transactions_${client.id}`)
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'wallet_transactions',
          filter: `client_id=eq.${client.id}`
        },
        (payload) => {
          console.log('Real-time wallet transaction update:', payload);
          queryClient.invalidateQueries({ queryKey: ['wallet-transactions', client.id] });
          refreshClientData();
        }
      )
      .subscribe((status) => {
        console.log('Wallet transactions subscription status:', status);
      });

    return () => {
      console.log('Cleaning up wallet transactions subscription');
      supabase.removeChannel(channel);
    };
  }, [client?.id, queryClient, refreshClientData]);

  const getTransactionTypeColor = (type: string) => {
    switch (type) {
      case 'credit':
        return 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200';
      case 'debit':
        return 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200';
      case 'payment':
        return 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200';
      case 'refund':
        return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200';
      default:
        return 'bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-200';
    }
  };

  const getPaymentMethodIcon = (method: string | null) => {
    switch (method?.toLowerCase()) {
      case 'mpesa':
        return <Smartphone className="h-3 w-3 text-green-600" />;
      case 'family_bank':
        return <Smartphone className="h-3 w-3 text-purple-600" />;
      case 'bank':
        return <Building2 className="h-3 w-3 text-blue-600" />;
      case 'cash':
        return <CreditCard className="h-3 w-3 text-gray-600" />;
      default:
        return <CreditCard className="h-3 w-3 text-gray-500" />;
    }
  };

  const getPaymentMethodName = (method: string | null) => {
    switch (method?.toLowerCase()) {
      case 'mpesa':
        return 'M-Pesa';
      case 'family_bank':
        return 'Family Bank';
      case 'bank':
        return 'Bank Transfer';
      case 'cash':
        return 'Cash';
      default:
        return 'Unknown';
    }
  };

  const getTransactionPurpose = (description: string | null) => {
    if (!description) return 'Transaction';
    
    if (description.includes('Subscription renewal') || description.includes('Package renewal')) {
      return 'Package Renewal';
    }
    if (description.includes('Wallet credit') || description.includes('Top up')) {
      return 'Wallet Top-up';
    }
    if (description.includes('Payment for')) {
      return 'Service Payment';
    }
    return description;
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-KE', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const formatAmount = (amount: number, type: string) => {
    const formattedAmount = formatKenyanCurrency(amount);
    return type === 'credit' ? `+${formattedAmount}` : `-${formattedAmount}`;
  };

  if (error) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Transaction History</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center py-8">
            <p className="text-red-600 dark:text-red-400">
              Error loading transactions. Please try again.
            </p>
            <Button onClick={() => refetch()} className="mt-4">
              <RefreshCw className="h-4 w-4 mr-2" />
              Retry
            </Button>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle>Transaction History</CardTitle>
        <Button 
          variant="outline" 
          size="sm" 
          onClick={() => {
            console.log('Manual refresh triggered');
            refetch();
            refreshClientData();
          }}
          disabled={isLoading}
        >
          {isLoading ? (
            <Loader2 className="h-4 w-4 animate-spin" />
          ) : (
            <RefreshCw className="h-4 w-4" />
          )}
        </Button>
      </CardHeader>
      <CardContent>
        {isLoading && transactions.length === 0 ? (
          <div className="flex items-center justify-center py-8">
            <Loader2 className="h-6 w-6 animate-spin mr-2" />
            <span>Loading transactions...</span>
          </div>
        ) : transactions.length === 0 ? (
          <div className="text-center py-8">
            <p className="text-gray-600 dark:text-gray-300">
              No transactions found. Your transaction history will appear here.
            </p>
            <Button 
              onClick={() => {
                console.log('Retrying to fetch transactions');
                refetch();
                refreshClientData();
              }} 
              variant="outline" 
              className="mt-4"
            >
              <RefreshCw className="h-4 w-4 mr-2" />
              Refresh
            </Button>
          </div>
        ) : (
          <div className="space-y-4">
            <div className="text-sm text-gray-500 mb-4">
              Showing {transactions.length} transaction{transactions.length !== 1 ? 's' : ''}
            </div>
            {transactions.map((transaction) => (
              <div
                key={transaction.id}
                className="flex items-center justify-between p-4 border rounded-lg hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors"
              >
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-1">
                    <Badge className={getTransactionTypeColor(transaction.transaction_type)}>
                      {transaction.transaction_type.charAt(0).toUpperCase() + transaction.transaction_type.slice(1)}
                    </Badge>
                    {transaction.payment_method && (
                      <div className="flex items-center gap-1 text-xs text-gray-600">
                        {getPaymentMethodIcon(transaction.payment_method)}
                        <span>{getPaymentMethodName(transaction.payment_method)}</span>
                      </div>
                    )}
                    <span className="text-sm text-gray-600 dark:text-gray-400">
                      {formatDate(transaction.created_at)}
                    </span>
                  </div>
                  <p className="text-sm font-medium mb-1">
                    {getTransactionPurpose(transaction.description)}
                  </p>
                  {(transaction.reference_number || transaction.mpesa_receipt_number) && (
                    <p className="text-xs text-gray-500 dark:text-gray-400">
                      Ref: {transaction.mpesa_receipt_number || transaction.reference_number}
                    </p>
                  )}
                </div>
                <div className="text-right">
                  <span className={`font-semibold ${
                    transaction.transaction_type === 'credit' 
                      ? 'text-green-600 dark:text-green-400' 
                      : 'text-red-600 dark:text-red-400'
                  }`}>
                    {formatAmount(transaction.amount, transaction.transaction_type)}
                  </span>
                </div>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default TransactionHistory;
