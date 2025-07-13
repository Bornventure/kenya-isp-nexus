
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Switch } from '@/components/ui/switch';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { useAllLicenseTypes, useLicenseTypeMutations, LicenseType } from '@/hooks/useLicenseTypes';
import { formatKenyanCurrency } from '@/utils/kenyanValidation';
import { 
  Plus, 
  Edit, 
  Trash2, 
  DollarSign,
  Users,
  Settings
} from 'lucide-react';

const LicenseTypeManager = () => {
  const { data: licenseTypes, isLoading } = useAllLicenseTypes();
  const { createLicenseType, updateLicenseType, deleteLicenseType } = useLicenseTypeMutations();
  
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [selectedLicenseType, setSelectedLicenseType] = useState<LicenseType | null>(null);
  
  const [formData, setFormData] = useState({
    name: '',
    display_name: '',
    client_limit: 50,
    price: 0,
    description: '',
    is_active: true,
    sort_order: 0
  });

  const resetForm = () => {
    setFormData({
      name: '',
      display_name: '',
      client_limit: 50,
      price: 0,
      description: '',
      is_active: true,
      sort_order: 0
    });
  };

  const handleCreate = async () => {
    try {
      await createLicenseType.mutateAsync({
        ...formData,
        features: []
      });
      setIsCreateDialogOpen(false);
      resetForm();
    } catch (error) {
      console.error('Error creating license type:', error);
    }
  };

  const handleEdit = (licenseType: LicenseType) => {
    setSelectedLicenseType(licenseType);
    setFormData({
      name: licenseType.name,
      display_name: licenseType.display_name,
      client_limit: licenseType.client_limit,
      price: licenseType.price,
      description: licenseType.description || '',
      is_active: licenseType.is_active,
      sort_order: licenseType.sort_order
    });
    setIsEditDialogOpen(true);
  };

  const handleUpdate = async () => {
    if (!selectedLicenseType) return;
    
    try {
      await updateLicenseType.mutateAsync({
        id: selectedLicenseType.id,
        ...formData
      });
      setIsEditDialogOpen(false);
      setSelectedLicenseType(null);
      resetForm();
    } catch (error) {
      console.error('Error updating license type:', error);
    }
  };

  const handleDeactivate = async (id: string) => {
    if (confirm('Are you sure you want to deactivate this license type?')) {
      try {
        await deleteLicenseType.mutateAsync(id);
      } catch (error) {
        console.error('Error deactivating license type:', error);
      }
    }
  };

  if (isLoading) {
    return (
      <Card>
        <CardContent className="p-6">
          <div className="animate-pulse space-y-4">
            {[...Array(3)].map((_, i) => (
              <div key={i} className="h-4 bg-gray-200 rounded w-3/4"></div>
            ))}
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold">License Type Management</h2>
          <p className="text-gray-600 dark:text-gray-300">
            Configure license types and pricing for ISP registrations
          </p>
        </div>
        
        <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
          <DialogTrigger asChild>
            <Button className="flex items-center gap-2">
              <Plus className="h-4 w-4" />
              Add License Type
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Create License Type</DialogTitle>
              <DialogDescription>
                Add a new license type with pricing and client limits
              </DialogDescription>
            </DialogHeader>
            
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Name (Internal)</Label>
                  <Input
                    value={formData.name}
                    onChange={(e) => setFormData(prev => ({...prev, name: e.target.value}))}
                    placeholder="starter"
                  />
                </div>
                <div className="space-y-2">
                  <Label>Display Name</Label>
                  <Input
                    value={formData.display_name}
                    onChange={(e) => setFormData(prev => ({...prev, display_name: e.target.value}))}
                    placeholder="Starter Package"
                  />
                </div>
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Client Limit</Label>
                  <Input
                    type="number"
                    value={formData.client_limit}
                    onChange={(e) => setFormData(prev => ({...prev, client_limit: parseInt(e.target.value) || 0}))}
                  />
                </div>
                <div className="space-y-2">
                  <Label>Price (KES)</Label>
                  <Input
                    type="number"
                    value={formData.price}
                    onChange={(e) => setFormData(prev => ({...prev, price: parseFloat(e.target.value) || 0}))}
                  />
                </div>
              </div>
              
              <div className="space-y-2">
                <Label>Description</Label>
                <Textarea
                  value={formData.description}
                  onChange={(e) => setFormData(prev => ({...prev, description: e.target.value}))}
                  placeholder="Brief description of this license type"
                />
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                <div className="flex items-center space-x-2">
                  <Switch
                    checked={formData.is_active}
                    onCheckedChange={(checked) => setFormData(prev => ({...prev, is_active: checked}))}
                  />
                  <Label>Active</Label>
                </div>
                <div className="space-y-2">
                  <Label>Sort Order</Label>
                  <Input
                    type="number"
                    value={formData.sort_order}
                    onChange={(e) => setFormData(prev => ({...prev, sort_order: parseInt(e.target.value) || 0}))}
                  />
                </div>
              </div>
              
              <div className="flex gap-3">
                <Button
                  variant="outline"
                  onClick={() => setIsCreateDialogOpen(false)}
                  className="flex-1"
                >
                  Cancel
                </Button>
                <Button
                  onClick={handleCreate}
                  disabled={createLicenseType.isPending}
                  className="flex-1"
                >
                  {createLicenseType.isPending ? 'Creating...' : 'Create'}
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Settings className="h-5 w-5" />
            License Types ({licenseTypes?.length || 0})
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Name</TableHead>
                  <TableHead>Client Limit</TableHead>
                  <TableHead>Price</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Order</TableHead>
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {licenseTypes?.map((licenseType) => (
                  <TableRow key={licenseType.id}>
                    <TableCell>
                      <div>
                        <div className="font-medium">{licenseType.display_name}</div>
                        <div className="text-sm text-gray-500">{licenseType.name}</div>
                        {licenseType.description && (
                          <div className="text-xs text-gray-400 mt-1">{licenseType.description}</div>
                        )}
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <Users className="h-4 w-4" />
                        {licenseType.client_limit}
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <DollarSign className="h-4 w-4" />
                        {formatKenyanCurrency(licenseType.price)}
                      </div>
                    </TableCell>
                    <TableCell>
                      <span className={`px-2 py-1 rounded-full text-xs ${
                        licenseType.is_active 
                          ? 'bg-green-100 text-green-800' 
                          : 'bg-red-100 text-red-800'
                      }`}>
                        {licenseType.is_active ? 'Active' : 'Inactive'}
                      </span>
                    </TableCell>
                    <TableCell>{licenseType.sort_order}</TableCell>
                    <TableCell>
                      <div className="flex gap-2">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleEdit(licenseType)}
                        >
                          <Edit className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleDeactivate(licenseType.id)}
                          disabled={!licenseType.is_active}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>

      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Edit License Type</DialogTitle>
            <DialogDescription>
              Update license type details and pricing
            </DialogDescription>
          </DialogHeader>
          
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Name (Internal)</Label>
                <Input
                  value={formData.name}
                  onChange={(e) => setFormData(prev => ({...prev, name: e.target.value}))}
                  placeholder="starter"
                />
              </div>
              <div className="space-y-2">
                <Label>Display Name</Label>
                <Input
                  value={formData.display_name}
                  onChange={(e) => setFormData(prev => ({...prev, display_name: e.target.value}))}
                  placeholder="Starter Package"
                />
              </div>
            </div>
            
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Client Limit</Label>
                <Input
                  type="number"
                  value={formData.client_limit}
                  onChange={(e) => setFormData(prev => ({...prev, client_limit: parseInt(e.target.value) || 0}))}
                />
              </div>
              <div className="space-y-2">
                <Label>Price (KES)</Label>
                <Input
                  type="number"
                  value={formData.price}
                  onChange={(e) => setFormData(prev => ({...prev, price: parseFloat(e.target.value) || 0}))}
                />
              </div>
            </div>
            
            <div className="space-y-2">
              <Label>Description</Label>
              <Textarea
                value={formData.description}
                onChange={(e) => setFormData(prev => ({...prev, description: e.target.value}))}
                placeholder="Brief description of this license type"
              />
            </div>
            
            <div className="grid grid-cols-2 gap-4">
              <div className="flex items-center space-x-2">
                <Switch
                  checked={formData.is_active}
                  onCheckedChange={(checked) => setFormData(prev => ({...prev, is_active: checked}))}
                />
                <Label>Active</Label>
              </div>
              <div className="space-y-2">
                <Label>Sort Order</Label>
                <Input
                  type="number"
                  value={formData.sort_order}
                  onChange={(e) => setFormData(prev => ({...prev, sort_order: parseInt(e.target.value) || 0}))}
                />
              </div>
            </div>
            
            <div className="flex gap-3">
              <Button
                variant="outline"
                onClick={() => setIsEditDialogOpen(false)}
                className="flex-1"
              >
                Cancel
              </Button>
              <Button
                onClick={handleUpdate}
                disabled={updateLicenseType.isPending}
                className="flex-1"
              >
                {updateLicenseType.isPending ? 'Updating...' : 'Update'}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default LicenseTypeManager;
