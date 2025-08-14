
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
  isp_company_id: string;
  created_at: string;
  updated_at: string;
}
