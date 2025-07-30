
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { useClientAuth } from '@/contexts/ClientAuthContext';
import { formatKenyanCurrency } from '@/utils/kenyanValidation';
import { RefreshCw, Smartphone, CreditCard, Building2, AlertCircle, CheckCircle } from 'lucide-react';
import MpesaPayment from '@/components/billing/MpesaPayment';
import FamilyBankPayment from '@/components/billing/FamilyBankPayment';

const PackageRenewalForm: React.FC = () => {
  const { client, refreshClientData } = useClientAuth();
  const [selectedPaymentMethod, setSelectedPaymentMethod] = useState<string>('');
  const [showPaymentDialog, setShowPaymentDialog] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);

  const handlePaymentMethodSelect = (value: string) => {
    setSelectedPaymentMethod(value);
  };

  const handleProceedToPay = () => {
    if (selectedPaymentMethod) {
      setShowPaymentDialog(true);
    }
  };

  const handlePaymentComplete = async (paymentData: any) => {
    console.log('Package renewal payment completed:', paymentData);
    setIsProcessing(false);
    setShowPaymentDialog(false);
    setSelectedPaymentMethod('');
    
    await refreshClientData();
  };

  const handleDialogClose = () => {
    setShowPaymentDialog(false);
    setIsProcessing(false);
  };

  // CRITICAL FIX: Check if service is already active and not expired
  const isServiceActive = () => {
    if (!client) return false;
    
    const now = new Date();
    const subscriptionEndDate = client.subscription_end_date ? new Date(client.subscription_end_date) : null;
    
    return client.status === 'active' && subscriptionEndDate && subscriptionEndDate > now;
  };

  const getPaymentMethodIcon = (method: string) => {
    switch (method) {
      case 'mpesa': return <Smartphone className="h-4 w-4 text-green-600" />;
      case 'family_bank': return <Smartphone className="h-4 w-4 text-purple-600" />;
      case 'bank_transfer': return <Building2 className="h-4 w-4 text-blue-600" />;
      case 'card': return <CreditCard className="h-4 w-4 text-gray-600" />;
      default: return <CreditCard className="h-4 w-4" />;
    }
  };

  const getPaymentMethodName = (method: string) => {
    switch (method) {
      case 'mpesa': return 'M-Pesa Mobile Money';
      case 'family_bank': return 'Family Bank Mobile Money';
      case 'bank_transfer': return 'Bank Transfer';
      case 'card': return 'Credit/Debit Card';
      default: return method;
    }
  };

  const renderPaymentContent = () => {
    if (!client || !selectedPaymentMethod) return null;

    const packageAmount = client.monthly_rate;
    const accountReference = `PACKAGE_RENEWAL_${client.id}`;

    switch (selectedPaymentMethod) {
      case 'mpesa':
        return (
          <MpesaPayment
            clientId={client.id}
            amount={packageAmount}
            accountReference={accountReference}
            onPaymentComplete={handlePaymentComplete}
          />
        );
      
      case 'family_bank':
        return (
          <FamilyBankPayment
            clientId={client.id}
            amount={packageAmount}
            accountReference={accountReference}
            onPaymentComplete={handlePaymentComplete}
          />
        );
      
      default:
        return (
          <div className="text-center py-8">
            <AlertCircle className="h-12 w-12 text-yellow-500 mx-auto mb-4" />
            <h3 className="text-lg font-medium mb-2">Payment Method Coming Soon</h3>
            <p className="text-gray-600 mb-4">
              {getPaymentMethodName(selectedPaymentMethod)} will be available soon. 
              Please use M-Pesa or Family Bank for now.
            </p>
            <Button variant="outline" onClick={handleDialogClose}>
              Choose Different Method
            </Button>
          </div>
        );
    }
  };

  if (!client) return null;

  const currentPackage = client.service_package;
  const packageAmount = client.monthly_rate;
  const serviceActive = isServiceActive();

  // If service is already active, show status instead of renewal form
  if (serviceActive) {
    const subscriptionEndDate = client.subscription_end_date ? new Date(client.subscription_end_date) : null;
    const daysRemaining = subscriptionEndDate ? Math.ceil((subscriptionEndDate.getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24)) : 0;

    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <CheckCircle className="h-5 w-5 text-green-600" />
            Service Active
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="bg-green-50 p-4 rounded-lg border border-green-200">
            <h3 className="font-medium text-green-900 mb-2">Your service is currently active</h3>
            <p className="text-green-700 mb-2">
              Package: {currentPackage?.name || 'Default Package'}
            </p>
            <p className="text-green-700 mb-2">
              Speed: {currentPackage?.speed || 'N/A'}
            </p>
            <p className="text-green-700 mb-2">
              Expires: {subscriptionEndDate?.toLocaleDateString() || 'N/A'}
            </p>
            <p className="text-sm text-green-600">
              {daysRemaining > 0 ? `${daysRemaining} days remaining` : 'Service expires today'}
            </p>
          </div>

          <div className="text-xs text-gray-500 space-y-1 border-t pt-4">
            <p>• Your service will automatically renew if you have sufficient wallet balance</p>
            <p>• You can top up your wallet anytime to ensure uninterrupted service</p>
            <p>• Renewal will become available when your service expires</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <RefreshCw className="h-5 w-5" />
          Renew Package
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        {currentPackage && (
          <div className="bg-blue-50 p-4 rounded-lg">
            <h3 className="font-medium text-blue-900">Current Package</h3>
            <p className="text-blue-700">{currentPackage.name}</p>
            <p className="text-sm text-blue-600">Speed: {currentPackage.speed}</p>
            <p className="text-lg font-semibold text-blue-900">
              {formatKenyanCurrency(packageAmount)} / month
            </p>
          </div>
        )}

        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium mb-2">
              Select Payment Method
            </label>
            <Select value={selectedPaymentMethod} onValueChange={handlePaymentMethodSelect}>
              <SelectTrigger className="w-full">
                <SelectValue placeholder="Choose how you'd like to pay" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="mpesa">
                  <div className="flex items-center gap-2">
                    <Smartphone className="h-4 w-4 text-green-600" />
                    M-Pesa Mobile Money
                  </div>
                </SelectItem>
                <SelectItem value="family_bank">
                  <div className="flex items-center gap-2">
                    <Smartphone className="h-4 w-4 text-purple-600" />
                    Family Bank Mobile Money
                  </div>
                </SelectItem>
                <SelectItem value="bank_transfer">
                  <div className="flex items-center gap-2">
                    <Building2 className="h-4 w-4 text-blue-600" />
                    Bank Transfer
                  </div>
                </SelectItem>
                <SelectItem value="card">
                  <div className="flex items-center gap-2">
                    <CreditCard className="h-4 w-4 text-gray-600" />
                    Credit/Debit Card
                  </div>
                </SelectItem>
              </SelectContent>
            </Select>
          </div>

          {selectedPaymentMethod && (
            <div className="p-4 border rounded-lg bg-gray-50">
              <div className="flex items-center gap-2 mb-2">
                {getPaymentMethodIcon(selectedPaymentMethod)}
                <span className="font-medium">{getPaymentMethodName(selectedPaymentMethod)}</span>
              </div>
              <p className="text-sm text-gray-600 mb-3">
                Amount to pay: <span className="font-semibold">{formatKenyanCurrency(packageAmount)}</span>
              </p>
              <Button 
                onClick={handleProceedToPay}
                className="w-full"
                disabled={isProcessing}
              >
                Proceed to Pay {formatKenyanCurrency(packageAmount)}
              </Button>
            </div>
          )}
        </div>

        <Dialog open={showPaymentDialog} onOpenChange={handleDialogClose}>
          <DialogContent className="max-w-md">
            <DialogHeader>
              <DialogTitle>
                Complete Payment - {getPaymentMethodName(selectedPaymentMethod)}
              </DialogTitle>
              <DialogDescription>
                Pay {formatKenyanCurrency(packageAmount)} to renew your package
              </DialogDescription>
            </DialogHeader>
            
            {renderPaymentContent()}
          </DialogContent>
        </Dialog>

        <div className="text-xs text-gray-500 space-y-1 border-t pt-4">
          <p>• Select your preferred payment method from the dropdown</p>
          <p>• Your service will be renewed immediately after payment</p>
          <p>• You will receive an SMS confirmation</p>
        </div>
      </CardContent>
    </Card>
  );
};

export default PackageRenewalForm;
