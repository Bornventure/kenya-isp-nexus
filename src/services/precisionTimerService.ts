
import { supabase } from '@/integrations/supabase/client';
import { smartRenewalService } from './smartRenewalService';

export interface TimerEvent {
  clientId: string;
  eventType: '72_hour' | '48_hour' | '24_hour' | 'expiry';
  scheduledTime: string;
  executed: boolean;
  subscriptionEndDate: string;
}

class PrecisionTimerService {
  private intervalId: NodeJS.Timeout | null = null;
  private isRunning = false;

  start(): void {
    if (this.isRunning) return;
    
    this.isRunning = true;
    console.log('Starting precision timer service...');
    
    // Check every minute for precise timing
    this.intervalId = setInterval(() => {
      this.checkScheduledEvents();
    }, 60000); // 1 minute intervals
    
    // Initial check
    this.checkScheduledEvents();
  }

  stop(): void {
    if (this.intervalId) {
      clearInterval(this.intervalId);
      this.intervalId = null;
    }
    this.isRunning = false;
    console.log('Precision timer service stopped');
  }

  private async checkScheduledEvents(): Promise<void> {
    try {
      const now = new Date();
      const tolerance = 2 * 60 * 1000; // 2-minute tolerance window
      
      // Get all active clients with upcoming renewals
      const { data: clients, error } = await supabase
        .from('clients')
        .select(`
          id, name, subscription_end_date, wallet_balance, monthly_rate,
          service_packages (name)
        `)
        .eq('status', 'active')
        .not('subscription_end_date', 'is', null);

      if (error || !clients) return;

      for (const client of clients) {
        const expiryTime = new Date(client.subscription_end_date);
        const timeDiff = expiryTime.getTime() - now.getTime();

        // Check for 72-hour reminder (3 days = 259200000 ms)
        if (this.isTimeMatch(timeDiff, 259200000, tolerance)) {
          await this.handle72HourReminder(client);
        }
        // Check for 48-hour reminder (2 days = 172800000 ms)
        else if (this.isTimeMatch(timeDiff, 172800000, tolerance)) {
          await this.handle48HourReminder(client);
        }
        // Check for 24-hour reminder (1 day = 86400000 ms)
        else if (this.isTimeMatch(timeDiff, 86400000, tolerance)) {
          await this.handle24HourReminder(client);
        }
        // Check for expiry (0 ms)
        else if (timeDiff <= 0 && timeDiff >= -tolerance) {
          await this.handleServiceExpiry(client);
        }
      }
    } catch (error) {
      console.error('Precision timer check failed:', error);
    }
  }

  private isTimeMatch(timeDiff: number, targetTime: number, tolerance: number): boolean {
    return Math.abs(timeDiff - targetTime) <= tolerance;
  }

  private async handle72HourReminder(client: any): Promise<void> {
    try {
      console.log(`72-hour reminder for client: ${client.name}`);
      
      const analysis = await smartRenewalService.analyzeClientWallet(client.id);
      if (!analysis) return;

      if (analysis.canAffordRenewal) {
        // Send standard reminder - they have enough money
        await supabase.functions.invoke('send-notifications', {
          body: {
            client_id: client.id,
            type: 'payment_reminder',
            data: {
              days_remaining: 3,
              package_name: analysis.packageName,
              amount: analysis.requiredAmount,
              sufficient_balance: true
            }
          }
        });
      } else {
        // Send targeted top-up reminder
        await smartRenewalService.sendTargetedTopUpReminder(client.id, analysis);
      }
    } catch (error) {
      console.error('72-hour reminder failed:', error);
    }
  }

  private async handle48HourReminder(client: any): Promise<void> {
    try {
      console.log(`48-hour reminder for client: ${client.name}`);
      
      const analysis = await smartRenewalService.analyzeClientWallet(client.id);
      if (!analysis) return;

      if (!analysis.canAffordRenewal) {
        // More urgent top-up reminder
        await smartRenewalService.sendTargetedTopUpReminder(client.id, analysis);
      } else {
        // Standard 48-hour reminder
        await supabase.functions.invoke('send-notifications', {
          body: {
            client_id: client.id,
            type: 'payment_reminder',
            data: {
              days_remaining: 2,
              package_name: analysis.packageName,
              amount: analysis.requiredAmount
            }
          }
        });
      }
    } catch (error) {
      console.error('48-hour reminder failed:', error);
    }
  }

  private async handle24HourReminder(client: any): Promise<void> {
    try {
      console.log(`24-hour reminder for client: ${client.name}`);
      
      const analysis = await smartRenewalService.analyzeClientWallet(client.id);
      if (!analysis) return;

      const renewalAction = await smartRenewalService.processSmartRenewal(analysis);
      
      if (renewalAction.type === 'auto_renew') {
        console.log(`Auto-renewed client ${client.name} at 24-hour mark`);
      } else {
        // Final urgent reminder
        await supabase.functions.invoke('send-notifications', {
          body: {
            client_id: client.id,
            type: 'final_reminder',
            data: {
              hours_remaining: 24,
              package_name: analysis.packageName,
              amount: analysis.requiredAmount,
              shortfall: analysis.shortfall,
              action_required: renewalAction.message
            }
          }
        });
      }
    } catch (error) {
      console.error('24-hour reminder failed:', error);
    }
  }

  private async handleServiceExpiry(client: any): Promise<void> {
    try {
      console.log(`Processing expiry for client: ${client.name}`);
      
      const analysis = await smartRenewalService.analyzeClientWallet(client.id);
      if (!analysis) return;

      const renewalAction = await smartRenewalService.processSmartRenewal(analysis);
      
      if (renewalAction.type === 'auto_renew') {
        console.log(`Auto-renewed client ${client.name} at expiry`);
      } else {
        // Suspend service and disconnect
        await this.suspendClientService(client.id);
        
        // Send disconnection notification
        await supabase.functions.invoke('send-notifications', {
          body: {
            client_id: client.id,
            type: 'service_disconnected',
            data: {
              disconnection_time: new Date().toISOString(),
              reason: 'Service expiry',
              action_required: renewalAction.message
            }
          }
        });
      }
    } catch (error) {
      console.error('Service expiry handling failed:', error);
    }
  }

  private async suspendClientService(clientId: string): Promise<void> {
    try {
      // Update client status
      await supabase
        .from('clients')
        .update({ status: 'suspended' })
        .eq('id', clientId);

      // For now, we'll log the disconnection action
      // In production, this would integrate with RADIUS/MikroTik for actual disconnection
      console.log(`Client ${clientId} service suspended and should be disconnected from network`);
    } catch (error) {
      console.error('Service suspension failed:', error);
    }
  }
}

export const precisionTimerService = new PrecisionTimerService();
