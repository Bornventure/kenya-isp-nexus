
import React from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Download, Send, X } from 'lucide-react';
import { Invoice } from '@/hooks/useInvoices';
import { formatKenyanCurrency } from '@/utils/kenyanValidation';

interface InvoiceViewerProps {
  invoice: Invoice | null;
  open: boolean;
  onClose: () => void;
  onDownload: (invoice: Invoice) => void;
  onSendEmail: (invoice: Invoice) => void;
}

const InvoiceViewer: React.FC<InvoiceViewerProps> = ({
  invoice,
  open,
  onClose,
  onDownload,
  onSendEmail
}) => {
  if (!invoice) return null;

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-KE', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center justify-between">
            <span>Invoice {invoice.invoice_number}</span>
            <Button variant="ghost" size="sm" onClick={onClose}>
              <X className="h-4 w-4" />
            </Button>
          </DialogTitle>
        </DialogHeader>
        
        <div className="bg-white p-8 border rounded-lg">
          {/* Header */}
          <div className="flex justify-between items-start mb-8">
            <div className="flex items-center gap-4">
              <img 
                src="/lovable-uploads/29dec1bf-11a7-44c4-b61f-4cdfe1cbdc5c.png" 
                alt="DataDefender Logo" 
                className="h-16 w-16 object-contain"
              />
              <div>
                <h1 className="text-2xl font-bold text-gray-900">DataDefender</h1>
                <p className="text-gray-600">Internet Service Provider</p>
                <p className="text-sm text-gray-500">
                  P.O. Box 12345, Nairobi, Kenya<br />
                  Email: billing@datadefender.co.ke<br />
                  Phone: +254 700 123 456
                </p>
              </div>
            </div>
            
            <div className="text-right">
              <h2 className="text-xl font-bold text-gray-900">INVOICE</h2>
              <p className="text-gray-600">#{invoice.invoice_number}</p>
              <div className="mt-2 text-sm">
                <p><span className="font-medium">Date:</span> {formatDate(invoice.created_at)}</p>
                <p><span className="font-medium">Due Date:</span> {formatDate(invoice.due_date)}</p>
              </div>
            </div>
          </div>

          {/* Client Info */}
          <div className="mb-8">
            <h3 className="font-semibold text-gray-700 mb-2">Bill To:</h3>
            <div className="bg-gray-50 p-4 rounded">
              <p className="font-medium">{invoice.clients?.name || 'N/A'}</p>
              <p className="text-gray-600">{invoice.clients?.email || 'N/A'}</p>
            </div>
          </div>

          {/* Service Details */}
          <div className="mb-8">
            <h3 className="font-semibold text-gray-700 mb-2">Service Period</h3>
            <div className="bg-gray-50 p-4 rounded">
              <p>From: {formatDate(invoice.service_period_start)}</p>
              <p>To: {formatDate(invoice.service_period_end)}</p>
            </div>
          </div>

          {/* Invoice Items */}
          <div className="mb-8">
            <table className="w-full border-collapse">
              <thead>
                <tr className="border-b">
                  <th className="text-left py-2">Description</th>
                  <th className="text-right py-2">Amount</th>
                </tr>
              </thead>
              <tbody>
                <tr className="border-b">
                  <td className="py-2">Internet Service</td>
                  <td className="text-right py-2">{formatKenyanCurrency(invoice.amount)}</td>
                </tr>
                <tr className="border-b">
                  <td className="py-2">VAT (16%)</td>
                  <td className="text-right py-2">{formatKenyanCurrency(invoice.vat_amount)}</td>
                </tr>
              </tbody>
              <tfoot>
                <tr className="border-t-2 border-gray-800">
                  <td className="py-2 font-bold">Total Amount</td>
                  <td className="text-right py-2 font-bold text-lg">
                    {formatKenyanCurrency(invoice.total_amount)}
                  </td>
                </tr>
              </tfoot>
            </table>
          </div>

          {/* Notes */}
          {invoice.notes && (
            <div className="mb-8">
              <h3 className="font-semibold text-gray-700 mb-2">Notes</h3>
              <div className="bg-gray-50 p-4 rounded">
                <p className="text-gray-700">{invoice.notes}</p>
              </div>
            </div>
          )}

          {/* Footer */}
          <div className="text-center text-sm text-gray-500 border-t pt-4">
            <p>Thank you for your business!</p>
            <p>For support, contact us at support@datadefender.co.ke</p>
            <p>Visit us at www.datadefender.co.ke</p>
          </div>
        </div>

        {/* Actions */}
        <div className="flex justify-end space-x-2 mt-4">
          <Button variant="outline" onClick={() => onSendEmail(invoice)}>
            <Send className="h-4 w-4 mr-2" />
            Send Email
          </Button>
          <Button onClick={() => onDownload(invoice)}>
            <Download className="h-4 w-4 mr-2" />
            Download PDF
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default InvoiceViewer;
