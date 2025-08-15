
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Calendar } from '@/components/ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { useToast } from '@/hooks/use-toast';
import { 
  Download, 
  FileText, 
  Calendar as CalendarIcon, 
  TrendingUp,
  DollarSign,
  Users,
  CreditCard
} from 'lucide-react';
import { format } from 'date-fns';
import { cn } from '@/lib/utils';
import { useInvoices } from '@/hooks/useInvoices';
import { usePayments } from '@/hooks/usePayments';
import { formatKenyanCurrency } from '@/utils/kenyanValidation';

const ReportsTab: React.FC = () => {
  const { toast } = useToast();
  const { invoices } = useInvoices();
  const { payments } = usePayments();
  
  const [reportType, setReportType] = useState('summary');
  const [dateFrom, setDateFrom] = useState<Date>();
  const [dateTo, setDateTo] = useState<Date>();
  const [isGenerating, setIsGenerating] = useState(false);

  // Calculate summary statistics
  const totalRevenue = payments.reduce((sum, payment) => sum + payment.amount, 0);
  const pendingAmount = invoices.filter(inv => inv.status === 'pending')
                              .reduce((sum, inv) => sum + inv.total_amount, 0);
  const totalClients = new Set(invoices.map(inv => inv.client_id)).size;
  const thisMonthPayments = payments.filter(payment => 
    new Date(payment.payment_date).getMonth() === new Date().getMonth() &&
    new Date(payment.payment_date).getFullYear() === new Date().getFullYear()
  );

  const generateReport = async () => {
    if (!dateFrom || !dateTo) {
      toast({
        title: "Date Range Required",
        description: "Please select both start and end dates for the report.",
        variant: "destructive",
      });
      return;
    }

    if (dateFrom > dateTo) {
      toast({
        title: "Invalid Date Range",
        description: "Start date cannot be after end date.",
        variant: "destructive",
      });
      return;
    }

    setIsGenerating(true);

    try {
      // Filter data based on date range
      const filteredInvoices = invoices.filter(invoice => {
        const invoiceDate = new Date(invoice.created_at);
        return invoiceDate >= dateFrom && invoiceDate <= dateTo;
      });

      const filteredPayments = payments.filter(payment => {
        const paymentDate = new Date(payment.payment_date);
        return paymentDate >= dateFrom && paymentDate <= dateTo;
      });

      // Generate report data
      const reportData = {
        period: {
          from: format(dateFrom, 'yyyy-MM-dd'),
          to: format(dateTo, 'yyyy-MM-dd')
        },
        summary: {
          totalInvoices: filteredInvoices.length,
          totalPayments: filteredPayments.length,
          totalInvoiceAmount: filteredInvoices.reduce((sum, inv) => sum + inv.total_amount, 0),
          totalPaymentAmount: filteredPayments.reduce((sum, pay) => sum + pay.amount, 0),
          pendingInvoices: filteredInvoices.filter(inv => inv.status === 'pending').length,
          paidInvoices: filteredInvoices.filter(inv => inv.status === 'paid').length,
          overdueInvoices: filteredInvoices.filter(inv => inv.status === 'overdue').length
        },
        invoices: filteredInvoices,
        payments: filteredPayments
      };

      // Create CSV content based on report type
      let csvContent = '';
      let filename = '';

      switch (reportType) {
        case 'summary':
          csvContent = generateSummaryCSV(reportData);
          filename = `billing-summary-${format(dateFrom, 'yyyy-MM-dd')}-to-${format(dateTo, 'yyyy-MM-dd')}.csv`;
          break;
        case 'invoices':
          csvContent = generateInvoicesCSV(reportData.invoices);
          filename = `invoices-${format(dateFrom, 'yyyy-MM-dd')}-to-${format(dateTo, 'yyyy-MM-dd')}.csv`;
          break;
        case 'payments':
          csvContent = generatePaymentsCSV(reportData.payments);
          filename = `payments-${format(dateFrom, 'yyyy-MM-dd')}-to-${format(dateTo, 'yyyy-MM-dd')}.csv`;
          break;
        case 'detailed':
          csvContent = generateDetailedCSV(reportData);
          filename = `detailed-report-${format(dateFrom, 'yyyy-MM-dd')}-to-${format(dateTo, 'yyyy-MM-dd')}.csv`;
          break;
      }

      // Download the file
      const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
      const link = document.createElement('a');
      const url = URL.createObjectURL(blob);
      link.setAttribute('href', url);
      link.setAttribute('download', filename);
      link.style.visibility = 'hidden';
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);

      toast({
        title: "Report Generated",
        description: `${reportType} report has been downloaded successfully.`,
      });
    } catch (error) {
      console.error('Error generating report:', error);
      toast({
        title: "Error",
        description: "Failed to generate report. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsGenerating(false);
    }
  };

  const generateSummaryCSV = (data: any) => {
    return `Billing Summary Report
Period: ${data.period.from} to ${data.period.to}

Summary Statistics
Total Invoices,${data.summary.totalInvoices}
Total Payments,${data.summary.totalPayments}
Total Invoice Amount,${data.summary.totalInvoiceAmount}
Total Payment Amount,${data.summary.totalPaymentAmount}
Pending Invoices,${data.summary.pendingInvoices}
Paid Invoices,${data.summary.paidInvoices}
Overdue Invoices,${data.summary.overdueInvoices}
`;
  };

  const generateInvoicesCSV = (invoices: any[]) => {
    const header = 'Invoice Number,Client Name,Amount,VAT Amount,Total Amount,Status,Due Date,Created Date\n';
    const rows = invoices.map(inv => 
      `${inv.invoice_number},${inv.clients?.name || 'N/A'},${inv.amount},${inv.vat_amount},${inv.total_amount},${inv.status},${inv.due_date},${new Date(inv.created_at).toLocaleDateString()}`
    ).join('\n');
    return header + rows;
  };

  const generatePaymentsCSV = (payments: any[]) => {
    const header = 'Reference Number,Client Name,Amount,Payment Method,Payment Date\n';
    const rows = payments.map(pay => 
      `${pay.reference_number || pay.mpesa_receipt_number || 'N/A'},${pay.clients?.name || 'N/A'},${pay.amount},${pay.payment_method},${new Date(pay.payment_date).toLocaleDateString()}`
    ).join('\n');
    return header + rows;
  };

  const generateDetailedCSV = (data: any) => {
    let content = generateSummaryCSV(data);
    content += '\n\nInvoices Detail\n';
    content += generateInvoicesCSV(data.invoices);
    content += '\n\nPayments Detail\n';
    content += generatePaymentsCSV(data.payments);
    return content;
  };

  return (
    <div className="space-y-6">
      {/* Summary Cards */}
      <div className="grid gap-4 md:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Revenue</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{formatKenyanCurrency(totalRevenue)}</div>
            <p className="text-xs text-muted-foreground">
              From {payments.length} payments
            </p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Pending Amount</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{formatKenyanCurrency(pendingAmount)}</div>
            <p className="text-xs text-muted-foreground">
              Outstanding invoices
            </p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Active Clients</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totalClients}</div>
            <p className="text-xs text-muted-foreground">
              Invoiced clients
            </p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">This Month</CardTitle>
            <CreditCard className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {formatKenyanCurrency(thisMonthPayments.reduce((sum, pay) => sum + pay.amount, 0))}
            </div>
            <p className="text-xs text-muted-foreground">
              {thisMonthPayments.length} payments
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Report Generation */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <FileText className="h-5 w-5" />
            Generate Reports
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
            <div className="space-y-2">
              <Label htmlFor="report-type">Report Type</Label>
              <Select value={reportType} onValueChange={setReportType}>
                <SelectTrigger>
                  <SelectValue placeholder="Select report type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="summary">Summary Report</SelectItem>
                  <SelectItem value="invoices">Invoices Report</SelectItem>
                  <SelectItem value="payments">Payments Report</SelectItem>
                  <SelectItem value="detailed">Detailed Report</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label>From Date</Label>
              <Popover>
                <PopoverTrigger asChild>
                  <Button
                    variant="outline"
                    className={cn(
                      "w-full justify-start text-left font-normal",
                      !dateFrom && "text-muted-foreground"
                    )}
                  >
                    <CalendarIcon className="mr-2 h-4 w-4" />
                    {dateFrom ? format(dateFrom, "PPP") : <span>Pick a date</span>}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0">
                  <Calendar
                    mode="single"
                    selected={dateFrom}
                    onSelect={setDateFrom}
                    initialFocus
                  />
                </PopoverContent>
              </Popover>
            </div>

            <div className="space-y-2">
              <Label>To Date</Label>
              <Popover>
                <PopoverTrigger asChild>
                  <Button
                    variant="outline"
                    className={cn(
                      "w-full justify-start text-left font-normal",
                      !dateTo && "text-muted-foreground"
                    )}
                  >
                    <CalendarIcon className="mr-2 h-4 w-4" />
                    {dateTo ? format(dateTo, "PPP") : <span>Pick a date</span>}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0">
                  <Calendar
                    mode="single"
                    selected={dateTo}
                    onSelect={setDateTo}
                    initialFocus
                  />
                </PopoverContent>
              </Popover>
            </div>

            <div className="space-y-2">
              <Label>&nbsp;</Label>
              <Button 
                onClick={generateReport} 
                disabled={isGenerating}
                className="w-full"
              >
                <Download className="mr-2 h-4 w-4" />
                {isGenerating ? 'Generating...' : 'Generate Report'}
              </Button>
            </div>
          </div>

          <div className="text-sm text-muted-foreground">
            <p>• Summary Report: Overview of billing statistics for the selected period</p>
            <p>• Invoices Report: Detailed list of all invoices in the date range</p>
            <p>• Payments Report: Detailed list of all payments in the date range</p>
            <p>• Detailed Report: Combined report with all data and statistics</p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default ReportsTab;
