
import React, { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { useInvoices } from '@/hooks/useInvoices';
import { useClients } from '@/hooks/useClients';

interface CreateInvoiceDialogProps {
  open: boolean;
  onClose: () => void;
}

const CreateInvoiceDialog: React.FC<CreateInvoiceDialogProps> = ({ open, onClose }) => {
  const { createInvoice } = useInvoices();
  const { clients } = useClients();
  
  const [formData, setFormData] = useState({
    client_id: '',
    invoice_number: '',
    amount: 0,
    vat_amount: 0,
    total_amount: 0,
    status: 'draft',
    due_date: '',
    service_period_start: '',
    service_period_end: '',
    notes: '',
  });

  // Generate invoice number when dialog opens
  useEffect(() => {
    if (open && !formData.invoice_number) {
      const invoiceNumber = `INV-${Date.now()}`;
      setFormData(prev => ({ ...prev, invoice_number: invoiceNumber }));
    }
  }, [open, formData.invoice_number]);

  // Calculate totals when amount changes
  useEffect(() => {
    const vat = formData.amount * 0.16; // 16% VAT
    const total = formData.amount + vat;
    setFormData(prev => ({
      ...prev,
      vat_amount: Number(vat.toFixed(2)),
      total_amount: Number(total.toFixed(2))
    }));
  }, [formData.amount]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    createInvoice({
      ...formData,
      amount: Number(formData.amount),
      vat_amount: formData.vat_amount,
      total_amount: formData.total_amount,
    });
    
    // Reset form
    setFormData({
      client_id: '',
      invoice_number: '',
      amount: 0,
      vat_amount: 0,
      total_amount: 0,
      status: 'draft',
      due_date: '',
      service_period_start: '',
      service_period_end: '',
      notes: '',
    });
    
    onClose();
  };

  const handleInputChange = (field: string, value: any) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Create Invoice</DialogTitle>
        </DialogHeader>
        
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label>Client *</Label>
              <Select value={formData.client_id} onValueChange={(value) => handleInputChange('client_id', value)} required>
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
              <Label htmlFor="invoice_number">Invoice Number *</Label>
              <Input
                id="invoice_number"
                value={formData.invoice_number}
                onChange={(e) => handleInputChange('invoice_number', e.target.value)}
                required
              />
            </div>
          </div>

          <div className="grid grid-cols-3 gap-4">
            <div>
              <Label htmlFor="amount">Amount (KES) *</Label>
              <Input
                id="amount"
                type="number"
                step="0.01"
                min="0"
                value={formData.amount}
                onChange={(e) => handleInputChange('amount', parseFloat(e.target.value) || 0)}
                required
              />
            </div>
            
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
              <Label>Status</Label>
              <Select value={formData.status} onValueChange={(value) => handleInputChange('status', value)}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="draft">Draft</SelectItem>
                  <SelectItem value="sent">Sent</SelectItem>
                  <SelectItem value="paid">Paid</SelectItem>
                  <SelectItem value="overdue">Overdue</SelectItem>
                  <SelectItem value="cancelled">Cancelled</SelectItem>
                </SelectContent>
              </Select>
            </div>
            
            <div>
              <Label htmlFor="due_date">Due Date *</Label>
              <Input
                id="due_date"
                type="date"
                value={formData.due_date}
                onChange={(e) => handleInputChange('due_date', e.target.value)}
                required
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label htmlFor="service_period_start">Service Period Start</Label>
              <Input
                id="service_period_start"
                type="date"
                value={formData.service_period_start}
                onChange={(e) => handleInputChange('service_period_start', e.target.value)}
              />
            </div>
            
            <div>
              <Label htmlFor="service_period_end">Service Period End</Label>
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
              rows={3}
            />
          </div>

          <div className="flex justify-end space-x-2 pt-4">
            <Button type="button" variant="outline" onClick={onClose}>
              Cancel
            </Button>
            <Button type="submit">
              Create Invoice
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default CreateInvoiceDialog;
