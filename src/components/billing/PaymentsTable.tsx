
import React, { useState } from 'react';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Download, Search, RefreshCw, Receipt } from 'lucide-react';
import { formatKenyanCurrency } from '@/utils/kenyanValidation';
import { downloadReceiptPDF } from '@/utils/pdfGenerator';
import { useToast } from '@/hooks/use-toast';
import type { Payment } from '@/hooks/usePayments';

interface PaymentsTableProps {
  payments: Payment[];
}

const PaymentsTable: React.FC<PaymentsTableProps> = ({ payments }) => {
  const { toast } = useToast();
  const [searchTerm, setSearchTerm] = useState('');

  const filteredPayments = payments.filter(payment => 
    payment.clients?.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    payment.reference_number?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    payment.payment_method.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'completed':
      case 'received':
      case 'verified':
        return 'bg-green-100 text-green-800';
      case 'pending':
        return 'bg-yellow-100 text-yellow-800';
      case 'failed':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const handleDownloadReceipt = (payment: Payment) => {
    try {
      downloadReceiptPDF(payment);
      toast({
        title: "Receipt Downloaded",
        description: `Receipt for payment ${payment.reference_number} downloaded successfully`,
      });
    } catch (error) {
      toast({
        title: "Download Failed",
        description: "Failed to generate receipt. Please try again.",
        variant: "destructive",
      });
    }
  };

  const handleExportPayments = () => {
    try {
      const csvData = filteredPayments.map(payment => [
        payment.payment_date,
        payment.clients?.name || 'N/A',
        payment.amount,
        payment.payment_method,
        payment.reference_number || '',
        payment.status
      ]);

      const headers = ['Date', 'Client', 'Amount', 'Method', 'Reference', 'Status'];
      const csvContent = [headers, ...csvData]
        .map(row => row.map(cell => `"${cell}"`).join(','))
        .join('\n');

      const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
      const link = document.createElement('a');
      const url = URL.createObjectURL(blob);
      link.setAttribute('href', url);
      link.setAttribute('download', `payments-${new Date().toISOString().split('T')[0]}.csv`);
      link.style.visibility = 'hidden';
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);

      toast({
        title: "Export Complete",
        description: `${filteredPayments.length} payments exported successfully`,
      });
    } catch (error) {
      toast({
        title: "Export Failed",
        description: "Failed to export payments. Please try again.",
        variant: "destructive",
      });
    }
  };

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle>Payment History ({filteredPayments.length})</CardTitle>
          <div className="flex items-center gap-2">
            <Button variant="outline" size="sm" onClick={handleExportPayments}>
              <Download className="h-4 w-4 mr-2" />
              Export CSV
            </Button>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <Search className="h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search payments..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="max-w-sm"
          />
        </div>
      </CardHeader>
      <CardContent>
        {filteredPayments.length === 0 ? (
          <div className="text-center py-8 text-gray-500">
            <p>No payments found</p>
            <p className="text-sm">Payments will appear here once received</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Date</TableHead>
                  <TableHead>Client</TableHead>
                  <TableHead>Amount</TableHead>
                  <TableHead>Method</TableHead>
                  <TableHead>Reference</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredPayments.map((payment) => (
                  <TableRow key={payment.id}>
                    <TableCell>
                      {new Date(payment.payment_date).toLocaleDateString()}
                    </TableCell>
                    <TableCell>
                      <div>
                        <div className="font-medium">{payment.clients?.name || 'N/A'}</div>
                        <div className="text-sm text-gray-500">{payment.clients?.phone}</div>
                      </div>
                    </TableCell>
                    <TableCell className="font-medium">
                      {formatKenyanCurrency(payment.amount)}
                    </TableCell>
                    <TableCell>
                      <Badge variant="outline">{payment.payment_method}</Badge>
                    </TableCell>
                    <TableCell className="font-mono text-sm">
                      {payment.reference_number || payment.mpesa_receipt_number || 'N/A'}
                    </TableCell>
                    <TableCell>
                      <Badge className={getStatusBadge(payment.status)}>
                        {payment.status}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-1">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleDownloadReceipt(payment)}
                          title="Download Receipt"
                        >
                          <Receipt className="h-4 w-4" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default PaymentsTable;
