
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Checkbox } from '@/components/ui/checkbox';
import { Badge } from '@/components/ui/badge';
import { Send, Users, MessageSquare, Mail } from 'lucide-react';
import { useClients } from '@/hooks/useClients';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';

const BulkMessagingInterface = () => {
  const [subject, setSubject] = useState('');
  const [message, setMessage] = useState('');
  const [messageType, setMessageType] = useState<'sms' | 'email' | 'both'>('sms');
  const [targetAudience, setTargetAudience] = useState<'all' | 'active' | 'suspended' | 'custom'>('active');
  const [selectedClients, setSelectedClients] = useState<string[]>([]);
  const [isSending, setIsSending] = useState(false);

  const { clients } = useClients();
  const { toast } = useToast();

  const getFilteredClients = () => {
    switch (targetAudience) {
      case 'all':
        return clients;
      case 'active':
        return clients.filter(c => c.status === 'active');
      case 'suspended':
        return clients.filter(c => c.status === 'suspended');
      case 'custom':
        return clients.filter(c => selectedClients.includes(c.id));
      default:
        return [];
    }
  };

  const targetClients = getFilteredClients();

  const handleClientToggle = (clientId: string) => {
    setSelectedClients(prev => 
      prev.includes(clientId) 
        ? prev.filter(id => id !== clientId)
        : [...prev, clientId]
    );
  };

  const handleSendMessage = async () => {
    if (!message.trim()) {
      toast({
        title: "Error",
        description: "Please enter a message",
        variant: "destructive",
      });
      return;
    }

    if (targetClients.length === 0) {
      toast({
        title: "Error",
        description: "No recipients selected",
        variant: "destructive",
      });
      return;
    }

    setIsSending(true);

    try {
      // Send bulk message
      const { error } = await supabase.functions.invoke('send-bulk-message', {
        body: {
          recipients: targetClients.map(client => ({
            id: client.id,
            name: client.name,
            email: client.email,
            phone: client.phone
          })),
          subject: subject || 'Important Update',
          message,
          messageType,
          senderType: 'sales'
        }
      });

      if (error) throw error;

      toast({
        title: "Message Sent",
        description: `Bulk message sent to ${targetClients.length} client(s)`,
      });

      // Reset form
      setSubject('');
      setMessage('');
      setSelectedClients([]);
    } catch (error) {
      console.error('Error sending bulk message:', error);
      toast({
        title: "Error",
        description: "Failed to send bulk message",
        variant: "destructive",
      });
    } finally {
      setIsSending(false);
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <MessageSquare className="h-5 w-5" />
          Bulk Messaging
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Message Type Selection */}
        <div>
          <Label>Message Type</Label>
          <Select value={messageType} onValueChange={(value: any) => setMessageType(value)}>
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="sms">SMS Only</SelectItem>
              <SelectItem value="email">Email Only</SelectItem>
              <SelectItem value="both">SMS & Email</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {/* Target Audience */}
        <div>
          <Label>Target Audience</Label>
          <Select value={targetAudience} onValueChange={(value: any) => setTargetAudience(value)}>
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Clients</SelectItem>
              <SelectItem value="active">Active Clients</SelectItem>
              <SelectItem value="suspended">Suspended Clients</SelectItem>
              <SelectItem value="custom">Custom Selection</SelectItem>
            </SelectContent>
          </Select>
          
          <div className="flex items-center gap-2 mt-2">
            <Users className="h-4 w-4 text-muted-foreground" />
            <span className="text-sm text-muted-foreground">
              {targetClients.length} recipient(s) selected
            </span>
          </div>
        </div>

        {/* Custom Client Selection */}
        {targetAudience === 'custom' && (
          <Card className="border-dashed">
            <CardContent className="pt-4">
              <div className="space-y-2 max-h-40 overflow-y-auto">
                {clients.map(client => (
                  <div key={client.id} className="flex items-center space-x-2">
                    <Checkbox
                      checked={selectedClients.includes(client.id)}
                      onCheckedChange={() => handleClientToggle(client.id)}
                    />
                    <div className="flex-1 flex items-center justify-between">
                      <span className="text-sm">{client.name}</span>
                      <div className="flex items-center gap-2">
                        <Badge variant="outline" className="text-xs">
                          {client.status}
                        </Badge>
                        <span className="text-xs text-muted-foreground">
                          {client.phone}
                        </span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        )}

        {/* Subject (for email) */}
        {(messageType === 'email' || messageType === 'both') && (
          <div>
            <Label htmlFor="subject">Subject</Label>
            <Input
              id="subject"
              value={subject}
              onChange={(e) => setSubject(e.target.value)}
              placeholder="Enter email subject..."
            />
          </div>
        )}

        {/* Message Content */}
        <div>
          <Label htmlFor="message">Message</Label>
          <Textarea
            id="message"
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            placeholder="Enter your message..."
            rows={6}
          />
          <p className="text-xs text-muted-foreground mt-1">
            {messageType === 'sms' && `${message.length}/160 characters`}
          </p>
        </div>

        {/* Send Button */}
        <div className="flex justify-end">
          <Button
            onClick={handleSendMessage}
            disabled={isSending || !message.trim() || targetClients.length === 0}
            className="gap-2"
          >
            {isSending ? (
              "Sending..."
            ) : (
              <>
                <Send className="h-4 w-4" />
                Send to {targetClients.length} Client(s)
              </>
            )}
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};

export default BulkMessagingInterface;
