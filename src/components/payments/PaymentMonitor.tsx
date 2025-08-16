
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { usePayments } from '@/hooks/usePayments';
import { useClients } from '@/hooks/useClients';
import { useToast } from '@/hooks/use-toast';
import { CheckCircle, Clock, AlertCircle, Play, Pause, Settings } from 'lucide-react';
import { formatKenyanCurrency } from '@/utils/currencyFormat';

interface PaymentMonitorProps {
  clientId?: string;
  invoiceId?: string;
}

const PaymentMonitor: React.FC<PaymentMonitorProps> = ({ clientId, invoiceId }) => {
  const { payments, isLoading } = usePayments();
  const { clients } = useClients();
  const { toast } = useToast();
  const [monitoringActive, setMonitoringActive] = useState(true);
  const [selectedPayment, setSelectedPayment] = useState<any>(null);
  const [showServiceDialog, setShowServiceDialog] = useState(false);

  // Filter payments based on props
  const filteredPayments = payments.filter(payment => {
    if (clientId && payment.client_id !== clientId) return false;
    if (invoiceId && payment.invoice_id !== invoiceId) return false;
    return true;
  });

  // Monitor for new payments and trigger service activation
  useEffect(() => {
    if (!monitoringActive) return;

    const interval = setInterval(() => {
      // Check for recent payments that might trigger service activation
      const recentPayments = filteredPayments.filter(payment => {
        const paymentTime = new Date(payment.payment_date).getTime();
        const now = Date.now();
        return now - paymentTime < 60000; // Last minute
      });

      recentPayments.forEach(payment => {
        if (payment.amount >= getInstallationFee()) {
          handleServiceActivation(payment);
        }
      });
    }, 30000); // Check every 30 seconds

    return () => clearInterval(interval);
  }, [filteredPayments, monitoringActive]);

  const getInstallationFee = () => {
    // This would come from system settings
    return 5000; // Default installation fee
  };

  const handleServiceActivation = async (payment: any) => {
    try {
      console.log('Triggering service activation for payment:', payment.id);
      
      // Here you would:
      // 1. Update client status to 'active'
      // 2. Trigger RADIUS/Mikrotik integration
      // 3. Send activation SMS
      // 4. Update workflow status

      setSelectedPayment(payment);
      setShowServiceDialog(true);

      toast({
        title: "Service Activation Triggered",
        description: `Payment received for ${payment.clients?.name}. Service activation in progress.`,
      });
    } catch (error) {
      console.error('Service activation error:', error);
      toast({
        title: "Activation Error",
        description: "Failed to activate service automatically. Manual intervention required.",
        variant: "destructive",
      });
    }
  };

  const confirmServiceActivation = async () => {
    if (!selectedPayment) return;

    try {
      // Simulate service activation
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      toast({
        title: "Service Activated",
        description: `Service has been activated for ${selectedPayment.clients?.name}`,
      });

      setShowServiceDialog(false);
      setSelectedPayment(null);
    } catch (error) {
      toast({
        title: "Activation Failed",
        description: "Failed to activate service. Please try again.",
        variant: "destructive",
      });
    }
  };

  const getPaymentStatusColor = (payment: any) => {
    const amount = payment.amount;
    const installationFee = getInstallationFee();
    
    if (amount >= installationFee) {
      return 'bg-green-100 text-green-800';
    } else if (amount >= installationFee * 0.5) {
      return 'bg-yellow-100 text-yellow-800';
    } else {
      return 'bg-red-100 text-red-800';
    }
  };

  const getPaymentStatus = (payment: any) => {
    const amount = payment.amount;
    const installationFee = getInstallationFee();
    
    if (amount >= installationFee) {
      return 'Complete';
    } else if (amount >= installationFee * 0.5) {
      return 'Partial';
    } else {
      return 'Insufficient';
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center p-8">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-semibold">Payment Monitor</h2>
          <p className="text-gray-600">Real-time payment tracking and service activation</p>
        </div>
        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => setMonitoringActive(!monitoringActive)}
          >
            {monitoringActive ? (
              <>
                <Pause className="h-4 w-4 mr-1" />
                Pause
              </>
            ) : (
              <>
                <Play className="h-4 w-4 mr-1" />
                Resume
              </>
            )}
          </Button>
          <Badge variant={monitoringActive ? "default" : "secondary"}>
            {monitoringActive ? "Active" : "Paused"}
          </Badge>
        </div>
      </div>

      <div className="grid gap-4">
        {filteredPayments.length === 0 ? (
          <Card>
            <CardContent className="flex items-center justify-center p-8">
              <div className="text-center">
                <Clock className="h-8 w-8 text-gray-400 mx-auto mb-2" />
                <p className="text-gray-600">No payments to monitor</p>
              </div>
            </CardContent>
          </Card>
        ) : (
          filteredPayments.map((payment) => (
            <Card key={payment.id}>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle className="flex items-center gap-2">
                      <CheckCircle className="h-5 w-5 text-green-600" />
                      Payment from {payment.clients?.name}
                    </CardTitle>
                    <p className="text-sm text-gray-600">
                      {new Date(payment.payment_date).toLocaleString()}
                    </p>
                  </div>
                  <Badge className={getPaymentStatusColor(payment)}>
                    {getPaymentStatus(payment)}
                  </Badge>
                </div>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                  <div>
                    <p className="text-sm font-medium text-gray-600">Amount</p>
                    <p className="text-lg font-semibold">{formatKenyanCurrency(payment.amount)}</p>
                  </div>
                  <div>
                    <p className="text-sm font-medium text-gray-600">Method</p>
                    <p className="capitalize">{payment.payment_method}</p>
                  </div>
                  <div>
                    <p className="text-sm font-medium text-gray-600">Reference</p>
                    <p className="font-mono text-sm">{payment.reference_number}</p>
                  </div>
                  <div>
                    <p className="text-sm font-medium text-gray-600">Status</p>
                    <div className="flex items-center gap-2">
                      {payment.amount >= getInstallationFee() ? (
                        <>
                          <CheckCircle className="h-4 w-4 text-green-600" />
                          <span className="text-green-600">Ready for activation</span>
                        </>
                      ) : (
                        <>
                          <AlertCircle className="h-4 w-4 text-yellow-600" />
                          <span className="text-yellow-600">Partial payment</span>
                        </>
                      )}
                    </div>
                  </div>
                </div>

                {payment.mpesa_receipt_number && (
                  <div className="mt-4 p-3 bg-gray-50 rounded">
                    <p className="text-sm">
                      <strong>M-Pesa Receipt:</strong> {payment.mpesa_receipt_number}
                    </p>
                  </div>
                )}
              </CardContent>
            </Card>
          ))
        )}
      </div>

      {/* Service Activation Dialog */}
      <Dialog open={showServiceDialog} onOpenChange={setShowServiceDialog}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Activate Service</DialogTitle>
            <DialogDescription>
              Payment received. Activate service for {selectedPayment?.clients?.name}?
            </DialogDescription>
          </DialogHeader>
          
          <div className="space-y-4">
            {selectedPayment && (
              <div className="bg-gray-50 p-4 rounded">
                <p><strong>Client:</strong> {selectedPayment.clients?.name}</p>
                <p><strong>Amount:</strong> {formatKenyanCurrency(selectedPayment.amount)}</p>
                <p><strong>Reference:</strong> {selectedPayment.reference_number}</p>
                <p><strong>Method:</strong> {selectedPayment.payment_method}</p>
              </div>
            )}

            <div className="flex justify-end space-x-2">
              <Button variant="outline" onClick={() => setShowServiceDialog(false)}>
                Cancel
              </Button>
              <Button onClick={confirmServiceActivation}>
                Activate Service
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default PaymentMonitor;
