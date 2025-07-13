
import { useLicenseManagement } from '@/hooks/useLicenseManagement';
import { useToast } from '@/hooks/use-toast';

export const useLicenseLimitCheck = () => {
  const { licenseInfo, canAddMoreClients, remainingClients } = useLicenseManagement();
  const { toast } = useToast();

  const checkCanAddClient = (): boolean => {
    if (!licenseInfo) {
      toast({
        title: "License Check Failed",
        description: "Unable to verify license status. Please try again.",
        variant: "destructive",
      });
      return false;
    }

    if (!canAddMoreClients) {
      toast({
        title: "Client Limit Reached",
        description: `You have reached your client limit of ${licenseInfo.client_limit}. Please upgrade your license to add more clients.`,
        variant: "destructive",
      });
      return false;
    }

    // Warning when approaching limit (90% or less than 5 slots remaining)
    const warningThreshold = Math.max(licenseInfo.client_limit * 0.9, licenseInfo.client_limit - 5);
    if (licenseInfo.current_client_count >= warningThreshold) {
      toast({
        title: "Approaching Client Limit",
        description: `You have ${remainingClients} client slots remaining. Consider upgrading your license soon.`,
        variant: "default",
      });
    }

    return true;
  };

  return {
    licenseInfo,
    canAddMoreClients,
    remainingClients,
    checkCanAddClient,
  };
};
