
import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { 
  DollarSign, 
  Receipt, 
  FileText, 
  TrendingUp, 
  AlertCircle,
  Download,
  Plus
} from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

const FinancialManagement = () => {
  const { toast } = useToast();
  const [taxSettings, setTaxSettings] = useState({
    vatRate: 16,
    vatEnabled: true,
    taxExemptCategories: ['education', 'nonprofit'],
    withholdingTaxRate: 5
  });

  const [paymentGateways, setPaymentGateways] = useState([
    { id: 'mpesa', name: 'M-Pesa', enabled: true, fees: 2.5 },
    { id: 'paypal', name: 'PayPal', enabled: false, fees: 3.4 },
    { id: 'stripe', name: 'Stripe', enabled: false, fees: 2.9 },
    { id: 'bank', name: 'Bank Transfer', enabled: true, fees: 0 }
  ]);

  // Mock financial data
  const financialSummary = {
    totalRevenue: 245000,
    monthlyRecurring: 180000,
    outstandingInvoices: 45000,
    overdueAmount: 12000,
    creditNotes: 3000,
    collections: 95.5
  };

  const creditNotes = [
    {
      id: 'CN-2024-001',
      clientName: 'Tech Solutions Ltd',
      amount: 1500,
      reason: 'Service downtime compensation',
      status: 'issued',
      date: '2024-06-20'
    },
    {
      id: 'CN-2024-002',
      clientName: 'Digital Marketing Co',
      amount: 800,
      reason: 'Billing adjustment',
      status: 'pending',
      date: '2024-06-18'
    }
  ];

  const handleIssueCreditNote = () => {
    toast({
      title: "Credit Note Issued",
      description: "Credit note has been successfully issued to the client.",
    });
  };

  const handleGenerateReport = (reportType: string) => {
    toast({
      title: "Report Generated",
      description: `${reportType} report is being generated and will be available for download shortly.`,
    });
  };

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold tracking-tight">Financial Management</h2>
        <p className="text-muted-foreground">
          Manage billing, payments, taxes, and financial reporting.
        </p>
      </div>

      <Tabs defaultValue="overview" className="space-y-4">
        <TabsList>
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="tax">Tax Configuration</TabsTrigger>
          <TabsTrigger value="payments">Payment Gateways</TabsTrigger>
          <TabsTrigger value="credits">Credit Notes</TabsTrigger>
          <TabsTrigger value="reports">Financial Reports</TabsTrigger>
        </TabsList>

        <TabsContent value="overview">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Total Revenue</CardTitle>
                <DollarSign className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">KES {financialSummary.totalRevenue.toLocaleString()}</div>
                <p className="text-xs text-muted-foreground">+20.1% from last month</p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Monthly Recurring Revenue</CardTitle>
                <TrendingUp className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">KES {financialSummary.monthlyRecurring.toLocaleString()}</div>
                <p className="text-xs text-muted-foreground">+12% from last month</p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Outstanding Invoices</CardTitle>
                <Receipt className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">KES {financialSummary.outstandingInvoices.toLocaleString()}</div>
                <p className="text-xs text-muted-foreground">23 pending invoices</p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Overdue Amount</CardTitle>
                <AlertCircle className="h-4 w-4 text-red-500" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-red-600">KES {financialSummary.overdueAmount.toLocaleString()}</div>
                <p className="text-xs text-muted-foreground">5 overdue invoices</p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Credit Notes</CardTitle>
                <FileText className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">KES {financialSummary.creditNotes.toLocaleString()}</div>
                <p className="text-xs text-muted-foreground">2 issued this month</p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Collection Rate</CardTitle>
                <TrendingUp className="h-4 w-4 text-green-500" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-green-600">{financialSummary.collections}%</div>
                <p className="text-xs text-muted-foreground">+2.5% from last month</p>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="tax">
          <Card>
            <CardHeader>
              <CardTitle>Tax Configuration</CardTitle>
              <CardDescription>
                Configure VAT rates, tax exemptions, and other tax-related settings.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="flex items-center justify-between">
                <div>
                  <Label htmlFor="vatEnabled">Enable VAT</Label>
                  <p className="text-sm text-muted-foreground">Apply VAT to invoices</p>
                </div>
                <Switch
                  id="vatEnabled"
                  checked={taxSettings.vatEnabled}
                  onCheckedChange={(checked) => setTaxSettings({
                    ...taxSettings,
                    vatEnabled: checked
                  })}
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="vatRate">VAT Rate (%)</Label>
                  <Input
                    id="vatRate"
                    type="number"
                    value={taxSettings.vatRate}
                    onChange={(e) => setTaxSettings({
                      ...taxSettings,
                      vatRate: parseFloat(e.target.value)
                    })}
                  />
                </div>
                
                <div>
                  <Label htmlFor="withholdingTax">Withholding Tax Rate (%)</Label>
                  <Input
                    id="withholdingTax"
                    type="number"
                    value={taxSettings.withholdingTaxRate}
                    onChange={(e) => setTaxSettings({
                      ...taxSettings,
                      withholdingTaxRate: parseFloat(e.target.value)
                    })}
                  />
                </div>
              </div>

              <div>
                <Label>Tax Exempt Categories</Label>
                <div className="mt-2 space-y-2">
                  {['education', 'nonprofit', 'government', 'healthcare'].map((category) => (
                    <div key={category} className="flex items-center space-x-2">
                      <input
                        type="checkbox"
                        id={category}
                        checked={taxSettings.taxExemptCategories.includes(category)}
                        onChange={(e) => {
                          if (e.target.checked) {
                            setTaxSettings({
                              ...taxSettings,
                              taxExemptCategories: [...taxSettings.taxExemptCategories, category]
                            });
                          } else {
                            setTaxSettings({
                              ...taxSettings,
                              taxExemptCategories: taxSettings.taxExemptCategories.filter(c => c !== category)
                            });
                          }
                        }}
                        className="rounded border-gray-300"
                      />
                      <label htmlFor={category} className="text-sm capitalize">
                        {category}
                      </label>
                    </div>
                  ))}
                </div>
              </div>

              <Button>Save Tax Settings</Button>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="payments">
          <Card>
            <CardHeader>
              <CardTitle>Payment Gateway Configuration</CardTitle>
              <CardDescription>
                Configure and manage multiple payment providers.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {paymentGateways.map((gateway) => (
                  <div key={gateway.id} className="flex items-center justify-between p-4 border rounded-lg">
                    <div className="flex items-center gap-3">
                      <Switch
                        checked={gateway.enabled}
                        onCheckedChange={(checked) => {
                          setPaymentGateways(gateways =>
                            gateways.map(g =>
                              g.id === gateway.id ? { ...g, enabled: checked } : g
                            )
                          );
                        }}
                      />
                      <div>
                        <h4 className="font-medium">{gateway.name}</h4>
                        <p className="text-sm text-muted-foreground">
                          Processing fee: {gateway.fees}%
                        </p>
                      </div>
                    </div>
                    <Button variant="outline" size="sm">
                      Configure
                    </Button>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="credits">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <div>
                <CardTitle>Credit Notes</CardTitle>
                <CardDescription>
                  Issue and manage credit notes for refunds and adjustments.
                </CardDescription>
              </div>
              <Button onClick={handleIssueCreditNote}>
                <Plus className="h-4 w-4 mr-2" />
                Issue Credit Note
              </Button>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {creditNotes.map((note) => (
                  <div key={note.id} className="flex items-center justify-between p-4 border rounded-lg">
                    <div>
                      <h4 className="font-medium">{note.id}</h4>
                      <p className="text-sm text-muted-foreground">
                        {note.clientName} • {note.reason}
                      </p>
                      <p className="text-sm text-muted-foreground">{note.date}</p>
                    </div>
                    <div className="text-right">
                      <div className="font-medium">KES {note.amount.toLocaleString()}</div>
                      <Badge 
                        variant="outline"
                        className={note.status === 'issued' ? 'border-green-500 text-green-500' : 'border-yellow-500 text-yellow-500'}
                      >
                        {note.status}
                      </Badge>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="reports">
          <Card>
            <CardHeader>
              <CardTitle>Financial Reports</CardTitle>
              <CardDescription>
                Generate comprehensive financial reports and analytics.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <Button
                  variant="outline"
                  className="h-24 flex flex-col items-center justify-center"
                  onClick={() => handleGenerateReport('Profit & Loss')}
                >
                  <FileText className="h-6 w-6 mb-2" />
                  <span>Profit & Loss Statement</span>
                </Button>
                
                <Button
                  variant="outline"
                  className="h-24 flex flex-col items-center justify-center"
                  onClick={() => handleGenerateReport('Aging Report')}
                >
                  <Receipt className="h-6 w-6 mb-2" />
                  <span>Accounts Receivable Aging</span>
                </Button>
                
                <Button
                  variant="outline"
                  className="h-24 flex flex-col items-center justify-center"
                  onClick={() => handleGenerateReport('Revenue Analytics')}
                >
                  <TrendingUp className="h-6 w-6 mb-2" />
                  <span>Revenue Analytics</span>
                </Button>
                
                <Button
                  variant="outline"
                  className="h-24 flex flex-col items-center justify-center"
                  onClick={() => handleGenerateReport('Tax Report')}
                >
                  <Download className="h-6 w-6 mb-2" />
                  <span>Tax Report</span>
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default FinancialManagement;
