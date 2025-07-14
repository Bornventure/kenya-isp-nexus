
import React, { useState } from 'react';
import ClientInvoiceList from './ClientInvoiceList';
import ClientInvoiceViewer from './ClientInvoiceViewer';
import PackageRenewalForm from './PackageRenewalForm';

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

const InvoicesPage: React.FC = () => {
  const [selectedInvoice, setSelectedInvoice] = useState<ClientInvoice | null>(null);
  const [showInvoiceViewer, setShowInvoiceViewer] = useState(false);

  const handleViewInvoice = (invoice: ClientInvoice) => {
    setSelectedInvoice(invoice);
    setShowInvoiceViewer(true);
  };

  const handleCloseViewer = () => {
    setSelectedInvoice(null);
    setShowInvoiceViewer(false);
  };

  const handlePayment = (invoice: ClientInvoice) => {
    // You can implement payment logic here or redirect to payment page
    console.log('Payment for invoice:', invoice.invoice_number);
  };

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2">
          <ClientInvoiceList onViewInvoice={handleViewInvoice} />
        </div>
        <div>
          <PackageRenewalForm />
        </div>
      </div>

      <ClientInvoiceViewer
        invoice={selectedInvoice}
        open={showInvoiceViewer}
        onClose={handleCloseViewer}
        onPayment={handlePayment}
      />
    </div>
  );
};

export default InvoicesPage;
