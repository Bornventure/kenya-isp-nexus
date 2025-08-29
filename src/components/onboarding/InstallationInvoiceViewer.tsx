
import React from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { formatKenyanCurrency } from '@/utils/kenyanValidation';
import { Download, Send, CreditCard, CheckCircle } from 'lucide-react';
import { downloadInvoicePDF } from '@/utils/pdfGenerator';
import { usePaymentSettings } from '@/hooks/usePaymentSettings';
import { useToast } from '@/hooks/use-toast';
import type { InstallationInvoice } from '@/hooks/useInstallationInvoices';

interface InstallationInvoiceViewerProps {
  invoice: InstallationInvoice | null;
  open: boolean;
  onClose: () => void;
  onPayment?: (invoice: InstallationInvoice) => void;
  onManualPayment?: (invoice: InstallationInvoice) => void;
}

const InstallationInvoiceViewer: React.FC<InstallationInvoiceViewerProps> = ({
  invoice,
  open,
  onClose,
  onPayment,
  onManualPayment,
}) => {
  const { mpesaSettings, familyBankSettings } = usePaymentSettings();
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
      // Prepare invoice data with payment settings
      const invoiceData = {
        ...invoice,
        mpesa_settings: mpesaSettings,
        family_bank_settings: familyBankSettings,
      };
      
      downloadInvoicePDF(invoiceData);
      toast({
        title: "Download Started",
        description: `Invoice ${invoice.invoice_number} downloaded successfully`,
      });
    } catch (error) {
      console.error('Download error:', error);
      toast({
        title: "Download Failed",
        description: "Failed to generate PDF. Please try again.",
        variant: "destructive",
      });
    }
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center justify-between">
            <span>Installation Invoice {invoice.invoice_number}</span>
            <Badge className={getStatusColor(invoice.status)}>
              {invoice.status === 'paid' && <CheckCircle className="h-3 w-3 mr-1" />}
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
                  {invoice.tracking_number && (
                    <p><span className="font-medium">Tracking Number:</span> {invoice.tracking_number}</p>
                  )}
                  <p><span className="font-medium">Service Type:</span> Installation & Setup</p>
                </div>
              </div>
              <div className="text-right">
                <h3 className="font-semibold text-lg mb-2">Amount Due</h3>
                <p className="text-3xl font-bold text-primary">
                  {formatKenyanCurrency(invoice.total_amount)}
                </p>
                {invoice.status === 'paid' && invoice.payment_method && (
                  <div className="mt-2 text-sm text-green-600">
                    <p>Paid via {invoice.payment_method}</p>
                    {invoice.payment_reference && (
                      <p>Ref: {invoice.payment_reference}</p>
                    )}
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Client Information */}
          <div>
            <h3 className="font-semibold text-lg mb-2">Client Information</h3>
            <div className="bg-gray-50 p-4 rounded-lg">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p><span className="font-medium">Name:</span> {invoice.clients?.name}</p>
                  <p><span className="font-medium">Phone:</span> {invoice.clients?.phone}</p>
                  {invoice.clients?.email && (
                    <p><span className="font-medium">Email:</span> {invoice.clients?.email}</p>
                  )}
                </div>
                <div>
                  {invoice.clients?.address && (
                    <p><span className="font-medium">Address:</span> {invoice.clients.address}</p>
                  )}
                </div>
              </div>
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
                  <td className="px-4 py-3">Installation & Setup Service</td>
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

          {/* Payment Methods */}
          {invoice.status === 'pending' && (mpesaSettings || familyBankSettings) && (
            <div className="bg-blue-50 p-4 rounded-lg">
              <h4 className="font-medium mb-3">Payment Methods Available:</h4>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {mpesaSettings && (
                  <div className="bg-white p-3 rounded border">
                    <h5 className="font-medium text-green-600 mb-2">M-Pesa Paybill</h5>
                    <p><span className="font-medium">Paybill:</span> {mpesaSettings.shortcode}</p>
                    <p><span className="font-medium">Account:</span> {invoice.clients?.phone}</p>
                  </div>
                )}
                {familyBankSettings && (
                  <div className="bg-white p-3 rounded border">
                    <h5 className="font-medium text-blue-600 mb-2">Family Bank Paybill</h5>
                    <p><span className="font-medium">Paybill:</span> {familyBankSettings.paybill_number}</p>
                    <p><span className="font-medium">Account:</span> {invoice.clients?.phone}</p>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Equipment Details */}
          {invoice.equipment_details && (
            <div>
              <h4 className="font-medium mb-2">Equipment Included:</h4>
              <div className="bg-gray-50 p-3 rounded">
                <ul className="list-disc list-inside space-y-1">
                  <li>Standard Wi-Fi Router</li>
                  <li>Ethernet Cable (10m)</li>
                  <li>Professional Installation Service</li>
                  <li>Basic Configuration & Testing</li>
                </ul>
              </div>
            </div>
          )}

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
            
            {invoice.status === 'pending' && (
              <>
                {onManualPayment && (
                  <Button variant="outline" onClick={() => onManualPayment(invoice)}>
                    <CheckCircle className="h-4 w-4 mr-2" />
                    Record Manual Payment
                  </Button>
                )}
                {onPayment && (
                  <Button onClick={() => onPayment(invoice)}>
                    <CreditCard className="h-4 w-4 mr-2" />
                    Pay Online
                  </Button>
                )}
              </>
            )}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default InstallationInvoiceViewer;
