
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { 
  User, 
  Calendar, 
  AlertTriangle, 
  Clock,
  Eye,
  MessageSquare,
  ArrowRight
} from 'lucide-react';
import { format } from 'date-fns';

interface Ticket {
  id: string;
  title: string;
  description: string;
  status: 'open' | 'in_progress' | 'resolved';
  priority: 'low' | 'medium' | 'high';
  ticket_type?: string;
  created_at: string;
  assigned_to?: string;
  clients?: { name: string };
  departments?: { name: string };
  escalation_level?: number;
}

interface KanbanTicketBoardProps {
  tickets: Ticket[];
  onTicketClick: (ticket: Ticket) => void;
  onStatusChange: (ticketId: string, newStatus: string) => void;
}

const KanbanTicketBoard: React.FC<KanbanTicketBoardProps> = ({
  tickets,
  onTicketClick,
  onStatusChange,
}) => {
  const columns = [
    { id: 'open', title: 'Open', color: 'bg-red-50 border-red-200' },
    { id: 'in_progress', title: 'In Progress', color: 'bg-yellow-50 border-yellow-200' },
    { id: 'resolved', title: 'Resolved', color: 'bg-green-50 border-green-200' },
  ];

  const getTicketsByStatus = (status: string) => {
    return tickets.filter(ticket => ticket.status === status);
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'high': return 'bg-red-500';
      case 'medium': return 'bg-yellow-500';
      case 'low': return 'bg-green-500';
      default: return 'bg-gray-500';
    }
  };

  const getNextStatus = (currentStatus: string) => {
    switch (currentStatus) {
      case 'open': return 'in_progress';
      case 'in_progress': return 'resolved';
      default: return null;
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'open': return <AlertTriangle className="h-4 w-4 text-red-500" />;
      case 'in_progress': return <Clock className="h-4 w-4 text-yellow-500" />;
      case 'resolved': return <MessageSquare className="h-4 w-4 text-green-500" />;
      default: return null;
    }
  };

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
      {columns.map((column) => {
        const columnTickets = getTicketsByStatus(column.id);
        
        return (
          <div key={column.id} className="space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                {getStatusIcon(column.id)}
                <h3 className="font-semibold text-lg">{column.title}</h3>
                <Badge variant="secondary" className="text-xs">
                  {columnTickets.length}
                </Badge>
              </div>
            </div>

            <div className={`min-h-[400px] p-4 rounded-lg border-2 border-dashed ${column.color}`}>
              <div className="space-y-3">
                {columnTickets.map((ticket) => {
                  const nextStatus = getNextStatus(ticket.status);
                  
                  return (
                    <Card 
                      key={ticket.id} 
                      className="cursor-pointer hover:shadow-md transition-shadow bg-white"
                      onClick={() => onTicketClick(ticket)}
                    >
                      <CardHeader className="pb-2">
                        <div className="flex items-start justify-between">
                          <div className="flex-1">
                            <div className="flex items-center gap-2 mb-1">
                              <div className={`w-3 h-3 rounded-full ${getPriorityColor(ticket.priority)}`} />
                              <Badge variant="outline" className="text-xs">
                                #{ticket.id.slice(0, 8)}
                              </Badge>
                              {ticket.escalation_level && ticket.escalation_level > 1 && (
                                <Badge variant="destructive" className="text-xs">
                                  L{ticket.escalation_level}
                                </Badge>
                              )}
                            </div>
                            <CardTitle className="text-sm font-medium leading-tight">
                              {ticket.title}
                            </CardTitle>
                          </div>
                        </div>
                      </CardHeader>
                      
                      <CardContent className="pt-0 space-y-3">
                        <p className="text-xs text-muted-foreground line-clamp-2">
                          {ticket.description}
                        </p>

                        <div className="space-y-2 text-xs text-muted-foreground">
                          <div className="flex items-center gap-1">
                            <User className="h-3 w-3" />
                            <span>{ticket.clients?.name || 'No client'}</span>
                          </div>
                          
                          <div className="flex items-center gap-1">
                            <Calendar className="h-3 w-3" />
                            <span>{format(new Date(ticket.created_at), 'MMM dd, HH:mm')}</span>
                          </div>

                          {ticket.departments?.name && (
                            <div className="flex items-center gap-1">
                              <MessageSquare className="h-3 w-3" />
                              <span>{ticket.departments.name}</span>
                            </div>
                          )}
                        </div>

                        <div className="flex items-center justify-between pt-2 border-t">
                          <div className="flex items-center gap-1">
                            {ticket.assigned_to ? (
                              <Avatar className="h-6 w-6">
                                <AvatarFallback className="text-xs">
                                  {ticket.assigned_to.slice(0, 2).toUpperCase()}
                                </AvatarFallback>
                              </Avatar>
                            ) : (
                              <div className="h-6 w-6 rounded-full bg-gray-100 flex items-center justify-center">
                                <User className="h-3 w-3 text-gray-400" />
                              </div>
                            )}
                          </div>

                          <div className="flex gap-1">
                            <Button
                              variant="ghost"
                              size="sm"
                              className="h-7 w-7 p-0"
                              onClick={(e) => {
                                e.stopPropagation();
                                onTicketClick(ticket);
                              }}
                            >
                              <Eye className="h-3 w-3" />
                            </Button>
                            
                            {nextStatus && (
                              <Button
                                variant="ghost"
                                size="sm"
                                className="h-7 w-7 p-0"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  onStatusChange(ticket.id, nextStatus);
                                }}
                              >
                                <ArrowRight className="h-3 w-3" />
                              </Button>
                            )}
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  );
                })}

                {columnTickets.length === 0 && (
                  <div className="text-center py-8 text-muted-foreground">
                    <MessageSquare className="h-8 w-8 mx-auto mb-2 opacity-50" />
                    <p className="text-sm">No tickets in {column.title.toLowerCase()}</p>
                  </div>
                )}
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
};

export default KanbanTicketBoard;
