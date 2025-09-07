
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Settings } from 'lucide-react';
import { MessageTestingCard } from '@/components/admin/MessageTestingCard';
import { PaymentGatewayTestingCard } from '@/components/admin/PaymentGatewayTestingCard';
import { useAuth } from '@/contexts/AuthContext';

const SystemSettings = () => {
  const { profile } = useAuth();
  const isSuperAdmin = profile?.role === 'super_admin';

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-2">
        <Settings className="h-8 w-8 text-primary" />
        <h1 className="text-3xl font-bold">System Settings</h1>
      </div>
      
      <Card>
        <CardHeader>
          <CardTitle>Global System Configuration</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-muted-foreground">
            Configure global system settings, security policies, and administrative controls.
          </p>
          {/* System settings functionality will be implemented here */}
        </CardContent>
      </Card>

      {isSuperAdmin && (
        <>
          <MessageTestingCard />
          <PaymentGatewayTestingCard />
        </>
      )}
    </div>
  );
};

export default SystemSettings;
