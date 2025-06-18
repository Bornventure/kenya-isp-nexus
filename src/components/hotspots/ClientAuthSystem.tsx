import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Switch } from '@/components/ui/switch';
import { 
  Smartphone, 
  Wifi, 
  Shield, 
  Users, 
  Search,
  Settings,
  CheckCircle,
  XCircle,
  Clock
} from 'lucide-react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/hooks/use-toast';

interface ClientHotspotAccess {
  id: string;
  client_id: string;
  hotspot_id: string;
  mac_address: string;
  device_name?: string;
  device_type?: string;
  auto_connect: boolean;
  bandwidth_allocation: number;
  access_level: 'standard' | 'premium' | 'unlimited';
  first_connected_at: string;
  last_connected_at?: string;
  total_sessions: number;
  total_data_used_mb: number;
  is_blocked: boolean;
  blocked_reason?: string;
  clients?: { name: string; phone: string; status: string };
  hotspots?: { name: string; location: string };
}

interface ClientAuthSystemProps {
  selectedHotspot: string | null;
}

const ClientAuthSystem: React.FC<ClientAuthSystemProps> = ({ selectedHotspot }) => {
  const { profile } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [searchTerm, setSearchTerm] = useState('');

  const { data: clientAccess, isLoading } = useQuery({
    queryKey: ['client-hotspot-access', profile?.isp_company_id, selectedHotspot],
    queryFn: async () => {
      let query = supabase
        .from('client_hotspot_access')
        .select(`
          *,
          clients!inner(name, phone, status),
          hotspots!inner(name, location)
        `)
        .eq('isp_company_id', profile?.isp_company_id)
        .order('last_connected_at', { ascending: false, nullsFirst: false });

      if (selectedHotspot) {
        query = query.eq('hotspot_id', selectedHotspot);
      }

      const { data, error } = await query;
      if (error) throw error;
      return data as ClientHotspotAccess[];
    },
    enabled: !!profile?.isp_company_id,
  });

  const updateAccessMutation = useMutation({
    mutationFn: async ({ id, updates }: { id: string; updates: Partial<ClientHotspotAccess> }) => {
      const { data, error } = await supabase
        .from('client_hotspot_access')
        .update(updates)
        .eq('id', id)
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['client-hotspot-access'] });
      toast({
        title: "Success",
        description: "Client access updated successfully",
      });
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: "Failed to update client access",
        variant: "destructive",
      });
      console.error('Error updating client access:', error);
    },
  });

  const addClientAccessMutation = useMutation({
    mutationFn: async (accessData: {
      client_id: string;
      hotspot_id: string;
      mac_address: string;
      device_name?: string;
      device_type?: string;
    }) => {
      const { data, error } = await supabase
        .from('client_hotspot_access')
        .insert({
          ...accessData,
          isp_company_id: profile?.isp_company_id,
        })
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['client-hotspot-access'] });
      toast({
        title: "Success",
        description: "Client access added successfully",
      });
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: "Failed to add client access",
        variant: "destructive",
      });
      console.error('Error adding client access:', error);
    },
  });

  const filteredAccess = clientAccess?.filter(access =>
    access.clients?.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    access.clients?.phone.includes(searchTerm) ||
    access.mac_address.toLowerCase().includes(searchTerm.toLowerCase()) ||
    access.hotspots?.name.toLowerCase().includes(searchTerm.toLowerCase())
  ) || [];

  const handleToggleAutoConnect = (accessId: string, autoConnect: boolean) => {
    updateAccessMutation.mutate({ id: accessId, updates: { auto_connect: autoConnect } });
  };

  const handleToggleBlocked = (accessId: string, isBlocked: boolean, reason?: string) => {
    updateAccessMutation.mutate({ 
      id: accessId, 
      updates: { 
        is_blocked: isBlocked,
        blocked_reason: isBlocked ? reason || 'Manually blocked' : null
      } 
    });
  };

  const handleBandwidthChange = (accessId: string, bandwidth: number) => {
    updateAccessMutation.mutate({ id: accessId, updates: { bandwidth_allocation: bandwidth } });
  };

  const getAccessLevelColor = (level: string) => {
    switch (level) {
      case 'premium': return 'bg-purple-100 text-purple-800';
      case 'unlimited': return 'bg-green-100 text-green-800';
      default: return 'bg-blue-100 text-blue-800';
    }
  };

  const getClientStatusColor = (status: string) => {
    switch (status) {
      case 'active': return 'bg-green-100 text-green-800';
      case 'suspended': return 'bg-red-100 text-red-800';
      case 'disconnected': return 'bg-gray-100 text-gray-800';
      default: return 'bg-yellow-100 text-yellow-800';
    }
  };

  if (isLoading) {
    return (
      <div className="space-y-4">
        {[...Array(5)].map((_, i) => (
          <Card key={i} className="animate-pulse">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div className="space-y-2">
                  <div className="h-4 bg-gray-200 rounded w-48"></div>
                  <div className="h-3 bg-gray-200 rounded w-32"></div>
                </div>
                <div className="h-8 bg-gray-200 rounded w-20"></div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-lg font-medium">Client Authentication System</h3>
          <p className="text-sm text-muted-foreground">
            Manage automatic client authentication and device access for your hotspots
          </p>
        </div>
      </div>

      {/* Search and Stats */}
      <div className="flex items-center justify-between">
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
          <Input
            placeholder="Search by client name, phone, MAC address, or hotspot..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10"
          />
        </div>
        
        <div className="flex items-center gap-4 text-sm text-muted-foreground">
          <div className="flex items-center gap-1">
            <Users className="h-4 w-4" />
            <span>{filteredAccess.length} client devices</span>
          </div>
          <div className="flex items-center gap-1">
            <Shield className="h-4 w-4" />
            <span>{filteredAccess.filter(a => a.auto_connect).length} auto-connect enabled</span>
          </div>
        </div>
      </div>

      {/* Empty State */}
      {filteredAccess.length === 0 && (
        <div className="text-center py-12">
          <Shield className="h-12 w-12 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">No client access configured</h3>
          <p className="text-gray-500 mb-4">
            {searchTerm 
              ? 'No client access matches your search criteria.' 
              : 'Client devices will appear here once they connect to your hotspots and are authenticated.'
            }
          </p>
        </div>
      )}
    </div>
  );
};

export default ClientAuthSystem;
