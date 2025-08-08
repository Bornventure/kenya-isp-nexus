
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from '@/components/ui/alert-dialog';
import { useEquipment, Equipment } from '@/hooks/useEquipment';
import { Trash2, Edit, CheckCircle, XCircle, Clock, Plus } from 'lucide-react';
import AddEquipmentDialog from './AddEquipmentDialog';

const EquipmentActions = () => {
  const { equipment, isLoading, updateEquipment, approveEquipment, rejectEquipment } = useEquipment();
  const [selectedEquipment, setSelectedEquipment] = useState<Equipment | null>(null);
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);

  const handleDelete = async (equipmentId: string) => {
    try {
      await updateEquipment({
        id: equipmentId,
        updates: {
          status: 'decommissioned'
        }
      });
    } catch (error) {
      console.error('Error deleting equipment:', error);
    }
  };

  const handleApprove = (equipment: Equipment) => {
    approveEquipment({
      id: equipment.id,
      notes: 'Approved for network use'
    });
  };

  const handleReject = (equipment: Equipment) => {
    rejectEquipment({
      id: equipment.id,
      notes: 'Rejected - does not meet requirements'
    });
  };

  const getStatusBadge = (equipment: Equipment) => {
    const status = equipment.approval_status || equipment.status;
    
    if (status === 'approved' || status === 'active') {
      return <Badge className="bg-green-100 text-green-800">Active</Badge>;
    }
    if (status === 'pending') {
      return <Badge className="bg-yellow-100 text-yellow-800">Pending</Badge>;
    }
    if (status === 'rejected' || status === 'inactive') {
      return <Badge className="bg-red-100 text-red-800">Inactive</Badge>;
    }
    return <Badge className="bg-gray-100 text-gray-800">Unknown</Badge>;
  };

  if (isLoading) {
    return <div className="p-6">Loading equipment...</div>;
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold">Equipment Management</h2>
          <p className="text-muted-foreground">
            Manage network equipment, approve new additions, and configure SNMP settings
          </p>
        </div>
        <Button onClick={() => setIsAddDialogOpen(true)}>
          <Plus className="h-4 w-4 mr-2" />
          Add Equipment
        </Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {equipment.map((item) => (
          <Card key={item.id}>
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <CardTitle className="text-lg">{item.type}</CardTitle>
                {getStatusBadge(item)}
              </div>
              <div className="text-sm text-muted-foreground">
                {item.brand} {item.model}
              </div>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="text-sm">
                <p><strong>Serial:</strong> {item.serial_number}</p>
                {item.ip_address && (
                  <p><strong>IP:</strong> {item.ip_address}</p>
                )}
                {item.mac_address && (
                  <p><strong>MAC:</strong> {item.mac_address}</p>
                )}
                <p><strong>Status:</strong> {item.status}</p>
              </div>

              <div className="flex gap-2 flex-wrap">
                {item.approval_status === 'pending' && (
                  <>
                    <Button
                      size="sm"
                      onClick={() => handleApprove(item)}
                      className="bg-green-600 hover:bg-green-700"
                    >
                      <CheckCircle className="h-3 w-3 mr-1" />
                      Approve
                    </Button>
                    <Button
                      size="sm"
                      variant="destructive"
                      onClick={() => handleReject(item)}
                    >
                      <XCircle className="h-3 w-3 mr-1" />
                      Reject
                    </Button>
                  </>
                )}
                
                <AlertDialog>
                  <AlertDialogTrigger asChild>
                    <Button size="sm" variant="destructive">
                      <Trash2 className="h-3 w-3 mr-1" />
                      Delete
                    </Button>
                  </AlertDialogTrigger>
                  <AlertDialogContent>
                    <AlertDialogHeader>
                      <AlertDialogTitle>Delete Equipment</AlertDialogTitle>
                      <AlertDialogDescription>
                        Are you sure you want to delete this equipment? This will mark it as decommissioned.
                      </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                      <AlertDialogCancel>Cancel</AlertDialogCancel>
                      <AlertDialogAction onClick={() => handleDelete(item.id)}>
                        Delete
                      </AlertDialogAction>
                    </AlertDialogFooter>
                  </AlertDialogContent>
                </AlertDialog>
              </div>
            </CardContent>
          </Card>
        ))}

        {equipment.length === 0 && (
          <div className="col-span-full text-center py-12">
            <h3 className="text-lg font-medium text-gray-900 mb-2">No Equipment Found</h3>
            <p className="text-gray-500 mb-4">
              Add your first piece of network equipment to get started.
            </p>
            <Button onClick={() => setIsAddDialogOpen(true)}>
              <Plus className="h-4 w-4 mr-2" />
              Add Equipment
            </Button>
          </div>
        )}
      </div>

      <AddEquipmentDialog
        open={isAddDialogOpen}
        onOpenChange={setIsAddDialogOpen}
      />
    </div>
  );
};

export default EquipmentActions;
