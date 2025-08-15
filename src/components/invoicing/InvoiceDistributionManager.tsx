
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Textarea } from '@/components/ui/textarea';
import { Mail, Send, Package, Truck, CheckCircle, Clock } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';

interface InvoiceDistribution {
  id: string;
  invoice_number: string;
  client_id: string;
  amount: number;
  status: string;
  distribution_method?: string;
  distributed_at?: string;
  tracking_number?: string;
  notes?: string;
}

const InvoiceDistributionManager: React.FC = () => {
  const [selectedInvoices, setSelectedInvoices] = useState<string[]>([]);
  const [distributionMethod, setDistributionMethod] = useState('');
  const [trackingNumber, setTrackingNumber] = useState('');
  const [notes, setNotes] = useState('');
  const [isDistributing, setIsDistributing] = useState(false);
  const [invoices, setInvoices] = useState<InvoiceDistribution[]>([]);
  const { toast } = useToast();

  const handleDistribute = async () => {
    if (!distributionMethod || selectedInvoices.length === 0) {
      toast({
        title: "Error",
        description: "Please select invoices and distribution method",
        variant: "destructive",
      });
      return;
    }

    setIsDistributing(true);
    try {
      for (const invoiceId of selectedInvoices) {
        const updateData: any = {
          status: 'distributed',
          notes: notes,
        };

        // Add distribution method and tracking if provided
        if (distributionMethod) {
          updateData.distribution_method = distributionMethod;
        }
        if (trackingNumber) {
          updateData.tracking_number = trackingNumber;
        }
        updateData.distributed_at = new Date().toISOString();

        const { error } = await supabase
          .from('installation_invoices')
          .update(updateData)
          .eq('id', invoiceId);

        if (error) {
          console.error('Error updating invoice:', error);
          throw error;
        }
      }

      toast({
        title: "Success",
        description: `${selectedInvoices.length} invoice(s) marked as distributed`,
      });

      // Reset form
      setSelectedInvoices([]);
      setDistributionMethod('');
      setTrackingNumber('');
      setNotes('');
      
      // Refresh invoice list
      loadInvoices();
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to distribute invoices",
        variant: "destructive",
      });
    } finally {
      setIsDistributing(false);
    }
  };

  const loadInvoices = async () => {
    try {
      const { data, error } = await supabase
        .from('installation_invoices')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;

      // Transform the data to match our interface
      const transformedData: InvoiceDistribution[] = (data || []).map(invoice => ({
        id: invoice.id,
        invoice_number: invoice.invoice_number,
        client_id: invoice.client_id,
        amount: invoice.total_amount,
        status: invoice.status || 'pending',
        distribution_method: invoice.distribution_method || undefined,
        distributed_at: invoice.distributed_at || undefined,
        tracking_number: invoice.tracking_number || undefined,
        notes: invoice.notes || undefined,
      }));

      setInvoices(transformedData);
    } catch (error) {
      console.error('Error loading invoices:', error);
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'distributed':
        return <CheckCircle className="h-4 w-4 text-green-600" />;
      case 'pending':
        return <Clock className="h-4 w-4 text-yellow-600" />;
      default:
        return <Package className="h-4 w-4 text-gray-600" />;
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'distributed':
        return <Badge variant="default" className="bg-green-100 text-green-800">Distributed</Badge>;
      case 'pending':
        return <Badge variant="secondary">Pending</Badge>;
      default:
        return <Badge variant="outline">{status}</Badge>;
    }
  };

  React.useEffect(() => {
    loadInvoices();
  }, []);

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-2">
        <Send className="h-6 w-6" />
        <h2 className="text-2xl font-bold">Invoice Distribution</h2>
      </div>

      {/* Distribution Controls */}
      <Card>
        <CardHeader>
          <CardTitle>Distribute Selected Invoices</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label htmlFor="distribution-method">Distribution Method</Label>
              <Select value={distributionMethod} onValueChange={setDistributionMethod}>
                <SelectTrigger>
                  <SelectValue placeholder="Select method" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="email">Email</SelectItem>
                  <SelectItem value="sms">SMS</SelectItem>
                  <SelectItem value="postal">Postal Mail</SelectItem>
                  <SelectItem value="courier">Courier</SelectItem>
                  <SelectItem value="hand_delivery">Hand Delivery</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label htmlFor="tracking-number">Tracking Number (Optional)</Label>
              <Input
                id="tracking-number"
                value={trackingNumber}
                onChange={(e) => setTrackingNumber(e.target.value)}
                placeholder="Enter tracking number"
              />
            </div>
          </div>

          <div>
            <Label htmlFor="distribution-notes">Notes (Optional)</Label>
            <Textarea
              id="distribution-notes"
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="Add any distribution notes..."
              rows={3}
            />
          </div>

          <Button 
            onClick={handleDistribute}
            disabled={isDistributing || selectedInvoices.length === 0 || !distributionMethod}
            className="w-full"
          >
            {isDistributing ? 'Distributing...' : `Distribute ${selectedInvoices.length} Invoice(s)`}
          </Button>
        </CardContent>
      </Card>

      {/* Invoice List */}
      <Card>
        <CardHeader>
          <CardTitle>Installation Invoices</CardTitle>
        </CardHeader>
        <CardContent>
          {invoices.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              <Mail className="h-12 w-12 mx-auto mb-4 opacity-50" />
              <p>No invoices found</p>
              <p className="text-sm">Installation invoices will appear here</p>
            </div>
          ) : (
            <div className="space-y-2">
              {invoices.map((invoice) => (
                <div 
                  key={invoice.id} 
                  className={`flex items-center justify-between p-4 border rounded-lg cursor-pointer transition-colors ${
                    selectedInvoices.includes(invoice.id) ? 'bg-blue-50 border-blue-200' : 'hover:bg-gray-50'
                  }`}
                  onClick={() => {
                    if (selectedInvoices.includes(invoice.id)) {
                      setSelectedInvoices(prev => prev.filter(id => id !== invoice.id));
                    } else {
                      setSelectedInvoices(prev => [...prev, invoice.id]);
                    }
                  }}
                >
                  <div className="flex items-center gap-4">
                    <input
                      type="checkbox"
                      checked={selectedInvoices.includes(invoice.id)}
                      onChange={() => {}} // Handled by div onClick
                      className="h-4 w-4"
                    />
                    <div>
                      <div className="font-medium">{invoice.invoice_number}</div>
                      <div className="text-sm text-muted-foreground">
                        Amount: KES {invoice.amount.toLocaleString()}
                      </div>
                      {invoice.tracking_number && (
                        <div className="text-xs text-blue-600">
                          Tracking: {invoice.tracking_number}
                        </div>
                      )}
                    </div>
                  </div>
                  
                  <div className="flex flex-col items-end gap-2">
                    <div className="flex items-center gap-2">
                      {getStatusIcon(invoice.status)}
                      {getStatusBadge(invoice.status)}
                    </div>
                    {invoice.distribution_method && (
                      <Badge variant="outline" className="text-xs">
                        {invoice.distribution_method.replace('_', ' ')}
                      </Badge>
                    )}
                    {invoice.distributed_at && (
                      <div className="text-xs text-muted-foreground">
                        Distributed: {new Date(invoice.distributed_at).toLocaleDateString()}
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default InvoiceDistributionManager;
