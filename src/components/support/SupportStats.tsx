
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { TicketCheck, Clock, AlertTriangle, CheckCircle } from 'lucide-react';

interface SupportStatsProps {
  openTickets: number;
  inProgressTickets: number;
  resolvedTickets: number;
  closedTickets: number;
  isLoading?: boolean;
}

const SupportStats: React.FC<SupportStatsProps> = ({
  openTickets,
  inProgressTickets,
  resolvedTickets,
  closedTickets,
  isLoading
}) => {
  if (isLoading) {
    return (
      <div className="space-y-4">
        <div className="animate-pulse space-y-3">
          <div className="h-4 bg-gray-200 rounded w-3/4"></div>
          <div className="h-4 bg-gray-200 rounded w-1/2"></div>
          <div className="h-4 bg-gray-200 rounded w-2/3"></div>
          <div className="h-4 bg-gray-200 rounded w-1/3"></div>
        </div>
      </div>
    );
  }

  const totalTickets = openTickets + inProgressTickets + resolvedTickets + closedTickets;

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <span className="text-sm flex items-center gap-2">
          <AlertTriangle className="h-4 w-4 text-red-500" />
          Open Tickets
        </span>
        <Badge variant="destructive">{openTickets}</Badge>
      </div>
      
      <div className="flex justify-between items-center">
        <span className="text-sm flex items-center gap-2">
          <Clock className="h-4 w-4 text-yellow-500" />
          In Progress
        </span>
        <Badge variant="secondary">{inProgressTickets}</Badge>
      </div>
      
      <div className="flex justify-between items-center">
        <span className="text-sm flex items-center gap-2">
          <TicketCheck className="h-4 w-4 text-blue-500" />
          Resolved
        </span>
        <Badge variant="outline">{resolvedTickets}</Badge>
      </div>
      
      <div className="flex justify-between items-center">
        <span className="text-sm flex items-center gap-2">
          <CheckCircle className="h-4 w-4 text-green-500" />
          Closed
        </span>
        <Badge variant="default">{closedTickets}</Badge>
      </div>

      <div className="pt-2 border-t">
        <div className="flex justify-between items-center">
          <span className="text-sm font-medium">Total Tickets</span>
          <span className="font-bold">{totalTickets}</span>
        </div>
      </div>
    </div>
  );
};

export default SupportStats;
