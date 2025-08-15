
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Router, HardDrive } from 'lucide-react';

const EquipmentManager: React.FC = () => {
  return (
    <div className="space-y-6">
      <div className="flex items-center gap-2">
        <Router className="h-6 w-6" />
        <h2 className="text-2xl font-bold">Equipment Management</h2>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Equipment Overview</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center py-8 text-muted-foreground">
            <HardDrive className="h-12 w-12 mx-auto mb-4 opacity-50" />
            <p>Equipment management system</p>
            <p className="text-sm">Manage your network equipment and inventory</p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default EquipmentManager;
