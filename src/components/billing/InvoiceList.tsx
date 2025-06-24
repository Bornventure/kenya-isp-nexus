
import React, { useState } from 'react';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import InvoiceActions from './InvoiceActions';
import { Invoice } from '@/hooks/useInvoices';
import { Plus, Search } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { useToast } from '@/hooks/use-toast';

const InvoiceList = () => {
  const { toast } = useToast();
  const [searchTerm, setSearchTerm] = useState('');

  // Mock data for demonstration with all required Invoice properties
  const [invoices] = useState<Invoice[]>([
    {
      id: '1',
      invoice_number: 'INV-001',
      client_id: 'client1',
      amount: 2500,
      vat_amount: 400,
      total_amount: 2900,
      status: 'paid',
      due_date: new Date('2024-01-15').toISOString(),
      service_period_start: new Date('2024-01-01').toISOString(),
      service_period_end: new Date('2024-01-31').toISOString(),
      notes: null,
      isp_company_id: 'company1',
      created_at: new Date('2024-01-01').toISOString(),
      updated_at: new Date('2024-01-01').toISOString(),
      clients: {
        name: 'John Doe',
        email: 'john@example.com'
      }
    },
    {
      id: '2',
      invoice_number: 'INV-002',
      client_id: 'client2',
      amount: 1500,
      vat_amount: 240,
      total_amount: 1740,
      status: 'pending',
      due_date: new Date('2024-02-15').toISOString(),
      service_period_start: new Date('2024-02-01').toISOString(),
      service_period_end: new Date('2024-02-28').toISOString(),
      notes: null,
      isp_company_id: 'company1',
      created_at: new Date('2024-02-01').toISOString(),
      updated_at: new Date('2024-02-01').toISOString(),
      clients: {
        name: 'Jane Smith',
        email: 'jane@example.com'
      }
    },
  ]);

  const handleView = (invoice: Invoice) => {
    toast({
      title: "View Invoice",
      description: `Opening invoice ${invoice.invoice_number}`,
    });
  };

  const handleDownload = (invoice: Invoice) => {
    toast({
      title: "Download Invoice",
      description: `Downloading invoice ${invoice.invoice_number}`,
    });
  };

  const handleSendEmail = (invoice: Invoice) => {
    toast({
      title: "Email Sent",
      description: `Invoice ${invoice.invoice_number} has been emailed to the client`,
    });
  };

  const handleMarkPaid = (invoice: Invoice) => {
    toast({
      title: "Invoice Updated",
      description: `Invoice ${invoice.invoice_number} has been marked as paid`,
    });
  };

  const handleInitiatePayment = (invoice: Invoice) => {
    toast({
      title: "Payment Initiated",
      description: `Payment process started for invoice ${invoice.invoice_number}`,
    });
  };

  const filteredInvoices = invoices.filter(invoice => 
    invoice.invoice_number.toLowerCase().includes(searchTerm.toLowerCase())
  );

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
                <TableCell>{invoice.clients?.name || invoice.client_id}</TableCell>
                <TableCell>KES {invoice.total_amount.toLocaleString()}</TableCell>
                <TableCell>{new Date(invoice.due_date).toLocaleDateString()}</TableCell>
                <TableCell>
                  <span className={`px-2 py-1 rounded-full text-xs ${
                    invoice.status === 'paid' 
                      ? 'bg-green-100 text-green-800' 
                      : 'bg-yellow-100 text-yellow-800'
                  }`}>
                    {invoice.status}
                  </span>
                </TableCell>
                <TableCell>
                  <InvoiceActions
                    invoice={invoice}
                    onView={() => toast({ title: "View Invoice", description: `Opening invoice ${invoice.invoice_number}` })}
                    onDownload={() => toast({ title: "Download Invoice", description: `Downloading invoice ${invoice.invoice_number}` })}
                    onSendEmail={() => toast({ title: "Email Sent", description: `Invoice ${invoice.invoice_number} has been emailed` })}
                    onMarkPaid={() => toast({ title: "Invoice Updated", description: `Invoice ${invoice.invoice_number} marked as paid` })}
                    onInitiatePayment={() => toast({ title: "Payment Initiated", description: `Payment process started for ${invoice.invoice_number}` })}
                  />
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  );
};

export default InvoiceList;
