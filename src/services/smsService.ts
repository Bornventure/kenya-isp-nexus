
interface SMSConfig {
  url: string;
  apiKey: string;
  partnerId: string;
  shortcode: string;
}

const SMS_CONFIG: SMSConfig = {
  url: 'https://isms.celcomafrica.com/api/services/sendsms',
  apiKey: '3230abd57d39aa89fc407618f3faaacc',
  partnerId: '800',
  shortcode: 'LAKELINK'
};

export const sendSMS = async (phoneNumber: string, message: string): Promise<boolean> => {
  try {
    console.log('Sending SMS to:', phoneNumber, 'Message:', message);

    // Format phone number to international format
    let formattedPhone = phoneNumber;
    if (formattedPhone.startsWith('0')) {
      formattedPhone = '+254' + formattedPhone.substring(1);
    } else if (formattedPhone.startsWith('254')) {
      formattedPhone = '+' + formattedPhone;
    } else if (!formattedPhone.startsWith('+254')) {
      formattedPhone = '+254' + formattedPhone;
    }

    const payload = {
      apikey: SMS_CONFIG.apiKey,
      partnerID: SMS_CONFIG.partnerId,
      shortcode: SMS_CONFIG.shortcode,
      mobile: formattedPhone,
      message: message
    };

    console.log('SMS Payload:', payload);

    const response = await fetch(SMS_CONFIG.url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(payload),
    });

    const result = await response.json();
    console.log('SMS Response:', result);

    if (response.ok && result.success) {
      console.log('SMS sent successfully');
      return true;
    } else {
      console.error('SMS sending failed:', result);
      return false;
    }
  } catch (error) {
    console.error('Error sending SMS:', error);
    return false;
  }
};

// Send client registration SMS
export const sendClientRegistrationSMS = async (
  phoneNumber: string, 
  clientName: string, 
  packageName: string
): Promise<boolean> => {
  const message = `Welcome to LAKELINK, ${clientName}! Your ${packageName} service registration has been received and is being processed. We'll contact you soon for installation. Thank you for choosing LAKELINK!`;
  return sendSMS(phoneNumber, message);
};

// Send service activation SMS
export const sendServiceActivationSMS = async (
  phoneNumber: string, 
  clientName: string, 
  packageName: string
): Promise<boolean> => {
  const message = `Hello ${clientName}, your ${packageName} service has been activated! Welcome to LAKELINK high-speed internet. For support, contact our team. Enjoy your connection!`;
  return sendSMS(phoneNumber, message);
};

// Send payment confirmation SMS
export const sendPaymentConfirmationSMS = async (
  phoneNumber: string, 
  amount: number, 
  reference: string
): Promise<boolean> => {
  const message = `Payment of KES ${amount.toFixed(2)} received successfully. Reference: ${reference}. Thank you for your payment to LAKELINK!`;
  return sendSMS(phoneNumber, message);
};

// Send service suspension SMS
export const sendServiceSuspensionSMS = async (
  phoneNumber: string, 
  clientName: string, 
  reason: string
): Promise<boolean> => {
  const message = `Hello ${clientName}, your LAKELINK service has been suspended. Reason: ${reason}. Please contact our support team to restore your service.`;
  return sendSMS(phoneNumber, message);
};

// Send OTP SMS
export const sendOTPSMS = async (phoneNumber: string, otp: string): Promise<boolean> => {
  const message = `Your LAKELINK verification code is: ${otp}. This code expires in 10 minutes. Do not share this code with anyone.`;
  return sendSMS(phoneNumber, message);
};
