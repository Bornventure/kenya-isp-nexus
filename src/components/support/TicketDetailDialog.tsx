
import React, { useState } from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { ScrollArea } from '@/components/ui/scroll-area';
import { 
  Clock, 
  User, 
  MessageSquare, 
  ArrowRight,
  UserPlus,
  Send
} from 'lucide-react';
import { useTicketComments, useTicketCommentMutations } from '@/hooks/useTicketComments';
import { useTicketAssignments } from '@/hooks/useTicketAssignments';
import { useAuth } from '@/contexts/AuthContext';
import TicketAssignmentDialog from './TicketAssignmentDialog';

interface TicketDetailDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  ticket: any;
}

const TicketDetailDialog: React.FC<TicketDetailDialogProps> = ({
  open,
  onOpenChange,
  ticket,
}) => {
  const { profile } = useAuth();
  const { data: comments = [] } = useTicketComments(ticket?.id);
  const { data: assignments = [] } = useTicketAssignments(ticket?.id);
  const { addComment } = useTicketCommentMutations();

  const [newComment, setNewComment] = useState('');
  const [isInternal, setIsInternal] = useState(false);
  const [showAssignDialog, setShowAssignDialog] = useState(false);

  const handleAddComment = async () => {
    if (!newComment.trim()) return;

    await addComment.mutateAsync({
      ticket_id: ticket.id,
      author_id: profile?.id || '',
      content: newComment,
      is_internal: isInternal,
      is_resolution: false,
      isp_company_id: profile?.isp_company_id,
    });

    setNewComment('');
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'high': return 'bg-red-500';
      case 'medium': return 'bg-yellow-500';
      case 'low': return 'bg-green-500';
      default: return 'bg-gray-500';
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

  if (!ticket) return null;

  return (
    <>
      <Dialog open={open} onOpenChange={onOpenChange}>
        <DialogContent className="max-w-4xl max-h-[90vh]">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <span>Ticket #{ticket.id.slice(0, 8)}</span>
              <Badge className={`text-white ${getPriorityColor(ticket.priority)}`}>
                {ticket.priority}
              </Badge>
              <Badge className={`text-white ${getStatusColor(ticket.status)}`}>
                {ticket.status.replace('_', ' ')}
              </Badge>
            </DialogTitle>
          </DialogHeader>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Main Content */}
            <div className="lg:col-span-2 space-y-4">
              <div>
                <h3 className="font-semibold text-lg">{ticket.title}</h3>
                <p className="text-muted-foreground mt-2">{ticket.description}</p>
              </div>

              <Separator />

              {/* Comments Section */}
              <div>
                <h4 className="font-semibold mb-3">Comments & Updates</h4>
                <ScrollArea className="h-64 border rounded-lg p-3">
                  {comments.map((comment) => (
                    <div key={comment.id} className="mb-4 last:mb-0">
                      <div className="flex items-center gap-2 mb-1">
                        <User className="h-4 w-4" />
                        <span className="font-medium">
                          {comment.profiles?.first_name} {comment.profiles?.last_name}
                        </span>
                        <span className="text-xs text-muted-foreground">
                          {new Date(comment.created_at).toLocaleString()}
                        </span>
                        {comment.is_internal && (
                          <Badge variant="outline" className="text-xs">Internal</Badge>
                        )}
                      </div>
                      <p className="text-sm ml-6">{comment.content}</p>
                    </div>
                  ))}
                </ScrollArea>

                {/* Add Comment */}
                <div className="mt-4 space-y-2">
                  <Textarea
                    value={newComment}
                    onChange={(e) => setNewComment(e.target.value)}
                    placeholder="Add a comment..."
                    rows={3}
                  />
                  <div className="flex items-center gap-2">
                    <Button
                      size="sm"
                      onClick={handleAddComment}
                      disabled={!newComment.trim() || addComment.isPending}
                    >
                      <Send className="h-4 w-4 mr-1" />
                      Add Comment
                    </Button>
                    <label className="flex items-center gap-1 text-sm">
                      <input
                        type="checkbox"
                        checked={isInternal}
                        onChange={(e) => setIsInternal(e.target.checked)}
                      />
                      Internal Note
                    </label>
                  </div>
                </div>
              </div>
            </div>

            {/* Sidebar */}
            <div className="space-y-4">
              <div>
                <h4 className="font-semibold mb-2">Ticket Details</h4>
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span>Type:</span>
                    <span className="capitalize">{ticket.ticket_type}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Created:</span>
                    <span>{new Date(ticket.created_at).toLocaleDateString()}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Client:</span>
                    <span>{ticket.clients?.name || 'N/A'}</span>
                  </div>
                  {ticket.assigned_to && (
                    <div className="flex justify-between">
                      <span>Assigned to:</span>
                      <span>Staff Member</span>
                    </div>
                  )}
                </div>
              </div>

              <Separator />

              <div>
                <h4 className="font-semibold mb-2">Actions</h4>
                <div className="space-y-2">
                  <Button
                    variant="outline"
                    className="w-full justify-start"
                    onClick={() => setShowAssignDialog(true)}
                  >
                    <UserPlus className="h-4 w-4 mr-2" />
                    Assign Ticket
                  </Button>
                </div>
              </div>

              {/* Assignment History */}
              {assignments.length > 0 && (
                <>
                  <Separator />
                  <div>
                    <h4 className="font-semibold mb-2">Assignment History</h4>
                    <div className="space-y-2">
                      {assignments.map((assignment) => (
                        <div key={assignment.id} className="text-xs p-2 bg-muted rounded">
                          <div className="flex items-center gap-1 mb-1">
                            <ArrowRight className="h-3 w-3" />
                            <span>
                              {assignment.departments?.name || 'Direct Assignment'}
                            </span>
                          </div>
                          <div className="text-muted-foreground">
                            {new Date(assignment.assigned_at).toLocaleString()}
                          </div>
                          {assignment.assignment_reason && (
                            <p className="mt-1">{assignment.assignment_reason}</p>
                          )}
                        </div>
                      ))}
                    </div>
                  </div>
                </>
              )}
            </div>
          </div>
        </DialogContent>
      </Dialog>

      <TicketAssignmentDialog
        open={showAssignDialog}
        onOpenChange={setShowAssignDialog}
        ticketId={ticket?.id || ''}
      />
    </>
  );
};

export default TicketDetailDialog;
