import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Textarea } from '@/components/ui/textarea';
import { useClients } from '@/hooks/useClients';
import { usePayments } from '@/hooks/usePayments';
import { validateMpesaNumber, formatMpesaNumber, formatKenyanCurrency } from '@/utils/kenyanValidation';
import { Smartphone, Building2, Banknote, CreditCard } from 'lucide-react';

const PaymentForm: React.FC = () => {
  const { clients } = useClients();
  const { createPayment, isCreating } = usePayments();
  
  const [formData, setFormData] = useState({
    clientId: '',
    amount: '',
    paymentMethod: '' as 'mpesa' | 'bank' | 'cash' | '',
    referenceNumber: '',
    mpesaReceiptNumber: '',
    notes: '',
  });

  const [errors, setErrors] = useState<Record<string, string>>({});

  const validateForm = () => {
    const newErrors: Record<string, string> = {};

    if (!formData.clientId) newErrors.clientId = 'Please select a client';
    if (!formData.amount || parseFloat(formData.amount) <= 0) newErrors.amount = 'Please enter a valid amount';
    if (!formData.paymentMethod) newErrors.paymentMethod = 'Please select a payment method';

    if (formData.paymentMethod === 'mpesa') {
      if (!formData.mpesaReceiptNumber) {
        newErrors.mpesaReceiptNumber = 'M-Pesa receipt number is required';
      }
      if (formData.referenceNumber && !validateMpesaNumber(formData.referenceNumber)) {
        newErrors.referenceNumber = 'Invalid M-Pesa number format';
      }
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) return;

    const paymentData = {
      client_id: formData.clientId,
      amount: parseFloat(formData.amount),
      payment_method: formData.paymentMethod as 'mpesa' | 'bank' | 'cash',
      payment_date: new Date().toISOString(),
      reference_number: formData.referenceNumber || null,
      mpesa_receipt_number: formData.paymentMethod === 'mpesa' ? formData.mpesaReceiptNumber : null,
      notes: formData.notes || null,
      invoice_id: null,
    };

    createPayment(paymentData);
    
    // Reset form
    setFormData({
      clientId: '',
      amount: '',
      paymentMethod: '',
      referenceNumber: '',
      mpesaReceiptNumber: '',
      notes: '',
    });
    setErrors({});
  };

  const getPaymentMethodIcon = (method: string) => {
    switch (method) {
      case 'mpesa': return <Smartphone className="h-4 w-4" />;
      case 'bank': return <Building2 className="h-4 w-4" />;
      case 'cash': return <Banknote className="h-4 w-4" />;
      default: return <CreditCard className="h-4 w-4" />;
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Record Payment</CardTitle>
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
              <Label htmlFor="amount">Amount (KES)</Label>
              <Input
                id="amount"
                type="number"
                value={formData.amount}
                onChange={(e) => setFormData({ ...formData, amount: e.target.value })}
                placeholder="Enter amount"
              />
              {errors.amount && <p className="text-sm text-red-600 mt-1">{errors.amount}</p>}
              {formData.amount && (
                <p className="text-sm text-gray-500 mt-1">
                  Amount: {formatKenyanCurrency(parseFloat(formData.amount) || 0)}
                </p>
              )}
            </div>

            <div className="md:col-span-2">
              <Label>Payment Method</Label>
              <div className="grid grid-cols-3 gap-2 mt-2">
                {[
                  { value: 'mpesa', label: 'M-Pesa', color: 'border-green-500' },
                  { value: 'bank', label: 'Bank Transfer', color: 'border-blue-500' },
                  { value: 'cash', label: 'Cash', color: 'border-orange-500' },
                ].map((method) => (
                  <button
                    key={method.value}
                    type="button"
                    onClick={() => setFormData({ ...formData, paymentMethod: method.value as any })}
                    className={`p-3 border-2 rounded-lg flex items-center justify-center gap-2 transition-colors ${
                      formData.paymentMethod === method.value
                        ? `${method.color} bg-opacity-10`
                        : 'border-gray-200 hover:border-gray-300'
                    }`}
                  >
                    {getPaymentMethodIcon(method.value)}
                    <span className="text-sm font-medium">{method.label}</span>
                  </button>
                ))}
              </div>
              {errors.paymentMethod && <p className="text-sm text-red-600 mt-1">{errors.paymentMethod}</p>}
            </div>

            {formData.paymentMethod === 'mpesa' && (
              <>
                <div>
                  <Label htmlFor="mpesaReceipt">M-Pesa Receipt Number</Label>
                  <Input
                    id="mpesaReceipt"
                    value={formData.mpesaReceiptNumber}
                    onChange={(e) => setFormData({ ...formData, mpesaReceiptNumber: e.target.value })}
                    placeholder="e.g., QA12345678"
                  />
                  {errors.mpesaReceiptNumber && <p className="text-sm text-red-600 mt-1">{errors.mpesaReceiptNumber}</p>}
                </div>
                <div>
                  <Label htmlFor="mpesaNumber">M-Pesa Number (Optional)</Label>
                  <Input
                    id="mpesaNumber"
                    value={formData.referenceNumber}
                    onChange={(e) => setFormData({ ...formData, referenceNumber: formatMpesaNumber(e.target.value) })}
                    placeholder="e.g., +254712345678"
                  />
                  {errors.referenceNumber && <p className="text-sm text-red-600 mt-1">{errors.referenceNumber}</p>}
                </div>
              </>
            )}

            {formData.paymentMethod === 'bank' && (
              <div className="md:col-span-2">
                <Label htmlFor="bankReference">Bank Reference Number</Label>
                <Input
                  id="bankReference"
                  value={formData.referenceNumber}
                  onChange={(e) => setFormData({ ...formData, referenceNumber: e.target.value })}
                  placeholder="Bank transaction reference"
                />
              </div>
            )}

            {formData.paymentMethod === 'cash' && (
              <div className="md:col-span-2">
                <Label htmlFor="cashReference">Receipt Number (Optional)</Label>
                <Input
                  id="cashReference"
                  value={formData.referenceNumber}
                  onChange={(e) => setFormData({ ...formData, referenceNumber: e.target.value })}
                  placeholder="Cash receipt number"
                />
              </div>
            )}
          </div>

          <div>
            <Label htmlFor="notes">Notes (Optional)</Label>
            <Textarea
              id="notes"
              value={formData.notes}
              onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
              placeholder="Additional payment notes..."
              rows={3}
            />
          </div>

          <div className="flex justify-end">
            <Button type="submit" disabled={isCreating}>
              {isCreating ? 'Recording...' : 'Record Payment'}
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
};

export default PaymentForm;
