
import React, { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/contexts/AuthContext';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Send, Users, X } from 'lucide-react';
import UserSelector from './UserSelector';

interface ComposeMessageProps {
  open: boolean;
  onClose: () => void;
  replyTo?: string;
}

const ComposeMessage: React.FC<ComposeMessageProps> = ({ open, onClose, replyTo }) => {
  const { profile } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  
  const [selectedUser, setSelectedUser] = useState<string>('');
  const [subject, setSubject] = useState('');
  const [content, setContent] = useState('');

  const sendMessage = useMutation({
    mutationFn: async (messageData: { recipient_id: string; subject: string; content: string }) => {
      const { data, error } = await supabase
        .from('internal_messages')
        .insert({
          sender_id: profile?.id,
          recipient_id: messageData.recipient_id,
          subject: messageData.subject,
          content: messageData.content,
          isp_company_id: profile?.isp_company_id,
          reply_to_id: replyTo || null,
        })
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      toast({
        title: "Message Sent",
        description: "Your message has been sent successfully.",
      });
      queryClient.invalidateQueries({ queryKey: ['messages'] });
      queryClient.invalidateQueries({ queryKey: ['unread-messages-count'] });
      handleClose();
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: "Failed to send message. Please try again.",
        variant: "destructive",
      });
      console.error('Error sending message:', error);
    },
  });

  const handleSend = () => {
    if (!selectedUser || !subject.trim() || !content.trim()) {
      toast({
        title: "Missing Information",
        description: "Please fill in all required fields.",
        variant: "destructive",
      });
      return;
    }

    sendMessage.mutate({
      recipient_id: selectedUser,
      subject: subject.trim(),
      content: content.trim(),
    });
  };

  const handleClose = () => {
    setSelectedUser('');
    setSubject('');
    setContent('');
    onClose();
  };

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Send className="h-5 w-5" />
            Compose Message
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="recipient">To *</Label>
            <UserSelector
              selectedUser={selectedUser}
              onSelectUser={setSelectedUser}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="subject">Subject *</Label>
            <Input
              id="subject"
              value={subject}
              onChange={(e) => setSubject(e.target.value)}
              placeholder="Enter message subject..."
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="content">Message *</Label>
            <Textarea
              id="content"
              value={content}
              onChange={(e) => setContent(e.target.value)}
              placeholder="Type your message here..."
              rows={8}
              className="resize-none"
            />
          </div>

          <div className="flex justify-end gap-2 pt-4">
            <Button variant="outline" onClick={handleClose}>
              Cancel
            </Button>
            <Button 
              onClick={handleSend} 
              disabled={sendMessage.isPending}
            >
              {sendMessage.isPending ? 'Sending...' : 'Send Message'}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default ComposeMessage;
