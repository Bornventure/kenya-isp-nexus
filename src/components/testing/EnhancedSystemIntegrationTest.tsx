
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Progress } from '@/components/ui/progress';
import { 
  TestTube, 
  CheckCircle, 
  XCircle, 
  Clock, 
  AlertTriangle,
  Database,
  Router,
  Users,
  Activity,
  RefreshCw
} from 'lucide-react';
import { useRadiusSystem, SystemTest } from '@/hooks/useRadiusSystem';

const EnhancedSystemIntegrationTest = () => {
  const { testResults, radiusUsers, radiusSessions, runTests, isRunningTests, isLoading } = useRadiusSystem();
  const [selectedCategory, setSelectedCategory] = useState('all');

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'passed':
        return <CheckCircle className="h-4 w-4 text-green-500" />;
      case 'failed':
        return <XCircle className="h-4 w-4 text-red-500" />;
      case 'pending':
        return <Clock className="h-4 w-4 text-yellow-500 animate-spin" />;
      default:
        return <AlertTriangle className="h-4 w-4 text-gray-500" />;
    }
  };

  const getStatusBadge = (status: string) => {
    const variants: any = {
      passed: 'default',
      failed: 'destructive',
      pending: 'secondary',
      not_run: 'outline'
    };
    
    return (
      <Badge variant={variants[status] || 'outline'}>
        {status.replace('_', ' ')}
      </Badge>
    );
  };

  const filteredResults = selectedCategory === 'all' 
    ? testResults 
    : testResults.filter(test => test.test_category === selectedCategory);

  const passedCount = testResults.filter(t => t.status === 'passed').length;
  const failedCount = testResults.filter(t => t.status === 'failed').length;
  const totalCount = testResults.length;
  const successRate = totalCount > 0 ? (passedCount / totalCount) * 100 : 0;

  const categories = [
    { id: 'all', label: 'All Tests', icon: TestTube },
    { id: 'radius', label: 'RADIUS', icon: Database },
    { id: 'pppoe', label: 'PPPoE', icon: Router }
  ];

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="flex items-center gap-2">
                <TestTube className="h-6 w-6" />
                Enhanced System Integration Tests
              </CardTitle>
              <p className="text-muted-foreground mt-1">
                Comprehensive testing of RADIUS authentication, PPPoE connectivity, and MikroTik integration
              </p>
            </div>
            <Button 
              onClick={() => runTests()} 
              disabled={isRunningTests}
              className="flex items-center gap-2"
            >
              {isRunningTests ? (
                <>
                  <RefreshCw className="h-4 w-4 animate-spin" />
                  Running Tests...
                </>
              ) : (
                <>
                  <TestTube className="h-4 w-4" />
                  Run All Tests
                </>
              )}
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          {/* Test Overview */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
            <Card className="p-4">
              <div className="flex items-center gap-2">
                <CheckCircle className="h-5 w-5 text-green-500" />
                <div>
                  <div className="font-semibold text-green-600">{passedCount}</div>
                  <div className="text-sm text-muted-foreground">Passed</div>
                </div>
              </div>
            </Card>
            <Card className="p-4">
              <div className="flex items-center gap-2">
                <XCircle className="h-5 w-5 text-red-500" />
                <div>
                  <div className="font-semibold text-red-600">{failedCount}</div>
                  <div className="text-sm text-muted-foreground">Failed</div>
                </div>
              </div>
            </Card>
            <Card className="p-4">
              <div className="flex items-center gap-2">
                <Activity className="h-5 w-5 text-blue-500" />
                <div>
                  <div className="font-semibold text-blue-600">{totalCount}</div>
                  <div className="text-sm text-muted-foreground">Total Tests</div>
                </div>
              </div>
            </Card>
            <Card className="p-4">
              <div className="flex items-center gap-2">
                <Users className="h-5 w-5 text-purple-500" />
                <div>
                  <div className="font-semibold text-purple-600">{radiusSessions.length}</div>
                  <div className="text-sm text-muted-foreground">Active Sessions</div>
                </div>
              </div>
            </Card>
          </div>

          {/* Success Rate Progress */}
          <div className="mb-6">
            <div className="flex justify-between items-center mb-2">
              <span className="text-sm font-medium">Overall Success Rate</span>
              <span className="text-sm font-medium">{successRate.toFixed(1)}%</span>
            </div>
            <Progress value={successRate} className="h-2" />
          </div>

          {/* Test Categories */}
          <Tabs value={selectedCategory} onValueChange={setSelectedCategory}>
            <TabsList className="grid w-full grid-cols-3">
              {categories.map((category) => {
                const Icon = category.icon;
                const categoryTests = category.id === 'all' ? testResults : testResults.filter(t => t.test_category === category.id);
                const categoryPassed = categoryTests.filter(t => t.status === 'passed').length;
                const categoryTotal = categoryTests.length;
                
                return (
                  <TabsTrigger key={category.id} value={category.id} className="gap-2">
                    <Icon className="h-4 w-4" />
                    {category.label}
                    {categoryTotal > 0 && (
                      <Badge variant="outline" className="ml-1 text-xs">
                        {categoryPassed}/{categoryTotal}
                      </Badge>
                    )}
                  </TabsTrigger>
                );
              })}
            </TabsList>

            {categories.map((category) => (
              <TabsContent key={category.id} value={category.id} className="space-y-4">
                {isLoading ? (
                  <div className="text-center py-8">
                    <RefreshCw className="h-8 w-8 animate-spin mx-auto mb-2" />
                    <p className="text-muted-foreground">Loading test results...</p>
                  </div>
                ) : filteredResults.length === 0 ? (
                  <div className="text-center py-8">
                    <TestTube className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                    <h3 className="text-lg font-medium text-gray-900 mb-2">No Tests Run Yet</h3>
                    <p className="text-gray-500 mb-4">
                      Click "Run All Tests" to start the system integration testing process.
                    </p>
                    <Button onClick={() => runTests()} disabled={isRunningTests}>
                      <TestTube className="h-4 w-4 mr-2" />
                      Start Testing
                    </Button>
                  </div>
                ) : (
                  <div className="space-y-3">
                    {filteredResults.map((test, index) => (
                      <Card key={`${test.test_name}-${index}`} className="p-4">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-3">
                            {getStatusIcon(test.status)}
                            <div>
                              <h4 className="font-medium">{test.test_name}</h4>
                              <p className="text-sm text-muted-foreground">{test.message}</p>
                              {test.last_run && (
                                <p className="text-xs text-muted-foreground mt-1">
                                  Last run: {new Date(test.last_run).toLocaleString()}
                                </p>
                              )}
                            </div>
                          </div>
                          <div className="flex items-center gap-2">
                            {getStatusBadge(test.status)}
                          </div>
                        </div>
                        {test.details && Object.keys(test.details).length > 0 && (
                          <div className="mt-3 p-3 bg-muted rounded-lg">
                            <p className="text-xs font-medium text-muted-foreground mb-2">Test Details:</p>
                            <pre className="text-xs overflow-x-auto">
                              {JSON.stringify(test.details, null, 2)}
                            </pre>
                          </div>
                        )}
                      </Card>
                    ))}
                  </div>
                )}
              </TabsContent>
            ))}
          </Tabs>
        </CardContent>
      </Card>

      {/* System Status Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Database className="h-5 w-5" />
              RADIUS Users ({radiusUsers.length})
            </CardTitle>
          </CardHeader>
          <CardContent>
            {radiusUsers.length === 0 ? (
              <p className="text-muted-foreground">No RADIUS users configured yet. Add clients to enable authentication.</p>
            ) : (
              <div className="space-y-2">
                <p className="text-sm">Active RADIUS users ready for authentication</p>
                <div className="flex flex-wrap gap-1">
                  {radiusUsers.slice(0, 5).map((user: any) => (
                    <Badge key={user.id} variant="outline" className="text-xs">
                      {user.username}
                    </Badge>
                  ))}
                  {radiusUsers.length > 5 && (
                    <Badge variant="secondary" className="text-xs">
                      +{radiusUsers.length - 5} more
                    </Badge>
                  )}
                </div>
              </div>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Activity className="h-5 w-5" />
              Active Sessions ({radiusSessions.length})
            </CardTitle>
          </CardHeader>
          <CardContent>
            {radiusSessions.length === 0 ? (
              <p className="text-muted-foreground">No active RADIUS sessions. Clients will appear here when connected.</p>
            ) : (
              <div className="space-y-2">
                <p className="text-sm">Currently connected clients</p>
                <div className="space-y-1">
                  {radiusSessions.slice(0, 3).map((session: any) => (
                    <div key={session.id} className="flex justify-between items-center text-xs">
                      <span>{session.username}</span>
                      <Badge variant="default" className="text-xs">Connected</Badge>
                    </div>
                  ))}
                  {radiusSessions.length > 3 && (
                    <p className="text-xs text-muted-foreground">
                      +{radiusSessions.length - 3} more sessions
                    </p>
                  )}
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default EnhancedSystemIntegrationTest;
