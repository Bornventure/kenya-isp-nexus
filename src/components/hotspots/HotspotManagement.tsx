
import React, { useState } from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import { Plus, Wifi, Activity, BarChart3, Users, Shield, Ticket, Settings } from 'lucide-react';
import { useHotspots, useHotspotSessions, useHotspotAnalytics } from '@/hooks/useHotspots';
import { useAuth } from '@/contexts/AuthContext';

import HotspotsList from './HotspotsList';
import HotspotForm from './HotspotForm';
import HotspotDashboard from './HotspotDashboard';
import ActiveSessions from './ActiveSessions';
import HotspotAnalytics from './HotspotAnalytics';
import ClientAuthSystem from './ClientAuthSystem';
import VoucherManagement from './VoucherManagement';
import HotspotSettings from './HotspotSettings';

const HotspotManagement = () => {
  const { profile } = useAuth();
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [selectedHotspot, setSelectedHotspot] = useState<string | null>(null);

  const { data: hotspots, isLoading: hotspotsLoading } = useHotspots();
  const { data: sessions, isLoading: sessionsLoading } = useHotspotSessions();
  const { data: analytics, isLoading: analyticsLoading } = useHotspotAnalytics();

  const isAdmin = profile?.role === 'super_admin' || profile?.role === 'isp_admin';

  const stats = {
    totalHotspots: hotspots?.length || 0,
    activeHotspots: hotspots?.filter(h => h.status === 'active').length || 0,
    activeSessions: sessions?.filter(s => s.session_status === 'active').length || 0,
    totalRevenue: analytics?.reduce((sum, a) => sum + (a.revenue_generated || 0), 0) || 0,
  };

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Hotspot Management</h1>
          <p className="text-muted-foreground">
            Manage WiFi hotspots, monitor usage, and track performance
          </p>
        </div>
        {isAdmin && (
          <Button onClick={() => setShowCreateForm(true)}>
            <Plus className="h-4 w-4 mr-2" />
            Add Hotspot
          </Button>
        )}
      </div>

      {/* Quick Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-white p-6 rounded-lg border">
          <div className="flex items-center gap-2">
            <Wifi className="h-5 w-5 text-blue-600" />
            <div>
              <p className="text-2xl font-bold">{stats.totalHotspots}</p>
              <p className="text-sm text-muted-foreground">Total Hotspots</p>
            </div>
          </div>
        </div>

        <div className="bg-white p-6 rounded-lg border">
          <div className="flex items-center gap-2">
            <Activity className="h-5 w-5 text-green-600" />
            <div>
              <p className="text-2xl font-bold">{stats.activeHotspots}</p>
              <p className="text-sm text-muted-foreground">Active Hotspots</p>
            </div>
          </div>
        </div>

        <div className="bg-white p-6 rounded-lg border">
          <div className="flex items-center gap-2">
            <Users className="h-5 w-5 text-orange-600" />
            <div>
              <p className="text-2xl font-bold">{stats.activeSessions}</p>
              <p className="text-sm text-muted-foreground">Active Sessions</p>
            </div>
          </div>
        </div>

        <div className="bg-white p-6 rounded-lg border">
          <div className="flex items-center gap-2">
            <BarChart3 className="h-5 w-5 text-purple-600" />
            <div>
              <p className="text-2xl font-bold">KES {stats.totalRevenue.toLocaleString()}</p>
              <p className="text-sm text-muted-foreground">Total Revenue</p>
            </div>
          </div>
        </div>
      </div>

      <Tabs defaultValue="dashboard" className="w-full">
        <TabsList className="grid w-full grid-cols-7">
          <TabsTrigger value="dashboard">Dashboard</TabsTrigger>
          <TabsTrigger value="hotspots">Hotspots</TabsTrigger>
          <TabsTrigger value="sessions">Sessions</TabsTrigger>
          <TabsTrigger value="analytics">Analytics</TabsTrigger>
          <TabsTrigger value="client-auth">Client Auth</TabsTrigger>
          <TabsTrigger value="vouchers">Vouchers</TabsTrigger>
          <TabsTrigger value="settings">Settings</TabsTrigger>
        </TabsList>

        <TabsContent value="dashboard" className="space-y-4">
          <HotspotDashboard 
            hotspots={hotspots || []}
            sessions={sessions || []}
            analytics={analytics || []}
            isLoading={hotspotsLoading || sessionsLoading || analyticsLoading}
          />
        </TabsContent>

        <TabsContent value="hotspots" className="space-y-4">
          <HotspotsList 
            hotspots={hotspots || []}
            isLoading={hotspotsLoading}
            onSelectHotspot={setSelectedHotspot}
            selectedHotspot={selectedHotspot}
          />
        </TabsContent>

        <TabsContent value="sessions" className="space-y-4">
          <ActiveSessions 
            sessions={sessions || []}
            isLoading={sessionsLoading}
            selectedHotspot={selectedHotspot}
          />
        </TabsContent>

        <TabsContent value="analytics" className="space-y-4">
          <HotspotAnalytics 
            analytics={analytics || []}
            hotspots={hotspots || []}
            isLoading={analyticsLoading}
            selectedHotspot={selectedHotspot}
          />
        </TabsContent>

        <TabsContent value="client-auth" className="space-y-4">
          <ClientAuthSystem selectedHotspot={selectedHotspot} />
        </TabsContent>

        <TabsContent value="vouchers" className="space-y-4">
          <VoucherManagement selectedHotspot={selectedHotspot} />
        </TabsContent>

        <TabsContent value="settings" className="space-y-4">
          <HotspotSettings selectedHotspot={selectedHotspot} />
        </TabsContent>
      </Tabs>

      {/* Create Hotspot Dialog */}
      {showCreateForm && (
        <HotspotForm 
          onClose={() => setShowCreateForm(false)}
          onSuccess={() => setShowCreateForm(false)}
        />
      )}
    </div>
  );
};

export default HotspotManagement;
