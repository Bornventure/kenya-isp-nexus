
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Plus, Loader2 } from 'lucide-react';

interface CreateTicketFormProps {
  title: string;
  description: string;
  priority: string;
  onTitleChange: (value: string) => void;
  onDescriptionChange: (value: string) => void;
  onPriorityChange: (value: string) => void;
  onSubmit: () => void;
  isSubmitting: boolean;
}

const CreateTicketForm: React.FC<CreateTicketFormProps> = ({
  title,
  description,
  priority,
  onTitleChange,
  onDescriptionChange,
  onPriorityChange,
  onSubmit,
  isSubmitting
}) => {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Plus className="h-5 w-5" />
          Create New Support Ticket
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div>
          <label className="text-sm font-medium mb-1 block">Title</label>
          <Input
            placeholder="Brief description of the issue"
            value={title}
            onChange={(e) => onTitleChange(e.target.value)}
          />
        </div>
        
        <div>
          <label className="text-sm font-medium mb-1 block">Priority</label>
          <Select value={priority} onValueChange={onPriorityChange}>
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="low">Low</SelectItem>
              <SelectItem value="medium">Medium</SelectItem>
              <SelectItem value="high">High</SelectItem>
            </SelectContent>
          </Select>
        </div>
        
        <div>
          <label className="text-sm font-medium mb-1 block">Description</label>
          <Textarea
            placeholder="Detailed description of the issue or request"
            value={description}
            onChange={(e) => onDescriptionChange(e.target.value)}
            rows={4}
          />
        </div>
        
        <Button 
          onClick={onSubmit} 
          className="w-full"
          disabled={isSubmitting}
        >
          {isSubmitting ? (
            <>
              <Loader2 className="h-4 w-4 animate-spin mr-2" />
              Creating...
            </>
          ) : (
            'Create Ticket'
          )}
        </Button>
      </CardContent>
    </Card>
  );
};

export default CreateTicketForm;
