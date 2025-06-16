
import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { formatKenyanCurrency } from '@/utils/currencyFormat';
import { AlertCircle, CheckCircle2, Search } from 'lucide-react';

interface UnmatchedPayment {
  id: string;
  amount: number;
  description: string;
  reference_number: string;
  mpesa_receipt_number: string;
  created_at: string;
  isp_company_id: string;
}

interface Client {
  id: string;
  name: string;
  phone: string;
  email: string;
  id_number: string;
}

const PaymentReconciliation: React.FC = () => {
  const [unmatchedPayments, setUnmatchedPayments] = useState<UnmatchedPayment[]>([]);
  const [clients, setClients] = useState<Client[]>([]);
  const [selectedClient, setSelectedClient] = useState<string>('');
  const [selectedPayment, setSelectedPayment] = useState<string>('');
  const [searchTerm, setSearchTerm] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    fetchUnmatchedPayments();
    fetchClients();
  }, []);

  const fetchUnmatchedPayments = async () => {
    try {
      const { data, error } = await supabase
        .from('wallet_transactions')
        .select('*')
        .eq('transaction_type', 'credit_pending')
        .order('created_at', { ascending: false });

      if (error) throw error;
      setUnmatchedPayments(data || []);
    } catch (error) {
      console.error('Error fetching unmatched payments:', error);
      toast({
        title: "Error",
        description: "Failed to load unmatched payments",
        variant: "destructive",
      });
    }
  };

  const fetchClients = async () => {
    try {
      const { data, error } = await supabase
        .from('clients')
        .select('id, name, phone, email, id_number')
        .order('name');

      if (error) throw error;
      setClients(data || []);
    } catch (error) {
      console.error('Error fetching clients:', error);
    }
  };

  const matchPaymentToClient = async () => {
    if (!selectedPayment || !selectedClient) {
      toast({
        title: "Error",
        description: "Please select both a payment and a client",
        variant: "destructive",
      });
      return;
    }

    setIsLoading(true);
    try {
      const payment = unmatchedPayments.find(p => p.id === selectedPayment);
      if (!payment) throw new Error('Payment not found');

      // Process the payment through the payment processor
      const { data, error } = await supabase.functions.invoke('process-payment', {
        body: {
          checkoutRequestId: payment.reference_number,
          clientId: selectedClient,
          amount: payment.amount,
          paymentMethod: 'mpesa',
          mpesaReceiptNumber: payment.mpesa_receipt_number,
        }
      });

      if (error) throw error;

      if (data.success) {
        // Remove the unmatched payment record
        await supabase
          .from('wallet_transactions')
          .delete()
          .eq('id', selectedPayment);

        toast({
          title: "Success",
          description: "Payment successfully matched and processed",
        });

        // Refresh the list
        fetchUnmatchedPayments();
        setSelectedPayment('');
        setSelectedClient('');
      } else {
        throw new Error(data.error || 'Failed to process payment');
      }
    } catch (error: any) {
      console.error('Error matching payment:', error);
      toast({
        title: "Error",
        description: error.message || "Failed to match payment",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const filteredClients = clients.filter(client =>
    client.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    client.phone.includes(searchTerm) ||
    client.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
    client.id_number.includes(searchTerm)
  );

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <AlertCircle className="h-5 w-5 text-orange-500" />
            Payment Reconciliation
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label>Select Unmatched Payment</Label>
              <Select value={selectedPayment} onValueChange={setSelectedPayment}>
                <SelectTrigger>
                  <SelectValue placeholder="Choose unmatched payment" />
                </SelectTrigger>
                <SelectContent>
                  {unmatchedPayments.map((payment) => (
                    <SelectItem key={payment.id} value={payment.id}>
                      {formatKenyanCurrency(payment.amount)} - {payment.mpesa_receipt_number}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label>Search and Select Client</Label>
              <div className="space-y-2">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                  <Input
                    placeholder="Search by name, phone, email, or ID"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-10"
                  />
                </div>
                <Select value={selectedClient} onValueChange={setSelectedClient}>
                  <SelectTrigger>
                    <SelectValue placeholder="Choose client" />
                  </SelectTrigger>
                  <SelectContent>
                    {filteredClients.map((client) => (
                      <SelectItem key={client.id} value={client.id}>
                        {client.name} - {client.phone}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
          </div>

          <Button 
            onClick={matchPaymentToClient}
            disabled={!selectedPayment || !selectedClient || isLoading}
            className="w-full"
          >
            <CheckCircle2 className="h-4 w-4 mr-2" />
            {isLoading ? 'Processing...' : 'Match Payment to Client'}
          </Button>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Unmatched Payments ({unmatchedPayments.length})</CardTitle>
        </CardHeader>
        <CardContent>
          {unmatchedPayments.length === 0 ? (
            <p className="text-center text-gray-500 py-4">No unmatched payments found</p>
          ) : (
            <div className="space-y-2">
              {unmatchedPayments.map((payment) => (
                <div key={payment.id} className="flex items-center justify-between p-3 border rounded-lg">
                  <div className="flex-1">
                    <div className="font-medium">{formatKenyanCurrency(payment.amount)}</div>
                    <div className="text-sm text-gray-500">
                      Receipt: {payment.mpesa_receipt_number}
                    </div>
                    <div className="text-xs text-gray-400">
                      {payment.description}
                    </div>
                  </div>
                  <div className="text-right">
                    <Badge variant="secondary">Pending</Badge>
                    <div className="text-xs text-gray-400 mt-1">
                      {new Date(payment.created_at).toLocaleDateString()}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default PaymentReconciliation;
