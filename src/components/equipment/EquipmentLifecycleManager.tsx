
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from '@/components/ui/alert-dialog';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Package, Router, Wifi, HardDrive, Cable, CheckCircle, Clock, AlertTriangle, Plus, Settings, Trash2 } from 'lucide-react';
import { useEquipment } from '@/hooks/useEquipment';
import { useInventoryItems } from '@/hooks/useInventory';
import { useMikrotikRouters } from '@/hooks/useMikrotikRouters';
import { useToast } from '@/hooks/use-toast';

const EquipmentLifecycleManager = () => {
  const { equipment, isLoading: equipmentLoading, approveEquipment, rejectEquipment } = useEquipment();
  const { data: inventoryItems = [], isLoading: inventoryLoading } = useInventoryItems({
    category: 'Network Hardware'
  });
  const { routers, isLoading: routersLoading } = useMikrotikRouters();
  const { toast } = useToast();

  const [showPromoteDialog, setShowPromoteDialog] = useState(false);
  const [selectedInventoryItem, setSelectedInventoryItem] = useState<any>(null);
  const [promotionNotes, setPromotionNotes] = useState('');

  // Combine all equipment data
  const allEquipment = [
    ...equipment,
    ...inventoryItems.filter(item => item.is_network_equipment),
    ...routers.map(router => ({
      id: router.id,
      type: 'MikroTik Router',
      brand: 'MikroTik',
      model: router.name,
      serial_number: router.ip_address,
      status: router.status,
      approval_status: router.status === 'active' ? 'approved' : 'pending',
      created_at: router.created_at,
      notes: `IP: ${router.ip_address}, Interface: ${router.pppoe_interface}`,
      connection_status: router.connection_status
    }))
  ];

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'approved':
      case 'active':
        return <CheckCircle className="h-4 w-4 text-green-600" />;
      case 'pending':
        return <Clock className="h-4 w-4 text-yellow-600" />;
      case 'rejected':
      case 'error':
        return <AlertTriangle className="h-4 w-4 text-red-600" />;
      default:
        return <Clock className="h-4 w-4 text-gray-600" />;
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'approved':
      case 'active':
        return <Badge className="bg-green-100 text-green-800">Approved</Badge>;
      case 'pending':
        return <Badge variant="secondary">Pending</Badge>;
      case 'rejected':
      case 'error':
        return <Badge variant="destructive">Rejected</Badge>;
      default:
        return <Badge variant="outline">Unknown</Badge>;
    }
  };

  const getEquipmentIcon = (type: string) => {
    if (type?.toLowerCase().includes('router') || type?.toLowerCase().includes('mikrotik')) {
      return <Router className="h-6 w-6 text-blue-600" />;
    }
    if (type?.toLowerCase().includes('switch')) {
      return <Package className="h-6 w-6 text-green-600" />;
    }
    if (type?.toLowerCase().includes('access point') || type?.toLowerCase().includes('wifi')) {
      return <Wifi className="h-6 w-6 text-purple-600" />;
    }
    if (type?.toLowerCase().includes('cable')) {
      return <Cable className="h-6 w-6 text-orange-600" />;
    }
    return <HardDrive className="h-6 w-6 text-gray-600" />;
  };

  const handlePromoteToEquipment = (item: any) => {
    setSelectedInventoryItem(item);
    setShowPromoteDialog(true);
  };

  const handleApproveEquipment = async (equipmentId: string) => {
    try {
      await approveEquipment({ id: equipmentId, notes: 'Approved via lifecycle manager' });
      toast({
        title: "Equipment Approved",
        description: "Equipment has been approved and is now active.",
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to approve equipment.",
        variant: "destructive",
      });
    }
  };

  const handleRejectEquipment = async (equipmentId: string, reason: string) => {
    try {
      await rejectEquipment({ id: equipmentId, notes: reason });
      toast({
        title: "Equipment Rejected",
        description: "Equipment has been rejected.",
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to reject equipment.",
        variant: "destructive",
      });
    }
  };

  if (equipmentLoading || inventoryLoading || routersLoading) {
    return (
      <Card>
        <CardContent className="p-6">
          <div className="text-center">Loading equipment data...</div>
        </CardContent>
      </Card>
    );
  }

  const pendingEquipment = allEquipment.filter(item => 
    item.approval_status === 'pending' || item.status === 'pending'
  );
  const approvedEquipment = allEquipment.filter(item => 
    item.approval_status === 'approved' || item.status === 'active'
  );
  const networkEquipment = inventoryItems.filter(item => !item.is_network_equipment);

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Equipment Lifecycle Management</CardTitle>
        </CardHeader>
        <CardContent>
          <Tabs defaultValue="overview" className="space-y-4">
            <TabsList className="grid w-full grid-cols-4">
              <TabsTrigger value="overview">Overview</TabsTrigger>
              <TabsTrigger value="pending">Pending Approval</TabsTrigger>
              <TabsTrigger value="active">Active Equipment</TabsTrigger>
              <TabsTrigger value="inventory">Inventory Items</TabsTrigger>
            </TabsList>

            <TabsContent value="overview" className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <Card>
                  <CardContent className="p-4">
                    <div className="flex items-center gap-2">
                      <Package className="h-8 w-8 text-blue-600" />
                      <div>
                        <div className="text-2xl font-bold">{allEquipment.length}</div>
                        <div className="text-sm text-muted-foreground">Total Equipment</div>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardContent className="p-4">
                    <div className="flex items-center gap-2">
                      <CheckCircle className="h-8 w-8 text-green-600" />
                      <div>
                        <div className="text-2xl font-bold">{approvedEquipment.length}</div>
                        <div className="text-sm text-muted-foreground">Active</div>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardContent className="p-4">
                    <div className="flex items-center gap-2">
                      <Clock className="h-8 w-8 text-yellow-600" />
                      <div>
                        <div className="text-2xl font-bold">{pendingEquipment.length}</div>
                        <div className="text-sm text-muted-foreground">Pending</div>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardContent className="p-4">
                    <div className="flex items-center gap-2">
                      <Router className="h-8 w-8 text-purple-600" />
                      <div>
                        <div className="text-2xl font-bold">{routers.length}</div>
                        <div className="text-sm text-muted-foreground">MikroTik Routers</div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </TabsContent>

            <TabsContent value="pending" className="space-y-4">
              <div className="grid gap-4">
                {pendingEquipment.length === 0 ? (
                  <div className="text-center py-8">
                    <CheckCircle className="h-12 w-12 text-green-500 mx-auto mb-4" />
                    <h3 className="text-lg font-medium">No Pending Equipment</h3>
                    <p className="text-muted-foreground">All equipment has been processed.</p>
                  </div>
                ) : (
                  pendingEquipment.map((item) => (
                    <Card key={item.id}>
                      <CardContent className="p-4">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-3">
                            {getEquipmentIcon(item.type)}
                            <div>
                              <h4 className="font-medium">{item.model || item.name}</h4>
                              <div className="text-sm text-muted-foreground">
                                {item.type} • {item.brand}
                              </div>
                              {item.notes && (
                                <div className="text-xs text-muted-foreground mt-1">
                                  {item.notes}
                                </div>
                              )}
                            </div>
                          </div>
                          <div className="flex items-center gap-2">
                            {getStatusBadge(item.approval_status || item.status)}
                            <Button 
                              size="sm" 
                              onClick={() => handleApproveEquipment(item.id)}
                            >
                              Approve
                            </Button>
                            <AlertDialog>
                              <AlertDialogTrigger asChild>
                                <Button size="sm" variant="destructive">
                                  Reject
                                </Button>
                              </AlertDialogTrigger>
                              <AlertDialogContent>
                                <AlertDialogHeader>
                                  <AlertDialogTitle>Reject Equipment</AlertDialogTitle>
                                  <AlertDialogDescription>
                                    Please provide a reason for rejecting this equipment.
                                  </AlertDialogDescription>
                                </AlertDialogHeader>
                                <AlertDialogFooter>
                                  <AlertDialogCancel>Cancel</AlertDialogCancel>
                                  <AlertDialogAction 
                                    onClick={() => handleRejectEquipment(item.id, 'Rejected via lifecycle manager')}
                                  >
                                    Reject
                                  </AlertDialogAction>
                                </AlertDialogFooter>
                              </AlertDialogContent>
                            </AlertDialog>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  ))
                )}
              </div>
            </TabsContent>

            <TabsContent value="active" className="space-y-4">
              <div className="grid gap-4">
                {approvedEquipment.map((item) => (
                  <Card key={item.id}>
                    <CardContent className="p-4">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          {getEquipmentIcon(item.type)}
                          <div>
                            <h4 className="font-medium">{item.model || item.name}</h4>
                            <div className="text-sm text-muted-foreground">
                              {item.type} • {item.brand}
                            </div>
                            {item.connection_status && (
                              <Badge 
                                variant={item.connection_status === 'online' ? 'default' : 'destructive'}
                                className="mt-1"
                              >
                                {item.connection_status}
                              </Badge>
                            )}
                          </div>
                        </div>
                        <div className="flex items-center gap-2">
                          {getStatusIcon(item.approval_status || item.status)}
                          <span className="text-sm text-green-600">Active</span>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </TabsContent>

            <TabsContent value="inventory" className="space-y-4">
              <div className="grid gap-4">
                {networkEquipment.length === 0 ? (
                  <div className="text-center py-8">
                    <Package className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                    <h3 className="text-lg font-medium">No Network Hardware in Inventory</h3>
                    <p className="text-muted-foreground">
                      Add network hardware to your inventory to promote to equipment.
                    </p>
                  </div>
                ) : (
                  networkEquipment.map((item) => (
                    <Card key={item.id}>
                      <CardContent className="p-4">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-3">
                            {getEquipmentIcon(item.type)}
                            <div>
                              <h4 className="font-medium">{item.name}</h4>
                              <div className="text-sm text-muted-foreground">
                                {item.type} • {item.manufacturer}
                              </div>
                              <div className="text-xs text-muted-foreground">
                                Status: {item.status} • ID: {item.item_id}
                              </div>
                            </div>
                          </div>
                          <div className="flex items-center gap-2">
                            <Badge variant="outline">{item.status}</Badge>
                            <Button 
                              size="sm" 
                              onClick={() => handlePromoteToEquipment(item)}
                            >
                              <Plus className="h-4 w-4 mr-1" />
                              Promote to Equipment
                            </Button>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  ))
                )}
              </div>
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>

      {/* Promote to Equipment Dialog */}
      <Dialog open={showPromoteDialog} onOpenChange={setShowPromoteDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Promote to Network Equipment</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label>Notes</Label>
              <Textarea
                value={promotionNotes}
                onChange={(e) => setPromotionNotes(e.target.value)}
                placeholder="Add any notes about promoting this item to equipment..."
              />
            </div>
            <div className="flex justify-end gap-2">
              <Button variant="outline" onClick={() => setShowPromoteDialog(false)}>
                Cancel
              </Button>
              <Button onClick={() => {
                toast({
                  title: "Feature Coming Soon",
                  description: "Equipment promotion functionality will be available soon.",
                });
                setShowPromoteDialog(false);
              }}>
                Promote
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default EquipmentLifecycleManager;
