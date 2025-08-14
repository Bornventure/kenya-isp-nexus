
import React from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Equipment } from '@/types/equipment';
import { X, Router, Wifi, MapPin, Calendar, Settings } from 'lucide-react';

interface EquipmentDetailsDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  equipment: Equipment | null;
}

const EquipmentDetailsDialog: React.FC<EquipmentDetailsDialogProps> = ({
  open,
  onOpenChange,
  equipment,
}) => {
  if (!equipment) return null;

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

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader className="flex flex-row items-center justify-between">
          <DialogTitle className="flex items-center gap-2">
            <Router className="h-5 w-5" />
            Equipment Details
          </DialogTitle>
          <Button variant="ghost" size="sm" onClick={() => onOpenChange(false)}>
            <X className="h-4 w-4" />
          </Button>
        </DialogHeader>

        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="text-lg flex items-center gap-2">
                <Settings className="h-5 w-5" />
                Basic Information
              </CardTitle>
            </CardHeader>
            <CardContent className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="text-sm font-medium text-muted-foreground">Type</label>
                <p className="mt-1">{equipment.type}</p>
              </div>
              <div>
                <label className="text-sm font-medium text-muted-foreground">Brand</label>
                <p className="mt-1">{equipment.brand}</p>
              </div>
              <div>
                <label className="text-sm font-medium text-muted-foreground">Model</label>
                <p className="mt-1">{equipment.model}</p>
              </div>
              <div>
                <label className="text-sm font-medium text-muted-foreground">Serial Number</label>
                <p className="mt-1 font-mono text-sm">{equipment.serial_number}</p>
              </div>
              <div>
                <label className="text-sm font-medium text-muted-foreground">Status</label>
                <div className="mt-1">
                  <Badge variant={getStatusColor(equipment.status)}>
                    {equipment.status}
                  </Badge>
                </div>
              </div>
              <div>
                <label className="text-sm font-medium text-muted-foreground">Approval Status</label>
                <div className="mt-1">
                  <Badge variant={getApprovalStatusColor(equipment.approval_status)}>
                    {equipment.approval_status}
                  </Badge>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="text-lg flex items-center gap-2">
                <Wifi className="h-5 w-5" />
                Network Configuration
              </CardTitle>
            </CardHeader>
            <CardContent className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="text-sm font-medium text-muted-foreground">MAC Address</label>
                <p className="mt-1 font-mono text-sm">{equipment.mac_address || 'N/A'}</p>
              </div>
              <div>
                <label className="text-sm font-medium text-muted-foreground">IP Address</label>
                <p className="mt-1 font-mono text-sm">{equipment.ip_address?.toString() || 'N/A'}</p>
              </div>
              <div>
                <label className="text-sm font-medium text-muted-foreground">SNMP Community</label>
                <p className="mt-1">{equipment.snmp_community || 'N/A'}</p>
              </div>
              <div>
                <label className="text-sm font-medium text-muted-foreground">SNMP Version</label>
                <p className="mt-1">v{equipment.snmp_version || 'N/A'}</p>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="text-lg flex items-center gap-2">
                <MapPin className="h-5 w-5" />
                Location & Dates
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <label className="text-sm font-medium text-muted-foreground">Location</label>
                <p className="mt-1">{equipment.location || 'Not specified'}</p>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-medium text-muted-foreground">Purchase Date</label>
                  <p className="mt-1">
                    {equipment.purchase_date 
                      ? new Date(equipment.purchase_date).toLocaleDateString()
                      : 'N/A'
                    }
                  </p>
                </div>
                <div>
                  <label className="text-sm font-medium text-muted-foreground">Warranty End</label>
                  <p className="mt-1">
                    {equipment.warranty_end_date 
                      ? new Date(equipment.warranty_end_date).toLocaleDateString()
                      : 'N/A'
                    }
                  </p>
                </div>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-medium text-muted-foreground">Created</label>
                  <p className="mt-1 text-sm">
                    {equipment.created_at 
                      ? new Date(equipment.created_at).toLocaleString()
                      : 'N/A'
                    }
                  </p>
                </div>
                <div>
                  <label className="text-sm font-medium text-muted-foreground">Last Updated</label>
                  <p className="mt-1 text-sm">
                    {equipment.updated_at 
                      ? new Date(equipment.updated_at).toLocaleString()
                      : 'N/A'
                    }
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          {equipment.notes && (
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Notes</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground">{equipment.notes}</p>
              </CardContent>
            </Card>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default EquipmentDetailsDialog;
