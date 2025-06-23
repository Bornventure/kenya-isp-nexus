
import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Checkbox } from '@/components/ui/checkbox';
import { Progress } from '@/components/ui/progress';
import { Mail, MessageSquare, Send, Users, Upload } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

const BulkCommunication = () => {
  const { toast } = useToast();
  const [selectedRecipients, setSelectedRecipients] = useState<string[]>([]);
  const [messageType, setMessageType] = useState<'email' | 'sms'>('email');
  const [isSending, setIsSending] = useState(false);
  const [sendProgress, setSendProgress] = useState(0);

  const recipientGroups = [
    { id: 'all_clients', label: 'All Clients', count: 1250 },
    { id: 'active_clients', label: 'Active Clients', count: 980 },
    { id: 'overdue_payments', label: 'Overdue Payments', count: 45 },
    { id: 'new_clients', label: 'New Clients (Last 30 days)', count: 28 },
  ];

  const handleSendBulkMessage = async () => {
    if (selectedRecipients.length === 0) {
      toast({
        title: "No Recipients Selected",
        description: "Please select at least one recipient group",
        variant: "destructive",
      });
      return;
    }

    setIsSending(true);
    setSendProgress(0);

    // Simulate sending progress
    const interval = setInterval(() => {
      setSendProgress(prev => {
        if (prev >= 100) {
          clearInterval(interval);
          setIsSending(false);
          toast({
            title: "Bulk Message Sent",
            description: `Message has been sent to ${selectedRecipients.length} group(s) successfully`,
          });
          return 100;
        }
        return prev + 10;
      });
    }, 500);
  };

  const toggleRecipient = (groupId: string) => {
    setSelectedRecipients(prev => 
      prev.includes(groupId) 
        ? prev.filter(id => id !== groupId)
        : [...prev, groupId]
    );
  };

  const getTotalRecipients = () => {
    return recipientGroups
      .filter(group => selectedRecipients.includes(group.id))
      .reduce((total, group) => total + group.count, 0);
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Send className="h-5 w-5" />
            Bulk Communication
          </CardTitle>
          <CardDescription>
            Send emails or SMS messages to multiple clients at once
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Message Type Selection */}
          <div>
            <Label>Communication Type</Label>
            <Select value={messageType} onValueChange={(value: 'email' | 'sms') => setMessageType(value)}>
              <SelectTrigger className="w-full">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="email">
                  <div className="flex items-center gap-2">
                    <Mail className="h-4 w-4" />
                    Email
                  </div>
                </SelectItem>
                <SelectItem value="sms">
                  <div className="flex items-center gap-2">
                    <MessageSquare className="h-4 w-4" />
                    SMS
                  </div>
                </SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Recipient Selection */}
          <div>
            <Label>Select Recipients</Label>
            <div className="mt-2 space-y-3">
              {recipientGroups.map((group) => (
                <div key={group.id} className="flex items-center space-x-2">
                  <Checkbox
                    id={group.id}
                    checked={selectedRecipients.includes(group.id)}
                    onCheckedChange={() => toggleRecipient(group.id)}
                  />
                  <Label htmlFor={group.id} className="flex-1 cursor-pointer">
                    <div className="flex items-center justify-between">
                      <span>{group.label}</span>
                      <Badge variant="secondary">{group.count} clients</Badge>
                    </div>
                  </Label>
                </div>
              ))}
            </div>
            
            {selectedRecipients.length > 0 && (
              <div className="mt-3 p-3 bg-blue-50 rounded-lg">
                <div className="flex items-center gap-2 text-blue-700">
                  <Users className="h-4 w-4" />
                  <span className="font-medium">
                    Total Recipients: {getTotalRecipients().toLocaleString()}
                  </span>
                </div>
              </div>
            )}
          </div>

          {/* Message Content */}
          {messageType === 'email' && (
            <div>
              <Label htmlFor="subject">Subject</Label>
              <Input
                id="subject"
                placeholder="Enter email subject"
              />
            </div>
          )}

          <div>
            <Label htmlFor="message">Message</Label>
            <Textarea
              id="message"
              placeholder={`Enter your ${messageType} message here...`}
              rows={6}
            />
            <p className="text-sm text-muted-foreground mt-1">
              Available variables: {'{client_name}'}, {'{balance}'}, {'{service_type}'}
            </p>
          </div>

          {/* File Upload for Email */}
          {messageType === 'email' && (
            <div>
              <Label>Attachments (Optional)</Label>
              <div className="mt-2 border-2 border-dashed border-gray-300 rounded-lg p-6 text-center">
                <Upload className="h-8 w-8 mx-auto text-gray-400 mb-2" />
                <p className="text-sm text-muted-foreground">
                  Click to upload files or drag and drop
                </p>
                <Button variant="outline" className="mt-2">
                  Select Files
                </Button>
              </div>
            </div>
          )}

          {/* Send Progress */}
          {isSending && (
            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span>Sending messages...</span>
                <span>{sendProgress}%</span>
              </div>
              <Progress value={sendProgress} className="w-full" />
            </div>
          )}

          {/* Send Button */}
          <Button 
            onClick={handleSendBulkMessage}
            disabled={isSending || selectedRecipients.length === 0}
            className="w-full"
          >
            {isSending ? (
              <>Sending...</>
            ) : (
              <>
                <Send className="h-4 w-4 mr-2" />
                Send to {getTotalRecipients().toLocaleString()} Recipients
              </>
            )}
          </Button>
        </CardContent>
      </Card>
    </div>
  );
};

export default BulkCommunication;
