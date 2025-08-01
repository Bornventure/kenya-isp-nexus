
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from '@/components/ui/select';
import { Calendar } from '@/components/ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { 
  Search, 
  Calendar as CalendarIcon, 
  Download, 
  Filter,
  AlertTriangle,
  Info,
  CheckCircle,
  XCircle,
  User,
  Activity
} from 'lucide-react';
import { format } from 'date-fns';
import { auditLogService, AuditLogEntry, SystemLog } from '@/services/auditLogService';

const AuditLogViewer = () => {
  const [auditLogs, setAuditLogs] = useState<AuditLogEntry[]>([]);
  const [systemLogs, setSystemLogs] = useState<SystemLog[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedResource, setSelectedResource] = useState('all');
  const [selectedLevel, setSelectedLevel] = useState('all');
  const [dateRange, setDateRange] = useState<{
    start: Date | undefined;
    end: Date | undefined;
  }>({ start: undefined, end: undefined });
  const [summary, setSummary] = useState({
    totalActions: 0,
    successfulActions: 0,
    failedActions: 0,
    topUsers: [],
    topResources: []
  });

  useEffect(() => {
    loadLogs();
    loadSummary();
  }, [dateRange, selectedResource, selectedLevel]);

  const loadLogs = async () => {
    setLoading(true);
    try {
      const auditFilters = {
        resource: selectedResource !== 'all' ? selectedResource : undefined,
        startDate: dateRange.start,
        endDate: dateRange.end,
        limit: 100
      };

      const systemFilters = {
        level: selectedLevel !== 'all' ? selectedLevel : undefined,
        startDate: dateRange.start,
        endDate: dateRange.end,
        limit: 100
      };

      const [auditData, systemData] = await Promise.all([
        auditLogService.getAuditLogs(auditFilters),
        auditLogService.getSystemLogs(systemFilters)
      ]);

      setAuditLogs(auditData);
      setSystemLogs(systemData);
    } catch (error) {
      console.error('Error loading logs:', error);
    } finally {
      setLoading(false);
    }
  };

  const loadSummary = async () => {
    try {
      const summaryData = await auditLogService.getAuditSummary(7);
      setSummary(summaryData);
    } catch (error) {
      console.error('Error loading summary:', error);
    }
  };

  const getActionIcon = (action: string, success: boolean) => {
    if (!success) return <XCircle className="h-4 w-4 text-red-500" />;
    
    switch (action.toLowerCase()) {
      case 'create':
      case 'add':
        return <CheckCircle className="h-4 w-4 text-green-500" />;
      case 'update':
      case 'modify':
        return <Activity className="h-4 w-4 text-blue-500" />;
      case 'delete':
      case 'remove':
        return <XCircle className="h-4 w-4 text-red-500" />;
      default:
        return <Info className="h-4 w-4 text-gray-500" />;
    }
  };

  const getLevelIcon = (level: string) => {
    switch (level) {
      case 'error':
      case 'critical':
        return <XCircle className="h-4 w-4 text-red-500" />;
      case 'warning':
        return <AlertTriangle className="h-4 w-4 text-yellow-500" />;
      case 'info':
        return <Info className="h-4 w-4 text-blue-500" />;
      default:
        return <Info className="h-4 w-4 text-gray-500" />;
    }
  };

  const exportLogs = async () => {
    try {
      const data = {
        auditLogs: auditLogs.map(log => ({
          timestamp: log.timestamp.toISOString(),
          user: log.userEmail,
          action: log.action,
          resource: log.resource,
          success: log.success,
          changes: log.changes
        })),
        systemLogs: systemLogs.map(log => ({
          timestamp: log.timestamp.toISOString(),
          level: log.level,
          category: log.category,
          message: log.message,
          details: log.details
        }))
      };

      const blob = new Blob([JSON.stringify(data, null, 2)], { 
        type: 'application/json' 
      });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `audit-logs-${format(new Date(), 'yyyy-MM-dd')}.json`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
    } catch (error) {
      console.error('Error exporting logs:', error);
    }
  };

  const filteredAuditLogs = auditLogs.filter(log => 
    searchTerm === '' || 
    log.action.toLowerCase().includes(searchTerm.toLowerCase()) ||
    log.resource.toLowerCase().includes(searchTerm.toLowerCase()) ||
    log.userEmail?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const filteredSystemLogs = systemLogs.filter(log =>
    searchTerm === '' ||
    log.message.toLowerCase().includes(searchTerm.toLowerCase()) ||
    log.category.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="space-y-6">
      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2">
              <Activity className="h-4 w-4 text-blue-500" />
              <div>
                <div className="text-2xl font-bold">{summary.totalActions}</div>
                <p className="text-sm text-muted-foreground">Total Actions</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2">
              <CheckCircle className="h-4 w-4 text-green-500" />
              <div>
                <div className="text-2xl font-bold text-green-600">
                  {summary.successfulActions}
                </div>
                <p className="text-sm text-muted-foreground">Successful</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2">
              <XCircle className="h-4 w-4 text-red-500" />
              <div>
                <div className="text-2xl font-bold text-red-600">
                  {summary.failedActions}
                </div>
                <p className="text-sm text-muted-foreground">Failed</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2">
              <User className="h-4 w-4 text-purple-500" />
              <div>
                <div className="text-2xl font-bold">{summary.topUsers.length}</div>
                <p className="text-sm text-muted-foreground">Active Users</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Filters */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            <span>Audit & System Logs</span>
            <Button onClick={exportLogs} variant="outline">
              <Download className="h-4 w-4 mr-2" />
              Export
            </Button>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-wrap gap-4 mb-6">
            <div className="flex-1 min-w-48">
              <Input
                placeholder="Search logs..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full"
              />
            </div>

            <Select value={selectedResource} onValueChange={setSelectedResource}>
              <SelectTrigger className="w-48">
                <SelectValue placeholder="Filter by resource" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Resources</SelectItem>
                <SelectItem value="client">Clients</SelectItem>
                <SelectItem value="equipment">Equipment</SelectItem>
                <SelectItem value="payment">Payments</SelectItem>
                <SelectItem value="user">Users</SelectItem>
              </SelectContent>
            </Select>

            <Select value={selectedLevel} onValueChange={setSelectedLevel}>
              <SelectTrigger className="w-48">
                <SelectValue placeholder="Filter by level" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Levels</SelectItem>
                <SelectItem value="info">Info</SelectItem>
                <SelectItem value="warning">Warning</SelectItem>
                <SelectItem value="error">Error</SelectItem>
                <SelectItem value="critical">Critical</SelectItem>
              </SelectContent>
            </Select>

            <Popover>
              <PopoverTrigger asChild>
                <Button variant="outline">
                  <CalendarIcon className="h-4 w-4 mr-2" />
                  Date Range
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-0" align="start">
                <Calendar
                  mode="range"
                  selected={{
                    from: dateRange.start,
                    to: dateRange.end
                  }}
                  onSelect={(range) => 
                    setDateRange({
                      start: range?.from,
                      end: range?.to
                    })
                  }
                />
              </PopoverContent>
            </Popover>
          </div>

          <Tabs defaultValue="audit" className="space-y-4">
            <TabsList>
              <TabsTrigger value="audit">User Actions</TabsTrigger>
              <TabsTrigger value="system">System Events</TabsTrigger>
            </TabsList>

            <TabsContent value="audit">
              <div className="space-y-2">
                {loading ? (
                  <div className="flex justify-center p-8">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
                  </div>
                ) : (
                  filteredAuditLogs.map((log) => (
                    <Card key={log.id} className="p-4">
                      <div className="flex items-start justify-between">
                        <div className="flex items-start gap-3">
                          {getActionIcon(log.action, log.success)}
                          <div className="flex-1">
                            <div className="flex items-center gap-2 mb-1">
                              <span className="font-medium">{log.userEmail}</span>
                              <Badge variant={log.success ? "default" : "destructive"}>
                                {log.action}
                              </Badge>
                              <Badge variant="outline">{log.resource}</Badge>
                            </div>
                            <p className="text-sm text-muted-foreground">
                              {format(log.timestamp, 'PPpp')}
                            </p>
                            {log.changes && (
                              <details className="mt-2">
                                <summary className="cursor-pointer text-sm text-blue-600">
                                  View Changes
                                </summary>
                                <pre className="mt-2 text-xs bg-gray-100 p-2 rounded overflow-x-auto">
                                  {JSON.stringify(log.changes, null, 2)}
                                </pre>
                              </details>
                            )}
                          </div>
                        </div>
                        {!log.success && log.errorMessage && (
                          <Badge variant="destructive">Error</Badge>
                        )}
                      </div>
                    </Card>
                  ))
                )}
              </div>
            </TabsContent>

            <TabsContent value="system">
              <div className="space-y-2">
                {loading ? (
                  <div className="flex justify-center p-8">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
                  </div>
                ) : (
                  filteredSystemLogs.map((log) => (
                    <Card key={log.id} className="p-4">
                      <div className="flex items-start gap-3">
                        {getLevelIcon(log.level)}
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-1">
                            <Badge 
                              variant={
                                log.level === 'error' || log.level === 'critical' 
                                  ? "destructive" 
                                  : log.level === 'warning' 
                                    ? "secondary" 
                                    : "default"
                              }
                            >
                              {log.level.toUpperCase()}
                            </Badge>
                            <Badge variant="outline">{log.category}</Badge>
                          </div>
                          <p className="text-sm font-medium mb-1">{log.message}</p>
                          <p className="text-xs text-muted-foreground">
                            {format(log.timestamp, 'PPpp')} • {log.source}
                          </p>
                          {log.details && (
                            <details className="mt-2">
                              <summary className="cursor-pointer text-sm text-blue-600">
                                View Details
                              </summary>
                              <pre className="mt-2 text-xs bg-gray-100 p-2 rounded overflow-x-auto">
                                {JSON.stringify(log.details, null, 2)}
                              </pre>
                            </details>
                          )}
                        </div>
                      </div>
                    </Card>
                  ))
                )}
              </div>
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>
    </div>
  );
};

export default AuditLogViewer;
