
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Bell, Mail, MessageSquare, Phone } from 'lucide-react';
import { useNotificationSystem } from '@/hooks/useNotificationSystem';

interface NotificationCenterProps {
  ticketId?: string;
}

const NotificationCenter: React.FC<NotificationCenterProps> = ({ ticketId }) => {
  const { sendNotification } = useNotificationSystem();
  const [selectedChannels, setSelectedChannels] = useState<string[]>(['email']);
  const [notificationType, setNotificationType] = useState('');
  const [priority, setPriority] = useState<'low' | 'medium' | 'high'>('medium');

  const notificationTypes = [
    { value: 'ticket_assigned', label: 'Ticket Assigned', icon: Bell },
    { value: 'ticket_status_changed', label: 'Status Changed', icon: MessageSquare },
    { value: 'ticket_escalated', label: 'Ticket Escalated', icon: Bell },
    { value: 'sla_warning', label: 'SLA Warning', icon: Bell },
  ];

  const channels = [
    { value: 'email', label: 'Email', icon: Mail },
    { value: 'sms', label: 'SMS', icon: Phone },
    { value: 'whatsapp', label: 'WhatsApp', icon: MessageSquare },
  ];

  const handleSendNotification = async () => {
    if (!ticketId || !notificationType) return;

    await sendNotification.mutateAsync({
      type: notificationType as any,
      recipients: [], // Will be determined by the backend based on ticket assignment
      ticket_id: ticketId,
      message: `Notification for ticket ${ticketId}`,
      channels: selectedChannels as any,
      priority,
    });
  };

  const toggleChannel = (channel: string) => {
    setSelectedChannels(prev => 
      prev.includes(channel) 
        ? prev.filter(c => c !== channel)
        : [...prev, channel]
    );
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Bell className="h-5 w-5" />
          Notification Center
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div>
          <label className="text-sm font-medium mb-2 block">Notification Type</label>
          <Select value={notificationType} onValueChange={setNotificationType}>
            <SelectTrigger>
              <SelectValue placeholder="Select notification type" />
            </SelectTrigger>
            <SelectContent>
              {notificationTypes.map((type) => (
                <SelectItem key={type.value} value={type.value}>
                  <div className="flex items-center gap-2">
                    <type.icon className="h-4 w-4" />
                    {type.label}
                  </div>
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div>
          <label className="text-sm font-medium mb-2 block">Channels</label>
          <div className="flex flex-wrap gap-2">
            {channels.map((channel) => (
              <Button
                key={channel.value}
                variant={selectedChannels.includes(channel.value) ? "default" : "outline"}
                size="sm"
                onClick={() => toggleChannel(channel.value)}
                className="flex items-center gap-1"
              >
                <channel.icon className="h-3 w-3" />
                {channel.label}
              </Button>
            ))}
          </div>
        </div>

        <div>
          <label className="text-sm font-medium mb-2 block">Priority</label>
          <Select value={priority} onValueChange={(value: 'low' | 'medium' | 'high') => setPriority(value)}>
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="low">
                <Badge variant="secondary">Low</Badge>
              </SelectItem>
              <SelectItem value="medium">
                <Badge variant="outline">Medium</Badge>
              </SelectItem>
              <SelectItem value="high">
                <Badge variant="destructive">High</Badge>
              </SelectItem>
            </SelectContent>
          </Select>
        </div>

        <Button 
          onClick={handleSendNotification}
          disabled={!ticketId || !notificationType || selectedChannels.length === 0 || sendNotification.isPending}
          className="w-full"
        >
          {sendNotification.isPending ? 'Sending...' : 'Send Notification'}
        </Button>
      </CardContent>
    </Card>
  );
};

export default NotificationCenter;
