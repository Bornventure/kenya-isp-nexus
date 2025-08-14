
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Textarea } from '@/components/ui/textarea';
import { 
  Plus, 
  Search, 
  Mail,
  Send,
  Reply,
  Forward,
  Archive,
  Trash2,
  Star,
  Clock,
  CheckCircle,
  User,
  Paperclip
} from 'lucide-react';

interface Message {
  id: string;
  sender: string;
  recipient: string;
  subject: string;
  content: string;
  timestamp: string;
  isRead: boolean;
  isStarred: boolean;
  hasAttachment: boolean;
  priority: 'low' | 'medium' | 'high';
  type: 'inbox' | 'sent' | 'draft' | 'archived';
}

// Mock data for demonstration
const mockMessages: Message[] = [
  {
    id: '1',
    sender: 'John Doe',
    recipient: 'Current User',
    subject: 'Network Maintenance Scheduled',
    content: 'We have scheduled network maintenance for this weekend. Please notify all affected clients.',
    timestamp: '2024-01-15T10:30:00Z',
    isRead: false,
    isStarred: true,
    hasAttachment: false,
    priority: 'high',
    type: 'inbox'
  },
  {
    id: '2',
    sender: 'Sarah Wilson',
    recipient: 'Current User',
    subject: 'Client Complaint - Slow Internet',
    content: 'We received a complaint from Client ID: 12345 about slow internet speeds. Please investigate.',
    timestamp: '2024-01-15T09:15:00Z',
    isRead: true,
    isStarred: false,
    hasAttachment: true,
    priority: 'medium',
    type: 'inbox'
  },
  {
    id: '3',
    sender: 'Current User',
    recipient: 'Mike Johnson',
    subject: 'Equipment Installation Update',
    content: 'The new equipment has been installed successfully at the client location.',
    timestamp: '2024-01-14T16:45:00Z',
    isRead: true,
    isStarred: false,
    hasAttachment: false,
    priority: 'low',
    type: 'sent'
  }
];

