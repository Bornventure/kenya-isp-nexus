
import React, { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useInvoices } from '@/hooks/useInvoices';
import { useClients } from '@/hooks/useClients';
import { useToast } from '@/hooks/use-toast';

interface EditInvoiceDialogProps {
  invoice: any;
  open: boolean;
  onClose: () => void;
}

const EditInvoiceDialog: React.FC<EditInvoiceDialogProps> = ({ invoice, open, onClose }) => {
  const { updateInvoice, isUpdating } = useInvoices();
  const { clients } = useClients();
  const { toast } = useToast();

  const [formData, setFormData] = useState({
    client_id: '',
    amount: '',
    vat_amount: '',
    total_amount: '',
    due_date: '',
    service_period_start: '',
    service_period_end: '',
    notes: '',
    status: 'pending'
  });

  useEffect(() => {
    if (invoice) {
      setFormData({
        client_id: invoice.client_id || '',
        amount: invoice.amount?.toString() || '',
        vat_amount: invoice.vat_amount?.toString() || '',
        total_amount: invoice.total_amount?.toString() || '',
        due_date: invoice.due_date || '',
        service_period_start: invoice.service_period_start || '',
        service_period_end: invoice.service_period_end || '',
        notes: invoice.notes || '',
        status: invoice.status || 'pending'
      });
    }
  }, [invoice]);

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => {
      const updated = { ...prev, [field]: value };
      
      // Auto-calculate VAT and total when amount changes
      if (field === 'amount') {
        const amount = parseFloat(value) || 0;
        const vatAmount = amount * 0.16;
        const totalAmount = amount + vatAmount;
        updated.vat_amount = vatAmount.toFixed(2);
        updated.total_amount = totalAmount.toFixed(2);
      }
      
      return updated;
    });
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.client_id || !formData.amount || !formData.due_date) {
      toast({
        title: "Validation Error",
        description: "Please fill in all required fields",
        variant: "destructive",
      });
      return;
    }

    updateInvoice({
      id: invoice.id,
      updates: {
        client_id: formData.client_id,
        amount: parseFloat(formData.amount),
        vat_amount: parseFloat(formData.vat_amount),
        total_amount: parseFloat(formData.total_amount),
        due_date: formData.due_date,
        service_period_start: formData.service_period_start,
        service_period_end: formData.service_period_end,
        notes: formData.notes,
        status: formData.status
      }
    });

    onClose();
  };

  if (!invoice) return null;

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle>Edit Invoice {invoice.invoice_number}</DialogTitle>
        </DialogHeader>
        
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label htmlFor="client_id">Client *</Label>
              <Select value={formData.client_id} onValueChange={(value) => handleInputChange('client_id', value)}>
                <SelectTrigger>
                  <SelectValue placeholder="Select client" />
                </SelectTrigger>
                <SelectContent>
                  {clients.map(client => (
                    <SelectItem key={client.id} value={client.id}>
                      {client.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            
            <div>
              <Label htmlFor="status">Status</Label>
              <Select value={formData.status} onValueChange={(value) => handleInputChange('status', value)}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="draft">Draft</SelectItem>
                  <SelectItem value="pending">Pending</SelectItem>
                  <SelectItem value="paid">Paid</SelectItem>
                  <SelectItem value="overdue">Overdue</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label htmlFor="amount">Amount (KES) *</Label>
              <Input
                id="amount"
                type="number"
                step="0.01"
                value={formData.amount}
                onChange={(e) => handleInputChange('amount', e.target.value)}
                placeholder="0.00"
              />
            </div>
            
            <div>
              <Label htmlFor="due_date">Due Date *</Label>
              <Input
                id="due_date"
                type="date"
                value={formData.due_date}
                onChange={(e) => handleInputChange('due_date', e.target.value)}
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label htmlFor="vat_amount">VAT Amount (16%)</Label>
              <Input
                id="vat_amount"
                type="number"
                step="0.01"
                value={formData.vat_amount}
                readOnly
                className="bg-gray-50"
              />
            </div>
            
            <div>
              <Label htmlFor="total_amount">Total Amount</Label>
              <Input
                id="total_amount"
                type="number"
                step="0.01"
                value={formData.total_amount}
                readOnly
                className="bg-gray-50"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label htmlFor="service_period_start">Service Start</Label>
              <Input
                id="service_period_start"
                type="date"
                value={formData.service_period_start}
                onChange={(e) => handleInputChange('service_period_start', e.target.value)}
              />
            </div>
            
            <div>
              <Label htmlFor="service_period_end">Service End</Label>
              <Input
                id="service_period_end"
                type="date"
                value={formData.service_period_end}
                onChange={(e) => handleInputChange('service_period_end', e.target.value)}
              />
            </div>
          </div>

          <div>
            <Label htmlFor="notes">Notes</Label>
            <Textarea
              id="notes"
              value={formData.notes}
              onChange={(e) => handleInputChange('notes', e.target.value)}
              placeholder="Additional notes or description..."
            />
          </div>

          <div className="flex justify-end space-x-2 pt-4">
            <Button type="button" variant="outline" onClick={onClose}>
              Cancel
            </Button>
            <Button type="submit" disabled={isUpdating}>
              {isUpdating ? 'Updating...' : 'Update Invoice'}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default EditInvoiceDialog;
