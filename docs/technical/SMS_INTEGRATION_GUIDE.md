
# ISP Management System - SMS Integration Guide

## Table of Contents
1. [Overview](#overview)
2. [Celcomafrica SMS Integration](#celcomafrica-sms-integration)
3. [Configuration and Setup](#configuration-and-setup)
4. [API Implementation](#api-implementation)
5. [Testing and Validation](#testing-and-validation)
6. [Message Templates](#message-templates)
7. [Error Handling](#error-handling)
8. [Monitoring and Analytics](#monitoring-and-analytics)

## Overview

The ISP Management System uses Celcomafrica SMS gateway for sending automated SMS notifications to clients. This integration provides reliable SMS delivery for payment confirmations, service notifications, and support communications.

### Key Features
- Automated SMS notifications
- Payment confirmations
- Service reminders
- Support ticket updates
- Bulk messaging capabilities
- Delivery status tracking

## Celcomafrica SMS Integration

### Service Configuration
- **Provider**: Celcomafrica
- **API URL**: https://isms.celcomafrica.com/api/services/sendsms
- **API Key**: 3230abd57d39aa89fc407618f3faaacc
- **Partner ID**: 800
- **Shortcode**: LAKELINK

### API Specifications
- **Method**: POST
- **Content-Type**: application/json
- **Authentication**: API Key based
- **Rate Limit**: 100 SMS per minute
- **Character Limit**: 160 characters per SMS

### Message Types
1. **Payment Confirmations**: Successful payment notifications
2. **Service Reminders**: Payment due reminders
3. **Service Notifications**: Service activation/suspension
4. **Support Alerts**: Ticket updates and resolutions
5. **Bulk Messages**: Marketing and announcements

## Configuration and Setup

### Environment Variables
Set up the following environment variables in Supabase Edge Functions:

```env
CELCOMAFRICA_API_KEY=3230abd57d39aa89fc407618f3faaacc
CELCOMAFRICA_PARTNER_ID=800
CELCOMAFRICA_SHORTCODE=LAKELINK
CELCOMAFRICA_API_URL=https://isms.celcomafrica.com/api/services/sendsms
```

### SMS Service Configuration
1. **Access SMS Settings**
   - Navigate to **Settings** → **SMS Configuration**
   - Select **Celcomafrica** as SMS provider
   - Enter API credentials

2. **Test Configuration**
   - Send test SMS to verify setup
   - Check delivery status
   - Verify message formatting

## API Implementation

### Edge Function Implementation
The SMS service is implemented as a Supabase Edge Function:

```typescript
// supabase/functions/send-sms-celcomafrica/index.ts
import { serve } from "https://deno.land/std@0.168.0/http/server.ts"

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

interface SMSRequest {
  phone: string
  message: string
  client_id?: string
  type?: string
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    const { phone, message, client_id, type }: SMSRequest = await req.json()

    // Celcomafrica SMS API configuration
    const apiKey = Deno.env.get('CELCOMAFRICA_API_KEY')
    const partnerId = Deno.env.get('CELCOMAFRICA_PARTNER_ID')
    const shortcode = Deno.env.get('CELCOMAFRICA_SHORTCODE')
    const apiUrl = 'https://isms.celcomafrica.com/api/services/sendsms'

    // Format phone number (ensure it starts with 254)
    let formattedPhone = phone.replace(/\D/g, '')
    if (formattedPhone.startsWith('0')) {
      formattedPhone = '254' + formattedPhone.substring(1)
    } else if (formattedPhone.startsWith('7') || formattedPhone.startsWith('1')) {
      formattedPhone = '254' + formattedPhone
    }

    // Prepare SMS payload
    const smsPayload = {
      apikey: apiKey,
      partnerID: partnerId,
      message: message,
      shortcode: shortcode,
      mobile: formattedPhone
    }

    // Send SMS via Celcomafrica API
    const response = await fetch(apiUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(smsPayload),
    })

    const result = await response.json()

    if (result.success || result.status === 'success' || response.ok) {
      return new Response(
        JSON.stringify({
          success: true,
          message: 'SMS sent successfully',
          messageId: result.messageId || result.id,
          response: result
        }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    } else {
      return new Response(
        JSON.stringify({
          success: false,
          error: result.message || 'Failed to send SMS',
          response: result
        }),
        { 
          status: 400,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        }
      )
    }

  } catch (error) {
    return new Response(
      JSON.stringify({
        success: false,
        error: error.message || 'Internal server error'
      }),
      { 
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      }
    )
  }
})
```

### Frontend Integration
Call the SMS service from your React components:

```typescript
// Send SMS notification
const sendSMSNotification = async (phone: string, message: string) => {
  try {
    const { data, error } = await supabase.functions.invoke('send-sms-celcomafrica', {
      body: {
        phone,
        message,
        type: 'notification'
      }
    })

    if (error) {
      console.error('SMS sending failed:', error)
      return false
    }

    console.log('SMS sent successfully:', data)
    return true
  } catch (error) {
    console.error('SMS error:', error)
    return false
  }
}
```

## Testing and Validation

### Test SMS Sending
1. **Test API Endpoint**
   ```bash
   curl -X POST https://ddljuawonxdnesrnclsx.supabase.co/functions/v1/send-sms-celcomafrica \
     -H "Authorization: Bearer YOUR_ANON_KEY" \
     -H "Content-Type: application/json" \
     -d '{
       "phone": "+254700123456",
       "message": "Test message from ISP Management System",
       "type": "test"
     }'
   ```

2. **Expected Response**
   ```json
   {
     "success": true,
     "message": "SMS sent successfully",
     "messageId": "MSG123456789",
     "response": {
       "status": "success",
       "messageId": "MSG123456789"
     }
   }
   ```

### Validation Checklist
- [ ] API credentials are correct
- [ ] Phone number formatting works
- [ ] Message content is within limits
- [ ] Delivery status is tracked
- [ ] Error handling works properly
- [ ] Rate limiting is respected

## Message Templates

### Payment Confirmation Template
```
Dear {CLIENT_NAME}, your payment of KES {AMOUNT} has been received successfully. Receipt: {RECEIPT_NUMBER}. Your service is now active until {EXPIRY_DATE}. Thank you!
```

### Payment Reminder Template
```
Dear {CLIENT_NAME}, your internet service expires in {DAYS} days. Please pay KES {AMOUNT} via M-PESA Paybill {PAYBILL_NUMBER}, Account: {ACCOUNT_NUMBER}. Thank you!
```

### Service Activation Template
```
Dear {CLIENT_NAME}, your internet service has been successfully activated. Your subscription is valid until {EXPIRY_DATE}. Welcome to our network!
```

### Service Suspension Template
```
Dear {CLIENT_NAME}, your internet service has been suspended due to non-payment. Please pay KES {AMOUNT} to reactivate your service. Contact support for assistance.
```

### Support Ticket Template
```
Dear {CLIENT_NAME}, your support ticket #{TICKET_NUMBER} has been {STATUS}. {MESSAGE}. Contact support at {SUPPORT_NUMBER} for assistance.
```

### Template Variables
- `{CLIENT_NAME}`: Customer name
- `{AMOUNT}`: Payment amount
- `{RECEIPT_NUMBER}`: Payment receipt number
- `{EXPIRY_DATE}`: Service expiry date
- `{DAYS}`: Days until expiry
- `{PAYBILL_NUMBER}`: M-PESA paybill number
- `{ACCOUNT_NUMBER}`: Client account number
- `{TICKET_NUMBER}`: Support ticket number
- `{STATUS}`: Ticket status
- `{MESSAGE}`: Custom message
- `{SUPPORT_NUMBER}`: Support contact number

## Error Handling

### Common Error Responses
1. **Invalid Phone Number**
   ```json
   {
     "success": false,
     "error": "Invalid phone number format",
     "code": "INVALID_PHONE"
   }
   ```

2. **Insufficient Balance**
   ```json
   {
     "success": false,
     "error": "Insufficient SMS credits",
     "code": "INSUFFICIENT_BALANCE"
   }
   ```

3. **API Rate Limit**
   ```json
   {
     "success": false,
     "error": "Rate limit exceeded",
     "code": "RATE_LIMIT_EXCEEDED"
   }
   ```

4. **Network Error**
   ```json
   {
     "success": false,
     "error": "Network timeout",
     "code": "NETWORK_ERROR"
   }
   ```

### Error Handling Strategy
1. **Retry Logic**: Automatic retries for network errors
2. **Fallback Options**: Alternative SMS providers
3. **Error Logging**: Comprehensive error tracking
4. **User Notification**: Inform users of delivery failures
5. **Manual Intervention**: Queue for manual processing

### Error Resolution
1. **Check API Credentials**: Verify API key and partner ID
2. **Validate Phone Numbers**: Ensure correct format
3. **Check Account Balance**: Verify SMS credits
4. **Monitor API Status**: Check service availability
5. **Review Error Logs**: Identify patterns and issues

## Monitoring and Analytics

### SMS Delivery Tracking
1. **Delivery Reports**: Track message delivery status
2. **Failure Analysis**: Identify failed deliveries
3. **Performance Metrics**: Monitor delivery times
4. **Cost Analysis**: Track SMS usage and costs

### Analytics Dashboard
1. **Daily SMS Volume**: Messages sent per day
2. **Delivery Rates**: Success vs. failure rates
3. **Message Types**: Distribution by category
4. **Cost Tracking**: Monthly SMS expenses
5. **Performance Trends**: Historical performance data

### Monitoring Alerts
1. **High Failure Rate**: Alert when delivery fails
2. **Low Balance**: Notify when credits are low
3. **API Errors**: Alert on API failures
4. **Rate Limiting**: Notify when limits are reached
5. **Service Downtime**: Alert on service unavailability

### Reporting Features
1. **Monthly Reports**: SMS usage summaries
2. **Delivery Reports**: Detailed delivery statistics
3. **Cost Reports**: SMS expense tracking
4. **Performance Reports**: Service performance metrics
5. **Trend Analysis**: Usage pattern analysis

### Best Practices
1. **Message Optimization**: Keep messages concise
2. **Timing**: Send messages at appropriate times
3. **Personalization**: Use customer names and details
4. **Compliance**: Follow SMS regulations and guidelines
5. **Testing**: Regular testing of SMS functionality

This comprehensive SMS integration guide ensures reliable and efficient SMS communication with clients through the Celcomafrica SMS gateway.
