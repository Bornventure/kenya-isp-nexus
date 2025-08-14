
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { 
  CheckCircle, 
  XCircle, 
  Clock, 
  Play, 
  RefreshCw, 
  AlertCircle,
  Users,
  Wifi,
  Settings,
  Bell
} from 'lucide-react';
import { useClientOnboarding } from '@/hooks/useClientOnboarding';

interface ClientOnboardingManagerProps {
  clientId: string;
}

const ClientOnboardingManager: React.FC<ClientOnboardingManagerProps> = ({ clientId }) => {
  const { startOnboarding, isOnboarding, onboardingProgress, getOnboardingStepProgress } = useClientOnboarding();
  const [selectedEquipmentId, setSelectedEquipmentId] = useState<string>('');

  const handleStartOnboarding = async () => {
    await startOnboarding(clientId, selectedEquipmentId || undefined);
  };

  const getStepIcon = (status: string) => {
    switch (status) {
      case 'completed':
        return <CheckCircle className="h-5 w-5 text-green-500" />;
      case 'failed':
        return <XCircle className="h-5 w-5 text-red-500" />;
      case 'in_progress':
        return <RefreshCw className="h-5 w-5 text-blue-500 animate-spin" />;
      default:
        return <Clock className="h-5 w-5 text-gray-400" />;
    }
  };

  const getStepBadgeVariant = (status: string) => {
    switch (status) {
      case 'completed':
        return 'default';
      case 'failed':
        return 'destructive';
      case 'in_progress':
        return 'secondary';
      default:
        return 'outline';
    }
  };

  const progressPercentage = onboardingProgress ? getOnboardingStepProgress() : 0;

  return (
    <div className="space-y-6">
      {/* Onboarding Overview */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="flex items-center gap-2">
              <Users className="h-5 w-5" />
              Client Onboarding Manager
            </CardTitle>
            <Button
              onClick={handleStartOnboarding}
              disabled={isOnboarding}
              className="flex items-center gap-2"
            >
              {isOnboarding ? (
                <RefreshCw className="h-4 w-4 animate-spin" />
              ) : (
                <Play className="h-4 w-4" />
              )}
              {isOnboarding ? 'Processing...' : 'Start Onboarding'}
            </Button>
          </div>
        </CardHeader>

        <CardContent>
          {onboardingProgress && (
            <div className="mb-6">
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm font-medium">Overall Progress</span>
                <span className="text-sm text-muted-foreground">{progressPercentage}%</span>
              </div>
              <Progress value={progressPercentage} className="h-2" />
              
              {onboardingProgress.success && (
                <div className="mt-4 p-4 bg-green-50 border border-green-200 rounded-lg">
                  <div className="flex items-center gap-2">
                    <CheckCircle className="h-5 w-5 text-green-500" />
                    <span className="text-green-800 font-medium">
                      Onboarding Completed Successfully!
                    </span>
                  </div>
                  <p className="text-green-700 text-sm mt-1">
                    {onboardingProgress.message}
                  </p>
                </div>
              )}

              {!onboardingProgress.success && !isOnboarding && (
                <div className="mt-4 p-4 bg-red-50 border border-red-200 rounded-lg">
                  <div className="flex items-center gap-2">
                    <XCircle className="h-5 w-5 text-red-500" />
                    <span className="text-red-800 font-medium">
                      Onboarding Failed
                    </span>
                  </div>
                  <p className="text-red-700 text-sm mt-1">
                    {onboardingProgress.message}
                  </p>
                </div>
              )}
            </div>
          )}

          {!onboardingProgress && !isOnboarding && (
            <div className="text-center py-8 text-muted-foreground">
              <Users className="h-12 w-12 mx-auto mb-4 opacity-50" />
              <p className="text-lg font-medium mb-2">Ready to Onboard Client</p>
              <p className="text-sm">
                Click "Start Onboarding" to begin the automated client setup process.
                This will configure RADIUS, MikroTik, and all network services.
              </p>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Onboarding Steps */}
      {onboardingProgress && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Settings className="h-5 w-5" />
              Onboarding Steps
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {onboardingProgress.steps.map((step, index) => (
                <div key={step.id} className="flex items-center gap-4 p-4 border rounded-lg">
                  <div className="flex items-center gap-3 flex-1">
                    <div className="flex-shrink-0">
                      {getStepIcon(step.status)}
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <span className="font-medium">{step.name}</span>
                        <Badge variant={getStepBadgeVariant(step.status)}>
                          {step.status.replace('_', ' ')}
                        </Badge>
                      </div>
                      <p className="text-sm text-muted-foreground">{step.description}</p>
                      {step.error && (
                        <p className="text-sm text-red-600 mt-1">
                          <AlertCircle className="h-4 w-4 inline mr-1" />
                          {step.error}
                        </p>
                      )}
                      {step.completedAt && (
                        <p className="text-sm text-green-600 mt-1">
                          Completed: {new Date(step.completedAt).toLocaleString()}
                        </p>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Onboarding Features */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center gap-3">
              <Wifi className="h-8 w-8 text-blue-500" />
              <div>
                <h3 className="font-semibold">Network Configuration</h3>
                <p className="text-sm text-muted-foreground">
                  Automated MikroTik PPPoE and bandwidth setup
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center gap-3">
              <Users className="h-8 w-8 text-green-500" />
              <div>
                <h3 className="font-semibold">RADIUS Integration</h3>
                <p className="text-sm text-muted-foreground">
                  FreeRADIUS user creation and authentication
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center gap-3">
              <Bell className="h-8 w-8 text-purple-500" />
              <div>
                <h3 className="font-semibold">Auto Notifications</h3>
                <p className="text-sm text-muted-foreground">
                  Welcome SMS and email with connection details
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default ClientOnboardingManager;
