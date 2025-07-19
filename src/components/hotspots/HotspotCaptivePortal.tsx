
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { formatKenyanCurrency } from '@/utils/kenyanValidation';
import PaymentProviderSelector from '../billing/PaymentProviderSelector';
import { PaymentProvider } from '@/utils/kenyanPayments';
import { Wifi, Clock, Download, Globe } from 'lucide-react';

interface DataBundle {
  id: string;
  name: string;
  price: number;
  data_mb?: number;
  duration_minutes?: number;
  description: string;
  popular?: boolean;
}

interface HotspotCaptivePortalProps {
  hotspotId: string;
  hotspotName: string;
  companyLogo?: string;
  companyName: string;
  onPaymentComplete?: (bundleId: string, paymentData: any) => void;
}

const HotspotCaptivePortal: React.FC<HotspotCaptivePortalProps> = ({
  hotspotId,
  hotspotName,
  companyLogo,
  companyName,
  onPaymentComplete,
}) => {
  const [selectedBundle, setSelectedBundle] = useState<DataBundle | null>(null);
  const [selectedProvider, setSelectedProvider] = useState<PaymentProvider | null>(null);
  const [showPayment, setShowPayment] = useState(false);

  // Sample data bundles - in production, these would come from the database
  const dataBundles: DataBundle[] = [
    {
      id: '1',
      name: 'Quick Browse',
      price: 20,
      data_mb: 100,
      duration_minutes: 60,
      description: '100MB or 1 Hour',
    },
    {
      id: '2', 
      name: 'Social Media',
      price: 50,
      data_mb: 500,
      duration_minutes: 180,
      description: '500MB or 3 Hours',
      popular: true,
    },
    {
      id: '3',
      name: 'Work & Study',
      price: 100,
      data_mb: 1024,
      duration_minutes: 480,
      description: '1GB or 8 Hours',
    },
    {
      id: '4',
      name: 'Full Day',
      price: 200,
      data_mb: 2048,
      duration_minutes: 1440,
      description: '2GB or 24 Hours',
    },
  ];

  const handleBundleSelect = (bundle: DataBundle) => {
    console.log('Selected bundle:', bundle);
    setSelectedBundle(bundle);
    setShowPayment(true);
  };

  const handleProviderSelect = (provider: PaymentProvider) => {
    console.log('Selected payment provider:', provider);
    setSelectedProvider(provider);
  };

  const handlePaymentComplete = (paymentData: any) => {
    console.log('Payment completed:', paymentData);
    if (selectedBundle && onPaymentComplete) {
      onPaymentComplete(selectedBundle.id, paymentData);
    }
    
    // Redirect to success page or Google
    setTimeout(() => {
      window.location.href = 'https://www.google.com';
    }, 2000);
  };

  const getBundleIcon = (bundle: DataBundle) => {
    if (bundle.data_mb && bundle.data_mb >= 1000) return <Download className="h-6 w-6" />;
    if (bundle.duration_minutes && bundle.duration_minutes >= 480) return <Clock className="h-6 w-6" />;
    return <Wifi className="h-6 w-6" />;
  };

  if (showPayment && selectedBundle) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 p-4">
        <div className="max-w-4xl mx-auto">
          {/* Header */}
          <div className="text-center mb-8">
            {companyLogo && (
              <img src={companyLogo} alt={companyName} className="h-16 mx-auto mb-4" />
            )}
            <h1 className="text-2xl font-bold text-gray-800">{companyName}</h1>
            <p className="text-gray-600">Complete your payment for {selectedBundle.name}</p>
          </div>

          {/* Selected Bundle Summary */}
          <Card className="mb-6">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                {getBundleIcon(selectedBundle)}
                Selected Bundle: {selectedBundle.name}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex justify-between items-center">
                <div>
                  <p className="text-sm text-gray-600">{selectedBundle.description}</p>
                  <p className="text-lg font-bold text-green-600">
                    {formatKenyanCurrency(selectedBundle.price)}
                  </p>
                </div>
                <Button 
                  variant="outline"
                  onClick={() => setShowPayment(false)}
                >
                  Change Bundle
                </Button>
              </div>
            </CardContent>
          </Card>

          {/* Payment Provider Selector */}
          <PaymentProviderSelector
            clientId={`hotspot_${hotspotId}_${Date.now()}`}
            amount={selectedBundle.price}
            accountReference={`HOTSPOT_${hotspotId}`}
            selectedProvider={selectedProvider}
            onProviderSelect={handleProviderSelect}
            onPaymentComplete={handlePaymentComplete}
          />
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 p-4">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="text-center mb-8">
          {companyLogo && (
            <img src={companyLogo} alt={companyName} className="h-20 mx-auto mb-4" />
          )}
          <h1 className="text-3xl font-bold text-gray-800 mb-2">{companyName}</h1>
          <p className="text-gray-600 mb-4">Welcome to {hotspotName}</p>
          <div className="flex items-center justify-center gap-2 text-green-600">
            <Wifi className="h-5 w-5" />
            <span className="font-medium">Connected to WiFi</span>
          </div>
        </div>

        {/* Data Bundles */}
        <div className="mb-8">
          <h2 className="text-xl font-semibold text-gray-800 mb-4 text-center">
            Choose Your Data Bundle
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {dataBundles.map((bundle) => (
              <Card 
                key={bundle.id}
                className={`cursor-pointer transition-all hover:shadow-lg hover:scale-105 ${
                  bundle.popular ? 'ring-2 ring-blue-500 relative' : ''
                }`}
                onClick={() => handleBundleSelect(bundle)}
              >
                {bundle.popular && (
                  <Badge className="absolute -top-2 left-1/2 transform -translate-x-1/2 bg-blue-500">
                    Most Popular
                  </Badge>
                )}
                <CardHeader className="text-center pb-2">
                  <div className="flex justify-center mb-2 text-blue-600">
                    {getBundleIcon(bundle)}
                  </div>
                  <CardTitle className="text-lg">{bundle.name}</CardTitle>
                </CardHeader>
                <CardContent className="text-center">
                  <p className="text-2xl font-bold text-green-600 mb-2">
                    {formatKenyanCurrency(bundle.price)}
                  </p>
                  <p className="text-sm text-gray-600 mb-4">{bundle.description}</p>
                  <Button className="w-full">
                    Select Bundle
                  </Button>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>

        {/* Footer */}
        <div className="text-center text-sm text-gray-500">
          <p className="mb-2">
            <Globe className="h-4 w-4 inline mr-1" />
            Secure Internet Access
          </p>
          <p>Need help? Contact support at support@{companyName.toLowerCase().replace(/\s+/g, '')}.com</p>
        </div>
      </div>
    </div>
  );
};

export default HotspotCaptivePortal;
