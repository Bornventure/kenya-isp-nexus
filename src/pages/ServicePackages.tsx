
import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Plus, Wifi, Zap, Crown, Edit, Trash2 } from 'lucide-react';
import { useServicePackages } from '@/hooks/useServicePackages';
import { formatKenyanCurrency } from '@/utils/currencyFormat';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Checkbox } from '@/components/ui/checkbox';
import { useForm } from 'react-hook-form';
import { ServicePackage } from '@/hooks/useServicePackages';

const ServicePackages = () => {
  const { servicePackages, isLoading, createPackage, updatePackage, deletePackage, isCreating } = useServicePackages();
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [editingPackage, setEditingPackage] = useState<ServicePackage | null>(null);
  
  const { register, handleSubmit, reset, setValue, watch } = useForm();
  const { register: registerEdit, handleSubmit: handleSubmitEdit, reset: resetEdit, setValue: setValueEdit } = useForm();

  const getPackageIcon = (speed: string) => {
    const speedNum = parseInt(speed);
    if (speedNum >= 100) return Crown;
    if (speedNum >= 50) return Zap;
    return Wifi;
  };

  const getPackageColor = (speed: string) => {
    const speedNum = parseInt(speed);
    if (speedNum >= 100) return 'bg-purple-500';
    if (speedNum >= 50) return 'bg-green-500';
    return 'bg-blue-500';
  };

  const handleCreatePackage = (data: any) => {
    const packageData = {
      name: data.name,
      speed: data.speed,
      monthly_rate: parseFloat(data.monthly_rate),
      connection_types: data.connection_types || ['fiber'],
      description: data.description,
      setup_fee: data.setup_fee ? parseFloat(data.setup_fee) : undefined,
      data_limit: data.data_limit ? parseInt(data.data_limit) : undefined,
      is_active: true,
    };

    createPackage(packageData);
    reset();
    setIsCreateDialogOpen(false);
  };

  const handleEditPackage = (data: any) => {
    if (!editingPackage) return;

    const updates = {
      name: data.name,
      speed: data.speed,
      monthly_rate: parseFloat(data.monthly_rate),
      connection_types: data.connection_types || ['fiber'],
      description: data.description,
      setup_fee: data.setup_fee ? parseFloat(data.setup_fee) : undefined,
      data_limit: data.data_limit ? parseInt(data.data_limit) : undefined,
      is_active: data.is_active !== false,
    };

    updatePackage({ id: editingPackage.id, updates });
    resetEdit();
    setIsEditDialogOpen(false);
    setEditingPackage(null);
  };

  const openEditDialog = (pkg: ServicePackage) => {
    setEditingPackage(pkg);
    setValueEdit('name', pkg.name);
    setValueEdit('speed', pkg.speed);
    setValueEdit('monthly_rate', pkg.monthly_rate);
    setValueEdit('description', pkg.description || '');
    setValueEdit('setup_fee', pkg.setup_fee || '');
    setValueEdit('data_limit', pkg.data_limit || '');
    setValueEdit('is_active', pkg.is_active);
    setIsEditDialogOpen(true);
  };

  const handleDeletePackage = (packageId: string) => {
    if (confirm('Are you sure you want to delete this service package?')) {
      deletePackage(packageId);
    }
  };

  if (isLoading) {
    return <div className="flex items-center justify-center h-64">Loading service packages...</div>;
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Service Packages</h1>
          <p className="text-muted-foreground">Manage your internet service packages and pricing plans</p>
        </div>
        <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="h-4 w-4 mr-2" />
              Add Package
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Create New Service Package</DialogTitle>
              <DialogDescription>Add a new internet service package for your clients.</DialogDescription>
            </DialogHeader>
            <form onSubmit={handleSubmit(handleCreatePackage)} className="space-y-4">
              <div>
                <Label htmlFor="name">Package Name</Label>
                <Input id="name" {...register('name', { required: true })} placeholder="e.g. Premium Plan" />
              </div>
              <div>
                <Label htmlFor="speed">Speed</Label>
                <Input id="speed" {...register('speed', { required: true })} placeholder="e.g. 50 Mbps" />
              </div>
              <div>
                <Label htmlFor="monthly_rate">Monthly Rate (KES)</Label>
                <Input id="monthly_rate" type="number" {...register('monthly_rate', { required: true })} placeholder="e.g. 2500" />
              </div>
              <div>
                <Label htmlFor="setup_fee">Setup Fee (KES) - Optional</Label>
                <Input id="setup_fee" type="number" {...register('setup_fee')} placeholder="e.g. 1000" />
              </div>
              <div>
                <Label htmlFor="description">Description</Label>
                <Textarea id="description" {...register('description')} placeholder="Package description..." />
              </div>
              <div className="flex justify-end gap-2">
                <Button type="button" variant="outline" onClick={() => setIsCreateDialogOpen(false)}>Cancel</Button>
                <Button type="submit" disabled={isCreating}>
                  {isCreating ? 'Creating...' : 'Create Package'}
                </Button>
              </div>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {servicePackages.map((pkg) => {
          const Icon = getPackageIcon(pkg.speed);
          return (
            <Card key={pkg.id} className="hover:shadow-lg transition-shadow">
              <CardHeader className="pb-4">
                <div className="flex items-center justify-between">
                  <div className={`p-3 rounded-lg ${getPackageColor(pkg.speed)} text-white`}>
                    <Icon className="h-6 w-6" />
                  </div>
                  <Badge variant={pkg.is_active ? 'default' : 'secondary'}>
                    {pkg.is_active ? 'Active' : 'Inactive'}
                  </Badge>
                </div>
                <CardTitle className="text-xl">{pkg.name}</CardTitle>
                <CardDescription>
                  Up to {pkg.speed} internet speed
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="text-3xl font-bold text-primary">
                    {formatKenyanCurrency(pkg.monthly_rate)}
                    <span className="text-sm font-normal text-muted-foreground">/month</span>
                  </div>
                  
                  {pkg.setup_fee && (
                    <div className="text-sm text-muted-foreground">
                      Setup fee: {formatKenyanCurrency(pkg.setup_fee)}
                    </div>
                  )}

                  <div className="space-y-2">
                    <h4 className="font-semibold text-sm">Connection Types:</h4>
                    <div className="flex flex-wrap gap-1">
                      {pkg.connection_types.map((type) => (
                        <Badge key={type} variant="outline" className="text-xs">
                          {type}
                        </Badge>
                      ))}
                    </div>
                  </div>

                  {pkg.description && (
                    <div className="text-sm text-muted-foreground">
                      {pkg.description}
                    </div>
                  )}
                  
                  <div className="flex gap-2 pt-4">
                    <Button variant="outline" size="sm" className="flex-1" onClick={() => openEditDialog(pkg)}>
                      <Edit className="h-4 w-4 mr-1" />
                      Edit
                    </Button>
                    <Button 
                      variant="destructive" 
                      size="sm" 
                      onClick={() => handleDeletePackage(pkg.id)}
                      className="px-3"
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {/* Edit Dialog */}
      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Edit Service Package</DialogTitle>
            <DialogDescription>Update the service package details.</DialogDescription>
          </DialogHeader>
          <form onSubmit={handleSubmitEdit(handleEditPackage)} className="space-y-4">
            <div>
              <Label htmlFor="edit_name">Package Name</Label>
              <Input id="edit_name" {...registerEdit('name', { required: true })} />
            </div>
            <div>
              <Label htmlFor="edit_speed">Speed</Label>
              <Input id="edit_speed" {...registerEdit('speed', { required: true })} />
            </div>
            <div>
              <Label htmlFor="edit_monthly_rate">Monthly Rate (KES)</Label>
              <Input id="edit_monthly_rate" type="number" {...registerEdit('monthly_rate', { required: true })} />
            </div>
            <div>
              <Label htmlFor="edit_setup_fee">Setup Fee (KES) - Optional</Label>
              <Input id="edit_setup_fee" type="number" {...registerEdit('setup_fee')} />
            </div>
            <div>
              <Label htmlFor="edit_description">Description</Label>
              <Textarea id="edit_description" {...registerEdit('description')} />
            </div>
            <div className="flex items-center space-x-2">
              <Checkbox id="edit_is_active" {...registerEdit('is_active')} />
              <Label htmlFor="edit_is_active">Active</Label>
            </div>
            <div className="flex justify-end gap-2">
              <Button type="button" variant="outline" onClick={() => setIsEditDialogOpen(false)}>Cancel</Button>
              <Button type="submit">Update Package</Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default ServicePackages;
