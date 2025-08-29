
import React from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { Card, CardContent } from '@/components/ui/card';
import { Download, Phone, Building, DollarSign, Check } from 'lucide-react';
import { InstallationInvoice } from '@/hooks/useInstallationInvoices';
import { downloadInvoicePDF } from '@/utils/pdfGenerator';
import { usePaymentSettings } from '@/hooks/usePaymentSettings';
import ManualPaymentDialog from './ManualPaymentDialog';

interface InstallationInvoiceViewerProps {
  invoice: InstallationInvoice;
  open: boolean;
  onClose: () => void;
}

const InstallationInvoiceViewer: React.FC<InstallationInvoiceViewerProps> = ({
  invoice,
  open,
  onClose,
}) => {
  const { mpesaSettings, familyBankSettings } = usePaymentSettings();
  const [showManualPayment, setShowManualPayment] = React.useState(false);

  const maskPhoneNumber = (phone: string) => {
    if (!phone) return '';
    const cleaned = phone.replace(/\D/g, '');
    if (cleaned.length >= 10) {
      return cleaned.substring(0, 3) + 'xxx' + cleaned.substring(6);
    }
    return phone;
  };

  const handleDownloadPDF = () => {
    const invoiceData = {
      ...invoice,
      invoice_number: invoice.invoice_number,
      created_at: invoice.created_at,
      due_date: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(),
      service_period_start: invoice.created_at,
      service_period_end: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(),
    };
    downloadInvoicePDF(invoiceData);
  };

  return (
    <>
      <Dialog open={open} onOpenChange={onClose}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center justify-between">
              <span>Installation Invoice - {invoice.invoice_number}</span>
              <div className="flex items-center gap-2">
                <Badge variant={invoice.status === 'paid' ? 'default' : 'destructive'}>
                  {invoice.status === 'paid' ? 'PAID' : 'PENDING PAYMENT'}
                </Badge>
                {invoice.tracking_number && (
                  <Badge variant="outline">
                    Track: {invoice.tracking_number}
                  </Badge>
                )}
              </div>
            </DialogTitle>
          </DialogHeader>

          <div className="space-y-6">
            {/* Invoice Header */}
            <div className="text-center border-b pb-4">
              <h2 className="text-2xl font-bold">INSTALLATION INVOICE</h2>
              <p className="text-lg">Invoice #{invoice.invoice_number}</p>
              <p className="text-sm text-muted-foreground">
                Date: {new Date(invoice.created_at).toLocaleDateString()}
              </p>
              {invoice.tracking_number && (
                <p className="text-sm text-muted-foreground">
                  Tracking Number: {invoice.tracking_number}
                </p>
              )}
            </div>

            {/* Client Information */}
            <div>
              <h3 className="text-lg font-semibold mb-3">Bill To:</h3>
              <div className="bg-muted/50 p-4 rounded-lg">
                <p className="font-medium">{invoice.clients?.name}</p>
                <p className="text-sm text-muted-foreground">{invoice.clients?.email}</p>
                <p className="text-sm text-muted-foreground">
                  Phone: {invoice.clients?.phone}
                </p>
                <p className="text-sm text-muted-foreground">{invoice.clients?.address}</p>
              </div>
            </div>

            {/* Equipment Details */}
            {invoice.equipment_details && (
              <div>
                <h3 className="text-lg font-semibold mb-3">Equipment & Installation Details:</h3>
                <div className="bg-muted/50 p-4 rounded-lg">
                  <ul className="space-y-2">
                    <li className="flex justify-between">
                      <span>• Standard Wi-Fi Router</span>
                      <span className="text-sm text-muted-foreground">Included</span>
                    </li>
                    <li className="flex justify-between">
                      <span>• Ethernet Cable (10m)</span>
                      <span className="text-sm text-muted-foreground">Included</span>
                    </li>
                    <li className="flex justify-between">
                      <span>• Professional Installation</span>
                      <span className="text-sm text-muted-foreground">On-site setup</span>
                    </li>
                  </ul>
                </div>
              </div>
            )}

            {/* Invoice Items */}
            <div>
              <h3 className="text-lg font-semibold mb-3">Invoice Items:</h3>
              <div className="border rounded-lg overflow-hidden">
                <table className="w-full">
                  <thead className="bg-muted/50">
                    <tr>
                      <th className="text-left p-3">Description</th>
                      <th className="text-right p-3">Amount</th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr className="border-t">
                      <td className="p-3">Installation & Setup Fee</td>
                      <td className="text-right p-3">KES {invoice.amount.toLocaleString()}</td>
                    </tr>
                    <tr className="border-t">
                      <td className="p-3">VAT (16%)</td>
                      <td className="text-right p-3">KES {invoice.vat_amount.toLocaleString()}</td>
                    </tr>
                    <tr className="border-t bg-muted/50 font-semibold">
                      <td className="p-3">Total Amount Due</td>
                      <td className="text-right p-3">KES {invoice.total_amount.toLocaleString()}</td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </div>

            <Separator />

            {/* Payment Methods */}
            <div>
              <h3 className="text-lg font-semibold mb-4">Payment Methods:</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* M-Pesa Payment */}
                {mpesaSettings && (
                  <Card>
                    <CardContent className="p-4">
                      <div className="flex items-center gap-2 mb-3">
                        <Phone className="h-5 w-5 text-green-600" />
                        <h4 className="font-medium">M-Pesa</h4>
                      </div>
                      <div className="space-y-2 text-sm">
                        <p><strong>Paybill Number:</strong> {mpesaSettings.shortcode}</p>
                        <p><strong>Account Number:</strong> {invoice.clients?.phone}</p>
                        <p><strong>Amount:</strong> KES {invoice.total_amount.toLocaleString()}</p>
                      </div>
                    </CardContent>
                  </Card>
                )}

                {/* Family Bank Payment */}
                {familyBankSettings && (
                  <Card>
                    <CardContent className="p-4">
                      <div className="flex items-center gap-2 mb-3">
                        <Building className="h-5 w-5 text-blue-600" />
                        <h4 className="font-medium">Family Bank</h4>
                      </div>
                      <div className="space-y-2 text-sm">
                        <p><strong>Paybill Number:</strong> {familyBankSettings.paybill_number}</p>
                        <p><strong>Account Number:</strong> {invoice.clients?.phone}</p>
                        <p><strong>Amount:</strong> KES {invoice.total_amount.toLocaleString()}</p>
                      </div>
                    </CardContent>
                  </Card>
                )}
              </div>
            </div>

            {/* Manual Payment Option for Sales Staff */}
            {invoice.status !== 'paid' && (
              <div className="border-t pt-4">
                <h4 className="font-medium mb-3">Sales Department Actions:</h4>
                <Button 
                  onClick={() => setShowManualPayment(true)}
                  className="gap-2"
                  variant="outline"
                >
                  <DollarSign className="h-4 w-4" />
                  Record Manual Payment
                </Button>
              </div>
            )}

            {/* Notes */}
            {invoice.notes && (
              <div>
                <h3 className="text-lg font-semibold mb-3">Notes:</h3>
                <div className="bg-muted/50 p-4 rounded-lg">
                  <p className="text-sm">{invoice.notes}</p>
                </div>
              </div>
            )}

            {/* Payment Instructions */}
            <div className="bg-blue-50 dark:bg-blue-950/20 p-4 rounded-lg">
              <h4 className="font-medium text-blue-900 dark:text-blue-100 mb-2">Payment Instructions:</h4>
              <ul className="text-sm text-blue-800 dark:text-blue-200 space-y-1">
                <li>• Payment must be made within 7 days of invoice date</li>
                <li>• Use your phone number as the account number for all payments</li>
                <li>• Installation will be scheduled after payment confirmation</li>
                <li>• Keep payment reference/receipt for your records</li>
                <li>• Contact our support team if you need assistance with payment</li>
              </ul>
            </div>
          </div>

          <div className="flex justify-between pt-4 border-t">
            <Button variant="outline" onClick={onClose}>
              Close
            </Button>
            <Button onClick={handleDownloadPDF} className="gap-2">
              <Download className="h-4 w-4" />
              Download PDF
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      <ManualPaymentDialog
        invoice={invoice}
        open={showManualPayment}
        onClose={() => setShowManualPayment(false)}
      />
    </>
  );
};

export default InstallationInvoiceViewer;
