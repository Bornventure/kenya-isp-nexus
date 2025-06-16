
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { ArrowLeft, Edit, Calendar, MapPin, DollarSign, Package } from 'lucide-react';
import { useInventoryItem, useInventoryHistory } from '@/hooks/useInventory';
import { format } from 'date-fns';
import EditInventoryItemDialog from './EditInventoryItemDialog';
import { useState } from 'react';

interface InventoryItemDetailProps {
  itemId: string;
  onBack: () => void;
}

const InventoryItemDetail: React.FC<InventoryItemDetailProps> = ({
  itemId,
  onBack,
}) => {
  const [showEditDialog, setShowEditDialog] = useState(false);
  const { data: item, isLoading } = useInventoryItem(itemId);
  const { data: history } = useInventoryHistory(itemId);

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'In Stock':
      case 'Available':
        return 'default';
      case 'Deployed':
      case 'Live/Deployed':
      case 'Active':
        return 'default';
      case 'Maintenance':
      case 'In Repair':
      case 'Under Construction':
        return 'secondary';
      case 'Faulty':
      case 'Retired':
      case 'Decommissioned':
        return 'destructive';
      case 'Provisioning':
      case 'Reserved':
        return 'secondary';
      default:
        return 'outline';
    }
  };

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div className="animate-pulse">
          <div className="h-8 bg-gray-200 rounded mb-4"></div>
          <div className="h-64 bg-gray-200 rounded"></div>
        </div>
      </div>
    );
  }

  if (!item) {
    return (
      <div className="text-center py-8">
        <p className="text-muted-foreground">Item not found</p>
        <Button onClick={onBack} className="mt-4">
          <ArrowLeft className="h-4 w-4 mr-2" />
          Go Back
        </Button>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Button variant="outline" onClick={onBack}>
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back
          </Button>
          <div>
            <h1 className="text-2xl font-bold">{item.item_id}</h1>
            <p className="text-muted-foreground">
              {item.category} • {item.type}
            </p>
          </div>
        </div>
        <Button onClick={() => setShowEditDialog(true)}>
          <Edit className="h-4 w-4 mr-2" />
          Edit Item
        </Button>
      </div>

      {/* Item Details */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Package className="h-5 w-5" />
              Basic Information
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Status</p>
                <Badge variant={getStatusColor(item.status)}>{item.status}</Badge>
              </div>
              <div>
                <p className="text-sm font-medium text-muted-foreground">Category</p>
                <p>{item.category}</p>
              </div>
              <div>
                <p className="text-sm font-medium text-muted-foreground">Type</p>
                <p>{item.type}</p>
              </div>
              <div>
                <p className="text-sm font-medium text-muted-foreground">Name</p>
                <p>{item.name || '-'}</p>
              </div>
              <div>
                <p className="text-sm font-medium text-muted-foreground">Manufacturer</p>
                <p>{item.manufacturer || '-'}</p>
              </div>
              <div>
                <p className="text-sm font-medium text-muted-foreground">Model</p>
                <p>{item.model || '-'}</p>
              </div>
              <div>
                <p className="text-sm font-medium text-muted-foreground">Serial Number</p>
                <p className="font-mono text-sm">{item.serial_number || '-'}</p>
              </div>
              <div>
                <p className="text-sm font-medium text-muted-foreground">MAC Address</p>
                <p className="font-mono text-sm">{item.mac_address || '-'}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <DollarSign className="h-5 w-5" />
              Financial & Supplier
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Cost</p>
                <p>{item.cost ? `$${item.cost.toFixed(2)}` : '-'}</p>
              </div>
              <div>
                <p className="text-sm font-medium text-muted-foreground">Supplier</p>
                <p>{item.supplier || '-'}</p>
              </div>
              <div>
                <p className="text-sm font-medium text-muted-foreground">Purchase Date</p>
                <p>{item.purchase_date ? format(new Date(item.purchase_date), 'PPP') : '-'}</p>
              </div>
              <div>
                <p className="text-sm font-medium text-muted-foreground">Warranty Expiry</p>
                <p>{item.warranty_expiry_date ? format(new Date(item.warranty_expiry_date), 'PPP') : '-'}</p>
              </div>
            </div>
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
          <CardContent className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Location</p>
                <p>{item.location || '-'}</p>
              </div>
              <div>
                <p className="text-sm font-medium text-muted-foreground">Assigned Customer</p>
                <p>{item.clients?.name || 'Unassigned'}</p>
              </div>
              <div>
                <p className="text-sm font-medium text-muted-foreground">Assignment Date</p>
                <p>{item.assignment_date ? format(new Date(item.assignment_date), 'PPP') : '-'}</p>
              </div>
              <div>
                <p className="text-sm font-medium text-muted-foreground">Created</p>
                <p>{format(new Date(item.created_at), 'PPP')}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Category-specific fields */}
        {(item.category === 'Consumable' || item.category === 'Infrastructure' || item.category === 'Logical Resource') && (
          <Card>
            <CardHeader>
              <CardTitle>Category-Specific Details</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                {item.category === 'Consumable' && (
                  <>
                    <div>
                      <p className="text-sm font-medium text-muted-foreground">SKU</p>
                      <p>{item.item_sku || '-'}</p>
                    </div>
                    <div>
                      <p className="text-sm font-medium text-muted-foreground">Quantity in Stock</p>
                      <p>{item.quantity_in_stock || '-'}</p>
                    </div>
                    <div>
                      <p className="text-sm font-medium text-muted-foreground">Reorder Level</p>
                      <p>{item.reorder_level || '-'}</p>
                    </div>
                    <div>
                      <p className="text-sm font-medium text-muted-foreground">Unit Cost</p>
                      <p>{item.unit_cost ? `$${item.unit_cost.toFixed(2)}` : '-'}</p>
                    </div>
                  </>
                )}
                {item.category === 'Infrastructure' && (
                  <>
                    <div>
                      <p className="text-sm font-medium text-muted-foreground">Capacity</p>
                      <p>{item.capacity || '-'}</p>
                    </div>
                    <div>
                      <p className="text-sm font-medium text-muted-foreground">Installation Date</p>
                      <p>{item.installation_date ? format(new Date(item.installation_date), 'PPP') : '-'}</p>
                    </div>
                    <div>
                      <p className="text-sm font-medium text-muted-foreground">Last Maintenance</p>
                      <p>{item.last_maintenance_date ? format(new Date(item.last_maintenance_date), 'PPP') : '-'}</p>
                    </div>
                  </>
                )}
                {item.category === 'Logical Resource' && (
                  <>
                    <div>
                      <p className="text-sm font-medium text-muted-foreground">IP Address</p>
                      <p className="font-mono text-sm">{item.ip_address || '-'}</p>
                    </div>
                    <div>
                      <p className="text-sm font-medium text-muted-foreground">Subnet Mask</p>
                      <p className="font-mono text-sm">{item.subnet_mask || '-'}</p>
                    </div>
                  </>
                )}
              </div>
            </CardContent>
          </Card>
        )}
      </div>

      {/* Notes */}
      {item.notes && (
        <Card>
          <CardHeader>
            <CardTitle>Notes</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="whitespace-pre-wrap">{item.notes}</p>
          </CardContent>
        </Card>
      )}

      {/* History Log */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Calendar className="h-5 w-5" />
            History Log
          </CardTitle>
        </CardHeader>
        <CardContent>
          {history && history.length > 0 ? (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Timestamp</TableHead>
                  <TableHead>User</TableHead>
                  <TableHead>Action</TableHead>
                  <TableHead>Details</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {history.map((entry) => (
                  <TableRow key={entry.id}>
                    <TableCell className="text-sm">
                      {format(new Date(entry.created_at), 'PPp')}
                    </TableCell>
                    <TableCell>
                      {entry.profiles ? 
                        `${entry.profiles.first_name} ${entry.profiles.last_name}` : 
                        'System'
                      }
                    </TableCell>
                    <TableCell>
                      <Badge variant="outline">{entry.action}</Badge>
                    </TableCell>
                    <TableCell className="text-sm">{entry.details}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          ) : (
            <p className="text-muted-foreground text-center py-4">
              No history available for this item.
            </p>
          )}
        </CardContent>
      </Card>

      <EditInventoryItemDialog
        open={showEditDialog}
        onOpenChange={setShowEditDialog}
        itemId={itemId}
      />
    </div>
  );
};

export default InventoryItemDetail;
