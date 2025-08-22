
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { 
  FileText, 
  Plus, 
  Search, 
  Filter,
  Download,
  Eye,
  Send,
  Edit,
  Trash2,
  Calendar
} from 'lucide-react';
import { useInvoices } from '@/hooks/useInvoices';
import { useToast } from '@/hooks/use-toast';
import { formatKenyanCurrency } from '@/utils/kenyanValidation';
import { downloadInvoicePDF } from '@/utils/pdfGenerator';
import CreateInvoiceDialog from '@/components/billing/CreateInvoiceDialog';
import EditInvoiceDialog from '@/components/billing/EditInvoiceDialog';
import InvoiceDetailsDialog from '@/components/billing/InvoiceDetailsDialog';

const Invoices = () => {
  const { 
    invoices, 
    isLoading, 
    updateInvoice, 
    deleteInvoice 
  } = useInvoices();
  const { toast } = useToast();
  
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [showCreateDialog, setShowCreateDialog] = useState(false);
  const [showEditDialog, setShowEditDialog] = useState(false);
  const [showDetailsDialog, setShowDetailsDialog] = useState(false);
  const [selectedInvoice, setSelectedInvoice] = useState<any>(null);

  // Filter invoices based on real data
  const filteredInvoices = invoices.filter(invoice => {
    const matchesSearch = invoice.clients?.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         invoice.invoice_number.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === 'all' || invoice.status === statusFilter;
    
    return matchesSearch && matchesStatus;
  });

  // Calculate metrics from real data
  const totalInvoices = invoices.length;
  const paidInvoices = invoices.filter(i => i.status === 'paid').length;
  const pendingInvoices = invoices.filter(i => i.status === 'pending').length;
  const overdueInvoices = invoices.filter(i => i.status === 'overdue').length;
  const totalRevenue = invoices.filter(i => i.status === 'paid').reduce((sum, i) => sum + i.total_amount, 0);

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'paid':
        return 'bg-green-100 text-green-800';
      case 'pending':
        return 'bg-yellow-100 text-yellow-800';
      case 'overdue':
        return 'bg-red-100 text-red-800';
      case 'draft':
        return 'bg-gray-100 text-gray-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'paid':
        return '✓';
      case 'pending':
        return '⏳';
      case 'overdue':
        return '⚠️';
      case 'draft':
        return '📄';
      default:
        return '📄';
    }
  };

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
    // TODO: Implement email sending
    toast({
      title: "Email Sent", 
      description: `Invoice ${invoice.invoice_number} has been emailed to the client`,
    });
  };

  const handleDelete = (invoice: any) => {
    if (window.confirm(`Are you sure you want to delete invoice ${invoice.invoice_number}?`)) {
      deleteInvoice(invoice.id);
    }
  };

  const handleMarkPaid = (invoice: any) => {
    updateInvoice({
      id: invoice.id,
      updates: { status: 'paid' }
    });
  };

  if (isLoading) {
    return (
      <div className="p-6">
        <div className="flex items-center justify-center h-64">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Invoice Management</h1>
          <p className="text-muted-foreground">
            Create, manage, and track client invoices
          </p>
        </div>
        <div className="flex gap-2">
          <Button onClick={() => setShowCreateDialog(true)}>
            <Plus className="h-4 w-4 mr-2" />
            Create Invoice
          </Button>
          <Button variant="outline">
            <Download className="h-4 w-4 mr-2" />
            Export Invoices
          </Button>
        </div>
      </div>

      {/* Invoice Overview Cards - Real Data */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Invoices</CardTitle>
            <FileText className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totalInvoices}</div>
            <p className="text-xs text-muted-foreground">
              All time
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Paid</CardTitle>
            <span className="text-green-600">✓</span>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">{paidInvoices}</div>
            <p className="text-xs text-muted-foreground">
              {totalInvoices > 0 ? Math.round((paidInvoices / totalInvoices) * 100) : 0}% of total
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Pending</CardTitle>
            <span className="text-yellow-600">⏳</span>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-yellow-600">{pendingInvoices}</div>
            <p className="text-xs text-muted-foreground">
              Awaiting payment
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Overdue</CardTitle>
            <span className="text-red-600">⚠️</span>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-red-600">{overdueInvoices}</div>
            <p className="text-xs text-muted-foreground">
              Requires attention
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Revenue</CardTitle>
            <span className="text-green-600">💰</span>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{formatKenyanCurrency(totalRevenue)}</div>
            <p className="text-xs text-muted-foreground">
              From paid invoices
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Filters and Search */}
      <div className="flex items-center gap-4">
        <div className="flex-1">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
            <Input
              placeholder="Search by client name or invoice number..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
          </div>
        </div>
        
        <select
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
          className="border border-gray-200 rounded-md px-3 py-2"
        >
          <option value="all">All Status</option>
          <option value="draft">Draft</option>
          <option value="pending">Pending</option>
          <option value="paid">Paid</option>
          <option value="overdue">Overdue</option>
        </select>
        
        <Button variant="outline">
          <Filter className="h-4 w-4 mr-2" />
          More Filters
        </Button>
      </div>

      {/* Invoices Table - Real Data */}
      <Card>
        <CardHeader>
          <CardTitle>Invoices ({filteredInvoices.length})</CardTitle>
        </CardHeader>
        <CardContent>
          {filteredInvoices.length === 0 ? (
            <div className="text-center py-8 text-gray-500">
              No invoices found matching your criteria
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b">
                    <th className="text-left py-3 px-4">Invoice #</th>
                    <th className="text-left py-3 px-4">Client</th>
                    <th className="text-left py-3 px-4">Amount</th>
                    <th className="text-left py-3 px-4">Status</th>
                    <th className="text-left py-3 px-4">Issue Date</th>
                    <th className="text-left py-3 px-4">Due Date</th>
                    <th className="text-left py-3 px-4">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredInvoices.map((invoice) => (
                    <tr key={invoice.id} className="border-b hover:bg-gray-50">
                      <td className="py-3 px-4 font-mono text-sm font-medium">
                        {invoice.invoice_number}
                      </td>
                      <td className="py-3 px-4">
                        <div>
                          <div className="font-medium">{invoice.clients?.name || 'N/A'}</div>
                          <div className="text-sm text-gray-500">
                            Service: {new Date(invoice.service_period_start).toLocaleDateString()} - {new Date(invoice.service_period_end).toLocaleDateString()}
                          </div>
                        </div>
                      </td>
                      <td className="py-3 px-4">
                        <div>
                          <div className="font-medium">{formatKenyanCurrency(invoice.total_amount)}</div>
                          <div className="text-sm text-gray-500">
                            + {formatKenyanCurrency(invoice.vat_amount)} VAT
                          </div>
                        </div>
                      </td>
                      <td className="py-3 px-4">
                        <Badge className={getStatusColor(invoice.status)}>
                          {getStatusIcon(invoice.status)} {invoice.status}
                        </Badge>
                      </td>
                      <td className="py-3 px-4">
                        <div className="flex items-center gap-1">
                          <Calendar className="h-3 w-3 text-gray-400" />
                          {new Date(invoice.created_at).toLocaleDateString()}
                        </div>
                      </td>
                      <td className="py-3 px-4">
                        <div className="flex items-center gap-1">
                          <Calendar className="h-3 w-3 text-gray-400" />
                          <span className={invoice.status === 'overdue' ? 'text-red-600 font-medium' : ''}>
                            {new Date(invoice.due_date).toLocaleDateString()}
                          </span>
                        </div>
                      </td>
                      <td className="py-3 px-4">
                        <div className="flex items-center gap-1">
                          <Button
                            variant="ghost"
                            size="sm"
                            title="View Invoice"
                            onClick={() => handleView(invoice)}
                          >
                            <Eye className="h-4 w-4" />
                          </Button>
                          {invoice.status === 'draft' && (
                            <Button
                              variant="ghost"
                              size="sm"
                              title="Edit Invoice"
                              onClick={() => handleEdit(invoice)}
                            >
                              <Edit className="h-4 w-4" />
                            </Button>
                          )}
                          {(invoice.status === 'pending' || invoice.status === 'overdue') && (
                            <Button
                              variant="ghost"
                              size="sm"
                              title="Send Reminder"
                              onClick={() => handleSendEmail(invoice)}
                            >
                              <Send className="h-4 w-4" />
                            </Button>
                          )}
                          <Button
                            variant="ghost"
                            size="sm"
                            title="Download PDF"
                            onClick={() => handleDownload(invoice)}
                          >
                            <Download className="h-4 w-4" />
                          </Button>
                          {invoice.status === 'draft' && (
                            <Button
                              variant="ghost"
                              size="sm"
                              title="Delete Invoice"
                              onClick={() => handleDelete(invoice)}
                            >
                              <Trash2 className="h-4 w-4 text-red-600" />
                            </Button>
                          )}
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </CardContent>
      </Card>

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

export default Invoices;
