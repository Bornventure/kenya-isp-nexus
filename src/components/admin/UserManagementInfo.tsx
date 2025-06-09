
import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Info } from 'lucide-react';

const UserManagementInfo: React.FC = () => {
  return (
    <Card className="border-blue-200 bg-blue-50">
      <CardContent className="p-4">
        <div className="flex items-start gap-2">
          <Info className="h-5 w-5 text-blue-600 mt-0.5 flex-shrink-0" />
          <div className="text-blue-800 text-sm">
            <p className="font-medium mb-1">User Management Status</p>
            <p>Currently showing user profiles. Full authentication integration is in progress. Email addresses are temporarily unavailable in this view.</p>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default UserManagementInfo;
