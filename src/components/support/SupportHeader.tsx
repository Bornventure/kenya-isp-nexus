
import React from 'react';
import { Button } from '@/components/ui/button';
import { Phone, Mail } from 'lucide-react';

const SupportHeader: React.FC = () => {
  return (
    <div className="flex items-center justify-between">
      <div>
        <h1 className="text-3xl font-bold">Support Center</h1>
        <p className="text-muted-foreground">
          Manage customer support tickets and inquiries
        </p>
      </div>
      <div className="flex items-center gap-2">
        <Button variant="outline" size="sm">
          <Phone className="h-4 w-4 mr-2" />
          Call Center
        </Button>
        <Button variant="outline" size="sm">
          <Mail className="h-4 w-4 mr-2" />
          Email Support
        </Button>
      </div>
    </div>
  );
};

export default SupportHeader;
