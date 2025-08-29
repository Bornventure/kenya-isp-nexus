
import React from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useForm } from 'react-hook-form';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { InstallationInvoice } from '@/hooks/useInstallationInvoices';
import { useQueryClient } from '@tanstack/react-query';

interface ManualPaymentDialogProps {
  invoice: InstallationInvoice;
  open: boolean;
  onClose: () => void;
}

interface PaymentFormData {
  payment_method: string;
  payment_reference: string;
  amount: number;
  notes: string;
  payment_date: string;
}

const ManualPaymentDialog: React.FC<ManualPaymentDialogProps> = ({
  invoice,
  open,
  onClose,
}) => {
  const { register, handleSubmit, reset, setValue, watch } = useForm<PaymentFormData>({
    defaultValues: {
      amount: invoice.total_amount,
      payment_date: new Date().toISOString().split('T')[0],
      payment_method: 'cash',
    },
  });
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [isSubmitting, setIsSubmitting] = React.useState(false);

  const onSubmit = async (data: PaymentFormData) => {
    setIsSubmitting(true);
    
    try {
      // Update the installation invoice
      const { error: invoiceError } = await supabase
        .from('installation_invoices')
        .update({
          status: 'paid',
          payment_method: data.payment_method,
          payment_reference: data.payment_reference,
          paid_at: new Date(data.payment_date).toISOString(),
          manual_payment_details: {
            amount: data.amount,
            method: data.payment_method,
            reference: data.payment_reference,
            notes: data.notes,
            recorded_by: (await supabase.auth.getUser()).data.user?.id,
            recorded_at: new Date().toISOString(),
          },
          notes: invoice.notes + `\n\nPayment recorded manually: ${data.notes}`,
        })
        .eq('id', invoice.id);

      if (invoiceError) {
        throw invoiceError;
      }

      // Create a payment record in family_bank_payments for tracking
      const { error: paymentError } = await supabase
        .from('family_bank_payments')
        .insert({
          client_id: invoice.client_id,
          trans_amount: data.amount,
          trans_id: data.payment_reference,
          status: 'verified',
          transaction_type: 'manual_payment',
          invoice_number: invoice.invoice_number,
          first_name: 'Manual',
          last_name: 'Payment',
          msisdn: invoice.clients?.phone || '',
          isp_company_id: invoice.isp_company_id,
        });

      if (paymentError) {
        console.warn('Could not create payment record:', paymentError);
        // Don't throw here as the main invoice update succeeded
      }

      // Trigger client activation workflow
      const { error: activationError } = await supabase.functions.invoke('activate-client-service', {
        body: {
          client_id: invoice.client_id,
          payment_method: data.payment_method,
          payment_reference: data.payment_reference,
        }
      });

      if (activationError) {
        console.warn('Client activation error:', activationError);
        // Don't throw here as payment was recorded successfully
      }

      // Send SMS notification about payment confirmation
      await supabase.functions.invoke('send-sms', {
        body: {
          phone: invoice.clients?.phone,
          message: `Payment confirmed for installation invoice ${invoice.invoice_number}. Your internet service activation is now in progress. We will contact you to schedule installation.`,
          gateway: 'celcomafrica',
        }
      });

      toast({
        title: "Payment Recorded",
        description: "Manual payment has been recorded and client activation process initiated.",
      });

      // Refresh data
      queryClient.invalidateQueries({ queryKey: ['installation-invoices'] });
      queryClient.invalidateQueries({ queryKey: ['clients'] });

      reset();
      onClose();

    } catch (error: any) {
      console.error('Error recording manual payment:', error);
      toast({
        title: "Error",
        description: "Failed to record payment. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>Record Manual Payment</DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="payment_method">Payment Method</Label>
            <Select onValueChange={(value) => setValue('payment_method', value)} defaultValue="cash">
              <SelectTrigger>
                <SelectValue placeholder="Select payment method" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="cash">Cash</SelectItem>
                <SelectItem value="bank_transfer">Bank Transfer</SelectItem>
                <SelectItem value="cheque">Cheque</SelectItem>
                <SelectItem value="other">Other</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="payment_reference">Payment Reference</Label>
            <Input
              {...register('payment_reference', { required: 'Payment reference is required' })}
              placeholder="Receipt number, transaction ID, etc."
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="amount">Amount Paid (KES)</Label>
            <Input
              type="number"
              step="0.01"
              {...register('amount', { 
                required: 'Amount is required',
                min: { value: 0, message: 'Amount must be positive' }
              })}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="payment_date">Payment Date</Label>
            <Input
              type="date"
              {...register('payment_date', { required: 'Payment date is required' })}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="notes">Notes</Label>
            <Textarea
              {...register('notes')}
              placeholder="Additional payment details or notes..."
              rows={3}
            />
          </div>

          <div className="flex justify-end gap-2 pt-4">
            <Button type="button" variant="outline" onClick={onClose}>
              Cancel
            </Button>
            <Button type="submit" disabled={isSubmitting}>
              {isSubmitting ? 'Recording...' : 'Record Payment'}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default ManualPaymentDialog;
