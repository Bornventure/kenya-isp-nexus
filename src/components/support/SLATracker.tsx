
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Clock, AlertTriangle, CheckCircle, XCircle } from 'lucide-react';
import { format, differenceInHours, differenceInMinutes } from 'date-fns';

interface SLATicket {
  id: string;
  title: string;
  priority: 'low' | 'medium' | 'high';
  created_at: string;
  sla_due_date?: string;
  status: 'open' | 'in_progress' | 'resolved';
}

interface SLATrackerProps {
  tickets: SLATicket[];
}

const SLATracker: React.FC<SLATrackerProps> = ({ tickets }) => {
  const getSLAThreshold = (priority: string) => {
    switch (priority) {
      case 'high': return 4;
      case 'medium': return 12;
      case 'low': return 48;
      default: return 24;
    }
  };

  const calculateSLAStatus = (ticket: SLATicket) => {
    const now = new Date();
    const createdAt = new Date(ticket.created_at);
    const threshold = getSLAThreshold(ticket.priority);
    const dueDate = ticket.sla_due_date ? new Date(ticket.sla_due_date) : new Date(createdAt.getTime() + threshold * 60 * 60 * 1000);
    
    const hoursElapsed = differenceInHours(now, createdAt);
    const minutesUntilDue = differenceInMinutes(dueDate, now);
    
    let status = 'on_time';
    let percentage = (hoursElapsed / threshold) * 100;
    
    if (ticket.status === 'resolved') {
      status = 'met';
      percentage = 100;
    } else if (minutesUntilDue < 0) {
      status = 'breached';
      percentage = 100;
    } else if (percentage > 80) {
      status = 'at_risk';
    }
    
    return {
      status,
      percentage: Math.min(percentage, 100),
      hoursElapsed,
      minutesUntilDue,
      dueDate,
      threshold
    };
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'met': return 'text-green-600';
      case 'on_time': return 'text-blue-600';
      case 'at_risk': return 'text-yellow-600';
      case 'breached': return 'text-red-600';
      default: return 'text-gray-600';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'met': return <CheckCircle className="h-4 w-4 text-green-600" />;
      case 'on_time': return <Clock className="h-4 w-4 text-blue-600" />;
      case 'at_risk': return <AlertTriangle className="h-4 w-4 text-yellow-600" />;
      case 'breached': return <XCircle className="h-4 w-4 text-red-600" />;
      default: return <Clock className="h-4 w-4 text-gray-600" />;
    }
  };

  const getProgressColor = (status: string) => {
    switch (status) {
      case 'met': return 'bg-green-500';
      case 'on_time': return 'bg-blue-500';
      case 'at_risk': return 'bg-yellow-500';
      case 'breached': return 'bg-red-500';
      default: return 'bg-gray-500';
    }
  };

  const slaStats = tickets.reduce((acc, ticket) => {
    const sla = calculateSLAStatus(ticket);
    acc[sla.status] = (acc[sla.status] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);

  return (
    <div className="space-y-6">
      {/* SLA Overview */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2">
              <CheckCircle className="h-5 w-5 text-green-600" />
              <div>
                <p className="text-2xl font-bold text-green-600">{slaStats.met || 0}</p>
                <p className="text-sm text-muted-foreground">SLA Met</p>
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2">
              <Clock className="h-5 w-5 text-blue-600" />
              <div>
                <p className="text-2xl font-bold text-blue-600">{slaStats.on_time || 0}</p>
                <p className="text-sm text-muted-foreground">On Time</p>
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2">
              <AlertTriangle className="h-5 w-5 text-yellow-600" />
              <div>
                <p className="text-2xl font-bold text-yellow-600">{slaStats.at_risk || 0}</p>
                <p className="text-sm text-muted-foreground">At Risk</p>
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2">
              <XCircle className="h-5 w-5 text-red-600" />
              <div>
                <p className="text-2xl font-bold text-red-600">{slaStats.breached || 0}</p>
                <p className="text-sm text-muted-foreground">Breached</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Detailed SLA Tracking */}
      <Card>
        <CardHeader>
          <CardTitle>SLA Status by Ticket</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {tickets.filter(ticket => ticket.status !== 'resolved').map((ticket) => {
              const sla = calculateSLAStatus(ticket);
              
              return (
                <div key={ticket.id} className="border rounded-lg p-4">
                  <div className="flex items-start justify-between mb-3">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        {getStatusIcon(sla.status)}
                        <h4 className="font-medium">{ticket.title}</h4>
                        <Badge variant="outline">#{ticket.id.slice(0, 8)}</Badge>
                        <Badge variant={ticket.priority === 'high' ? 'destructive' : ticket.priority === 'medium' ? 'default' : 'secondary'}>
                          {ticket.priority}
                        </Badge>
                      </div>
                      <p className="text-sm text-muted-foreground">
                        Created {format(new Date(ticket.created_at), 'MMM dd, HH:mm')}
                      </p>
                    </div>
                    <div className="text-right">
                      <p className={`text-sm font-medium ${getStatusColor(sla.status)}`}>
                        {sla.status === 'breached' ? 'SLA Breached' :
                         sla.status === 'at_risk' ? 'At Risk' :
                         sla.status === 'met' ? 'SLA Met' : 'On Time'}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        {sla.minutesUntilDue > 0 
                          ? `${Math.ceil(sla.minutesUntilDue / 60)}h remaining`
                          : `${Math.abs(Math.floor(sla.minutesUntilDue / 60))}h overdue`
                        }
                      </p>
                    </div>
                  </div>
                  
                  <div className="space-y-2">
                    <div className="flex justify-between text-xs text-muted-foreground">
                      <span>SLA Progress</span>
                      <span>{Math.round(sla.percentage)}%</span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2">
                      <div 
                        className={`h-2 rounded-full transition-all ${getProgressColor(sla.status)}`}
                        style={{ width: `${sla.percentage}%` }}
                      />
                    </div>
                    <p className="text-xs text-muted-foreground">
                      SLA Target: {sla.threshold} hours | Due: {format(sla.dueDate, 'MMM dd, HH:mm')}
                    </p>
                  </div>
                </div>
              );
            })}
            
            {tickets.filter(ticket => ticket.status !== 'resolved').length === 0 && (
              <div className="text-center py-8 text-muted-foreground">
                <Clock className="h-12 w-12 mx-auto mb-4 opacity-50" />
                <p>No active tickets to track</p>
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default SLATracker;
