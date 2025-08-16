
import React, { useState } from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import InstallationInvoiceManager from '@/components/invoices/InstallationInvoiceManager';
import PaymentMonitor from '@/components/payments/PaymentMonitor';
import InvoiceList from '@/components/billing/InvoiceList';
import { Receipt, CreditCard, FileText } from 'lucide-react';

const InvoicesPage: React.FC = () => {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Invoice Management</h1>
        <p className="text-gray-600">Manage invoices, track payments, and monitor service activation</p>
      </div>

      <Tabs defaultValue="installation" className="space-y-6">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="installation" className="flex items-center gap-2">
            <Receipt className="h-4 w-4" />
            Installation Invoices
          </TabsTrigger>
          <TabsTrigger value="payment-monitor" className="flex items-center gap-2">
            <CreditCard className="h-4 w-4" />
            Payment Monitor
          </TabsTrigger>
          <TabsTrigger value="regular" className="flex items-center gap-2">
            <FileText className="h-4 w-4" />
            Regular Invoices
          </TabsTrigger>
        </TabsList>

        <TabsContent value="installation">
          <InstallationInvoiceManager />
        </TabsContent>

        <TabsContent value="payment-monitor">
          <PaymentMonitor />
        </TabsContent>

        <TabsContent value="regular">
          <InvoiceList />
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default InvoicesPage;
