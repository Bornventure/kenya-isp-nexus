
import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { 
  Search, 
  Plus, 
  Filter, 
  Download, 
  Router, 
  Smartphone, 
  Monitor,
  Edit,
  Trash2,
  MapPin,
  Calendar,
  Package
} from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/hooks/use-toast';

interface Equipment {
  id: string;
  model: string;
  serial_number: string;
  mac_address?: string;
  equipment_type: 'router' | 'modem' | 'switch' | 'access_point' | 'ont' | 'cable' | 'other';
  status: 'available' | 'assigned' | 'maintenance' | 'damaged';
  purchase_date?: string;
  warranty_expiry?: string;
  location?: string;
  notes?: string;
  isp_company_id: string;
  created_at: string;
  updated_at: string;
  equipment_assignments?: Array<{
    client: {
      id: string;
      name: string;
      phone: string;
    };
    assigned_at: string;
  }>;
}

const EquipmentPage = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [typeFilter, setTypeFilter] = useState<string>('all');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [showAddDialog, setShowAddDialog] = useState(false);
  const [editingEquipment, setEditingEquipment] = useState<Equipment | null>(null);
  
  const { profile } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();

  // Form state
  const [formData, setFormData] = useState({
    model: '',
    serial_number: '',
    mac_address: '',
    equipment_type: 'router' as Equipment['equipment_type'],
    status: 'available' as Equipment['status'],
    purchase_date: '',
    warranty_expiry: '',
    location: '',
    notes: ''
  });

  // Fetch equipment
  const { data: equipment = [], isLoading } = useQuery({
    queryKey: ['equipment', profile?.isp_company_id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('equipment')
        .select(`
          *,
          equipment_assignments (
            assigned_at,
            clients (
              id,
              name,
              phone
            )
          )
        `)
        .eq('isp_company_id', profile?.isp_company_id)
        .order('created_at', { ascending: false });

      if (error) throw error;
      return (data || []) as Equipment[];
    },
    enabled: !!profile?.isp_company_id,
  });

  // Add/Update equipment mutation
  const saveEquipment = useMutation({
    mutationFn: async (equipmentData: typeof formData) => {
      const dataToSave = {
        ...equipmentData,
        isp_company_id: profile?.isp_company_id,
        purchase_date: equipmentData.purchase_date || null,
        warranty_expiry: equipmentData.warranty_expiry || null,
        mac_address: equipmentData.mac_address || null,
        location: equipmentData.location || null,
        notes: equipmentData.notes || null
      };

      if (editingEquipment) {
        const { error } = await supabase
          .from('equipment')
          .update(dataToSave)
          .eq('id', editingEquipment.id);
        if (error) throw error;
      } else {
        const { error } = await supabase
          .from('equipment')
          .insert(dataToSave);
        if (error) throw error;
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['equipment'] });
      toast({
        title: "Success",
        description: editingEquipment ? "Equipment updated successfully" : "Equipment added successfully",
      });
      resetForm();
      setShowAddDialog(false);
      setEditingEquipment(null);
    },
    onError: (error) => {
      console.error('Error saving equipment:', error);
      toast({
        title: "Error",
        description: "Failed to save equipment",
        variant: "destructive",
      });
    }
  });

  // Delete equipment mutation
  const deleteEquipment = useMutation({
    mutationFn: async (equipmentId: string) => {
      const { error } = await supabase
        .from('equipment')
        .delete()
        .eq('id', equipmentId);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['equipment'] });
      toast({
        title: "Success",
        description: "Equipment deleted successfully",
      });
    },
    onError: (error) => {
      console.error('Error deleting equipment:', error);
      toast({
        title: "Error",
        description: "Failed to delete equipment",
        variant: "destructive",
      });
    }
  });

  const resetForm = () => {
    setFormData({
      model: '',
      serial_number: '',
      mac_address: '',
      equipment_type: 'router',
      status: 'available',
      purchase_date: '',
      warranty_expiry: '',
      location: '',
      notes: ''
    });
  };

  const handleEdit = (equip: Equipment) => {
    setEditingEquipment(equip);
    setFormData({
      model: equip.model,
      serial_number: equip.serial_number,
      mac_address: equip.mac_address || '',
      equipment_type: equip.equipment_type,
      status: equip.status,
      purchase_date: equip.purchase_date || '',
      warranty_expiry: equip.warranty_expiry || '',
      location: equip.location || '',
      notes: equip.notes || ''
    });
    setShowAddDialog(true);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    saveEquipment.mutate(formData);
  };

  // Filter equipment
  const filteredEquipment = equipment.filter(equip => {
    const matchesSearch = equip.model.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         equip.serial_number.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesType = typeFilter === 'all' || equip.equipment_type === typeFilter;
    const matchesStatus = statusFilter === 'all' || equip.status === statusFilter;
    
    return matchesSearch && matchesType && matchesStatus;
  });

  // Statistics
  const stats = {
    total: equipment.length,
    available: equipment.filter(e => e.status === 'available').length,
    assigned: equipment.filter(e => e.status === 'assigned').length,
    maintenance: equipment.filter(e => e.status === 'maintenance').length,
    damaged: equipment.filter(e => e.status === 'damaged').length
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'available': return 'bg-green-100 text-green-800';
      case 'assigned': return 'bg-blue-100 text-blue-800';
      case 'maintenance': return 'bg-yellow-100 text-yellow-800';
      case 'damaged': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'router': return <Router className="h-4 w-4" />;
      case 'modem': return <Smartphone className="h-4 w-4" />;
      case 'switch': return <Monitor className="h-4 w-4" />;
      default: return <Package className="h-4 w-4" />;
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Equipment Management</h1>
          <p className="text-muted-foreground">
            Track and manage your network equipment inventory
          </p>
        </div>
        <Button onClick={() => {
          resetForm();
          setEditingEquipment(null);
          setShowAddDialog(true);
        }}>
          <Plus className="h-4 w-4 mr-2" />
          Add Equipment
        </Button>
      </div>

      {/* Statistics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Equipment</CardTitle>
            <Package className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.total}</div>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Available</CardTitle>
            <div className="h-4 w-4 bg-green-500 rounded-full"></div>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">{stats.available}</div>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Assigned</CardTitle>
            <div className="h-4 w-4 bg-blue-500 rounded-full"></div>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-blue-600">{stats.assigned}</div>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Maintenance</CardTitle>
            <div className="h-4 w-4 bg-yellow-500 rounded-full"></div>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-yellow-600">{stats.maintenance}</div>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Damaged</CardTitle>
            <div className="h-4 w-4 bg-red-500 rounded-full"></div>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-red-600">{stats.damaged}</div>
          </CardContent>
        </Card>
      </div>

      {/* Filters and Search */}
      <div className="flex items-center gap-4">
        <div className="flex-1">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
            <Input
              placeholder="Search equipment by model or serial number..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
          </div>
        </div>
        
        <select
          value={typeFilter}
          onChange={(e) => setTypeFilter(e.target.value)}
          className="border border-gray-200 rounded-md px-3 py-2"
        >
          <option value="all">All Types</option>
          <option value="router">Router</option>
          <option value="modem">Modem</option>
          <option value="switch">Switch</option>
          <option value="access_point">Access Point</option>
          <option value="ont">ONT</option>
          <option value="cable">Cable</option>
          <option value="other">Other</option>
        </select>
        
        <select
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
          className="border border-gray-200 rounded-md px-3 py-2"
        >
          <option value="all">All Status</option>
          <option value="available">Available</option>
          <option value="assigned">Assigned</option>
          <option value="maintenance">Maintenance</option>
          <option value="damaged">Damaged</option>
        </select>
        
        <Button variant="outline">
          <Download className="h-4 w-4 mr-2" />
          Export
        </Button>
      </div>

      {/* Equipment Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
        {isLoading ? (
          <div className="col-span-full text-center py-8">Loading equipment...</div>
        ) : filteredEquipment.length === 0 ? (
          <div className="col-span-full text-center py-8 text-gray-500">
            No equipment found matching your criteria
          </div>
        ) : (
          filteredEquipment.map((equip) => (
            <Card key={equip.id} className="hover:shadow-md transition-shadow">
              <CardHeader className="pb-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    {getTypeIcon(equip.equipment_type)}
                    <CardTitle className="text-lg">{equip.model}</CardTitle>
                  </div>
                  <Badge className={getStatusColor(equip.status)}>
                    {equip.status}
                  </Badge>
                </div>
              </CardHeader>
              <CardContent className="space-y-3">
                <div>
                  <label className="text-sm font-medium text-gray-500">Serial Number</label>
                  <p className="font-mono text-sm">{equip.serial_number}</p>
                </div>
                
                {equip.mac_address && (
                  <div>
                    <label className="text-sm font-medium text-gray-500">MAC Address</label>
                    <p className="font-mono text-sm">{equip.mac_address}</p>
                  </div>
                )}
                
                <div>
                  <label className="text-sm font-medium text-gray-500">Type</label>
                  <p className="text-sm capitalize">{equip.equipment_type.replace('_', ' ')}</p>
                </div>
                
                {equip.location && (
                  <div className="flex items-center gap-1">
                    <MapPin className="h-3 w-3 text-gray-400" />
                    <span className="text-sm text-gray-600">{equip.location}</span>
                  </div>
                )}
                
                {equip.purchase_date && (
                  <div className="flex items-center gap-1">
                    <Calendar className="h-3 w-3 text-gray-400" />
                    <span className="text-sm text-gray-600">
                      Purchased: {new Date(equip.purchase_date).toLocaleDateString()}
                    </span>
                  </div>
                )}

                {equip.equipment_assignments && equip.equipment_assignments.length > 0 && (
                  <div>
                    <label className="text-sm font-medium text-gray-500">Assigned to</label>
                    <p className="text-sm">{equip.equipment_assignments[0].client?.name}</p>
                    <p className="text-xs text-gray-500">{equip.equipment_assignments[0].client?.phone}</p>
                  </div>
                )}
                
                <div className="flex justify-end gap-2 pt-2">
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => handleEdit(equip)}
                  >
                    <Edit className="h-4 w-4" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => deleteEquipment.mutate(equip.id)}
                    className="text-red-600 hover:text-red-700"
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))
        )}
      </div>

      {/* Add/Edit Equipment Dialog */}
      <Dialog open={showAddDialog} onOpenChange={setShowAddDialog}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>
              {editingEquipment ? 'Edit Equipment' : 'Add New Equipment'}
            </DialogTitle>
          </DialogHeader>
          
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="model">Model *</Label>
              <Input
                id="model"
                value={formData.model}
                onChange={(e) => setFormData({ ...formData, model: e.target.value })}
                required
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="serial_number">Serial Number *</Label>
              <Input
                id="serial_number"
                value={formData.serial_number}
                onChange={(e) => setFormData({ ...formData, serial_number: e.target.value })}
                required
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="mac_address">MAC Address</Label>
              <Input
                id="mac_address"
                value={formData.mac_address}
                onChange={(e) => setFormData({ ...formData, mac_address: e.target.value })}
                placeholder="AA:BB:CC:DD:EE:FF"
              />
            </div>
            
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="equipment_type">Type *</Label>
                <Select 
                  value={formData.equipment_type} 
                  onValueChange={(value: Equipment['equipment_type']) => 
                    setFormData({ ...formData, equipment_type: value })
                  }
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="router">Router</SelectItem>
                    <SelectItem value="modem">Modem</SelectItem>
                    <SelectItem value="switch">Switch</SelectItem>
                    <SelectItem value="access_point">Access Point</SelectItem>
                    <SelectItem value="ont">ONT</SelectItem>
                    <SelectItem value="cable">Cable</SelectItem>
                    <SelectItem value="other">Other</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="status">Status *</Label>
                <Select 
                  value={formData.status} 
                  onValueChange={(value: Equipment['status']) => 
                    setFormData({ ...formData, status: value })
                  }
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="available">Available</SelectItem>
                    <SelectItem value="assigned">Assigned</SelectItem>
                    <SelectItem value="maintenance">Maintenance</SelectItem>
                    <SelectItem value="damaged">Damaged</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="purchase_date">Purchase Date</Label>
                <Input
                  id="purchase_date"
                  type="date"
                  value={formData.purchase_date}
                  onChange={(e) => setFormData({ ...formData, purchase_date: e.target.value })}
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="warranty_expiry">Warranty Expiry</Label>
                <Input
                  id="warranty_expiry"
                  type="date"
                  value={formData.warranty_expiry}
                  onChange={(e) => setFormData({ ...formData, warranty_expiry: e.target.value })}
                />
              </div>
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="location">Location</Label>
              <Input
                id="location"
                value={formData.location}
                onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                placeholder="Storage location or installation site"
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="notes">Notes</Label>
              <Textarea
                id="notes"
                value={formData.notes}
                onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                placeholder="Additional notes about this equipment"
                rows={3}
              />
            </div>
            
            <div className="flex justify-end gap-2">
              <Button 
                type="button" 
                variant="outline" 
                onClick={() => setShowAddDialog(false)}
              >
                Cancel
              </Button>
              <Button type="submit" disabled={saveEquipment.isPending}>
                {saveEquipment.isPending ? 'Saving...' : (editingEquipment ? 'Update' : 'Add')} Equipment
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default EquipmentPage;
