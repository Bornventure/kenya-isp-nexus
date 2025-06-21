
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { useAuth } from '@/contexts/AuthContext';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Reply, Clock, User, Mail } from 'lucide-react';
import { format } from 'date-fns';
import { useToast } from '@/hooks/use-toast';
import ComposeMessage from './ComposeMessage';
import { useState } from 'react';

interface MessageViewProps {
  messageId: string;
}

const MessageView: React.FC<MessageViewProps> = ({ messageId }) => {
  const { profile } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [showReply, setShowReply] = useState(false);

  const { data: message, isLoading } = useQuery({
    queryKey: ['message', messageId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('internal_messages')
        .select(`
          *,
          sender:profiles!internal_messages_sender_id_fkey(first_name, last_name, role),
          recipient:profiles!internal_messages_recipient_id_fkey(first_name, last_name, role)
        `)
        .eq('id', messageId)
        .single();

      if (error) throw error;
      return data;
    },
    enabled: !!messageId,
  });

  const markAsRead = useMutation({
    mutationFn: async () => {
      const { error } = await supabase
        .from('internal_messages')
        .update({ 
          is_read: true, 
          read_at: new Date().toISOString() 
        })
        .eq('id', messageId)
        .eq('recipient_id', profile?.id);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['messages'] });
      queryClient.invalidateQueries({ queryKey: ['unread-messages-count'] });
      queryClient.invalidateQueries({ queryKey: ['message', messageId] });
    },
  });

  // Mark as read when message is opened (if user is recipient and it's unread)
  React.useEffect(() => {
    if (message && !message.is_read && message.recipient_id === profile?.id) {
      markAsRead.mutate();
    }
  }, [message, profile?.id]);

  if (isLoading) {
    return (
      <Card>
        <CardContent className="p-6">
          <div className="animate-pulse space-y-4">
            <div className="h-6 bg-gray-200 rounded w-3/4"></div>
            <div className="h-4 bg-gray-200 rounded w-1/2"></div>
            <div className="space-y-2">
              <div className="h-4 bg-gray-200 rounded"></div>
              <div className="h-4 bg-gray-200 rounded"></div>
              <div className="h-4 bg-gray-200 rounded w-3/4"></div>
            </div>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (!message) {
    return (
      <Card>
        <CardContent className="flex items-center justify-center h-96">
          <p className="text-muted-foreground">Message not found</p>
        </CardContent>
      </Card>
    );
  }

  const isReceived = message.recipient_id === profile?.id;

  return (
    <>
      <Card>
        <CardHeader>
          <div className="flex justify-between items-start">
            <div className="space-y-2">
              <CardTitle className="text-xl">{message.subject}</CardTitle>
              <div className="flex items-center gap-4 text-sm text-muted-foreground">
                <div className="flex items-center gap-2">
                  <User className="h-4 w-4" />
                  <span>
                    {isReceived ? 'From' : 'To'}: {' '}
                    {isReceived 
                      ? `${message.sender?.first_name} ${message.sender?.last_name}`
                      : `${message.recipient?.first_name} ${message.recipient?.last_name}`
                    }
                  </span>
                  <Badge variant="outline" className="text-xs">
                    {isReceived 
                      ? message.sender?.role?.replace('_', ' ')
                      : message.recipient?.role?.replace('_', ' ')
                    }
                  </Badge>
                </div>
                <div className="flex items-center gap-1">
                  <Clock className="h-4 w-4" />
                  {format(new Date(message.sent_at), 'MMM dd, yyyy at h:mm a')}
                </div>
              </div>
            </div>
            {isReceived && (
              <Button 
                variant="outline" 
                size="sm"
                onClick={() => setShowReply(true)}
              >
                <Reply className="h-4 w-4 mr-2" />
                Reply
              </Button>
            )}
          </div>
        </CardHeader>
        <CardContent>
          <div className="prose max-w-none">
            <div className="whitespace-pre-wrap text-sm leading-relaxed">
              {message.content}
            </div>
          </div>
          
          {!message.is_read && isReceived && (
            <div className="mt-4 p-3 bg-blue-50 border border-blue-200 rounded-lg">
              <div className="flex items-center gap-2 text-sm text-blue-800">
                <Mail className="h-4 w-4" />
                This message was marked as read when you opened it.
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {showReply && (
        <ComposeMessage
          open={showReply}
          onClose={() => setShowReply(false)}
          replyTo={messageId}
        />
      )}
    </>
  );
};

export default MessageView;
