
import { useMutation } from '@tanstack/react-query';
import { useToast } from '@/hooks/use-toast';
import { clientActivationService } from '@/services/clientActivationService';

interface FullAutomationData {
  clientId: string;
  servicePackageId?: string;
  equipmentId?: string;
  installationNotes?: string;
  companyId: string;
}

export const useFullAutomation = () => {
  const { toast } = useToast();

  const { mutateAsync: activateClientWithFullAutomation, isPending: isActivating } = useMutation({
    mutationFn: async (data: FullAutomationData) => {
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

  return {
    activateClientWithFullAutomation,
    isActivating
  };
};
