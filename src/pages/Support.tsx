import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from '@/components/ui/tabs';
import { 
  MessageSquare, 
  Phone, 
  Mail, 
  Clock, 
  CheckCircle,
  AlertCircle,
  User,
  Search,
  Plus,
  Filter,
  Loader2
} from 'lucide-react';
import { useSupportTickets, useTicketMutations } from '@/hooks/useApiQueries';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/hooks/use-toast';

const Support = () => {
  const { profile } = useAuth();
  const { toast } = useToast();
  const { data: tickets, isLoading, error } = useSupportTickets();
  const { createTicket, updateTicket } = useTicketMutations();

  const [newTicketTitle, setNewTicketTitle] = useState('');
  const [newTicketDescription, setNewTicketDescription] = useState('');
  const [newTicketPriority, setNewTicketPriority] = useState('medium');
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState('all');

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

  const filteredTickets = tickets?.data?.filter(ticket => {
    const statusMatch = filterStatus === 'all' || ticket.status === filterStatus;
    const searchMatch = searchTerm === '' || 
      ticket.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      ticket.clients?.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      ticket.id.toLowerCase().includes(searchTerm.toLowerCase());
    
    return statusMatch && searchMatch;
  }) || [];

  const handleCreateTicket = async () => {
    if (!newTicketTitle.trim() || !newTicketDescription.trim()) {
      toast({
        title: "Missing information",
        description: "Please fill in both title and description",
        variant: "destructive",
      });
      return;
    }

    try {
      await createTicket.mutateAsync({
        title: newTicketTitle,
        description: newTicketDescription,
        priority: newTicketPriority as 'low' | 'medium' | 'high',
        status: 'open',
        isp_company_id: profile?.isp_company_id,
        created_by: profile?.id,
      });

      // Reset form
      setNewTicketTitle('');
      setNewTicketDescription('');
      setNewTicketPriority('medium');
    } catch (error) {
      console.error('Error creating ticket:', error);
    }
  };

  const handleStatusChange = async (ticketId: string, newStatus: string) => {
    try {
      await updateTicket.mutateAsync({
        id: ticketId,
        updates: { 
          status: newStatus as 'open' | 'in_progress' | 'resolved',
          resolved_at: newStatus === 'resolved' ? new Date().toISOString() : null
        }
      });
    } catch (error) {
      console.error('Error updating ticket status:', error);
    }
  };

  const ticketStats = {
    total: tickets?.data?.length || 0,
    open: tickets?.data?.filter(t => t.status === 'open').length || 0,
    inProgress: tickets?.data?.filter(t => t.status === 'in_progress').length || 0,
    resolved: tickets?.data?.filter(t => t.status === 'resolved').length || 0,
    avgResponseTime: '2.5 hours',
    resolutionRate: tickets?.data?.length ? 
      Math.round((tickets.data.filter(t => t.status === 'resolved').length / tickets.data.length) * 100) + '%' : '0%'
  };

  if (error) {
    return (
      <div className="p-6 text-center">
        <AlertCircle className="h-12 w-12 text-red-500 mx-auto mb-4" />
        <h2 className="text-lg font-semibold mb-2">Error Loading Support Tickets</h2>
        <p className="text-muted-foreground">Failed to load support tickets. Please try again.</p>
      </div>
    );
  }

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Support Center</h1>
          <p className="text-muted-foreground">
            Manage customer support tickets and inquiries
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm">
            <Phone className="h-4 w-4 mr-2" />
            Call Center
          </Button>
          <Button variant="outline" size="sm">
            <Mail className="h-4 w-4 mr-2" />
            Email Support
          </Button>
        </div>
      </div>

      {/* Support Statistics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Tickets</CardTitle>
            <MessageSquare className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{ticketStats.total}</div>
            <p className="text-xs text-muted-foreground">
              {ticketStats.open} open, {ticketStats.resolved} resolved
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Response Time</CardTitle>
            <Clock className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{ticketStats.avgResponseTime}</div>
            <p className="text-xs text-muted-foreground">Average response time</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Resolution Rate</CardTitle>
            <CheckCircle className="h-4 w-4 text-green-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">{ticketStats.resolutionRate}</div>
            <p className="text-xs text-muted-foreground">Tickets resolved</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">In Progress</CardTitle>
            <AlertCircle className="h-4 w-4 text-yellow-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-yellow-600">{ticketStats.inProgress}</div>
            <p className="text-xs text-muted-foreground">Active tickets</p>
          </CardContent>
        </Card>
      </div>

      {/* Main Content */}
      <Tabs defaultValue="tickets" className="w-full">
        <TabsList>
          <TabsTrigger value="tickets">Support Tickets</TabsTrigger>
          <TabsTrigger value="create">Create Ticket</TabsTrigger>
          <TabsTrigger value="knowledge">Knowledge Base</TabsTrigger>
        </TabsList>

        <TabsContent value="tickets" className="space-y-4">
          {/* Filters and Search */}
          <Card>
            <CardContent className="p-4">
              <div className="flex flex-col md:flex-row gap-4">
                <div className="relative flex-1">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                  <Input
                    placeholder="Search tickets by title, client, or ID..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-10"
                  />
                </div>
                <div className="flex gap-4">
                  <div className="flex items-center gap-2">
                    <Filter className="h-4 w-4 text-muted-foreground" />
                    <Select value={filterStatus} onValueChange={setFilterStatus}>
                      <SelectTrigger className="w-32">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">All Status</SelectItem>
                        <SelectItem value="open">Open</SelectItem>
                        <SelectItem value="in_progress">In Progress</SelectItem>
                        <SelectItem value="resolved">Resolved</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Loading State */}
          {isLoading && (
            <Card>
              <CardContent className="p-8 text-center">
                <Loader2 className="h-8 w-8 animate-spin mx-auto mb-4" />
                <p className="text-muted-foreground">Loading support tickets...</p>
              </CardContent>
            </Card>
          )}

          {/* Tickets List */}
          {!isLoading && (
            <Card>
              <CardContent className="p-0">
                {filteredTickets.length === 0 ? (
                  <div className="p-8 text-center">
                    <MessageSquare className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                    <h3 className="text-lg font-semibold mb-2">No tickets found</h3>
                    <p className="text-muted-foreground">
                      {searchTerm || filterStatus !== 'all' 
                        ? 'Try adjusting your search or filters' 
                        : 'Create your first support ticket to get started'}
                    </p>
                  </div>
                ) : (
                  <div className="space-y-0">
                    {filteredTickets.map((ticket) => (
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
                                  onClick={() => handleStatusChange(ticket.id, 'in_progress')}
                                  disabled={updateTicket.isPending}
                                >
                                  Start
                                </Button>
                              )}
                              {ticket.status === 'in_progress' && (
                                <Button
                                  size="sm"
                                  variant="outline"
                                  onClick={() => handleStatusChange(ticket.id, 'resolved')}
                                  disabled={updateTicket.isPending}
                                >
                                  Resolve
                                </Button>
                              )}
                              {ticket.status === 'resolved' && (
                                <Button
                                  size="sm"
                                  variant="outline"
                                  onClick={() => handleStatusChange(ticket.id, 'open')}
                                  disabled={updateTicket.isPending}
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
                )}
              </CardContent>
            </Card>
          )}
        </TabsContent>

        <TabsContent value="create" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Plus className="h-5 w-5" />
                Create New Support Ticket
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <label className="text-sm font-medium mb-1 block">Title</label>
                <Input
                  placeholder="Brief description of the issue"
                  value={newTicketTitle}
                  onChange={(e) => setNewTicketTitle(e.target.value)}
                />
              </div>
              
              <div>
                <label className="text-sm font-medium mb-1 block">Priority</label>
                <Select value={newTicketPriority} onValueChange={setNewTicketPriority}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="low">Low</SelectItem>
                    <SelectItem value="medium">Medium</SelectItem>
                    <SelectItem value="high">High</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              
              <div>
                <label className="text-sm font-medium mb-1 block">Description</label>
                <Textarea
                  placeholder="Detailed description of the issue or request"
                  value={newTicketDescription}
                  onChange={(e) => setNewTicketDescription(e.target.value)}
                  rows={4}
                />
              </div>
              
              <Button 
                onClick={handleCreateTicket} 
                className="w-full"
                disabled={createTicket.isPending}
              >
                {createTicket.isPending ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin mr-2" />
                    Creating...
                  </>
                ) : (
                  'Create Ticket'
                )}
              </Button>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="knowledge" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Knowledge Base</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-3">
                  <h4 className="font-medium">Common Issues</h4>
                  <div className="space-y-2 text-sm">
                    <div className="p-2 border rounded hover:bg-muted/50 cursor-pointer">
                      Internet connection troubleshooting
                    </div>
                    <div className="p-2 border rounded hover:bg-muted/50 cursor-pointer">
                      Router configuration guide
                    </div>
                    <div className="p-2 border rounded hover:bg-muted/50 cursor-pointer">
                      Billing and payment procedures
                    </div>
                    <div className="p-2 border rounded hover:bg-muted/50 cursor-pointer">
                      Equipment installation guide
                    </div>
                  </div>
                </div>
                
                <div className="space-y-3">
                  <h4 className="font-medium">Contact Information</h4>
                  <div className="space-y-2 text-sm">
                    <div className="p-2 border rounded">
                      <div className="font-medium">Technical Support</div>
                      <div className="text-muted-foreground">+254-700-123-456</div>
                      <div className="text-muted-foreground">tech@kisumunet.co.ke</div>
                    </div>
                    <div className="p-2 border rounded">
                      <div className="font-medium">Billing Support</div>
                      <div className="text-muted-foreground">+254-700-123-457</div>
                      <div className="text-muted-foreground">billing@kisumunet.co.ke</div>
                    </div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default Support;
