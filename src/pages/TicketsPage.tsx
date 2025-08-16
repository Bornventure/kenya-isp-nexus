
import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Inbox } from 'lucide-react';

const TicketsPage: React.FC = () => {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Support Tickets</h1>
        <p className="text-muted-foreground">
          Manage customer support requests
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <Inbox className="mr-2 h-5 w-5" />
            Ticket Management
          </CardTitle>
          <CardDescription>
            Track and resolve customer support tickets
          </CardDescription>
        </CardHeader>
        <CardContent>
          <p className="text-muted-foreground">
            Ticket management functionality will be implemented here.
          </p>
        </CardContent>
      </Card>
    </div>
  );
};

export default TicketsPage;
