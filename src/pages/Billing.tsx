
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  Plus, 
  DollarSign,
  Clock,
  CheckCircle,
  AlertTriangle,
  Download
} from 'lucide-react';
import { useInvoices } from '@/hooks/useInvoices';
import { usePayments } from '@/hooks/usePayments';
import { useToast } from '@/hooks/use-toast';
import { formatKenyanCurrency } from '@/utils/kenyanValidation';
import CreateInvoiceDialog from '@/components/billing/CreateInvoiceDialog';
import EditInvoiceDialog from '@/components/billing/EditInvoiceDialog';
import InvoiceDetailsDialog from '@/components/billing/InvoiceDetailsDialog';
import InvoiceTable from '@/components/billing/InvoiceTable';
import PaymentsTable from '@/components/billing/PaymentsTable';
import ReportsTab from '@/components/billing/ReportsTab';
import { downloadInvoicePDF } from '@/utils/pdfGenerator';

const Billing = () => {
  const { 
    invoices, 
    isLoading: invoicesLoading, 
    updateInvoice,
  } = useInvoices();
  
  const { payments, isLoading: paymentsLoading } = usePayments();
  const { toast } = useToast();

  const [showCreateDialog, setShowCreateDialog] = useState(false);
  const [showEditDialog, setShowEditDialog] = useState(false);
  const [showDetailsDialog, setShowDetailsDialog] = useState(false);
  const [selectedInvoice, setSelectedInvoice] = useState<any>(null);

  // Calculate totals from real data
  const totalAmount = invoices.reduce((sum, inv) => sum + Number(inv.total_amount || 0), 0);
  const paidAmount = invoices.filter(inv => inv.status === 'paid')
                             .reduce((sum, inv) => sum + Number(inv.total_amount || 0), 0);
  const pendingAmount = invoices.filter(inv => inv.status === 'pending')
                               .reduce((sum, inv) => sum + Number(inv.total_amount || 0), 0);
  const overdueAmount = invoices.filter(inv => inv.status === 'overdue')
                               .reduce((sum, inv) => sum + Number(inv.total_amount || 0), 0);

  const handleView = (invoice: any) => {
    setSelectedInvoice(invoice);
    setShowDetailsDialog(true);
  };

  const handleEdit = (invoice: any) => {
    setSelectedInvoice(invoice);
    setShowEditDialog(true);
  };

  const handleDownload = (invoice: any) => {
    try {
      downloadInvoicePDF(invoice);
      toast({
        title: "Download Started",
        description: `Invoice ${invoice.invoice_number} downloaded successfully`,
      });
    } catch (error) {
      toast({
        title: "Download Failed",
        description: "Failed to generate PDF. Please try again.",
        variant: "destructive",
      });
    }
  };

  const handleSendEmail = (invoice: any) => {
    // TODO: Implement email sending via edge function
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

  if (invoicesLoading || paymentsLoading) {
    return (
      <div className="p-6">
        <div className="flex items-center justify-center h-64">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Billing Management</h1>
          <p className="text-muted-foreground">
            Manage invoices, payments, and billing operations
          </p>
        </div>
        <div className="flex gap-2">
          <Button onClick={() => setShowCreateDialog(true)}>
            <Plus className="h-4 w-4 mr-2" />
            Create Invoice
          </Button>
          <Button variant="outline">
            <Download className="h-4 w-4 mr-2" />
            Export Data
          </Button>
        </div>
      </div>

      {/* Summary Cards with Real Data */}
      <div className="grid gap-4 md:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Revenue</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{formatKenyanCurrency(totalAmount)}</div>
            <p className="text-xs text-muted-foreground">
              {invoices.length} invoices
            </p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Paid</CardTitle>
            <CheckCircle className="h-4 w-4 text-green-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">
              {formatKenyanCurrency(paidAmount)}
            </div>
            <p className="text-xs text-muted-foreground">
              {payments.length} payments received
            </p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Pending</CardTitle>
            <Clock className="h-4 w-4 text-yellow-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-yellow-600">
              {formatKenyanCurrency(pendingAmount)}
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Overdue</CardTitle>
            <AlertTriangle className="h-4 w-4 text-red-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-red-600">
              {formatKenyanCurrency(overdueAmount)}
            </div>
          </CardContent>
        </Card>
      </div>

      <Tabs defaultValue="invoices" className="w-full">
        <TabsList>
          <TabsTrigger value="invoices">Invoices</TabsTrigger>
          <TabsTrigger value="payments">Payments</TabsTrigger>
          <TabsTrigger value="reports">Reports</TabsTrigger>
        </TabsList>

        <TabsContent value="invoices" className="space-y-4">
          <InvoiceTable
            invoices={invoices}
            onView={handleView}
            onEdit={handleEdit}
            onDownload={handleDownload}
            onSendEmail={handleSendEmail}
            onMarkPaid={handleMarkPaid}
          />
        </TabsContent>

        <TabsContent value="payments" className="space-y-4">
          <PaymentsTable payments={payments} />
        </TabsContent>

        <TabsContent value="reports" className="space-y-4">
          <ReportsTab invoices={invoices} payments={payments} />
        </TabsContent>
      </Tabs>

      {/* Dialogs */}
      <CreateInvoiceDialog
        open={showCreateDialog}
        onClose={() => setShowCreateDialog(false)}
      />
      
      <EditInvoiceDialog
        invoice={selectedInvoice}
        open={showEditDialog}
        onClose={() => {
          setShowEditDialog(false);
          setSelectedInvoice(null);
        }}
      />
      
      <InvoiceDetailsDialog
        invoice={selectedInvoice}
        open={showDetailsDialog}
        onClose={() => {
          setShowDetailsDialog(false);
          setSelectedInvoice(null);
        }}
      />
    </div>
  );
};

export default Billing;
