
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Package, Wifi } from 'lucide-react';

const PackageManager: React.FC = () => {
  return (
    <div className="space-y-6">
      <div className="flex items-center gap-2">
        <Package className="h-6 w-6" />
        <h2 className="text-2xl font-bold">Service Package Management</h2>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Service Packages</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center py-8 text-muted-foreground">
            <Wifi className="h-12 w-12 mx-auto mb-4 opacity-50" />
            <p>Service package management system</p>
            <p className="text-sm">Create and manage your internet service packages</p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default PackageManager;
