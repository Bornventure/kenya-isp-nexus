
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { 
  Code, 
  Copy, 
  Play, 
  Book, 
  Key, 
  Globe, 
  Database, 
  CreditCard, 
  Users, 
  Router, 
  HeadphonesIcon,
  Wifi,
  FileText,
  MessageSquare
} from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

const ApiDocumentation = () => {
  const { toast } = useToast();
  const [selectedEndpoint, setSelectedEndpoint] = useState('');
  const [apiKey, setApiKey] = useState('');

  const baseUrl = 'https://ddljuawonxdnesrnclsx.supabase.co/functions/v1';
  
  const apiSections = [
    {
      id: 'authentication',
      title: 'Authentication',
      icon: <Key className="h-5 w-5" />,
      endpoints: [
        {
          method: 'POST',
          path: '/client-auth',
          summary: 'Client Authentication',
          description: 'Authenticate client using email and ID number',
          requestBody: {
            email: 'client@example.com',
            id_number: '12345678'
          },
          response: {
            success: true,
            client: {
              id: 'uuid',
              name: 'John Doe',
              status: 'active',
              balance: 1500,
              service_packages: {}
            }
          }
        },
        {
          method: 'POST',
          path: '/client-registration',
          summary: 'Client Registration',
          description: 'Register a new client for internet services',
          requestBody: {
            name: 'John Doe',
            email: 'john@example.com',
            phone: '+254700123456',
            id_number: '12345678',
            address: '123 Main St',
            county: 'Nairobi',
            sub_county: 'Westlands',
            client_type: 'individual',
            connection_type: 'fiber',
            isp_company_id: 'uuid'
          }
        }
      ]
    },
    {
      id: 'clients',
      title: 'Client Management',
      icon: <Users className="h-5 w-5" />,
      endpoints: [
        {
          method: 'GET',
          path: '/client-dashboard-data',
          summary: 'Get Client Dashboard Data',
          description: 'Retrieve comprehensive client account information',
          queryParams: {
            client_email: 'client@example.com',
            client_id_number: '12345678'
          }
        },
        {
          method: 'POST',
          path: '/update-client-profile',
          summary: 'Update Client Profile',
          description: 'Update client contact and address information',
          requestBody: {
            client_email: 'client@example.com',
            client_id_number: '12345678',
            updates: {
              phone: '+254700123456',
              address: 'New Address'
            }
          }
        }
      ]
    },
    {
      id: 'packages',
      title: 'Service Packages',
      icon: <Wifi className="h-5 w-5" />,
      endpoints: [
        {
          method: 'GET',
          path: '/service-packages',
          summary: 'Get Available Packages',
          description: 'List all available internet service packages',
          queryParams: {
            isp_company_id: 'uuid'
          },
          response: {
            success: true,
            packages: [
              {
                id: 'uuid',
                name: 'Basic Fiber',
                speed: '10 Mbps',
                monthly_rate: 1500,
                description: 'Basic internet package'
              }
            ]
          }
        },
        {
          method: 'POST',
          path: '/package-renewal',
          summary: 'Renew Package',
          description: 'Initiate package renewal for a client',
          requestBody: {
            client_email: 'client@example.com',
            client_id_number: '12345678',
            package_id: 'uuid'
          }
        }
      ]
    },
    {
      id: 'payments',
      title: 'Payments & Billing',
      icon: <CreditCard className="h-5 w-5" />,
      endpoints: [
        {
          method: 'POST',
          path: '/mpesa-stk-push',
          summary: 'Initiate M-Pesa Payment',
          description: 'Start M-Pesa STK push payment process',
          requestBody: {
            phoneNumber: '254700123456',
            amount: 1500,
            accountReference: 'client-id',
            transactionDesc: 'Internet payment'
          }
        },
        {
          method: 'POST',
          path: '/check-payment-status',
          summary: 'Check Payment Status',
          description: 'Query the status of a payment transaction',
          requestBody: {
            paymentId: 'payment-uuid',
            checkoutRequestId: 'request-id'
          }
        },
        {
          method: 'GET',
          path: '/get-payment-history',
          summary: 'Get Payment History',
          description: 'Retrieve client payment history with pagination',
          queryParams: {
            client_email: 'client@example.com',
            client_id_number: '12345678',
            page: 1,
            limit: 10
          }
        },
        {
          method: 'POST',
          path: '/wallet-credit',
          summary: 'Credit Wallet',
          description: 'Add credit to client wallet balance',
          requestBody: {
            client_id: 'uuid',
            amount: 1000,
            payment_method: 'mpesa',
            reference: 'payment-ref'
          }
        }
      ]
    },
    {
      id: 'invoices',
      title: 'Invoice Management',
      icon: <FileText className="h-5 w-5" />,
      endpoints: [
        {
          method: 'GET',
          path: '/get-invoice-details',
          summary: 'Get Invoice Details',
          description: 'Retrieve invoice information for a client',
          queryParams: {
            client_email: 'client@example.com',
            client_id_number: '12345678',
            invoice_id: 'uuid'
          }
        },
        {
          method: 'POST',
          path: '/generate-receipt',
          summary: 'Generate Receipt',
          description: 'Generate payment receipt for transactions',
          requestBody: {
            client_email: 'client@example.com',
            payment_id: 'uuid'
          }
        }
      ]
    },
    {
      id: 'support',
      title: 'Support System',
      icon: <HeadphonesIcon className="h-5 w-5" />,
      endpoints: [
        {
          method: 'POST',
          path: '/submit-support-ticket',
          summary: 'Submit Support Ticket',
          description: 'Create a new support ticket',
          requestBody: {
            client_email: 'client@example.com',
            client_id_number: '12345678',
            title: 'Connection Issue',
            description: 'Unable to connect to internet',
            priority: 'high'
          }
        },
        {
          method: 'GET',
          path: '/support-tickets',
          summary: 'Get Support Tickets',
          description: 'Retrieve client support tickets',
          queryParams: {
            client_email: 'client@example.com',
            client_id_number: '12345678',
            status: 'open'
          }
        }
      ]
    },
    {
      id: 'notifications',
      title: 'Notifications',
      icon: <MessageSquare className="h-5 w-5" />,
      endpoints: [
        {
          method: 'POST',
          path: '/send-notifications',
          summary: 'Send Notification',
          description: 'Send notification to client via SMS/Email',
          requestBody: {
            client_id: 'uuid',
            type: 'payment_reminder',
            channels: ['sms', 'email'],
            message: 'Your payment is due'
          }
        }
      ]
    }
  ];

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    toast({
      title: "Copied to clipboard",
      description: "Code has been copied to your clipboard.",
    });
  };

  const generateCurlCommand = (endpoint: any, section: string) => {
    const method = endpoint.method;
    const url = `${baseUrl}${endpoint.path}`;
    let curl = `curl -X ${method} "${url}"`;
    
    if (apiKey) {
      curl += ` \\\n  -H "apikey: ${apiKey}"`;
    }
    
    curl += ` \\\n  -H "Content-Type: application/json"`;
    
    if (endpoint.requestBody) {
      curl += ` \\\n  -d '${JSON.stringify(endpoint.requestBody, null, 2)}'`;
    }
    
    return curl;
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-8">
        <div className="flex items-center gap-3 mb-4">
          <div className="bg-blue-600 p-3 rounded-full">
            <Globe className="h-8 w-8 text-white" />
          </div>
          <div>
            <h1 className="text-3xl font-bold text-gray-900 dark:text-gray-100">
              DataDefender API Documentation
            </h1>
            <p className="text-lg text-gray-600 dark:text-gray-300">
              Comprehensive API reference for Kenya Internet Services
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <Card>
            <CardContent className="p-6 text-center">
              <Database className="h-8 w-8 mx-auto mb-2 text-blue-600" />
              <h3 className="font-semibold">REST API</h3>
              <p className="text-sm text-muted-foreground">JSON-based RESTful API</p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-6 text-center">
              <Key className="h-8 w-8 mx-auto mb-2 text-green-600" />
              <h3 className="font-semibold">Secure</h3>
              <p className="text-sm text-muted-foreground">API key authentication</p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-6 text-center">
              <Code className="h-8 w-8 mx-auto mb-2 text-purple-600" />
              <h3 className="font-semibold">Developer Friendly</h3>
              <p className="text-sm text-muted-foreground">Clear documentation</p>
            </CardContent>
          </Card>
        </div>

        {/* API Key Input */}
        <Card className="mb-6">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Key className="h-5 w-5" />
              API Configuration
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="apiKey">API Key (Optional for testing)</Label>
                <Input
                  id="apiKey"
                  type="password"
                  placeholder="Enter your API key"
                  value={apiKey}
                  onChange={(e) => setApiKey(e.target.value)}
                />
              </div>
              <div>
                <Label>Base URL</Label>
                <div className="flex items-center gap-2">
                  <Input value={baseUrl} readOnly />
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => copyToClipboard(baseUrl)}
                  >
                    <Copy className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <Tabs defaultValue="authentication" className="space-y-6">
        <TabsList className="grid grid-cols-3 md:grid-cols-7 w-full">
          {apiSections.map((section) => (
            <TabsTrigger
              key={section.id}
              value={section.id}
              className="flex items-center gap-1 text-xs"
            >
              {section.icon}
              <span className="hidden sm:inline">{section.title}</span>
            </TabsTrigger>
          ))}
        </TabsList>

        {apiSections.map((section) => (
          <TabsContent key={section.id} value={section.id}>
            <div className="space-y-6">
              <div className="flex items-center gap-2 mb-4">
                {section.icon}
                <h2 className="text-2xl font-bold">{section.title}</h2>
              </div>

              {section.endpoints.map((endpoint, index) => (
                <Card key={index}>
                  <CardHeader>
                    <div className="flex items-center justify-between">
                      <CardTitle className="flex items-center gap-2">
                        <Badge 
                          variant={endpoint.method === 'GET' ? 'secondary' : 'default'}
                          className={
                            endpoint.method === 'GET' ? 'bg-green-100 text-green-800' :
                            endpoint.method === 'POST' ? 'bg-blue-100 text-blue-800' :
                            endpoint.method === 'PUT' ? 'bg-yellow-100 text-yellow-800' :
                            'bg-red-100 text-red-800'
                          }
                        >
                          {endpoint.method}
                        </Badge>
                        <code className="text-sm">{endpoint.path}</code>
                      </CardTitle>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => copyToClipboard(generateCurlCommand(endpoint, section.id))}
                      >
                        <Copy className="h-4 w-4 mr-1" />
                        Copy cURL
                      </Button>
                    </div>
                    <p className="text-muted-foreground">{endpoint.description}</p>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    {/* Request Body */}
                    {endpoint.requestBody && (
                      <div>
                        <h4 className="font-semibold mb-2">Request Body:</h4>
                        <div className="bg-gray-100 dark:bg-gray-800 p-4 rounded-lg">
                          <pre className="text-sm overflow-x-auto">
                            <code>{JSON.stringify(endpoint.requestBody, null, 2)}</code>
                          </pre>
                        </div>
                      </div>
                    )}

                    {/* Query Parameters */}
                    {endpoint.queryParams && (
                      <div>
                        <h4 className="font-semibold mb-2">Query Parameters:</h4>
                        <div className="bg-gray-100 dark:bg-gray-800 p-4 rounded-lg">
                          <pre className="text-sm overflow-x-auto">
                            <code>{JSON.stringify(endpoint.queryParams, null, 2)}</code>
                          </pre>
                        </div>
                      </div>
                    )}

                    {/* Response Example */}
                    {endpoint.response && (
                      <div>
                        <h4 className="font-semibold mb-2">Response Example:</h4>
                        <div className="bg-gray-100 dark:bg-gray-800 p-4 rounded-lg">
                          <pre className="text-sm overflow-x-auto">
                            <code>{JSON.stringify(endpoint.response, null, 2)}</code>
                          </pre>
                        </div>
                      </div>
                    )}

                    {/* cURL Example */}
                    <div>
                      <h4 className="font-semibold mb-2">cURL Example:</h4>
                      <div className="bg-gray-900 text-green-400 p-4 rounded-lg">
                        <pre className="text-sm overflow-x-auto">
                          <code>{generateCurlCommand(endpoint, section.id)}</code>
                        </pre>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </TabsContent>
        ))}
      </Tabs>

      {/* Getting Started Guide */}
      <Card className="mt-8">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Book className="h-5 w-5" />
            Getting Started
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <h4 className="font-semibold mb-2">1. Authentication</h4>
              <p className="text-sm text-muted-foreground">
                All API requests require authentication. Include your API key in the request headers.
              </p>
            </div>
            <div>
              <h4 className="font-semibold mb-2">2. Base URL</h4>
              <p className="text-sm text-muted-foreground">
                All API endpoints are relative to the base URL: <code>{baseUrl}</code>
              </p>
            </div>
            <div>
              <h4 className="font-semibold mb-2">3. Response Format</h4>
              <p className="text-sm text-muted-foreground">
                All responses are in JSON format with a consistent structure including success, data, and error fields.
              </p>
            </div>
            <div>
              <h4 className="font-semibold mb-2">4. Rate Limiting</h4>
              <p className="text-sm text-muted-foreground">
                API calls are rate limited to ensure service quality. Contact support for increased limits.
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default ApiDocumentation;
