
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { useTechnicalInstallations } from '@/hooks/useTechnicalInstallations';
import { useUsers } from '@/hooks/useUsers';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { CheckCircle, Clock, User, Phone, MapPin, Calendar, Wrench, FileText } from 'lucide-react';

const TechnicalInstallationManager: React.FC = () => {
  const { installations, isLoading, assignTechnician, completeInstallation, isAssigning, isCompleting } = useTechnicalInstallations();
  const { users } = useUsers();
  const [selectedInstallation, setSelectedInstallation] = useState<any>(null);
  const [showAssignDialog, setShowAssignDialog] = useState(false);
  const [showCompleteDialog, setShowCompleteDialog] = useState(false);
  const [selectedTechnician, setSelectedTechnician] = useState('');
  const [completionNotes, setCompletionNotes] = useState('');

  const getStatusBadgeVariant = (status: string) => {
    switch (status) {
      case 'completed':
        return 'default'; // Using default instead of success
      case 'assigned':
        return 'secondary';
      case 'pending':
        return 'outline';
      default:
        return 'secondary';
    }
  };

  const getInstallationStatusBadgeVariant = (status: string) => {
    switch (status) {
      case 'completed':
        return 'default';
      case 'scheduled':
        return 'secondary';
      case 'pending':
        return 'outline';
      default:
        return 'secondary';
    }
  };

  const handleAssignTechnician = () => {
    if (selectedInstallation && selectedTechnician) {
      assignTechnician({
        installationId: selectedInstallation.id,
        technicianId: selectedTechnician
      });
      setShowAssignDialog(false);
      setSelectedTechnician('');
    }
  };

  const handleCompleteInstallation = () => {
    if (selectedInstallation) {
      completeInstallation({
        installationId: selectedInstallation.id,
        notes: completionNotes
      });
      setShowCompleteDialog(false);
      setCompletionNotes('');
    }
  };

  // Filter for technicians using correct role values
  const technicians = users?.filter(user => 
    user.role === 'technician' || user.role === 'network_engineer' || user.role === 'infrastructure_manager'
  ) || [];

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-gray-900 mx-auto mb-4"></div>
          <p>Loading installations...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold">Technical Installation Management</h2>
        <div className="flex items-center gap-4">
          <Badge variant="outline" className="gap-2">
            <Clock className="h-3 w-3" />
            {installations.filter(i => i.status === 'pending').length} Pending
          </Badge>
          <Badge variant="secondary" className="gap-2">
            <User className="h-3 w-3" />
            {installations.filter(i => i.status === 'assigned').length} Assigned
          </Badge>
          <Badge variant="default" className="gap-2">
            <CheckCircle className="h-3 w-3" />
            {installations.filter(i => i.status === 'completed').length} Completed
          </Badge>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {installations.map((installation) => (
          <Card key={installation.id} className="hover:shadow-lg transition-shadow">
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <CardTitle className="text-lg">{installation.clients?.name}</CardTitle>
                <Badge variant={getStatusBadgeVariant(installation.status)}>
                  {installation.status}
                </Badge>
              </div>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="space-y-2">
                <div className="flex items-center gap-2 text-sm">
                  <Phone className="h-3 w-3 text-muted-foreground" />
                  {installation.clients?.phone}
                </div>
                <div className="flex items-center gap-2 text-sm">
                  <MapPin className="h-3 w-3 text-muted-foreground" />
                  {installation.clients?.address}
                </div>
                <div className="flex items-center gap-2 text-sm">
                  <Calendar className="h-3 w-3 text-muted-foreground" />
                  {installation.installation_date ? 
                    new Date(installation.installation_date).toLocaleDateString() : 
                    'Not scheduled'
                  }
                </div>
              </div>

              {installation.technician && (
                <div className="flex items-center gap-2 text-sm">
                  <User className="h-3 w-3 text-muted-foreground" />
                  {installation.technician.first_name} {installation.technician.last_name}
                </div>
              )}

              <div className="flex gap-2 pt-2">
                {installation.status === 'pending' && (
                  <Button 
                    size="sm" 
                    variant="outline"
                    onClick={() => {
                      setSelectedInstallation(installation);
                      setShowAssignDialog(true);
                    }}
                    className="flex items-center gap-1"
                  >
                    <User className="h-3 w-3" />
                    Assign
                  </Button>
                )}
                
                {installation.status === 'assigned' && (
                  <Button 
                    size="sm"
                    onClick={() => {
                      setSelectedInstallation(installation);
                      setShowCompleteDialog(true);
                    }}
                    className="flex items-center gap-1"
                  >
                    <CheckCircle className="h-3 w-3" />
                    Complete
                  </Button>
                )}
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {installations.length === 0 && (
        <div className="text-center py-12">
          <Wrench className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
          <h3 className="text-lg font-medium">No installations found</h3>
          <p className="text-muted-foreground">
            No technical installations are currently scheduled.
          </p>
        </div>
      )}

      {/* Assign Technician Dialog */}
      <Dialog open={showAssignDialog} onOpenChange={setShowAssignDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Assign Technician</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label htmlFor="client-info">Client</Label>
              <p className="text-sm text-muted-foreground">
                {selectedInstallation?.clients?.name} - {selectedInstallation?.clients?.phone}
              </p>
            </div>
            <div>
              <Label htmlFor="technician-select">Select Technician</Label>
              <Select value={selectedTechnician} onValueChange={setSelectedTechnician}>
                <SelectTrigger>
                  <SelectValue placeholder="Choose a technician" />
                </SelectTrigger>
                <SelectContent>
                  {technicians.map((tech) => (
                    <SelectItem key={tech.id} value={tech.id}>
                      {tech.first_name} {tech.last_name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowAssignDialog(false)}>
              Cancel
            </Button>
            <Button 
              onClick={handleAssignTechnician}
              disabled={!selectedTechnician || isAssigning}
            >
              {isAssigning ? 'Assigning...' : 'Assign Technician'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Complete Installation Dialog */}
      <Dialog open={showCompleteDialog} onOpenChange={setShowCompleteDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Complete Installation</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label htmlFor="client-info">Client</Label>
              <p className="text-sm text-muted-foreground">
                {selectedInstallation?.clients?.name} - {selectedInstallation?.clients?.phone}
              </p>
            </div>
            <div>
              <Label htmlFor="completion-notes">Completion Notes</Label>
              <Textarea
                id="completion-notes"
                placeholder="Add any notes about the installation completion..."
                value={completionNotes}
                onChange={(e) => setCompletionNotes(e.target.value)}
                rows={4}
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowCompleteDialog(false)}>
              Cancel
            </Button>
            <Button 
              onClick={handleCompleteInstallation}
              disabled={isCompleting}
              className="flex items-center gap-2"
            >
              {isCompleting ? (
                <>
                  <div className="animate-spin rounded-full h-3 w-3 border-b-2 border-white"></div>
                  Completing...
                </>
              ) : (
                <>
                  <CheckCircle className="h-3 w-3" />
                  Complete Installation
                </>
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default TechnicalInstallationManager;
