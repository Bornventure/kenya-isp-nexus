
import React from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Card } from '@/components/ui/card';
import InvoiceList from '@/components/billing/InvoiceList';
import PaymentTracker from '@/components/billing/PaymentTracker';
import FinancialManagement from '@/components/billing/FinancialManagement';

const Billing = () => {
  return (
    <div className="container mx-auto p-6">
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Billing & Financial Management</h1>
          <p className="text-muted-foreground">
            Manage invoices, payments, financial reports, and billing configurations.
          </p>
        </div>

        <Tabs defaultValue="invoices" className="space-y-4">
          <TabsList>
            <TabsTrigger value="invoices">Invoices</TabsTrigger>
            <TabsTrigger value="payments">Payments</TabsTrigger>
            <TabsTrigger value="financial">Financial Management</TabsTrigger>
          </TabsList>

          <TabsContent value="invoices" className="space-y-4">
            <InvoiceList />
          </TabsContent>

          <TabsContent value="payments" className="space-y-4">
            <Card className="p-6">
              <PaymentTracker />
            </Card>
          </TabsContent>

          <TabsContent value="financial" className="space-y-4">
            <FinancialManagement />
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};

export default Billing;
