
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Building2 } from 'lucide-react';

const CompanyManagement = () => {
  return (
    <div className="space-y-6">
      <div className="flex items-center gap-2">
        <Building2 className="h-8 w-8 text-primary" />
        <h1 className="text-3xl font-bold">Company Management</h1>
      </div>
      
      <Card>
        <CardHeader>
          <CardTitle>ISP Companies</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-muted-foreground">
            Manage ISP companies, their licenses, and configurations.
          </p>
          {/* Company management functionality will be implemented here */}
        </CardContent>
      </Card>
    </div>
  );
};

export default CompanyManagement;
