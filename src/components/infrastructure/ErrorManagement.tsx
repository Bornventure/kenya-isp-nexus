
import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { AlertTriangle, Bug, Search, Download, RefreshCw } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

interface ErrorLog {
  id: string;
  timestamp: string;
  level: 'error' | 'warning' | 'info';
  message: string;
  source: string;
  user_id?: string;
  stack_trace?: string;
  resolved: boolean;
}

const ErrorManagement = () => {
  const { toast } = useToast();
  const [searchTerm, setSearchTerm] = useState('');
  const [levelFilter, setLevelFilter] = useState<string>('all');
  const [statusFilter, setStatusFilter] = useState<string>('all');

  const [errorLogs] = useState<ErrorLog[]>([
    {
      id: '1',
      timestamp: '2024-01-15T10:30:00Z',
      level: 'error',
      message: 'Database connection timeout',
      source: 'database',
      stack_trace: 'Error: Connection timeout at line 45...',
      resolved: false
    },
    {
      id: '2',
      timestamp: '2024-01-15T09:15:00Z',
      level: 'warning',
      message: 'High memory usage detected',
      source: 'system',
      user_id: 'user123',
      resolved: true
    },
    {
      id: '3',
      timestamp: '2024-01-15T08:45:00Z',
      level: 'error',
      message: 'Failed to send notification email',
      source: 'notification',
      user_id: 'user456',
      resolved: false
    },
  ]);

  const filteredLogs = errorLogs.filter(log => {
    const matchesSearch = log.message.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         log.source.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesLevel = levelFilter === 'all' || log.level === levelFilter;
    const matchesStatus = statusFilter === 'all' || 
                         (statusFilter === 'resolved' && log.resolved) ||
                         (statusFilter === 'unresolved' && !log.resolved);
    
    return matchesSearch && matchesLevel && matchesStatus;
  });

  const handleMarkResolved = (id: string) => {
    toast({
      title: "Error Marked as Resolved",
      description: "The error has been marked as resolved",
    });
  };

  const handleDownloadLogs = () => {
    toast({
      title: "Downloading Logs",
      description: "Error logs are being prepared for download",
    });
  };

  const getLevelColor = (level: string) => {
    switch (level) {
      case 'error': return 'bg-red-100 text-red-800';
      case 'warning': return 'bg-yellow-100 text-yellow-800';
      case 'info': return 'bg-blue-100 text-blue-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getLevelIcon = (level: string) => {
    switch (level) {
      case 'error': return <AlertTriangle className="h-3 w-3" />;
      case 'warning': return <AlertTriangle className="h-3 w-3" />;
      case 'info': return <Bug className="h-3 w-3" />;
      default: return <Bug className="h-3 w-3" />;
    }
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="flex items-center gap-2">
                <Bug className="h-5 w-5" />
                Error Management & Logging
              </CardTitle>
              <CardDescription>
                Monitor, track, and resolve system errors and warnings
              </CardDescription>
            </div>
            <div className="flex gap-2">
              <Button variant="outline" onClick={handleDownloadLogs}>
                <Download className="h-4 w-4 mr-2" />
                Export Logs
              </Button>
              <Button variant="outline">
                <RefreshCw className="h-4 w-4 mr-2" />
                Refresh
              </Button>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <Tabs defaultValue="logs" className="space-y-4">
            <TabsList>
              <TabsTrigger value="logs">Error Logs</TabsTrigger>
              <TabsTrigger value="analytics">Analytics</TabsTrigger>
              <TabsTrigger value="settings">Settings</TabsTrigger>
            </TabsList>

            <TabsContent value="logs" className="space-y-4">
              {/* Filters */}
              <div className="flex gap-4 items-center">
                <div className="flex-1">
                  <div className="relative">
                    <Search className="h-4 w-4 absolute left-3 top-3 text-muted-foreground" />
                    <Input
                      placeholder="Search error logs..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="pl-10"
                    />
                  </div>
                </div>
                <Select value={levelFilter} onValueChange={setLevelFilter}>
                  <SelectTrigger className="w-40">
                    <SelectValue placeholder="All Levels" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Levels</SelectItem>
                    <SelectItem value="error">Error</SelectItem>
                    <SelectItem value="warning">Warning</SelectItem>
                    <SelectItem value="info">Info</SelectItem>
                  </SelectContent>
                </Select>
                <Select value={statusFilter} onValueChange={setStatusFilter}>
                  <SelectTrigger className="w-40">
                    <SelectValue placeholder="All Status" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Status</SelectItem>
                    <SelectItem value="resolved">Resolved</SelectItem>
                    <SelectItem value="unresolved">Unresolved</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {/* Error Logs Table */}
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Timestamp</TableHead>
                    <TableHead>Level</TableHead>
                    <TableHead>Message</TableHead>
                    <TableHead>Source</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredLogs.map((log) => (
                    <TableRow key={log.id}>
                      <TableCell className="text-sm">
                        {new Date(log.timestamp).toLocaleString()}
                      </TableCell>
                      <TableCell>
                        <Badge className={getLevelColor(log.level)}>
                          {getLevelIcon(log.level)}
                          <span className="ml-1">{log.level}</span>
                        </Badge>
                      </TableCell>
                      <TableCell className="max-w-xs truncate">{log.message}</TableCell>
                      <TableCell>
                        <Badge variant="outline">{log.source}</Badge>
                      </TableCell>
                      <TableCell>
                        <Badge variant={log.resolved ? "default" : "destructive"}>
                          {log.resolved ? 'Resolved' : 'Unresolved'}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        {!log.resolved && (
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => handleMarkResolved(log.id)}
                          >
                            Mark Resolved
                          </Button>
                        )}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TabsContent>

            <TabsContent value="analytics">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <Card>
                  <CardContent className="p-6">
                    <div className="text-2xl font-bold text-red-600">12</div>
                    <p className="text-sm text-muted-foreground">Unresolved Errors</p>
                  </CardContent>
                </Card>
                <Card>
                  <CardContent className="p-6">
                    <div className="text-2xl font-bold text-yellow-600">8</div>
                    <p className="text-sm text-muted-foreground">Warnings Today</p>
                  </CardContent>
                </Card>
                <Card>
                  <CardContent className="p-6">
                    <div className="text-2xl font-bold text-green-600">95%</div>
                    <p className="text-sm text-muted-foreground">System Uptime</p>
                  </CardContent>
                </Card>
              </div>
            </TabsContent>

            <TabsContent value="settings">
              <div className="space-y-4">
                <Card>
                  <CardContent className="p-6">
                    <h4 className="font-medium mb-4">Error Logging Configuration</h4>
                    <div className="space-y-4">
                      <div>
                        <label className="text-sm font-medium">Log Retention Period</label>
                        <Select defaultValue="30">
                          <SelectTrigger className="w-full mt-1">
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="7">7 days</SelectItem>
                            <SelectItem value="30">30 days</SelectItem>
                            <SelectItem value="90">90 days</SelectItem>
                            <SelectItem value="365">1 year</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                      <div>
                        <label className="text-sm font-medium">Minimum Log Level</label>
                        <Select defaultValue="warning">
                          <SelectTrigger className="w-full mt-1">
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="info">Info</SelectItem>
                            <SelectItem value="warning">Warning</SelectItem>
                            <SelectItem value="error">Error</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>
    </div>
  );
};

export default ErrorManagement;
