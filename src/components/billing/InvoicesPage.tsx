
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Eye, Download, Search, Filter, Plus } from 'lucide-react';
import { useInvoices } from '@/hooks/useInvoices';
import { useInstallationInvoices } from '@/hooks/useInstallationInvoices';
import InvoiceViewer from './InvoiceViewer';
import InstallationInvoiceViewer from '../onboarding/InstallationInvoiceViewer';
import CreateInvoiceDialog from './CreateInvoiceDialog';
import { downloadInvoicePDF, downloadRegularInvoicePDF } from '@/utils/pdfGenerator';

const InvoicesPage = () => {
  const { invoices: regularInvoices, isLoading: regularLoading } = useInvoices();
  const { invoices: installationInvoices, isLoading: installationLoading } = useInstallationInvoices();
  
  const [selectedInvoice, setSelectedInvoice] = useState<any>(null);
  const [selectedInstallationInvoice, setSelectedInstallationInvoice] = useState<any>(null);
  const [showInvoiceViewer, setShowInvoiceViewer] = useState(false);
  const [showInstallationViewer, setShowInstallationViewer] = useState(false);
  const [showCreateDialog, setShowCreateDialog] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');

  const handleViewRegularInvoice = (invoice: any) => {
    setSelectedInvoice(invoice);
    setShowInvoiceViewer(true);
  };

  const handleViewInstallationInvoice = (invoice: any) => {
    setSelectedInstallationInvoice(invoice);
    setShowInstallationViewer(true);
  };

  const handleDownloadRegularInvoice = (invoice: any) => {
    downloadRegularInvoicePDF(invoice);
  };

  const handleDownloadInstallationInvoice = (invoice: any) => {
    downloadInvoicePDF(invoice);
  };

  const filterInvoices = (invoices: any[], type: 'regular' | 'installation') => {
    return invoices.filter((invoice) => {
      const matchesSearch = 
        invoice.invoice_number?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        invoice.clients?.name?.toLowerCase().includes(searchTerm.toLowerCase());
      
      const matchesStatus = statusFilter === 'all' || invoice.status === statusFilter;
      
      return matchesSearch && matchesStatus;
    });
  };

  const getStatusBadge = (status: string) => {
    const statusConfig = {
      pending: { variant: 'destructive' as const, label: 'Pending' },
      paid: { variant: 'default' as const, label: 'Paid' },
      overdue: { variant: 'destructive' as const, label: 'Overdue' },
      draft: { variant: 'secondary' as const, label: 'Draft' },
    };
    
    const config = statusConfig[status as keyof typeof statusConfig] || { 
      variant: 'secondary' as const, 
      label: status 
    };
    
    return <Badge variant={config.variant}>{config.label}</Badge>;
  };

  const InvoiceRow = ({ 
    invoice, 
    type, 
    onView, 
    onDownload 
  }: { 
    invoice: any; 
    type: 'regular' | 'installation';
    onView: (invoice: any) => void;
    onDownload: (invoice: any) => void;
  }) => (
    <tr className="border-b">
      <td className="p-4">
        <div>
          <div className="font-medium">{invoice.invoice_number}</div>
          <div className="text-sm text-muted-foreground">
            {type === 'installation' ? 'Installation' : 'Service'}
          </div>
        </div>
      </td>
      <td className="p-4">
        <div>
          <div className="font-medium">{invoice.clients?.name}</div>
          <div className="text-sm text-muted-foreground">{invoice.clients?.email}</div>
        </div>
      </td>
      <td className="p-4">
        KES {invoice.total_amount?.toLocaleString() || '0'}
      </td>
      <td className="p-4">
        {getStatusBadge(invoice.status)}
      </td>
      <td className="p-4">
        {new Date(invoice.created_at).toLocaleDateString()}
      </td>
      <td className="p-4">
        <div className="flex gap-2">
          <Button
            size="sm"
            variant="outline"
            onClick={() => onView(invoice)}
          >
            <Eye className="h-4 w-4" />
          </Button>
          <Button
            size="sm"
            variant="outline"
            onClick={() => onDownload(invoice)}
          >
            <Download className="h-4 w-4" />
          </Button>
        </div>
      </td>
    </tr>
  );

  const isLoading = regularLoading || installationLoading;
  const allInvoices = [
    ...regularInvoices.map(inv => ({ ...inv, type: 'regular' })),
    ...installationInvoices.map(inv => ({ ...inv, type: 'installation' }))
  ].sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());

  const filteredRegularInvoices = filterInvoices(regularInvoices, 'regular');
  const filteredInstallationInvoices = filterInvoices(installationInvoices, 'installation');
  const filteredAllInvoices = filterInvoices(allInvoices, 'regular');

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold">Invoices</h1>
          <p className="text-muted-foreground">
            Manage service and installation invoices
          </p>
        </div>
        <Button onClick={() => setShowCreateDialog(true)} className="gap-2">
          <Plus className="h-4 w-4" />
          Create Invoice
        </Button>
      </div>

      {/* Filters */}
      <Card>
        <CardContent className="p-4">
          <div className="flex gap-4 items-center">
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search invoices..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="w-32">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Status</SelectItem>
                <SelectItem value="pending">Pending</SelectItem>
                <SelectItem value="paid">Paid</SelectItem>
                <SelectItem value="overdue">Overdue</SelectItem>
                <SelectItem value="draft">Draft</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      <Tabs defaultValue="all" className="w-full">
        <TabsList>
          <TabsTrigger value="all">All Invoices ({allInvoices.length})</TabsTrigger>
          <TabsTrigger value="service">Service Invoices ({regularInvoices.length})</TabsTrigger>
          <TabsTrigger value="installation">Installation Invoices ({installationInvoices.length})</TabsTrigger>
        </TabsList>

        <TabsContent value="all">
          <Card>
            <CardHeader>
              <CardTitle>All Invoices</CardTitle>
            </CardHeader>
            <CardContent>
              {isLoading ? (
                <div className="text-center py-8">Loading invoices...</div>
              ) : filteredAllInvoices.length === 0 ? (
                <div className="text-center py-8 text-muted-foreground">
                  No invoices found
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead>
                      <tr className="border-b">
                        <th className="text-left p-4">Invoice</th>
                        <th className="text-left p-4">Client</th>
                        <th className="text-left p-4">Amount</th>
                        <th className="text-left p-4">Status</th>
                        <th className="text-left p-4">Date</th>
                        <th className="text-left p-4">Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {filteredAllInvoices.map((invoice) => (
                        <InvoiceRow
                          key={`${invoice.type}-${invoice.id}`}
                          invoice={invoice}
                          type={invoice.type as 'regular' | 'installation'}
                          onView={invoice.type === 'installation' ? handleViewInstallationInvoice : handleViewRegularInvoice}
                          onDownload={invoice.type === 'installation' ? handleDownloadInstallationInvoice : handleDownloadRegularInvoice}
                        />
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="service">
          <Card>
            <CardHeader>
              <CardTitle>Service Invoices</CardTitle>
            </CardHeader>
            <CardContent>
              {regularLoading ? (
                <div className="text-center py-8">Loading service invoices...</div>
              ) : filteredRegularInvoices.length === 0 ? (
                <div className="text-center py-8 text-muted-foreground">
                  No service invoices found
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead>
                      <tr className="border-b">
                        <th className="text-left p-4">Invoice</th>
                        <th className="text-left p-4">Client</th>
                        <th className="text-left p-4">Amount</th>
                        <th className="text-left p-4">Status</th>
                        <th className="text-left p-4">Date</th>
                        <th className="text-left p-4">Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {filteredRegularInvoices.map((invoice) => (
                        <InvoiceRow
                          key={invoice.id}
                          invoice={invoice}
                          type="regular"
                          onView={handleViewRegularInvoice}
                          onDownload={handleDownloadRegularInvoice}
                        />
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="installation">
          <Card>
            <CardHeader>
              <CardTitle>Installation Invoices</CardTitle>
            </CardHeader>
            <CardContent>
              {installationLoading ? (
                <div className="text-center py-8">Loading installation invoices...</div>
              ) : filteredInstallationInvoices.length === 0 ? (
                <div className="text-center py-8 text-muted-foreground">
                  No installation invoices found
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead>
                      <tr className="border-b">
                        <th className="text-left p-4">Invoice</th>
                        <th className="text-left p-4">Client</th>
                        <th className="text-left p-4">Amount</th>
                        <th className="text-left p-4">Status</th>
                        <th className="text-left p-4">Date</th>
                        <th className="text-left p-4">Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {filteredInstallationInvoices.map((invoice) => (
                        <InvoiceRow
                          key={invoice.id}
                          invoice={invoice}
                          type="installation"
                          onView={handleViewInstallationInvoice}
                          onDownload={handleDownloadInstallationInvoice}
                        />
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Invoice Viewers */}
      {selectedInvoice && (
        <InvoiceViewer
          invoice={selectedInvoice}
          open={showInvoiceViewer}
          onClose={() => {
            setShowInvoiceViewer(false);
            setSelectedInvoice(null);
          }}
        />
      )}

      {selectedInstallationInvoice && (
        <InstallationInvoiceViewer
          invoice={selectedInstallationInvoice}
          open={showInstallationViewer}
          onClose={() => {
            setShowInstallationViewer(false);
            setSelectedInstallationInvoice(null);
          }}
        />
      )}

      <CreateInvoiceDialog
        open={showCreateDialog}
        onClose={() => setShowCreateDialog(false)}
      />
    </div>
  );
};

export default InvoicesPage;
