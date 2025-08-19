
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { Radio, Plus, MapPin, Signal } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

interface BaseStation {
  id: string;
  name: string;
  location: string;
  coordinates: string;
  status: string;
  frequency: string;
  power_output: number;
  coverage_radius: number;
  equipment_type: string;
}

const BaseStations: React.FC = () => {
  const [baseStations, setBaseStations] = useState<BaseStation[]>([]);
  const [loading, setLoading] = useState(true);
  const { profile } = useAuth();
  const { toast } = useToast();

  const fetchBaseStations = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('base_stations')
        .select('*')
        .eq('isp_company_id', profile?.isp_companies?.id)
        .order('created_at', { ascending: false });

      if (error) throw error;
      setBaseStations(data || []);
    } catch (error) {
      console.error('Error fetching base stations:', error);
      toast({
        title: "Error",
        description: "Failed to fetch base stations",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (profile?.isp_companies?.id) {
      fetchBaseStations();
    }
  }, [profile]);

  const getStatusBadge = (status: string) => {
    const variants = {
      online: 'default',
      offline: 'destructive',
      maintenance: 'secondary'
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
          <h1 className="text-3xl font-bold">Base Stations</h1>
          <p className="text-muted-foreground">Monitor and manage your network base stations</p>
        </div>
        <Button>
          <Plus className="h-4 w-4 mr-2" />
          Add Base Station
        </Button>
      </div>

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        {baseStations.map((station) => (
          <Card key={station.id}>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">{station.name}</CardTitle>
              <Radio className="h-4 w-4 text-blue-500" />
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="flex justify-between items-center">
                <span className="text-sm text-muted-foreground">Status</span>
                {getStatusBadge(station.status)}
              </div>

              <div className="flex items-center gap-2">
                <MapPin className="h-4 w-4 text-green-500" />
                <span className="text-sm">{station.location}</span>
              </div>

              <div className="flex items-center gap-2">
                <Signal className="h-4 w-4 text-purple-500" />
                <span className="text-sm">Frequency: {station.frequency}</span>
              </div>

              <div className="grid grid-cols-2 gap-2 text-sm">
                <div>
                  <span className="text-muted-foreground">Power:</span>
                  <div className="font-medium">{station.power_output}W</div>
                </div>
                <div>
                  <span className="text-muted-foreground">Coverage:</span>
                  <div className="font-medium">{station.coverage_radius}km</div>
                </div>
              </div>

              <div className="pt-2">
                <span className="text-xs text-muted-foreground">Equipment Type</span>
                <div className="text-sm font-medium">{station.equipment_type}</div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {baseStations.length === 0 && (
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-12">
            <Radio className="h-12 w-12 text-muted-foreground mb-4" />
            <h3 className="text-lg font-semibold mb-2">No Base Stations</h3>
            <p className="text-muted-foreground text-center mb-4">
              Add your first base station to start monitoring your network infrastructure
            </p>
            <Button>
              <Plus className="h-4 w-4 mr-2" />
              Add Base Station
            </Button>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default BaseStations;
