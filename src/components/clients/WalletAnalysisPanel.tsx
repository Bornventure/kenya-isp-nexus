
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { useFullAutomation } from '@/hooks/useFullAutomation';
import { Wallet, Clock, AlertTriangle, CheckCircle, RefreshCw } from 'lucide-react';

interface WalletAnalysisPanelProps {
  clientId: string;
  onRefresh?: () => void;
}

const WalletAnalysisPanel: React.FC<WalletAnalysisPanelProps> = ({ clientId, onRefresh }) => {
  const { analyzeClientWalletStatus, processSmartRenewalForClient } = useFullAutomation();
  const [analysis, setAnalysis] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);

  const handleAnalyze = async () => {
    setIsLoading(true);
    try {
      const result = await analyzeClientWalletStatus(clientId);
      setAnalysis(result);
    } catch (error) {
      console.error('Analysis failed:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSmartRenewal = async () => {
    setIsProcessing(true);
    try {
      await processSmartRenewalForClient(clientId);
      await handleAnalyze(); // Refresh analysis
      onRefresh?.();
    } catch (error) {
      console.error('Smart renewal failed:', error);
    } finally {
      setIsProcessing(false);
    }
  };

  const getStatusIcon = (type: string) => {
    switch (type) {
      case 'auto_renew':
        return <CheckCircle className="h-4 w-4 text-green-500" />;
      case 'partial_payment':
        return <Clock className="h-4 w-4 text-yellow-500" />;
      case 'top_up_required':
        return <AlertTriangle className="h-4 w-4 text-orange-500" />;
      case 'suspend_service':
        return <AlertTriangle className="h-4 w-4 text-red-500" />;
      default:
        return <Wallet className="h-4 w-4 text-blue-500" />;
    }
  };

  const getStatusColor = (type: string) => {
    switch (type) {
      case 'auto_renew':
        return 'bg-green-100 text-green-800';
      case 'partial_payment':
        return 'bg-yellow-100 text-yellow-800';
      case 'top_up_required':
        return 'bg-orange-100 text-orange-800';
      case 'suspend_service':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-blue-100 text-blue-800';
    }
  };

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle className="flex items-center gap-2">
          <Wallet className="h-5 w-5" />
          Wallet Analysis & Smart Renewal
        </CardTitle>
        <Button 
          variant="outline" 
          size="sm" 
          onClick={handleAnalyze}
          disabled={isLoading}
        >
          {isLoading ? <RefreshCw className="h-4 w-4 animate-spin" /> : 'Analyze'}
        </Button>
      </CardHeader>
      
      <CardContent className="space-y-4">
        {analysis ? (
          <>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <div className="text-sm text-muted-foreground">Current Balance</div>
                <div className="text-lg font-semibold text-green-600">
                  KES {analysis.analysis.currentBalance.toFixed(2)}
                </div>
              </div>
              
              <div className="space-y-2">
                <div className="text-sm text-muted-foreground">Required Amount</div>
                <div className="text-lg font-semibold">
                  KES {analysis.analysis.requiredAmount.toFixed(2)}
                </div>
              </div>
            </div>

            {analysis.analysis.shortfall > 0 && (
              <div className="space-y-2">
                <div className="text-sm text-muted-foreground">Shortfall</div>
                <div className="text-lg font-semibold text-red-600">
                  KES {analysis.analysis.shortfall.toFixed(2)}
                </div>
                <Progress 
                  value={(analysis.analysis.currentBalance / analysis.analysis.requiredAmount) * 100} 
                  className="h-2"
                />
              </div>
            )}

            <div className="space-y-2">
              <div className="text-sm text-muted-foreground">Days Until Expiry</div>
              <div className="flex items-center gap-2">
                <Badge variant={analysis.analysis.daysUntilExpiry <= 1 ? 'destructive' : 'secondary'}>
                  {analysis.analysis.daysUntilExpiry} days
                </Badge>
                <span className="text-sm text-muted-foreground">
                  ({analysis.analysis.packageName})
                </span>
              </div>
            </div>

            <div className="p-3 border rounded-lg">
              <div className="flex items-start gap-3">
                {getStatusIcon(analysis.recommendedAction.type)}
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-1">
                    <span className="font-medium">Recommended Action</span>
                    <Badge className={getStatusColor(analysis.recommendedAction.type)}>
                      {analysis.recommendedAction.type.replace('_', ' ').toUpperCase()}
                    </Badge>
                  </div>
                  <p className="text-sm text-muted-foreground">
                    {analysis.recommendedAction.message}
                  </p>
                  {analysis.recommendedAction.amount && (
                    <p className="text-xs text-muted-foreground mt-1">
                      Amount: KES {analysis.recommendedAction.amount.toFixed(2)}
                    </p>
                  )}
                </div>
              </div>
            </div>

            <Button 
              onClick={handleSmartRenewal}
              disabled={isProcessing}
              className="w-full gap-2"
            >
              {isProcessing && <RefreshCw className="h-4 w-4 animate-spin" />}
              {isProcessing ? 'Processing...' : 'Execute Smart Renewal'}
            </Button>
          </>
        ) : (
          <div className="text-center py-8 text-muted-foreground">
            Click "Analyze" to check wallet status and renewal options
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default WalletAnalysisPanel;
