
interface WelcomeNotificationData {
  clientId: string;
  phone: string;
  email: string;
  name: string;
}

class NotificationService {
  async sendWelcomeNotifications(data: WelcomeNotificationData): Promise<void> {
    console.log('Sending welcome notifications to:', data.name);
    
    // Send SMS
    if (data.phone) {
      await this.sendSMS(data.phone, `Welcome ${data.name}! Your internet service has been activated. For support, contact us.`);
    }
    
    // Send Email
    if (data.email) {
      await this.sendEmail(data.email, 'Service Activated', `Dear ${data.name}, your internet service has been successfully activated.`);
    }
  }

  private async sendSMS(phone: string, message: string): Promise<void> {
    try {
      // Integration with SMS service would go here
      console.log(`SMS sent to ${phone}: ${message}`);
    } catch (error) {
      console.error('Failed to send SMS:', error);
    }
  }

  private async sendEmail(email: string, subject: string, body: string): Promise<void> {
    try {
      // Integration with email service would go here  
      console.log(`Email sent to ${email}: ${subject}`);
    } catch (error) {
      console.error('Failed to send email:', error);
    }
  }
}

export const notificationService = new NotificationService();
