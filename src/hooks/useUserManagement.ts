
import { useUsers } from './useUsers';
import { useUserMutations } from './useUserMutations';

export const useUserManagement = () => {
  const usersData = useUsers();
  const mutations = useUserMutations();

  return {
    ...usersData,
    ...mutations,
  };
};

// Re-export types for backward compatibility
export type { SystemUser } from '@/types/user';
