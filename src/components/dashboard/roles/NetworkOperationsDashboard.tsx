
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import MetricCard from '@/components/dashboard/MetricCard';
import { Network, Shield, CheckCircle, Clock, Users, Settings } from 'lucide-react';
import { useClients } from '@/hooks/useClients';
import { useInstallationInvoices } from '@/hooks/useInstallationInvoices';
import NOCClientApprovalDialog from '@/components/onboarding/NOCClientApprovalDialog';
import InstallationInvoiceViewer from '@/components/onboarding/InstallationInvoiceViewer';

const NetworkOperationsDashboard = () => {
  const { clients, isLoading: clientsLoading } = useClients();
  const { invoices, isLoading: invoicesLoading } = useInstallationInvoices();
  const [selectedClient, setSelectedClient] = useState<any>(null);
  const [selectedInvoice, setSelectedInvoice] = useState<any>(null);

  const pendingClients = clients.filter(client => client.status === 'pending');
  const approvedClients = clients.filter(client => client.status === 'approved');
  const activeClients = clients.filter(client => client.status === 'active');
  const pendingInvoices = invoices.filter(invoice => invoice.status === 'pending');

  const handleClientApproval = () => {
    setSelectedClient(null);
    // This will trigger a refetch of clients
    window.location.reload();
  };

  const maskPhoneNumber = (phone: string) => {
    if (!phone) return '';
    const cleaned = phone.replace(/\D/g, '');
    if (cleaned.length >= 10) {
      return cleaned.substring(0, 3) + 'xxx' + cleaned.substring(6);
    }
    return phone;
  };

  if (clientsLoading || invoicesLoading) {
    return (
      <div className="flex items-center justify-center h-48">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold">Network Operations Center</h1>
        <Button variant="outline" className="gap-2">
          <Settings className="h-4 w-4" />
          Network Settings
        </Button>
      </div>

      {/* Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <MetricCard
          title="Pending Approvals"
          value={pendingClients.length}
          icon={Clock}
        />
        <MetricCard
          title="Approved Clients"
          value={approvedClients.length}
          icon={CheckCircle}
        />
        <MetricCard
          title="Active Clients"
          value={activeClients.length}
          icon={Users}
        />
        <MetricCard
          title="Pending Invoices"
          value={pendingInvoices.length}
          icon={Shield}
        />
      </div>

      {/* Pending Client Approvals */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Clock className="h-5 w-5" />
            Pending Client Approvals ({pendingClients.length})
          </CardTitle>
        </CardHeader>
        <CardContent>
          {pendingClients.length === 0 ? (
            <p className="text-center text-gray-500 py-8">No pending client approvals</p>
          ) : (
            <div className="space-y-4">
              {pendingClients.map((client) => (
                <div key={client.id} className="flex items-center justify-between p-4 border rounded-lg">
                  <div className="flex-1">
                    <h3 className="font-semibold">{client.name}</h3>
                    <p className="text-sm text-gray-600">{client.email}</p>
                    <p className="text-sm text-gray-500">
                      Phone: {maskPhoneNumber(client.phone)} • {client.county}
                    </p>
                    <p className="text-xs text-gray-400">
                      Submitted: {new Date(client.created_at).toLocaleDateString()}
                    </p>
                  </div>
                  <div className="flex items-center gap-3">
                    <div className="text-right">
                      <p className="text-sm font-medium">
                        KES {client.monthly_rate.toLocaleString()}/month
                      </p>
                      <p className="text-xs text-gray-500">
                        {client.service_packages?.name}
                      </p>
                    </div>
                    <Badge variant="outline">
                      {client.status}
                    </Badge>
                    <Button
                      onClick={() => setSelectedClient(client)}
                      size="sm"
                      className="gap-2"
                    >
                      <CheckCircle className="h-4 w-4" />
                      Review & Approve
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Installation Invoices */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Shield className="h-5 w-5" />
            Installation Invoices ({invoices.length})
          </CardTitle>
        </CardHeader>
        <CardContent>
          {invoices.length === 0 ? (
            <p className="text-center text-gray-500 py-8">No installation invoices generated</p>
          ) : (
            <div className="space-y-4">
              {invoices.slice(0, 10).map((invoice) => (
                <div key={invoice.id} className="flex items-center justify-between p-4 border rounded-lg">
                  <div className="flex-1">
                    <h3 className="font-semibold">{invoice.clients?.name}</h3>
                    <p className="text-sm text-gray-600">Invoice #{invoice.invoice_number}</p>
                    <p className="text-sm text-gray-500">
                      Phone: {maskPhoneNumber(invoice.clients?.phone || '')}
                    </p>
                    <p className="text-xs text-gray-400">
                      Created: {new Date(invoice.created_at).toLocaleDateString()}
                    </p>
                  </div>
                  <div className="flex items-center gap-3">
                    <div className="text-right">
                      <p className="text-sm font-medium">
                        KES {invoice.total_amount.toLocaleString()}
                      </p>
                      <p className="text-xs text-gray-500">
                        Installation Fee
                      </p>
                    </div>
                    <Badge variant={invoice.status === 'paid' ? 'default' : 'destructive'}>
                      {invoice.status === 'paid' ? 'PAID' : 'NOT PAID'}
                    </Badge>
                    <Button
                      onClick={() => setSelectedInvoice(invoice)}
                      size="sm"
                      variant="outline"
                    >
                      View Invoice
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Client Approval Dialog */}
      {selectedClient && (
        <NOCClientApprovalDialog
          client={selectedClient}
          open={!!selectedClient}
          onClose={() => setSelectedClient(null)}
          onApprove={handleClientApproval}
        />
      )}

      {/* Invoice Viewer Dialog */}
      {selectedInvoice && (
        <InstallationInvoiceViewer
          invoice={selectedInvoice}
          open={!!selectedInvoice}
          onClose={() => setSelectedInvoice(null)}
        />
      )}
    </div>
  );
};

export default NetworkOperationsDashboard;
