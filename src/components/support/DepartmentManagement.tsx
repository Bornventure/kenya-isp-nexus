
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Label } from '@/components/ui/label';
import { useDepartments, useDepartmentMutations } from '@/hooks/useDepartments';
import { useUsers } from '@/hooks/useUsers';
import { Building2, Users, Plus, Settings, Trash2 } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

const DepartmentManagement = () => {
  const { data: departments = [], isLoading } = useDepartments();
  const { users = [] } = useUsers();
  const { createDepartment, updateDepartment } = useDepartmentMutations();
  const { toast } = useToast();

  const [showCreateDialog, setShowCreateDialog] = useState(false);
  const [editingDepartment, setEditingDepartment] = useState<any>(null);
  const [newDepartment, setNewDepartment] = useState({
    name: '',
    description: '',
    is_active: true,
  });

  const handleCreateDepartment = async () => {
    if (!newDepartment.name.trim()) {
      toast({
        title: "Error",
        description: "Department name is required",
        variant: "destructive",
      });
      return;
    }

    await createDepartment.mutateAsync(newDepartment);
    setNewDepartment({ name: '', description: '', is_active: true });
    setShowCreateDialog(false);
  };

  const handleToggleStatus = async (dept: any) => {
    await updateDepartment.mutateAsync({
      id: dept.id,
      updates: { is_active: !dept.is_active }
    });
  };

  const getDepartmentStats = (deptId: string) => {
    const assignedUsers = users.filter(user => 
      user.role !== 'super_admin' && user.role !== 'readonly'
    );
    return {
      activeStaff: assignedUsers.length,
      totalTickets: Math.floor(Math.random() * 50) + 1, // Mock data
    };
  };

  if (isLoading) {
    return (
      <Card>
        <CardContent className="p-6">
          <div className="animate-pulse space-y-4">
            <div className="h-4 bg-gray-200 rounded w-3/4"></div>
            <div className="h-4 bg-gray-200 rounded w-1/2"></div>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold tracking-tight">Department Management</h2>
          <p className="text-muted-foreground">
            Manage departments and their configurations
          </p>
        </div>
        <Dialog open={showCreateDialog} onOpenChange={setShowCreateDialog}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="h-4 w-4 mr-2" />
              Add Department
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Create New Department</DialogTitle>
            </DialogHeader>
            <div className="space-y-4">
              <div>
                <Label htmlFor="name">Department Name</Label>
                <Input
                  id="name"
                  value={newDepartment.name}
                  onChange={(e) => setNewDepartment(prev => ({ ...prev, name: e.target.value }))}
                  placeholder="e.g., Technical Support"
                />
              </div>
              <div>
                <Label htmlFor="description">Description</Label>
                <Textarea
                  id="description"
                  value={newDepartment.description}
                  onChange={(e) => setNewDepartment(prev => ({ ...prev, description: e.target.value }))}
                  placeholder="Brief description of department responsibilities"
                  rows={3}
                />
              </div>
              <div className="flex justify-end gap-2">
                <Button variant="outline" onClick={() => setShowCreateDialog(false)}>
                  Cancel
                </Button>
                <Button onClick={handleCreateDepartment} disabled={createDepartment.isPending}>
                  {createDepartment.isPending ? 'Creating...' : 'Create Department'}
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {departments.map((dept) => {
          const stats = getDepartmentStats(dept.id);
          return (
            <Card key={dept.id} className="hover:shadow-md transition-shadow">
              <CardHeader className="pb-3">
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-2">
                    <Building2 className="h-5 w-5 text-blue-600" />
                    <CardTitle className="text-lg">{dept.name}</CardTitle>
                  </div>
                  <div className="flex items-center gap-2">
                    <Badge variant={dept.is_active ? "default" : "secondary"}>
                      {dept.is_active ? "Active" : "Inactive"}
                    </Badge>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => setEditingDepartment(dept)}
                    >
                      <Settings className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                {dept.description && (
                  <p className="text-sm text-muted-foreground">{dept.description}</p>
                )}
                
                <div className="grid grid-cols-2 gap-4">
                  <div className="text-center p-2 bg-blue-50 rounded-lg">
                    <div className="flex items-center justify-center gap-1 text-blue-600 mb-1">
                      <Users className="h-4 w-4" />
                      <span className="text-sm font-medium">Staff</span>
                    </div>
                    <div className="text-2xl font-bold text-blue-700">{stats.activeStaff}</div>
                  </div>
                  <div className="text-center p-2 bg-green-50 rounded-lg">
                    <div className="flex items-center justify-center gap-1 text-green-600 mb-1">
                      <Building2 className="h-4 w-4" />
                      <span className="text-sm font-medium">Tickets</span>
                    </div>
                    <div className="text-2xl font-bold text-green-700">{stats.totalTickets}</div>
                  </div>
                </div>

                <div className="flex gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleToggleStatus(dept)}
                    className="flex-1"
                  >
                    {dept.is_active ? 'Deactivate' : 'Activate'}
                  </Button>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {/* Edit Department Dialog */}
      <Dialog open={!!editingDepartment} onOpenChange={() => setEditingDepartment(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Edit Department</DialogTitle>
          </DialogHeader>
          {editingDepartment && (
            <div className="space-y-4">
              <div>
                <Label htmlFor="edit-name">Department Name</Label>
                <Input
                  id="edit-name"
                  value={editingDepartment.name}
                  onChange={(e) => setEditingDepartment(prev => ({ ...prev, name: e.target.value }))}
                />
              </div>
              <div>
                <Label htmlFor="edit-description">Description</Label>
                <Textarea
                  id="edit-description"
                  value={editingDepartment.description || ''}
                  onChange={(e) => setEditingDepartment(prev => ({ ...prev, description: e.target.value }))}
                  rows={3}
                />
              </div>
              <div className="flex justify-end gap-2">
                <Button variant="outline" onClick={() => setEditingDepartment(null)}>
                  Cancel
                </Button>
                <Button 
                  onClick={async () => {
                    await updateDepartment.mutateAsync({
                      id: editingDepartment.id,
                      updates: {
                        name: editingDepartment.name,
                        description: editingDepartment.description,
                      }
                    });
                    setEditingDepartment(null);
                  }}
                  disabled={updateDepartment.isPending}
                >
                  {updateDepartment.isPending ? 'Updating...' : 'Update'}
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default DepartmentManagement;
