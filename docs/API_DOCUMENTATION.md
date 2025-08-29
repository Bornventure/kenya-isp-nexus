# DataDefender API Documentation

## Overview

The DataDefender ISP Management System provides a comprehensive REST API for managing all aspects of ISP operations. All endpoints are built on Supabase and follow REST conventions.

## Authentication

All API requests require authentication using Supabase JWT tokens.

```typescript
// Authentication Headers
{
  "Authorization": "Bearer <JWT_TOKEN>",
  "apikey": "<SUPABASE_ANON_KEY>",
  "Content-Type": "application/json"
}
```

## Core API Endpoints

### Client Management

#### Get All Clients
```http
GET /rest/v1/clients
```

**Query Parameters:**
- `isp_company_id=eq.<company_id>` - Filter by company
- `status=eq.<status>` - Filter by client status
- `select=*` - Specify fields to return

**Response:**
```json
{
  "data": [
    {
      "id": "uuid",
      "name": "Client Name",
      "email": "client@example.com",
      "phone": "+254700000000",
      "status": "active",
      "monthly_rate": 2500,
      "service_package_id": "uuid",
      "created_at": "2024-01-01T00:00:00Z"
    }
  ]
}
```

#### Create Client
```http
POST /rest/v1/clients
```

**Request Body:**
```json
{
  "name": "John Doe",
  "email": "john@example.com",
  "phone": "+254700000000",
  "id_number": "12345678",
  "address": "123 Main Street",
  "county": "Nairobi",
  "sub_county": "Westlands",
  "client_type": "individual",
  "connection_type": "fiber",
  "monthly_rate": 2500,
  "service_package_id": "uuid",
  "isp_company_id": "uuid"
}
```

### Equipment Management

#### Get Available Equipment
```http
GET /rest/v1/equipment?status=eq.available
```

#### Assign Equipment
```http
POST /rest/v1/client_equipment_assignments
```

**Request Body:**
```json
{
  "client_id": "uuid",
  "equipment_id": "uuid",
  "assigned_by": "uuid",
  "installation_notes": "Installation notes",
  "status": "assigned",
  "isp_company_id": "uuid"
}
```

### Billing & Payments

#### Generate Invoice
```http
POST /rest/v1/rpc/generate_service_package_invoice
```

**Request Body:**
```json
{
  "client_id_param": "uuid"
}
```

#### Process Payment
```http
POST /rest/v1/family_bank_payments
```

**Request Body:**
```json
{
  "client_id": "uuid",
  "trans_amount": 2500,
  "trans_id": "FB123456789",
  "msisdn": "+254700000000",
  "bill_ref_number": "INV-001234",
  "status": "verified",
  "isp_company_id": "uuid"
}
```

### Network Monitoring

#### Get Active Sessions
```http
GET /rest/v1/active_sessions?isp_company_id=eq.<company_id>
```

#### Get Equipment Status
```http
GET /rest/v1/equipment?status=eq.deployed&isp_company_id=eq.<company_id>
```

### Support Ticketing

#### Create Support Ticket
```http
POST /rest/v1/support_tickets
```

**Request Body:**
```json
{
  "title": "Connection Issue",
  "description": "Internet connection is slow",
  "priority": "medium",
  "category": "technical",
  "client_id": "uuid",
  "assigned_to": "uuid",
  "status": "open",
  "isp_company_id": "uuid"
}
```

## Edge Functions

### MikroTik Integration

#### Configure Client
```http
POST /functions/v1/mikrotik-config
```

**Request Body:**
```json
{
  "client_id": "uuid",
  "router_ip": "192.168.1.1",
  "username": "pppoe_username",
  "password": "pppoe_password",
  "download_limit": "10M",
  "upload_limit": "5M"
}
```

### Payment Processing

#### Family Bank STK Push
```http
POST /functions/v1/family-bank-stk
```

**Request Body:**
```json
{
  "phone_number": "+254700000000",
  "amount": 2500,
  "account_reference": "ACC123",
  "transaction_desc": "Monthly subscription"
}
```

### Notifications

#### Send SMS
```http
POST /functions/v1/send-sms
```

**Request Body:**
```json
{
  "to": "+254700000000",
  "message": "Your payment has been received",
  "client_id": "uuid"
}
```

#### Send Email
```http
POST /functions/v1/send-email
```

**Request Body:**
```json
{
  "to": "client@example.com",
  "subject": "Payment Confirmation",
  "html_content": "<h1>Payment Received</h1>",
  "client_id": "uuid"
}
```

## Real-time Subscriptions

