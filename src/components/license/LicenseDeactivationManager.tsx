
import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { AlertTriangle, CheckCircle, XCircle } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';

interface ISPCompany {
  id: string;
  name: string;
  license_type: string;
  is_active: boolean;
  current_client_count: number;
  client_limit: number;
  deactivation_reason?: string | null;
  deactivated_at?: string | null;
}

interface LicenseDeactivationManagerProps {
  companies: ISPCompany[];
  onCompanyUpdate: () => void;
}

export const LicenseDeactivationManager: React.FC<LicenseDeactivationManagerProps> = ({
  companies,
  onCompanyUpdate
}) => {
  const [selectedCompany, setSelectedCompany] = useState<ISPCompany | null>(null);
  const [deactivationReason, setDeactivationReason] = useState('');
  const [isDeactivating, setIsDeactivating] = useState(false);
  const [isReactivating, setIsReactivating] = useState(false);
  const [showDeactivateDialog, setShowDeactivateDialog] = useState(false);
  const [showReactivateDialog, setShowReactivateDialog] = useState(false);
  const { toast } = useToast();

  const handleDeactivate = async () => {
    if (!selectedCompany || !deactivationReason.trim()) {
      toast({
        title: "Error",
        description: "Please provide a reason for deactivation",
        variant: "destructive"
      });
      return;
    }

    setIsDeactivating(true);
    try {
      const { error } = await supabase
        .from('isp_companies')
        .update({
          is_active: false,
          deactivation_reason: deactivationReason.trim(),
          deactivated_at: new Date().toISOString()
        })
        .eq('id', selectedCompany.id);

      if (error) throw error;

      toast({
        title: "License Deactivated",
        description: `${selectedCompany.name} has been deactivated successfully.`
      });

      setShowDeactivateDialog(false);
      setDeactivationReason('');
      setSelectedCompany(null);
      onCompanyUpdate();
    } catch (error) {
      console.error('Error deactivating license:', error);
      toast({
        title: "Error",
        description: "Failed to deactivate license. Please try again.",
        variant: "destructive"
      });
    } finally {
      setIsDeactivating(false);
    }
  };

  const handleReactivate = async () => {
    if (!selectedCompany) return;

    setIsReactivating(true);
    try {
      const { error } = await supabase
        .from('isp_companies')
        .update({
          is_active: true,
          deactivation_reason: null,
          deactivated_at: null
        })
        .eq('id', selectedCompany.id);

      if (error) throw error;

      toast({
        title: "License Reactivated",
        description: `${selectedCompany.name} has been reactivated successfully.`
      });

      setShowReactivateDialog(false);
      setSelectedCompany(null);
      onCompanyUpdate();
    } catch (error) {
      console.error('Error reactivating license:', error);
      toast({
        title: "Error",
        description: "Failed to reactivate license. Please try again.",
        variant: "destructive"
      });
    } finally {
      setIsReactivating(false);
    }
  };

  return (
    <>
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <AlertTriangle className="h-5 w-5" />
            License Deactivation Management
          </CardTitle>
          <CardDescription>
            Manage license activation status for ISP companies
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {companies.map((company) => (
              <div key={company.id} className="flex items-center justify-between p-4 border rounded-lg">
                <div className="flex-1">
                  <div className="flex items-center gap-3">
                    <h3 className="font-semibold">{company.name}</h3>
                    <Badge variant={company.is_active ? "default" : "destructive"}>
                      {company.is_active ? (
                        <CheckCircle className="h-3 w-3 mr-1" />
                      ) : (
                        <XCircle className="h-3 w-3 mr-1" />
                      )}
                      {company.is_active ? 'Active' : 'Deactivated'}
                    </Badge>
                  </div>
                  <div className="text-sm text-muted-foreground mt-1">
                    License: {company.license_type} | Clients: {company.current_client_count}/{company.client_limit}
                  </div>
                  {!company.is_active && company.deactivation_reason && (
                    <div className="text-sm text-red-600 mt-2">
                      <strong>Reason:</strong> {company.deactivation_reason}
                    </div>
                  )}
                  {!company.is_active && company.deactivated_at && (
                    <div className="text-sm text-muted-foreground">
                      Deactivated: {new Date(company.deactivated_at).toLocaleDateString()}
                    </div>
                  )}
                </div>
                <div className="flex gap-2">
                  {company.is_active ? (
                    <Button
                      variant="destructive"
                      size="sm"
                      onClick={() => {
                        setSelectedCompany(company);
                        setShowDeactivateDialog(true);
                      }}
                    >
                      Deactivate
                    </Button>
                  ) : (
                    <Button
                      variant="default"
                      size="sm"
                      onClick={() => {
                        setSelectedCompany(company);
                        setShowReactivateDialog(true);
                      }}
                    >
                      Reactivate
                    </Button>
                  )}
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Deactivation Dialog */}
      <Dialog open={showDeactivateDialog} onOpenChange={setShowDeactivateDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Deactivate License</DialogTitle>
            <DialogDescription>
              You are about to deactivate the license for {selectedCompany?.name}. 
              This will prevent them from accessing the system.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <label className="text-sm font-medium">Reason for deactivation *</label>
              <Textarea
                value={deactivationReason}
                onChange={(e) => setDeactivationReason(e.target.value)}
                placeholder="Please provide a detailed reason for deactivating this license..."
                className="mt-1"
                rows={3}
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowDeactivateDialog(false)}>
              Cancel
            </Button>
            <Button
              variant="destructive"
              onClick={handleDeactivate}
              disabled={isDeactivating || !deactivationReason.trim()}
            >
              {isDeactivating ? 'Deactivating...' : 'Deactivate License'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Reactivation Dialog */}
      <Dialog open={showReactivateDialog} onOpenChange={setShowReactivateDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Reactivate License</DialogTitle>
            <DialogDescription>
              You are about to reactivate the license for {selectedCompany?.name}. 
              This will restore their access to the system.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowReactivateDialog(false)}>
              Cancel
            </Button>
            <Button
              onClick={handleReactivate}
              disabled={isReactivating}
            >
              {isReactivating ? 'Reactivating...' : 'Reactivate License'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
};

export default LicenseDeactivationManager;
