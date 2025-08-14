
import { supabase } from '@/integrations/supabase/client';

export class SmsService {
  async sendSMS(phone: string, message: string): Promise<boolean> {
    try {
      console.log('Sending SMS to:', phone, 'Message:', message);

      // Call the send-sms edge function
      const { data, error } = await supabase.functions.invoke('send-sms', {
        body: {
          phone,
          message
        }
      });

      if (error) {
        console.error('SMS sending error:', error);
        return false;
      }

      console.log('SMS sent successfully:', data);
      return true;
    } catch (error) {
      console.error('Error in SMS service:', error);
      return false;
    }
  }

  async sendWelcomeSMS(phone: string, name: string): Promise<boolean> {
    const message = `Welcome ${name}! Your ISP account has been created successfully. Thank you for choosing our services.`;
    return this.sendSMS(phone, message);
  }

  async sendStatusUpdateSMS(phone: string, name: string, status: string): Promise<boolean> {
    const message = `Hello ${name}, your service status has been updated to: ${status.toUpperCase()}. Contact support for assistance.`;
    return this.sendSMS(phone, message);
  }

  async sendPaymentConfirmationSMS(phone: string, name: string, amount: number, reference: string): Promise<boolean> {
    const message = `Hello ${name}, payment of KES ${amount} received successfully. Reference: ${reference}. Thank you!`;
    return this.sendSMS(phone, message);
  }

  async sendServiceExpiryReminderSMS(phone: string, name: string, daysLeft: number): Promise<boolean> {
    const message = `Hello ${name}, your internet service expires in ${daysLeft} days. Please renew to avoid service interruption.`;
    return this.sendSMS(phone, message);
  }
}

export const smsService = new SmsService();
export const sendSMS = (phone: string, message: string) => smsService.sendSMS(phone, message);
