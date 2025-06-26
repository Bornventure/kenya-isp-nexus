
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useClients } from '@/hooks/useClients';
import { useInvoices } from '@/hooks/useInvoices';
import { formatKenyanCurrency } from '@/utils/kenyanValidation';
import { CalendarIcon } from 'lucide-react';

const InvoiceGenerator: React.FC = () => {
  const { clients } = useClients();
  const { createInvoice, isCreating } = useInvoices();
  
  const [formData, setFormData] = useState({
    clientId: '',
    amount: '',
    dueDate: '',
    servicePeriodStart: '',
    servicePeriodEnd: '',
    notes: '',
  });

  const [errors, setErrors] = useState<Record<string, string>>({});

  const validateForm = () => {
    const newErrors: Record<string, string> = {};

    if (!formData.clientId) newErrors.clientId = 'Please select a client';
    if (!formData.amount || parseFloat(formData.amount) <= 0) newErrors.amount = 'Please enter a valid amount';
    if (!formData.dueDate) newErrors.dueDate = 'Please select a due date';
    if (!formData.servicePeriodStart) newErrors.servicePeriodStart = 'Please select service start date';
    if (!formData.servicePeriodEnd) newErrors.servicePeriodEnd = 'Please select service end date';

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) return;

    const amount = parseFloat(formData.amount);
    const vatAmount = amount * 0.16; // 16% VAT
    const totalAmount = amount + vatAmount;

    const invoiceNumber = `INV-${Date.now()}`;

    createInvoice({
      invoice_number: invoiceNumber,
      client_id: formData.clientId,
      amount,
      vat_amount: vatAmount,
      total_amount: totalAmount,
      status: 'pending',
      due_date: formData.dueDate,
      service_period_start: formData.servicePeriodStart,
      service_period_end: formData.servicePeriodEnd,
      notes: formData.notes || null,
      isp_company_id: '',
      created_at: '',
      updated_at: '',
    });

    // Reset form
    setFormData({
      clientId: '',
      amount: '',
      dueDate: '',
      servicePeriodStart: '',
      servicePeriodEnd: '',
      notes: '',
    });
    setErrors({});
  };

  const amount = parseFloat(formData.amount) || 0;
  const vatAmount = amount * 0.16;
  const totalAmount = amount + vatAmount;

  return (
    <Card>
      <CardHeader>
        <CardTitle>Generate New Invoice</CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label htmlFor="client">Select Client</Label>
              <Select
                value={formData.clientId}
                onValueChange={(value) => setFormData({ ...formData, clientId: value })}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Choose a client" />
                </SelectTrigger>
                <SelectContent>
                  {clients.map((client) => (
                    <SelectItem key={client.id} value={client.id}>
                      {client.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              {errors.clientId && <p className="text-sm text-red-600 mt-1">{errors.clientId}</p>}
            </div>

            <div>
              <Label htmlFor="amount">Amount (KES) - Excluding VAT</Label>
              <Input
                id="amount"
                type="number"
                step="0.01"
                value={formData.amount}
                onChange={(e) => setFormData({ ...formData, amount: e.target.value })}
                placeholder="Enter amount"
              />
              {errors.amount && <p className="text-sm text-red-600 mt-1">{errors.amount}</p>}
            </div>

            <div>
              <Label htmlFor="dueDate">Due Date</Label>
              <Input
                id="dueDate"
                type="date"
                value={formData.dueDate}
                onChange={(e) => setFormData({ ...formData, dueDate: e.target.value })}
              />
              {errors.dueDate && <p className="text-sm text-red-600 mt-1">{errors.dueDate}</p>}
            </div>

            <div>
              <Label htmlFor="servicePeriodStart">Service Period Start</Label>
              <Input
                id="servicePeriodStart"
                type="date"
                value={formData.servicePeriodStart}
                onChange={(e) => setFormData({ ...formData, servicePeriodStart: e.target.value })}
              />
              {errors.servicePeriodStart && <p className="text-sm text-red-600 mt-1">{errors.servicePeriodStart}</p>}
            </div>

            <div>
              <Label htmlFor="servicePeriodEnd">Service Period End</Label>
              <Input
                id="servicePeriodEnd"
                type="date"
                value={formData.servicePeriodEnd}
                onChange={(e) => setFormData({ ...formData, servicePeriodEnd: e.target.value })}
              />
              {errors.servicePeriodEnd && <p className="text-sm text-red-600 mt-1">{errors.servicePeriodEnd}</p>}
            </div>
          </div>

          {amount > 0 && (
            <div className="bg-gray-50 p-4 rounded-lg">
              <h4 className="font-medium mb-2">Invoice Summary</h4>
              <div className="space-y-1 text-sm">
                <div className="flex justify-between">
                  <span>Amount:</span>
                  <span>{formatKenyanCurrency(amount)}</span>
                </div>
                <div className="flex justify-between">
                  <span>VAT (16%):</span>
                  <span>{formatKenyanCurrency(vatAmount)}</span>
                </div>
                <div className="flex justify-between font-medium text-lg border-t pt-1">
                  <span>Total:</span>
                  <span>{formatKenyanCurrency(totalAmount)}</span>
                </div>
              </div>
            </div>
          )}

          <div>
            <Label htmlFor="notes">Notes (Optional)</Label>
            <Textarea
              id="notes"
              value={formData.notes}
              onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
              placeholder="Additional notes for the invoice..."
              rows={3}
            />
          </div>

          <div className="flex justify-end">
            <Button type="submit" disabled={isCreating}>
              {isCreating ? 'Generating...' : 'Generate Invoice'}
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
};

export default InvoiceGenerator;
