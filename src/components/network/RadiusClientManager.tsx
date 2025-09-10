import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useRadiusAutomation } from '@/hooks/useRadiusAutomation';
import { useClients } from '@/hooks/useClients';
import { UserPlus, WifiOff, Wifi, RefreshCw, Zap, Eye, EyeOff } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

export const RadiusClientManager = () => {
  const { radiusStatus, statusLoading, generateCredentials, sendWebhook, refetchStatus } = useRadiusAutomation();
  const { clients } = useClients();
  const { toast } = useToast();
  const [showPasswords, setShowPasswords] = useState<Set<string>>(new Set());
  const [bulkAction, setBulkAction] = useState('');
  const [selectedClients, setSelectedClients] = useState<Set<string>>(new Set());

  const togglePasswordVisibility = (clientId: string) => {
    const newShowPasswords = new Set(showPasswords);
    if (newShowPasswords.has(clientId)) {
      newShowPasswords.delete(clientId);
    } else {
      newShowPasswords.add(clientId);
    }
    setShowPasswords(newShowPasswords);
  };

  const handleBulkGenerateCredentials = async () => {
    try {
      await generateCredentials({ bulk_generate: true });
      await refetchStatus();
      toast({
        title: "Bulk Credentials Generated",
        description: "RADIUS credentials generated for all eligible clients",
      });
    } catch (error) {
      toast({
        title: "Bulk Generation Failed",
        description: error instanceof Error ? error.message : 'Unknown error',
        variant: "destructive",
      });
    }
  };

  const handleClientAction = async (clientId: string, action: 'connect' | 'disconnect') => {
    try {
      await sendWebhook({
        client_id: clientId,
        status: action === 'connect' ? 'ensure_connected' : 'disconnect',
        action: action === 'connect' ? 'ensure_connected' : 'disconnect'
      });
      
      await refetchStatus();
      
      toast({
        title: `Client ${action === 'connect' ? 'Connected' : 'Disconnected'}`,
        description: `Client has been ${action === 'connect' ? 'connected to' : 'disconnected from'} the network`,
      });
    } catch (error) {
      toast({
        title: `${action === 'connect' ? 'Connection' : 'Disconnection'} Failed`,
        description: error instanceof Error ? error.message : 'Unknown error',
        variant: "destructive",
      });
    }
  };

  const handleBulkAction = async () => {
    if (!bulkAction || selectedClients.size === 0) {
      toast({
        title: "Invalid Selection",
        description: "Please select an action and at least one client",
        variant: "destructive",
      });
      return;
    }

    try {
      for (const clientId of selectedClients) {
        await sendWebhook({
          client_id: clientId,
          status: bulkAction,
          action: bulkAction
        });
      }
      
      await refetchStatus();
      setSelectedClients(new Set());
      setBulkAction('');
      
      toast({
        title: "Bulk Action Complete",
        description: `${bulkAction} applied to ${selectedClients.size} clients`,
      });
    } catch (error) {
      toast({
        title: "Bulk Action Failed",
        description: error instanceof Error ? error.message : 'Unknown error',
        variant: "destructive",
      });
    }
  };

  const toggleClientSelection = (clientId: string) => {
    const newSelection = new Set(selectedClients);
    if (newSelection.has(clientId)) {
      newSelection.delete(clientId);
    } else {
      newSelection.add(clientId);
    }
    setSelectedClients(newSelection);
  };

  if (statusLoading) {
    return (
      <Card>
        <CardContent className="p-6">
          <div className="flex items-center justify-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
            <span className="ml-2">Loading RADIUS client status...</span>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <div className="flex justify-between items-center">
            <CardTitle className="flex items-center gap-2">
              <Zap className="h-5 w-5" />
              RADIUS Client Management
            </CardTitle>
            <div className="flex gap-2">
              <Button 
                variant="outline" 
                onClick={handleBulkGenerateCredentials}
                className="flex items-center gap-2"
              >
                <UserPlus className="h-4 w-4" />
                Generate All Credentials
              </Button>
              <Button 
                variant="outline" 
                onClick={() => refetchStatus()}
                className="flex items-center gap-2"
              >
                <RefreshCw className="h-4 w-4" />
                Refresh Status
              </Button>
            </div>
          </div>
        </CardHeader>
      </Card>

      {/* Bulk Actions */}
      {selectedClients.size > 0 && (
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-4">
              <span className="text-sm font-medium">
                {selectedClients.size} client(s) selected
              </span>
              <Select value={bulkAction} onValueChange={setBulkAction}>
                <SelectTrigger className="w-48">
                  <SelectValue placeholder="Select action" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="ensure_connected">Connect All</SelectItem>
                  <SelectItem value="disconnect">Disconnect All</SelectItem>
                  <SelectItem value="regenerate_credentials">Regenerate Credentials</SelectItem>
                </SelectContent>
              </Select>
              <Button onClick={handleBulkAction} disabled={!bulkAction}>
                Apply to Selected
              </Button>
              <Button 
                variant="outline" 
                onClick={() => setSelectedClients(new Set())}
              >
                Clear Selection
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Client List */}
      <div className="grid gap-4">
        {radiusStatus?.map((client: any) => (
          <Card key={client.client_id}>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <input
                    type="checkbox"
                    checked={selectedClients.has(client.client_id)}
                    onChange={() => toggleClientSelection(client.client_id)}
                    className="h-4 w-4"
                  />
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <h3 className="font-medium">{client.name}</h3>
                      <Badge variant={
                        client.sync_status === 'synced' ? 'default' :
                        client.sync_status === 'pending' ? 'secondary' : 'destructive'
                      }>
                        {client.sync_status}
                      </Badge>
                      {client.scheduled_for_disconnection && (
                        <Badge variant="destructive">Scheduled Disconnect</Badge>
                      )}
                    </div>
                    
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-2 text-sm text-muted-foreground">
                      <p>📞 {client.phone}</p>
                      <p>📧 {client.email}</p>
                      <p>💰 KES {client.monthly_rate}/month</p>
                      <p>💳 Balance: KES {client.wallet_balance}</p>
                    </div>

                    {client.username && (
                      <div className="mt-2 p-2 bg-gray-50 rounded text-sm">
                        <div className="grid grid-cols-2 gap-4">
                          <div>
                            <span className="font-medium">Username:</span> {client.username}
                          </div>
                          <div className="flex items-center gap-2">
                            <span className="font-medium">Password:</span>
                            <span className="font-mono">
                              {showPasswords.has(client.client_id) ? client.password : '••••••••'}
                            </span>
                            <Button
                              size="sm"
                              variant="ghost"
                              onClick={() => togglePasswordVisibility(client.client_id)}
                            >
                              {showPasswords.has(client.client_id) ? 
                                <EyeOff className="h-3 w-3" /> : <Eye className="h-3 w-3" />
                              }
                            </Button>
                          </div>
                        </div>
                        <div className="grid grid-cols-3 gap-4 mt-2">
                          <div>
                            <span className="font-medium">Download:</span> {client.download_speed_kbps} Kbps
                          </div>
                          <div>
                            <span className="font-medium">Upload:</span> {client.upload_speed_kbps} Kbps
                          </div>
                          <div>
                            <span className="font-medium">Profile:</span> {client.bandwidth_profile}
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  {client.action === 'ensure_connected' ? (
                    <Button
                      size="sm"
                      variant="destructive"
                      onClick={() => handleClientAction(client.client_id, 'disconnect')}
                      className="flex items-center gap-1"
                    >
                      <WifiOff className="h-3 w-3" />
                      Disconnect
                    </Button>
                  ) : (
                    <Button
                      size="sm"
                      variant="default"
                      onClick={() => handleClientAction(client.client_id, 'connect')}
                      className="flex items-center gap-1"
                    >
                      <Wifi className="h-3 w-3" />
                      Connect
                    </Button>
                  )}
                  
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => generateCredentials({ client_id: client.client_id })}
                    className="flex items-center gap-1"
                  >
                    <RefreshCw className="h-3 w-3" />
                    Regenerate
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        )) || []}

        {(!radiusStatus || radiusStatus.length === 0) && (
          <Card>
            <CardContent className="p-8 text-center">
              <UserPlus className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium mb-2">No RADIUS Clients Found</h3>
              <p className="text-gray-500 mb-4">
                Generate RADIUS credentials for your clients to get started.
              </p>
              <Button onClick={handleBulkGenerateCredentials}>
                <UserPlus className="h-4 w-4 mr-2" />
                Generate Credentials for All Clients
              </Button>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
};

export default RadiusClientManager;