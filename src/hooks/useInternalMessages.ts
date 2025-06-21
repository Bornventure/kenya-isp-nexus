
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/hooks/use-toast';

export const useInternalMessages = () => {
  const { profile } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const getMessages = (type: 'inbox' | 'sent') => {
    return useQuery({
      queryKey: ['messages', type],
      queryFn: async () => {
        let query = supabase
          .from('internal_messages')
          .select(`
            *,
            sender:sender_id(first_name, last_name, role),
            recipient:recipient_id(first_name, last_name, role)
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
  };

  const getUnreadCount = () => {
    return useQuery({
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
  };

  const sendMessage = useMutation({
    mutationFn: async (messageData: {
      recipient_id: string;
      subject: string;
      content: string;
      reply_to_id?: string;
    }) => {
      const { data, error } = await supabase
        .from('internal_messages')
        .insert({
          sender_id: profile?.id,
          recipient_id: messageData.recipient_id,
          subject: messageData.subject,
          content: messageData.content,
          isp_company_id: profile?.isp_company_id,
          reply_to_id: messageData.reply_to_id || null,
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

  return {
    getMessages,
    getUnreadCount,
    sendMessage,
  };
};
