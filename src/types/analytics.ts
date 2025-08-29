
// Analytics types for company-specific dashboard
export interface DashboardStats {
  totalClients: number;
  activeClients: number;
  suspendedClients: number;
  monthlyRevenue: number;
  totalRevenue: number;
  activeConnections: number;
  totalRouters: number;
  activeHotspots: number;
  pendingTickets: number;
  activeEquipment: number;
  clientGrowth?: number;
  revenueGrowth?: number;
  connectionGrowth?: number;
  network?: {
    activeRouters: number;
    uptime: string;
    activeSessions: number;
  };
  recentActivity?: Array<{
    description: string;
    time: string;
  }>;
}

export interface RevenueData {
  month: string;
  revenue: number;
}

export interface ClientGrowthData {
  month: string;
  newClients: number;
}

export interface TicketAnalytics {
  open: number;
  inProgress: number;
  resolved: number;
  closed: number;
}

export interface DeviceStatus {
  id: string;
  name: string;
  ip: string;
  status: 'online' | 'offline';
  uptime: number;
  cpuUsage: number;
  memoryUsage: number;
  activeSessions: number;
  lastSeen: string;
}
