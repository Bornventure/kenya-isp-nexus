import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Plus } from 'lucide-react';
import { useHotspots } from '@/hooks/useHotspots';
import HotspotsList from './HotspotsList';
import HotspotForm from './HotspotForm';
import VoucherManagement from './VoucherManagement';
import SessionManagement from './SessionManagement';
import LoadBalancer from './LoadBalancer';
import RoamingManager from './RoamingManager';
import SocialAuth from './SocialAuth';
import MarketingCampaigns from './MarketingCampaigns';
import LocationServices from './LocationServices';
import HotspotNetworkIntegration from './HotspotNetworkIntegration';
import AdvancedHotspotAnalytics from './AdvancedHotspotAnalytics';
import HotspotCaptivePortal from './HotspotCaptivePortal';

const HotspotManagement = () => {
  const [showCreateDialog, setShowCreateDialog] = useState(false);
  const [selectedHotspot, setSelectedHotspot] = useState<string | null>(null);
  const [showCaptivePortal, setShowCaptivePortal] = useState(false);
  const { data: hotspots = [], isLoading } = useHotspots();

  const handleCreateSuccess = () => {
    console.log('Hotspot creation successful, closing dialog');
    setShowCreateDialog(false);
  };

  const handleSelectHotspot = (hotspotId: string) => {
    console.log('Selected hotspot:', hotspotId);
    setSelectedHotspot(hotspotId);
  };

  const handlePaymentComplete = (bundleId: string, paymentData: any) => {
    console.log('Hotspot payment completed:', { bundleId, paymentData });
    // Here you would activate the bundle for the user
    // This would typically involve:
    // 1. Recording the payment
    // 2. Creating a session with the bundle limits
    // 3. Configuring MikroTik to allow access
    // 4. Starting usage monitoring
  };

  // Demo captive portal - in production this would be on a separate domain/subdomain
  if (showCaptivePortal) {
    return (
      <HotspotCaptivePortal
        hotspotId="demo-hotspot"
        hotspotName="Demo Hotspot"
        companyName="ISP Demo Company"
        onPaymentComplete={handlePaymentComplete}
      />
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Hotspot Management</h1>
          <p className="text-muted-foreground mt-2">
            Production-ready Wi-Fi hotspot management with MikroTik integration
          </p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" onClick={() => setShowCaptivePortal(true)}>
            Preview Portal
          </Button>
          <Button onClick={() => {
            console.log('Opening create hotspot dialog');
            setShowCreateDialog(true);
          }}>
            <Plus className="h-4 w-4 mr-2" />
            Create Hotspot
          </Button>
        </div>
      </div>

      <Tabs defaultValue="hotspots" className="w-full">
        <TabsList className="grid w-full grid-cols-11">
          <TabsTrigger value="hotspots">Hotspots</TabsTrigger>
          <TabsTrigger value="sessions">Sessions</TabsTrigger>
          <TabsTrigger value="vouchers">Vouchers</TabsTrigger>
          <TabsTrigger value="load-balancer">Load Balancer</TabsTrigger>
          <TabsTrigger value="roaming">Roaming</TabsTrigger>
          <TabsTrigger value="social-auth">Social Auth</TabsTrigger>
          <TabsTrigger value="marketing">Marketing</TabsTrigger>
          <TabsTrigger value="location">Location</TabsTrigger>
          <TabsTrigger value="network">Network</TabsTrigger>
          <TabsTrigger value="analytics">Analytics</TabsTrigger>
          <TabsTrigger value="advanced">Advanced</TabsTrigger>
        </TabsList>

        <TabsContent value="hotspots">
          <Card>
            <CardHeader>
              <CardTitle>Hotspot Locations</CardTitle>
            </CardHeader>
            <CardContent>
              <HotspotsList 
                hotspots={hotspots} 
                isLoading={isLoading}
                onSelectHotspot={handleSelectHotspot}
                selectedHotspot={selectedHotspot}
              />
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="sessions">
          <SessionManagement />
        </TabsContent>

        <TabsContent value="vouchers">
          <VoucherManagement selectedHotspot={selectedHotspot} />
        </TabsContent>

        <TabsContent value="load-balancer">
          <LoadBalancer selectedHotspot={selectedHotspot} />
        </TabsContent>

        <TabsContent value="roaming">
          <RoamingManager selectedHotspot={selectedHotspot} />
        </TabsContent>

        <TabsContent value="social-auth">
          <SocialAuth selectedHotspot={selectedHotspot} />
        </TabsContent>

        <TabsContent value="marketing">
          <MarketingCampaigns selectedHotspot={selectedHotspot} />
        </TabsContent>

        <TabsContent value="location">
          <LocationServices selectedHotspot={selectedHotspot} />
        </TabsContent>

        <TabsContent value="network">
          <HotspotNetworkIntegration selectedHotspot={selectedHotspot} />
        </TabsContent>

        <TabsContent value="analytics">
          <AdvancedHotspotAnalytics selectedHotspot={selectedHotspot} />
        </TabsContent>

        <TabsContent value="advanced">
          <Card>
            <CardHeader>
              <CardTitle>Advanced Configuration</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground">
                Advanced hotspot features and enterprise configuration options coming soon...
              </p>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      <Dialog open={showCreateDialog} onOpenChange={(open) => {
        console.log('Dialog open state changed:', open);
        setShowCreateDialog(open);
      }}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Create New Hotspot</DialogTitle>
          </DialogHeader>
          <HotspotForm onSuccess={handleCreateSuccess} />
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default HotspotManagement;
