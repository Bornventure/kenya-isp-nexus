
import { useState, useCallback } from 'react';
import { useToast } from '@/hooks/use-toast';
import { clientActivationService, ClientActivationData } from '@/services/clientActivationService';

export const useFullAutomation = () => {
  const { toast } = useToast();
  const [isProcessing, setIsProcessing] = useState(false);

  const processFullAutomation = useCallback(async (data: ClientActivationData) => {
    setIsProcessing(true);
    
    try {
      console.log('Starting full automation process for client:', data.clientId);
      
      // Activate the client
      const activationResult = await clientActivationService.activateClient(data.clientId);
      
      if (activationResult.success) {
        toast({
          title: "Full Automation Complete",
          description: "Client has been fully activated with all automation processes.",
        });
        
        return {
          success: true,
          message: activationResult.message || 'Full automation completed successfully',
        };
      } else {
        toast({
          title: "Automation Failed",
          description: activationResult.message || "Failed to complete full automation process.",
          variant: "destructive",
        });
        
        return {
          success: false,
          message: activationResult.message || 'Full automation failed',
        };
      }
    } catch (error) {
      console.error('Full automation error:', error);
      
      toast({
        title: "Automation Error",
        description: "An unexpected error occurred during full automation.",
        variant: "destructive",
      });
      
      return {
        success: false,
        message: 'Full automation failed due to an error',
      };
    } finally {
      setIsProcessing(false);
    }
  }, [toast]);

  return {
    processFullAutomation,
    isProcessing,
  };
};
