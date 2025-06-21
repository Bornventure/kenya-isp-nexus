
import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { useAuth } from '@/contexts/AuthContext';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Plus, Mail, Send, Users } from 'lucide-react';
import ComposeMessage from '@/components/messages/ComposeMessage';
import MessagesList from '@/components/messages/MessagesList';
import MessageView from '@/components/messages/MessageView';

const Messages = () => {
  const { profile } = useAuth();
  const [selectedMessage, setSelectedMessage] = useState<string | null>(null);
  const [showCompose, setShowCompose] = useState(false);

  const { data: unreadCount } = useQuery({
    queryKey: ['unread-messages-count'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('internal_messages')
        .select('id')
        .eq('recipient_id', profile?.id)
        .eq('is_read', false);
      
      if (error) throw error;
      return data?.length || 0;
    },
    enabled: !!profile?.id,
  });

  return (
    <div className="container mx-auto p-6 space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Internal Messages</h1>
          <p className="text-muted-foreground">
            Communicate with your team across departments
          </p>
        </div>
        <Button onClick={() => setShowCompose(true)}>
          <Plus className="h-4 w-4 mr-2" />
          Compose Message
        </Button>
      </div>

      <Tabs defaultValue="inbox" className="space-y-4">
        <TabsList>
          <TabsTrigger value="inbox" className="flex items-center gap-2">
            <Mail className="h-4 w-4" />
            Inbox
            {unreadCount > 0 && (
              <Badge variant="destructive" className="ml-1">
                {unreadCount}
              </Badge>
            )}
          </TabsTrigger>
          <TabsTrigger value="sent" className="flex items-center gap-2">
            <Send className="h-4 w-4" />
            Sent
          </TabsTrigger>
        </TabsList>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-1">
            <TabsContent value="inbox">
              <MessagesList 
                type="inbox" 
                selectedMessage={selectedMessage}
                onSelectMessage={setSelectedMessage}
              />
            </TabsContent>
            <TabsContent value="sent">
              <MessagesList 
                type="sent" 
                selectedMessage={selectedMessage}
                onSelectMessage={setSelectedMessage}
              />
            </TabsContent>
          </div>

          <div className="lg:col-span-2">
            {selectedMessage ? (
              <MessageView messageId={selectedMessage} />
            ) : (
              <Card>
                <CardContent className="flex items-center justify-center h-96">
                  <div className="text-center">
                    <Mail className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                    <p className="text-muted-foreground">
                      Select a message to view its contents
                    </p>
                  </div>
                </CardContent>
              </Card>
            )}
          </div>
        </div>
      </Tabs>

      {showCompose && (
        <ComposeMessage 
          open={showCompose} 
          onClose={() => setShowCompose(false)} 
        />
      )}
    </div>
  );
};

export default Messages;
