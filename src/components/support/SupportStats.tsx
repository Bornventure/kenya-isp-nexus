
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useTicketAnalytics } from '@/hooks/useDashboardAnalytics';
import { AlertCircle, Clock, CheckCircle, XCircle } from 'lucide-react';

const SupportStats = () => {
  const { data: ticketAnalyticsResponse, isLoading } = useTicketAnalytics();
  
  // Extract the actual data from the response wrapper
  const ticketAnalytics = ticketAnalyticsResponse?.data;

  if (isLoading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {[...Array(4)].map((_, i) => (
          <Card key={i}>
            <CardContent className="p-6">
              <div className="animate-pulse">
                <div className="h-4 bg-gray-200 rounded w-3/4 mb-2"></div>
                <div className="h-8 bg-gray-200 rounded w-1/2"></div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    );
  }

  const stats = [
    {
      title: 'Open Tickets',
      value: ticketAnalytics?.open || 0,
      icon: AlertCircle,
      color: 'text-red-600'
    },
    {
      title: 'In Progress',
      value: ticketAnalytics?.inProgress || 0,
      icon: Clock,
      color: 'text-yellow-600'
    },
    {
      title: 'Resolved',
      value: ticketAnalytics?.resolved || 0,
      icon: CheckCircle,
      color: 'text-green-600'
    },
    {
      title: 'Closed',
      value: ticketAnalytics?.closed || 0,
      icon: XCircle,
      color: 'text-gray-600'
    }
  ];

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
      {stats.map((stat) => (
        <Card key={stat.title}>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">{stat.title}</CardTitle>
            <stat.icon className={`h-4 w-4 ${stat.color}`} />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stat.value}</div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
};

export default SupportStats;
