
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { CheckCircle, XCircle, AlertCircle, Clipboard } from 'lucide-react';

interface ChecklistItem {
  id: string;
  category: string;
  item: string;
  status: 'pending' | 'completed' | 'failed' | 'warning';
  description: string;
  critical: boolean;
}

const ProductionReadinessChecklist: React.FC = () => {
  const [checklist] = useState<ChecklistItem[]>([
    // Infrastructure
    {
      id: 'infra-1',
      category: 'Infrastructure',
      item: 'MikroTik RouterOS Configuration',
      status: 'pending',
      description: 'RouterOS API enabled, SNMP configured, user accounts setup',
      critical: true
    },
    {
      id: 'infra-2',
      category: 'Infrastructure',
      item: 'FreeRADIUS Server Setup',
      status: 'pending',
      description: 'RADIUS server running, database integration active',
      critical: true
    },
    {
      id: 'infra-3',
      category: 'Infrastructure',
      item: 'Database Connectivity',
      status: 'completed',
      description: 'Supabase connection stable and optimized',
      critical: true
    },
    
    // Network Management
    {
      id: 'network-1',
      category: 'Network Management',
      item: 'SNMP Device Discovery',
      status: 'pending',
      description: 'Automatic device discovery and monitoring active',
      critical: true
    },
    {
      id: 'network-2',
      category: 'Network Management',
      item: 'Bandwidth Management',
      status: 'pending',
      description: 'QoS policies and speed limits working correctly',
      critical: true
    },
    {
      id: 'network-3',
      category: 'Network Management',
      item: 'Client Isolation',
      status: 'pending',
      description: 'Network segmentation and access control functional',
      critical: false
    },
    
    // Client Management
    {
      id: 'client-1',
      category: 'Client Management',
      item: 'Registration Process',
      status: 'completed',
      description: 'Client registration, approval workflow active',
      critical: true
    },
    {
      id: 'client-2',
      category: 'Client Management',
      item: 'Service Package Assignment',
      status: 'completed',
      description: 'Package assignment and rate configuration',
      critical: true
    },
    {
      id: 'client-3',
      category: 'Client Management',
      item: 'Equipment Management',
      status: 'completed',
      description: 'Equipment assignment and tracking system',
      critical: false
    },
    
    // Payment System
    {
      id: 'payment-1',
      category: 'Payment System',
      item: 'M-Pesa Integration',
      status: 'completed',
      description: 'STK push, payment verification working',
      critical: true
    },
    {
      id: 'payment-2',
      category: 'Payment System',
      item: 'Wallet Management',
      status: 'completed',
      description: 'Wallet credits, automatic renewals active',
      critical: true
    },
    {
      id: 'payment-3',
      category: 'Payment System',
      item: 'Invoice Generation',
      status: 'completed',
      description: 'Automated invoice creation and management',
      critical: false
    },
    
    // Security
    {
      id: 'security-1',
      category: 'Security',
      item: 'User Authentication',
      status: 'completed',
      description: 'Role-based access control implemented',
      critical: true
    },
    {
      id: 'security-2',
      category: 'Security',
      item: 'Data Encryption',
      status: 'completed',
      description: 'Database encryption and secure connections',
      critical: true
    },
    {
      id: 'security-3',
      category: 'Security',
      item: 'API Security',
      status: 'warning',
      description: 'Rate limiting and API key management',
      critical: false
    }
  ]);

  const completedItems = checklist.filter(item => item.status === 'completed').length;
  const totalItems = checklist.length;
  const completionPercentage = Math.round((completedItems / totalItems) * 100);
  
  const criticalPending = checklist.filter(item => item.critical && item.status === 'pending').length;

  const getStatusIcon = (status: ChecklistItem['status']) => {
    switch (status) {
      case 'completed': return <CheckCircle className="h-5 w-5 text-green-500" />;
      case 'failed': return <XCircle className="h-5 w-5 text-red-500" />;
      case 'warning': return <AlertCircle className="h-5 w-5 text-yellow-500" />;
      default: return <div className="h-5 w-5 border-2 border-gray-300 rounded-full" />;
    }
  };

  const getStatusBadge = (status: ChecklistItem['status']) => {
    const variants = {
      completed: 'default',
      failed: 'destructive',
      warning: 'secondary',
      pending: 'outline'
    } as const;
    
    return <Badge variant={variants[status]}>{status.toUpperCase()}</Badge>;
  };

  const categories = Array.from(new Set(checklist.map(item => item.category)));

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Clipboard className="h-6 w-6" />
          Production Readiness Checklist
        </CardTitle>
        <div className="space-y-2">
          <div className="flex justify-between text-sm">
            <span>Overall Progress</span>
            <span>{completedItems}/{totalItems} completed</span>
          </div>
          <Progress value={completionPercentage} className="w-full" />
          {criticalPending > 0 && (
            <div className="text-sm text-yellow-600 flex items-center gap-1">
              <AlertCircle className="h-4 w-4" />
              {criticalPending} critical items pending
            </div>
          )}
        </div>
      </CardHeader>
      <CardContent className="space-y-6">
        {categories.map(category => (
          <div key={category}>
            <h3 className="font-semibold text-lg mb-3">{category}</h3>
            <div className="space-y-2">
              {checklist
                .filter(item => item.category === category)
                .map(item => (
                  <div 
                    key={item.id} 
                    className={`flex items-center justify-between p-3 border rounded-lg ${
                      item.critical ? 'border-blue-200 bg-blue-50/50' : ''
                    }`}
                  >
                    <div className="flex items-center gap-3 flex-1">
                      {getStatusIcon(item.status)}
                      <div className="flex-1">
                        <div className="flex items-center gap-2">
                          <span className="font-medium">{item.item}</span>
                          {item.critical && (
                            <Badge variant="outline" className="text-xs">CRITICAL</Badge>
                          )}
                        </div>
                        <p className="text-sm text-muted-foreground">{item.description}</p>
                      </div>
                    </div>
                    {getStatusBadge(item.status)}
                  </div>
                ))}
            </div>
          </div>
        ))}
      </CardContent>
    </Card>
  );
};

export default ProductionReadinessChecklist;
