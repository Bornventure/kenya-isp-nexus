
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Download, FileText, FileSpreadsheet } from 'lucide-react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { useToast } from '@/hooks/use-toast';

interface InvoiceExportActionsProps {
  invoices: any[];
  selectedInvoices?: string[];
  className?: string;
}

const InvoiceExportActions: React.FC<InvoiceExportActionsProps> = ({
  invoices,
  selectedInvoices = [],
  className
}) => {
  const [isExporting, setIsExporting] = useState(false);
  const { toast } = useToast();

  const generateCSV = (data: any[]) => {
    const headers = [
      'Invoice Number',
      'Client Name',
      'Amount',
      'VAT Amount',
      'Total Amount',
      'Status',
      'Issue Date',
      'Due Date',
      'Service Period Start',
      'Service Period End'
    ];

    const csvContent = [
      headers.join(','),
      ...data.map(invoice => [
        invoice.invoice_number,
        invoice.clients?.name || 'N/A',
        invoice.amount,
        invoice.vat_amount,
        invoice.total_amount,
        invoice.status,
        new Date(invoice.created_at).toLocaleDateString(),
        new Date(invoice.due_date).toLocaleDateString(),
        new Date(invoice.service_period_start).toLocaleDateString(),
        new Date(invoice.service_period_end).toLocaleDateString()
      ].join(','))
    ].join('\n');

    return csvContent;
  };

  const downloadFile = (content: string, filename: string, type: string) => {
    const blob = new Blob([content], { type });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = filename;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  const handleExport = async (format: 'csv' | 'pdf') => {
    setIsExporting(true);
    
    try {
      const dataToExport = selectedInvoices.length > 0 
        ? invoices.filter(inv => selectedInvoices.includes(inv.id))
        : invoices;

      if (dataToExport.length === 0) {
        toast({
          title: "No Data",
          description: "No invoices to export.",
          variant: "destructive",
        });
        return;
      }

      const timestamp = new Date().toISOString().split('T')[0];
      
      if (format === 'csv') {
        const csvContent = generateCSV(dataToExport);
        downloadFile(csvContent, `invoices-${timestamp}.csv`, 'text/csv');
        
        toast({
          title: "Export Successful",
          description: `${dataToExport.length} invoices exported to CSV.`,
        });
      } else if (format === 'pdf') {
        // Simulate PDF generation
        await new Promise(resolve => setTimeout(resolve, 2000));
        
        toast({
          title: "PDF Export",
          description: "PDF export functionality will be available soon.",
        });
      }
    } catch (error) {
      console.error('Export error:', error);
      toast({
        title: "Export Failed",
        description: "Failed to export invoices. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsExporting(false);
    }
  };

  const handleDownloadInvoice = async (invoice: any) => {
    setIsExporting(true);
    
    try {
      // Generate invoice HTML content
      const invoiceHTML = `
        <!DOCTYPE html>
        <html>
        <head>
          <title>Invoice ${invoice.invoice_number}</title>
          <style>
            body { font-family: Arial, sans-serif; margin: 20px; }
            .header { text-align: center; border-bottom: 2px solid #333; padding-bottom: 20px; }
            .details { margin: 20px 0; }
            .amount { font-size: 24px; font-weight: bold; color: #2563eb; }
            .table { width: 100%; border-collapse: collapse; margin: 20px 0; }
            .table th, .table td { border: 1px solid #ddd; padding: 8px; text-align: left; }
            .table th { background-color: #f2f2f2; }
          </style>
        </head>
        <body>
          <div class="header">
            <h1>INVOICE</h1>
            <p>Invoice #: ${invoice.invoice_number}</p>
            <p>Date: ${new Date(invoice.created_at).toLocaleDateString()}</p>
          </div>
          
          <div class="details">
            <h3>Bill To:</h3>
            <p><strong>${invoice.clients?.name || 'N/A'}</strong></p>
            <p>Service Period: ${new Date(invoice.service_period_start).toLocaleDateString()} - ${new Date(invoice.service_period_end).toLocaleDateString()}</p>
          </div>
          
          <table class="table">
            <thead>
              <tr>
                <th>Description</th>
                <th>Amount</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td>Internet Service</td>
                <td>KES ${invoice.amount.toLocaleString()}</td>
              </tr>
              <tr>
                <td>VAT (16%)</td>
                <td>KES ${invoice.vat_amount.toLocaleString()}</td>
              </tr>
              <tr style="font-weight: bold;">
                <td>Total</td>
                <td>KES ${invoice.total_amount.toLocaleString()}</td>
              </tr>
            </tbody>
          </table>
          
          <div style="margin-top: 30px;">
            <p><strong>Status:</strong> ${invoice.status.toUpperCase()}</p>
            <p><strong>Due Date:</strong> ${new Date(invoice.due_date).toLocaleDateString()}</p>
          </div>
        </body>
        </html>
      `;

      downloadFile(invoiceHTML, `invoice-${invoice.invoice_number}.html`, 'text/html');
      
      toast({
        title: "Download Complete",
        description: `Invoice ${invoice.invoice_number} downloaded successfully.`,
      });
    } catch (error) {
      console.error('Download error:', error);
      toast({
        title: "Download Failed",
        description: "Failed to download invoice. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsExporting(false);
    }
  };

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="outline" size="sm" disabled={isExporting} className={className}>
          <Download className="h-4 w-4 mr-2" />
          {isExporting ? 'Exporting...' : 'Export'}
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent>
        <DropdownMenuItem onClick={() => handleExport('csv')}>
          <FileSpreadsheet className="h-4 w-4 mr-2" />
          Export as CSV
        </DropdownMenuItem>
        <DropdownMenuItem onClick={() => handleExport('pdf')}>
          <FileText className="h-4 w-4 mr-2" />
          Export as PDF
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
};

export { InvoiceExportActions, InvoiceExportActions as default };
