
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Clock, AlertTriangle } from 'lucide-react';
import { cn } from '@/lib/utils';

interface ExpiryCountdownProps {
  expiryDate: string | null;
  status: string;
}

interface TimeRemaining {
  days: number;
  hours: number;
  minutes: number;
  seconds: number;
}

const ExpiryCountdown: React.FC<ExpiryCountdownProps> = ({ expiryDate, status }) => {
  const [timeRemaining, setTimeRemaining] = useState<TimeRemaining>({ days: 0, hours: 0, minutes: 0, seconds: 0 });
  const [isExpired, setIsExpired] = useState(false);

  useEffect(() => {
    if (!expiryDate || status !== 'active') {
      setIsExpired(true);
      return;
    }

    const calculateTimeRemaining = () => {
      const now = new Date().getTime();
      const expiry = new Date(expiryDate).getTime();
      const difference = expiry - now;

      if (difference <= 0) {
        setIsExpired(true);
        setTimeRemaining({ days: 0, hours: 0, minutes: 0, seconds: 0 });
        return;
      }

      const days = Math.floor(difference / (1000 * 60 * 60 * 24));
      const hours = Math.floor((difference % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
      const minutes = Math.floor((difference % (1000 * 60 * 60)) / (1000 * 60));
      const seconds = Math.floor((difference % (1000 * 60)) / 1000);

      setTimeRemaining({ days, hours, minutes, seconds });
      setIsExpired(false);
    };

    calculateTimeRemaining();
    const interval = setInterval(calculateTimeRemaining, 1000);

    return () => clearInterval(interval);
  }, [expiryDate, status]);

  const getUrgencyLevel = () => {
    if (isExpired) return 'expired';
    if (timeRemaining.days <= 1) return 'critical';
    if (timeRemaining.days <= 3) return 'warning';
    return 'normal';
  };

  const urgencyLevel = getUrgencyLevel();

  const getCardColor = () => {
    switch (urgencyLevel) {
      case 'expired': return 'border-red-500 bg-red-50';
      case 'critical': return 'border-red-400 bg-red-50';
      case 'warning': return 'border-yellow-400 bg-yellow-50';
      default: return 'border-green-400 bg-green-50';
    }
  };

  const getTextColor = () => {
    switch (urgencyLevel) {
      case 'expired': return 'text-red-700';
      case 'critical': return 'text-red-600';
      case 'warning': return 'text-yellow-700';
      default: return 'text-green-700';
    }
  };

  if (status !== 'active') {
    return (
      <Card className="border-gray-400 bg-gray-50">
        <CardHeader className="pb-3">
          <CardTitle className="flex items-center gap-2 text-gray-700">
            <AlertTriangle className="h-5 w-5" />
            Service Status
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-gray-600">
            {status === 'suspended' ? 'Service is suspended. Please make a payment to reactivate.' :
             status === 'pending' ? 'Service is pending activation. Please contact support.' :
             'Service is not active.'}
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className={cn('border-2', getCardColor())}>
      <CardHeader className="pb-3">
        <CardTitle className={cn('flex items-center gap-2', getTextColor())}>
          <Clock className="h-5 w-5" />
          {isExpired ? 'Service Expired' : 'Service Expiry'}
        </CardTitle>
      </CardHeader>
      <CardContent>
        {isExpired ? (
          <div className={getTextColor()}>
            <p className="font-semibold">Your service has expired</p>
            <p className="text-sm mt-1">Please renew to continue using the service</p>
          </div>
        ) : (
          <div className={getTextColor()}>
            <div className="grid grid-cols-4 gap-2 text-center">
              <div>
                <div className="text-2xl font-bold">{timeRemaining.days}</div>
                <div className="text-xs">Days</div>
              </div>
              <div>
                <div className="text-2xl font-bold">{timeRemaining.hours}</div>
                <div className="text-xs">Hours</div>
              </div>
              <div>
                <div className="text-2xl font-bold">{timeRemaining.minutes}</div>
                <div className="text-xs">Minutes</div>
              </div>
              <div>
                <div className="text-2xl font-bold">{timeRemaining.seconds}</div>
                <div className="text-xs">Seconds</div>
              </div>
            </div>
            {urgencyLevel === 'critical' && (
              <p className="text-sm mt-3 font-medium">⚠️ Service expires soon! Please renew immediately.</p>
            )}
            {urgencyLevel === 'warning' && (
              <p className="text-sm mt-3">⏰ Your service expires in {timeRemaining.days} days.</p>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default ExpiryCountdown;
