
import React, { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useInvoices, CreateInvoiceData } from '@/hooks/useInvoices';
import { useClients } from '@/hooks/useClients';
import { useToast } from '@/hooks/use-toast';

interface CreateInvoiceDialogProps {
  open: boolean;
  onClose: () => void;
}

const CreateInvoiceDialog: React.FC<CreateInvoiceDialogProps> = ({ open, onClose }) => {
  const { createInvoice, isCreating } = useInvoices();
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

    const invoiceData: CreateInvoiceData = {
      client_id: formData.client_id,
      amount: parseFloat(formData.amount),
      vat_amount: parseFloat(formData.vat_amount),
      total_amount: parseFloat(formData.total_amount),
      due_date: formData.due_date,
      service_period_start: formData.service_period_start,
      service_period_end: formData.service_period_end,
      notes: formData.notes,
      status: formData.status
    };

    createInvoice(invoiceData);

    // Reset form and close dialog
    setFormData({
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
    onClose();
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle>Create New Invoice</DialogTitle>
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

          <div className="grid grid-cols-3 gap-4">
            <div>
              <Label htmlFor="due_date">Due Date *</Label>
              <Input
                id="due_date"
                type="date"
                value={formData.due_date}
                onChange={(e) => handleInputChange('due_date', e.target.value)}
              />
            </div>
            
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
            <Button type="submit" disabled={isCreating}>
              {isCreating ? 'Creating...' : 'Create Invoice'}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default CreateInvoiceDialog;
