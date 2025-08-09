
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Plus, Search, Filter, Package, AlertTriangle, CheckCircle, XCircle } from 'lucide-react';
import { useEquipment } from '@/hooks/useEquipment';
import { useEquipmentTypes } from '@/hooks/useEquipmentTypes';

const EquipmentInventoryManager = () => {
  const { equipment, isLoading, createEquipment, updateEquipment, approveEquipment, rejectEquipment } = useEquipment();
  const { data: equipmentTypes } = useEquipmentTypes();
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [showAddDialog, setShowAddDialog] = useState(false);
  const [newEquipment, setNewEquipment] = useState({
    type: '',
    brand: '',
    model: '',
    serial_number: '',
    mac_address: '',
    status: 'available',
    equipment_type_id: '',
    ip_address: '',
    snmp_community: 'public',
    snmp_version: 2
  });

  const filteredEquipment = equipment.filter(item => {
    const matchesSearch = item.serial_number.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         (item.brand?.toLowerCase().includes(searchTerm.toLowerCase()) || false) ||
                         (item.model?.toLowerCase().includes(searchTerm.toLowerCase()) || false);
    const matchesStatus = statusFilter === 'all' || item.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const groupedByStatus = {
    available: filteredEquipment.filter(e => e.status === 'available'),
    deployed: filteredEquipment.filter(e => e.status === 'active' || e.status === 'deployed'),
    maintenance: filteredEquipment.filter(e => e.status === 'maintenance'),
    pending: filteredEquipment.filter(e => e.approval_status === 'pending')
  };

  const handleAddEquipment = () => {
    createEquipment(newEquipment);
    setNewEquipment({
      type: '',
      brand: '',
      model: '',
      serial_number: '',
      mac_address: '',
      status: 'available',
      equipment_type_id: '',
      ip_address: '',
      snmp_community: 'public',
      snmp_version: 2
    });
    setShowAddDialog(false);
  };

  const getStatusBadge = (status: string, approvalStatus?: string) => {
    if (approvalStatus === 'pending') {
      return <Badge variant="secondary">Pending Approval</Badge>;
    }
    
    switch (status) {
      case 'available':
        return <Badge className="bg-green-100 text-green-800">Available</Badge>;
      case 'active':
      case 'deployed':
        return <Badge className="bg-blue-100 text-blue-800">Deployed</Badge>;
      case 'maintenance':
        return <Badge className="bg-yellow-100 text-yellow-800">Maintenance</Badge>;
      case 'retired':
        return <Badge variant="destructive">Retired</Badge>;
      default:
        return <Badge variant="outline">{status}</Badge>;
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold">Equipment Inventory</h2>
          <p className="text-muted-foreground">Manage physical network equipment and assets</p>
        </div>
        <Dialog open={showAddDialog} onOpenChange={setShowAddDialog}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="h-4 w-4 mr-2" />
              Add Equipment
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle>Add New Equipment</DialogTitle>
            </DialogHeader>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label>Equipment Type</Label>
                <Select value={newEquipment.equipment_type_id} onValueChange={(value) => setNewEquipment({...newEquipment, equipment_type_id: value})}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select type" />
                  </SelectTrigger>
                  <SelectContent>
                    {equipmentTypes?.map((type) => (
                      <SelectItem key={type.id} value={type.id}>{type.name} - {type.brand} {type.model}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label>Device Type</Label>
                <Input
                  value={newEquipment.type}
                  onChange={(e) => setNewEquipment({...newEquipment, type: e.target.value})}
                  placeholder="router, switch, access_point"
                />
              </div>
              <div>
                <Label>Brand</Label>
                <Input
                  value={newEquipment.brand}
                  onChange={(e) => setNewEquipment({...newEquipment, brand: e.target.value})}
                  placeholder="e.g. MikroTik, Cisco, Ubiquiti"
                />
              </div>
              <div>
                <Label>Model</Label>
                <Input
                  value={newEquipment.model}
                  onChange={(e) => setNewEquipment({...newEquipment, model: e.target.value})}
                  placeholder="e.g. RB4011, SG350-28"
                />
              </div>
              <div>
                <Label>Serial Number</Label>
                <Input
                  value={newEquipment.serial_number}
                  onChange={(e) => setNewEquipment({...newEquipment, serial_number: e.target.value})}
                  placeholder="Unique serial number"
                />
              </div>
              <div>
                <Label>MAC Address</Label>
                <Input
                  value={newEquipment.mac_address}
                  onChange={(e) => setNewEquipment({...newEquipment, mac_address: e.target.value})}
                  placeholder="XX:XX:XX:XX:XX:XX"
                />
              </div>
              <div>
                <Label>IP Address</Label>
                <Input
                  value={newEquipment.ip_address}
                  onChange={(e) => setNewEquipment({...newEquipment, ip_address: e.target.value})}
                  placeholder="192.168.1.1"
                />
              </div>
              <div>
                <Label>SNMP Community</Label>
                <Input
                  value={newEquipment.snmp_community}
                  onChange={(e) => setNewEquipment({...newEquipment, snmp_community: e.target.value})}
                  placeholder="public"
                />
              </div>
              <div className="col-span-2 flex justify-end gap-2 pt-4">
                <Button variant="outline" onClick={() => setShowAddDialog(false)}>Cancel</Button>
                <Button onClick={handleAddEquipment}>Add Equipment</Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      {/* Search and Filters */}
      <Card>
        <CardContent className="p-4">
          <div className="flex items-center gap-4">
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search by serial number, brand, or model..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>
            <div className="flex items-center gap-2">
              <Filter className="h-4 w-4" />
              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger className="w-40">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Status</SelectItem>
                  <SelectItem value="available">Available</SelectItem>
                  <SelectItem value="active">Active</SelectItem>
                  <SelectItem value="maintenance">Maintenance</SelectItem>
                  <SelectItem value="retired">Retired</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Inventory Overview */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Available</CardTitle>
            <Package className="h-4 w-4 text-green-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">{groupedByStatus.available.length}</div>
            <p className="text-xs text-muted-foreground">Ready for deployment</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Deployed</CardTitle>
            <CheckCircle className="h-4 w-4 text-blue-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-blue-600">{groupedByStatus.deployed.length}</div>
            <p className="text-xs text-muted-foreground">In active use</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Maintenance</CardTitle>
            <AlertTriangle className="h-4 w-4 text-yellow-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-yellow-600">{groupedByStatus.maintenance.length}</div>
            <p className="text-xs text-muted-foreground">Under maintenance</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Pending</CardTitle>
            <XCircle className="h-4 w-4 text-gray-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-gray-600">{groupedByStatus.pending.length}</div>
            <p className="text-xs text-muted-foreground">Awaiting approval</p>
          </CardContent>
        </Card>
      </div>

      {/* Equipment List */}
      <Tabs defaultValue="all" className="space-y-4">
        <TabsList>
          <TabsTrigger value="all">All Equipment ({filteredEquipment.length})</TabsTrigger>
          <TabsTrigger value="available">Available ({groupedByStatus.available.length})</TabsTrigger>
          <TabsTrigger value="deployed">Deployed ({groupedByStatus.deployed.length})</TabsTrigger>
          <TabsTrigger value="pending">Pending ({groupedByStatus.pending.length})</TabsTrigger>
        </TabsList>

        <TabsContent value="all">
          <Card>
            <CardHeader>
              <CardTitle>Equipment Inventory</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {filteredEquipment.map((item) => (
                  <div key={item.id} className="flex items-center justify-between p-4 border rounded-lg">
                    <div className="flex items-center gap-4">
                      <Package className="h-8 w-8 text-blue-600" />
                      <div>
                        <h4 className="font-medium">{item.brand} {item.model}</h4>
                        <p className="text-sm text-muted-foreground">
                          {item.type} • S/N: {item.serial_number}
                        </p>
                        {item.ip_address && (
                          <p className="text-sm text-muted-foreground">IP: {item.ip_address}</p>
                        )}
                      </div>
                    </div>
                    <div className="flex items-center gap-3">
                      {getStatusBadge(item.status, item.approval_status || undefined)}
                      {item.approval_status === 'pending' && (
                        <div className="flex gap-1">
                          <Button size="sm" onClick={() => approveEquipment({ id: item.id })}>
                            <CheckCircle className="h-4 w-4" />
                          </Button>
                          <Button size="sm" variant="destructive" onClick={() => rejectEquipment({ id: item.id, notes: 'Rejected from inventory' })}>
                            <XCircle className="h-4 w-4" />
                          </Button>
                        </div>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="available">
          <Card>
            <CardHeader>
              <CardTitle>Available Equipment</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {groupedByStatus.available.map((item) => (
                  <div key={item.id} className="flex items-center justify-between p-4 border border-green-200 rounded-lg">
                    <div className="flex items-center gap-4">
                      <Package className="h-8 w-8 text-green-600" />
                      <div>
                        <h4 className="font-medium">{item.brand} {item.model}</h4>
                        <p className="text-sm text-muted-foreground">
                          {item.type} • S/N: {item.serial_number}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <Badge className="bg-green-100 text-green-800">Ready</Badge>
                      <Button size="sm" variant="outline">Deploy</Button>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="deployed">
          <Card>
            <CardHeader>
              <CardTitle>Deployed Equipment</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {groupedByStatus.deployed.map((item) => (
                  <div key={item.id} className="flex items-center justify-between p-4 border border-blue-200 rounded-lg">
                    <div className="flex items-center gap-4">
                      <Package className="h-8 w-8 text-blue-600" />
                      <div>
                        <h4 className="font-medium">{item.brand} {item.model}</h4>
                        <p className="text-sm text-muted-foreground">
                          {item.type} • S/N: {item.serial_number}
                        </p>
                        {item.clients?.name && (
                          <p className="text-sm font-medium">Assigned to: {item.clients.name}</p>
                        )}
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <Badge className="bg-blue-100 text-blue-800">Active</Badge>
                      <Button size="sm" variant="outline">Monitor</Button>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="pending">
          <Card>
            <CardHeader>
              <CardTitle>Pending Approval</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {groupedByStatus.pending.map((item) => (
                  <div key={item.id} className="flex items-center justify-between p-4 border border-yellow-200 rounded-lg">
                    <div className="flex items-center gap-4">
                      <Package className="h-8 w-8 text-yellow-600" />
                      <div>
                        <h4 className="font-medium">{item.brand} {item.model}</h4>
                        <p className="text-sm text-muted-foreground">
                          {item.type} • S/N: {item.serial_number}
                        </p>
                        <p className="text-sm text-muted-foreground">
                          Added: {new Date(item.created_at).toLocaleDateString()}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <Badge variant="secondary">Pending</Badge>
                      <Button size="sm" onClick={() => approveEquipment({ id: item.id })}>
                        <CheckCircle className="h-4 w-4 mr-1" />
                        Approve
                      </Button>
                      <Button size="sm" variant="destructive" onClick={() => rejectEquipment({ id: item.id, notes: 'Equipment rejected' })}>
                        <XCircle className="h-4 w-4 mr-1" />
                        Reject
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default EquipmentInventoryManager;
