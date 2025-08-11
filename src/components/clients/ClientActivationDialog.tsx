import React, { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Progress } from '@/components/ui/progress';
import { useAuth } from '@/contexts/AuthContext';
import { useClientOnboarding } from '@/hooks/useClientOnboarding';
import { Loader2, Zap, CheckCircle, XCircle, AlertCircle } from 'lucide-react';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';

interface ClientActivationDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  client: any;
  onActivated?: () => void;
}

const ClientActivationDialog: React.FC<ClientActivationDialogProps> = ({
  open,
  onOpenChange,
  client,
  onActivated
}) => {
  const { profile } = useAuth();
  const { startOnboarding, isOnboarding, onboardingProgress, getOnboardingStepProgress } = useClientOnboarding();
  const [selectedEquipment, setSelectedEquipment] = useState('');
  const [activationNotes, setActivationNotes] = useState('');

  // Fetch available equipment
  const { data: availableEquipment = [] } = useQuery({
    queryKey: ['available-equipment', profile?.isp_company_id],
    queryFn: async () => {
      if (!profile?.isp_company_id) return [];

      const { data, error } = await supabase
        .from('equipment')
        .select('*')
        .eq('isp_company_id', profile.isp_company_id)
        .eq('status', 'available')
        .order('created_at', { ascending: false });

      if (error) throw error;
      return data || [];
    },
    enabled: !!profile?.isp_company_id && open,
  });

  const handleActivation = async () => {
    if (!profile?.id) return;

    const result = await startOnboarding(client.id, selectedEquipment || undefined);
    
    if (result?.success) {
      onActivated?.();
      // Keep dialog open to show progress, auto-close after a delay
      setTimeout(() => {
        onOpenChange(false);
        setSelectedEquipment('');
        setActivationNotes('');
      }, 3000);
    }
  };

  const getStepIcon = (status: string) => {
    switch (status) {
      case 'completed':
        return <CheckCircle className="h-4 w-4 text-green-600" />;
      case 'failed':
        return <XCircle className="h-4 w-4 text-red-600" />;
      case 'in_progress':
        return <Loader2 className="h-4 w-4 animate-spin text-blue-600" />;
      default:
        return <AlertCircle className="h-4 w-4 text-gray-400" />;
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Zap className="h-5 w-5 text-blue-500" />
            Complete Client Onboarding & Network Automation
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-6">
          {!onboardingProgress && (
            <>
              <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg">
                <div className="flex items-start gap-3">
                  <CheckCircle className="h-5 w-5 text-blue-600 mt-0.5" />
                  <div className="text-sm text-blue-800">
                    <h4 className="font-medium mb-1">Complete Network Automation Includes:</h4>
                    <ul className="list-disc list-inside space-y-1 text-xs">
                      <li>Equipment assignment and configuration</li>
                      <li>MikroTik router PPPoE setup</li>
                      <li>RADIUS user creation and authentication</li>
                      <li>Network profile and firewall rules</li>
                      <li>Live monitoring and bandwidth tracking</li>
                      <li>Service activation and billing setup</li>
                      <li>Welcome notifications and documentation</li>
                    </ul>
                  </div>
                </div>
              </div>

              <div className="space-y-4">
                <div>
                  <Label htmlFor="equipment">Assign Equipment (Optional)</Label>
                  <Select value={selectedEquipment} onValueChange={setSelectedEquipment}>
                    <SelectTrigger>
                      <SelectValue placeholder="Auto-assign available equipment or select specific" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="">Auto-assign best available</SelectItem>
                      {availableEquipment.map((item) => (
                        <SelectItem key={item.id} value={item.id}>
                          {item.brand} {item.model} - {item.serial_number}
                          {item.type && ` (${item.type})`}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <p className="text-xs text-gray-500 mt-1">
                    If no equipment is selected, the system will auto-assign the best available router
                  </p>
                </div>

                <div>
                  <Label htmlFor="notes">Installation Notes</Label>
                  <Textarea
                    id="notes"
                    value={activationNotes}
                    onChange={(e) => setActivationNotes(e.target.value)}
                    placeholder="Enter any installation or configuration notes..."
                    rows={3}
                  />
                </div>
              </div>
            </>
          )}

          {onboardingProgress && (
            <div className="space-y-4">
              <div className="space-y-2">
                <div className="flex justify-between items-center">
                  <h4 className="font-medium">Onboarding Progress</h4>
                  <span className="text-sm text-gray-600">{getOnboardingStepProgress()}%</span>
                </div>
                <Progress value={getOnboardingStepProgress()} className="w-full" />
              </div>

              <div className="space-y-2 max-h-64 overflow-y-auto">
                {onboardingProgress.steps.map((step, index) => (
                  <div
                    key={index}
                    className={`flex items-center gap-3 p-3 rounded-lg border ${
                      step.status === 'completed' 
                        ? 'bg-green-50 border-green-200' 
                        : step.status === 'failed'
                        ? 'bg-red-50 border-red-200'
                        : step.status === 'in_progress'
                        ? 'bg-blue-50 border-blue-200'
                        : 'bg-gray-50 border-gray-200'
                    }`}
                  >
                    {getStepIcon(step.status)}
                    <div className="flex-1">
                      <div className="font-medium text-sm">{step.name}</div>
                      {step.error && (
                        <div className="text-xs text-red-600 mt-1">{step.error}</div>
                      )}
                      {step.details && step.status === 'completed' && (
                        <div className="text-xs text-gray-600 mt-1">
                          {typeof step.details === 'object' 
                            ? Object.entries(step.details).map(([key, value]) => `${key}: ${value}`).join(', ')
                            : step.details
                          }
                        </div>
                      )}
                    </div>
                  </div>
                ))}
              </div>

              {onboardingProgress.success && (
                <div className="p-4 bg-green-50 border border-green-200 rounded-lg">
                  <div className="flex items-center gap-2 text-green-800">
                    <CheckCircle className="h-5 w-5" />
                    <span className="font-medium">Client Successfully Activated!</span>
                  </div>
                  <p className="text-sm text-green-700 mt-1">
                    The client is now fully onboarded with live network monitoring enabled.
                  </p>
                </div>
              )}

              {!onboardingProgress.success && onboardingProgress.steps.some(s => s.status === 'failed') && (
                <div className="p-4 bg-red-50 border border-red-200 rounded-lg">
                  <div className="flex items-center gap-2 text-red-800">
                    <XCircle className="h-5 w-5" />
                    <span className="font-medium">Onboarding Failed</span>
                  </div>
                  <p className="text-sm text-red-700 mt-1">{onboardingProgress.message}</p>
                </div>
              )}
            </div>
          )}

          <div className="flex justify-end gap-3">
            <Button 
              variant="outline" 
              onClick={() => onOpenChange(false)}
              disabled={isOnboarding}
            >
              {onboardingProgress?.success ? 'Close' : 'Cancel'}
            </Button>
            {!onboardingProgress && (
              <Button 
                onClick={handleActivation}
                disabled={isOnboarding}
                className="gap-2"
              >
                {isOnboarding && <Loader2 className="h-4 w-4 animate-spin" />}
                {isOnboarding ? 'Processing Onboarding...' : 'Start Complete Onboarding'}
              </Button>
            )}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default ClientActivationDialog;
