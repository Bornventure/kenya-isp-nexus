
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Wallet, AlertTriangle, CheckCircle, Clock, RefreshCw } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

interface WalletTransaction {
  id: string;
  clientId: string;
  clientName: string;
  amount: number;
  type: 'credit' | 'debit';
  description: string;
  timestamp: string;
  balance: number;
  serviceExpiry: string;
}

interface ClientWallet {
  clientId: string;
  clientName: string;
  balance: number;
  monthlyRate: number;
  serviceExpiry: string;
  status: 'active' | 'expiring_soon' | 'expired';
  daysRemaining: number;
}

const WalletMonitor: React.FC = () => {
  const { toast } = useToast();
  const [wallets, setWallets] = useState<ClientWallet[]>([
    {
      clientId: '1',
      clientName: 'John Doe',
      balance: 1500,
      monthlyRate: 2000,
      serviceExpiry: '2024-01-25',
      status: 'expiring_soon',
      daysRemaining: 3
    },
    {
      clientId: '2',
      clientName: 'Jane Smith',
      balance: 500,
      monthlyRate: 3000,
      serviceExpiry: '2024-01-20',
      status: 'expired',
      daysRemaining: -2
    },
    {
      clientId: '3',
      clientName: 'Bob Wilson',
      balance: 5000,
      monthlyRate: 2500,
      serviceExpiry: '2024-02-15',
      status: 'active',
      daysRemaining: 25
    }
  ]);

  const [transactions, setTransactions] = useState<WalletTransaction[]>([
    {
      id: '1',
      clientId: '1',
      clientName: 'John Doe',
      amount: 2000,
      type: 'credit',
      description: 'M-Pesa payment',
      timestamp: '2024-01-15 14:30:00',
      balance: 1500,
      serviceExpiry: '2024-01-25'
    },
    {
      id: '2',
      clientId: '1',
      clientName: 'John Doe', 
      amount: 2000,
      type: 'debit',
      description: 'Monthly subscription renewal',
      timestamp: '2024-01-15 14:35:00',
      balance: 1500,
      serviceExpiry: '2024-02-15'
    }
  ]);

  const [isMonitoring, setIsMonitoring] = useState(false);

  const handleAutoRenewal = async (clientId: string) => {
    console.log('Processing auto-renewal for client:', clientId);
    
    const client = wallets.find(w => w.clientId === clientId);
    if (!client) return;

    if (client.balance >= client.monthlyRate) {
      // Process renewal
      setWallets(prev => prev.map(w => 
        w.clientId === clientId 
          ? { 
              ...w, 
              balance: w.balance - w.monthlyRate,
              status: 'active',
              daysRemaining: 30,
              serviceExpiry: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0]
            }
          : w
      ));

      // Add transaction record
      const newTransaction: WalletTransaction = {
        id: Date.now().toString(),
        clientId,
        clientName: client.clientName,
        amount: client.monthlyRate,
        type: 'debit',
        description: 'Auto-renewal: Monthly subscription',
        timestamp: new Date().toISOString(),
        balance: client.balance - client.monthlyRate,
        serviceExpiry: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0]
      };

      setTransactions(prev => [newTransaction, ...prev]);

      toast({
        title: "Auto-Renewal Successful",
        description: `Service renewed for ${client.clientName}`,
      });
    } else {
      toast({
        title: "Insufficient Balance",
        description: `${client.clientName} has insufficient balance for renewal`,
        variant: "destructive",
      });
    }
  };

  const startMonitoring = () => {
    setIsMonitoring(true);
    toast({
      title: "Monitoring Started",
      description: "Real-time wallet monitoring is now active",
    });

    // Simulate real-time monitoring
    const interval = setInterval(() => {
      // Check for clients needing auto-renewal
      wallets.forEach(wallet => {
        if (wallet.daysRemaining <= 0 && wallet.balance >= wallet.monthlyRate) {
          handleAutoRenewal(wallet.clientId);
        }
      });
    }, 30000); // Check every 30 seconds

    // Cleanup interval after demo
    setTimeout(() => {
      clearInterval(interval);
      setIsMonitoring(false);
    }, 300000); // Stop after 5 minutes
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active': return 'bg-green-100 text-green-800';
      case 'expiring_soon': return 'bg-yellow-100 text-yellow-800';
      case 'expired': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getProgressValue = (daysRemaining: number) => {
    return Math.max(0, Math.min(100, (daysRemaining / 30) * 100));
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Wallet Monitor</h1>
          <p className="text-muted-foreground">
            Real-time wallet monitoring and automatic service renewals
          </p>
        </div>
        <Button 
          onClick={startMonitoring}
          disabled={isMonitoring}
          className={isMonitoring ? 'animate-pulse' : ''}
        >
          <RefreshCw className={`h-4 w-4 mr-2 ${isMonitoring ? 'animate-spin' : ''}`} />
          {isMonitoring ? 'Monitoring Active' : 'Start Monitoring'}
        </Button>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <Wallet className="mr-2 h-5 w-5" />
              Client Wallets
            </CardTitle>
            <CardDescription>
              Monitor client wallet balances and service status
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {wallets.map((wallet) => (
                <div key={wallet.clientId} className="p-4 border rounded-lg">
                  <div className="flex items-center justify-between mb-2">
                    <h4 className="font-medium">{wallet.clientName}</h4>
                    <Badge className={getStatusColor(wallet.status)}>
                      {wallet.status.replace('_', ' ')}
                    </Badge>
                  </div>
                  
                  <div className="space-y-2">
                    <div className="flex justify-between text-sm">
                      <span>Balance: KSh {wallet.balance.toLocaleString()}</span>
                      <span>Monthly: KSh {wallet.monthlyRate.toLocaleString()}</span>
                    </div>
                    
                    <div className="flex justify-between text-sm text-muted-foreground">
                      <span>Expires: {wallet.serviceExpiry}</span>
                      <span>{wallet.daysRemaining > 0 ? `${wallet.daysRemaining} days left` : `${Math.abs(wallet.daysRemaining)} days overdue`}</span>
                    </div>
                    
                    <Progress value={getProgressValue(wallet.daysRemaining)} className="h-2" />
                    
                    {wallet.status === 'expiring_soon' && wallet.balance >= wallet.monthlyRate && (
                      <Button 
                        size="sm" 
                        className="w-full mt-2"
                        onClick={() => handleAutoRenewal(wallet.clientId)}
                      >
                        <CheckCircle className="h-4 w-4 mr-2" />
                        Auto-Renew Now
                      </Button>
                    )}
                    
                    {wallet.balance < wallet.monthlyRate && (
                      <div className="flex items-center text-amber-600 text-sm mt-2">
                        <AlertTriangle className="h-4 w-4 mr-1" />
                        Insufficient balance for renewal
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <Clock className="mr-2 h-5 w-5" />
              Recent Transactions
            </CardTitle>
            <CardDescription>
              Latest wallet transactions and renewals
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {transactions.slice(0, 10).map((transaction) => (
                <div key={transaction.id} className="flex items-center justify-between p-3 border rounded">
                  <div className="flex-1">
                    <div className="flex items-center justify-between">
                      <span className="font-medium text-sm">{transaction.clientName}</span>
                      <span className={`text-sm font-medium ${
                        transaction.type === 'credit' ? 'text-green-600' : 'text-red-600'
                      }`}>
                        {transaction.type === 'credit' ? '+' : '-'}KSh {transaction.amount.toLocaleString()}
                      </span>
                    </div>
                    <p className="text-xs text-muted-foreground">{transaction.description}</p>
                    <p className="text-xs text-muted-foreground">
                      {new Date(transaction.timestamp).toLocaleString()}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default WalletMonitor;
