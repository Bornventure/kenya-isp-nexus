
import React, { useState } from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import InventoryDashboard from '@/components/inventory/InventoryDashboard';
import InventoryListView from '@/components/inventory/InventoryListView';
import InventoryItemDetail from '@/components/inventory/InventoryItemDetail';
import LowStockManagement from '@/components/inventory/LowStockManagement';
import { useAuth } from '@/contexts/AuthContext';

const Inventory = () => {
  const { profile, isLoading: authLoading } = useAuth();
  const [activeTab, setActiveTab] = useState('dashboard');
  const [selectedItemId, setSelectedItemId] = useState<string | null>(null);
  const [filterStatus, setFilterStatus] = useState<string>('');

  console.log('Inventory Page - Auth state:', { 
    profile, 
    authLoading, 
    companyId: profile?.isp_company_id 
  });

  const handleViewItem = (itemId: string) => {
    console.log('Inventory - handleViewItem:', itemId);
    setSelectedItemId(itemId);
    setActiveTab('detail');
  };

  const handleFilterByStatus = (status: string) => {
    console.log('Inventory - handleFilterByStatus:', status);
    setFilterStatus(status);
    setActiveTab('list');
  };

  // Show loading while auth is loading
  if (authLoading) {
    return (
      <div className="p-6">
        <div className="animate-pulse space-y-4">
          <div className="h-8 bg-gray-200 rounded w-1/3"></div>
          <div className="h-4 bg-gray-200 rounded w-2/3"></div>
          <div className="h-64 bg-gray-200 rounded"></div>
        </div>
      </div>
    );
  }

  // Show error if no profile or company
  if (!profile || !profile.isp_company_id) {
    return (
      <div className="p-6">
        <div className="text-center py-12">
          <h3 className="text-lg font-semibold mb-2">Authentication Required</h3>
          <p className="text-sm text-muted-foreground">
            Please log in to access inventory management.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6">
      <div className="mb-6">
        <h1 className="text-3xl font-bold">Inventory Management</h1>
        <p className="text-muted-foreground mt-2">
          Manage all your network equipment, customer equipment, and assets
        </p>
        <p className="text-xs text-muted-foreground mt-1">
          Company ID: {profile.isp_company_id}
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
