
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import MetricCard from '@/components/dashboard/MetricCard';
import { Users, UserPlus, Clock, CheckCircle, TrendingUp, Plus } from 'lucide-react';
import { useClients } from '@/hooks/useClients';
import { useAuth } from '@/contexts/AuthContext';
import SalesClientRegistrationForm from '@/components/onboarding/SalesClientRegistrationForm';

const SalesAccountManagerDashboard = () => {
  const { clients, isLoading } = useClients();
  const { profile } = useAuth();
  const [showRegistrationForm, setShowRegistrationForm] = useState(false);

  // Filter clients submitted by this sales user
  const mySubmissions = clients.filter(client => client.submitted_by === profile?.id);
  const pendingSubmissions = mySubmissions.filter(client => client.status === 'pending');
  const approvedSubmissions = mySubmissions.filter(client => client.status === 'approved');
  const activeClients = mySubmissions.filter(client => client.status === 'active');

  const handleRegistrationSuccess = () => {
    // This will trigger a refetch of clients
    window.location.reload();
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-48">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold">Sales Dashboard</h1>
        <Button onClick={() => setShowRegistrationForm(true)} className="gap-2">
          <Plus className="h-4 w-4" />
          Register New Client
        </Button>
      </div>

      {/* Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <MetricCard
          title="Total Submissions"
          value={mySubmissions.length}
          icon={Users}
          trend={12}
        />
        <MetricCard
          title="Pending Approval"
          value={pendingSubmissions.length}
          icon={Clock}
          trend={-5}
        />
        <MetricCard
          title="Approved Clients"
          value={approvedSubmissions.length}
          icon={CheckCircle}
          trend={8}
        />
        <MetricCard
          title="Active Clients"
          value={activeClients.length}
          icon={TrendingUp}
          trend={15}
        />
      </div>

      {/* Recent Submissions */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <UserPlus className="h-5 w-5" />
            Recent Client Submissions
          </CardTitle>
        </CardHeader>
        <CardContent>
          {mySubmissions.length === 0 ? (
            <div className="text-center py-8">
              <p className="text-gray-500">No client submissions yet</p>
              <Button 
                onClick={() => setShowRegistrationForm(true)}
                className="mt-4 gap-2"
              >
                <Plus className="h-4 w-4" />
                Register Your First Client
              </Button>
            </div>
          ) : (
            <div className="space-y-4">
              {mySubmissions.slice(0, 10).map((client) => (
                <div key={client.id} className="flex items-center justify-between p-4 border rounded-lg">
                  <div className="flex-1">
                    <h3 className="font-semibold">{client.name}</h3>
                    <p className="text-sm text-gray-600">{client.email}</p>
                    <p className="text-sm text-gray-500">
                      {client.address} • {client.county}
                    </p>
                  </div>
                  <div className="flex items-center gap-3">
                    <div className="text-right">
                      <p className="text-sm font-medium">
                        KES {client.monthly_rate.toLocaleString()}/month
                      </p>
                      <p className="text-xs text-gray-500">
                        {client.service_packages?.name}
                      </p>
                    </div>
                    <Badge 
                      variant={
                        client.status === 'active' ? 'default' :
                        client.status === 'approved' ? 'secondary' :
                        client.status === 'pending' ? 'outline' : 'destructive'
                      }
                    >
                      {client.status}
                    </Badge>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Quick Actions */}
      <Card>
        <CardHeader>
          <CardTitle>Quick Actions</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Button 
              variant="outline" 
              onClick={() => setShowRegistrationForm(true)}
              className="gap-2 p-6 h-auto flex-col"
            >
              <UserPlus className="h-8 w-8" />
              <span>Register New Client</span>
              <span className="text-xs text-gray-500">Submit for approval</span>
            </Button>
            <Button 
              variant="outline" 
              className="gap-2 p-6 h-auto flex-col"
            >
              <Clock className="h-8 w-8" />
              <span>Track Submissions</span>
              <span className="text-xs text-gray-500">{pendingSubmissions.length} pending</span>
            </Button>
            <Button 
              variant="outline" 
              className="gap-2 p-6 h-auto flex-col"
            >
              <TrendingUp className="h-8 w-8" />
              <span>Performance</span>
              <span className="text-xs text-gray-500">View analytics</span>
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Registration Form Modal */}
      {showRegistrationForm && (
        <SalesClientRegistrationForm
          onClose={() => setShowRegistrationForm(false)}
          onSuccess={handleRegistrationSuccess}
        />
      )}
    </div>
  );
};

export default SalesAccountManagerDashboard;
