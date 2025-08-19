
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { Wifi, Plus, Zap, Clock } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

interface ServicePackage {
  id: string;
  name: string;
  speed: string;
  monthly_rate: number;
  setup_fee: number;
  data_limit: string;
  description: string;
  is_active: boolean;
}

const ServicePackages: React.FC = () => {
  const [packages, setPackages] = useState<ServicePackage[]>([]);
  const [loading, setLoading] = useState(true);
  const { profile } = useAuth();
  const { toast } = useToast();

  const fetchPackages = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('service_packages')
        .select('*')
        .eq('isp_company_id', profile?.isp_companies?.id)
        .order('monthly_rate', { ascending: true });

      if (error) throw error;
      setPackages(data || []);
    } catch (error) {
      console.error('Error fetching service packages:', error);
      toast({
        title: "Error",
        description: "Failed to fetch service packages",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (profile?.isp_companies?.id) {
      fetchPackages();
    }
  }, [profile]);

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
          <h1 className="text-3xl font-bold">Service Packages</h1>
          <p className="text-muted-foreground">Manage your internet service packages and pricing</p>
        </div>
        <Button>
          <Plus className="h-4 w-4 mr-2" />
          Add Package
        </Button>
      </div>

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        {packages.map((pkg) => (
          <Card key={pkg.id} className={`relative ${!pkg.is_active ? 'opacity-60' : ''}`}>
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle className="flex items-center gap-2">
                  <Wifi className="h-5 w-5 text-blue-500" />
                  {pkg.name}
                </CardTitle>
                <Badge variant={pkg.is_active ? 'default' : 'secondary'}>
                  {pkg.is_active ? 'Active' : 'Inactive'}
                </Badge>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="text-center">
                <div className="text-3xl font-bold text-primary">
                  KES {pkg.monthly_rate.toLocaleString()}
                </div>
                <div className="text-sm text-muted-foreground">per month</div>
              </div>

              <div className="space-y-3">
                <div className="flex items-center gap-2">
                  <Zap className="h-4 w-4 text-green-500" />
                  <span className="text-sm">Speed: {pkg.speed}</span>
                </div>
                
                <div className="flex items-center gap-2">
                  <Clock className="h-4 w-4 text-blue-500" />
                  <span className="text-sm">Data: {pkg.data_limit}</span>
                </div>
                
                {pkg.setup_fee > 0 && (
                  <div className="text-sm text-muted-foreground">
                    Setup Fee: KES {pkg.setup_fee.toLocaleString()}
                  </div>
                )}
              </div>

              <p className="text-sm text-muted-foreground">{pkg.description}</p>

              <div className="flex gap-2 pt-2">
                <Button variant="outline" size="sm" className="flex-1">
                  Edit
                </Button>
                <Button 
                  variant={pkg.is_active ? "destructive" : "default"} 
                  size="sm" 
                  className="flex-1"
                >
                  {pkg.is_active ? 'Deactivate' : 'Activate'}
                </Button>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {packages.length === 0 && (
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-12">
            <Wifi className="h-12 w-12 text-muted-foreground mb-4" />
            <h3 className="text-lg font-semibold mb-2">No Service Packages</h3>
            <p className="text-muted-foreground text-center mb-4">
              Create your first service package to start offering internet services
            </p>
            <Button>
              <Plus className="h-4 w-4 mr-2" />
              Add Package
            </Button>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default ServicePackages;
