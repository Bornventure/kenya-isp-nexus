
import React, { useState } from 'react';
import { useEquipment } from '@/hooks/useEquipment';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Plus, Search, Eye, Edit, Trash2, CheckCircle, XCircle, Router, Cpu, Wifi } from 'lucide-react';
import { Equipment as EquipmentType } from '@/types/equipment';
import { useToast } from '@/hooks/use-toast';
import AddEquipmentDialog from '@/components/equipment/AddEquipmentDialog';
import EditEquipmentDialog from '@/components/equipment/EditEquipmentDialog';
import EquipmentDetailsDialog from '@/components/equipment/EquipmentDetailsDialog';

const Equipment = () => {
  const { 
    equipment, 
    isLoading, 
    error, 
    createEquipment, 
    updateEquipment, 
    deleteEquipment,
    approveEquipment,
    rejectEquipment,
    isCreating,
    isUpdating,
    isDeleting
  } = useEquipment();
  const { toast } = useToast();
  
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedEquipment, setSelectedEquipment] = useState<EquipmentType | null>(null);
  const [detailsOpen, setDetailsOpen] = useState(false);
  const [addOpen, setAddOpen] = useState(false);
  const [editOpen, setEditOpen] = useState(false);
  const [equipmentToEdit, setEquipmentToEdit] = useState<EquipmentType | null>(null);

  // Filter equipment based on search term
  const filteredEquipment = equipment.filter(item =>
    item.model?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    item.serial_number?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    item.type?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    item.brand?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  // Statistics
  const totalEquipment = equipment.length;
  const availableEquipment = equipment.filter(e => e.status === 'available').length;
  const deployedEquipment = equipment.filter(e => e.status === 'deployed').length;
  const maintenanceEquipment = equipment.filter(e => e.status === 'maintenance').length;

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'available':
        return 'default';
      case 'deployed':
        return 'default';
      case 'maintenance':
        return 'secondary';
      case 'damaged':
        return 'destructive';
      default:
        return 'secondary';
    }
  };

  const getApprovalStatusColor = (status: string) => {
    switch (status) {
      case 'approved':
        return 'default';
      case 'pending':
        return 'secondary';
      case 'rejected':
        return 'destructive';
      default:
        return 'secondary';
    }
  };

  const getEquipmentIcon = (type: string) => {
    switch (type?.toLowerCase()) {
      case 'router':
        return <Router className="h-4 w-4" />;
      case 'switch':
        return <Cpu className="h-4 w-4" />;
      case 'access point':
        return <Wifi className="h-4 w-4" />;
      default:
        return <Router className="h-4 w-4" />;
    }
  };

  const handleViewDetails = (equipment: EquipmentType) => {
    setSelectedEquipment(equipment);
    setDetailsOpen(true);
  };

  const handleEdit = (equipment: EquipmentType) => {
    setEquipmentToEdit(equipment);
    setEditOpen(true);
  };

  const handleDelete = async (equipmentId: string, equipmentModel: string) => {
    if (window.confirm(`Are you sure you want to delete equipment "${equipmentModel}"? This action cannot be undone.`)) {
      try {
        await deleteEquipment(equipmentId);
        toast({
          title: "Equipment Deleted",
          description: `${equipmentModel} has been deleted successfully.`,
        });
      } catch (error) {
        toast({
          title: "Error",
          description: "Failed to delete equipment. Please try again.",
          variant: "destructive",
        });
      }
    }
  };

  const handleApprove = async (equipmentId: string) => {
    try {
      await approveEquipment({ id: equipmentId });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to approve equipment. Please try again.",
        variant: "destructive",
      });
    }
  };

  const handleReject = async (equipmentId: string) => {
    const reason = window.prompt("Please provide a reason for rejection:");
    if (reason) {
      try {
        await rejectEquipment({ id: equipmentId, notes: reason });
      } catch (error) {
        toast({
          title: "Error",
          description: "Failed to reject equipment. Please try again.",
          variant: "destructive",
        });
      }
    }
  };

  if (isLoading) {
    return <div className="flex justify-center p-8">Loading equipment...</div>;
  }

  if (error) {
    return <div className="text-red-500 p-8">Error loading equipment: {error.message}</div>;
  }

  return (
    <div className="space-y-6">
      {/* Statistics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Equipment</CardTitle>
            <Router className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totalEquipment}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Available</CardTitle>
            <CheckCircle className="h-4 w-4 text-green-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">{availableEquipment}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Deployed</CardTitle>
            <Wifi className="h-4 w-4 text-blue-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-blue-600">{deployedEquipment}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Maintenance</CardTitle>
            <XCircle className="h-4 w-4 text-yellow-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-yellow-600">{maintenanceEquipment}</div>
          </CardContent>
        </Card>
      </div>

      {/* Search and Actions */}
      <div className="flex justify-between items-center">
        <div className="relative w-64">
          <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search equipment..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-8"
          />
        </div>
        
        <Button onClick={() => setAddOpen(true)} className="gap-2">
          <Plus className="h-4 w-4" />
          Add Equipment
        </Button>
      </div>

      {/* Equipment Table */}
      <Card>
        <CardHeader>
          <CardTitle>Equipment Inventory</CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Type</TableHead>
                <TableHead>Brand/Model</TableHead>
                <TableHead>Serial Number</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Approval</TableHead>
                <TableHead>Location</TableHead>
                <TableHead>Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredEquipment.map((item) => (
                <TableRow key={item.id}>
                  <TableCell>
                    <div className="flex items-center gap-2">
                      {getEquipmentIcon(item.type)}
                      {item.type}
                    </div>
                  </TableCell>
                  <TableCell>
                    <div>
                      <div className="font-medium">{item.brand}</div>
                      <div className="text-sm text-muted-foreground">{item.model}</div>
                    </div>
                  </TableCell>
                  <TableCell className="font-mono text-sm">{item.serial_number}</TableCell>
                  <TableCell>
                    <Badge variant={getStatusColor(item.status)}>
                      {item.status}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <Badge variant={getApprovalStatusColor(item.approval_status)}>
                      {item.approval_status}
                    </Badge>
                  </TableCell>
                  <TableCell>{item.location || 'N/A'}</TableCell>
                  <TableCell>
                    <div className="flex gap-1">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleViewDetails(item)}
                        title="View Details"
                      >
                        <Eye className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleEdit(item)}
                        title="Edit Equipment"
                      >
                        <Edit className="h-4 w-4" />
                      </Button>
                      {item.approval_status === 'pending' && (
                        <>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleApprove(item.id)}
                            title="Approve"
                            className="text-green-600 hover:text-green-700"
                          >
                            <CheckCircle className="h-4 w-4" />
                          </Button>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleReject(item.id)}
                            title="Reject"
                            className="text-red-600 hover:text-red-700"
                          >
                            <XCircle className="h-4 w-4" />
                          </Button>
                        </>
                      )}
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleDelete(item.id, item.model || 'Unknown')}
                        title="Delete Equipment"
                        className="text-red-600 hover:text-red-700"
                        disabled={isDeleting}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {/* Add Equipment Dialog */}
      <AddEquipmentDialog
        open={addOpen}
        onOpenChange={setAddOpen}
        onSubmit={(data) => {
          createEquipment(data);
          setAddOpen(false);
        }}
        isLoading={isCreating}
      />

      {/* Edit Equipment Dialog */}
      <EditEquipmentDialog
        open={editOpen}
        onOpenChange={setEditOpen}
        equipment={equipmentToEdit}
        onSubmit={(id, data) => {
          updateEquipment({ id, updates: data });
          setEditOpen(false);
          setEquipmentToEdit(null);
        }}
        isLoading={isUpdating}
      />

      {/* Equipment Details Dialog */}
      <EquipmentDetailsDialog
        open={detailsOpen}
        onOpenChange={setDetailsOpen}
        equipment={selectedEquipment}
      />
    </div>
  );
};

export default Equipment;