### Database Changes
```typescript
const channel = supabase
  .channel('schema-db-changes')
  .on(
    'postgres_changes',
    {
      event: 'INSERT',
      schema: 'public',
      table: 'active_sessions'
    },
    (payload) => console.log(payload)
  )
  .subscribe();
```

### Equipment Status Updates
```typescript
const equipmentChannel = supabase
  .channel('equipment-status')
  .on(
    'postgres_changes',
    {
      event: 'UPDATE',
      schema: 'public',
      table: 'equipment',
      filter: 'isp_company_id=eq.' + companyId
    },
    handleEquipmentUpdate
  )
  .subscribe();
```

## Error Handling

### Standard Error Response
```json
{
  "error": {
    "message": "Error description",
    "details": "Detailed error information",
    "hint": "Suggestion for fixing the error",
    "code": "ERROR_CODE"
  }
}
```

### Common Error Codes
- `PGRST116` - Row Level Security violation
- `23505` - Unique constraint violation
- `23503` - Foreign key constraint violation
- `42501` - Insufficient privileges

## Rate Limiting

API endpoints are rate limited to prevent abuse:
- **Authentication**: 10 requests per minute
- **Data queries**: 1000 requests per hour
- **Data mutations**: 100 requests per hour
- **Edge functions**: 60 requests per minute

## Data Types

### Enums
```typescript
// Client Status
type ClientStatus = 'pending' | 'approved' | 'active' | 'suspended' | 'cancelled';

// Payment Status  
type PaymentStatus = 'pending' | 'processing' | 'verified' | 'failed';

// Equipment Status
type EquipmentStatus = 'available' | 'deployed' | 'maintenance' | 'retired';

// Ticket Status
type TicketStatus = 'open' | 'in_progress' | 'resolved' | 'closed';
```

### Complex Types
```typescript
// Client Data
interface Client {
  id: string;
  name: string;
  email?: string;
  phone: string;
  id_number: string;
  address: string;
  county: string;
  sub_county: string;
  client_type: 'individual' | 'business';
  connection_type: 'fiber' | 'wireless' | 'satellite';
  status: ClientStatus;
  monthly_rate: number;
  service_package_id?: string;
  isp_company_id: string;
  created_at: string;
  updated_at: string;
}

// Equipment Data
interface Equipment {
  id: string;
  type: string;
  brand?: string;
  model: string;
  serial_number: string;
  mac_address?: string;
  ip_address?: string;
  status: EquipmentStatus;
  location?: string;
  isp_company_id: string;
  client_id?: string;
  created_at: string;
  updated_at: string;
}
```

## Webhook Events

### Payment Callbacks
```http
POST /functions/v1/family-bank-stk-callback
```

**Payload:**
```json
{
  "ResponseCode": "0",
  "ResponseDescription": "Success",
  "MerchantRequestID": "29115-34620561-1",
  "CheckoutRequestID": "ws_CO_191220191020363925",
  "ResultCode": "0",
  "ResultDesc": "The service request is processed successfully."
}
```

### Equipment Status Updates
```http
POST /functions/v1/equipment-status-webhook
```

**Payload:**
```json
{
  "equipment_id": "uuid",
  "status": "online",
  "timestamp": "2024-01-01T12:00:00Z",
  "metrics": {
    "cpu_usage": 45,
    "memory_usage": 60,
    "uptime": 86400
  }
}
```

## SDK Examples

### JavaScript/TypeScript
```typescript
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  'https://ddljuawonxdnesrnclsx.supabase.co',
  'your-anon-key'
);

// Get clients
const { data: clients } = await supabase
  .from('clients')
  .select('*')
  .eq('isp_company_id', companyId);

// Create client
const { data: newClient } = await supabase
  .from('clients')
  .insert({
    name: 'John Doe',
    email: 'john@example.com',
    phone: '+254700000000',
    // ... other fields
  })
  .select()
  .single();
```

### Python
```python
import requests

headers = {
    'Authorization': f'Bearer {jwt_token}',
    'apikey': supabase_anon_key,
    'Content-Type': 'application/json'
}

# Get clients
response = requests.get(
    'https://ddljuawonxdnesrnclsx.supabase.co/rest/v1/clients',
    headers=headers,
    params={'isp_company_id': f'eq.{company_id}'}
)
clients = response.json()
```

## Testing

### Postman Collection
A complete Postman collection is available with pre-configured requests for all endpoints.

### Test Environment
- **Base URL**: `https://ddljuawonxdnesrnclsx.supabase.co`
- **Test Company ID**: `test-company-uuid`
- **Test API Key**: Available in project settings

## Support

For API support or feature requests:
- **Documentation**: This document
- **GitHub Issues**: Report bugs and request features
- **Email Support**: Contact development team
