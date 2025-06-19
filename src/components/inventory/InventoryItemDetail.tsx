
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { 
  Package, 
  MapPin, 
  Calendar, 
  DollarSign, 
  Settings, 
  User,
  Edit,
  Trash2,
  ExternalLink,
  Wrench,
  Network
} from 'lucide-react';
import { InventoryItem } from '@/hooks/useInventory';
import { format } from 'date-fns';

interface InventoryItemDetailProps {
  item: InventoryItem;
  onEdit: () => void;
  onDelete: () => void;
  onAssignToClient: () => void;
  onPromoteToEquipment: () => void;
}

const InventoryItemDetail: React.FC<InventoryItemDetailProps> = ({
  item,
  onEdit,
  onDelete,
  onAssignToClient,
  onPromoteToEquipment
}) => {
  const getStatusColor = (status: string) => {
    switch (status.toLowerCase()) {
      case 'in stock':
      case 'available':
        return 'bg-green-100 text-green-800';
      case 'deployed':
      case 'assigned':
        return 'bg-blue-100 text-blue-800';
      case 'maintenance':
        return 'bg-yellow-100 text-yellow-800';
      case 'damaged':
      case 'faulty':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const formatCurrency = (amount: number | null) => {
    if (!amount) return 'N/A';
    return new Intl.NumberFormat('en-KE', {
      style: 'currency',
      currency: 'KES'
    }).format(amount);
  };

  const formatDate = (dateString: string | null) => {
    if (!dateString) return 'N/A';
    return format(new Date(dateString), 'MMM dd, yyyy');
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-start justify-between">
        <div>
          <h2 className="text-2xl font-bold">{item.name || item.model || 'Unnamed Item'}</h2>
          <p className="text-muted-foreground">Item ID: {item.item_id}</p>
          <div className="flex items-center gap-2 mt-2">
            <Badge className={getStatusColor(item.status)}>
              {item.status}
            </Badge>
            {item.is_network_equipment && (
              <Badge variant="outline" className="bg-purple-50 text-purple-700">
                <Network className="h-3 w-3 mr-1" />
                Network Equipment
              </Badge>
            )}
          </div>
        </div>
        
        <div className="flex gap-2">
          <Button variant="outline" size="sm" onClick={onEdit}>
            <Edit className="h-4 w-4 mr-2" />
            Edit
          </Button>
          {!item.assigned_customer_id && (
            <Button variant="outline" size="sm" onClick={onAssignToClient}>
              <User className="h-4 w-4 mr-2" />
              Assign to Client
            </Button>
          )}
          {!item.is_network_equipment && item.category === 'Network Hardware' && (
            <Button variant="outline" size="sm" onClick={onPromoteToEquipment}>
              <Network className="h-4 w-4 mr-2" />
              Promote to Equipment
            </Button>
          )}
          <Button variant="destructive" size="sm" onClick={onDelete}>
            <Trash2 className="h-4 w-4 mr-2" />
            Delete
          </Button>
        </div>
      </div>

      <Separator />

      {/* Basic Information */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Package className="h-5 w-5" />
            Basic Information
          </CardTitle>
        </CardHeader>
        <CardContent className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="text-sm font-medium text-gray-700">Category</label>
            <p className="text-sm text-gray-900">{item.category}</p>
          </div>
          <div>
            <label className="text-sm font-medium text-gray-700">Type</label>
            <p className="text-sm text-gray-900">{item.type}</p>
          </div>
          <div>
            <label className="text-sm font-medium text-gray-700">Manufacturer</label>
            <p className="text-sm text-gray-900">{item.manufacturer || 'N/A'}</p>
          </div>
          <div>
            <label className="text-sm font-medium text-gray-700">Model</label>
            <p className="text-sm text-gray-900">{item.model || 'N/A'}</p>
          </div>
          <div>
            <label className="text-sm font-medium text-gray-700">Serial Number</label>
            <p className="text-sm text-gray-900 font-mono">{item.serial_number || 'N/A'}</p>
          </div>
          {item.mac_address && (
            <div>
              <label className="text-sm font-medium text-gray-700">MAC Address</label>
              <p className="text-sm text-gray-900 font-mono">{item.mac_address}</p>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Location & Assignment */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <MapPin className="h-5 w-5" />
            Location & Assignment
          </CardTitle>
        </CardHeader>
        <CardContent className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="text-sm font-medium text-gray-700">Location</label>
            <p className="text-sm text-gray-900">{item.location || 'Warehouse'}</p>
          </div>
          {item.assigned_customer_id && item.clients && (
            <div>
              <label className="text-sm font-medium text-gray-700">Assigned to</label>
              <p className="text-sm text-gray-900">{item.clients.name}</p>
              <p className="text-xs text-gray-600">{item.clients.phone}</p>
            </div>
          )}
          {item.assignment_date && (
            <div>
              <label className="text-sm font-medium text-gray-700">Assignment Date</label>
              <p className="text-sm text-gray-900">{formatDate(item.assignment_date)}</p>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Financial Information */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <DollarSign className="h-5 w-5" />
            Financial Information
          </CardTitle>
        </CardHeader>
        <CardContent className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="text-sm font-medium text-gray-700">Purchase Cost</label>
            <p className="text-sm text-gray-900">{formatCurrency(item.cost)}</p>
          </div>
          <div>
            <label className="text-sm font-medium text-gray-700">Unit Cost</label>
            <p className="text-sm text-gray-900">{formatCurrency(item.unit_cost)}</p>
          </div>
          <div>
            <label className="text-sm font-medium text-gray-700">Supplier</label>
            <p className="text-sm text-gray-900">{item.supplier || 'N/A'}</p>
          </div>
          <div>
            <label className="text-sm font-medium text-gray-700">SKU</label>
            <p className="text-sm text-gray-900">{item.item_sku || 'N/A'}</p>
          </div>
        </CardContent>
      </Card>

      {/* Maintenance & Dates */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Calendar className="h-5 w-5" />
            Important Dates
          </CardTitle>
        </CardHeader>
        <CardContent className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="text-sm font-medium text-gray-700">Purchase Date</label>
            <p className="text-sm text-gray-900">{formatDate(item.purchase_date)}</p>
          </div>
          <div>
            <label className="text-sm font-medium text-gray-700">Warranty Expiry</label>
            <p className="text-sm text-gray-900">{formatDate(item.warranty_expiry_date)}</p>
          </div>
          <div>
            <label className="text-sm font-medium text-gray-700">Installation Date</label>
            <p className="text-sm text-gray-900">{formatDate(item.installation_date)}</p>
          </div>
          <div>
            <label className="text-sm font-medium text-gray-700">Last Maintenance</label>
            <p className="text-sm text-gray-900">{formatDate(item.last_maintenance_date)}</p>
          </div>
        </CardContent>
      </Card>

      {/* Network Information (if applicable) */}
      {(item.ip_address || item.subnet_mask || item.capacity) && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Network className="h-5 w-5" />
              Network Configuration
            </CardTitle>
          </CardHeader>
          <CardContent className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {item.ip_address && (
              <div>
                <label className="text-sm font-medium text-gray-700">IP Address</label>
                <p className="text-sm text-gray-900 font-mono">{item.ip_address}</p>
              </div>
            )}
            {item.subnet_mask && (
              <div>
                <label className="text-sm font-medium text-gray-700">Subnet Mask</label>
                <p className="text-sm text-gray-900 font-mono">{item.subnet_mask}</p>
              </div>
            )}
            {item.capacity && (
              <div>
                <label className="text-sm font-medium text-gray-700">Capacity</label>
                <p className="text-sm text-gray-900">{item.capacity}</p>
              </div>
            )}
          </CardContent>
        </Card>
      )}

      {/* Stock Information */}
      {(item.quantity_in_stock !== null || item.reorder_level !== null) && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Package className="h-5 w-5" />
              Stock Information
            </CardTitle>
          </CardHeader>
          <CardContent className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="text-sm font-medium text-gray-700">Quantity in Stock</label>
              <p className="text-sm text-gray-900">{item.quantity_in_stock || 0}</p>
            </div>
            <div>
              <label className="text-sm font-medium text-gray-700">Reorder Level</label>
              <p className="text-sm text-gray-900">{item.reorder_level || 'Not Set'}</p>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Notes */}
      {item.notes && (
        <Card>
          <CardHeader>
            <CardTitle>Notes</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-gray-900 whitespace-pre-wrap">{item.notes}</p>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default InventoryItemDetail;
