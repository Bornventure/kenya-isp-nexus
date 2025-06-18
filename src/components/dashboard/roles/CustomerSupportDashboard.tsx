
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { 
  HeadphonesIcon, 
  Ticket, 
  Users, 
  Clock,
  TrendingUp,
  AlertCircle,
  CheckCircle,
  MessageSquare
} from 'lucide-react';
import { useSupportTickets } from '@/hooks/useApiQueries';
import { useClients } from '@/hooks/useClients';

const CustomerSupportDashboard = () => {
  const { data: tickets } = useSupportTickets();
  const { clients } = useClients();

  const openTickets = tickets?.data?.filter(t => t.status === 'open').length || 0;
  const inProgressTickets = tickets?.data?.filter(t => t.status === 'in_progress').length || 0;
  const resolvedToday = tickets?.data?.filter(t => 
    t.status === 'resolved' && 
    new Date(t.resolved_at).toDateString() === new Date().toDateString()
  ).length || 0;

  const avgResponseTime = '2.5 hours'; // This would be calculated from actual data

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-2">
        <HeadphonesIcon className="h-6 w-6 text-orange-600" />
        <h1 className="text-3xl font-bold">Customer Support Dashboard</h1>
      </div>

      {/* Support Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card className="border-l-4 border-l-orange-500">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Open Tickets</p>
                <p className="text-2xl font-bold text-orange-600">{openTickets}</p>
              </div>
              <Ticket className="h-8 w-8 text-orange-600" />
            </div>
          </CardContent>
        </Card>

        <Card className="border-l-4 border-l-blue-500">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">In Progress</p>
                <p className="text-2xl font-bold text-blue-600">{inProgressTickets}</p>
              </div>
              <Clock className="h-8 w-8 text-blue-600" />
            </div>
          </CardContent>
        </Card>

        <Card className="border-l-4 border-l-green-500">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Resolved Today</p>
                <p className="text-2xl font-bold text-green-600">{resolvedToday}</p>
              </div>
              <CheckCircle className="h-8 w-8 text-green-600" />
            </div>
          </CardContent>
        </Card>

        <Card className="border-l-4 border-l-purple-500">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Avg Response Time</p>
                <p className="text-2xl font-bold text-purple-600">{avgResponseTime}</p>
              </div>
              <TrendingUp className="h-8 w-8 text-purple-600" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Recent Tickets */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <MessageSquare className="h-5 w-5 text-orange-600" />
            Recent Support Tickets
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {tickets?.data?.slice(0, 5).map((ticket) => (
              <div key={ticket.id} className="flex items-center justify-between p-3 bg-orange-50 rounded-lg border border-orange-100">
                <div className="flex items-center gap-3">
                  <div className="w-2 h-2 bg-orange-500 rounded-full"></div>
                  <div>
                    <p className="font-medium">{ticket.title}</p>
                    <p className="text-sm text-muted-foreground">
                      {ticket.clients?.name || 'Unknown'} • {new Date(ticket.created_at).toLocaleDateString()}
                    </p>
                  </div>
                </div>
                <Badge 
                  variant={ticket.status === 'open' ? 'destructive' : 
                          ticket.status === 'in_progress' ? 'default' : 'secondary'}
                  className={ticket.status === 'open' ? 'bg-orange-100 text-orange-800 border-orange-200' : ''}
                >
                  {ticket.status.replace('_', ' ')}
                </Badge>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Client Status Overview */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Users className="h-5 w-5 text-orange-600" />
            Client Quick Access
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="flex items-center gap-3 p-3 bg-orange-50 rounded-lg border border-orange-100">
              <div className="w-3 h-3 bg-green-500 rounded-full"></div>
              <div>
                <p className="font-medium">Active Clients</p>
                <p className="text-sm text-muted-foreground">
                  {clients.filter(c => c.status === 'active').length} clients
                </p>
              </div>
            </div>
            <div className="flex items-center gap-3 p-3 bg-orange-50 rounded-lg border border-orange-100">
              <div className="w-3 h-3 bg-red-500 rounded-full"></div>
              <div>
                <p className="font-medium">Suspended Clients</p>
                <p className="text-sm text-muted-foreground">
                  {clients.filter(c => c.status === 'suspended').length} clients
                </p>
              </div>
            </div>
            <div className="flex items-center gap-3 p-3 bg-orange-50 rounded-lg border border-orange-100">
              <div className="w-3 h-3 bg-yellow-500 rounded-full"></div>
              <div>
                <p className="font-medium">Need Attention</p>
                <p className="text-sm text-muted-foreground">
                  {openTickets} open tickets
                </p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default CustomerSupportDashboard;
