
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { HardDrive, Plus, Router, Wifi, Monitor } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

interface Equipment {
  id: string;
  name: string;
  type: string;
  model: string;
  serial_number: string;
  status: string;
  location: string;
  mac_address?: string;
}

const Equipment: React.FC = () => {
  const [equipment, setEquipment] = useState<Equipment[]>([]);
  const [loading, setLoading] = useState(true);
  const { profile } = useAuth();
  const { toast } = useToast();

  const fetchEquipment = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('equipment')
        .select('*')
        .eq('isp_company_id', profile?.isp_companies?.id)
        .order('created_at', { ascending: false });

      if (error) throw error;
      setEquipment(data || []);
    } catch (error) {
      console.error('Error fetching equipment:', error);
      toast({
        title: "Error",
        description: "Failed to fetch equipment",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (profile?.isp_companies?.id) {
      fetchEquipment();
    }
  }, [profile]);

  const getEquipmentIcon = (type: string) => {
    switch (type.toLowerCase()) {
      case 'router':
        return <Router className="h-8 w-8 text-blue-500" />;
      case 'access_point':
        return <Wifi className="h-8 w-8 text-green-500" />;
      case 'switch':
        return <HardDrive className="h-8 w-8 text-purple-500" />;
      default:
        return <Monitor className="h-8 w-8 text-gray-500" />;
    }
  };

  const getStatusBadge = (status: string) => {
    const variants = {
      active: 'default',
      inactive: 'secondary',
      maintenance: 'destructive',
      deployed: 'default'
    } as const;

    return (
      <Badge variant={variants[status as keyof typeof variants] || 'outline'}>
        {status.charAt(0).toUpperCase() + status.slice(1)}
      </Badge>
    );
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-48">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Equipment</h1>
          <p className="text-muted-foreground">Manage your network equipment and devices</p>
        </div>
        <Button>
          <Plus className="h-4 w-4 mr-2" />
          Add Equipment
        </Button>
      </div>

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        {equipment.map((item) => (
          <Card key={item.id}>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">{item.name}</CardTitle>
              {getEquipmentIcon(item.type)}
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                <div className="flex justify-between items-center">
                  <span className="text-sm text-muted-foreground">Status</span>
                  {getStatusBadge(item.status)}
                </div>
                <div className="flex justify-between">
                  <span className="text-sm text-muted-foreground">Model</span>
                  <span className="text-sm font-medium">{item.model}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm text-muted-foreground">Serial</span>
                  <span className="text-sm font-mono">{item.serial_number}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm text-muted-foreground">Location</span>
                  <span className="text-sm">{item.location}</span>
                </div>
                {item.mac_address && (
                  <div className="flex justify-between">
                    <span className="text-sm text-muted-foreground">MAC</span>
                    <span className="text-sm font-mono">{item.mac_address}</span>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {equipment.length === 0 && (
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-12">
            <HardDrive className="h-12 w-12 text-muted-foreground mb-4" />
            <h3 className="text-lg font-semibold mb-2">No Equipment Found</h3>
            <p className="text-muted-foreground text-center mb-4">
              Add your first piece of equipment to get started
            </p>
            <Button>
              <Plus className="h-4 w-4 mr-2" />
              Add Equipment
            </Button>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default Equipment;
