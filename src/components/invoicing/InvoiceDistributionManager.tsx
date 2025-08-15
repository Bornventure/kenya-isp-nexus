
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import {
  FileText,
  Send,
  Mail,
  MessageCircle,
  Phone,
  Eye,
  Download,
  Clock,
  CheckCircle,
  AlertCircle,
  Copy,
  ExternalLink
} from 'lucide-react';
import { useInstallationInvoices } from '@/hooks/useInstallationInvoices';
import { useAuth } from '@/contexts/AuthContext';

const InvoiceDistributionManager: React.FC = () => {
  const { invoices, updateInstallationInvoice, isUpdating } = useInstallationInvoices();
  const { profile } = useAuth();
  const [selectedInvoice, setSelectedInvoice] = useState<any>(null);
  const [distributionMethod, setDistributionMethod] = useState<string>('');
  const [showInvoiceDialog, setShowInvoiceDialog] = useState(false);

  const pendingInvoices = invoices.filter(inv => inv.status === 'pending');
  const distributedInvoices = invoices.filter(inv => inv.distributed_at);

  const handleDistributeInvoice = async (invoiceId: string, method: string) => {
    updateInstallationInvoice({
      id: invoiceId,
      updates: {
        distribution_method: method,
        distributed_at: new Date().toISOString(),
        distributed_by: profile?.id,
      }
    });
  };

  const getDistributionIcon = (method: string) => {
    switch (method) {
      case 'email': return <Mail className="h-4 w-4" />;
      case 'whatsapp': return <MessageCircle className="h-4 w-4" />;
      case 'sms': return <Phone className="h-4 w-4" />;
      default: return <Send className="h-4 w-4" />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'pending': return 'bg-yellow-100 text-yellow-800';
      case 'paid': return 'bg-green-100 text-green-800';
      case 'overdue': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const copyTrackingNumber = (trackingNumber: string) => {
    navigator.clipboard.writeText(trackingNumber);
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold">Invoice Distribution Manager</h1>
        <Badge variant="outline" className="text-sm">
          {pendingInvoices.length} Pending Distribution
        </Badge>
      </div>

      <Tabs defaultValue="pending" className="space-y-4">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="pending">
            Pending Distribution ({pendingInvoices.length})
          </TabsTrigger>
          <TabsTrigger value="distributed">
            Distributed ({distributedInvoices.length})
          </TabsTrigger>
        </TabsList>

        <TabsContent value="pending" className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {pendingInvoices.map((invoice) => (
              <Card key={invoice.id}>
                <CardHeader className="pb-3">
                  <CardTitle className="text-sm flex items-center justify-between">
                    <span className="flex items-center gap-2">
                      <FileText className="h-4 w-4" />
                      {invoice.invoice_number}
                    </span>
                    <Badge className={getStatusColor(invoice.status)}>
                      {invoice.status}
                    </Badge>
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div className="space-y-2 text-sm">
                    <p><strong>Client:</strong> {invoice.clients?.name}</p>
                    <p><strong>Phone:</strong> {invoice.clients?.phone}</p>
                    <p><strong>Amount:</strong> KES {invoice.total_amount}</p>
                    {invoice.tracking_number && (
                      <div className="flex items-center gap-2">
                        <span><strong>Tracking:</strong> {invoice.tracking_number}</span>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => copyTrackingNumber(invoice.tracking_number)}
                        >
                          <Copy className="h-3 w-3" />
                        </Button>
                      </div>
                    )}
                  </div>

                  <div className="space-y-2">
                    <Select
                      value={distributionMethod}
                      onValueChange={setDistributionMethod}
                    >
                      <SelectTrigger className="h-8 text-xs">
                        <SelectValue placeholder="Select distribution method" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="email">
                          <div className="flex items-center gap-2">
                            <Mail className="h-3 w-3" />
                            Email
                          </div>
                        </SelectItem>
                        <SelectItem value="whatsapp">
                          <div className="flex items-center gap-2">
                            <MessageCircle className="h-3 w-3" />
                            WhatsApp
                          </div>
                        </SelectItem>
                        <SelectItem value="sms">
                          <div className="flex items-center gap-2">
                            <Phone className="h-3 w-3" />
                            SMS
                          </div>
                        </SelectItem>
                      </SelectContent>
                    </Select>

                    <div className="flex gap-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => {
                          setSelectedInvoice(invoice);
                          setShowInvoiceDialog(true);
                        }}
                        className="flex-1"
                      >
                        <Eye className="h-3 w-3 mr-1" />
                        Preview
                      </Button>
                      <Button
                        size="sm"
                        onClick={() => handleDistributeInvoice(invoice.id, distributionMethod)}
                        disabled={!distributionMethod || isUpdating}
                        className="flex-1"
                      >
                        <Send className="h-3 w-3 mr-1" />
                        Send
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>

          {pendingInvoices.length === 0 && (
            <Card>
              <CardContent className="text-center py-12">
                <CheckCircle className="h-12 w-12 mx-auto text-green-500 mb-4" />
                <h3 className="text-lg font-medium mb-2">All Invoices Distributed</h3>
                <p className="text-muted-foreground">
                  There are no pending invoices awaiting distribution.
                </p>
              </CardContent>
            </Card>
          )}
        </TabsContent>

        <TabsContent value="distributed" className="space-y-4">
          <div className="space-y-4">
            {distributedInvoices.map((invoice) => (
              <Card key={invoice.id}>
                <CardContent className="p-4">
                  <div className="flex items-center justify-between">
                    <div className="space-y-1">
                      <div className="flex items-center gap-2">
                        <h3 className="font-medium">{invoice.invoice_number}</h3>
                        <Badge className={getStatusColor(invoice.status)}>
                          {invoice.status}
                        </Badge>
                        {invoice.distribution_method && (
                          <Badge variant="outline" className="flex items-center gap-1">
                            {getDistributionIcon(invoice.distribution_method)}
                            {invoice.distribution_method}
                          </Badge>
                        )}
                      </div>
                      <div className="text-sm text-muted-foreground">
                        <p>Client: {invoice.clients?.name} • Phone: {invoice.clients?.phone}</p>
                        <p>Amount: KES {invoice.total_amount} • Tracking: {invoice.tracking_number}</p>
                        {invoice.distributed_at && (
                          <p>Distributed: {new Date(invoice.distributed_at).toLocaleString()}</p>
                        )}
                      </div>
                    </div>
                    <div className="flex gap-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => {
                          setSelectedInvoice(invoice);
                          setShowInvoiceDialog(true);
                        }}
                      >
                        <Eye className="h-4 w-4 mr-2" />
                        View
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>

          {distributedInvoices.length === 0 && (
            <Card>
              <CardContent className="text-center py-12">
                <Clock className="h-12 w-12 mx-auto text-gray-400 mb-4" />
                <h3 className="text-lg font-medium mb-2">No Distributed Invoices</h3>
                <p className="text-muted-foreground">
                  Distributed invoices will appear here once you start sending them.
                </p>
              </CardContent>
            </Card>
          )}
        </TabsContent>
      </Tabs>

      {/* Invoice Preview Dialog */}
      <Dialog open={showInvoiceDialog} onOpenChange={setShowInvoiceDialog}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>
              Invoice Preview - {selectedInvoice?.invoice_number}
            </DialogTitle>
          </DialogHeader>
          
          {selectedInvoice && (
            <div className="space-y-6">
              {/* Invoice Header */}
              <div className="text-center border-b pb-4">
                <h2 className="text-2xl font-bold">Installation Invoice</h2>
                <p className="text-muted-foreground">
                  Invoice #: {selectedInvoice.invoice_number}
                </p>
                {selectedInvoice.tracking_number && (
                  <p className="text-sm">
                    Tracking #: {selectedInvoice.tracking_number}
                  </p>
                )}
              </div>

              {/* Client Details */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <h3 className="font-medium mb-2">Bill To:</h3>
                  <div className="space-y-1 text-sm">
                    <p>{selectedInvoice.clients?.name}</p>
                    <p>{selectedInvoice.clients?.phone}</p>
                    <p>{selectedInvoice.clients?.email}</p>
                    <p>{selectedInvoice.clients?.address}</p>
                  </div>
                </div>
                <div>
                  <h3 className="font-medium mb-2">Invoice Details:</h3>
                  <div className="space-y-1 text-sm">
                    <p>Date: {new Date(selectedInvoice.created_at).toLocaleDateString()}</p>
                    <p>Status: {selectedInvoice.status}</p>
                    {selectedInvoice.distributed_at && (
                      <p>Sent: {new Date(selectedInvoice.distributed_at).toLocaleDateString()}</p>
                    )}
                  </div>
                </div>
              </div>

              {/* Invoice Items */}
              <div>
                <table className="w-full border-collapse border border-gray-300">
                  <thead>
                    <tr className="bg-gray-50">
                      <th className="border border-gray-300 p-2 text-left">Description</th>
                      <th className="border border-gray-300 p-2 text-right">Amount</th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr>
                      <td className="border border-gray-300 p-2">Installation Service</td>
                      <td className="border border-gray-300 p-2 text-right">
                        KES {selectedInvoice.amount}
                      </td>
                    </tr>
                    <tr>
                      <td className="border border-gray-300 p-2">VAT (16%)</td>
                      <td className="border border-gray-300 p-2 text-right">
                        KES {selectedInvoice.vat_amount}
                      </td>
                    </tr>
                    <tr className="font-bold">
                      <td className="border border-gray-300 p-2">Total</td>
                      <td className="border border-gray-300 p-2 text-right">
                        KES {selectedInvoice.total_amount}
                      </td>
                    </tr>
                  </tbody>
                </table>
              </div>

              {/* Payment Instructions */}
              <div className="bg-blue-50 p-4 rounded">
                <h3 className="font-medium mb-2">Payment Instructions:</h3>
                <div className="space-y-1 text-sm">
                  <p>• Pay via M-Pesa Paybill: <strong>123456</strong></p>
                  <p>• Account Number: <strong>{selectedInvoice.clients?.phone}</strong></p>
                  <p>• Amount: <strong>KES {selectedInvoice.total_amount}</strong></p>
                  <p>• Reference: <strong>{selectedInvoice.tracking_number}</strong></p>
                </div>
              </div>

              {selectedInvoice.notes && (
                <div>
                  <h3 className="font-medium mb-2">Notes:</h3>
                  <p className="text-sm text-muted-foreground">{selectedInvoice.notes}</p>
                </div>
              )}
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default InvoiceDistributionManager;
