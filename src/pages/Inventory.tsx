
import React, { useState } from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import InventoryDashboard from '@/components/inventory/InventoryDashboard';
import InventoryListView from '@/components/inventory/InventoryListView';
import LowStockManagement from '@/components/inventory/LowStockManagement';
import { useAuth } from '@/contexts/AuthContext';

const Inventory = () => {
  const { profile } = useAuth();
  const [activeTab, setActiveTab] = useState('dashboard');

  const handleFilterByStatus = (status: string) => {
    // Map the status to the appropriate tab
    if (status === '') {
      setActiveTab('all-items');
    } else {
      setActiveTab(status);
    }
  };

  const handleViewItem = (itemId: string) => {
    console.log('View item:', itemId);
    // You can implement item detail view here
  };

  if (!profile) {
    return <div>Loading...</div>;
  }

  return (
    <div className="container mx-auto p-6 space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Inventory Management</h1>
        <p className="text-muted-foreground">
          Track and manage your network equipment and supplies
        </p>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid w-full grid-cols-6">
          <TabsTrigger value="dashboard">Dashboard</TabsTrigger>
          <TabsTrigger value="all-items">All Items</TabsTrigger>
          <TabsTrigger value="In Stock">In Stock</TabsTrigger>
          <TabsTrigger value="Deployed">Deployed</TabsTrigger>
          <TabsTrigger value="Maintenance">Maintenance</TabsTrigger>
          <TabsTrigger value="low-stock">Low Stock</TabsTrigger>
        </TabsList>

        <TabsContent value="dashboard" className="space-y-6">
          <InventoryDashboard 
            onFilterByStatus={handleFilterByStatus} 
            onViewItem={handleViewItem}
          />
        </TabsContent>

        <TabsContent value="all-items">
          <InventoryListView initialFilter="" />
        </TabsContent>

        <TabsContent value="In Stock">
          <InventoryListView initialFilter="In Stock" />
        </TabsContent>

        <TabsContent value="Deployed">
          <InventoryListView initialFilter="Deployed" />
        </TabsContent>

        <TabsContent value="Maintenance">
          <InventoryListView initialFilter="Maintenance" />
        </TabsContent>

        <TabsContent value="low-stock" className="space-y-6">
          <LowStockManagement onViewItem={handleViewItem} />
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default Inventory;
