
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { 
  Users, 
  Search, 
  Wifi, 
  Clock, 
  HardDrive,
  X,
  User,
  Smartphone
} from 'lucide-react';
import { HotspotSession, useHotspotMutations } from '@/hooks/useHotspots';
import { formatDistanceToNow } from 'date-fns';
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

interface ActiveSessionsProps {
  sessions: HotspotSession[];
  isLoading: boolean;
  selectedHotspot: string | null;
}

const ActiveSessions: React.FC<ActiveSessionsProps> = ({
  sessions,
  isLoading,
  selectedHotspot
}) => {
  const { terminateSession } = useHotspotMutations();
  const [searchTerm, setSearchTerm] = useState('');

  const filteredSessions = sessions.filter(session => {
    const matchesSearch = 
      session.mac_address.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (session.clients?.name || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
      session.session_type.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesHotspot = !selectedHotspot || session.hotspot_id === selectedHotspot;
    
    return matchesSearch && matchesHotspot && session.session_status === 'active';
  });

  const getSessionTypeIcon = (sessionType: string) => {
    switch (sessionType) {
      case 'client': return <User className="h-4 w-4" />;
      case 'guest': return <Smartphone className="h-4 w-4" />;
      case 'voucher': return <Wifi className="h-4 w-4" />;
      default: return <Users className="h-4 w-4" />;
    }
  };

  const getSessionTypeColor = (sessionType: string) => {
    switch (sessionType) {
      case 'client': return 'bg-blue-100 text-blue-800';
      case 'guest': return 'bg-green-100 text-green-800';
      case 'voucher': return 'bg-purple-100 text-purple-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  if (isLoading) {
    return (
      <div className="grid grid-cols-1 gap-4">
        {[...Array(5)].map((_, i) => (
          <Card key={i} className="animate-pulse">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div className="space-y-2">
                  <div className="h-4 bg-gray-200 rounded w-32"></div>
                  <div className="h-3 bg-gray-200 rounded w-24"></div>
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
    <div className="space-y-4">
      {/* Search and Filters */}
      <div className="flex items-center gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
          <Input
            placeholder="Search by MAC address, client name, or session type..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10"
          />
        </div>
        <div className="flex items-center gap-2">
          <Users className="h-4 w-4 text-muted-foreground" />
          <span className="text-sm text-muted-foreground">
            {filteredSessions.length} active sessions
          </span>
        </div>
      </div>

      {/* Sessions List */}
      <div className="grid grid-cols-1 gap-4">
        {filteredSessions.map((session) => (
          <Card key={session.id}>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <div className="flex items-center gap-2">
                    {getSessionTypeIcon(session.session_type)}
                    <Badge className={getSessionTypeColor(session.session_type)}>
                      {session.session_type}
                    </Badge>
                  </div>
                  
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <span className="font-medium">
                        {session.clients?.name || 'Guest User'}
                      </span>
                      {session.clients?.phone && (
                        <span className="text-sm text-muted-foreground">
                          ({session.clients.phone})
                        </span>
                      )}
                    </div>
                    <div className="flex items-center gap-4 text-sm text-muted-foreground">
                      <span>MAC: {session.mac_address}</span>
                      <span>IP: {session.ip_address || 'N/A'}</span>
                      {session.hotspots && (
                        <span>@ {session.hotspots.name}</span>
                      )}
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-4">
                  <div className="text-right space-y-1">
                    <div className="flex items-center gap-1 text-sm">
                      <Clock className="h-3 w-3" />
                      <span>
                        {formatDistanceToNow(new Date(session.start_time), { addSuffix: true })}
                      </span>
                    </div>
                    <div className="flex items-center gap-1 text-sm text-muted-foreground">
                      <HardDrive className="h-3 w-3" />
                      <span>{session.data_used_mb} MB</span>
                    </div>
                  </div>

                  <AlertDialog>
                    <AlertDialogTrigger asChild>
                      <Button variant="outline" size="sm" className="text-red-600 hover:text-red-700">
                        <X className="h-3 w-3 mr-1" />
                        Terminate
                      </Button>
                    </AlertDialogTrigger>
                    <AlertDialogContent>
                      <AlertDialogHeader>
                        <AlertDialogTitle>Terminate Session</AlertDialogTitle>
                        <AlertDialogDescription>
                          Are you sure you want to terminate this session? The user will be disconnected immediately and will need to reconnect.
                        </AlertDialogDescription>
                      </AlertDialogHeader>
                      <AlertDialogFooter>
                        <AlertDialogCancel>Cancel</AlertDialogCancel>
                        <AlertDialogAction 
                          onClick={() => terminateSession.mutate(session.id)}
                          className="bg-red-600 hover:bg-red-700"
                        >
                          Terminate Session
                        </AlertDialogAction>
                      </AlertDialogFooter>
                    </AlertDialogContent>
                  </AlertDialog>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {filteredSessions.length === 0 && !isLoading && (
        <div className="text-center py-12">
          <Users className="h-12 w-12 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">No active sessions</h3>
          <p className="text-gray-500">
            {searchTerm ? 'No sessions match your search criteria.' : 'No users are currently connected to your hotspots.'}
          </p>
        </div>
      )}
    </div>
  );
};

export default ActiveSessions;
