
import { useState, useCallback } from 'react';
import { realNetworkService } from '@/services/realNetworkService';
import { useToast } from '@/hooks/use-toast';

export const useRealNetworkTesting = () => {
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();

  const testConnection = useCallback(async (
    ipAddress: string, 
    testType: 'ping' | 'snmp' | 'mikrotik' = 'ping'
  ) => {
    setIsLoading(true);
    
    try {
      const result = await realNetworkService.testConnection(ipAddress, testType);
      
      if (result.isDemoResult) {
        toast({
          title: "🚨 Demo Mode Active",
          description: "This is a simulated result. Configure network agents for real testing.",
          variant: "destructive",
        });
      }

      return result;
    } catch (error) {
      console.error('Network test error:', error);
      toast({
        title: "Network Test Failed",
        description: error instanceof Error ? error.message : "Unknown error occurred",
        variant: "destructive",
      });
      
      return {
        success: false,
        error: error instanceof Error ? error.message : "Unknown error"
      };
    } finally {
      setIsLoading(false);
    }
  }, [toast]);

  const getDemoStatus = useCallback(() => {
    return realNetworkService.getDemoModeStatus();
  }, []);

  return {
    testConnection,
    isLoading,
    getDemoStatus
  };
};
