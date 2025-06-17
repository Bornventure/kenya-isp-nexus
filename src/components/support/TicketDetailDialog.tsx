import React, { useState } from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  User, 
  Calendar, 
  AlertTriangle, 
  MessageSquare, 
  Clock,
  Bell,
  Users,
  ArrowUp
} from 'lucide-react';
import { useTicketComments } from '@/hooks/useTicketComments';
import { useTicketAssignments } from '@/hooks/useTicketAssignments';
import TicketAssignmentDialog from './TicketAssignmentDialog';
import TicketEscalationDialog from './TicketEscalationDialog';
import NotificationCenter from './NotificationCenter';
import { format } from 'date-fns';
import { useTicketCommentMutations } from '@/hooks/useTicketComments';
import { useAuth } from '@/contexts/AuthContext';

interface TicketDetailDialogProps {
  ticket: any;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onStatusChange?: (ticketId: string, newStatus: string) => void;
}

const TicketDetailDialog: React.FC<TicketDetailDialogProps> = ({
  ticket,
  open,
  onOpenChange,
  onStatusChange,
}) => {
  const { data: comments = [] } = useTicketComments(ticket?.id || '');
  const { data: assignments = [] } = useTicketAssignments(ticket?.id || '');
  const [showAssignDialog, setShowAssignDialog] = useState(false);
  const [showEscalationDialog, setShowEscalationDialog] = useState(false);
  const [newComment, setNewComment] = useState('');
  const { addComment } = useTicketCommentMutations();
  const { profile } = useAuth();

  const handleAddComment = async () => {
    if (!newComment.trim()) return;

    await addComment.mutateAsync({
      ticket_id: ticket.id,
      author_id: profile?.id || '',
      content: newComment,
      is_internal: true,
      isp_company_id: profile?.isp_company_id,
    });

    setNewComment('');
  };

  if (!ticket) return null;

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'high': return 'bg-red-100 text-red-800';
      case 'medium': return 'bg-yellow-100 text-yellow-800';
      case 'low': return 'bg-green-100 text-green-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'open': return 'bg-blue-100 text-blue-800';
      case 'in_progress': return 'bg-orange-100 text-orange-800';
      case 'resolved': return 'bg-green-100 text-green-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <>
      <Dialog open={open} onOpenChange={onOpenChange}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <div className="flex items-start justify-between">
              <div>
                <DialogTitle className="text-xl">{ticket.title}</DialogTitle>
                <p className="text-sm text-muted-foreground mt-1">
                  Ticket ID: {ticket.id.slice(0, 8)}...
                </p>
              </div>
              <div className="flex gap-2">
                <Badge className={getPriorityColor(ticket.priority || 'medium')}>
                  {ticket.priority}
                </Badge>
                <Badge className={getStatusColor(ticket.status || 'open')}>
                  {ticket.status}
                </Badge>
                {ticket.escalation_level && ticket.escalation_level > 1 && (
                  <Badge variant="destructive" className="flex items-center gap-1">
                    <ArrowUp className="h-3 w-3" />
                    Level {ticket.escalation_level}
                  </Badge>
                )}
              </div>
            </div>
          </DialogHeader>

          <Tabs defaultValue="details" className="w-full">
            <TabsList className="grid w-full grid-cols-5">
              <TabsTrigger value="details">Details</TabsTrigger>
              <TabsTrigger value="comments">
                Comments ({comments.length})
              </TabsTrigger>
              <TabsTrigger value="assignments">
                Assignments ({assignments.length})
              </TabsTrigger>
              <TabsTrigger value="notifications">Notifications</TabsTrigger>
              <TabsTrigger value="actions">Actions</TabsTrigger>
            </TabsList>

            <TabsContent value="details" className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-3">
                  <div className="flex items-center gap-2">
                    <User className="h-4 w-4" />
                    <span className="font-medium">Client:</span>
                    <span>{ticket.clients?.name || 'Unknown'}</span>
                  </div>
                  
                  <div className="flex items-center gap-2">
                    <Calendar className="h-4 w-4" />
                    <span className="font-medium">Created:</span>
                    <span>{format(new Date(ticket.created_at), 'PPp')}</span>
                  </div>

                  {ticket.assigned_to && (
                    <div className="flex items-center gap-2">
                      <Users className="h-4 w-4" />
                      <span className="font-medium">Assigned to:</span>
                      <span>
                        {ticket.assigned_profile?.first_name} {ticket.assigned_profile?.last_name}
                      </span>
                    </div>
                  )}

                  {ticket.departments && (
                    <div className="flex items-center gap-2">
                      <Users className="h-4 w-4" />
                      <span className="font-medium">Department:</span>
                      <span>{ticket.departments.name}</span>
                    </div>
                  )}
                </div>

                <div className="space-y-3">
                  <div className="flex items-center gap-2">
                    <AlertTriangle className="h-4 w-4" />
                    <span className="font-medium">Type:</span>
                    <span className="capitalize">{ticket.ticket_type || 'general'}</span>
                  </div>

                  {ticket.sla_due_date && (
                    <div className="flex items-center gap-2">
                      <Clock className="h-4 w-4" />
                      <span className="font-medium">SLA Due:</span>
                      <span>{format(new Date(ticket.sla_due_date), 'PPp')}</span>
                    </div>
                  )}

                  {ticket.external_reference && (
                    <div className="flex items-center gap-2">
                      <span className="font-medium">External Ref:</span>
                      <span>{ticket.external_reference}</span>
                    </div>
                  )}

                  {ticket.requires_field_visit && (
                    <div className="flex items-center gap-2">
                      <Badge variant="outline">Field Visit Required</Badge>
                    </div>
                  )}
                </div>
              </div>

              <Separator />

              <div>
                <h4 className="font-medium mb-2">Description</h4>
                <p className="text-sm text-muted-foreground whitespace-pre-wrap">
                  {ticket.description}
                </p>
              </div>

              {ticket.resolution && (
                <>
                  <Separator />
                  <div>
                    <h4 className="font-medium mb-2">Resolution</h4>
                    <p className="text-sm text-muted-foreground whitespace-pre-wrap">
                      {ticket.resolution}
                    </p>
                  </div>
                </>
              )}
            </TabsContent>

            <TabsContent value="comments" className="space-y-4">
              <div className="space-y-3">
                {comments.map((comment) => (
                  <div key={comment.id} className="border rounded-lg p-3">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="font-medium">
                          {comment.profiles?.first_name} {comment.profiles?.last_name}
                        </p>
                        <p className="text-sm text-muted-foreground">
                          {format(new Date(comment.created_at), 'PPp')}
                        </p>
                      </div>
                      {comment.is_internal && (
                        <Badge variant="secondary">Internal</Badge>
                      )}
                    </div>
                    <p className="text-sm text-muted-foreground mt-2">
                      {comment.content}
                    </p>
                  </div>
                ))}
                
                {comments.length === 0 && (
                  <p className="text-sm text-muted-foreground text-center py-4">
                    No comments yet
                  </p>
                )}
              </div>

              <Separator />

              <div className="flex items-center gap-2">
                <input
                  type="text"
                  placeholder="Add comment..."
                  className="flex-1 p-2 border rounded-md"
                  value={newComment}
                  onChange={(e) => setNewComment(e.target.value)}
                />
                <Button onClick={handleAddComment}>Add</Button>
              </div>
            </TabsContent>

            <TabsContent value="assignments" className="space-y-4">
              <div className="space-y-3">
                {assignments.map((assignment) => (
                  <div key={assignment.id} className="border rounded-lg p-3">
                    <div className="flex items-center justify-between">
                      <div>
                        {assignment.assigned_to_profile && (
                          <p className="font-medium">
                            {assignment.assigned_to_profile.first_name} {assignment.assigned_to_profile.last_name}
                          </p>
                        )}
                        {assignment.departments && (
                          <p className="text-sm text-muted-foreground">
                            Department: {assignment.departments.name}
                          </p>
                        )}
                      </div>
                      <Badge variant={assignment.status === 'active' ? 'default' : 'secondary'}>
                        {assignment.status}
                      </Badge>
                    </div>
                    
                    {assignment.assignment_reason && (
                      <p className="text-sm text-muted-foreground mt-2">
                        {assignment.assignment_reason}
                      </p>
                    )}
                    
                    <p className="text-xs text-muted-foreground mt-2">
                      Assigned {format(new Date(assignment.assigned_at), 'PPp')}
                      {assignment.assigned_from_profile && (
                        <span> by {assignment.assigned_from_profile.first_name} {assignment.assigned_from_profile.last_name}</span>
                      )}
                    </p>
                  </div>
                ))}
                
                {assignments.length === 0 && (
                  <p className="text-sm text-muted-foreground text-center py-4">
                    No assignments yet
                  </p>
                )}
              </div>
            </TabsContent>

            <TabsContent value="notifications">
              <NotificationCenter ticketId={ticket.id} />
            </TabsContent>

            <TabsContent value="actions" className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <Button onClick={() => setShowAssignDialog(true)} className="w-full">
                  <Users className="h-4 w-4 mr-2" />
                  Assign Ticket
                </Button>
                
                <Button 
                  onClick={() => setShowEscalationDialog(true)} 
                  variant="outline" 
                  className="w-full"
                >
                  <ArrowUp className="h-4 w-4 mr-2" />
                  Escalate Ticket
                </Button>

                <select
                  value={ticket.status}
                  onChange={(e) => onStatusChange?.(ticket.id, e.target.value)}
                  className="w-full p-2 border rounded-md"
                >
                  <option value="open">Open</option>
                  <option value="in_progress">In Progress</option>
                  <option value="resolved">Resolved</option>
                </select>

                <Button variant="outline" className="w-full">
                  <MessageSquare className="h-4 w-4 mr-2" />
                  Contact Client
                </Button>
              </div>
            </TabsContent>
          </Tabs>
        </DialogContent>
      </Dialog>

      <TicketAssignmentDialog
        open={showAssignDialog}
        onOpenChange={setShowAssignDialog}
        ticketId={ticket.id}
      />

      <TicketEscalationDialog
        open={showEscalationDialog}
        onOpenChange={setShowEscalationDialog}
        ticketId={ticket.id}
        currentEscalationLevel={ticket.escalation_level || 1}
      />
    </>
  );
};

export default TicketDetailDialog;
