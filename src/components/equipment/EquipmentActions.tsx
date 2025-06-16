
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Plus, Settings, CheckCircle, XCircle, Clock, Eye } from 'lucide-react';
import { useEquipment } from '@/hooks/useEquipment';
import { useAuth } from '@/contexts/AuthContext';
import AddEquipmentDialog from './AddEquipmentDialog';
import EquipmentApprovalDialog from './EquipmentApprovalDialog';

const EquipmentActions: React.FC = () => {
  const [showAddDialog, setShowAddDialog] = useState(false);
  const [showApprovalDialog, setShowApprovalDialog] = useState(false);
  const [selectedEquipment, setSelectedEquipment] = useState(null);
  
  const { equipment, approveEquipment, rejectEquipment, isApproving, isRejecting } = useEquipment();
  const { profile } = useAuth();

  // Filter equipment by approval status
  const pendingEquipment = equipment.filter(eq => eq.approval_status === 'pending');
  const approvedEquipment = equipment.filter(eq => eq.approval_status === 'approved');
  const rejectedEquipment = equipment.filter(eq => eq.approval_status === 'rejected');

  const canApprove = profile?.role === 'super_admin' || profile?.role === 'isp_admin';

  const handleApprove = (id: string, notes?: string) => {
    approveEquipment({ id, notes });
  };

  const handleReject = (id: string, notes: string) => {
    rejectEquipment({ id, notes });
  };

  const openApprovalDialog = (equipment: any) => {
    setSelectedEquipment(equipment);
    setShowApprovalDialog(true);
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'approved':
        return <CheckCircle className="h-4 w-4 text-green-500" />;
      case 'rejected':
        return <XCircle className="h-4 w-4 text-red-500" />;
      default:
        return <Clock className="h-4 w-4 text-yellow-500" />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'approved':
        return 'default';
      case 'rejected':
        return 'destructive';
      default:
        return 'secondary';
    }
  };

  return (
    <div className="space-y-6">
      {/* Action Buttons */}
      <div className="flex gap-4">
        <Button onClick={() => setShowAddDialog(true)}>
          <Plus className="h-4 w-4 mr-2" />
          Add Equipment
        </Button>
        
        <Button variant="outline">
          <Settings className="h-4 w-4 mr-2" />
          Schedule Maintenance
        </Button>
      </div>

      {/* Equipment Lists */}
      <div className="grid gap-6">
        {/* Pending Approval */}
        {canApprove && pendingEquipment.length > 0 && (
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Clock className="h-5 w-5 text-yellow-500" />
                Pending Approval ({pendingEquipment.length})
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid gap-4">
                {pendingEquipment.map((eq) => (
                  <div key={eq.id} className="flex items-center justify-between p-4 border rounded-lg">
                    <div className="flex-1">
                      <div className="flex items-center gap-3">
                        <div>
                          <h3 className="font-medium">{eq.brand} {eq.model}</h3>
                          <p className="text-sm text-muted-foreground">
                            {eq.type} • {eq.serial_number}
                          </p>
                          {eq.ip_address && (
                            <p className="text-xs text-muted-foreground">IP: {eq.ip_address}</p>
                          )}
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <Badge variant="secondary">
                        <Clock className="h-3 w-3 mr-1" />
                        Pending
                      </Badge>
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => openApprovalDialog(eq)}
                      >
                        <Eye className="h-4 w-4 mr-1" />
                        Review
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        )}

        {/* Equipment Overview */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Card>
            <CardContent className="p-4 text-center">
              <div className="text-2xl font-bold text-green-600">{approvedEquipment.length}</div>
              <div className="text-sm text-muted-foreground">Approved Equipment</div>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="p-4 text-center">
              <div className="text-2xl font-bold text-yellow-600">{pendingEquipment.length}</div>
              <div className="text-sm text-muted-foreground">Pending Approval</div>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="p-4 text-center">
              <div className="text-2xl font-bold text-red-600">{rejectedEquipment.length}</div>
              <div className="text-sm text-muted-foreground">Rejected</div>
            </CardContent>
          </Card>
        </div>

        {/* All Equipment */}
        <Card>
          <CardHeader>
            <CardTitle>All Equipment</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {equipment.length === 0 ? (
                <div className="text-center py-8 text-muted-foreground">
                  No equipment found. Click "Add Equipment" to get started.
                </div>
              ) : (
                equipment.map((eq) => (
                  <div key={eq.id} className="flex items-center justify-between p-4 border rounded-lg">
                    <div className="flex-1">
                      <div className="flex items-center gap-3">
                        {getStatusIcon(eq.approval_status || 'pending')}
                        <div>
                          <h3 className="font-medium">{eq.brand} {eq.model}</h3>
                          <p className="text-sm text-muted-foreground">
                            {eq.type} • {eq.serial_number}
                          </p>
                          {eq.ip_address && (
                            <p className="text-xs text-muted-foreground">IP: {eq.ip_address}</p>
                          )}
                          {eq.clients && (
                            <p className="text-xs text-blue-600">Assigned to: {eq.clients.name}</p>
                          )}
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <Badge variant={getStatusColor(eq.approval_status || 'pending')}>
                        {eq.approval_status || 'pending'}
                      </Badge>
                      {eq.auto_discovered && (
                        <Badge variant="outline" className="text-xs">
                          Auto-discovered
                        </Badge>
                      )}
                    </div>
                  </div>
                ))
              )}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Dialogs */}
      <AddEquipmentDialog
        open={showAddDialog}
        onOpenChange={setShowAddDialog}
      />

      <EquipmentApprovalDialog
        open={showApprovalDialog}
        onOpenChange={setShowApprovalDialog}
        equipment={selectedEquipment}
        onApprove={handleApprove}
        onReject={handleReject}
      />
    </div>
  );
};

export default EquipmentActions;
