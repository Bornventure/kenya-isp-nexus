import React, { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Calendar } from 'lucide-react';
import { Calendar as CalendarIcon } from "@/components/ui/calendar"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { cn } from "@/lib/utils"
import { format } from "date-fns"
import { DatePicker } from "@/components/ui/date-picker"
import { useInvoices } from '@/hooks/useInvoices';
import { useClients } from '@/hooks/useClients';

interface InvoiceGeneratorProps {
  open: boolean;
  onClose: () => void;
}

const InvoiceGenerator: React.FC<InvoiceGeneratorProps> = ({ open, onClose }) => {
  const { createInvoice } = useInvoices();
  const { clients } = useClients();
  const [selectedClient, setSelectedClient] = useState<any>(null);
  const [amount, setAmount] = useState('');
  const [dueDate, setDueDate] = useState('');
  const [servicePeriodStart, setServicePeriodStart] = useState('');
  const [servicePeriodEnd, setServicePeriodEnd] = useState('');
  const [notes, setNotes] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedClient) return;

    const invoiceData = {
      client_id: selectedClient.id,
      invoice_number: `INV-${Date.now()}`,
      amount: parseFloat(amount),
      vat_amount: parseFloat(amount) * 0.16,
      total_amount: parseFloat(amount) * 1.16,
      due_date: dueDate,
      service_period_start: servicePeriodStart,
      service_period_end: servicePeriodEnd,
      notes: notes || undefined,
      status: 'pending' as const,
    };

    try {
      await createInvoice(invoiceData);
      // Reset form
      setSelectedClient(null);
      setAmount('');
      setDueDate('');
      setServicePeriodStart('');
      setServicePeriodEnd('');
      setNotes('');
      onClose();
    } catch (error) {
      console.error('Error creating invoice:', error);
    }
  };

  const handleInputChange = (field: string, value: any) => {
    switch (field) {
      case 'client':
        setSelectedClient(value);
        break;
      case 'amount':
        setAmount(value);
        break;
      case 'dueDate':
        setDueDate(value);
        break;
      case 'servicePeriodStart':
        setServicePeriodStart(value);
        break;
      case 'servicePeriodEnd':
        setServicePeriodEnd(value);
        break;
      case 'notes':
        setNotes(value);
        break;
      default:
        break;
    }
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Generate Invoice</DialogTitle>
        </DialogHeader>
        
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <Label htmlFor="client">Client *</Label>
            <select
              id="client"
              className="w-full px-3 py-2 border rounded-md"
              value={selectedClient ? selectedClient.id : ''}
              onChange={(e) => {
                const selected = clients.find(client => client.id === e.target.value);
                handleInputChange('client', selected || null);
              }}
              required
            >
              <option value="">Select a client</option>
              {clients.map((client) => (
                <option key={client.id} value={client.id}>
                  {client.name} ({client.email})
                </option>
              ))}
            </select>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label htmlFor="amount">Amount (KES) *</Label>
              <Input
                id="amount"
                type="number"
                value={amount}
                onChange={(e) => handleInputChange('amount', e.target.value)}
                required
              />
            </div>
            
            <div>
              <Label htmlFor="dueDate">Due Date *</Label>
              <Input
                id="dueDate"
                type="date"
                value={dueDate}
                onChange={(e) => handleInputChange('dueDate', e.target.value)}
                required
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label htmlFor="servicePeriodStart">Service Period Start *</Label>
              <Input
                id="servicePeriodStart"
                type="date"
                value={servicePeriodStart}
                onChange={(e) => handleInputChange('servicePeriodStart', e.target.value)}
                required
              />
            </div>
            
            <div>
              <Label htmlFor="servicePeriodEnd">Service Period End *</Label>
              <Input
                id="servicePeriodEnd"
                type="date"
                value={servicePeriodEnd}
                onChange={(e) => handleInputChange('servicePeriodEnd', e.target.value)}
                required
              />
            </div>
          </div>

          <div>
            <Label htmlFor="notes">Notes</Label>
            <Input
              id="notes"
              value={notes}
              onChange={(e) => handleInputChange('notes', e.target.value)}
            />
          </div>

          <div className="flex justify-end space-x-2 pt-4">
            <Button type="button" variant="outline" onClick={onClose}>
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
