
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Separator } from '@/components/ui/separator';
import { CheckCircle, Clock, MapPin, Phone, User, Loader2, Wrench } from 'lucide-react';
import { useTechnicalInstallations, TechnicalInstallation } from '@/hooks/useTechnicalInstallations';
import { useToast } from '@/hooks/use-toast';

interface CompletionDialogProps {
  installation: TechnicalInstallation;
  open: boolean;
  onClose: () => void;
  onComplete: (id: string, notes: string) => void;
}

const CompletionDialog: React.FC<CompletionDialogProps> = ({
  installation,
  open,
  onClose,
  onComplete,
}) => {
  const [completionNotes, setCompletionNotes] = useState('');
  const [isCompleting, setIsCompleting] = useState(false);

  const handleComplete = async () => {
    setIsCompleting(true);
    await onComplete(installation.id, completionNotes);
    setIsCompleting(false);
    onClose();
  };

  const maskPhoneNumber = (phone: string) => {
    if (!phone) return '';
    const cleaned = phone.replace(/\D/g, '');
    if (cleaned.length >= 10) {
      return cleaned.substring(0, 3) + 'xxx' + cleaned.substring(6);
    }
    return phone;
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle>Complete Installation - {installation.clients?.name}</DialogTitle>
        </DialogHeader>

        <div className="space-y-4">
          {/* Client Information */}
          <div>
            <h3 className="text-lg font-medium mb-3 flex items-center gap-2">
              <User className="h-5 w-5" />
              Client Information
            </h3>
            <div className="bg-gray-50 p-4 rounded-lg space-y-2">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label>Name</Label>
                  <p className="text-sm">{installation.clients?.name}</p>
                </div>
                <div>
                  <Label>Phone</Label>
                  <p className="text-sm">{maskPhoneNumber(installation.clients?.phone || '')}</p>
                </div>
                <div className="col-span-2">
                  <Label>Address</Label>
                  <p className="text-sm">{installation.clients?.address}</p>
                </div>
                <div>
                  <Label>County</Label>
                  <p className="text-sm">{installation.clients?.county}</p>
                </div>
                <div>
                  <Label>Sub County</Label>
                  <p className="text-sm">{installation.clients?.sub_county}</p>
                </div>
              </div>
            </div>
          </div>

          <Separator />

          {/* Completion Notes */}
          <div>
            <Label htmlFor="completion_notes">Installation Completion Notes</Label>
            <Textarea
              id="completion_notes"
              value={completionNotes}
              onChange={(e) => setCompletionNotes(e.target.value)}
              placeholder="Enter details about the installation completion, any issues encountered, equipment installed, etc."
              className="mt-2"
            />
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={onClose} disabled={isCompleting}>
            Cancel
          </Button>
          <Button onClick={handleComplete} disabled={isCompleting} className="gap-2">
            {isCompleting ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <CheckCircle className="h-4 w-4" />
            )}
            {isCompleting ? 'Completing...' : 'Mark as Completed'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

const TechnicalInstallationManager: React.FC = () => {
  const { installations, isLoading, completeInstallation } = useTechnicalInstallations();
  const { toast } = useToast();
  const [selectedInstallation, setSelectedInstallation] = useState<TechnicalInstallation | null>(null);

  const pendingInstallations = installations.filter(inst => inst.status === 'pending');
  const completedInstallations = installations.filter(inst => inst.status === 'completed');

  const handleComplete = async (id: string, notes: string) => {
    try {
      await completeInstallation({ id, completion_notes: notes });
      setSelectedInstallation(null);
    } catch (error) {
      console.error('Error completing installation:', error);
    }
  };

  const maskPhoneNumber = (phone: string) => {
    if (!phone) return '';
    const cleaned = phone.replace(/\D/g, '');
    if (cleaned.length >= 10) {
      return cleaned.substring(0, 3) + 'xxx' + cleaned.substring(6);
    }
    return phone;
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-48">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-2">
        <Wrench className="h-6 w-6" />
        <h2 className="text-2xl font-bold">Technical Installation Management</h2>
      </div>

      {/* Pending Installations */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Clock className="h-5 w-5" />
            Pending Installations ({pendingInstallations.length})
          </CardTitle>
        </CardHeader>
        <CardContent>
          {pendingInstallations.length === 0 ? (
            <p className="text-center text-gray-500 py-8">No pending installations</p>
          ) : (
            <div className="space-y-4">
              {pendingInstallations.map((installation) => (
                <div key={installation.id} className="border rounded-lg p-4">
                  <div className="flex justify-between items-start mb-3">
                    <div>
                      <h3 className="font-semibold">{installation.clients?.name}</h3>
                      <p className="text-sm text-gray-600">
                        Phone: {maskPhoneNumber(installation.clients?.phone || '')}
                      </p>
                    </div>
                    <Badge variant="secondary">
                      <Clock className="h-3 w-3 mr-1" />
                      Pending
                    </Badge>
                  </div>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-3">
                    <div>
                      <Label className="text-xs text-gray-500">Address</Label>
                      <p className="text-sm">{installation.clients?.address}</p>
                    </div>
                    <div>
                      <Label className="text-xs text-gray-500">Location</Label>
                      <p className="text-sm">{installation.clients?.county}, {installation.clients?.sub_county}</p>
                    </div>
                  </div>

                  <div className="flex justify-between items-center">
                    <p className="text-xs text-gray-500">
                      Created: {new Date(installation.created_at).toLocaleDateString()}
                    </p>
                    <Button
                      size="sm"
                      onClick={() => setSelectedInstallation(installation)}
                      className="gap-2"
                    >
                      <CheckCircle className="h-4 w-4" />
                      Mark Complete
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Completed Installations */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <CheckCircle className="h-5 w-5" />
            Completed Installations ({completedInstallations.length})
          </CardTitle>
        </CardHeader>
        <CardContent>
          {completedInstallations.length === 0 ? (
            <p className="text-center text-gray-500 py-8">No completed installations</p>
          ) : (
            <div className="space-y-4">
              {completedInstallations.map((installation) => (
                <div key={installation.id} className="border rounded-lg p-4 bg-green-50">
                  <div className="flex justify-between items-start mb-3">
                    <div>
                      <h3 className="font-semibold">{installation.clients?.name}</h3>
                      <p className="text-sm text-gray-600">
                        Phone: {maskPhoneNumber(installation.clients?.phone || '')}
                      </p>
                    </div>
                    <Badge variant="default">
                      <CheckCircle className="h-3 w-3 mr-1" />
                      Completed
                    </Badge>
                  </div>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-3">
                    <div>
                      <Label className="text-xs text-gray-500">Address</Label>
                      <p className="text-sm">{installation.clients?.address}</p>
                    </div>
                    <div>
                      <Label className="text-xs text-gray-500">Completed</Label>
                      <p className="text-sm">
                        {installation.completed_at 
                          ? new Date(installation.completed_at).toLocaleDateString() 
                          : 'N/A'}
                      </p>
                    </div>
                  </div>

                  {installation.completion_notes && (
                    <div className="mt-3 p-3 bg-white rounded border">
                      <Label className="text-xs text-gray-500">Completion Notes</Label>
                      <p className="text-sm">{installation.completion_notes}</p>
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Completion Dialog */}
      {selectedInstallation && (
        <CompletionDialog
          installation={selectedInstallation}
          open={!!selectedInstallation}
          onClose={() => setSelectedInstallation(null)}
          onComplete={handleComplete}
        />
      )}
    </div>
  );
};

export default TechnicalInstallationManager;
