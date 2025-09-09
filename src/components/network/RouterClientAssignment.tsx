import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { 
  Router, 
  Users, 
  ArrowRight, 
  Settings,
  CheckCircle2,
  AlertTriangle,
  UserPlus
} from 'lucide-react';

interface RouterClientAssignmentProps {
  clients: Array<{
    id: string;
    name: string;
    email: string;
    status: string;
    radius_status: string;
    router_assignment?: string;
  }>;
  routers: Array<{
    id: string;
    name: string;
    ip_address: string;
    connection_status: string;
    client_network: string;
  }>;
  onAssignmentChange: () => void;
}

export const RouterClientAssignment: React.FC<RouterClientAssignmentProps> = ({
  clients,
  routers,
  onAssignmentChange
}) => {
  const [selectedClient, setSelectedClient] = useState<string>('');
  const [selectedRouter, setSelectedRouter] = useState<string>('');
  const [isAssigning, setIsAssigning] = useState(false);
  const [showBulkDialog, setShowBulkDialog] = useState(false);
  const { toast } = useToast();

  const connectedRouters = routers.filter(r => r.connection_status === 'connected');
  const unassignedClients = clients.filter(c => !c.router_assignment && c.status === 'active');

  const handleSingleAssignment = async () => {
    if (!selectedClient || !selectedRouter) {
      toast({
        title: "Selection Required",
        description: "Please select both a client and a router.",
        variant: "destructive",
      });
      return;
    }

    setIsAssigning(true);
    try {
      // Update client with router assignment
      const { error: updateError } = await supabase
        .from('clients')
        .update({ 
          router_assignment: selectedRouter,
          radius_sync_status: 'pending',
          last_radius_sync_at: new Date().toISOString()
        })
        .eq('id', selectedClient);

      if (updateError) throw updateError;

      // Trigger RADIUS credential generation for the client
      const { error: radiusError } = await supabase.functions.invoke('generate-radius-credentials', {
        body: { client_id: selectedClient }
      });

      if (radiusError) {
        console.warn('RADIUS generation warning:', radiusError);
      }

      toast({
        title: "Assignment Successful",
        description: "Client has been assigned to router and RADIUS credentials generated.",
      });

      setSelectedClient('');
      setSelectedRouter('');
      onAssignmentChange();

    } catch (error) {
      console.error('Assignment error:', error);
      toast({
        title: "Assignment Failed",
        description: error instanceof Error ? error.message : 'Unknown error occurred',
        variant: "destructive",
      });
    } finally {
      setIsAssigning(false);
    }
  };

  const handleBulkAssignment = async () => {
    if (unassignedClients.length === 0 || connectedRouters.length === 0) {
      toast({
        title: "No Assignments Available",
        description: "Either no unassigned clients or no connected routers.",
        variant: "destructive",
      });
      return;
    }

    setIsAssigning(true);
    try {
      // Distribute clients evenly across connected routers
      const assignments = unassignedClients.map((client, index) => {
        const routerIndex = index % connectedRouters.length;
        return {
          client_id: client.id,
          router_id: connectedRouters[routerIndex].id
        };
      });

      // Update all clients
      for (const assignment of assignments) {
        await supabase
          .from('clients')
          .update({ 
            router_assignment: assignment.router_id,
            radius_sync_status: 'pending',
            last_radius_sync_at: new Date().toISOString()
          })
          .eq('id', assignment.client_id);
      }

      // Generate RADIUS credentials in bulk
      const { error: bulkRadiusError } = await supabase.functions.invoke('generate-radius-credentials', {
        body: { bulk_generate: true }
      });

      if (bulkRadiusError) {
        console.warn('Bulk RADIUS generation warning:', bulkRadiusError);
      }

      toast({
        title: "Bulk Assignment Complete",
        description: `${assignments.length} clients assigned across ${connectedRouters.length} routers.`,
      });

      setShowBulkDialog(false);
      onAssignmentChange();

    } catch (error) {
      console.error('Bulk assignment error:', error);
      toast({
        title: "Bulk Assignment Failed",
        description: error instanceof Error ? error.message : 'Unknown error occurred',
        variant: "destructive",
      });
    } finally {
      setIsAssigning(false);
    }
  };

  const getRouterAssignments = (routerId: string) => {
    return clients.filter(c => c.router_assignment === routerId);
  };

  return (
    <div className="space-y-6">
      {/* Assignment Controls */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Settings className="h-5 w-5" />
            Client-Router Assignment
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Single Assignment */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 items-end">
            <div>
              <label className="text-sm font-medium mb-2 block">Select Client</label>
              <Select value={selectedClient} onValueChange={setSelectedClient}>
                <SelectTrigger>
                  <SelectValue placeholder="Choose client..." />
                </SelectTrigger>
                <SelectContent>
                  {unassignedClients.map(client => (
                    <SelectItem key={client.id} value={client.id}>
                      {client.name} ({client.email})
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div>
              <label className="text-sm font-medium mb-2 block">Select Router</label>
              <Select value={selectedRouter} onValueChange={setSelectedRouter}>
                <SelectTrigger>
                  <SelectValue placeholder="Choose router..." />
                </SelectTrigger>
                <SelectContent>
                  {connectedRouters.map(router => (
                    <SelectItem key={router.id} value={router.id}>
                      {router.name} ({router.ip_address})
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <Button 
              onClick={handleSingleAssignment}
              disabled={!selectedClient || !selectedRouter || isAssigning}
              className="flex items-center gap-2"
            >
              <UserPlus className="h-4 w-4" />
              Assign Client
            </Button>

            <Dialog open={showBulkDialog} onOpenChange={setShowBulkDialog}>
              <DialogTrigger asChild>
                <Button variant="outline" className="flex items-center gap-2">
                  <Users className="h-4 w-4" />
                  Bulk Assign
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Bulk Client Assignment</DialogTitle>
                </DialogHeader>
                <div className="space-y-4">
                  <p className="text-sm text-muted-foreground">
                    This will automatically assign all unassigned active clients to available routers, 
                    distributing them evenly across connected routers.
                  </p>
                  <div className="bg-muted p-4 rounded-lg">
                    <p><strong>Unassigned Clients:</strong> {unassignedClients.length}</p>
                    <p><strong>Connected Routers:</strong> {connectedRouters.length}</p>
                    <p><strong>Average per Router:</strong> {connectedRouters.length > 0 ? Math.ceil(unassignedClients.length / connectedRouters.length) : 0}</p>
                  </div>
                  <div className="flex justify-end gap-2">
                    <Button variant="outline" onClick={() => setShowBulkDialog(false)}>
                      Cancel
                    </Button>
                    <Button onClick={handleBulkAssignment} disabled={isAssigning}>
                      Proceed with Bulk Assignment
                    </Button>
                  </div>
                </div>
              </DialogContent>
            </Dialog>
          </div>
        </CardContent>
      </Card>

      {/* Router Assignment Overview */}
      <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-4">
        {routers.map(router => {
          const assignedClients = getRouterAssignments(router.id);
          const isConnected = router.connection_status === 'connected';
          
          return (
            <Card key={router.id} className={!isConnected ? 'opacity-50' : ''}>
              <CardHeader className="pb-3">
                <CardTitle className="text-lg flex items-center gap-2">
                  <Router className="h-4 w-4" />
                  {router.name}
                  <Badge variant={isConnected ? 'default' : 'destructive'}>
                    {router.connection_status}
                  </Badge>
                </CardTitle>
                <p className="text-sm text-muted-foreground">
                  {router.ip_address} • {router.client_network}
                </p>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium">Assigned Clients</span>
                    <Badge variant="outline">{assignedClients.length}</Badge>
                  </div>
                  
                  {assignedClients.length > 0 ? (
                    <div className="space-y-2 max-h-32 overflow-y-auto">
                      {assignedClients.map(client => (
                        <div key={client.id} className="flex items-center justify-between p-2 bg-muted rounded">
                          <span className="text-sm font-medium">{client.name}</span>
                          <div className="flex items-center gap-2">
                            <Badge variant={client.status === 'active' ? 'default' : 'secondary'}>
                              {client.status}
                            </Badge>
                            {client.radius_status === 'synced' ? (
                              <CheckCircle2 className="h-3 w-3 text-green-600" />
                            ) : (
                              <AlertTriangle className="h-3 w-3 text-amber-600" />
                            )}
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <p className="text-sm text-muted-foreground text-center py-4">
                      No clients assigned
                    </p>
                  )}
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>
    </div>
  );
};