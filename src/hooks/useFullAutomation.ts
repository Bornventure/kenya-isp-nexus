
import { useEffect, useCallback } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/hooks/use-toast';
import { clientActivationService, ClientActivationData } from '@/services/clientActivationService';
import { smartRenewalService } from '@/services/smartRenewalService';
import { precisionTimerService } from '@/services/precisionTimerService';

export const useFullAutomation = () => {
  const { profile } = useAuth();
  const { toast } = useToast();

  // Start precision timer service when component mounts
  useEffect(() => {
    if (profile?.role === 'super_admin' || profile?.role === 'isp_admin') {
      precisionTimerService.start();
      
      return () => {
        precisionTimerService.stop();
      };
    }
  }, [profile]);

  const activateClientWithFullAutomation = useCallback(async (data: ClientActivationData) => {
    try {
      console.log('Starting full automation for client activation...');
      
      const result = await clientActivationService.activateClient(data);
      
      if (result.success) {
        toast({
          title: "Client Activated Successfully",
          description: "Full automation completed: RADIUS, MikroTik, monitoring, and notifications configured.",
        });
      } else {
        toast({
          title: "Activation Completed with Issues",
          description: result.message,
          variant: "destructive",
        });
      }
      
      return result;
    } catch (error) {
      console.error('Full automation failed:', error);
      toast({
        title: "Activation Failed",
        description: "Full automation process encountered errors.",
        variant: "destructive",
      });
      return {
        success: false,
        message: error instanceof Error ? error.message : 'Unknown error'
      };
    }
  }, [toast]);

  const analyzeClientWalletStatus = useCallback(async (clientId: string) => {
    try {
      const analysis = await smartRenewalService.analyzeClientWallet(clientId);
      if (!analysis) return null;

      const renewalAction = await smartRenewalService.processSmartRenewal(analysis);
      
      return {
        analysis,
        recommendedAction: renewalAction
      };
    } catch (error) {
      console.error('Wallet analysis failed:', error);
      return null;
    }
  }, []);

  const processSmartRenewalForClient = useCallback(async (clientId: string) => {
    try {
      const analysis = await smartRenewalService.analyzeClientWallet(clientId);
      if (!analysis) return null;

      const renewalAction = await smartRenewalService.processSmartRenewal(analysis);
      
      // Show toast based on action type
      switch (renewalAction.type) {
        case 'auto_renew':
          toast({
            title: "Service Renewed",
            description: `Client service renewed automatically for KES ${renewalAction.amount}`,
          });
          break;
        case 'partial_payment':
          toast({
            title: "Partial Renewal",
            description: renewalAction.message,
          });
          break;
        case 'top_up_required':
          toast({
            title: "Top-up Required",
            description: renewalAction.message,
            variant: "destructive",
          });
          break;
        case 'suspend_service':
          toast({
            title: "Service Suspended",
            description: "Insufficient funds for renewal",
            variant: "destructive",
          });
          break;
      }
      
      return renewalAction;
    } catch (error) {
      console.error('Smart renewal failed:', error);
      return null;
    }
  }, [toast]);

  return {
    activateClientWithFullAutomation,
    analyzeClientWalletStatus,
    processSmartRenewalForClient,
    isAutomationActive: profile?.role === 'super_admin' || profile?.role === 'isp_admin'
  };
};
