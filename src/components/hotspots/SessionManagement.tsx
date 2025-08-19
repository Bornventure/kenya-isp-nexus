
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import ActiveSessions from './ActiveSessions';
import { useHotspotSessions } from '@/hooks/useHotspots';

const SessionManagement = () => {
  const { data: sessions = [], isLoading } = useHotspotSessions();

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Active Sessions</CardTitle>
        </CardHeader>
        <CardContent>
          <ActiveSessions 
            sessions={sessions}
            isLoading={isLoading}
            selectedHotspot={null}
          />
        </CardContent>
      </Card>
    </div>
  );
};

export default SessionManagement;
