import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { 
  Package, 
  MapPin, 
  Calendar, 
  DollarSign, 
  User, 
  Edit, 
  Trash2,
  Network,
  Router,
  Monitor
} from 'lucide-react';
import { useInventoryItem, useDeleteInventoryItem, useUnassignEquipmentFromClient } from '@/hooks/useInventory';
import { useToast } from '@/hooks/use-toast';
import EditInventoryItemDialog from './EditInventoryItemDialog';
import PromoteToEquipmentDialog from './PromoteToEquipmentDialog';
import PromoteToMikrotikDialog from './PromoteToMikrotikDialog';
import { InventoryItem } from '@/hooks/useInventory';

interface InventoryItemDetailProps {
  itemId: string;
  onClose: () => void;
}

const InventoryItemDetail: React.FC<InventoryItemDetailProps> = ({ itemId, onClose }) => {
  const { data: item, isLoading } = useInventoryItem(itemId);
  const deleteItem = useDeleteInventoryItem();
  const unassignEquipment = useUnassignEquipmentFromClient();
  const { toast } = useToast();
  const [showEditDialog, setShowEditDialog] = useState(false);
  const [showPromoteDialog, setShowPromoteDialog] = useState(false);
  const [showMikrotikDialog, setShowMikrotikDialog] = useState(false);

  if (isLoading) {
    return (
      <Card>
        <CardContent className="p-6">
          <div className="animate-pulse space-y-4">
            <div className="h-6 bg-gray-200 rounded w-1/3"></div>
            <div className="h-4 bg-gray-200 rounded w-1/2"></div>
            <div className="h-4 bg-gray-200 rounded w-2/3"></div>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (!item) {
    return (
      <Card>
        <CardContent className="p-6">
          <p className="text-center text-gray-500">Item not found</p>
        </CardContent>
      </Card>
    );
  }

  const handleDelete = async () => {
    if (window.confirm('Are you sure you want to delete this item?')) {
      deleteItem.mutate(item.id, {
        onSuccess: () => {
          onClose();
        }
      });
    }
  };

  const handleUnassign = async () => {
    if (window.confirm('Are you sure you want to return this equipment?')) {
      unassignEquipment.mutate(item.id, {
        onSuccess: () => {
          toast({
            title: "Success",
            description: "Equipment has been returned successfully.",
          });
        }
      });
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'In Stock': return 'bg-green-100 text-green-800';
      case 'Deployed': return 'bg-blue-100 text-blue-800';
      case 'Maintenance': return 'bg-yellow-100 text-yellow-800';
      case 'Retired': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const formatCurrency = (amount?: number | null) => {
    if (!amount) return 'N/A';
    return new Intl.NumberFormat('en-KE', {
      style: 'currency',
      currency: 'KES'
    }).format(amount);
  };

  const formatDate = (dateString?: string | null) => {
    if (!dateString) return 'N/A';
    return new Date(dateString).toLocaleDateString();
  };

  const isMikrotikRouter = () => {
    return item.category === 'Network Hardware' && 
           (item.type?.toLowerCase().includes('mikrotik') || 
            item.manufacturer?.toLowerCase().includes('mikrotik') ||
            item.name?.toLowerCase().includes('mikrotik'));
  };

  const canPromoteToEquipment = () => {
    return item.category === 'Network Hardware' && !item.is_network_equipment;
  };

  return (
    <>
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Package className="h-6 w-6 text-blue-600" />
              <div>
                <CardTitle className="text-xl">{item.name || item.type}</CardTitle>
                <p className="text-sm text-gray-600">{item.item_id}</p>
              </div>
            </div>
            <Badge className={getStatusColor(item.status)}>
              {item.status}
            </Badge>
          </div>
        </CardHeader>

        <CardContent className="space-y-6">
          {/* Basic Information */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-3">
              <div>
                <h4 className="font-medium text-gray-900">Category</h4>
                <p className="text-gray-600">{item.category}</p>
              </div>
              <div>
                <h4 className="font-medium text-gray-900">Type</h4>
                <p className="text-gray-600">{item.type}</p>
              </div>
              {item.manufacturer && (
                <div>
                  <h4 className="font-medium text-gray-900">Manufacturer</h4>
                  <p className="text-gray-600">{item.manufacturer}</p>
                </div>
              )}
              {item.model && (
                <div>
                  <h4 className="font-medium text-gray-900">Model</h4>
                  <p className="text-gray-600">{item.model}</p>
                </div>
              )}
            </div>

            <div className="space-y-3">
              {item.serial_number && (
                <div>
                  <h4 className="font-medium text-gray-900">Serial Number</h4>
                  <p className="text-gray-600 font-mono">{item.serial_number}</p>
                </div>
              )}
              {item.mac_address && (
                <div>
                  <h4 className="font-medium text-gray-900">MAC Address</h4>
                  <p className="text-gray-600 font-mono">{item.mac_address}</p>
                </div>
              )}
              {item.location && (
                <div className="flex items-center gap-2">
                  <MapPin className="h-4 w-4 text-gray-500" />
                  <div>
                    <h4 className="font-medium text-gray-900">Location</h4>
                    <p className="text-gray-600">{item.location}</p>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Financial Information */}
          {(item.cost || item.unit_cost) && (
            <div className="border-t pt-4">
              <h3 className="font-medium text-gray-900 mb-3 flex items-center gap-2">
                <DollarSign className="h-4 w-4" />
                Financial Information
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {item.cost && (
                  <div>
                    <h4 className="font-medium text-gray-900">Purchase Cost</h4>
                    <p className="text-gray-600">{formatCurrency(item.cost)}</p>
                  </div>
                )}
                {item.unit_cost && (
                  <div>
                    <h4 className="font-medium text-gray-900">Unit Cost</h4>
                    <p className="text-gray-600">{formatCurrency(item.unit_cost)}</p>
                  </div>
                )}
                {item.quantity_in_stock && (
                  <div>
                    <h4 className="font-medium text-gray-900">Quantity</h4>
                    <p className="text-gray-600">{item.quantity_in_stock}</p>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Dates */}
          <div className="border-t pt-4">
            <h3 className="font-medium text-gray-900 mb-3 flex items-center gap-2">
              <Calendar className="h-4 w-4" />
              Important Dates
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <h4 className="font-medium text-gray-900">Purchase Date</h4>
                <p className="text-gray-600">{formatDate(item.purchase_date)}</p>
              </div>
              <div>
                <h4 className="font-medium text-gray-900">Installation Date</h4>
                <p className="text-gray-600">{formatDate(item.installation_date)}</p>
              </div>
              <div>
                <h4 className="font-medium text-gray-900">Warranty Expiry</h4>
                <p className="text-gray-600">{formatDate(item.warranty_expiry_date)}</p>
              </div>
            </div>
          </div>

          {/* Assignment Information */}
          {item.clients && (
            <div className="border-t pt-4">
              <h3 className="font-medium text-gray-900 mb-3 flex items-center gap-2">
                <User className="h-4 w-4" />
                Assignment Information
              </h3>
              <div className="bg-blue-50 p-4 rounded-lg">
                <div className="flex items-center justify-between">
                  <div>
                    <h4 className="font-medium text-blue-900">Assigned to Client</h4>
                    <p className="text-blue-700">{item.clients.name}</p>
                    <p className="text-blue-600 text-sm">{item.clients.phone}</p>
                    <p className="text-blue-600 text-xs">
                      Assigned: {formatDate(item.assignment_date)}
                    </p>
                  </div>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={handleUnassign}
                    disabled={unassignEquipment.isPending}
                  >
                    Return Equipment
                  </Button>
                </div>
              </div>
            </div>
          )}

          {/* Network Equipment Options */}
          {canPromoteToEquipment() && (
            <div className="border-t pt-4">
              <h3 className="font-medium text-gray-900 mb-3 flex items-center gap-2">
                <Network className="h-4 w-4" />
                Network Equipment Options
              </h3>
              <div className="flex gap-2">
                {isMikrotikRouter() && (
                  <Button
                    onClick={() => setShowMikrotikDialog(true)}
                    className="flex items-center gap-2"
                  >
                    <Router className="h-4 w-4" />
                    Promote to MikroTik Router
                  </Button>
                )}
                <Button
                  variant="outline"
                  onClick={() => setShowPromoteDialog(true)}
                  className="flex items-center gap-2"
                >
                  <Monitor className="h-4 w-4" />
                  Promote to Equipment
                </Button>
              </div>
            </div>
          )}

          {/* Notes */}
          {item.notes && (
            <div className="border-t pt-4">
              <h3 className="font-medium text-gray-900 mb-2">Notes</h3>
              <p className="text-gray-600 bg-gray-50 p-3 rounded-lg">{item.notes}</p>
            </div>
          )}

          {/* Actions */}
          <div className="border-t pt-4 flex gap-2">
            <Button
              variant="outline"
              onClick={() => setShowEditDialog(true)}
              className="flex items-center gap-2"
            >
              <Edit className="h-4 w-4" />
              Edit
            </Button>
            <Button
              variant="destructive"
              onClick={handleDelete}
              disabled={deleteItem.isPending}
              className="flex items-center gap-2"
            >
              <Trash2 className="h-4 w-4" />
              Delete
            </Button>
          </div>
        </CardContent>
      </Card>

      <EditInventoryItemDialog
        open={showEditDialog}
        onOpenChange={setShowEditDialog}
        itemId={item.id}
      />

      <PromoteToEquipmentDialog
        open={showPromoteDialog}
        onOpenChange={setShowPromoteDialog}
        inventoryItem={item as InventoryItem}
      />

      <PromoteToMikrotikDialog
        open={showMikrotikDialog}
        onOpenChange={setShowMikrotikDialog}
        inventoryItem={item as InventoryItem}
      />
    </>
  );
};

export default InventoryItemDetail;
