
import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { 
  Edit, 
  Trash2, 
  Mail, 
  MessageSquare, 
  Eye,
  MoreHorizontal,
  Copy
} from 'lucide-react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { useTemplateDeletion } from '@/hooks/useTemplateDeletion';

interface NotificationTemplatesListProps {
  onEdit: (template: any) => void;
}

const NotificationTemplatesList: React.FC<NotificationTemplatesListProps> = ({ onEdit }) => {
  const { toast } = useToast();
  const { deleteTemplate, isDeletingTemplate } = useTemplateDeletion();

  const { data: templates, isLoading, refetch } = useQuery({
    queryKey: ['notification-templates'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('notification_templates')
        .select('*')
        .order('created_at', { ascending: false });
      
      if (error) throw error;
      return data;
    }
  });

  const categoryColors = {
    billing: 'bg-green-100 text-green-800',
    service: 'bg-blue-100 text-blue-800',
    support: 'bg-purple-100 text-purple-800',
    account: 'bg-orange-100 text-orange-800',
    network: 'bg-red-100 text-red-800'
  };

  const handleDelete = (templateId: string) => {
    if (window.confirm('Are you sure you want to delete this template?')) {
      deleteTemplate(templateId);
    }
  };

  const handleDuplicate = (template: any) => {
    const duplicatedTemplate = {
      ...template,
      id: undefined,
      name: `${template.name} (Copy)`,
      created_at: undefined,
      updated_at: undefined
    };
    onEdit(duplicatedTemplate);
  };

  const handlePreview = (template: any) => {
    toast({
      title: "Template Preview",
      description: `Previewing template: ${template.name}`,
    });
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="grid gap-4">
        {templates?.length === 0 ? (
          <Card>
            <CardContent className="flex flex-col items-center justify-center py-8">
              <Mail className="h-12 w-12 text-muted-foreground/50 mb-4" />
              <h3 className="text-lg font-semibold mb-2">No Templates Yet</h3>
              <p className="text-muted-foreground text-center mb-4">
                Create your first notification template to get started with automated communications.
              </p>
            </CardContent>
          </Card>
        ) : (
          templates?.map((template) => {
            // Safely handle variables as it might be stored as JSON
            const variables = Array.isArray(template.variables) 
              ? template.variables 
              : (typeof template.variables === 'string' 
                  ? JSON.parse(template.variables || '[]') 
                  : []);
            
            return (
              <Card key={template.id} className="hover:shadow-md transition-shadow">
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div>
                        <CardTitle className="text-lg">{template.name}</CardTitle>
                        <CardDescription className="flex items-center gap-2 mt-1">
                          <Badge 
                            variant="secondary" 
                            className={categoryColors[template.category as keyof typeof categoryColors] || 'bg-gray-100 text-gray-800'}
                          >
                            {template.category}
                          </Badge>
                          <span>•</span>
                          <span>{template.trigger_event?.replace(/_/g, ' ') || 'No trigger'}</span>
                        </CardDescription>
                      </div>
                    </div>
                    
                    <div className="flex items-center gap-2">
                      <Badge variant={template.is_active ? "default" : "secondary"}>
                        {template.is_active ? "Active" : "Inactive"}
                      </Badge>
                      
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" size="sm">
                            <MoreHorizontal className="h-4 w-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuItem onClick={() => handlePreview(template)}>
                            <Eye className="h-4 w-4 mr-2" />
                            Preview
                          </DropdownMenuItem>
                          <DropdownMenuItem onClick={() => onEdit(template)}>
                            <Edit className="h-4 w-4 mr-2" />
                            Edit
                          </DropdownMenuItem>
                          <DropdownMenuItem onClick={() => handleDuplicate(template)}>
                            <Copy className="h-4 w-4 mr-2" />
                            Duplicate
                          </DropdownMenuItem>
                          <DropdownMenuItem 
                            onClick={() => handleDelete(template.id)}
                            className="text-red-600"
                            disabled={isDeletingTemplate}
                          >
                            <Trash2 className="h-4 w-4 mr-2" />
                            Delete
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </div>
                  </div>
                </CardHeader>
                
                <CardContent>
                  <div className="space-y-3">
                    <div className="flex items-center gap-4">
                      <div className="flex items-center gap-2">
                        <span className="text-sm font-medium">Channels:</span>
                        {template.channels?.includes('email') && (
                          <Badge variant="outline" className="gap-1">
                            <Mail className="h-3 w-3" />
                            Email
                          </Badge>
                        )}
                        {template.channels?.includes('sms') && (
                          <Badge variant="outline" className="gap-1">
                            <MessageSquare className="h-3 w-3" />
                            SMS
                          </Badge>
                        )}
                      </div>
                    </div>
                    
                    {variables && variables.length > 0 && (
                      <div>
                        <span className="text-sm font-medium">Variables:</span>
                        <div className="flex flex-wrap gap-1 mt-1">
                          {variables.slice(0, 5).map((variable: string) => (
                            <Badge key={variable} variant="outline" className="text-xs">
                              {`{{${variable}}}`}
                            </Badge>
                          ))}
                          {variables.length > 5 && (
                            <Badge variant="outline" className="text-xs">
                              +{variables.length - 5} more
                            </Badge>
                          )}
                        </div>
                      </div>
                    )}
                    
                    <div className="text-xs text-muted-foreground">
                      Created: {new Date(template.created_at).toLocaleDateString()}
                      {template.updated_at !== template.created_at && (
                        <span> • Updated: {new Date(template.updated_at).toLocaleDateString()}</span>
                      )}
                    </div>
                  </div>
                </CardContent>
              </Card>
            );
          })
        )}
      </div>
    </div>
  );
};

export default NotificationTemplatesList;
