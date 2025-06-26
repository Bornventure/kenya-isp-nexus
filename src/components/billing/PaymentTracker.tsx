
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Plus, Search, RefreshCw } from 'lucide-react';
import { usePayments } from '@/hooks/usePayments';
import { formatKenyanCurrency } from '@/utils/kenyanValidation';
import PaymentForm from './PaymentForm';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';

const PaymentTracker: React.FC = () => {
  const { payments, isLoading } = usePayments();
  const [searchTerm, setSearchTerm] = useState('');

  const filteredPayments = payments.filter(payment => 
    payment.clients?.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    payment.reference_number?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    payment.mpesa_receipt_number?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const getPaymentMethodBadge = (method: string) => {
    const colors = {
      mpesa: 'bg-green-100 text-green-800',
      bank: 'bg-blue-100 text-blue-800',
      cash: 'bg-orange-100 text-orange-800',
    };
    
    return (
      <Badge className={colors[method as keyof typeof colors] || 'bg-gray-100 text-gray-800'}>
        {method.toUpperCase()}
      </Badge>
    );
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

  if (isLoading) {
    return (
      <div className="flex items-center justify-center p-8">
        <RefreshCw className="h-6 w-6 animate-spin mr-2" />
        <span>Loading payments...</span>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold">Payment Tracker</h2>
          <p className="text-muted-foreground">
            Monitor and record client payments
          </p>
        </div>
        <Dialog>
          <DialogTrigger asChild>
            <Button>
              <Plus className="h-4 w-4 mr-2" />
              Record Payment
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>Record New Payment</DialogTitle>
            </DialogHeader>
            <PaymentForm />
          </DialogContent>
        </Dialog>
      </div>

      {/* Search */}
      <Card>
        <CardContent className="p-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
            <Input
              placeholder="Search payments by client, reference, or receipt number..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
          </div>
        </CardContent>
      </Card>

      {/* Payments Table */}
      <Card>
        <CardHeader>
          <CardTitle>Recent Payments ({filteredPayments.length})</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="rounded-md border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Date</TableHead>
                  <TableHead>Client</TableHead>
                  <TableHead>Amount</TableHead>
                  <TableHead>Method</TableHead>
                  <TableHead>Reference</TableHead>
                  <TableHead>Receipt</TableHead>
                  <TableHead>Notes</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredPayments.map((payment) => (
                  <TableRow key={payment.id}>
                    <TableCell className="font-medium">
                      {formatDate(payment.payment_date)}
                    </TableCell>
                    <TableCell>{payment.clients?.name || 'N/A'}</TableCell>
                    <TableCell className="font-semibold">
                      {formatKenyanCurrency(payment.amount)}
                    </TableCell>
                    <TableCell>
                      {getPaymentMethodBadge(payment.payment_method)}
                    </TableCell>
                    <TableCell className="font-mono text-sm">
                      {payment.reference_number || '-'}
                    </TableCell>
                    <TableCell className="font-mono text-sm">
                      {payment.mpesa_receipt_number || '-'}
                    </TableCell>
                    <TableCell className="max-w-xs truncate">
                      {payment.notes || '-'}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>

            {filteredPayments.length === 0 && (
              <div className="text-center py-8 text-gray-500">
                <p>No payments found</p>
                <p className="text-sm">Record your first payment to get started</p>
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default PaymentTracker;