const MessagesPage = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedMessage, setSelectedMessage] = useState<Message | null>(null);
  const [messages, setMessages] = useState<Message[]>(mockMessages);
  const [showCompose, setShowCompose] = useState(false);
  const [activeTab, setActiveTab] = useState('inbox');

  const filteredMessages = messages.filter(msg => {
    const matchesSearch = msg.subject.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         msg.sender.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         msg.content.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesTab = msg.type === activeTab;
    return matchesSearch && matchesTab;
  });

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'high': return 'bg-red-100 text-red-800';
      case 'medium': return 'bg-yellow-100 text-yellow-800';
      case 'low': return 'bg-green-100 text-green-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const formatTime = (timestamp: string) => {
    return new Date(timestamp).toLocaleString();
  };

  const unreadCount = messages.filter(m => !m.isRead && m.type === 'inbox').length;
  const starredCount = messages.filter(m => m.isStarred).length;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Messages</h1>
          <p className="text-muted-foreground">
            Internal team communication and messaging
          </p>
        </div>
        <Button onClick={() => setShowCompose(true)} className="gap-2">
          <Plus className="h-4 w-4" />
          Compose Message
        </Button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        {/* Sidebar */}
        <div className="lg:col-span-1 space-y-4">
          {/* Stats */}
          <div className="grid grid-cols-2 lg:grid-cols-1 gap-4">
            <Card>
              <CardContent className="p-4">
                <div className="flex items-center gap-2">
                  <Mail className="h-4 w-4 text-blue-500" />
                  <div>
                    <p className="text-sm font-medium">Unread</p>
                    <p className="text-lg font-bold">{unreadCount}</p>
                  </div>
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-4">
                <div className="flex items-center gap-2">
                  <Star className="h-4 w-4 text-yellow-500" />
                  <div>
                    <p className="text-sm font-medium">Starred</p>
                    <p className="text-lg font-bold">{starredCount}</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Navigation */}
          <Card>
            <CardContent className="p-4">
              <div className="space-y-2">
                <Button
                  variant={activeTab === 'inbox' ? 'default' : 'ghost'}
                  className="w-full justify-start gap-2"
                  onClick={() => setActiveTab('inbox')}
                >
                  <Mail className="h-4 w-4" />
                  Inbox
                  {unreadCount > 0 && (
                    <Badge variant="destructive" className="ml-auto">
                      {unreadCount}
                    </Badge>
                  )}
                </Button>
                <Button
                  variant={activeTab === 'sent' ? 'default' : 'ghost'}
                  className="w-full justify-start gap-2"
                  onClick={() => setActiveTab('sent')}
                >
                  <Send className="h-4 w-4" />
                  Sent
                </Button>
                <Button
                  variant={activeTab === 'draft' ? 'default' : 'ghost'}
                  className="w-full justify-start gap-2"
                  onClick={() => setActiveTab('draft')}
                >
                  <Clock className="h-4 w-4" />
                  Drafts
                </Button>
                <Button
                  variant={activeTab === 'archived' ? 'default' : 'ghost'}
                  className="w-full justify-start gap-2"
                  onClick={() => setActiveTab('archived')}
                >
                  <Archive className="h-4 w-4" />
                  Archived
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Main Content */}
        <div className="lg:col-span-3 space-y-4">
          {/* Search */}
          <Card>
            <CardContent className="p-4">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search messages..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
            </CardContent>
          </Card>

          {!selectedMessage ? (
            /* Message List */
            <Card>
              <CardHeader>
                <CardTitle className="capitalize">{activeTab}</CardTitle>
              </CardHeader>
              <CardContent className="p-0">
                <div className="divide-y">
                  {filteredMessages.map((message) => (
                    <div
                      key={message.id}
                      className={`p-4 hover:bg-muted/50 cursor-pointer transition-colors ${
                        !message.isRead ? 'bg-blue-50' : ''
                      }`}
                      onClick={() => setSelectedMessage(message)}
                    >
                      <div className="flex items-start gap-3">
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2 mb-1">
                            <User className="h-4 w-4 text-muted-foreground" />
                            <span className="font-medium text-sm">
                              {activeTab === 'sent' ? message.recipient : message.sender}
                            </span>
                            <Badge className={getPriorityColor(message.priority)}>
                              {message.priority}
                            </Badge>
                            {message.hasAttachment && (
                              <Paperclip className="h-3 w-3 text-muted-foreground" />
                            )}
                            {message.isStarred && (
                              <Star className="h-3 w-3 text-yellow-500 fill-current" />
                            )}
                            {!message.isRead && activeTab === 'inbox' && (
                              <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                            )}
                          </div>
                          <h3 className="font-medium text-sm mb-1 line-clamp-1">
                            {message.subject}
                          </h3>
                          <p className="text-xs text-muted-foreground line-clamp-2">
                            {message.content}
                          </p>
                        </div>
                        <div className="text-xs text-muted-foreground">
                          {formatTime(message.timestamp)}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>

                {filteredMessages.length === 0 && (
                  <div className="text-center py-12">
                    <Mail className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                    <h3 className="text-lg font-semibold mb-2">No messages found</h3>
                    <p className="text-muted-foreground">
                      {searchTerm ? 'Try adjusting your search terms' : `No messages in ${activeTab}`}
                    </p>
                  </div>
                )}
              </CardContent>
            </Card>
          ) : (
            /* Message Detail */
            <Card>
              <CardHeader>
                <div className="flex items-center gap-2">
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => setSelectedMessage(null)}
                  >
                    ← Back
                  </Button>
                  <div className="flex-1">
                    <h2 className="text-lg font-semibold">{selectedMessage.subject}</h2>
                    <p className="text-sm text-muted-foreground">
                      From: {selectedMessage.sender} • {formatTime(selectedMessage.timestamp)}
                    </p>
                  </div>
                  <div className="flex gap-2">
                    <Button variant="outline" size="sm">
                      <Reply className="h-4 w-4" />
                    </Button>
                    <Button variant="outline" size="sm">
                      <Forward className="h-4 w-4" />
                    </Button>
                    <Button variant="outline" size="sm">
                      <Archive className="h-4 w-4" />
                    </Button>
                    <Button variant="outline" size="sm">
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex items-center gap-2">
                    <Badge className={getPriorityColor(selectedMessage.priority)}>
                      {selectedMessage.priority} priority
                    </Badge>
                    {selectedMessage.hasAttachment && (
                      <Badge variant="outline">
                        <Paperclip className="h-3 w-3 mr-1" />
                        Attachment
                      </Badge>
                    )}
                  </div>
                  <div className="prose max-w-none">
                    <p>{selectedMessage.content}</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}
        </div>
      </div>

      {/* Compose Modal */}
      {showCompose && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <Card className="w-full max-w-2xl">
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle>Compose Message</CardTitle>
                <Button variant="ghost" onClick={() => setShowCompose(false)}>
                  ×
                </Button>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <label className="text-sm font-medium">To</label>
                <Input placeholder="Select recipient..." />
              </div>
              <div>
                <label className="text-sm font-medium">Subject</label>
                <Input placeholder="Enter subject..." />
              </div>
              <div>
                <label className="text-sm font-medium">Priority</label>
                <select className="w-full p-2 border rounded-md">
                  <option value="low">Low</option>
                  <option value="medium">Medium</option>
                  <option value="high">High</option>
                </select>
              </div>
              <div>
                <label className="text-sm font-medium">Message</label>
                <Textarea
                  placeholder="Type your message..."
                  rows={6}
                />
              </div>
              <div className="flex justify-between">
                <Button variant="outline">
                  <Paperclip className="h-4 w-4 mr-2" />
                  Attach File
                </Button>
                <div className="flex gap-2">
                  <Button variant="outline" onClick={() => setShowCompose(false)}>
                    Cancel
                  </Button>
                  <Button>
                    <Send className="h-4 w-4 mr-2" />
                    Send
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
};

export default MessagesPage;
