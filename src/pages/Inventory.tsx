
import React, { useState } from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import InventoryDashboard from '@/components/inventory/InventoryDashboard';
import InventoryListView from '@/components/inventory/InventoryListView';
import InventoryItemDetail from '@/components/inventory/InventoryItemDetail';
import LowStockManagement from '@/components/inventory/LowStockManagement';

const Inventory = () => {
  const [activeTab, setActiveTab] = useState('dashboard');
  const [selectedItemId, setSelectedItemId] = useState<string | null>(null);
  const [filterStatus, setFilterStatus] = useState<string>('');

  const handleViewItem = (itemId: string) => {
    setSelectedItemId(itemId);
    setActiveTab('detail');
  };

  const handleFilterByStatus = (status: string) => {
    setFilterStatus(status);
    setActiveTab('list');
  };

  return (
    <div className="p-6">
      <div className="mb-6">
        <h1 className="text-3xl font-bold">Inventory Management</h1>
        <p className="text-muted-foreground mt-2">
          Manage all your network equipment, customer equipment, and assets
        </p>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="dashboard">Dashboard</TabsTrigger>
          <TabsTrigger value="list">All Items</TabsTrigger>
          <TabsTrigger value="detail" disabled={!selectedItemId}>
            Item Details
          </TabsTrigger>
          <TabsTrigger value="low-stock">Low Stock</TabsTrigger>
        </TabsList>

        <TabsContent value="dashboard">
          <InventoryDashboard 
            onFilterByStatus={handleFilterByStatus}
            onViewItem={handleViewItem}
          />
        </TabsContent>

        <TabsContent value="list">
          <InventoryListView 
            onViewItem={handleViewItem}
            initialFilter={filterStatus}
          />
        </TabsContent>

        <TabsContent value="detail">
          {selectedItemId && (
            <InventoryItemDetail 
              item={selectedItemId}
              onBack={() => setActiveTab('list')}
            />
          )}
        </TabsContent>

        <TabsContent value="low-stock">
          <LowStockManagement onViewItem={handleViewItem} />
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default Inventory;
