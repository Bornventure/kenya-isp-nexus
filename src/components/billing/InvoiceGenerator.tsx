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
import { useServicePackages } from '@/hooks/useServicePackages';
import { useInvoices } from '@/hooks/useInvoices';
import { calculateVAT, formatKenyanCurrency } from '@/utils/kenyanValidation';

interface InvoiceGeneratorProps {
  onInvoiceGenerated?: (invoice: any) => void;
}

const InvoiceGenerator: React.FC<InvoiceGeneratorProps> = ({ onInvoiceGenerated }) => {
  const { clients } = useClients();
  const { servicePackages } = useServicePackages();
  const { createInvoice, isCreating } = useInvoices();
  
  const [formData, setFormData] = useState({
    clientId: '',
    servicePackageId: '',
    amount: '',
    dueDate: '',
    notes: '',
    servicePeriodStart: '',
    servicePeriodEnd: '',
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.clientId || !formData.amount || !formData.dueDate) {
      return;
    }

    const baseAmount = parseFloat(formData.amount);
    const { vat, total } = calculateVAT(baseAmount);
    
    const invoiceData = {
      client_id: formData.clientId,
      amount: baseAmount,
      vat_amount: vat,
      total_amount: total,
      due_date: formData.dueDate,
      service_period_start: formData.servicePeriodStart || new Date().toISOString().split('T')[0],
      service_period_end: formData.servicePeriodEnd || new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
      notes: formData.notes,
      status: 'pending' as const,
      invoice_number: `INV-${Date.now()}`,
      invoice_id: null,
    };

    createInvoice(invoiceData);
    
    // Reset form
    setFormData({
      clientId: '',
      servicePackageId: '',
      amount: '',
      dueDate: '',
      notes: '',
      servicePeriodStart: '',
      servicePeriodEnd: '',
    });

    if (onInvoiceGenerated) {
      onInvoiceGenerated(invoiceData);
    }
  };

  const selectedPackage = servicePackages.find(p => p.id === formData.servicePackageId);
  const baseAmount = parseFloat(formData.amount) || 0;
  const { vat, total } = calculateVAT(baseAmount);

  return (
    <Card>
      <CardHeader>
        <CardTitle>Create New Invoice</CardTitle>
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
            </div>

            <div>
              <Label htmlFor="servicePackage">Service Package</Label>
              <Select
                value={formData.servicePackageId}
                onValueChange={(value) => {
                  const pkg = servicePackages.find(p => p.id === value);
                  setFormData({ 
                    ...formData, 
                    servicePackageId: value,
                    amount: pkg?.monthly_rate.toString() || ''
                  });
                }}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Choose a service package" />
                </SelectTrigger>
                <SelectContent>
                  {servicePackages.map((pkg) => (
                    <SelectItem key={pkg.id} value={pkg.id}>
                      {pkg.name} - {formatKenyanCurrency(pkg.monthly_rate)}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label htmlFor="amount">Base Amount (KES)</Label>
              <Input
                id="amount"
                type="number"
                value={formData.amount}
                onChange={(e) => setFormData({ ...formData, amount: e.target.value })}
                placeholder="Enter amount"
              />
              {selectedPackage && (
                <p className="text-sm text-gray-500 mt-1">
                  Default: {formatKenyanCurrency(selectedPackage.monthly_rate)}
                </p>
              )}
            </div>

            <div>
              <Label htmlFor="dueDate">Due Date</Label>
              <Input
                id="dueDate"
                type="date"
                value={formData.dueDate}
                onChange={(e) => setFormData({ ...formData, dueDate: e.target.value })}
              />
            </div>

            <div>
              <Label htmlFor="servicePeriodStart">Service Period Start</Label>
              <Input
                id="servicePeriodStart"
                type="date"
                value={formData.servicePeriodStart}
                onChange={(e) => setFormData({ ...formData, servicePeriodStart: e.target.value })}
              />
            </div>

            <div>
              <Label htmlFor="servicePeriodEnd">Service Period End</Label>
              <Input
                id="servicePeriodEnd"
                type="date"
                value={formData.servicePeriodEnd}
                onChange={(e) => setFormData({ ...formData, servicePeriodEnd: e.target.value })}
              />
            </div>
          </div>

          {baseAmount > 0 && (
            <div className="bg-gray-50 p-4 rounded-lg">
              <h4 className="font-semibold mb-2">Invoice Summary</h4>
              <div className="space-y-1">
                <div className="flex justify-between">
                  <span>Base Amount:</span>
                  <span>{formatKenyanCurrency(baseAmount)}</span>
                </div>
                <div className="flex justify-between">
                  <span>VAT (16%):</span>
                  <span>{formatKenyanCurrency(vat)}</span>
                </div>
                <div className="flex justify-between font-semibold border-t pt-1">
                  <span>Total Amount:</span>
                  <span>{formatKenyanCurrency(total)}</span>
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
              placeholder="Additional notes or terms..."
              rows={3}
            />
          </div>

          <div className="flex justify-end space-x-2">
            <Button type="button" variant="outline">
              Save as Draft
            </Button>
            <Button type="submit" disabled={isCreating}>
              {isCreating ? 'Creating...' : 'Generate Invoice'}
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
};

export default InvoiceGenerator;
