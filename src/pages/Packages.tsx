
import React, { useState } from 'react';
import { useServicePackages } from '@/hooks/useServicePackages';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Plus, Edit, Trash2, Package, Wifi, DollarSign, Users } from 'lucide-react';
import { ServicePackage } from '@/types/client';

const Packages = () => {
  const { servicePackages: packages, isLoading, error, createPackage, updatePackage, deletePackage } = useServicePackages();
  const [selectedPackage, setSelectedPackage] = useState<ServicePackage | null>(null);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [isEditing, setIsEditing] = useState(false);

  const [formData, setFormData] = useState({
    name: '',
    description: '',
    speed: '',
    monthly_rate: 0,
    setup_fee: 0,
    data_limit: 0,
    connection_types: [] as ('fiber' | 'wireless' | 'satellite' | 'dsl')[],
    is_active: true
  });

  const resetForm = () => {
    setFormData({
      name: '',
      description: '',
      speed: '',
      monthly_rate: 0,
      setup_fee: 0,
      data_limit: 0,
      connection_types: [],
      is_active: true
    });
    setSelectedPackage(null);
    setIsEditing(false);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    const packageData = {
      ...formData,
      connection_types: formData.connection_types.length > 0 
        ? formData.connection_types 
        : ['fiber', 'wireless'] as ('fiber' | 'wireless')[]
    };

    if (isEditing && selectedPackage) {
      updatePackage({ id: selectedPackage.id, updates: packageData });
    } else {
      createPackage(packageData);
    }
    
    setDialogOpen(false);
    resetForm();
  };

  const handleEdit = (pkg: ServicePackage) => {
    setSelectedPackage(pkg);
    setFormData({
      name: pkg.name,
      description: pkg.description || '',
      speed: pkg.speed,
      monthly_rate: pkg.monthly_rate,
      setup_fee: pkg.setup_fee || 0,
      data_limit: pkg.data_limit || 0,
      connection_types: pkg.connection_types || [],
      is_active: pkg.is_active
    });
    setIsEditing(true);
    setDialogOpen(true);
  };

  const handleDelete = (id: string) => {
    if (confirm('Are you sure you want to delete this package?')) {
      deletePackage(id);
    }
  };

  // Statistics
  const totalPackages = packages.length;
  const activePackages = packages.filter(p => p.is_active).length;
  const averageRate = packages.length > 0 
    ? packages.reduce((sum, p) => sum + p.monthly_rate, 0) / packages.length 
    : 0;

  if (isLoading) {
    return <div className="flex justify-center p-8">Loading packages...</div>;
  }

  if (error) {
    return <div className="text-red-500 p-8">Error loading packages: {error.message}</div>;
  }

  return (
    <div className="space-y-6">
      {/* Statistics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Packages</CardTitle>
            <Package className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totalPackages}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Active Packages</CardTitle>
            <Wifi className="h-4 w-4 text-green-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">{activePackages}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Average Rate</CardTitle>
            <DollarSign className="h-4 w-4 text-blue-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-blue-600">
              KSh {averageRate.toLocaleString()}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Subscribers</CardTitle>
            <Users className="h-4 w-4 text-purple-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-purple-600">0</div>
            <p className="text-xs text-muted-foreground">Total subscribers</p>
          </CardContent>
        </Card>
      </div>

      {/* Header with Add Button */}
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold">Service Packages</h1>
        
        <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
          <DialogTrigger asChild>
            <Button className="gap-2" onClick={resetForm}>
              <Plus className="h-4 w-4" />
              Add Package
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle>
                {isEditing ? 'Edit Package' : 'Create New Package'}
              </DialogTitle>
            </DialogHeader>
            
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="name">Package Name *</Label>
                  <Input
                    id="name"
                    value={formData.name}
                    onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                    required
                  />
                </div>
                
                <div>
                  <Label htmlFor="speed">Speed *</Label>
                  <Input
                    id="speed"
                    value={formData.speed}
                    onChange={(e) => setFormData(prev => ({ ...prev, speed: e.target.value }))}
                    placeholder="e.g., 10 Mbps"
                    required
                  />
                </div>
                
                <div>
                  <Label htmlFor="monthly_rate">Monthly Rate (KSh) *</Label>
                  <Input
                    id="monthly_rate"
                    type="number"
                    value={formData.monthly_rate}
                    onChange={(e) => setFormData(prev => ({ ...prev, monthly_rate: parseFloat(e.target.value) || 0 }))}
                    required
                  />
                </div>
                
                <div>
                  <Label htmlFor="setup_fee">Setup Fee (KSh)</Label>
                  <Input
                    id="setup_fee"
                    type="number"
                    value={formData.setup_fee}
                    onChange={(e) => setFormData(prev => ({ ...prev, setup_fee: parseFloat(e.target.value) || 0 }))}
                  />
                </div>
                
                <div>
                  <Label htmlFor="data_limit">Data Limit (GB)</Label>
                  <Input
                    id="data_limit"
                    type="number"
                    value={formData.data_limit}
                    onChange={(e) => setFormData(prev => ({ ...prev, data_limit: parseFloat(e.target.value) || 0 }))}
                    placeholder="0 for unlimited"
                  />
                </div>
                
                <div>
                  <Label htmlFor="is_active">Status</Label>
                  <select
                    id="is_active"
                    value={formData.is_active.toString()}
                    onChange={(e) => setFormData(prev => ({ ...prev, is_active: e.target.value === 'true' }))}
                    className="w-full p-2 border rounded"
                  >
                    <option value="true">Active</option>
                    <option value="false">Inactive</option>
                  </select>
                </div>
              </div>
              
              <div>
                <Label htmlFor="description">Description</Label>
                <Textarea
                  id="description"
                  value={formData.description}
                  onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                  rows={3}
                />
              </div>
              
              <div>
                <Label>Connection Types</Label>
                <div className="flex gap-4 mt-2">
                  {(['fiber', 'wireless', 'satellite', 'dsl'] as const).map(type => (
                    <label key={type} className="flex items-center gap-2">
                      <input
                        type="checkbox"
                        checked={formData.connection_types.includes(type)}
                        onChange={(e) => {
                          if (e.target.checked) {
                            setFormData(prev => ({
                              ...prev,
                              connection_types: [...prev.connection_types, type]
                            }));
                          } else {
                            setFormData(prev => ({
                              ...prev,
                              connection_types: prev.connection_types.filter(t => t !== type)
                            }));
                          }
                        }}
                      />
                      {type.charAt(0).toUpperCase() + type.slice(1)}
                    </label>
                  ))}
                </div>
              </div>
              
              <div className="flex justify-end gap-3">
                <Button type="button" variant="outline" onClick={() => setDialogOpen(false)}>
                  Cancel
                </Button>
                <Button type="submit">
                  {isEditing ? 'Update Package' : 'Create Package'}
                </Button>
              </div>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      {/* Packages Table */}
      <Card>
        <CardHeader>
          <CardTitle>Service Packages</CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Name</TableHead>
                <TableHead>Speed</TableHead>
                <TableHead>Monthly Rate</TableHead>
                <TableHead>Connection Types</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {packages.map((pkg) => (
                <TableRow key={pkg.id}>
                  <TableCell className="font-medium">{pkg.name}</TableCell>
                  <TableCell>{pkg.speed}</TableCell>
                  <TableCell>KSh {pkg.monthly_rate.toLocaleString()}</TableCell>
                  <TableCell>
                    <div className="flex gap-1 flex-wrap">
                      {pkg.connection_types.map(type => (
                        <Badge key={type} variant="outline" className="text-xs">
                          {type}
                        </Badge>
                      ))}
                    </div>
                  </TableCell>
                  <TableCell>
                    <Badge variant={pkg.is_active ? 'default' : 'secondary'}>
                      {pkg.is_active ? 'Active' : 'Inactive'}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <div className="flex gap-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleEdit(pkg)}
                      >
                        <Edit className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleDelete(pkg.id)}
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
    </div>
  );
};

export default Packages;
