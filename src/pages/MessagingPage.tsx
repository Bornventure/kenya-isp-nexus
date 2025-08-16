
import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Mail } from 'lucide-react';

const MessagingPage: React.FC = () => {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Messaging</h1>
        <p className="text-muted-foreground">
          Send messages and notifications to clients
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <Mail className="mr-2 h-5 w-5" />
            Message Center
          </CardTitle>
          <CardDescription>
            Communicate with clients via SMS and email
          </CardDescription>
        </CardHeader>
        <CardContent>
          <p className="text-muted-foreground">
            Messaging functionality will be implemented here.
          </p>
        </CardContent>
      </Card>
    </div>
  );
};

export default MessagingPage;
