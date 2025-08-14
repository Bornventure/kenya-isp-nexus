
import { supabase } from '@/integrations/supabase/client';

export interface SMSNotification {
  client_id: string;
  phone: string;
  message: string;
  type: 'registration' | 'payment_confirmation' | 'service_activation' | 'payment_reminder' | 'service_suspension' | 'network_maintenance' | 'test';
  client_name?: string;
}

class SMSService {
  private readonly apiUrl = 'https://isms.celcomafrica.com/api/services/sendsms';
  private readonly apiKey = '3230abd57d39aa89fc407618f3faaacc';
  private readonly partnerId = '800';
  private readonly shortcode = 'LAKELINK';

  async sendSMS(notification: SMSNotification): Promise<{ success: boolean; message?: string; error?: string }> {
    try {
      console.log('Sending SMS via Celcomafrica:', {
        phone: notification.phone,
        type: notification.type,
        message: notification.message.substring(0, 50) + '...'
      });

      const { data, error } = await supabase.functions.invoke('send-sms-celcomafrica', {
        body: {
          phone: notification.phone,
          message: notification.message,
          client_id: notification.client_id,
          type: notification.type
        }
      });

      if (error) {
        console.error('SMS sending failed:', error);
        return {
          success: false,
          error: error.message || 'Failed to send SMS'
        };
      }

      if (data.success) {
        console.log('SMS sent successfully:', data);
        return {
          success: true,
          message: 'SMS sent successfully'
        };
      } else {
        console.error('SMS API returned error:', data);
        return {
          success: false,
          error: data.error || 'SMS service returned an error'
        };
      }
    } catch (error) {
      console.error('SMS service error:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error occurred'
      };
    }
  }

  // Message templates
  generateRegistrationMessage(clientName: string, clientId: string): string {
    return `Dear ${clientName}, welcome to our ISP! Your registration (ID: ${clientId}) has been received and is under review. You will receive a confirmation SMS once approved. Thank you for choosing us!`;
  }

  generatePaymentConfirmationMessage(clientName: string, amount: number, receiptNumber: string): string {
    return `Dear ${clientName}, your payment of KES ${amount.toLocaleString()} has been received successfully. Receipt: ${receiptNumber}. Your service will be activated shortly. Thank you!`;
  }

  generateServiceActivationMessage(clientName: string, packageName: string, expiryDate: string): string {
    return `Dear ${clientName}, your internet service (${packageName}) has been successfully activated. Service valid until ${expiryDate}. Welcome to our network!`;
  }

  generatePaymentReminderMessage(clientName: string, amount: number, daysRemaining: number): string {
    return `Dear ${clientName}, your internet service expires in ${daysRemaining} days. Please pay KES ${amount.toLocaleString()} to continue enjoying our service. Pay via M-PESA Paybill 522522, Account: ${clientName.replace(/\s+/g, '').toUpperCase()}.`;
  }

  generateServiceSuspensionMessage(clientName: string, amount: number): string {
    return `Dear ${clientName}, your internet service has been suspended due to non-payment. Please pay KES ${amount.toLocaleString()} to reactivate your service immediately. Contact our support team for assistance.`;
  }

  generateNetworkMaintenanceMessage(clientName: string, maintenanceDate: string, startTime: string, endTime: string): string {
    return `Dear ${clientName}, scheduled network maintenance on ${maintenanceDate} from ${startTime} to ${endTime}. Internet service may be interrupted during this time. We apologize for any inconvenience.`;
  }

  // Convenience methods for different notification types
  async sendRegistrationSMS(clientId: string, clientName: string, phone: string): Promise<{ success: boolean; message?: string; error?: string }> {
    const message = this.generateRegistrationMessage(clientName, clientId);
    return this.sendSMS({
      client_id: clientId,
      phone,
      message,
      type: 'registration',
      client_name: clientName
    });
  }

  async sendPaymentConfirmationSMS(clientId: string, clientName: string, phone: string, amount: number, receiptNumber: string): Promise<{ success: boolean; message?: string; error?: string }> {
    const message = this.generatePaymentConfirmationMessage(clientName, amount, receiptNumber);
    return this.sendSMS({
      client_id: clientId,
      phone,
      message,
      type: 'payment_confirmation',
      client_name: clientName
    });
  }

  async sendServiceActivationSMS(clientId: string, clientName: string, phone: string, packageName: string, expiryDate: string): Promise<{ success: boolean; message?: string; error?: string }> {
    const message = this.generateServiceActivationMessage(clientName, packageName, expiryDate);
    return this.sendSMS({
      client_id: clientId,
      phone,
      message,
      type: 'service_activation',
      client_name: clientName
    });
  }

  async sendPaymentReminderSMS(clientId: string, clientName: string, phone: string, amount: number, daysRemaining: number): Promise<{ success: boolean; message?: string; error?: string }> {
    const message = this.generatePaymentReminderMessage(clientName, amount, daysRemaining);
    return this.sendSMS({
      client_id: clientId,
      phone,
      message,
      type: 'payment_reminder',
      client_name: clientName
    });
  }

  async sendServiceSuspensionSMS(clientId: string, clientName: string, phone: string, amount: number): Promise<{ success: boolean; message?: string; error?: string }> {
    const message = this.generateServiceSuspensionMessage(clientName, amount);
    return this.sendSMS({
      client_id: clientId,
      phone,
      message,
      type: 'service_suspension',
      client_name: clientName
    });
  }

  async sendNetworkMaintenanceSMS(clientId: string, clientName: string, phone: string, maintenanceDate: string, startTime: string, endTime: string): Promise<{ success: boolean; message?: string; error?: string }> {
    const message = this.generateNetworkMaintenanceMessage(clientName, maintenanceDate, startTime, endTime);
    return this.sendSMS({
      client_id: clientId,
      phone,
      message,
      type: 'network_maintenance',
      client_name: clientName
    });
  }

  async sendTestSMS(phone: string): Promise<{ success: boolean; message?: string; error?: string }> {
    return this.sendSMS({
      client_id: 'test',
      phone,
      message: 'Test SMS from ISP Management System. SMS integration is working properly!',
      type: 'test'
    });
  }
}

export const smsService = new SMSService();
