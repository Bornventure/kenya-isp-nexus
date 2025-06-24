import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { Switch } from '@/components/ui/switch';
import { 
  Code, 
  Key, 
  Globe, 
  Shield, 
  Clock, 
  BarChart3,
  ExternalLink,
  Copy,
  Plus,
  Trash2,
  RefreshCw
} from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import ApiDocumentation from './ApiDocumentation';

interface ApiKey {
  id: string;
  name: string;
  key: string;
  status: 'active' | 'inactive';
  rateLimit: number;
  usage: number;
  lastUsed: string;
  createdAt: string;
}

const DeveloperPortal = () => {
  const { toast } = useToast();
  const [activeTab, setActiveTab] = useState('overview');
  const [apiKeys, setApiKeys] = useState<ApiKey[]>([
    {
      id: '1',
      name: 'Production API',
      key: 'dd_live_sk_1234567890abcdef',
      status: 'active',
      rateLimit: 1000,
      usage: 750,
      lastUsed: '2025-01-24 14:30:00',
      createdAt: '2025-01-20 10:00:00'
    },
    {
      id: '2',
      name: 'Development API',
      key: 'dd_test_sk_abcdef1234567890',
      status: 'active',
      rateLimit: 100,
      usage: 45,
      lastUsed: '2025-01-24 12:15:00',
      createdAt: '2025-01-22 15:30:00'
    }
  ]);

  const [newApiKeyName, setNewApiKeyName] = useState('');
  const [newApiKeyLimit, setNewApiKeyLimit] = useState(1000);

  const generateApiKey = () => {
    if (!newApiKeyName.trim()) {
      toast({
        title: "Error",
        description: "Please enter a name for the API key",
        variant: "destructive",
      });
      return;
    }

    const newKey: ApiKey = {
      id: Date.now().toString(),
      name: newApiKeyName,
      key: `dd_${Math.random() > 0.5 ? 'live' : 'test'}_sk_${Math.random().toString(36).substring(2, 18)}`,
      status: 'active',
      rateLimit: newApiKeyLimit,
      usage: 0,
      lastUsed: 'Never',
      createdAt: new Date().toISOString().replace('T', ' ').substring(0, 19)
    };

    setApiKeys([...apiKeys, newKey]);
    setNewApiKeyName('');
    setNewApiKeyLimit(1000);

    toast({
      title: "API Key Generated",
      description: "Your new API key has been created successfully.",
    });
  };

  const copyApiKey = (key: string) => {
    navigator.clipboard.writeText(key);
    toast({
      title: "Copied",
      description: "API key copied to clipboard",
    });
  };

  const deleteApiKey = (id: string) => {
    setApiKeys(apiKeys.filter(key => key.id !== id));
    toast({
      title: "API Key Deleted",
      description: "The API key has been permanently deleted.",
    });
  };

  const toggleApiKeyStatus = (id: string) => {
    setApiKeys(apiKeys.map(key => 
      key.id === id 
        ? { ...key, status: key.status === 'active' ? 'inactive' : 'active' }
        : key
    ));
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-8">
        <div className="flex items-center gap-3 mb-4">
          <div className="bg-blue-600 p-3 rounded-full">
            <Code className="h-8 w-8 text-white" />
          </div>
          <div>
            <h1 className="text-3xl font-bold text-gray-900 dark:text-gray-100">
              Developer Portal
            </h1>
            <p className="text-lg text-gray-600 dark:text-gray-300">
              Manage API access and integrate with DataDefender Kenya Internet Services
            </p>
          </div>
        </div>

        {/* Quick Stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <Card>
            <CardContent className="p-6 text-center">
              <Key className="h-8 w-8 mx-auto mb-2 text-blue-600" />
              <h3 className="text-2xl font-bold">{apiKeys.filter(k => k.status === 'active').length}</h3>
              <p className="text-sm text-muted-foreground">Active API Keys</p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-6 text-center">
              <BarChart3 className="h-8 w-8 mx-auto mb-2 text-green-600" />
              <h3 className="text-2xl font-bold">{apiKeys.reduce((sum, key) => sum + key.usage, 0)}</h3>
              <p className="text-sm text-muted-foreground">Total API Calls</p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-6 text-center">
              <Clock className="h-8 w-8 mx-auto mb-2 text-yellow-600" />
              <h3 className="text-2xl font-bold">{apiKeys.reduce((sum, key) => sum + key.rateLimit, 0)}</h3>
              <p className="text-sm text-muted-foreground">Rate Limit/Hour</p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-6 text-center">
              <Shield className="h-8 w-8 mx-auto mb-2 text-purple-600" />
              <h3 className="text-2xl font-bold">99.9%</h3>
              <p className="text-sm text-muted-foreground">API Uptime</p>
            </CardContent>
          </Card>
        </div>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
        <TabsList className="grid grid-cols-2 md:grid-cols-4 w-full">
          <TabsTrigger value="overview" className="flex items-center gap-2">
            <Globe className="h-4 w-4" />
            <span className="hidden sm:inline">Overview</span>
          </TabsTrigger>
          <TabsTrigger value="api-keys" className="flex items-center gap-2">
            <Key className="h-4 w-4" />
            <span className="hidden sm:inline">API Keys</span>
          </TabsTrigger>
          <TabsTrigger value="documentation" className="flex items-center gap-2">
            <Code className="h-4 w-4" />
            <span className="hidden sm:inline">API Docs</span>
          </TabsTrigger>
          <TabsTrigger value="analytics" className="flex items-center gap-2">
            <BarChart3 className="h-4 w-4" />
            <span className="hidden sm:inline">Analytics</span>
          </TabsTrigger>
        </TabsList>

        {/* Overview Tab */}
        <TabsContent value="overview">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>Getting Started</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <h4 className="font-semibold">1. Generate API Key</h4>
                  <p className="text-sm text-muted-foreground">
                    Create your first API key to start making requests to our services.
                  </p>
                </div>
                <div className="space-y-2">
                  <h4 className="font-semibold">2. Review Documentation</h4>
                  <p className="text-sm text-muted-foreground">
                    Explore our comprehensive API documentation with examples and code samples.
                  </p>
                </div>
                <div className="space-y-2">
                  <h4 className="font-semibold">3. Test Integration</h4>
                  <p className="text-sm text-muted-foreground">
                    Use our sandbox environment to test your integration before going live.
                  </p>
                </div>
                <Button 
                  onClick={() => setActiveTab('api-keys')} 
                  className="w-full"
                >
                  Generate Your First API Key
                </Button>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>API Endpoints</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-3">
                  <div className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-800 rounded-lg">
                    <div>
                      <h5 className="font-medium">Authentication</h5>
                      <p className="text-sm text-muted-foreground">Client login & registration</p>
                    </div>
                    <Badge variant="secondary">2 endpoints</Badge>
                  </div>
                  <div className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-800 rounded-lg">
                    <div>
                      <h5 className="font-medium">Payments</h5>
                      <p className="text-sm text-muted-foreground">M-Pesa integration & billing</p>
                    </div>
                    <Badge variant="secondary">4 endpoints</Badge>
                  </div>
                  <div className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-800 rounded-lg">
                    <div>
                      <h5 className="font-medium">Service Packages</h5>
                      <p className="text-sm text-muted-foreground">Internet packages & renewals</p>
                    </div>
                    <Badge variant="secondary">2 endpoints</Badge>
                  </div>
                  <div className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-800 rounded-lg">
                    <div>
                      <h5 className="font-medium">Support</h5>
                      <p className="text-sm text-muted-foreground">Ticket management</p>
                    </div>
                    <Badge variant="secondary">2 endpoints</Badge>
                  </div>
                </div>
                <Button 
                  variant="outline" 
                  onClick={() => setActiveTab('documentation')}
                  className="w-full"
                >
                  <ExternalLink className="h-4 w-4 mr-2" />
                  View Full Documentation
                </Button>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* API Keys Tab */}
        <TabsContent value="api-keys">
          <div className="space-y-6">
            {/* Create New API Key */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Plus className="h-5 w-5" />
                  Generate New API Key
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div>
                    <Label htmlFor="keyName">API Key Name</Label>
                    <Input
                      id="keyName"
                      placeholder="e.g., Mobile App Production"
                      value={newApiKeyName}
                      onChange={(e) => setNewApiKeyName(e.target.value)}
                    />
                  </div>
                  <div>
                    <Label htmlFor="rateLimit">Rate Limit (requests/hour)</Label>
                    <Input
                      id="rateLimit"
                      type="number"
                      value={newApiKeyLimit}
                      onChange={(e) => setNewApiKeyLimit(parseInt(e.target.value))}
                    />
                  </div>
                  <div className="flex items-end">
                    <Button onClick={generateApiKey} className="w-full">
                      <Key className="h-4 w-4 mr-2" />
                      Generate Key
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Existing API Keys */}
            <Card>
              <CardHeader>
                <CardTitle>Your API Keys</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {apiKeys.map((apiKey) => (
                    <div key={apiKey.id} className="border rounded-lg p-4">
                      <div className="flex items-center justify-between mb-3">
                        <div className="flex items-center gap-3">
                          <h4 className="font-semibold">{apiKey.name}</h4>
                          <Badge variant={apiKey.status === 'active' ? 'default' : 'secondary'}>
                            {apiKey.status}
                          </Badge>
                        </div>
                        <div className="flex items-center gap-2">
                          <Switch
                            checked={apiKey.status === 'active'}
                            onCheckedChange={() => toggleApiKeyStatus(apiKey.id)}
                          />
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => deleteApiKey(apiKey.id)}
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </div>
                      
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-3">
                        <div>
                          <Label className="text-xs text-muted-foreground">API Key</Label>
                          <div className="flex items-center gap-2 mt-1">
                            <code className="flex-1 p-2 bg-gray-100 dark:bg-gray-800 rounded text-sm">
                              {apiKey.key}
                            </code>
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => copyApiKey(apiKey.key)}
                            >
                              <Copy className="h-4 w-4" />
                            </Button>
                          </div>
                        </div>
                        <div className="grid grid-cols-2 gap-4">
                          <div>
                            <Label className="text-xs text-muted-foreground">Usage</Label>
                            <p className="text-sm font-medium">
                              {apiKey.usage} / {apiKey.rateLimit}
                            </p>
                          </div>
                          <div>
                            <Label className="text-xs text-muted-foreground">Last Used</Label>
                            <p className="text-sm">{apiKey.lastUsed}</p>
                          </div>
                        </div>
                      </div>

                      <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                        <div 
                          className="bg-blue-600 h-2 rounded-full" 
                          style={{ width: `${(apiKey.usage / apiKey.rateLimit) * 100}%` }}
                        ></div>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* Documentation Tab */}
        <TabsContent value="documentation">
          <ApiDocumentation />
        </TabsContent>

        {/* Analytics Tab */}
        <TabsContent value="analytics">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>API Usage Overview</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex justify-between items-center p-3 border rounded-lg">
                    <span>Authentication API</span>
                    <Badge variant="outline">456 calls today</Badge>
                  </div>
                  <div className="flex justify-between items-center p-3 border rounded-lg">
                    <span>Payment API</span>
                    <Badge variant="outline">234 calls today</Badge>
                  </div>
                  <div className="flex justify-between items-center p-3 border rounded-lg">
                    <span>Service Packages API</span>
                    <Badge variant="outline">123 calls today</Badge>
                  </div>
                  <div className="flex justify-between items-center p-3 border rounded-lg">
                    <span>Support API</span>
                    <Badge variant="outline">67 calls today</Badge>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Rate Limiting Status</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {apiKeys.map((key) => (
                    <div key={key.id} className="space-y-2">
                      <div className="flex justify-between text-sm">
                        <span>{key.name}</span>
                        <span>{key.usage}/{key.rateLimit}</span>
                      </div>
                      <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                        <div 
                          className={`h-2 rounded-full ${
                            (key.usage / key.rateLimit) > 0.8 ? 'bg-red-500' :
                            (key.usage / key.rateLimit) > 0.6 ? 'bg-yellow-500' : 'bg-green-500'
                          }`}
                          style={{ width: `${(key.usage / key.rateLimit) * 100}%` }}
                        ></div>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default DeveloperPortal;
