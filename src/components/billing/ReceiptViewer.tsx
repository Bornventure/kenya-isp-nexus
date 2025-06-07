
import React from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Download, Share2, Mail } from 'lucide-react';
import { Receipt } from '@/types/receipt';

interface ReceiptViewerProps {
  receipt: Receipt | null;
  open: boolean;
  onClose: () => void;
  onDownload: (receipt: Receipt) => void;
  onShare: (receipt: Receipt) => void;
}

const ReceiptViewer: React.FC<ReceiptViewerProps> = ({
  receipt,
  open,
  onClose,
  onDownload,
  onShare
}) => {
  if (!receipt) return null;

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-KE', {
      style: 'currency',
      currency: 'KES',
      minimumFractionDigits: 0
    }).format(amount);
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Receipt #{receipt.receiptNumber}</DialogTitle>
        </DialogHeader>
        
        <div className="bg-white p-8 border rounded-lg">
          {/* Header */}
          <div className="text-center mb-8">
            <h1 className="text-2xl font-bold text-gray-900">ISP Company</h1>
            <p className="text-gray-600">Internet Service Provider</p>
            <p className="text-sm text-gray-500">P.O. Box 123, Nairobi, Kenya</p>
          </div>

          {/* Receipt Info */}
          <div className="grid grid-cols-2 gap-4 mb-6">
            <div>
              <h3 className="font-semibold text-gray-700 mb-2">Receipt Details</h3>
              <p><span className="font-medium">Receipt #:</span> {receipt.receiptNumber}</p>
              <p><span className="font-medium">Invoice #:</span> {receipt.invoiceId}</p>
              <p><span className="font-medium">Date:</span> {new Date(receipt.datePaid).toLocaleDateString()}</p>
            </div>
            <div>
              <h3 className="font-semibold text-gray-700 mb-2">Client Information</h3>
              <p><span className="font-medium">Name:</span> {receipt.clientName}</p>
              <p><span className="font-medium">Email:</span> {receipt.clientEmail}</p>
            </div>
          </div>

          {/* Service Details */}
          <div className="mb-6">
            <h3 className="font-semibold text-gray-700 mb-2">Service Details</h3>
            <div className="bg-gray-50 p-4 rounded">
              <p><span className="font-medium">Package:</span> {receipt.servicePackage}</p>
              <p><span className="font-medium">Service Period:</span> {new Date(receipt.servicePeriod.from).toLocaleDateString()} - {new Date(receipt.servicePeriod.to).toLocaleDateString()}</p>
            </div>
          </div>

          {/* Payment Details */}
          <div className="mb-6">
            <h3 className="font-semibold text-gray-700 mb-2">Payment Information</h3>
            <div className="bg-gray-50 p-4 rounded">
              <p><span className="font-medium">Amount Paid:</span> {formatCurrency(receipt.amount)}</p>
              <p><span className="font-medium">Payment Method:</span> {receipt.paymentMethod}</p>
              <p><span className="font-medium">Reference:</span> {receipt.paymentReference}</p>
            </div>
          </div>

          {/* Footer */}
          <div className="text-center text-sm text-gray-500 border-t pt-4">
            <p>Thank you for your payment!</p>
            <p>For support, contact us at support@ispcompany.com</p>
          </div>
        </div>

        {/* Actions */}
        <div className="flex justify-end space-x-2 mt-4">
          <Button variant="outline" onClick={() => onShare(receipt)}>
            <Share2 className="h-4 w-4 mr-2" />
            Share
          </Button>
          <Button onClick={() => onDownload(receipt)}>
            <Download className="h-4 w-4 mr-2" />
            Download PDF
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default ReceiptViewer;
