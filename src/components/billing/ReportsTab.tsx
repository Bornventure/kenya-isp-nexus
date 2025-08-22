
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { 
  Download, 
  TrendingUp, 
  Calendar,
  DollarSign,
  FileText,
  BarChart3
} from 'lucide-react';
import { formatKenyanCurrency } from '@/utils/kenyanValidation';
import { useToast } from '@/hooks/use-toast';
import type { Invoice } from '@/hooks/useInvoices';
import type { Payment } from '@/hooks/usePayments';

interface ReportsTabProps {
  invoices: Invoice[];
  payments: Payment[];
}

const ReportsTab: React.FC<ReportsTabProps> = ({ invoices, payments }) => {
  const { toast } = useToast();
  const [selectedPeriod, setSelectedPeriod] = useState('thisMonth');

  // Calculate current period data
  const now = new Date();
  const currentMonth = now.getMonth();
  const currentYear = now.getFullYear();

  const thisMonthInvoices = invoices.filter(inv => {
    const invoiceDate = new Date(inv.created_at);
    return invoiceDate.getMonth() === currentMonth && invoiceDate.getFullYear() === currentYear;
  });

  const thisMonthPayments = payments.filter(payment => {
    const paymentDate = new Date(payment.payment_date);
    return paymentDate.getMonth() === currentMonth && paymentDate.getFullYear() === currentYear;
  });

  // Calculate metrics
  const metrics = {
    totalInvoices: invoices.length,
    totalRevenue: invoices.filter(i => i.status === 'paid').reduce((sum, i) => sum + i.total_amount, 0),
    monthlyInvoices: thisMonthInvoices.length,
    monthlyRevenue: thisMonthPayments.reduce((sum, p) => sum + p.amount, 0),
    pendingAmount: invoices.filter(i => i.status === 'pending').reduce((sum, i) => sum + i.total_amount, 0),
    overdueAmount: invoices.filter(i => i.status === 'overdue').reduce((sum, i) => sum + i.total_amount, 0),
    collectionRate: invoices.length > 0 ? (invoices.filter(i => i.status === 'paid').length / invoices.length) * 100 : 0,
  };

  // Revenue by month calculation
  const monthlyRevenue = Array.from({ length: 12 }, (_, i) => {
    const monthPayments = payments.filter(payment => {
      const paymentDate = new Date(payment.payment_date);
      return paymentDate.getMonth() === i && paymentDate.getFullYear() === currentYear;
    });
    return {
      month: new Date(currentYear, i, 1).toLocaleDateString('en-US', { month: 'short' }),
      revenue: monthPayments.reduce((sum, p) => sum + p.amount, 0)
    };
  });

  const handleExportReport = (reportType: string) => {
    try {
      let csvData: any[] = [];
      let filename = '';

      switch (reportType) {
        case 'revenue':
          csvData = monthlyRevenue.map(item => [item.month, item.revenue]);
          csvData.unshift(['Month', 'Revenue']);
          filename = `revenue-report-${currentYear}.csv`;
          break;
        case 'invoices':
          csvData = invoices.map(inv => [
            inv.invoice_number,
            inv.clients?.name || 'N/A',
            inv.total_amount,
            inv.status,
            new Date(inv.created_at).toLocaleDateString()
          ]);
          csvData.unshift(['Invoice Number', 'Client', 'Amount', 'Status', 'Date']);
          filename = `invoices-report-${new Date().toISOString().split('T')[0]}.csv`;
          break;
        case 'payments':
          csvData = payments.map(payment => [
            payment.clients?.name || 'N/A',
            payment.amount,
            payment.payment_method,
            payment.reference_number || '',
            new Date(payment.payment_date).toLocaleDateString()
          ]);
          csvData.unshift(['Client', 'Amount', 'Method', 'Reference', 'Date']);
          filename = `payments-report-${new Date().toISOString().split('T')[0]}.csv`;
          break;
        default:
          throw new Error('Unknown report type');
      }

      const csvContent = csvData.map(row => row.map(cell => `"${cell}"`).join(',')).join('\n');
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
        title: "Report Exported",
        description: `${reportType} report exported successfully`,
      });
    } catch (error) {
      toast({
        title: "Export Failed",
        description: "Failed to export report. Please try again.",
        variant: "destructive",
      });
    }
  };

  return (
    <div className="space-y-6">
      {/* Overview Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Revenue</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{formatKenyanCurrency(metrics.totalRevenue)}</div>
            <p className="text-xs text-muted-foreground">
              From {metrics.totalInvoices} invoices
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">This Month</CardTitle>
            <Calendar className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{formatKenyanCurrency(metrics.monthlyRevenue)}</div>
            <p className="text-xs text-muted-foreground">
              {metrics.monthlyInvoices} invoices this month
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Outstanding</CardTitle>
            <FileText className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{formatKenyanCurrency(metrics.pendingAmount + metrics.overdueAmount)}</div>
            <p className="text-xs text-muted-foreground">
              Pending + Overdue amounts
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Collection Rate</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{metrics.collectionRate.toFixed(1)}%</div>
            <p className="text-xs text-muted-foreground">
              Invoices paid on time
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Revenue Chart Data */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle>Monthly Revenue Trend</CardTitle>
            <Button variant="outline" size="sm" onClick={() => handleExportReport('revenue')}>
              <Download className="h-4 w-4 mr-2" />
              Export
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
            {monthlyRevenue.map((item, index) => (
              <div key={index} className="flex items-center justify-between py-2 border-b last:border-b-0">
                <span className="font-medium">{item.month} {currentYear}</span>
                <span className="text-lg font-bold">{formatKenyanCurrency(item.revenue)}</span>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Quick Reports */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Invoice Report</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground mb-4">
              Complete list of all invoices with status and amounts
            </p>
            <Button onClick={() => handleExportReport('invoices')} className="w-full">
              <Download className="h-4 w-4 mr-2" />
              Export Invoices
            </Button>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Payment Report</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground mb-4">
              All received payments with methods and references
            </p>
            <Button onClick={() => handleExportReport('payments')} className="w-full">
              <Download className="h-4 w-4 mr-2" />
              Export Payments
            </Button>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Revenue Report</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground mb-4">
              Monthly revenue breakdown for the current year
            </p>
            <Button onClick={() => handleExportReport('revenue')} className="w-full">
              <Download className="h-4 w-4 mr-2" />
              Export Revenue
            </Button>
          </CardContent>
        </Card>
      </div>

      {/* Status Breakdown */}
      <Card>
        <CardHeader>
          <CardTitle>Invoice Status Breakdown</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {['paid', 'pending', 'overdue', 'draft'].map(status => {
              const count = invoices.filter(inv => inv.status === status).length;
              const percentage = invoices.length > 0 ? (count / invoices.length) * 100 : 0;
              
              return (
                <div key={status} className="text-center">
                  <div className="text-2xl font-bold">{count}</div>
                  <Badge variant="outline" className="mb-1">
                    {status.toUpperCase()}
                  </Badge>
                  <div className="text-xs text-muted-foreground">
                    {percentage.toFixed(1)}% of total
                  </div>
                </div>
              );
            })}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default ReportsTab;
