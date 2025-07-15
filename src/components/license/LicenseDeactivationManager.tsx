
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { AlertTriangle, Shield, ShieldOff, ShieldCheck } from 'lucide-react';
import { useSuperAdminCompanies } from '@/hooks/useSuperAdminCompanies';
import { Alert, AlertDescription } from '@/components/ui/alert';

const LicenseDeactivationManager: React.FC = () => {
  const { toast } = useToast();
  const { data: companies, refetch } = useSuperAdminCompanies();
  const [selectedCompanyId, setSelectedCompanyId] = useState('');
  const [deactivationReason, setDeactivationReason] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);

  const deactivationReasons = [
    'Payment overdue',
    'License violation',
    'Maintenance',
    'Account suspension',
    'Contract termination',
    'Technical issues',
    'Other'
  ];

  const handleDeactivateLicense = async () => {
    if (!selectedCompanyId || !deactivationReason) {
      toast({
        title: "Validation Error",
        description: "Please select a company and provide a deactivation reason.",
        variant: "destructive",
      });
      return;
    }

    setIsProcessing(true);
    try {
      const { error } = await supabase
        .from('isp_companies')
        .update({
          is_active: false,
          deactivation_reason: deactivationReason,
          deactivated_at: new Date().toISOString()
        })
        .eq('id', selectedCompanyId);

      if (error) throw error;

      toast({
        title: "License Deactivated",
        description: "The license has been successfully deactivated.",
      });

      setSelectedCompanyId('');
      setDeactivationReason('');
      refetch();
    } catch (error) {
      console.error('Error deactivating license:', error);
      toast({
        title: "Deactivation Failed",
        description: "Failed to deactivate the license. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsProcessing(false);
    }
  };

  const handleReactivateLicense = async (companyId: string) => {
    setIsProcessing(true);
    try {
      const { error } = await supabase
        .from('isp_companies')
        .update({
          is_active: true,
          deactivation_reason: null,
          deactivated_at: null,
          reactivated_at: new Date().toISOString()
        })
        .eq('id', companyId);

      if (error) throw error;

      toast({
        title: "License Reactivated",
        description: "The license has been successfully reactivated.",
      });

      refetch();
    } catch (error) {
      console.error('Error reactivating license:', error);
      toast({
        title: "Reactivation Failed",
        description: "Failed to reactivate the license. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsProcessing(false);
    }
  };

  const activeCompanies = companies?.filter(company => company.is_active) || [];
  const inactiveCompanies = companies?.filter(company => !company.is_active) || [];

  return (
    <div className="space-y-6">
      {/* Deactivation Section */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <ShieldOff className="h-5 w-5 text-red-600" />
            Deactivate License
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <Alert>
            <AlertTriangle className="h-4 w-4" />
            <AlertDescription>
              Deactivating a license will immediately suspend all services for the selected company.
              Users will see a deactivation banner and lose access to most features.
            </AlertDescription>
          </Alert>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label htmlFor="company-select">Select Company</Label>
              <Select value={selectedCompanyId} onValueChange={setSelectedCompanyId}>
                <SelectTrigger>
                  <SelectValue placeholder="Choose a company to deactivate" />
                </SelectTrigger>
                <SelectContent>
                  {activeCompanies.map((company) => (
                    <SelectItem key={company.id} value={company.id}>
                      {company.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label htmlFor="reason-select">Deactivation Reason</Label>
              <Select value={deactivationReason} onValueChange={setDeactivationReason}>
                <SelectTrigger>
                  <SelectValue placeholder="Select reason" />
                </SelectTrigger>
                <SelectContent>
                  {deactivationReasons.map((reason) => (
                    <SelectItem key={reason} value={reason}>
                      {reason}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          {deactivationReason === 'Other' && (
            <div>
              <Label htmlFor="custom-reason">Custom Reason</Label>
              <Textarea
                id="custom-reason"
                placeholder="Provide specific details for the deactivation..."
                value={deactivationReason === 'Other' ? '' : deactivationReason}
                onChange={(e) => setDeactivationReason(e.target.value)}
              />
            </div>
          )}

          <Button
            onClick={handleDeactivateLicense}
            disabled={isProcessing || !selectedCompanyId || !deactivationReason}
            variant="destructive"
            className="w-full"
          >
            <ShieldOff className="h-4 w-4 mr-2" />
            {isProcessing ? 'Deactivating...' : 'Deactivate License'}
          </Button>
        </CardContent>
      </Card>

      {/* Reactivation Section */}
      {inactiveCompanies.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <ShieldCheck className="h-5 w-5 text-green-600" />
              Reactivate Licenses
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {inactiveCompanies.map((company) => (
                <div key={company.id} className="flex items-center justify-between p-4 border rounded-lg bg-red-50">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-2">
                      <h3 className="font-semibold">{company.name}</h3>
                      <Badge variant="destructive">Deactivated</Badge>
                    </div>
                    <p className="text-sm text-gray-600 mb-1">
                      <span className="font-medium">Reason:</span> {company.deactivation_reason || 'No reason provided'}
                    </p>
                    <p className="text-sm text-gray-600">
                      <span className="font-medium">Deactivated:</span> {
                        company.deactivated_at 
                          ? new Date(company.deactivated_at).toLocaleDateString()
                          : 'Unknown'
                      }
                    </p>
                  </div>
                  <Button
                    onClick={() => handleReactivateLicense(company.id)}
                    disabled={isProcessing}
                    variant="outline"
                    className="ml-4"
                  >
                    <Shield className="h-4 w-4 mr-2" />
                    Reactivate
                  </Button>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default LicenseDeactivationManager;
