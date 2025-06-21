
-- Create internal messages table
CREATE TABLE public.internal_messages (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  sender_id UUID REFERENCES public.profiles(id) NOT NULL,
  recipient_id UUID REFERENCES public.profiles(id) NOT NULL,
  subject TEXT NOT NULL,
  content TEXT NOT NULL,
  is_read BOOLEAN NOT NULL DEFAULT false,
  sent_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  read_at TIMESTAMP WITH TIME ZONE,
  message_type VARCHAR(50) NOT NULL DEFAULT 'email',
  attachments JSONB DEFAULT '[]'::jsonb,
  isp_company_id UUID REFERENCES public.isp_companies(id),
  thread_id UUID DEFAULT gen_random_uuid(),
  reply_to_id UUID REFERENCES public.internal_messages(id),
  is_deleted BOOLEAN NOT NULL DEFAULT false,
  deleted_at TIMESTAMP WITH TIME ZONE
);

-- Create message attachments table
CREATE TABLE public.message_attachments (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  message_id UUID REFERENCES public.internal_messages(id) ON DELETE CASCADE NOT NULL,
  file_name TEXT NOT NULL,
  file_size BIGINT NOT NULL,
  file_type TEXT NOT NULL,
  file_url TEXT NOT NULL,
  uploaded_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  isp_company_id UUID REFERENCES public.isp_companies(id)
);

-- Create notifications table for general notifications
CREATE TABLE public.notifications (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES public.profiles(id) NOT NULL,
  title TEXT NOT NULL,
  message TEXT NOT NULL,
  type VARCHAR(50) NOT NULL DEFAULT 'info',
  is_read BOOLEAN NOT NULL DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  read_at TIMESTAMP WITH TIME ZONE,
  related_entity_type VARCHAR(50),
  related_entity_id UUID,
  action_url TEXT,
  isp_company_id UUID REFERENCES public.isp_companies(id)
);

-- Enable RLS
ALTER TABLE public.internal_messages ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.message_attachments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.notifications ENABLE ROW LEVEL SECURITY;

-- RLS Policies for internal_messages
CREATE POLICY "Users can view messages they sent or received" 
  ON public.internal_messages 
  FOR SELECT 
  USING (sender_id = auth.uid() OR recipient_id = auth.uid());

CREATE POLICY "Users can send messages" 
  ON public.internal_messages 
  FOR INSERT 
  WITH CHECK (sender_id = auth.uid());

CREATE POLICY "Users can update messages they sent or received" 
  ON public.internal_messages 
  FOR UPDATE 
  USING (sender_id = auth.uid() OR recipient_id = auth.uid());

-- RLS Policies for message_attachments
CREATE POLICY "Users can view attachments for their messages" 
  ON public.message_attachments 
  FOR SELECT 
  USING (
    EXISTS (
      SELECT 1 FROM public.internal_messages 
      WHERE id = message_attachments.message_id 
      AND (sender_id = auth.uid() OR recipient_id = auth.uid())
    )
  );

CREATE POLICY "Users can upload attachments to their messages" 
  ON public.message_attachments 
  FOR INSERT 
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.internal_messages 
      WHERE id = message_attachments.message_id 
      AND sender_id = auth.uid()
    )
  );

-- RLS Policies for notifications
CREATE POLICY "Users can view their own notifications" 
  ON public.notifications 
  FOR SELECT 
  USING (user_id = auth.uid());

CREATE POLICY "System can create notifications" 
  ON public.notifications 
  FOR INSERT 
  WITH CHECK (true);

CREATE POLICY "Users can update their own notifications" 
  ON public.notifications 
  FOR UPDATE 
  USING (user_id = auth.uid());

-- Create indexes for performance
CREATE INDEX idx_internal_messages_sender ON public.internal_messages(sender_id);
CREATE INDEX idx_internal_messages_recipient ON public.internal_messages(recipient_id);
CREATE INDEX idx_internal_messages_thread ON public.internal_messages(thread_id);
CREATE INDEX idx_notifications_user_unread ON public.notifications(user_id, is_read);
CREATE INDEX idx_message_attachments_message ON public.message_attachments(message_id);

-- Create function to notify recipient of new message
CREATE OR REPLACE FUNCTION public.notify_message_recipient()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.notifications (
    user_id,
    title,
    message,
    type,
    related_entity_type,
    related_entity_id,
    isp_company_id
  ) VALUES (
    NEW.recipient_id,
    'New Internal Message',
    'You have received a new message: ' || NEW.subject,
    'message',
    'internal_message',
    NEW.id,
    NEW.isp_company_id
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger for message notifications
CREATE TRIGGER trigger_notify_message_recipient
  AFTER INSERT ON public.internal_messages
  FOR EACH ROW
  EXECUTE FUNCTION public.notify_message_recipient();
