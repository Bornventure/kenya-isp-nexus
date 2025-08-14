
export interface MikrotikRouter {
  id: string;
  name: string;
  ip_address: string;
  admin_username: string;
  admin_password: string;
  snmp_community?: string;
  snmp_version?: number;
  pppoe_interface?: string;
  dns_servers?: string;
  client_network?: string;
  gateway?: string;
  status?: string;
  connection_status?: string;
  last_test_results?: string;
  isp_company_id: string;
  created_at: string;
  updated_at: string;
}

export interface NetworkSession {
  id: string;
  client_id: string;
  username: string;
  ip_address: string;
  nas_ip_address: string;
  session_id: string;
  start_time: string;
  bytes_in: number;
  bytes_out: number;
  status: 'active' | 'disconnected';
  last_update: string;
  created_at: string;
}

export interface ClientNetworkStatus {
  client_id: string;
  is_online: boolean;
  current_session?: NetworkSession;
  data_usage_today: number;
  speed_limit: {
    download: string;
    upload: string;
  };
  last_seen: string;
}
