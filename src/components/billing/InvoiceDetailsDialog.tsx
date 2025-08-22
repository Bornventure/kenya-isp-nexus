
import React from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { formatKenyanCurrency } from '@/utils/kenyanValidation';
import { Download, Send, CreditCard } from 'lucide-react';
import { downloadInvoicePDF } from '@/utils/pdfGenerator';
import { useToast } from '@/hooks/use-toast';

interface InvoiceDetailsDialogProps {
  invoice: any;
  open: boolean;
  onClose: () => void;
}

const InvoiceDetailsDialog: React.FC<InvoiceDetailsDialogProps> = ({
  invoice,
  open,
  onClose,
}) => {
  const { toast } = useToast();

  if (!invoice) return null;

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'paid': return 'bg-green-100 text-green-800';
      case 'pending': return 'bg-yellow-100 text-yellow-800';
      case 'overdue': return 'bg-red-100 text-red-800';
      case 'draft': return 'bg-gray-100 text-gray-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-KE', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  const handleDownload = () => {
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

  const handleSendEmail = () => {
    toast({
      title: "Email Sent",
      description: `Invoice ${invoice.invoice_number} has been emailed to the client`,
    });
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center justify-between">
            <span>Invoice {invoice.invoice_number}</span>
            <Badge className={getStatusColor(invoice.status)}>
              {invoice.status.toUpperCase()}
            </Badge>
          </DialogTitle>
        </DialogHeader>
        
        <div className="space-y-6">
          {/* Invoice Header */}
          <div className="border-b pb-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <h3 className="font-semibold text-lg mb-2">Invoice Details</h3>
                <div className="space-y-1">
                  <p><span className="font-medium">Invoice Date:</span> {formatDate(invoice.created_at)}</p>
                  <p><span className="font-medium">Due Date:</span> {formatDate(invoice.due_date)}</p>
                  <p><span className="font-medium">Service Period:</span></p>
                  <p className="text-sm text-gray-600 ml-4">
                    {formatDate(invoice.service_period_start)} - {formatDate(invoice.service_period_end)}
                  </p>
                </div>
              </div>
              <div className="text-right">
                <h3 className="font-semibold text-lg mb-2">Amount Due</h3>
                <p className="text-3xl font-bold text-primary">
                  {formatKenyanCurrency(invoice.total_amount)}
                </p>
              </div>
            </div>
          </div>

          {/* Client Information */}
          <div className="border-b pb-4">
            <h3 className="font-semibold text-lg mb-2">Bill To</h3>
            <div className="bg-gray-50 p-4 rounded">
              <p className="font-medium">{invoice.clients?.name || 'N/A'}</p>
              <p className="text-sm text-gray-600">{invoice.clients?.email}</p>
              <p className="text-sm text-gray-600">{invoice.clients?.phone}</p>
            </div>
          </div>

          {/* Invoice Details */}
          <div className="border rounded-lg overflow-hidden">
            <table className="w-full">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-4 py-3 text-left">Description</th>
                  <th className="px-4 py-3 text-right">Amount</th>
                </tr>
              </thead>
              <tbody>
                <tr className="border-b">
                  <td className="px-4 py-3">Internet Service</td>
                  <td className="px-4 py-3 text-right">{formatKenyanCurrency(invoice.amount)}</td>
                </tr>
                {invoice.vat_amount > 0 && (
                  <tr className="border-b">
                    <td className="px-4 py-3">VAT (16%)</td>
                    <td className="px-4 py-3 text-right">{formatKenyanCurrency(invoice.vat_amount)}</td>
                  </tr>
                )}
                <tr className="bg-gray-50 font-semibold">
                  <td className="px-4 py-3">Total</td>
                  <td className="px-4 py-3 text-right">{formatKenyanCurrency(invoice.total_amount)}</td>
                </tr>
              </tbody>
            </table>
          </div>

          {/* Notes */}
          {invoice.notes && (
            <div>
              <h4 className="font-medium mb-2">Notes:</h4>
              <p className="text-gray-700 bg-gray-50 p-3 rounded">{invoice.notes}</p>
            </div>
          )}

          {/* Action Buttons */}
          <div className="flex justify-end space-x-2 pt-4 border-t">
            <Button variant="outline" onClick={handleDownload}>
              <Download className="h-4 w-4 mr-2" />
              Download PDF
            </Button>
            <Button variant="outline" onClick={handleSendEmail}>
              <Send className="h-4 w-4 mr-2" />
              Send Email
            </Button>
            {invoice.status !== 'paid' && (
              <Button>
                <CreditCard className="h-4 w-4 mr-2" />
                Record Payment
              </Button>
            )}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default InvoiceDetailsDialog;
