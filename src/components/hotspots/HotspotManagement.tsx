
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

const HotspotManagement = () => {
  const [showCreateDialog, setShowCreateDialog] = useState(false);
  const { data: hotspots = [], isLoading } = useHotspots();

  const handleCreateSuccess = () => {
    setShowCreateDialog(false);
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Hotspot Management</h1>
          <p className="text-muted-foreground mt-2">
            Manage Wi-Fi hotspots, sessions, and user access
          </p>
        </div>
        <Button onClick={() => setShowCreateDialog(true)}>
          <Plus className="h-4 w-4 mr-2" />
          Create Hotspot
        </Button>
      </div>

      <Tabs defaultValue="hotspots" className="w-full">
        <TabsList className="grid w-full grid-cols-9">
          <TabsTrigger value="hotspots">Hotspots</TabsTrigger>
          <TabsTrigger value="sessions">Sessions</TabsTrigger>
          <TabsTrigger value="vouchers">Vouchers</TabsTrigger>
          <TabsTrigger value="load-balancer">Load Balancer</TabsTrigger>
          <TabsTrigger value="roaming">Roaming</TabsTrigger>
          <TabsTrigger value="social-auth">Social Auth</TabsTrigger>
          <TabsTrigger value="marketing">Marketing</TabsTrigger>
          <TabsTrigger value="location">Location</TabsTrigger>
          <TabsTrigger value="analytics">Analytics</TabsTrigger>
        </TabsList>

        <TabsContent value="hotspots">
          <Card>
            <CardHeader>
              <CardTitle>Hotspot Locations</CardTitle>
            </CardHeader>
            <CardContent>
              <HotspotsList hotspots={hotspots} isLoading={isLoading} />
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="sessions">
          <SessionManagement />
        </TabsContent>

        <TabsContent value="vouchers">
          <VoucherManagement />
        </TabsContent>

        <TabsContent value="load-balancer">
          <LoadBalancer />
        </TabsContent>

        <TabsContent value="roaming">
          <RoamingManager />
        </TabsContent>

        <TabsContent value="social-auth">
          <SocialAuth />
        </TabsContent>

        <TabsContent value="marketing">
          <MarketingCampaigns />
        </TabsContent>

        <TabsContent value="location">
          <LocationServices />
        </TabsContent>

        <TabsContent value="analytics">
          <Card>
            <CardHeader>
              <CardTitle>Analytics Dashboard</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground">
                Detailed analytics coming soon...
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
