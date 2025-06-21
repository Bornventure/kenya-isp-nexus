
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { useAuth } from '@/contexts/AuthContext';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Mail, MailOpen, Clock } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';

interface MessagesListProps {
  type: 'inbox' | 'sent';
  selectedMessage: string | null;
  onSelectMessage: (messageId: string) => void;
}

const MessagesList: React.FC<MessagesListProps> = ({ type, selectedMessage, onSelectMessage }) => {
  const { profile } = useAuth();

  const { data: messages, isLoading } = useQuery({
    queryKey: ['messages', type],
    queryFn: async () => {
      let query = supabase
        .from('internal_messages')
        .select(`
          *,
          sender:profiles!internal_messages_sender_id_fkey(first_name, last_name, role),
          recipient:profiles!internal_messages_recipient_id_fkey(first_name, last_name, role)
        `)
        .eq('is_deleted', false)
        .order('sent_at', { ascending: false });

      if (type === 'inbox') {
        query = query.eq('recipient_id', profile?.id);
      } else {
        query = query.eq('sender_id', profile?.id);
      }

      const { data, error } = await query;
      if (error) throw error;
      return data;
    },
    enabled: !!profile?.id,
  });

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="capitalize">{type}</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {[...Array(3)].map((_, i) => (
              <div key={i} className="animate-pulse">
                <div className="h-4 bg-gray-200 rounded w-3/4 mb-2"></div>
                <div className="h-3 bg-gray-200 rounded w-1/2"></div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="capitalize flex items-center gap-2">
          <Mail className="h-5 w-5" />
          {type}
          <Badge variant="secondary">{messages?.length || 0}</Badge>
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-2">
          {messages?.length === 0 ? (
            <p className="text-muted-foreground text-center py-8">
              No messages found
            </p>
          ) : (
            messages?.map((message) => {
              const isSelected = selectedMessage === message.id;
              const isUnread = type === 'inbox' && !message.is_read;
              const otherPerson = type === 'inbox' ? message.sender : message.recipient;

              return (
                <div
                  key={message.id}
                  className={`p-3 rounded-lg border cursor-pointer transition-colors ${
                    isSelected 
                      ? 'bg-blue-50 border-blue-200' 
                      : 'hover:bg-gray-50'
                  } ${isUnread ? 'bg-blue-25 border-l-4 border-l-blue-500' : ''}`}
                  onClick={() => onSelectMessage(message.id)}
                >
                  <div className="flex items-start justify-between mb-2">
                    <div className="flex items-center gap-2">
                      {isUnread ? (
                        <Mail className="h-4 w-4 text-blue-600" />
                      ) : (
                        <MailOpen className="h-4 w-4 text-gray-400" />
                      )}
                      <span className={`text-sm ${isUnread ? 'font-semibold' : 'font-medium'}`}>
                        {otherPerson?.first_name} {otherPerson?.last_name}
                      </span>
                      <Badge variant="outline" className="text-xs">
                        {otherPerson?.role?.replace('_', ' ')}
                      </Badge>
                    </div>
                    <div className="flex items-center gap-1 text-xs text-muted-foreground">
                      <Clock className="h-3 w-3" />
                      {formatDistanceToNow(new Date(message.sent_at), { addSuffix: true })}
                    </div>
                  </div>
                  <h4 className={`text-sm ${isUnread ? 'font-semibold' : ''} mb-1 truncate`}>
                    {message.subject}
                  </h4>
                  <p className="text-xs text-muted-foreground truncate">
                    {message.content}
                  </p>
                </div>
              );
            })
          )}
        </div>
      </CardContent>
    </Card>
  );
};

export default MessagesList;
