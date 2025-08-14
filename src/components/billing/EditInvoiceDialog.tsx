import React, { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { useInvoices, type Invoice } from '@/hooks/useInvoices';
import { useClients } from '@/hooks/useClients';

interface EditInvoiceDialogProps {
  invoice: Invoice | null;
  open: boolean;
  onClose: () => void;
}

const EditInvoiceDialog: React.FC<EditInvoiceDialogProps> = ({ invoice, open, onClose }) => {
  const { updateInvoice } = useInvoices();
  const { clients } = useClients();
  
  const [formData, setFormData] = useState({
    client_id: '',
    amount: 0,
    vat_amount: 0,
    total_amount: 0,
    status: 'pending',
    due_date: '',
    service_period_start: '',
    service_period_end: '',
    notes: '',
  });

  useEffect(() => {
    if (invoice) {
      setFormData({
        client_id: invoice.client_id || '',
        amount: Number(invoice.amount) || 0,
        vat_amount: Number(invoice.vat_amount) || 0,
        total_amount: Number(invoice.total_amount) || 0,
        status: invoice.status || 'pending',
        due_date: invoice.due_date || '',
        service_period_start: invoice.service_period_start || '',
        service_period_end: invoice.service_period_end || '',
        notes: invoice.notes || '',
      });
    }
  }, [invoice]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!invoice) return;

    updateInvoice({
      id: invoice.id,
      updates: formData
    });
    onClose();
  };

  const handleInputChange = (field: string, value: any) => {
    setFormData(prev => {
      const updated = { ...prev, [field]: value };
      
      // Auto-calculate totals
      if (field === 'amount') {
        const amount = Number(value) || 0;
        const vatAmount = amount * 0.16; // 16% VAT
        updated.vat_amount = vatAmount;
        updated.total_amount = amount + vatAmount;
      }
      
      return updated;
    });
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle>Edit Invoice</DialogTitle>
        </DialogHeader>
        
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label>Client *</Label>
              <Select value={formData.client_id} onValueChange={(value) => handleInputChange('client_id', value)}>
                <SelectTrigger>
                  <SelectValue placeholder="Select client" />
                </SelectTrigger>
                <SelectContent>
                  {clients.map((client) => (
                    <SelectItem key={client.id} value={client.id}>
                      {client.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            
            <div>
              <Label>Status</Label>
              <Select value={formData.status} onValueChange={(value) => handleInputChange('status', value)}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="pending">Pending</SelectItem>
                  <SelectItem value="paid">Paid</SelectItem>
                  <SelectItem value="overdue">Overdue</SelectItem>
                  <SelectItem value="cancelled">Cancelled</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="grid grid-cols-3 gap-4">
            <div>
              <Label htmlFor="amount">Amount (KES) *</Label>
              <Input
                id="amount"
                type="number"
                value={formData.amount}
                onChange={(e) => handleInputChange('amount', parseFloat(e.target.value))}
                min="0"
                step="0.01"
                required
              />
            </div>
            
            <div>
              <Label htmlFor="vat_amount">VAT Amount (16%)</Label>
              <Input
                id="vat_amount"
                type="number"
                value={formData.vat_amount.toFixed(2)}
                readOnly
                className="bg-gray-50"
              />
            </div>
            
            <div>
              <Label htmlFor="total_amount">Total Amount</Label>
              <Input
                id="total_amount"
                type="number"
                value={formData.total_amount.toFixed(2)}
                readOnly
                className="bg-gray-50 font-medium"
              />
            </div>
          </div>

          <div className="flex justify-end space-x-2 pt-4">
            <Button type="button" variant="outline" onClick={onClose}>
              Cancel
            </Button>
            <Button type="submit">
              Update Invoice
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default EditInvoiceDialog;
