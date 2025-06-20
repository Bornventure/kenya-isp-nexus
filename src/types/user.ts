
export interface SystemUser {
  id: string;
  email: string;
  first_name: string | null;
  last_name: string | null;
  phone: string | null;
  role: 'super_admin' | 'isp_admin' | 'customer_support' | 'sales_manager' | 'billing_admin' | 'network_engineer' | 'infrastructure_manager' | 'hotspot_admin' | 'technician' | 'readonly';
  isp_company_id: string | null;
  is_active: boolean;
  created_at: string;
  updated_at: string;
  isp_companies?: {
    name: string;
  };
}

export interface CreateUserData {
  email: string;
  password: string;
  first_name: string;
  last_name: string;
  phone?: string;
  role: SystemUser['role'];
  isp_company_id?: string;
}

export interface UpdateUserData extends Partial<SystemUser> {}
