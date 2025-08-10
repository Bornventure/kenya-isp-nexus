
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { 
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { 
  Shield, 
  Plus, 
  Search, 
  TestTube, 
  Trash2, 
  Router,
  CheckCircle,
  XCircle,
  Settings
} from 'lucide-react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/hooks/use-toast';
import NASRegistrationDialog from './NASRegistrationDialog';

interface NASClient {
  id: string;
  nas_name: string;
  nas_ip: string;
  nas_type: string;
  description: string;
  is_active: boolean;
  last_seen: string | null;
  created_at: string;
}

const NASManagementPanel = () => {
  const [showAddDialog, setShowAddDialog] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const { profile } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();

  // Fetch NAS clients
  const { data: nasClients = [], isLoading } = useQuery({
    queryKey: ['nas-clients', profile?.isp_company_id],
    queryFn: async () => {
      if (!profile?.isp_company_id) return [];

      const { data, error } = await supabase
        .from('radius_nas_clients' as any)
        .select('*')
        .eq('isp_company_id', profile.isp_company_id)
        .order('created_at', { ascending: false });

      if (error) throw error;
      return data as NASClient[];
    },
    enabled: !!profile?.isp_company_id,
  });

  // Test NAS connection
  const testNASConnection = useMutation({
    mutationFn: async (nasId: string) => {
      // Simulate NAS connection test
      console.log('Testing NAS connection:', nasId);
      await new Promise(resolve => setTimeout(resolve, 2000));
      return Math.random() > 0.3; // 70% success rate
    },
    onSuccess: (success, nasId) => {
      const nasClient = nasClients.find(n => n.id === nasId);
      toast({
        title: success ? "Connection Successful" : "Connection Failed",
        description: success 
          ? `Successfully connected to ${nasClient?.nas_name}`
          : `Failed to connect to ${nasClient?.nas_name}. Check configuration.`,
        variant: success ? "default" : "destructive",
      });
    },
  });

  // Delete NAS client
  const deleteNAS = useMutation({
    mutationFn: async (nasId: string) => {
      const { error } = await supabase
        .from('radius_nas_clients' as any)
        .delete()
        .eq('id', nasId);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['nas-clients'] });
      toast({
        title: "NAS Deleted",
        description: "RADIUS NAS client has been removed.",
      });
    },
    onError: (error: any) => {
      toast({
        title: "Delete Failed",
        description: "Failed to delete NAS client.",
        variant: "destructive",
      });
    },
  });

  const filteredNASClients = nasClients.filter(nas =>
    nas.nas_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    nas.nas_ip.includes(searchTerm) ||
    nas.nas_type.toLowerCase().includes(searchTerm.toLowerCase())
  );

  if (isLoading) {
    return (
      <Card>
        <CardContent className="p-6">
          <div className="text-center">Loading NAS clients...</div>
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
              <Shield className="h-5 w-5" />
              RADIUS NAS Clients
            </CardTitle>
            <Button onClick={() => setShowAddDialog(true)}>
              <Plus className="h-4 w-4 mr-2" />
              Add from Inventory
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="flex items-center gap-4">
              <div className="relative flex-1 max-w-sm">
                <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search NAS clients..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
              <div className="text-sm text-muted-foreground">
                Total: {nasClients.length} | Active: {nasClients.filter(n => n.is_active).length}
              </div>
            </div>

            {filteredNASClients.length === 0 ? (
              <div className="text-center py-8">
                <Router className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                <h3 className="text-lg font-medium mb-2">No NAS Clients Registered</h3>
                <p className="text-gray-500 mb-4">
                  Register MikroTik routers from your inventory as RADIUS clients to get started.
                </p>
                <Button onClick={() => setShowAddDialog(true)}>
                  <Plus className="h-4 w-4 mr-2" />
                  Add NAS Client
                </Button>
              </div>
            ) : (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>NAS Name</TableHead>
                    <TableHead>IP Address</TableHead>
                    <TableHead>Type</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Last Seen</TableHead>
                    <TableHead>Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredNASClients.map((nas) => (
                    <TableRow key={nas.id}>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <Router className="h-4 w-4 text-blue-500" />
                          <div>
                            <div className="font-medium">{nas.nas_name}</div>
                            {nas.description && (
                              <div className="text-xs text-muted-foreground">
                                {nas.description}
                              </div>
                            )}
                          </div>
                        </div>
                      </TableCell>
                      <TableCell className="font-mono text-sm">
                        {nas.nas_ip}
                      </TableCell>
                      <TableCell>
                        <Badge variant="outline" className="capitalize">
                          {nas.nas_type}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          {nas.is_active ? (
                            <CheckCircle className="h-4 w-4 text-green-500" />
                          ) : (
                            <XCircle className="h-4 w-4 text-red-500" />
                          )}
                          <Badge variant={nas.is_active ? "default" : "secondary"}>
                            {nas.is_active ? "Active" : "Inactive"}
                          </Badge>
                        </div>
                      </TableCell>
                      <TableCell className="text-sm text-muted-foreground">
                        {nas.last_seen 
                          ? new Date(nas.last_seen).toLocaleString()
                          : 'Never'
                        }
                      </TableCell>
                      <TableCell>
                        <div className="flex gap-2">
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => testNASConnection.mutate(nas.id)}
                            disabled={testNASConnection.isPending}
                          >
                            <TestTube className="h-4 w-4 mr-1" />
                            Test
                          </Button>
                          <Button
                            size="sm"
                            variant="destructive"
                            onClick={() => deleteNAS.mutate(nas.id)}
                            disabled={deleteNAS.isPending}
                          >
                            <Trash2 className="h-4 w-4 mr-1" />
                            Delete
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            )}
          </div>
        </CardContent>
      </Card>

      <NASRegistrationDialog
        open={showAddDialog}
        onOpenChange={setShowAddDialog}
      />
    </div>
  );
};

export default NASManagementPanel;
