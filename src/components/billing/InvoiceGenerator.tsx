
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

interface InvoiceGeneratorProps {
  onInvoiceGenerated: (invoice: any) => void;
}

const mockClients = [
  { id: '1', name: 'John Doe', email: 'john@example.com' },
  { id: '2', name: 'Jane Smith', email: 'jane@example.com' },
  { id: '3', name: 'Tech Solutions Ltd', email: 'contact@techsolutions.com' },
  { id: '4', name: 'Mary Johnson', email: 'mary@example.com' },
];

const servicePackages = [
  { id: '1', name: 'Basic Wireless 10Mbps', price: 2200 },
  { id: '2', name: 'Standard Fiber 25Mbps', price: 2800 },
  { id: '3', name: 'Premium Fiber 50Mbps', price: 3500 },
  { id: '4', name: 'Business Fiber 100Mbps', price: 15000 },
];

const InvoiceGenerator: React.FC<InvoiceGeneratorProps> = ({ onInvoiceGenerated }) => {
  const [formData, setFormData] = useState({
    clientId: '',
    servicePackageId: '',
    amount: '',
    dueDate: '',
    notes: '',
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    const selectedClient = mockClients.find(c => c.id === formData.clientId);
    const selectedPackage = servicePackages.find(p => p.id === formData.servicePackageId);
    
    const newInvoice = {
      id: `INV-2024-${String(Math.floor(Math.random() * 1000)).padStart(3, '0')}`,
      clientName: selectedClient?.name || '',
      amount: parseInt(formData.amount) || selectedPackage?.price || 0,
      dueDate: formData.dueDate,
      status: 'draft',
      issueDate: new Date().toISOString().split('T')[0],
      servicePackage: selectedPackage?.name || '',
      notes: formData.notes,
    };

    onInvoiceGenerated(newInvoice);
    
    // Reset form
    setFormData({
      clientId: '',
      servicePackageId: '',
      amount: '',
      dueDate: '',
      notes: '',
    });
  };

  const selectedPackage = servicePackages.find(p => p.id === formData.servicePackageId);

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
                  {mockClients.map((client) => (
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
                    amount: pkg?.price.toString() || ''
                  });
                }}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Choose a service package" />
                </SelectTrigger>
                <SelectContent>
                  {servicePackages.map((pkg) => (
                    <SelectItem key={pkg.id} value={pkg.id}>
                      {pkg.name} - KES {pkg.price.toLocaleString()}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
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
              {selectedPackage && (
                <p className="text-sm text-gray-500 mt-1">
                  Default: KES {selectedPackage.price.toLocaleString()}
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
          </div>

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
            <Button type="submit">
              Generate Invoice
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
};

export default InvoiceGenerator;
