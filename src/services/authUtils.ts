
export const validateClientStatus = (status: string): boolean => {
  const validStatuses = ['active', 'pending', 'suspended', 'disconnected', 'approved', 'inactive'];
  return validStatuses.includes(status);
};

export const isClientActive = (client: any): boolean => {
  return client.status === 'active';
};

export const canClientLogin = (client: any): boolean => {
  const allowedStatuses = ['active', 'approved'];
  return allowedStatuses.includes(client.status);
};

export const getClientDisplayStatus = (status: string): string => {
  switch (status) {
    case 'active':
      return 'Active';
    case 'pending':
      return 'Pending Approval';
    case 'suspended':
      return 'Suspended';
    case 'disconnected':
      return 'Disconnected';
    case 'approved':
      return 'Approved';
    case 'inactive':
      return 'Inactive';
    default:
      return 'Unknown';
  }
};
