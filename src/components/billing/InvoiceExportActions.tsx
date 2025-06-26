
import React from 'react';
import { Button } from '@/components/ui/button';
import { Download, FileSpreadsheet, Mail } from 'lucide-react';
import { Invoice } from '@/hooks/useInvoices';
import { useToast } from '@/hooks/use-toast';
import { formatKenyanCurrency } from '@/utils/kenyanValidation';

interface InvoiceExportActionsProps {
  invoices: Invoice[];
  selectedInvoices: string[];
}

const InvoiceExportActions: React.FC<InvoiceExportActionsProps> = ({
  invoices,
  selectedInvoices,
}) => {
  const { toast } = useToast();

  const exportToCSV = () => {
    const dataToExport = selectedInvoices.length > 0 
      ? invoices.filter(inv => selectedInvoices.includes(inv.id))
      : invoices;

    const csvHeaders = [
      'Invoice Number',
      'Client Name',
      'Amount',
      'VAT Amount',
      'Total Amount',
      'Status',
      'Issue Date',
      'Due Date',
      'Service Period Start',
      'Service Period End',
      'Notes'
    ];

    const csvData = dataToExport.map(invoice => [
      invoice.invoice_number,
      invoice.clients?.name || 'N/A',
      invoice.amount.toString(),
      invoice.vat_amount.toString(),
      invoice.total_amount.toString(),
      invoice.status,
      new Date(invoice.created_at).toLocaleDateString(),
      new Date(invoice.due_date).toLocaleDateString(),
      new Date(invoice.service_period_start).toLocaleDateString(),
      new Date(invoice.service_period_end).toLocaleDateString(),
      invoice.notes || ''
    ]);

    const csvContent = [csvHeaders, ...csvData]
      .map(row => row.map(cell => `"${cell}"`).join(','))
      .join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);
    link.setAttribute('href', url);
    link.setAttribute('download', `invoices-${new Date().toISOString().split('T')[0]}.csv`);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);

    toast({
      title: "Export Complete",
      description: `Exported ${dataToExport.length} invoices to CSV.`,
    });
  };

  const exportSummaryReport = () => {
    const dataToExport = selectedInvoices.length > 0 
      ? invoices.filter(inv => selectedInvoices.includes(inv.id))
      : invoices;

    const totalAmount = dataToExport.reduce((sum, inv) => sum + inv.total_amount, 0);
    const paidAmount = dataToExport.filter(inv => inv.status === 'paid').reduce((sum, inv) => sum + inv.total_amount, 0);
    const pendingAmount = dataToExport.filter(inv => inv.status === 'pending').reduce((sum, inv) => sum + inv.total_amount, 0);
    const overdueAmount = dataToExport.filter(inv => inv.status === 'overdue').reduce((sum, inv) => sum + inv.total_amount, 0);

    const summaryData = [
      ['Invoice Summary Report'],
      ['Generated on:', new Date().toLocaleDateString()],
      [''],
      ['Total Invoices:', dataToExport.length.toString()],
      ['Total Amount:', formatKenyanCurrency(totalAmount)],
      ['Paid Amount:', formatKenyanCurrency(paidAmount)],
      ['Pending Amount:', formatKenyanCurrency(pendingAmount)],
      ['Overdue Amount:', formatKenyanCurrency(overdueAmount)],
      [''],
      ['Status Breakdown:'],
      ['Paid:', dataToExport.filter(inv => inv.status === 'paid').length.toString()],
      ['Pending:', dataToExport.filter(inv => inv.status === 'pending').length.toString()],
      ['Overdue:', dataToExport.filter(inv => inv.status === 'overdue').length.toString()],
      ['Draft:', dataToExport.filter(inv => inv.status === 'draft').length.toString()],
    ];

    const csvContent = summaryData.map(row => row.join(',')).join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);
    link.setAttribute('href', url);
    link.setAttribute('download', `invoice-summary-${new Date().toISOString().split('T')[0]}.csv`);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);

    toast({
      title: "Summary Export Complete",
      description: "Invoice summary report has been exported.",
    });
  };

  return (
    <div className="flex items-center gap-2">
      <Button variant="outline" size="sm" onClick={exportToCSV}>
        <FileSpreadsheet className="h-4 w-4 mr-2" />
        Export CSV
      </Button>
      <Button variant="outline" size="sm" onClick={exportSummaryReport}>
        <Download className="h-4 w-4 mr-2" />
        Summary Report
      </Button>
    </div>
  );
};

export default InvoiceExportActions;
