
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { 
  ArrowLeft, 
  Edit, 
  Trash2, 
  UserPlus, 
  Network, 
  MapPin,
  Calendar,
  Package,
  Info,
  User
} from 'lucide-react';
import { useInventoryItem, useUpdateInventoryItem } from '@/hooks/useInventory';
import EditInventoryItemDialog from './EditInventoryItemDialog';
import UnifiedEquipmentAssignmentDialog from './UnifiedEquipmentAssignmentDialog';
import PromoteToEquipmentDialog from './PromoteToEquipmentDialog';

interface InventoryItemDetailProps {
  item: string;
  onBack: () => void;
}

const InventoryItemDetail: React.FC<InventoryItemDetailProps> = ({ item: itemId, onBack }) => {
  const [showEditDialog, setShowEditDialog] = useState(false);
  const [showAssignDialog, setShowAssignDialog] = useState(false);
  const [showPromoteDialog, setShowPromoteDialog] = useState(false);
  
  const { data: item, isLoading, error } = useInventoryItem(itemId);
  const { mutate: updateItem } = useUpdateInventoryItem();

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (error || !item) {
    return (
      <div className="text-center py-8">
        <p className="text-red-600">Error loading item details</p>
        <Button onClick={onBack} className="mt-4">
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back to Inventory
        </Button>
      </div>
    );
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'In Stock': return 'bg-green-100 text-green-800';
      case 'Deployed': return 'bg-blue-100 text-blue-800';
      case 'Maintenance': return 'bg-yellow-100 text-yellow-800';
      case 'Returned': return 'bg-gray-100 text-gray-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const handleAssignToClient = ({ clientId }: { itemId: string; clientId: string }) => {
    updateItem({
      id: item.id,
      updates: {
        assigned_customer_id: clientId,
        assignment_date: new Date().toISOString(),
        status: 'Deployed'
      }
    });
    setShowAssignDialog(false);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Button variant="outline" onClick={onBack}>
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Inventory
          </Button>
          <div>
            <h1 className="text-2xl font-bold">{item.name || item.model || 'Unnamed Item'}</h1>
            <p className="text-muted-foreground">ID: {item.item_id}</p>
          </div>
        </div>
        
        <div className="flex gap-2">
          <Button variant="outline" onClick={() => setShowEditDialog(true)}>
            <Edit className="h-4 w-4 mr-2" />
            Edit
          </Button>
          
          {item.status === 'In Stock' && item.category === 'CPE' && (
            <Button onClick={() => setShowAssignDialog(true)}>
              <UserPlus className="h-4 w-4 mr-2" />
              Assign to Client
            </Button>
          )}
          
          {!item.is_network_equipment && item.category === 'Network Hardware' && (
            <Button variant="outline" onClick={() => setShowPromoteDialog(true)}>
              <Network className="h-4 w-4 mr-2" />
              Promote to Equipment
            </Button>
          )}
        </div>
      </div>

      {/* Status and Category */}
      <div className="flex gap-4">
        <Badge className={getStatusColor(item.status)}>
          {item.status}
        </Badge>
        <Badge variant="outline">
          {item.category}
        </Badge>
        <Badge variant="outline">
          {item.type}
        </Badge>
        {item.is_network_equipment && (
          <Badge className="bg-purple-100 text-purple-800">
            Network Equipment
          </Badge>
        )}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Basic Information */}
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Info className="h-5 w-5" />
              Basic Information
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="text-sm font-medium text-gray-700">Name</label>
                <p className="text-sm text-gray-900">{item.name || 'N/A'}</p>
              </div>
              <div>
                <label className="text-sm font-medium text-gray-700">Model</label>
                <p className="text-sm text-gray-900">{item.model || 'N/A'}</p>
              </div>
              <div>
                <label className="text-sm font-medium text-gray-700">Manufacturer</label>
                <p className="text-sm text-gray-900">{item.manufacturer || 'N/A'}</p>
              </div>
              <div>
                <label className="text-sm font-medium text-gray-700">Serial Number</label>
                <p className="text-sm text-gray-900 font-mono">{item.serial_number || 'N/A'}</p>
              </div>
              <div>
                <label className="text-sm font-medium text-gray-700">MAC Address</label>
                <p className="text-sm text-gray-900 font-mono">{item.mac_address || 'N/A'}</p>
              </div>
              <div>
                <label className="text-sm font-medium text-gray-700">SKU</label>
                <p className="text-sm text-gray-900">{item.item_sku || 'N/A'}</p>
              </div>
            </div>

            {item.notes && (
              <>
                <Separator />
                <div>
                  <label className="text-sm font-medium text-gray-700">Notes</label>
                  <p className="text-sm text-gray-900 mt-1">{item.notes}</p>
                </div>
              </>
            )}
          </CardContent>
        </Card>

        {/* Assignment & Status */}
        <div className="space-y-6">
          {/* Assignment Information */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <User className="h-5 w-5" />
                Assignment
              </CardTitle>
            </CardHeader>
            <CardContent>
              {item.assigned_customer_id && item.clients ? (
                <div className="space-y-2">
                  <div>
                    <label className="text-sm font-medium text-gray-700">Assigned to</label>
                    <p className="text-sm text-gray-900">{item.clients.name}</p>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-gray-700">Phone</label>
                    <p className="text-sm text-gray-900">{item.clients.phone}</p>
                  </div>
                  {item.assignment_date && (
                    <div>
                      <label className="text-sm font-medium text-gray-700">Assigned Date</label>
                      <p className="text-sm text-gray-900">
                        {new Date(item.assignment_date).toLocaleDateString()}
                      </p>
                    </div>
                  )}
                </div>
              ) : (
                <div className="text-center py-4">
                  <Package className="h-8 w-8 mx-auto text-gray-400 mb-2" />
                  <p className="text-sm text-gray-500">Not assigned to any client</p>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Location Information */}
          {item.location && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <MapPin className="h-5 w-5" />
                  Location
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-gray-900">{item.location}</p>
              </CardContent>
            </Card>
          )}

          {/* Dates */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Calendar className="h-5 w-5" />
                Important Dates
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div>
                <label className="text-sm font-medium text-gray-700">Created</label>
                <p className="text-sm text-gray-900">
                  {new Date(item.created_at).toLocaleDateString()}
                </p>
              </div>
              {item.purchase_date && (
                <div>
                  <label className="text-sm font-medium text-gray-700">Purchase Date</label>
                  <p className="text-sm text-gray-900">
                    {new Date(item.purchase_date).toLocaleDateString()}
                  </p>
                </div>
              )}
              {item.installation_date && (
                <div>
                  <label className="text-sm font-medium text-gray-700">Installation Date</label>
                  <p className="text-sm text-gray-900">
                    {new Date(item.installation_date).toLocaleDateString()}
                  </p>
                </div>
              )}
              {item.warranty_expiry_date && (
                <div>
                  <label className="text-sm font-medium text-gray-700">Warranty Expires</label>
                  <p className="text-sm text-gray-900">
                    {new Date(item.warranty_expiry_date).toLocaleDateString()}
                  </p>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Dialogs */}
      <EditInventoryItemDialog
        open={showEditDialog}
        onOpenChange={setShowEditDialog}
        item={item}
      />

      <UnifiedEquipmentAssignmentDialog
        isOpen={showAssignDialog}
        onClose={() => setShowAssignDialog(false)}
        onAssign={handleAssignToClient}
        itemId={item.id}
        itemName={item.name || item.model || 'Unnamed Item'}
      />

      <PromoteToEquipmentDialog
        open={showPromoteDialog}
        onOpenChange={setShowPromoteDialog}
        item={item}
      />
    </div>
  );
};

export default InventoryItemDetail;
