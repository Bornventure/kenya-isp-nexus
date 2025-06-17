
import React, { useState } from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Label } from '@/components/ui/label';
import { useDepartments } from '@/hooks/useDepartments';
import { useUsers } from '@/hooks/useUsers';
import { useTicketAssignmentMutations } from '@/hooks/useTicketAssignments';
import { useAuth } from '@/contexts/AuthContext';

interface TicketAssignmentDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  ticketId: string;
}

const TicketAssignmentDialog: React.FC<TicketAssignmentDialogProps> = ({
  open,
  onOpenChange,
  ticketId,
}) => {
  const { profile } = useAuth();
  const { data: departments = [] } = useDepartments();
  const { users = [] } = useUsers();
  const { assignTicket } = useTicketAssignmentMutations();

  const [selectedDepartment, setSelectedDepartment] = useState('');
  const [selectedUser, setSelectedUser] = useState('');
  const [assignmentReason, setAssignmentReason] = useState('');

  const handleAssign = async () => {
    if (!selectedDepartment && !selectedUser) return;

    await assignTicket.mutateAsync({
      ticket_id: ticketId,
      assigned_from: profile?.id,
      assigned_to: selectedUser || undefined,
      department_id: selectedDepartment || undefined,
      assignment_reason: assignmentReason,
      status: 'active',
      isp_company_id: profile?.isp_company_id,
    });

    onOpenChange(false);
    setSelectedDepartment('');
    setSelectedUser('');
    setAssignmentReason('');
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>Assign Ticket</DialogTitle>
        </DialogHeader>

        <div className="space-y-4">
          <div>
            <Label htmlFor="department">Department</Label>
            <Select value={selectedDepartment} onValueChange={setSelectedDepartment}>
              <SelectTrigger>
                <SelectValue placeholder="Select department" />
              </SelectTrigger>
              <SelectContent>
                {departments.map((dept) => (
                  <SelectItem key={dept.id} value={dept.id}>
                    {dept.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div>
            <Label htmlFor="user">Assign to User (Optional)</Label>
            <Select value={selectedUser} onValueChange={setSelectedUser}>
              <SelectTrigger>
                <SelectValue placeholder="Select user" />
              </SelectTrigger>
              <SelectContent>
                {users.map((user) => (
                  <SelectItem key={user.id} value={user.id}>
                    {user.first_name} {user.last_name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div>
            <Label htmlFor="reason">Assignment Reason</Label>
            <Textarea
              id="reason"
              value={assignmentReason}
              onChange={(e) => setAssignmentReason(e.target.value)}
              placeholder="Explain why you're assigning this ticket..."
              rows={3}
            />
          </div>

          <div className="flex justify-end gap-2">
            <Button variant="outline" onClick={() => onOpenChange(false)}>
              Cancel
            </Button>
            <Button 
              onClick={handleAssign}
              disabled={(!selectedDepartment && !selectedUser) || assignTicket.isPending}
            >
              Assign Ticket
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default TicketAssignmentDialog;
