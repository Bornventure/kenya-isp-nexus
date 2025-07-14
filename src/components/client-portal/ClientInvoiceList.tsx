
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { useClientAuth } from '@/contexts/ClientAuthContext';
import { formatKenyanCurrency } from '@/utils/kenyanValidation';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { Download, Eye, RefreshCw, Search } from 'lucide-react';

interface ClientInvoice {
  id: string;
  invoice_number: string;
  amount: number;
  vat_amount: number;
  total_amount: number;
  status: 'draft' | 'pending' | 'paid' | 'overdue';
  due_date: string;
  service_period_start: string;
  service_period_end: string;
  notes: string | null;
  created_at: string;
}

interface ClientInvoiceListProps {
  onViewInvoice?: (invoice: ClientInvoice) => void;
}

const ClientInvoiceList: React.FC<ClientInvoiceListProps> = ({ onViewInvoice }) => {
  const { client } = useClientAuth();
  const { toast } = useToast();
  const [invoices, setInvoices] = useState<ClientInvoice[]>([]);
  const [loading, setLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  const fetchInvoices = async (page = 1) => {
    if (!client) return;
    
    setLoading(true);
    try {
      // Build query parameters for the edge function
      const queryParams = new URLSearchParams({
        client_email: client.email,
        client_id_number: client.id_number,
        page: page.toString(),
        limit: '10'
      });

      const { data, error } = await supabase.functions.invoke(
        `get-invoice-details?${queryParams.toString()}`
      );

      if (error) throw error;

      if (data?.success) {
        setInvoices(data.invoices || []);
        setTotalPages(data.pagination?.totalPages || 1);
        setCurrentPage(page);
      } else {
        throw new Error(data?.error || 'Failed to fetch invoices');
      }
    } catch (error) {
      console.error('Error fetching invoices:', error);
      toast({
        title: "Error",
        description: "Failed to fetch invoices",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  React.useEffect(() => {
    fetchInvoices();
  }, [client]);

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'paid': return 'bg-green-100 text-green-800';
      case 'pending': return 'bg-yellow-100 text-yellow-800';
      case 'overdue': return 'bg-red-100 text-red-800';
      case 'draft': return 'bg-gray-100 text-gray-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const filteredInvoices = invoices.filter(invoice =>
    invoice.invoice_number.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleDownload = async (invoice: ClientInvoice) => {
    try {
      // You can implement PDF generation here
      toast({
        title: "Download Started",
        description: `Downloading invoice ${invoice.invoice_number}`,
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to download invoice",
        variant: "destructive",
      });
    }
  };

  if (!client) return null;

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle>My Invoices</CardTitle>
          <Button
            onClick={() => fetchInvoices(currentPage)}
            variant="outline"
            size="sm"
            disabled={loading}
          >
            <RefreshCw className={`h-4 w-4 mr-2 ${loading ? 'animate-spin' : ''}`} />
            Refresh
          </Button>
        </div>
        <div className="flex items-center gap-2">
          <Search className="h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search invoices..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="max-w-sm"
          />
        </div>
      </CardHeader>
      <CardContent>
        {loading ? (
          <div className="flex items-center justify-center p-8">
            <RefreshCw className="h-6 w-6 animate-spin mr-2" />
            <span>Loading invoices...</span>
          </div>
        ) : filteredInvoices.length === 0 ? (
          <div className="text-center py-8 text-gray-500">
            <p>No invoices found</p>
          </div>
        ) : (
          <div className="space-y-4">
            {filteredInvoices.map((invoice) => (
              <div key={invoice.id} className="border rounded-lg p-4">
                <div className="flex items-center justify-between mb-2">
                  <div>
                    <h3 className="font-medium">{invoice.invoice_number}</h3>
                    <p className="text-sm text-gray-600">
                      Due: {new Date(invoice.due_date).toLocaleDateString()}
                    </p>
                  </div>
                  <div className="flex items-center gap-2">
                    <Badge className={getStatusColor(invoice.status)}>
                      {invoice.status.toUpperCase()}
                    </Badge>
                    <span className="font-semibold">
                      {formatKenyanCurrency(invoice.total_amount)}
                    </span>
                  </div>
                </div>
                <div className="text-sm text-gray-600 mb-3">
                  Service Period: {new Date(invoice.service_period_start).toLocaleDateString()} - {new Date(invoice.service_period_end).toLocaleDateString()}
                </div>
                <div className="flex gap-2">
                  {onViewInvoice && (
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => onViewInvoice(invoice)}
                    >
                      <Eye className="h-4 w-4 mr-2" />
                      View
                    </Button>
                  )}
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleDownload(invoice)}
                  >
                    <Download className="h-4 w-4 mr-2" />
                    Download
                  </Button>
                </div>
              </div>
            ))}
            
            {totalPages > 1 && (
              <div className="flex justify-center gap-2 mt-4">
                <Button
                  variant="outline"
                  onClick={() => fetchInvoices(currentPage - 1)}
                  disabled={currentPage === 1 || loading}
                >
                  Previous
                </Button>
                <span className="flex items-center px-3">
                  Page {currentPage} of {totalPages}
                </span>
                <Button
                  variant="outline"
                  onClick={() => fetchInvoices(currentPage + 1)}
                  disabled={currentPage === totalPages || loading}
                >
                  Next
                </Button>
              </div>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default ClientInvoiceList;
