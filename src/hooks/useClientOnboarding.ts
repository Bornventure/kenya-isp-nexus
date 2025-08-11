
import { useState, useCallback } from 'react';
import { useToast } from '@/hooks/use-toast';
import { clientOnboardingService, OnboardingResult } from '@/services/clientOnboardingService';
import { liveNetworkMonitoringService } from '@/services/liveNetworkMonitoringService';

export const useClientOnboarding = () => {
  const { toast } = useToast();
  const [isOnboarding, setIsOnboarding] = useState(false);
  const [onboardingProgress, setOnboardingProgress] = useState<OnboardingResult | null>(null);

  const startOnboarding = useCallback(async (clientId: string, equipmentId?: string) => {
    setIsOnboarding(true);
    setOnboardingProgress(null);

    try {
      console.log('Starting client onboarding for:', clientId);
      
      const result = await clientOnboardingService.processClientOnboarding(clientId, equipmentId);
      setOnboardingProgress(result);

      if (result.success) {
        // Start monitoring the client
        liveNetworkMonitoringService.startMonitoring();
        
        toast({
          title: "Client Onboarding Complete",
          description: "Client has been successfully activated with full network automation.",
        });
      } else {
        toast({
          title: "Onboarding Failed",
          description: result.message,
          variant: "destructive",
        });
      }

      return result;
    } catch (error) {
      console.error('Onboarding error:', error);
      toast({
        title: "Onboarding Error",
        description: "An unexpected error occurred during client onboarding.",
        variant: "destructive",
      });
      return null;
    } finally {
      setIsOnboarding(false);
    }
  }, [toast]);

  const getOnboardingStepProgress = useCallback(() => {
    if (!onboardingProgress) return 0;
    
    const completedSteps = onboardingProgress.steps.filter(step => step.status === 'completed').length;
    return Math.round((completedSteps / onboardingProgress.steps.length) * 100);
  }, [onboardingProgress]);

  return {
    startOnboarding,
    isOnboarding,
    onboardingProgress,
    getOnboardingStepProgress,
  };
};
