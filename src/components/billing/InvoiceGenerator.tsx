
import React, { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { DatePicker } from '@/components/ui/date-picker';
import { useClients } from '@/hooks/useClients';
import { useInvoices } from '@/hooks/useInvoices';

interface InvoiceGeneratorProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

const InvoiceGenerator: React.FC<InvoiceGeneratorProps> = ({ open, onOpenChange }) => {
  const { clients } = useClients();
  const { createInvoice } = useInvoices();
  
  const [formData, setFormData] = useState({
    client_id: '',
    amount: 0,
    vat_amount: 0,
    total_amount: 0,
    status: 'pending',
    due_date: new Date(),
    service_period_start: new Date(),
    service_period_end: new Date(),
    notes: '',
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const invoiceData = {
      ...formData,
      invoice_number: `INV-${Date.now()}`,
      due_date: formData.due_date.toISOString(),
      service_period_start: formData.service_period_start.toISOString(),
      service_period_end: formData.service_period_end.toISOString(),
    };
    
    createInvoice(invoiceData);
    onOpenChange(false);
  };

  const handleAmountChange = (amount: number) => {
    const vatAmount = amount * 0.16; // 16% VAT
    const totalAmount = amount + vatAmount;
    
    setFormData(prev => ({
      ...prev,
      amount,
      vat_amount: vatAmount,
      total_amount: totalAmount,
    }));
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle>Generate Invoice</DialogTitle>
        </DialogHeader>
        
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <Label>Client</Label>
            <Select value={formData.client_id} onValueChange={(value) => setFormData(prev => ({ ...prev, client_id: value }))}>
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

          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label htmlFor="amount">Amount (KES)</Label>
              <Input
                id="amount"
                type="number"
                value={formData.amount}
                onChange={(e) => handleAmountChange(Number(e.target.value))}
                required
              />
            </div>
            
            <div>
              <Label>Status</Label>
              <Select value={formData.status} onValueChange={(value) => setFormData(prev => ({ ...prev, status: value }))}>
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
              <Label>Due Date</Label>
              <DatePicker
                date={formData.due_date}
                onDateChange={(date) => setFormData(prev => ({ ...prev, due_date: date || new Date() }))}
              />
            </div>
            
            <div>
              <Label>Service Period Start</Label>
              <DatePicker
                date={formData.service_period_start}
                onDateChange={(date) => setFormData(prev => ({ ...prev, service_period_start: date || new Date() }))}
              />
            </div>
            
            <div>
              <Label>Service Period End</Label>
              <DatePicker
                date={formData.service_period_end}
                onDateChange={(date) => setFormData(prev => ({ ...prev, service_period_end: date || new Date() }))}
              />
            </div>
          </div>

          <div className="grid grid-cols-3 gap-4 p-4 bg-muted rounded-lg">
            <div>
              <Label>Subtotal</Label>
              <div className="text-lg font-semibold">KES {formData.amount.toFixed(2)}</div>
            </div>
            <div>
              <Label>VAT (16%)</Label>
              <div className="text-lg font-semibold">KES {formData.vat_amount.toFixed(2)}</div>
            </div>
            <div>
              <Label>Total</Label>
              <div className="text-lg font-bold">KES {formData.total_amount.toFixed(2)}</div>
            </div>
          </div>

          <div>
            <Label htmlFor="notes">Notes</Label>
            <Textarea
              id="notes"
              value={formData.notes}
              onChange={(e) => setFormData(prev => ({ ...prev, notes: e.target.value }))}
              rows={3}
            />
          </div>

          <div className="flex justify-end space-x-2 pt-4">
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              Cancel
            </Button>
            <Button type="submit">
              Generate Invoice
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default InvoiceGenerator;
