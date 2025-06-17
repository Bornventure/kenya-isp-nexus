
import React, { useState } from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { AlertCircle } from 'lucide-react';
import { useSupportTickets, useTicketMutations } from '@/hooks/useApiQueries';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/hooks/use-toast';

import SupportHeader from '@/components/support/SupportHeader';
import SupportStats from '@/components/support/SupportStats';
import TicketFilters from '@/components/support/TicketFilters';
import TicketsList from '@/components/support/TicketsList';
import CreateTicketForm from '@/components/support/CreateTicketForm';
import KnowledgeBase from '@/components/support/KnowledgeBase';

const Support = () => {
  const { profile } = useAuth();
  const { toast } = useToast();
  const { data: tickets, isLoading, error } = useSupportTickets();
  const { createTicket, updateTicket } = useTicketMutations();

  const [newTicketTitle, setNewTicketTitle] = useState('');
  const [newTicketDescription, setNewTicketDescription] = useState('');
  const [newTicketPriority, setNewTicketPriority] = useState('medium');
  const [newTicketType, setNewTicketType] = useState('general');
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState('all');

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
        ticket_type: newTicketType as 'technical' | 'billing' | 'general' | 'installation' | 'maintenance' | 'complaint',
        status: 'open',
        escalation_level: 1,
        ticket_source: 'internal',
        isp_company_id: profile?.isp_company_id,
        created_by: profile?.id,
      });

      // Reset form
      setNewTicketTitle('');
      setNewTicketDescription('');
      setNewTicketPriority('medium');
      setNewTicketType('general');
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
      <SupportHeader />
      <SupportStats stats={ticketStats} />

      <Tabs defaultValue="tickets" className="w-full">
        <TabsList>
          <TabsTrigger value="tickets">Support Tickets</TabsTrigger>
          <TabsTrigger value="create">Create Ticket</TabsTrigger>
          <TabsTrigger value="knowledge">Knowledge Base</TabsTrigger>
        </TabsList>

        <TabsContent value="tickets" className="space-y-4">
          <TicketFilters
            searchTerm={searchTerm}
            filterStatus={filterStatus}
            onSearchChange={setSearchTerm}
            onStatusFilterChange={setFilterStatus}
          />
          <TicketsList
            tickets={filteredTickets}
            isLoading={isLoading}
            searchTerm={searchTerm}
            filterStatus={filterStatus}
            onStatusChange={handleStatusChange}
            isUpdating={updateTicket.isPending}
          />
        </TabsContent>

        <TabsContent value="create" className="space-y-4">
          <CreateTicketForm
            title={newTicketTitle}
            description={newTicketDescription}
            priority={newTicketPriority}
            ticketType={newTicketType}
            onTitleChange={setNewTicketTitle}
            onDescriptionChange={setNewTicketDescription}
            onPriorityChange={setNewTicketPriority}
            onTicketTypeChange={setNewTicketType}
            onSubmit={handleCreateTicket}
            isSubmitting={createTicket.isPending}
          />
        </TabsContent>

        <TabsContent value="knowledge" className="space-y-4">
          <KnowledgeBase />
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default Support;
