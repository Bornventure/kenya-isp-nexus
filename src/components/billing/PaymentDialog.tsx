
import React, { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Invoice } from '@/hooks/useInvoices';
import PaymentProviderSelector from './PaymentProviderSelector';
import { PaymentProvider } from '@/utils/kenyanPayments';

interface PaymentDialogProps {
  invoice: Invoice | null;
  open: boolean;
  onClose: () => void;
  onPaymentComplete?: (paymentData: any) => void;
}

const PaymentDialog: React.FC<PaymentDialogProps> = ({
  invoice,
  open,
  onClose,
  onPaymentComplete
}) => {
  const [selectedProvider, setSelectedProvider] = useState<PaymentProvider | undefined>();

  if (!invoice) return null;

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>
            Payment for Invoice {invoice.invoice_number}
          </DialogTitle>
        </DialogHeader>
        
        <PaymentProviderSelector
          clientId={invoice.client_id}
          amount={invoice.total_amount}
          invoiceId={invoice.id}
          accountReference={invoice.invoice_number}
          selectedProvider={selectedProvider}
          onProviderSelect={setSelectedProvider}
          onPaymentComplete={(paymentData) => {
            if (onPaymentComplete) {
              onPaymentComplete(paymentData);
            }
            onClose();
          }}
        />
      </DialogContent>
    </Dialog>
  );
};

export default PaymentDialog;
