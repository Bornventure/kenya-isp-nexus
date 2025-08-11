
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { 
  DollarSign, 
  FileText, 
  Calendar, 
  CreditCard,
  Clock,
  TrendingUp,
  AlertCircle,
  CheckCircle2
} from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';

interface ClientBillingSectionProps {
  clientId: string;
  clientName: string;
}

interface Invoice {
  id: string;
  invoice_number: string;
  amount: number;
  vat_amount: number;
  total_amount: number;
  status: string;
  due_date: string;
  service_period_start: string;
  service_period_end: string;
  created_at: string;
}

interface Payment {
  id: string;
  amount: number;
  payment_method: string;
  reference_number: string;
  payment_date: string;
  status: string;
}

interface WalletTransaction {
  id: string;
  transaction_type: 'credit' | 'debit';
  amount: number;
  description: string;
  created_at: string;
}

const ClientBillingSection: React.FC<ClientBillingSectionProps> = ({ 
  clientId, 
  clientName 
}) => {
  const [client, setClient] = useState<any>(null);
  const [invoices, setInvoices] = useState<Invoice[]>([]);
  const [payments, setPayments] = useState<Payment[]>([]);
  const [walletTransactions, setWalletTransactions] = useState<WalletTransaction[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const { toast } = useToast();

  useEffect(() => {
    loadBillingData();
  }, [clientId]);

  const loadBillingData = async () => {
    try {
      setIsLoading(true);

      // Load client data with service package
      const { data: clientData, error: clientError } = await supabase
        .from('clients')
        .select(`
          *,
          service_packages (
            id,
            name,
            speed,
            monthly_rate
          )
        `)
        .eq('id', clientId)
        .single();

      if (clientError) throw clientError;
      setClient(clientData);

      // Load invoices
      const { data: invoicesData, error: invoicesError } = await supabase
        .from('invoices')
        .select('*')
        .eq('client_id', clientId)
        .order('created_at', { ascending: false });

      if (invoicesError) throw invoicesError;
      setInvoices(invoicesData || []);

      // Load payments
      const { data: paymentsData, error: paymentsError } = await supabase
        .from('payments')
        .select('*')
        .eq('client_id', clientId)
        .order('payment_date', { ascending: false });

      if (paymentsError) throw paymentsError;
      setPayments(paymentsData || []);

      // Load wallet transactions
      const { data: walletData, error: walletError } = await supabase
        .from('wallet_transactions')
        .select('*')
        .eq('client_id', clientId)
        .order('created_at', { ascending: false })
        .limit(10);

      if (walletError) throw walletError;
      setWalletTransactions(walletData || []);

    } catch (error) {
      console.error('Error loading billing data:', error);
      toast({
        title: "Error",
        description: "Failed to load billing information",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const formatCurrency = (amount: number) => {
    return `KES ${amount.toLocaleString('en-KE', { minimumFractionDigits: 2 })}`;
  };

  const getStatusBadge = (status: string) => {
    switch (status.toLowerCase()) {
      case 'paid':
        return <Badge className="bg-green-100 text-green-800">Paid</Badge>;
      case 'pending':
        return <Badge variant="secondary" className="bg-orange-100 text-orange-800">Pending</Badge>;
      case 'overdue':
        return <Badge variant="destructive">Overdue</Badge>;
      case 'cancelled':
        return <Badge variant="outline">Cancelled</Badge>;
      default:
        return <Badge variant="outline">{status}</Badge>;
    }
  };

  const calculateTotals = () => {
    const totalPaid = payments
      .filter(p => p.status === 'completed' || p.status === 'paid')
      .reduce((sum, p) => sum + p.amount, 0);
    
    const totalPending = invoices
      .filter(i => i.status === 'pending')
      .reduce((sum, i) => sum + i.total_amount, 0);

    const totalOverdue = invoices
      .filter(i => i.status === 'pending' && new Date(i.due_date) < new Date())
      .reduce((sum, i) => sum + i.total_amount, 0);

    return { totalPaid, totalPending, totalOverdue };
  };

  const getNextBillingDate = () => {
    if (!client?.subscription_end_date) return null;
    return new Date(client.subscription_end_date);
  };

  const getDaysUntilBilling = () => {
    const nextBilling = getNextBillingDate();
    if (!nextBilling) return null;
    
    const today = new Date();
    const diffTime = nextBilling.getTime() - today.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays;
  };

  if (isLoading) {
    return (
      <div className="space-y-6">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <DollarSign className="h-5 w-5" />
              Loading Billing Information...
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="animate-pulse space-y-4">
              <div className="h-4 bg-gray-200 rounded w-3/4"></div>
              <div className="h-4 bg-gray-200 rounded w-1/2"></div>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  const { totalPaid, totalPending, totalOverdue } = calculateTotals();
  const daysUntilBilling = getDaysUntilBilling();

  return (
    <div className="space-y-6">
      {/* Billing Overview */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <DollarSign className="h-5 w-5" />
            Billing Overview
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="text-center p-4 border rounded-lg">
              <div className="text-2xl font-bold text-green-600">
                {formatCurrency(client?.wallet_balance || 0)}
              </div>
              <div className="text-sm text-muted-foreground">Wallet Balance</div>
            </div>
            <div className="text-center p-4 border rounded-lg">
              <div className="text-2xl font-bold text-blue-600">
                {formatCurrency(client?.monthly_rate || client?.service_packages?.monthly_rate || 0)}
              </div>
              <div className="text-sm text-muted-foreground">Monthly Rate</div>
            </div>
            <div className="text-center p-4 border rounded-lg">
              <div className="text-2xl font-bold text-orange-600">
                {formatCurrency(totalPending)}
              </div>
              <div className="text-sm text-muted-foreground">Pending</div>
            </div>
            <div className="text-center p-4 border rounded-lg">
              <div className="text-2xl font-bold text-red-600">
                {formatCurrency(totalOverdue)}
              </div>
              <div className="text-sm text-muted-foreground">Overdue</div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Service Information */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Calendar className="h-5 w-5" />
            Service & Billing Cycle
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <h4 className="font-medium mb-3">Current Service Package</h4>
              <div className="space-y-2">
                <div className="flex justify-between">
                  <span className="text-sm text-muted-foreground">Package:</span>
                  <span className="font-medium">{client?.service_packages?.name || 'Not assigned'}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm text-muted-foreground">Speed:</span>
                  <span className="font-medium">{client?.service_packages?.speed || 'N/A'}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm text-muted-foreground">Monthly Rate:</span>
                  <span className="font-medium">{formatCurrency(client?.monthly_rate || 0)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm text-muted-foreground">Billing Type:</span>
                  <span className="font-medium capitalize">{client?.subscription_type || 'Monthly'}</span>
                </div>
              </div>
            </div>
            
            <div>
              <h4 className="font-medium mb-3">Billing Cycle Information</h4>
              <div className="space-y-2">
                <div className="flex justify-between">
                  <span className="text-sm text-muted-foreground">Start Date:</span>
                  <span className="font-medium">
                    {client?.subscription_start_date 
                      ? new Date(client.subscription_start_date).toLocaleDateString()
                      : 'Not set'
                    }
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm text-muted-foreground">Next Billing:</span>
                  <span className="font-medium">
                    {client?.subscription_end_date 
                      ? new Date(client.subscription_end_date).toLocaleDateString()
                      : 'Not set'
                    }
                  </span>
                </div>
                {daysUntilBilling !== null && (
                  <div className="flex justify-between">
                    <span className="text-sm text-muted-foreground">Days Until:</span>
                    <span className={`font-medium ${daysUntilBilling <= 3 ? 'text-red-600' : 'text-green-600'}`}>
                      {daysUntilBilling > 0 ? `${daysUntilBilling} days` : 'Overdue'}
                    </span>
                  </div>
                )}
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Recent Invoices */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <FileText className="h-5 w-5" />
            Recent Invoices
          </CardTitle>
        </CardHeader>
        <CardContent>
          {invoices.length > 0 ? (
            <div className="space-y-4">
              {invoices.slice(0, 5).map((invoice) => (
                <div key={invoice.id} className="flex items-center justify-between p-4 border rounded-lg">
                  <div className="flex items-center gap-3">
                    <FileText className="h-5 w-5 text-blue-600" />
                    <div>
                      <div className="font-medium">{invoice.invoice_number}</div>
                      <div className="text-sm text-muted-foreground">
                        {new Date(invoice.service_period_start).toLocaleDateString()} - {new Date(invoice.service_period_end).toLocaleDateString()}
                      </div>
                      <div className="text-xs text-muted-foreground">
                        Due: {new Date(invoice.due_date).toLocaleDateString()}
                      </div>
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="font-bold">{formatCurrency(invoice.total_amount)}</div>
                    {getStatusBadge(invoice.status)}
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-8 text-muted-foreground">
              <FileText className="h-12 w-12 mx-auto mb-4 opacity-50" />
              <p>No invoices found</p>
              <p className="text-sm">Invoices will appear here once billing is activated</p>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Payment History */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <CreditCard className="h-5 w-5" />
            Payment History
          </CardTitle>
        </CardHeader>
        <CardContent>
          {payments.length > 0 ? (
            <div className="space-y-4">
              {payments.slice(0, 5).map((payment) => (
                <div key={payment.id} className="flex items-center justify-between p-4 border rounded-lg">
                  <div className="flex items-center gap-3">
                    <CreditCard className="h-5 w-5 text-green-600" />
                    <div>
                      <div className="font-medium">Payment #{payment.reference_number}</div>
                      <div className="text-sm text-muted-foreground">
                        {payment.payment_method} • {new Date(payment.payment_date).toLocaleDateString()}
                      </div>
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="font-bold text-green-600">{formatCurrency(payment.amount)}</div>
                    {getStatusBadge(payment.status)}
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-8 text-muted-foreground">
              <CreditCard className="h-12 w-12 mx-auto mb-4 opacity-50" />
              <p>No payments found</p>
              <p className="text-sm">Payment history will appear here</p>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Wallet Transactions */}
      {walletTransactions.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <TrendingUp className="h-5 w-5" />
              Recent Wallet Activity
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {walletTransactions.map((transaction) => (
                <div key={transaction.id} className="flex items-center justify-between p-4 border rounded-lg">
                  <div className="flex items-center gap-3">
                    {transaction.transaction_type === 'credit' ? (
                      <CheckCircle2 className="h-5 w-5 text-green-600" />
                    ) : (
                      <AlertCircle className="h-5 w-5 text-red-600" />
                    )}
                    <div>
                      <div className="font-medium">{transaction.description}</div>
                      <div className="text-sm text-muted-foreground">
                        {new Date(transaction.created_at).toLocaleDateString()}
                      </div>
                    </div>
                  </div>
                  <div className={`font-bold ${transaction.transaction_type === 'credit' ? 'text-green-600' : 'text-red-600'}`}>
                    {transaction.transaction_type === 'credit' ? '+' : '-'}{formatCurrency(transaction.amount)}
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Actions */}
      <Card>
        <CardHeader>
          <CardTitle>Billing Actions</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex gap-2">
            <Button 
              variant="outline" 
              onClick={() => loadBillingData()}
            >
              Refresh Billing Data
            </Button>
            <Button 
              variant="outline"
              onClick={() => {
                // Could open generate invoice dialog
                toast({
                  title: "Generate Invoice",
                  description: "Invoice generation feature coming soon",
                });
              }}
            >
              Generate Invoice
            </Button>
            <Button 
              variant="outline"
              onClick={() => {
                // Could open payment processing dialog
                toast({
                  title: "Process Payment",
                  description: "Payment processing feature coming soon",
                });
              }}
            >
              Process Payment
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default ClientBillingSection;
