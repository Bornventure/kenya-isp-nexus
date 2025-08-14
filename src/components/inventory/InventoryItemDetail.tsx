
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Edit, MapPin, Calendar, DollarSign, Package, AlertCircle } from 'lucide-react';
import { Equipment } from '@/hooks/useInventory';
import EditInventoryItemDialog from './EditInventoryItemDialog';

interface InventoryItemDetailProps {
  item: Equipment;
}

const InventoryItemDetail: React.FC<InventoryItemDetailProps> = ({ item }) => {
  const [editDialogOpen, setEditDialogOpen] = useState(false);

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'available':
        return 'bg-green-100 text-green-800';
      case 'deployed':
        return 'bg-blue-100 text-blue-800';
      case 'maintenance':
        return 'bg-yellow-100 text-yellow-800';
      case 'damaged':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-2xl font-bold">{item.name || item.type}</h2>
            <p className="text-muted-foreground">{item.brand} {item.model}</p>
          </div>
          <div className="flex items-center gap-2">
            <Badge className={getStatusColor(item.status)}>
              {item.status}
            </Badge>
            <Button onClick={() => setEditDialogOpen(true)} size="sm">
              <Edit className="h-4 w-4 mr-2" />
              Edit
            </Button>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Basic Information</CardTitle>
              <Package className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                <div>
                  <span className="text-sm font-medium">Type:</span>
                  <span className="ml-2 text-sm">{item.type}</span>
                </div>
                <div>
                  <span className="text-sm font-medium">Brand:</span>
                  <span className="ml-2 text-sm">{item.brand || 'N/A'}</span>
                </div>
                <div>
                  <span className="text-sm font-medium">Model:</span>
                  <span className="ml-2 text-sm">{item.model || 'N/A'}</span>
                </div>
                <div>
                  <span className="text-sm font-medium">Serial Number:</span>
                  <span className="ml-2 text-sm">{item.serial_number}</span>
                </div>
                {item.mac_address && (
                  <div>
                    <span className="text-sm font-medium">MAC Address:</span>
                    <span className="ml-2 text-sm font-mono">{item.mac_address}</span>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Location & Status</CardTitle>
              <MapPin className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                <div>
                  <span className="text-sm font-medium">Location:</span>
                  <span className="ml-2 text-sm">{item.location || 'Not specified'}</span>
                </div>
                <div>
                  <span className="text-sm font-medium">Status:</span>
                  <Badge className={`ml-2 ${getStatusColor(item.status)}`} variant="secondary">
                    {item.status}
                  </Badge>
                </div>
                {item.ip_address && (
                  <div>
                    <span className="text-sm font-medium">IP Address:</span>
                    <span className="ml-2 text-sm font-mono">{item.ip_address}</span>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Dates & Warranty</CardTitle>
              <Calendar className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                {item.purchase_date && (
                  <div>
                    <span className="text-sm font-medium">Purchase Date:</span>
                    <span className="ml-2 text-sm">{new Date(item.purchase_date).toLocaleDateString()}</span>
                  </div>
                )}
                {item.installation_date && (
                  <div>
                    <span className="text-sm font-medium">Installation Date:</span>
                    <span className="ml-2 text-sm">{new Date(item.installation_date).toLocaleDateString()}</span>
                  </div>
                )}
                {item.warranty_expiry_date && (
                  <div>
                    <span className="text-sm font-medium">Warranty Expires:</span>
                    <span className="ml-2 text-sm">{new Date(item.warranty_expiry_date).toLocaleDateString()}</span>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </div>

        {item.notes && (
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Notes</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm">{item.notes}</p>
            </CardContent>
          </Card>
        )}

        {item.clients && (
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Assigned Client</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                <div>
                  <span className="text-sm font-medium">Client Name:</span>
                  <span className="ml-2 text-sm">{item.clients.name}</span>
                </div>
                {item.clients.phone && (
                  <div>
                    <span className="text-sm font-medium">Phone:</span>
                    <span className="ml-2 text-sm">{item.clients.phone}</span>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        )}
      </div>

      <EditInventoryItemDialog
        open={editDialogOpen}
        onOpenChange={setEditDialogOpen}
        item={item}
      />
    </>
  );
};

export default InventoryItemDetail;
