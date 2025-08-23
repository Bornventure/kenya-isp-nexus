
import { useMutation } from '@tanstack/react-query';
import { useToast } from '@/hooks/use-toast';
import { clientActivationService } from '@/services/clientActivationService';
import { supabase } from '@/integrations/supabase/client';

interface FullAutomationData {
  clientId: string;
  servicePackageId?: string;
  equipmentId?: string;
  installationNotes?: string;
  companyId: string;
}

interface ClientActivationResult {
  success: boolean;
  message: string;
}

interface WalletAnalysisResult {
  success: boolean;
  analysis: {
    currentBalance: number;
    requiredAmount: number;
    shortfall: number;
    daysUntilExpiry: number;
    packageName: string;
  };
  recommendedAction: {
    type: string;
    message: string;
    amount?: number;
  };
}

export const useFullAutomation = () => {
  const { toast } = useToast();

  const { mutateAsync: activateClientWithFullAutomation, isPending: isActivating } = useMutation({
    mutationFn: async (data: FullAutomationData): Promise<ClientActivationResult> => {
      console.log('Starting full client automation:', data);
      
      const result = await clientActivationService.activateClient({
        clientId: data.clientId,
        servicePackageId: data.servicePackageId || '',
        equipmentId: data.equipmentId,
        installationNotes: data.installationNotes,
        companyId: data.companyId
      });

      if (!result.success) {
        throw new Error(result.message);
      }

      return result;
    },
    onSuccess: (result) => {
      toast({
        title: "Client Activated Successfully",
        description: result.message,
      });
    },
    onError: (error: any) => {
      toast({
        title: "Activation Failed",
        description: error.message || 'Failed to activate client',
        variant: "destructive",
      });
    }
  });

  const analyzeClientWalletStatus = async (clientId: string): Promise<WalletAnalysisResult> => {
    try {
      // Get client details including wallet balance and subscription info
      const { data: client, error: clientError } = await supabase
        .from('clients')
        .select(`
          *,
          service_packages (
            name,
            monthly_rate
          )
        `)
        .eq('id', clientId)
        .single();

      if (clientError || !client) {
        throw new Error('Client not found');
      }

      const currentBalance = client.wallet_balance || 0;
      const requiredAmount = client.monthly_rate || 0;
      const shortfall = Math.max(0, requiredAmount - currentBalance);
      const packageName = client.service_packages?.name || 'Unknown Package';
      
      // Calculate days until expiry
      const subscriptionEndDate = client.subscription_end_date ? new Date(client.subscription_end_date) : new Date();
      const now = new Date();
      const daysUntilExpiry = Math.max(0, Math.ceil((subscriptionEndDate.getTime() - now.getTime()) / (1000 * 60 * 60 * 24)));

      // Determine recommended action
      let recommendedAction: { type: string; message: string; amount?: number };

      if (currentBalance >= requiredAmount) {
        recommendedAction = {
          type: 'auto_renew',
          message: 'Sufficient balance available for automatic renewal',
          amount: requiredAmount
        };
      } else if (currentBalance >= requiredAmount * 0.5) {
        recommendedAction = {
          type: 'partial_payment',
          message: `Top up with KES ${shortfall.toFixed(2)} to enable auto-renewal`,
          amount: shortfall
        };
      } else if (daysUntilExpiry <= 3) {
        recommendedAction = {
          type: 'suspend_service',
          message: 'Service will be suspended due to insufficient balance',
          amount: shortfall
        };
      } else {
        recommendedAction = {
          type: 'top_up_required',
          message: `Please top up wallet with KES ${shortfall.toFixed(2)}`,
          amount: shortfall
        };
      }

      return {
        success: true,
        analysis: {
          currentBalance,
          requiredAmount,
          shortfall,
          daysUntilExpiry,
          packageName
        },
        recommendedAction
      };
    } catch (error) {
      console.error('Error analyzing wallet status:', error);
      throw error;
    }
  };

  const processSmartRenewalForClient = async (clientId: string): Promise<void> => {
    try {
      const analysis = await analyzeClientWalletStatus(clientId);
      
      if (analysis.recommendedAction.type === 'auto_renew') {
        // Process automatic renewal
        const { error } = await supabase.rpc('process_subscription_renewal', {
          p_client_id: clientId
        });

        if (error) {
          throw new Error(`Auto-renewal failed: ${error.message}`);
        }

        toast({
          title: "Auto-Renewal Successful",
          description: "Service has been renewed automatically using wallet balance",
        });

      } else if (analysis.recommendedAction.type === 'partial_payment') {
        // Send notification for partial payment needed
        toast({
          title: "Top-up Required",
          description: analysis.recommendedAction.message,
          variant: "destructive",
        });

      } else if (analysis.recommendedAction.type === 'suspend_service') {
        // Update client status to suspended
        await supabase
          .from('clients')
          .update({ status: 'suspended' })
          .eq('id', clientId);

        toast({
          title: "Service Suspended",
          description: "Client service suspended due to insufficient wallet balance",
          variant: "destructive",
        });

      } else {
        toast({
          title: "Action Required",
          description: analysis.recommendedAction.message,
        });
      }
    } catch (error) {
      console.error('Error processing smart renewal:', error);
      toast({
        title: "Smart Renewal Failed",
        description: error instanceof Error ? error.message : 'Unknown error occurred',
        variant: "destructive",
      });
    }
  };

  return {
    activateClientWithFullAutomation,
    isActivating,
    analyzeClientWalletStatus,
    processSmartRenewalForClient
  };
};
