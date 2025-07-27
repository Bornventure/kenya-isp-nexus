
import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Switch } from '@/components/ui/switch';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Mail, MessageSquare, Edit, Trash2, Plus, Search, Filter } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

interface NotificationTemplatesListProps {
  templates: any[];
  onEdit: (template: any) => void;
  onDelete: (templateId: string) => void;
  onToggleActive: (templateId: string, isActive: boolean) => void;
}

const NotificationTemplatesList: React.FC<NotificationTemplatesListProps> = ({
  templates,
  onEdit,
  onDelete,
  onToggleActive
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [filterCategory, setFilterCategory] = useState('all');
  const [filterTrigger, setFilterTrigger] = useState('all');
  const { toast } = useToast();

  const filteredTemplates = templates.filter(template => {
    const matchesSearch = template.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         template.category.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = filterCategory === 'all' || template.category === filterCategory;
    const matchesTrigger = filterTrigger === 'all' || template.trigger_event === filterTrigger;
    
    return matchesSearch && matchesCategory && matchesTrigger;
  });

  const handleToggleActive = (templateId: string, isActive: boolean) => {
    onToggleActive(templateId, isActive);
    toast({
      title: isActive ? "Template Activated" : "Template Deactivated",
      description: `Template has been ${isActive ? 'activated' : 'deactivated'}`,
    });
  };

  const handleDelete = (templateId: string) => {
    if (window.confirm('Are you sure you want to delete this template?')) {
      onDelete(templateId);
      toast({
        title: "Template Deleted",
        description: "Template has been deleted successfully",
      });
    }
  };

  return (
    <div className="space-y-6">
      {/* Search and Filter */}
      <Card>
        <CardHeader>
          <CardTitle>Notification Templates</CardTitle>
          <CardDescription>
            Manage automated email and SMS templates for client communications
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col md:flex-row gap-4">
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                <Input
                  placeholder="Search templates..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>
            <div className="flex gap-2">
              <Select value={filterCategory} onValueChange={setFilterCategory}>
                <SelectTrigger className="w-[150px]">
                  <SelectValue placeholder="Category" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Categories</SelectItem>
                  <SelectItem value="billing">Billing</SelectItem>
                  <SelectItem value="service">Service</SelectItem>
                  <SelectItem value="support">Support</SelectItem>
                  <SelectItem value="account">Account</SelectItem>
                  <SelectItem value="network">Network</SelectItem>
                </SelectContent>
              </Select>
              <Select value={filterTrigger} onValueChange={setFilterTrigger}>
                <SelectTrigger className="w-[150px]">
                  <SelectValue placeholder="Trigger" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Triggers</SelectItem>
                  <SelectItem value="payment_received">Payment Received</SelectItem>
                  <SelectItem value="payment_reminder">Payment Reminder</SelectItem>
                  <SelectItem value="service_expiry">Service Expiry</SelectItem>
                  <SelectItem value="service_renewal">Service Renewal</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Templates List */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredTemplates.map((template) => (
          <Card key={template.id} className="hover:shadow-md transition-shadow">
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <CardTitle className="text-lg">{template.name}</CardTitle>
                <div className="flex items-center gap-2">
                  <Switch
                    checked={template.is_active}
                    onCheckedChange={(checked) => handleToggleActive(template.id, checked)}
                  />
                </div>
              </div>
              <div className="flex items-center gap-2">
                <Badge variant="outline">{template.category}</Badge>
                <Badge variant="secondary">{template.trigger_event}</Badge>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center gap-2">
                {template.channels.includes('email') && (
                  <Badge variant="default" className="gap-1">
                    <Mail className="h-3 w-3" />
                    Email
                  </Badge>
                )}
                {template.channels.includes('sms') && (
                  <Badge variant="default" className="gap-1">
                    <MessageSquare className="h-3 w-3" />
                    SMS
                  </Badge>
                )}
              </div>
              
              <div className="text-sm text-gray-600">
                <p className="font-medium">Auto-send: {template.auto_send ? 'Yes' : 'No'}</p>
                <p>Variables: {template.variables?.length || 0}</p>
              </div>

              <div className="flex justify-between items-center pt-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => onEdit(template)}
                >
                  <Edit className="h-4 w-4 mr-1" />
                  Edit
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => handleDelete(template.id)}
                >
                  <Trash2 className="h-4 w-4 mr-1" />
                  Delete
                </Button>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {filteredTemplates.length === 0 && (
        <Card>
          <CardContent className="text-center py-8">
            <p className="text-gray-500 mb-4">No templates found</p>
            <p className="text-sm text-gray-400">
              {searchTerm || filterCategory !== 'all' || filterTrigger !== 'all' 
                ? 'Try adjusting your search criteria' 
                : 'Create your first notification template to get started'}
            </p>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default NotificationTemplatesList;
