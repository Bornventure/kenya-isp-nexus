
export interface RadiusUser {
  id: string;
  username: string;
  password?: string;
  profile: string;
  status: string;
  client_id?: string;
  isp_company_id: string;
  created_at: string;
  updated_at: string;
  // Additional computed fields for UI compatibility
  groupName?: string;
  maxSimultaneousUse?: number;
  framedIpAddress?: string;
  sessionTimeout?: number;
  idleTimeout?: number;
  downloadSpeed?: number;
  uploadSpeed?: number;
  monthlyQuota?: number;
  dailyQuota?: number;
  expirationDate?: string;
  isActive: boolean;
  lastLogin?: string;
  totalSessions?: number;
  dataUsed?: number;
}

export interface RadiusAccountingRecord {
  id: string;
  username: string;
  nas_ip_address: string;
  session_id: string;
  session_time: number;
  input_octets: number;
  output_octets: number;
  terminate_cause: string;
  client_id?: string;
  isp_company_id: string;
  created_at: string;
}

export interface ActiveSession {
  id: string;
  username: string;
  nas_ip_address: string;
  framed_ip_address?: string;
  calling_station_id?: string;
  session_start: string;
  last_update: string;
  client_id?: string;
  isp_company_id: string;
}
