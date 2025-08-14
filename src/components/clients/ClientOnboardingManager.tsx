
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Separator } from '@/components/ui/separator';
import { 
  CheckCircle, 
  XCircle, 
  Clock, 
  Play, 
  User, 
  Wifi, 
  Shield, 
  Monitor,
  Zap,
  Bell,
  Settings
} from 'lucide-react';
import { useClientOnboarding } from '@/hooks/useClientOnboarding';
import type { OnboardingStep } from '@/services/clientOnboardingService';

interface ClientOnboardingManagerProps {
  clientId: string;
  clientName: string;
  onComplete?: () => void;
}

const ClientOnboardingManager: React.FC<ClientOnboardingManagerProps> = ({
  clientId,
  clientName,
  onComplete
}) => {
  const { startOnboarding, isOnboarding, onboardingProgress, getOnboardingStepProgress } = useClientOnboarding();
  const [showDetails, setShowDetails] = useState(false);

  const handleStartOnboarding = async () => {
    try {
      const result = await startOnboarding(clientId);
      if (result?.success && onComplete) {
        onComplete();
      }
    } catch (error) {
      console.error('Onboarding failed:', error);
    }
  };

  const getStepIcon = (step: OnboardingStep) => {
    switch (step.status) {
      case 'completed':
        return <CheckCircle className="h-5 w-5 text-green-500" />;
      case 'failed':
        return <XCircle className="h-5 w-5 text-red-500" />;
      case 'in_progress':
        return <Clock className="h-5 w-5 text-blue-500 animate-spin" />;
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

  const getFeatureIcon = (stepName: string) => {
    if (stepName.includes('Client')) return <User className="h-4 w-4" />;
    if (stepName.includes('Equipment')) return <Settings className="h-4 w-4" />;
    if (stepName.includes('RADIUS')) return <Shield className="h-4 w-4" />;
    if (stepName.includes('PPPoE')) return <Wifi className="h-4 w-4" />;
    if (stepName.includes('Bandwidth')) return <Zap className="h-4 w-4" />;
    if (stepName.includes('Monitoring')) return <Monitor className="h-4 w-4" />;
    if (stepName.includes('Notification')) return <Bell className="h-4 w-4" />;
    return <Settings className="h-4 w-4" />;
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            <span className="flex items-center gap-2">
              <Play className="h-5 w-5" />
              Client Onboarding - {clientName}
            </span>
            <Button
              onClick={handleStartOnboarding}
              disabled={isOnboarding}
              className="gap-2"
            >
              {isOnboarding ? (
                <>
                  <Clock className="h-4 w-4 animate-spin" />
                  Processing...
                </>
              ) : (
                <>
                  <Play className="h-4 w-4" />
                  Start Onboarding
                </>
              )}
            </Button>
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {onboardingProgress && (
            <>
              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span>Overall Progress</span>
                  <span>{getOnboardingStepProgress()}%</span>
                </div>
                <Progress value={getOnboardingStepProgress()} className="w-full" />
              </div>

              <Alert>
                <AlertDescription>
                  {onboardingProgress.success ? (
                    <span className="text-green-600 font-medium">
                      ✅ Onboarding completed successfully! All systems are operational.
                    </span>
                  ) : (
                    <span className="text-blue-600">
                      🔄 {onboardingProgress.message}
                    </span>
                  )}
                </AlertDescription>
              </Alert>

              <div className="flex justify-between items-center">
                <h3 className="text-lg font-semibold">Onboarding Steps</h3>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setShowDetails(!showDetails)}
                >
                  {showDetails ? 'Hide Details' : 'Show Details'}
                </Button>
              </div>

              <div className="space-y-3">
                {onboardingProgress.steps.map((step, index) => (
                  <div key={index} className="border rounded-lg p-4">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        {getFeatureIcon(step.name)}
                        {getStepIcon(step)}
                        <span className="font-medium">{step.name}</span>
                      </div>
                      <Badge variant={getStepBadgeVariant(step.status)}>
                        {step.status.replace('_', ' ').toUpperCase()}
                      </Badge>
                    </div>

                    {step.error && (
                      <Alert className="mt-2">
                        <XCircle className="h-4 w-4" />
                        <AlertDescription className="text-red-600">
                          Error: {step.error}
                        </AlertDescription>
                      </Alert>
                    )}

                    {showDetails && step.details && (
                      <div className="mt-3 p-3 bg-gray-50 rounded-md">
                        <h4 className="font-medium text-sm mb-2">Step Details:</h4>
                        <pre className="text-xs text-gray-600 whitespace-pre-wrap">
                          {JSON.stringify(step.details, null, 2)}
                        </pre>
                      </div>
                    )}
                  </div>
                ))}
              </div>

              {onboardingProgress.success && onboardingProgress.clientCredentials && (
                <>
                  <Separator />
                  <Card className="bg-green-50 border-green-200">
                    <CardHeader>
                      <CardTitle className="text-green-800 flex items-center gap-2">
                        <CheckCircle className="h-5 w-5" />
                        Client Credentials Generated
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-2">
                      <div className="grid grid-cols-2 gap-4 text-sm">
                        <div>
                          <span className="font-medium">Username:</span>
                          <p className="text-green-700 font-mono">
                            {onboardingProgress.clientCredentials.username}
                          </p>
                        </div>
                        <div>
                          <span className="font-medium">Password:</span>
                          <p className="text-green-700 font-mono">
                            {onboardingProgress.clientCredentials.password}
                          </p>
                        </div>
                        <div>
                          <span className="font-medium">Profile:</span>
                          <p className="text-green-700 font-mono">
                            {onboardingProgress.clientCredentials.profileName}
                          </p>
                        </div>
                      </div>
                      <Alert>
                        <AlertDescription className="text-green-800">
                          These credentials have been automatically configured in your MikroTik router and FreeRADIUS server. 
                          The client can now connect using PPPoE with these credentials.
                        </AlertDescription>
                      </Alert>
                    </CardContent>
                  </Card>
                </>
              )}
            </>
          )}

          {!onboardingProgress && !isOnboarding && (
            <Alert>
              <AlertDescription>
                Ready to start comprehensive client onboarding. This process will:
                <ul className="list-disc list-inside mt-2 space-y-1">
                  <li>Validate client data and service package</li>
                  <li>Assign and configure network equipment</li>
                  <li>Create FreeRADIUS user account with proper attributes</li>
                  <li>Configure MikroTik PPPoE secret and bandwidth limits</li>
                  <li>Setup firewall rules and network monitoring</li>
                  <li>Test connectivity and activate service</li>
                  <li>Send welcome notifications via SMS and email</li>
                </ul>
              </AlertDescription>
            </Alert>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default ClientOnboardingManager;
