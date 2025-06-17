import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { 
  Wifi, 
  MapPin, 
  Settings, 
  Activity,
  Users,
  Signal,
  Edit,
  Trash2,
  Search,
  Plus
} from 'lucide-react';
import { Hotspot, useHotspotMutations } from '@/hooks/useHotspots';
import { useAuth } from '@/contexts/AuthContext';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";

interface HotspotsListProps {
  hotspots: Hotspot[];
  isLoading: boolean;
  onSelectHotspot: (hotspotId: string | null) => void;
  selectedHotspot: string | null;
}

const HotspotsList: React.FC<HotspotsListProps> = ({
  hotspots,
  isLoading,
  onSelectHotspot,
  selectedHotspot
}) => {
  const { profile } = useAuth();
  const { deleteHotspot } = useHotspotMutations();
  const [searchTerm, setSearchTerm] = useState('');

  const isAdmin = profile?.role === 'super_admin' || profile?.role === 'isp_admin';

  const filteredHotspots = hotspots.filter(hotspot =>
    hotspot.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    hotspot.location.toLowerCase().includes(searchTerm.toLowerCase()) ||
    hotspot.ssid.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active': return 'bg-green-100 text-green-800';
      case 'inactive': return 'bg-red-100 text-red-800';
      case 'maintenance': return 'bg-yellow-100 text-yellow-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'active': return <Activity className="h-3 w-3 mr-1" />;
      case 'inactive': return <Signal className="h-3 w-3 mr-1" />;
      case 'maintenance': return <Settings className="h-3 w-3 mr-1" />;
      default: return null;
    }
  };

  if (isLoading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {[...Array(6)].map((_, i) => (
          <Card key={i} className="animate-pulse">
            <CardHeader className="pb-2">
              <div className="h-4 bg-gray-200 rounded w-3/4"></div>
              <div className="h-3 bg-gray-200 rounded w-1/2"></div>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                <div className="h-3 bg-gray-200 rounded"></div>
                <div className="h-3 bg-gray-200 rounded w-4/5"></div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Search */}
      <div className="relative">
        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
        <Input
          placeholder="Search hotspots by name, location, or SSID..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="pl-10"
        />
      </div>

      {/* Hotspots Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {filteredHotspots.map((hotspot) => (
          <Card 
            key={hotspot.id} 
            className={`cursor-pointer transition-all hover:shadow-md ${
              selectedHotspot === hotspot.id ? 'ring-2 ring-blue-500' : ''
            }`}
            onClick={() => onSelectHotspot(hotspot.id === selectedHotspot ? null : hotspot.id)}
          >
            <CardHeader className="pb-2">
              <div className="flex items-start justify-between">
                <div className="flex items-center gap-2">
                  <Wifi className="h-5 w-5 text-blue-600" />
                  <CardTitle className="text-lg">{hotspot.name}</CardTitle>
                </div>
                <Badge className={getStatusColor(hotspot.status)}>
                  {getStatusIcon(hotspot.status)}
                  {hotspot.status}
                </Badge>
              </div>
              <div className="flex items-center gap-1 text-sm text-muted-foreground">
                <MapPin className="h-3 w-3" />
                {hotspot.location}
              </div>
            </CardHeader>
            
            <CardContent className="space-y-3">
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <p className="font-medium">SSID</p>
                  <p className="text-muted-foreground">{hotspot.ssid}</p>
                </div>
                <div>
                  <p className="font-medium">Bandwidth</p>
                  <p className="text-muted-foreground">{hotspot.bandwidth_limit} Mbps</p>
                </div>
                <div>
                  <p className="font-medium">Max Users</p>
                  <p className="text-muted-foreground">{hotspot.max_concurrent_users}</p>
                </div>
                <div>
                  <p className="font-medium">Coverage</p>
                  <p className="text-muted-foreground">{hotspot.coverage_radius}m</p>
                </div>
              </div>

              {hotspot.ip_address && (
                <div className="text-sm">
                  <p className="font-medium">IP Address</p>
                  <p className="text-muted-foreground font-mono">{hotspot.ip_address}</p>
                </div>
              )}

              {isAdmin && (
                <div className="flex gap-2 pt-2 border-t">
                  <Button variant="outline" size="sm" className="flex-1">
                    <Edit className="h-3 w-3 mr-1" />
                    Edit
                  </Button>
                  
                  <AlertDialog>
                    <AlertDialogTrigger asChild>
                      <Button variant="outline" size="sm" className="text-red-600 hover:text-red-700">
                        <Trash2 className="h-3 w-3 mr-1" />
                        Delete
                      </Button>
                    </AlertDialogTrigger>
                    <AlertDialogContent>
                      <AlertDialogHeader>
                        <AlertDialogTitle>Delete Hotspot</AlertDialogTitle>
                        <AlertDialogDescription>
                          Are you sure you want to delete "{hotspot.name}"? This will also delete all associated sessions and data. This action cannot be undone.
                        </AlertDialogDescription>
                      </AlertDialogHeader>
                      <AlertDialogFooter>
                        <AlertDialogCancel>Cancel</AlertDialogCancel>
                        <AlertDialogAction 
                          onClick={() => deleteHotspot.mutate(hotspot.id)}
                          className="bg-red-600 hover:bg-red-700"
                        >
                          Delete Hotspot
                        </AlertDialogAction>
                      </AlertDialogFooter>
                    </AlertDialogContent>
                  </AlertDialog>
                </div>
              )}
            </CardContent>
          </Card>
        ))}
      </div>

      {filteredHotspots.length === 0 && !isLoading && (
        <div className="text-center py-12">
          <Wifi className="h-12 w-12 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">No hotspots found</h3>
          <p className="text-gray-500 mb-4">
            {searchTerm ? 'No hotspots match your search criteria.' : 'Get started by creating your first hotspot.'}
          </p>
          {!searchTerm && isAdmin && (
            <Button>
              <Plus className="h-4 w-4 mr-2" />
              Add Hotspot
            </Button>
          )}
        </div>
      )}
    </div>
  );
};

export default HotspotsList;
