
import React, { useState } from 'react';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import InvoiceActions from './InvoiceActions';
import { useInvoices } from '@/hooks/useInvoices';
import { Plus, Search, RefreshCw } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { useToast } from '@/hooks/use-toast';
import { formatKenyanCurrency } from '@/utils/kenyanValidation';

const InvoiceList = () => {
  const { invoices, isLoading, updateInvoice } = useInvoices();
  const { toast } = useToast();
  const [searchTerm, setSearchTerm] = useState('');

  const handleView = (invoice: any) => {
    toast({
      title: "View Invoice",
      description: `Opening invoice ${invoice.invoice_number}`,
    });
  };

  const handleDownload = (invoice: any) => {
    toast({
      title: "Download Invoice",
      description: `Downloading invoice ${invoice.invoice_number}`,
    });
  };

  const handleSendEmail = (invoice: any) => {
    toast({
      title: "Email Sent",
      description: `Invoice ${invoice.invoice_number} has been emailed to the client`,
    });
  };

  const handleMarkPaid = (invoice: any) => {
    updateInvoice({
      id: invoice.id,
      updates: { status: 'paid' }
    });
  };

  const handleInitiatePayment = (invoice: any) => {
    toast({
      title: "Payment Initiated",
      description: `Payment process started for invoice ${invoice.invoice_number}`,
    });
  };

  const filteredInvoices = invoices.filter(invoice => 
    invoice.invoice_number.toLowerCase().includes(searchTerm.toLowerCase()) ||
    invoice.clients?.name?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const getStatusBadge = (status: string) => {
    const colors = {
      paid: 'bg-green-100 text-green-800',
      pending: 'bg-yellow-100 text-yellow-800',
      overdue: 'bg-red-100 text-red-800',
      draft: 'bg-gray-100 text-gray-800'
    };
    
    return colors[status as keyof typeof colors] || 'bg-gray-100 text-gray-800';
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center p-8">
        <RefreshCw className="h-6 w-6 animate-spin mr-2" />
        <span>Loading invoices...</span>
      </div>
    );
  }

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle>Invoice Management</CardTitle>
          <Button className="flex items-center gap-2">
            <Plus className="h-4 w-4" />
            Create Invoice
          </Button>
        </div>
        <div className="flex items-center gap-2">
          <Search className="h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search invoices..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="max-w-sm"
          />
        </div>
      </CardHeader>
      <CardContent>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Invoice #</TableHead>
              <TableHead>Client</TableHead>
              <TableHead>Amount</TableHead>
              <TableHead>Due Date</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredInvoices.map((invoice) => (
              <TableRow key={invoice.id}>
                <TableCell className="font-medium">{invoice.invoice_number}</TableCell>
                <TableCell>{invoice.clients?.name || 'N/A'}</TableCell>
                <TableCell>{formatKenyanCurrency(invoice.total_amount)}</TableCell>
                <TableCell>{new Date(invoice.due_date).toLocaleDateString()}</TableCell>
                <TableCell>
                  <span className={`px-2 py-1 rounded-full text-xs ${getStatusBadge(invoice.status)}`}>
                    {invoice.status}
                  </span>
                </TableCell>
                <TableCell>
                  <InvoiceActions
                    invoice={invoice}
                    onView={() => handleView(invoice)}
                    onDownload={() => handleDownload(invoice)}
                    onSendEmail={() => handleSendEmail(invoice)}
                    onMarkPaid={() => handleMarkPaid(invoice)}
                    onInitiatePayment={() => handleInitiatePayment(invoice)}
                  />
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
        
        {filteredInvoices.length === 0 && (
          <div className="text-center py-8 text-gray-500">
            <p>No invoices found</p>
            <p className="text-sm">Create your first invoice to get started</p>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default InvoiceList;
