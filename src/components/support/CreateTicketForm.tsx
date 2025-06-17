
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Plus } from 'lucide-react';

interface CreateTicketFormProps {
  title: string;
  description: string;
  priority: string;
  ticketType: string;
  onTitleChange: (value: string) => void;
  onDescriptionChange: (value: string) => void;
  onPriorityChange: (value: string) => void;
  onTicketTypeChange: (value: string) => void;
  onSubmit: () => void;
  isSubmitting: boolean;
}

const CreateTicketForm: React.FC<CreateTicketFormProps> = ({
  title,
  description,
  priority,
  ticketType,
  onTitleChange,
  onDescriptionChange,
  onPriorityChange,
  onTicketTypeChange,
  onSubmit,
  isSubmitting
}) => {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Create New Support Ticket</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <Label htmlFor="ticket-type">Ticket Type</Label>
            <Select value={ticketType} onValueChange={onTicketTypeChange}>
              <SelectTrigger>
                <SelectValue placeholder="Select ticket type" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="general">General Inquiry</SelectItem>
                <SelectItem value="technical">Technical Issue</SelectItem>
                <SelectItem value="billing">Billing Question</SelectItem>
                <SelectItem value="installation">Installation Request</SelectItem>
                <SelectItem value="maintenance">Maintenance</SelectItem>
                <SelectItem value="complaint">Complaint</SelectItem>
              </SelectContent>
            </Select>
          </div>
          
          <div>
            <Label htmlFor="priority">Priority</Label>
            <Select value={priority} onValueChange={onPriorityChange}>
              <SelectTrigger>
                <SelectValue placeholder="Select priority" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="low">Low</SelectItem>
                <SelectItem value="medium">Medium</SelectItem>
                <SelectItem value="high">High</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        <div>
          <Label htmlFor="title">Title</Label>
          <Input
            id="title"
            value={title}
            onChange={(e) => onTitleChange(e.target.value)}
            placeholder="Brief description of the issue"
          />
        </div>

        <div>
          <Label htmlFor="description">Description</Label>
          <Textarea
            id="description"
            value={description}
            onChange={(e) => onDescriptionChange(e.target.value)}
            placeholder="Detailed description of the issue or request"
            rows={5}
          />
        </div>

        <Button 
          onClick={onSubmit} 
          disabled={isSubmitting || !title.trim() || !description.trim()}
          className="w-full"
        >
          <Plus className="h-4 w-4 mr-2" />
          {isSubmitting ? 'Creating Ticket...' : 'Create Ticket'}
        </Button>
      </CardContent>
    </Card>
  );
};

export default CreateTicketForm;
