
import { useAuth } from '@/contexts/AuthContext';
import { useClients } from '@/hooks/useClients';
import { useToast } from '@/hooks/use-toast';

export const useLicenseLimitCheck = () => {
  const { profile } = useAuth();
  const { clients } = useClients();
  const { toast } = useToast();

  const checkCanAddClient = () => {
    console.log('Checking license limits...');
    console.log('Current user profile:', profile);
    console.log('Current clients count:', clients.length);

    // Super admin can always add clients
    if (profile?.role === 'super_admin') {
      console.log('Super admin detected - bypassing license check');
      return true;
    }

    // For other users, check if we have company info
    if (!profile?.isp_company_id) {
      console.error('No ISP company ID found');
      toast({
        title: "Error",
        description: "No company information found. Please contact support.",
        variant: "destructive",
      });
      return false;
    }

    // For now, allow up to 1000 clients (we can implement proper license checking later)
    const currentCount = clients.length;
    const limit = 1000; // Default high limit

    console.log(`Current clients: ${currentCount}, Limit: ${limit}`);

    if (currentCount >= limit) {
      toast({
        title: "License Limit Reached",
        description: `You have reached the maximum number of clients (${limit}). Please upgrade your license or contact support.`,
        variant: "destructive",
      });
      return false;
    }

    return true;
  };

  return { checkCanAddClient };
};
