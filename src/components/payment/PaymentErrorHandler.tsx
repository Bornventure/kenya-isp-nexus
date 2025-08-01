
import React from 'react';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Button } from '@/components/ui/button';
import { AlertCircle, RefreshCw, MessageCircle } from 'lucide-react';

interface PaymentErrorHandlerProps {
  error?: string | null;
  onRetry?: () => void;
  onContactSupport?: () => void;
  isRetrying?: boolean;
}

const PaymentErrorHandler: React.FC<PaymentErrorHandlerProps> = ({
  error,
  onRetry,
  onContactSupport,
  isRetrying = false
}) => {
  if (!error) return null;

  const getErrorMessage = (error: string) => {
    if (error.includes('500')) {
      return {
        title: "Payment Processing Issue",
        message: "Your payment was successful, but there was a temporary issue updating your account. Please check your wallet balance. If it doesn't reflect your payment, contact support.",
        canRetry: false
      };
    }
    
    if (error.includes('timeout') || error.includes('Timeout')) {
      return {
        title: "Payment Timeout",
        message: "The payment is taking longer than expected. It may still be processing. Please check your wallet balance in a few minutes.",
        canRetry: true
      };
    }

    if (error.includes('network') || error.includes('Network')) {
      return {
        title: "Connection Issue",
        message: "There was a network issue while processing your payment. Please try again.",
        canRetry: true
      };
    }

    return {
      title: "Payment Error",
      message: error,
      canRetry: true
    };
  };

  const { title, message, canRetry } = getErrorMessage(error);

  return (
    <Alert variant="destructive" className="my-4">
      <AlertCircle className="h-4 w-4" />
      <AlertTitle>{title}</AlertTitle>
      <AlertDescription className="mt-2">
        {message}
        <div className="flex gap-2 mt-3">
          {canRetry && onRetry && (
            <Button
              variant="outline"
              size="sm"
              onClick={onRetry}
              disabled={isRetrying}
            >
              <RefreshCw className={`h-4 w-4 mr-2 ${isRetrying ? 'animate-spin' : ''}`} />
              {isRetrying ? 'Retrying...' : 'Try Again'}
            </Button>
          )}
          {onContactSupport && (
            <Button
              variant="outline"
              size="sm"
              onClick={onContactSupport}
            >
              <MessageCircle className="h-4 w-4 mr-2" />
              Contact Support
            </Button>
          )}
        </div>
      </AlertDescription>
    </Alert>
  );
};

export default PaymentErrorHandler;
