
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Plus, Edit, Trash2, Package, Wifi, DollarSign } from 'lucide-react';
import { useServicePackages } from '@/hooks/useServicePackages';
import { useToast } from '@/hooks/use-toast';
import CreatePackageDialog from '@/components/packages/CreatePackageDialog';
import EditPackageDialog from '@/components/packages/EditPackageDialog';
import PackageList from '@/components/packages/PackageList';
import PackageStats from '@/components/packages/PackageStats';

const PackageManagement = () => {
  const { servicePackages, isLoading } = useServicePackages();
  const { toast } = useToast();
  const [showCreateDialog, setShowCreateDialog] = useState(false);
  const [editingPackage, setEditingPackage] = useState(null);

  if (isLoading) {
    return (
      <div className="p-6">
        <div className="animate-pulse">
          <div className="h-8 bg-gray-200 rounded w-1/3 mb-6"></div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
            {[...Array(3)].map((_, i) => (
              <div key={i} className="h-32 bg-gray-200 rounded"></div>
            ))}
          </div>
          <div className="h-96 bg-gray-200 rounded"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Package Management</h1>
          <p className="text-muted-foreground">Manage your internet service packages and pricing</p>
        </div>
        <Button onClick={() => setShowCreateDialog(true)}>
          <Plus className="h-4 w-4 mr-2" />
          Create Package
        </Button>
      </div>

      <PackageStats packages={servicePackages} />
      
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Package className="h-5 w-5" />
            Service Packages
          </CardTitle>
        </CardHeader>
        <CardContent>
          <PackageList 
            packages={servicePackages}
            onEdit={setEditingPackage}
          />
        </CardContent>
      </Card>

      <CreatePackageDialog 
        open={showCreateDialog}
        onOpenChange={setShowCreateDialog}
      />

      {editingPackage && (
        <EditPackageDialog
          package={editingPackage}
          open={!!editingPackage}
          onOpenChange={() => setEditingPackage(null)}
        />
      )}
    </div>
  );
};

export default PackageManagement;
