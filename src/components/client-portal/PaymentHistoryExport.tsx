
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useClientAuth } from '@/contexts/ClientAuthContext';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { 
  Download, 
  FileSpreadsheet, 
  FileText, 
  Calendar,
  Filter
} from 'lucide-react';
import { format } from 'date-fns';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';

interface PaymentHistory {
  id: string;
  amount: number;
  payment_method: string;
  payment_date: string;
  reference_number: string;
  mpesa_receipt_number?: string;
  notes?: string;
}

const PaymentHistoryExport: React.FC = () => {
  const { client } = useClientAuth();
  const { toast } = useToast();
  const [isExporting, setIsExporting] = useState(false);
  const [exportFormat, setExportFormat] = useState<'csv' | 'pdf'>('csv');
  const [dateRange, setDateRange] = useState<'all' | '30' | '90' | '365'>('all');

  const fetchPaymentHistory = async (): Promise<PaymentHistory[]> => {
    if (!client) return [];

    try {
      let query = supabase
        .from('payments')
        .select('*')
        .eq('client_id', client.id)
        .order('payment_date', { ascending: false });

      // Apply date filter
      if (dateRange !== 'all') {
        const daysAgo = parseInt(dateRange);
        const dateThreshold = new Date();
        dateThreshold.setDate(dateThreshold.getDate() - daysAgo);
        query = query.gte('payment_date', dateThreshold.toISOString());
      }

      const { data, error } = await query;

      if (error) {
        throw error;
      }

      return data || [];
    } catch (error) {
      console.error('Error fetching payment history:', error);
      throw error;
    }
  };

  const exportToCSV = (payments: PaymentHistory[]) => {
    const headers = [
      'Date',
      'Amount (KES)',
      'Payment Method',
      'Reference Number',
      'M-Pesa Receipt',
      'Notes'
    ];

    const csvData = payments.map(payment => [
      format(new Date(payment.payment_date), 'yyyy-MM-dd HH:mm:ss'),
      payment.amount.toFixed(2),
      payment.payment_method,
      payment.reference_number || '',
      payment.mpesa_receipt_number || '',
      payment.notes || ''
    ]);

    const csvContent = [headers, ...csvData]
      .map(row => row.map(cell => `"${cell}"`).join(','))
      .join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);
    link.setAttribute('href', url);
    link.setAttribute('download', `payment-history-${format(new Date(), 'yyyy-MM-dd')}.csv`);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const exportToPDF = (payments: PaymentHistory[]) => {
    // Create a simple HTML table for PDF generation
    const htmlContent = `
      <!DOCTYPE html>
      <html>
      <head>
        <title>Payment History</title>
        <style>
          body { font-family: Arial, sans-serif; margin: 20px; }
          .header { margin-bottom: 30px; }
          table { width: 100%; border-collapse: collapse; margin-top: 20px; }
          th, td { border: 1px solid #ddd; padding: 8px; text-align: left; }
          th { background-color: #f2f2f2; }
          .total { font-weight: bold; margin-top: 20px; }
        </style>
      </head>
      <body>
        <div class="header">
          <h1>Payment History</h1>
          <p>Client: ${client?.name}</p>
          <p>Generated: ${format(new Date(), 'MMMM dd, yyyy')}</p>
        </div>
        <table>
          <thead>
            <tr>
              <th>Date</th>
              <th>Amount (KES)</th>
              <th>Method</th>
              <th>Reference</th>
              <th>M-Pesa Receipt</th>
            </tr>
          </thead>
          <tbody>
            ${payments.map(payment => `
              <tr>
                <td>${format(new Date(payment.payment_date), 'MMM dd, yyyy HH:mm')}</td>
                <td>${payment.amount.toFixed(2)}</td>
                <td>${payment.payment_method}</td>
                <td>${payment.reference_number || '-'}</td>
                <td>${payment.mpesa_receipt_number || '-'}</td>
              </tr>
            `).join('')}
          </tbody>
        </table>
        <div class="total">
          Total Payments: KES ${payments.reduce((sum, p) => sum + p.amount, 0).toFixed(2)}
        </div>
      </body>
      </html>
    `;

    const blob = new Blob([htmlContent], { type: 'text/html' });
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);
    link.setAttribute('href', url);
    link.setAttribute('download', `payment-history-${format(new Date(), 'yyyy-MM-dd')}.html`);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handleExport = async () => {
    if (!client) return;

    setIsExporting(true);
    try {
      const payments = await fetchPaymentHistory();
      
      if (payments.length === 0) {
        toast({
          title: "No Data",
          description: "No payment history found for the selected period",
          variant: "destructive",
        });
        return;
      }

      if (exportFormat === 'csv') {
        exportToCSV(payments);
      } else {
        exportToPDF(payments);
      }

      toast({
        title: "Export Complete",
        description: `Payment history exported successfully (${payments.length} records)`,
      });
    } catch (error) {
      console.error('Export error:', error);
      toast({
        title: "Export Failed",
        description: "Failed to export payment history. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsExporting(false);
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Download className="h-5 w-5" />
          Export Payment History
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="text-sm font-medium">Export Format</label>
            <Select value={exportFormat} onValueChange={(value: 'csv' | 'pdf') => setExportFormat(value)}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="csv">
                  <div className="flex items-center gap-2">
                    <FileSpreadsheet className="h-4 w-4" />
                    CSV (Excel)
                  </div>
                </SelectItem>
                <SelectItem value="pdf">
                  <div className="flex items-center gap-2">
                    <FileText className="h-4 w-4" />
                    HTML/PDF
                  </div>
                </SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div>
            <label className="text-sm font-medium">Date Range</label>
            <Select value={dateRange} onValueChange={(value: 'all' | '30' | '90' | '365') => setDateRange(value)}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">
                  <div className="flex items-center gap-2">
                    <Calendar className="h-4 w-4" />
                    All Time
                  </div>
                </SelectItem>
                <SelectItem value="30">Last 30 Days</SelectItem>
                <SelectItem value="90">Last 3 Months</SelectItem>
                <SelectItem value="365">Last Year</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        <Button 
          onClick={handleExport} 
          disabled={isExporting}
          className="w-full"
        >
          <Download className="h-4 w-4 mr-2" />
          {isExporting ? 'Exporting...' : `Export as ${exportFormat.toUpperCase()}`}
        </Button>
      </CardContent>
    </Card>
  );
};

export default PaymentHistoryExport;
