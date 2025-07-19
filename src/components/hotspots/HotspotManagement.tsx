
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

const HotspotManagement = () => {
  const [showCreateDialog, setShowCreateDialog] = useState(false);
  const [selectedHotspot, setSelectedHotspot] = useState<string | null>(null);
  const { data: hotspots = [], isLoading } = useHotspots();

  const handleCreateSuccess = () => {
    setShowCreateDialog(false);
  };

  const handleSelectHotspot = (hotspotId: string) => {
    setSelectedHotspot(hotspotId);
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Hotspot Management</h1>
          <p className="text-muted-foreground mt-2">
            Production-ready Wi-Fi hotspot management with MikroTik integration
          </p>
        </div>
        <Button onClick={() => setShowCreateDialog(true)}>
          <Plus className="h-4 w-4 mr-2" />
          Create Hotspot
        </Button>
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

      <Dialog open={showCreateDialog} onOpenChange={setShowCreateDialog}>
        <DialogContent className="max-w-2xl">
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
