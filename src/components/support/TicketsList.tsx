
import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { 
  MessageSquare, 
  AlertCircle,
  CheckCircle,
  Clock,
  User,
  Loader2
} from 'lucide-react';

interface Ticket {
  id: string;
  title: string;
  description: string;
  status: 'open' | 'in_progress' | 'resolved';
  priority: 'low' | 'medium' | 'high';
  created_at: string;
  clients?: {
    name: string;
  };
}

interface TicketsListProps {
  tickets: Ticket[];
  isLoading: boolean;
  searchTerm: string;
  filterStatus: string;
  onStatusChange: (ticketId: string, newStatus: string) => void;
  isUpdating: boolean;
}

const TicketsList: React.FC<TicketsListProps> = ({
  tickets,
  isLoading,
  searchTerm,
  filterStatus,
  onStatusChange,
  isUpdating
}) => {
  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'open': return <AlertCircle className="h-4 w-4 text-red-500" />;
      case 'in_progress': return <Clock className="h-4 w-4 text-yellow-500" />;
      case 'resolved': return <CheckCircle className="h-4 w-4 text-green-500" />;
      default: return <MessageSquare className="h-4 w-4 text-gray-500" />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'open': return 'bg-red-500';
      case 'in_progress': return 'bg-yellow-500';
      case 'resolved': return 'bg-green-500';
      default: return 'bg-gray-500';
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'high': return 'bg-red-500';
      case 'medium': return 'bg-yellow-500';
      case 'low': return 'bg-green-500';
      default: return 'bg-gray-500';
    }
  };

  if (isLoading) {
    return (
      <Card>
        <CardContent className="p-8 text-center">
          <Loader2 className="h-8 w-8 animate-spin mx-auto mb-4" />
          <p className="text-muted-foreground">Loading support tickets...</p>
        </CardContent>
      </Card>
    );
  }

  if (tickets.length === 0) {
    return (
      <Card>
        <CardContent className="p-8 text-center">
          <MessageSquare className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
          <h3 className="text-lg font-semibold mb-2">No tickets found</h3>
          <p className="text-muted-foreground">
            {searchTerm || filterStatus !== 'all' 
              ? 'Try adjusting your search or filters' 
              : 'Create your first support ticket to get started'}
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardContent className="p-0">
        <div className="space-y-0">
          {tickets.map((ticket) => (
            <div key={ticket.id} className="border-b last:border-b-0 p-4 hover:bg-muted/50">
              <div className="flex items-start justify-between">
                <div className="flex items-start gap-3 flex-1">
                  {getStatusIcon(ticket.status)}
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <h4 className="font-medium">{ticket.title}</h4>
                      <Badge variant="outline" className="text-xs">
                        {ticket.id.slice(0, 8)}
                      </Badge>
                    </div>
                    <p className="text-sm text-muted-foreground mb-2">
                      {ticket.description}
                    </p>
                    <div className="flex items-center gap-4 text-xs text-muted-foreground">
                      <div className="flex items-center gap-1">
                        <User className="h-3 w-3" />
                        {ticket.clients?.name || 'No client assigned'}
                      </div>
                      <div className="flex items-center gap-1">
                        <Clock className="h-3 w-3" />
                        {new Date(ticket.created_at).toLocaleDateString()}
                      </div>
                    </div>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <Badge className={`text-white ${getPriorityColor(ticket.priority)}`}>
                    {ticket.priority}
                  </Badge>
                  <Badge className={`text-white ${getStatusColor(ticket.status)}`}>
                    {ticket.status.replace('_', ' ')}
                  </Badge>
                  <div className="flex gap-1 ml-2">
                    {ticket.status === 'open' && (
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => onStatusChange(ticket.id, 'in_progress')}
                        disabled={isUpdating}
                      >
                        Start
                      </Button>
                    )}
                    {ticket.status === 'in_progress' && (
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => onStatusChange(ticket.id, 'resolved')}
                        disabled={isUpdating}
                      >
                        Resolve
                      </Button>
                    )}
                    {ticket.status === 'resolved' && (
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => onStatusChange(ticket.id, 'open')}
                        disabled={isUpdating}
                      >
                        Reopen
                      </Button>
                    )}
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
};

export default TicketsList;
