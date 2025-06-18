
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { 
  TrendingUp, 
  Users, 
  DollarSign, 
  Target,
  UserPlus,
  Calendar,
  Phone,
  Mail
} from 'lucide-react';
import { useClients } from '@/hooks/useClients';
import { usePayments } from '@/hooks/usePayments';
import { formatKenyanCurrency } from '@/utils/kenyanValidation';

const SalesAccountManagerDashboard = () => {
  const { clients } = useClients();
  const { payments } = usePayments();

  const thisMonthClients = clients.filter(c => {
    const clientDate = new Date(c.created_at);
    const now = new Date();
    return clientDate.getMonth() === now.getMonth() && clientDate.getFullYear() === now.getFullYear();
  });

  const thisMonthRevenue = payments.filter(p => {
    const paymentDate = new Date(p.payment_date);
    const now = new Date();
    return paymentDate.getMonth() === now.getMonth() && paymentDate.getFullYear() === now.getFullYear();
  }).reduce((sum, p) => sum + p.amount, 0);

  const conversionRate = 85; // This would be calculated from actual lead data
  const avgDealSize = thisMonthRevenue / (thisMonthClients.length || 1);

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-2">
        <TrendingUp className="h-6 w-6 text-blue-600" />
        <h1 className="text-3xl font-bold">Sales & Account Management Dashboard</h1>
      </div>

      {/* Sales Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card className="border-l-4 border-l-blue-500">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">New Clients This Month</p>
                <p className="text-2xl font-bold text-blue-600">{thisMonthClients.length}</p>
              </div>
              <UserPlus className="h-8 w-8 text-blue-600" />
            </div>
          </CardContent>
        </Card>

        <Card className="border-l-4 border-l-green-500">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Monthly Revenue</p>
                <p className="text-2xl font-bold text-green-600">{formatKenyanCurrency(thisMonthRevenue)}</p>
              </div>
              <DollarSign className="h-8 w-8 text-green-600" />
            </div>
          </CardContent>
        </Card>

        <Card className="border-l-4 border-l-purple-500">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Conversion Rate</p>
                <p className="text-2xl font-bold text-purple-600">{conversionRate}%</p>
              </div>
              <Target className="h-8 w-8 text-purple-600" />
            </div>
          </CardContent>
        </Card>

        <Card className="border-l-4 border-l-orange-500">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Avg Deal Size</p>
                <p className="text-2xl font-bold text-orange-600">{formatKenyanCurrency(avgDealSize)}</p>
              </div>
              <TrendingUp className="h-8 w-8 text-orange-600" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Recent Clients */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Users className="h-5 w-5 text-blue-600" />
            Recent Client Acquisitions
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {thisMonthClients.slice(0, 5).map((client) => (
              <div key={client.id} className="flex items-center justify-between p-3 bg-blue-50 rounded-lg border border-blue-100">
                <div className="flex items-center gap-3">
                  <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                  <div>
                    <p className="font-medium">{client.name}</p>
                    <p className="text-sm text-muted-foreground">
                      {client.phone} • {new Date(client.created_at).toLocaleDateString()}
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <Badge 
                    variant={client.status === 'active' ? 'default' : 'secondary'}
                    className={client.status === 'active' ? 'bg-blue-100 text-blue-800 border-blue-200' : ''}
                  >
                    {client.status}
                  </Badge>
                  <div className="text-right text-sm">
                    <p className="font-medium">{formatKenyanCurrency(client.monthly_rate)}</p>
                    <p className="text-muted-foreground">monthly</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Quick Actions */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Calendar className="h-5 w-5 text-blue-600" />
              Follow-up Schedule
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              <div className="flex items-center gap-2 p-2 bg-blue-50 rounded border border-blue-100">
                <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                <span className="text-sm">5 clients due for renewal</span>
              </div>
              <div className="flex items-center gap-2 p-2 bg-blue-50 rounded border border-blue-100">
                <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                <span className="text-sm">3 upgrade opportunities</span>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Phone className="h-5 w-5 text-blue-600" />
              Contact Activities
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              <div className="flex items-center gap-2 p-2 bg-blue-50 rounded border border-blue-100">
                <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                <span className="text-sm">12 calls made today</span>
              </div>
              <div className="flex items-center gap-2 p-2 bg-blue-50 rounded border border-blue-100">
                <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                <span className="text-sm">8 emails sent</span>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Target className="h-5 w-5 text-blue-600" />
              Performance Goals
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-sm">Monthly Target</span>
                <span className="text-sm font-medium text-blue-600">75%</span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-2">
                <div className="bg-blue-500 h-2 rounded-full" style={{width: '75%'}}></div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default SalesAccountManagerDashboard;
