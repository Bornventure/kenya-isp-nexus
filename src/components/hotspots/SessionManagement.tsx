
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { 
  Users, 
  Clock, 
  Wifi, 
  StopCircle,
  Search,
  Filter,
  Download
} from 'lucide-react';
import { useHotspotSessions, useHotspotMutations } from '@/hooks/useHotspots';
import { format } from 'date-fns';

const SessionManagement = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const { data: sessions = [], isLoading } = useHotspotSessions();
  const { terminateSession } = useHotspotMutations();

  const filteredSessions = sessions.filter(session => {
    const matchesSearch = session.mac_address.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         session.hotspots.name.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === 'all' || session.session_status === statusFilter;
    
    return matchesSearch && matchesStatus;
  });

  const getStatusBadgeVariant = (status: string) => {
    switch (status) {
      case 'active': return 'default';
      case 'expired': return 'secondary';
      case 'inactive': return 'destructive';
      default: return 'outline';
    }
  };

  const formatDuration = (minutes: number | null) => {
    if (!minutes) return 'N/A';
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;
    return hours > 0 ? `${hours}h ${mins}m` : `${mins}m`;
  };

  const formatDataUsage = (mb: number | null) => {
    if (!mb) return '0 MB';
    if (mb >= 1024) {
      return `${(mb / 1024).toFixed(2)} GB`;
    }
    return `${mb.toFixed(2)} MB`;
  };

  if (isLoading) {
    return (
      <Card>
        <CardContent className="p-6">
          <div className="flex items-center justify-center h-64">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      {/* Session Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Active Sessions</p>
                <p className="text-2xl font-bold">
                  {sessions.filter(s => s.session_status === 'active').length}
                </p>
              </div>
              <Users className="h-8 w-8 text-green-600" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Total Sessions</p>
                <p className="text-2xl font-bold">{sessions.length}</p>
              </div>
              <Wifi className="h-8 w-8 text-blue-600" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Avg Duration</p>
                <p className="text-2xl font-bold">
                  {formatDuration(
                    sessions.reduce((acc, s) => acc + (s.duration_minutes || 0), 0) / sessions.length || 0
                  )}
                </p>
              </div>
              <Clock className="h-8 w-8 text-orange-600" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Total Data</p>
                <p className="text-2xl font-bold">
                  {formatDataUsage(
                    sessions.reduce((acc, s) => acc + (s.data_used_mb || 0), 0)
                  )}
                </p>
              </div>
              <Download className="h-8 w-8 text-purple-600" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Sessions List */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Users className="h-5 w-5" />
            Active Sessions
          </CardTitle>
          <div className="flex items-center gap-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search by MAC address or hotspot..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="w-40">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Status</SelectItem>
                <SelectItem value="active">Active</SelectItem>
                <SelectItem value="inactive">Inactive</SelectItem>
                <SelectItem value="expired">Expired</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b">
                  <th className="text-left p-2">MAC Address</th>
                  <th className="text-left p-2">Hotspot</th>
                  <th className="text-left p-2">Status</th>
                  <th className="text-left p-2">Start Time</th>
                  <th className="text-left p-2">Duration</th>
                  <th className="text-left p-2">Data Used</th>
                  <th className="text-left p-2">Type</th>
                  <th className="text-right p-2">Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredSessions.map((session) => (
                  <tr key={session.id} className="border-b hover:bg-gray-50">
                    <td className="p-2 font-mono text-xs">{session.mac_address}</td>
                    <td className="p-2">{session.hotspots.name}</td>
                    <td className="p-2">
                      <Badge variant={getStatusBadgeVariant(session.session_status)}>
                        {session.session_status}
                      </Badge>
                    </td>
                    <td className="p-2">
                      {format(new Date(session.start_time), 'MMM dd, HH:mm')}
                    </td>
                    <td className="p-2">{formatDuration(session.duration_minutes)}</td>
                    <td className="p-2">{formatDataUsage(session.data_used_mb)}</td>
                    <td className="p-2">
                      <Badge variant="outline" className="capitalize">
                        {session.session_type}
                      </Badge>
                    </td>
                    <td className="text-right p-2">
                      {session.session_status === 'active' && (
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => terminateSession.mutate(session.id)}
                          disabled={terminateSession.isPending}
                        >
                          <StopCircle className="h-4 w-4 mr-1" />
                          Terminate
                        </Button>
                      )}
                    </td>
                  </tr>
                ))}
                {filteredSessions.length === 0 && (
                  <tr>
                    <td colSpan={8} className="text-center p-8 text-muted-foreground">
                      No sessions found
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default SessionManagement;
