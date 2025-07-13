
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useSuperAdminInvoices } from '@/hooks/useSuperAdminInvoices';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { formatKenyanCurrency } from '@/utils/kenyanValidation';
import { 
  FileText, 
  CheckCircle, 
  Clock, 
  DollarSign,
  Eye,
  Plus
} from 'lucide-react';

const SuperAdminInvoiceManager = () => {
  const { data: invoices, isLoading, refetch } = useSuperAdminInvoices();
  const [selectedInvoice, setSelectedInvoice] = useState<any>(null);
  const [isRecordingPayment, setIsRecordingPayment] = useState(false);
  const [paymentData, setPaymentData] = useState({
    amount: '',
    payment_method: '',
    payment_reference: '',
    mpesa_receipt_number: '',
    notes: ''
  });
  const { toast } = useToast();

  const handleRecordPayment = async (invoiceId: string) => {
    if (!paymentData.amount || !paymentData.payment_method) {
      toast({
        title: "Validation Error",
        description: "Please fill in amount and payment method",
        variant: "destructive"
      });
      return;
    }

    setIsRecordingPayment(true);
    try {
      // Record payment
      const { error: paymentError } = await supabase
        .from('super_admin_payments')
        .insert({
          invoice_id: invoiceId,
          amount: parseFloat(paymentData.amount),
          payment_method: paymentData.payment_method,
          payment_reference: paymentData.payment_reference || null,
          mpesa_receipt_number: paymentData.mpesa_receipt_number || null,
          notes: paymentData.notes || null,
          created_by: (await supabase.auth.getUser()).data.user?.id
        });

      if (paymentError) throw paymentError;

      // Update invoice status
      const { error: invoiceError } = await supabase
        .from('super_admin_invoices')
        .update({
          status: 'paid',
          payment_date: new Date().toISOString(),
          payment_method: paymentData.payment_method,
          payment_reference: paymentData.payment_reference || null
        })
        .eq('id', invoiceId);

      if (invoiceError) throw invoiceError;

      toast({
        title: "Payment Recorded",
        description: "Payment has been recorded successfully. Company can now be created.",
      });

      setSelectedInvoice(null);
      setPaymentData({
        amount: '',
        payment_method: '',
        payment_reference: '',
        mpesa_receipt_number: '',
        notes: ''
      });
      refetch();
    } catch (error: any) {
      console.error('Error recording payment:', error);
      toast({
        title: "Error",
        description: "Failed to record payment",
        variant: "destructive"
      });
    } finally {
      setIsRecordingPayment(false);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'paid':
        return 'bg-green-100 text-green-800';
      case 'overdue':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-yellow-100 text-yellow-800';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'paid':
        return <CheckCircle className="h-4 w-4 text-green-500" />;
      default:
        return <Clock className="h-4 w-4 text-yellow-500" />;
    }
  };

  if (isLoading) {
    return (
      <Card>
        <CardContent className="p-6">
          <div className="animate-pulse space-y-4">
            {[...Array(3)].map((_, i) => (
              <div key={i} className="h-4 bg-gray-200 rounded w-3/4"></div>
            ))}
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <FileText className="h-5 w-5" />
          Registration Invoices ({invoices?.length || 0})
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Invoice #</TableHead>
                <TableHead>Company</TableHead>
                <TableHead>Amount</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Due Date</TableHead>
                <TableHead>Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {invoices?.map((invoice) => (
                <TableRow key={invoice.id}>
                  <TableCell>
                    <div className="font-medium">{invoice.invoice_number}</div>
                  </TableCell>
                  <TableCell>
                    <div className="font-medium">{invoice.company_name}</div>
                    <div className="text-sm text-gray-500">{invoice.contact_email}</div>
                  </TableCell>
                  <TableCell>
                    <div className="font-medium">{formatKenyanCurrency(invoice.total_amount)}</div>
                    <div className="text-sm text-gray-500">
                      Base: {formatKenyanCurrency(invoice.amount)} + VAT: {formatKenyanCurrency(invoice.vat_amount)}
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-2">
                      {getStatusIcon(invoice.status)}
                      <Badge className={getStatusColor(invoice.status)}>
                        {invoice.status}
                      </Badge>
                    </div>
                  </TableCell>
                  <TableCell>
                    <span className="text-sm">
                      {new Date(invoice.due_date).toLocaleDateString()}
                    </span>
                  </TableCell>
                  <TableCell>
                    <div className="flex gap-2">
                      <Dialog>
                        <DialogTrigger asChild>
                          <Button 
                            variant="outline" 
                            size="sm"
                            onClick={() => setSelectedInvoice(invoice)}
                          >
                            <Eye className="h-4 w-4" />
                          </Button>
                        </DialogTrigger>
                        <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
                          <DialogHeader>
                            <DialogTitle>Invoice Details - {invoice.invoice_number}</DialogTitle>
                            <DialogDescription>
                              View and manage invoice for {invoice.company_name}
                            </DialogDescription>
                          </DialogHeader>
                          
                          <div className="space-y-4">
                            <div className="grid grid-cols-2 gap-4">
                              <div>
                                <label className="text-sm font-medium">Company Name</label>
                                <p className="text-sm">{invoice.company_name}</p>
                              </div>
                              <div>
                                <label className="text-sm font-medium">Contact Email</label>
                                <p className="text-sm">{invoice.contact_email}</p>
                              </div>
                              <div>
                                <label className="text-sm font-medium">Amount</label>
                                <p className="text-sm">{formatKenyanCurrency(invoice.amount)}</p>
                              </div>
                              <div>
                                <label className="text-sm font-medium">VAT</label>
                                <p className="text-sm">{formatKenyanCurrency(invoice.vat_amount)}</p>
                              </div>
                              <div>
                                <label className="text-sm font-medium">Total Amount</label>
                                <p className="text-sm font-bold">{formatKenyanCurrency(invoice.total_amount)}</p>
                              </div>
                              <div>
                                <label className="text-sm font-medium">Status</label>
                                <Badge className={getStatusColor(invoice.status)}>
                                  {invoice.status}
                                </Badge>
                              </div>
                            </div>
                            
                            {invoice.notes && (
                              <div>
                                <label className="text-sm font-medium">Notes</label>
                                <p className="text-sm">{invoice.notes}</p>
                              </div>
                            )}
                            
                            {invoice.status === 'pending' && (
                              <div className="border-t pt-4">
                                <h4 className="font-medium mb-3">Record Payment</h4>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                  <div>
                                    <Label>Amount *</Label>
                                    <Input
                                      type="number"
                                      step="0.01"
                                      value={paymentData.amount}
                                      onChange={(e) => setPaymentData(prev => ({...prev, amount: e.target.value}))}
                                      placeholder="Payment amount"
                                    />
                                  </div>
                                  <div>
                                    <Label>Payment Method *</Label>
                                    <Select value={paymentData.payment_method} onValueChange={(value) => setPaymentData(prev => ({...prev, payment_method: value}))}>
                                      <SelectTrigger>
                                        <SelectValue placeholder="Select method" />
                                      </SelectTrigger>
                                      <SelectContent>
                                        <SelectItem value="mpesa">M-Pesa</SelectItem>
                                        <SelectItem value="bank_transfer">Bank Transfer</SelectItem>
                                        <SelectItem value="cash">Cash</SelectItem>
                                        <SelectItem value="cheque">Cheque</SelectItem>
                                      </SelectContent>
                                    </Select>
                                  </div>
                                  <div>
                                    <Label>Payment Reference</Label>
                                    <Input
                                      value={paymentData.payment_reference}
                                      onChange={(e) => setPaymentData(prev => ({...prev, payment_reference: e.target.value}))}
                                      placeholder="Transaction reference"
                                    />
                                  </div>
                                  <div>
                                    <Label>M-Pesa Receipt (if applicable)</Label>
                                    <Input
                                      value={paymentData.mpesa_receipt_number}
                                      onChange={(e) => setPaymentData(prev => ({...prev, mpesa_receipt_number: e.target.value}))}
                                      placeholder="M-Pesa receipt number"
                                    />
                                  </div>
                                  <div className="md:col-span-2">
                                    <Label>Notes</Label>
                                    <Textarea
                                      value={paymentData.notes}
                                      onChange={(e) => setPaymentData(prev => ({...prev, notes: e.target.value}))}
                                      placeholder="Payment notes..."
                                      rows={2}
                                    />
                                  </div>
                                </div>
                                <div className="flex gap-3 mt-4">
                                  <Button
                                    onClick={() => handleRecordPayment(invoice.id)}
                                    disabled={isRecordingPayment}
                                    className="flex-1"
                                  >
                                    <DollarSign className="h-4 w-4 mr-2" />
                                    {isRecordingPayment ? 'Recording...' : 'Record Payment'}
                                  </Button>
                                </div>
                              </div>
                            )}
                          </div>
                        </DialogContent>
                      </Dialog>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      </CardContent>
    </Card>
  );
};

export default SuperAdminInvoiceManager;
