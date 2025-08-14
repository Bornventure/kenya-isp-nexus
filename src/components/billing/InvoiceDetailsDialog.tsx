
import React from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import { Download, Send } from 'lucide-react';
import type { Invoice } from '@/hooks/useInvoices';

interface InvoiceDetailsDialogProps {
  invoice: Invoice | null;
  open: boolean;
  onClose: () => void;
}

const InvoiceDetailsDialog: React.FC<InvoiceDetailsDialogProps> = ({ invoice, open, onClose }) => {
  if (!invoice) return null;

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'paid': return 'default';
      case 'pending': return 'secondary';
      case 'overdue': return 'destructive';
      case 'cancelled': return 'outline';
      default: return 'outline';
    }
  };

  const handleDownload = () => {
    // Implementation for downloading invoice PDF
    console.log('Downloading invoice:', invoice.invoice_number);
  };

  const handleSendEmail = () => {
    // Implementation for sending invoice via email
    console.log('Sending invoice:', invoice.invoice_number);
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <div className="flex items-center justify-between">
            <DialogTitle>Invoice Details</DialogTitle>
            <div className="flex gap-2">
              <Button variant="outline" size="sm" onClick={handleDownload}>
                <Download className="h-4 w-4 mr-1" />
                Download
              </Button>
              <Button variant="outline" size="sm" onClick={handleSendEmail}>
                <Send className="h-4 w-4 mr-1" />
                Send
              </Button>
            </div>
          </div>
        </DialogHeader>
        
        <div className="space-y-6">
          <div className="flex items-start justify-between">
            <div>
              <h3 className="text-lg font-semibold">{invoice.invoice_number}</h3>
              <p className="text-muted-foreground">
                Client: {invoice.clients?.name || 'Unknown Client'}
              </p>
            </div>
            <Badge variant={getStatusColor(invoice.status)}>
              {invoice.status}
            </Badge>
          </div>

          <Separator />

          <div className="grid grid-cols-2 gap-6">
            <div className="space-y-3">
              <h4 className="font-medium">Invoice Information</h4>
              
              <div>
                <span className="text-sm text-muted-foreground">Due Date:</span>
                <p className="font-medium">
                  {new Date(invoice.due_date).toLocaleDateString()}
                </p>
              </div>
              
              <div>
                <span className="text-sm text-muted-foreground">Service Period:</span>
                <p className="font-medium">
                  {new Date(invoice.service_period_start).toLocaleDateString()} - {new Date(invoice.service_period_end).toLocaleDateString()}
                </p>
              </div>
            </div>

            <div className="space-y-3">
              <h4 className="font-medium">Client Information</h4>
              
              <div>
                <span className="text-sm text-muted-foreground">Name:</span>
                <p className="font-medium">{invoice.clients?.name || 'N/A'}</p>
              </div>
              
              <div>
                <span className="text-sm text-muted-foreground">Email:</span>
                <p className="font-medium">{invoice.clients?.email || 'N/A'}</p>
              </div>
              
              <div>
                <span className="text-sm text-muted-foreground">Phone:</span>
                <p className="font-medium">{invoice.clients?.phone || 'N/A'}</p>
              </div>
            </div>
          </div>

          <Separator />

          <div className="space-y-3">
            <h4 className="font-medium">Amount Breakdown</h4>
            
            <div className="space-y-2">
              <div className="flex justify-between">
                <span>Amount:</span>
                <span>KES {Number(invoice.amount).toLocaleString()}</span>
              </div>
              <div className="flex justify-between">
                <span>VAT (16%):</span>
                <span>KES {Number(invoice.vat_amount).toLocaleString()}</span>
              </div>
              <Separator />
              <div className="flex justify-between font-medium text-lg">
                <span>Total:</span>
                <span>KES {Number(invoice.total_amount).toLocaleString()}</span>
              </div>
            </div>
          </div>

          {invoice.notes && (
            <>
              <Separator />
              <div>
                <h4 className="font-medium mb-2">Notes</h4>
                <p className="text-sm text-muted-foreground">{invoice.notes}</p>
              </div>
            </>
          )}

          <Separator />

          <div className="text-xs text-muted-foreground">
            <p>Created: {new Date(invoice.created_at).toLocaleString()}</p>
            <p>Last Updated: {new Date(invoice.updated_at).toLocaleString()}</p>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default InvoiceDetailsDialog;
