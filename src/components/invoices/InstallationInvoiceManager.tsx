
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { useInstallationInvoices } from '@/hooks/useInstallationInvoices';
import { useClients } from '@/hooks/useClients';
import { useToast } from '@/hooks/use-toast';
import { Receipt, Send, MessageSquare, Eye, Download, CheckCircle, Clock, XCircle } from 'lucide-react';
import { formatKenyanCurrency } from '@/utils/currencyFormat';

const InstallationInvoiceManager: React.FC = () => {
  const { invoices, isLoading, createInstallationInvoice, updateInstallationInvoice } = useInstallationInvoices();
  const { clients } = useClients();
  const { toast } = useToast();
  const [showCreateDialog, setShowCreateDialog] = useState(false);
  const [showSendDialog, setShowSendDialog] = useState(false);
  const [selectedInvoice, setSelectedInvoice] = useState<any>(null);
  const [sendMethod, setSendMethod] = useState<'email' | 'whatsapp'>('email');

  const [formData, setFormData] = useState({
    client_id: '',
    equipment_details: {},
    notes: ''
  });

  const handleCreateInvoice = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.client_id) {
      toast({
        title: "Error",
        description: "Please select a client",
        variant: "destructive",
      });
      return;
    }

    createInstallationInvoice(formData);
    setShowCreateDialog(false);
    setFormData({ client_id: '', equipment_details: {}, notes: '' });
  };

  const handleSendInvoice = (invoice: any, method: 'email' | 'whatsapp') => {
    setSelectedInvoice(invoice);
    setSendMethod(method);
    setShowSendDialog(true);
  };

  const confirmSendInvoice = () => {
    if (!selectedInvoice) return;

    // Here you would integrate with your SMS/Email service
    toast({
      title: "Invoice Sent",
      description: `Installation invoice sent via ${sendMethod} to ${selectedInvoice.clients?.name}`,
    });
    
    setShowSendDialog(false);
    setSelectedInvoice(null);
  };

  const markAsPaid = (invoiceId: string) => {
    updateInstallationInvoice({
      id: invoiceId,
      updates: {
        status: 'paid',
        paid_at: new Date().toISOString()
      }
    });
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'paid':
        return <CheckCircle className="h-4 w-4 text-green-600" />;
      case 'pending':
        return <Clock className="h-4 w-4 text-yellow-600" />;
      case 'overdue':
        return <XCircle className="h-4 w-4 text-red-600" />;
      default:
        return <Clock className="h-4 w-4 text-gray-600" />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'paid':
        return 'bg-green-100 text-green-800';
      case 'pending':
        return 'bg-yellow-100 text-yellow-800';
      case 'overdue':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center p-8">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Installation Invoices</h1>
          <p className="text-gray-600">Manage installation invoices and track payments</p>
        </div>
        <Button onClick={() => setShowCreateDialog(true)}>
          <Receipt className="h-4 w-4 mr-2" />
          Create Invoice
        </Button>
      </div>

      <div className="grid gap-6">
        {invoices.map((invoice) => (
          <Card key={invoice.id}>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle className="flex items-center gap-2">
                    {getStatusIcon(invoice.status)}
                    Invoice {invoice.invoice_number}
                  </CardTitle>
                  <p className="text-sm text-gray-600">
                    Client: {invoice.clients?.name} | Phone: {invoice.clients?.phone}
                  </p>
                </div>
                <Badge className={getStatusColor(invoice.status)}>
                  {invoice.status.charAt(0).toUpperCase() + invoice.status.slice(1)}
                </Badge>
              </div>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
                <div>
                  <Label className="text-sm font-medium">Amount</Label>
                  <p className="text-lg font-semibold">{formatKenyanCurrency(invoice.total_amount)}</p>
                </div>
                <div>
                  <Label className="text-sm font-medium">Created</Label>
                  <p>{new Date(invoice.created_at).toLocaleDateString()}</p>
                </div>
                <div>
                  <Label className="text-sm font-medium">Tracking Number</Label>
                  <p className="font-mono text-sm">{invoice.invoice_number}</p>
                </div>
              </div>

              {invoice.equipment_details && (
                <div className="mb-4">
                  <Label className="text-sm font-medium">Equipment Details</Label>
                  <div className="bg-gray-50 p-3 rounded mt-1">
                    <pre className="text-sm">{JSON.stringify(invoice.equipment_details, null, 2)}</pre>
                  </div>
                </div>
              )}

              <div className="flex gap-2 flex-wrap">
                <Button variant="outline" size="sm">
                  <Eye className="h-4 w-4 mr-1" />
                  View
                </Button>
                <Button variant="outline" size="sm">
                  <Download className="h-4 w-4 mr-1" />
                  Download
                </Button>
                {invoice.status === 'pending' && (
                  <>
                    <Button 
                      variant="outline" 
                      size="sm"
                      onClick={() => handleSendInvoice(invoice, 'email')}
                    >
                      <Send className="h-4 w-4 mr-1" />
                      Email
                    </Button>
                    <Button 
                      variant="outline" 
                      size="sm"
                      onClick={() => handleSendInvoice(invoice, 'whatsapp')}
                    >
                      <MessageSquare className="h-4 w-4 mr-1" />
                      WhatsApp
                    </Button>
                    <Button 
                      size="sm"
                      onClick={() => markAsPaid(invoice.id)}
                    >
                      <CheckCircle className="h-4 w-4 mr-1" />
                      Mark as Paid
                    </Button>
                  </>
                )}
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Create Invoice Dialog */}
      <Dialog open={showCreateDialog} onOpenChange={setShowCreateDialog}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Create Installation Invoice</DialogTitle>
            <DialogDescription>
              Generate an installation invoice for equipment setup
            </DialogDescription>
          </DialogHeader>
          
          <form onSubmit={handleCreateInvoice} className="space-y-4">
            <div>
              <Label>Client *</Label>
              <Select value={formData.client_id} onValueChange={(value) => setFormData(prev => ({ ...prev, client_id: value }))}>
                <SelectTrigger>
                  <SelectValue placeholder="Select client" />
                </SelectTrigger>
                <SelectContent>
                  {clients.map((client) => (
                    <SelectItem key={client.id} value={client.id}>
                      {client.name} - {client.phone}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label>Notes</Label>
              <Textarea
                value={formData.notes}
                onChange={(e) => setFormData(prev => ({ ...prev, notes: e.target.value }))}
                placeholder="Additional notes for the invoice..."
              />
            </div>

            <div className="flex justify-end space-x-2">
              <Button type="button" variant="outline" onClick={() => setShowCreateDialog(false)}>
                Cancel
              </Button>
              <Button type="submit">
                Create Invoice
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>

      {/* Send Invoice Dialog */}
      <Dialog open={showSendDialog} onOpenChange={setShowSendDialog}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Send Invoice</DialogTitle>
            <DialogDescription>
              Send installation invoice to {selectedInvoice?.clients?.name} via {sendMethod}
            </DialogDescription>
          </DialogHeader>
          
          <div className="space-y-4">
            <div className="bg-gray-50 p-4 rounded">
              <p><strong>Invoice:</strong> {selectedInvoice?.invoice_number}</p>
              <p><strong>Amount:</strong> {formatKenyanCurrency(selectedInvoice?.total_amount || 0)}</p>
              <p><strong>Client:</strong> {selectedInvoice?.clients?.name}</p>
              <p><strong>Phone:</strong> {selectedInvoice?.clients?.phone}</p>
            </div>

            <div className="flex justify-end space-x-2">
              <Button variant="outline" onClick={() => setShowSendDialog(false)}>
                Cancel
              </Button>
              <Button onClick={confirmSendInvoice}>
                Send via {sendMethod.charAt(0).toUpperCase() + sendMethod.slice(1)}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default InstallationInvoiceManager;
