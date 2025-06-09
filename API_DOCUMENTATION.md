# ISP Management System - Customer Portal API Documentation

## Base URL
Your Supabase project URL: `https://ddljuawonxdnesrnclsx.supabase.co/functions/v1`

## Authentication
All endpoints use the Supabase project's anon key in the `apikey` header.

## Available Endpoints

### 1. Client Registration
**Endpoint:** `POST /client-registration`

**Purpose:** Register a new client for internet services

**Headers:**
```
Content-Type: application/json
apikey: eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImRkbGp1YXdvbnhkbmVzcm5jbHN4Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDkzOTk0NDksImV4cCI6MjA2NDk3NTQ0OX0.HcMHBQ0dD0rHz2s935PncmiJgaG8C1fJw39XdfGlzeg
```

**Request Body:**
```json
{
  "name": "John Doe",
  "email": "john.doe@example.com",
  "phone": "+254700123456",
  "id_number": "12345678",
  "address": "123 Main Street, Nairobi",
  "county": "Nairobi",
  "sub_county": "Westlands",
  "client_type": "individual",
  "connection_type": "fiber",
  "service_package_id": "uuid-of-service-package",
  "isp_company_id": "your-isp-company-id",
  "mpesa_number": "+254700123456",
  "kra_pin_number": "A123456789Z"
}
```

**Required Fields:**
- name, email, phone, id_number, address, county, sub_county
- client_type, connection_type, isp_company_id

**Response:**
```json
{
  "success": true,
  "client": {
    "id": "client-uuid",
    "name": "John Doe",
    "status": "pending",
    // ... other client fields
  },
  "message": "Registration successful. Your application is pending approval."
}
```

### 2. Client Authentication/Login
**Endpoint:** `POST /client-auth`

**Purpose:** Authenticate client and retrieve account information

**Headers:**
```
Content-Type: application/json
apikey: eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImRkbGp1YXdvbnhkbmVzcm5jbHN4Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDkzOTk0NDksImV4cCI6MjA2NDk3NTQ0OX0.HcMHBQ0dD0rHz2s935PncmiJgaG8C1fJw39XdfGlzeg
```

**Request Body:**
```json
{
  "email": "john.doe@example.com",
  "id_number": "12345678"
}
```

**Response:**
```json
{
  "success": true,
  "client": {
    "id": "client-uuid",
    "name": "John Doe",
    "email": "john.doe@example.com",
    "status": "active",
    "balance": 1500,
    "monthly_rate": 2500,
    "service_packages": {
      "name": "Premium Fiber",
      "speed": "50 Mbps",
      "monthly_rate": 2500,
      "description": "High-speed fiber connection"
    },
    "payments": [...],
    "invoices": [...],
    "support_tickets": [...]
  }
}
```

### 3. Get Service Packages
**Endpoint:** `GET /service-packages?isp_company_id=your-isp-id`

**Purpose:** Get available service packages for an ISP

**Headers:**
```
apikey: eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImRkbGp1YXdvbnhkbmVzcm5jbHN4Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDkzOTk0NDksImV4cCI6MjA2NDk3NTQ0OX0.HcMHBQ0dD0rHz2s935PncmiJgaG8C1fJw39XdfGlzeg
```

**Response:**
```json
{
  "success": true,
  "packages": [
    {
      "id": "package-uuid",
      "name": "Basic Fiber",
      "speed": "10 Mbps",
      "monthly_rate": 1500,
      "description": "Basic internet package",
      "connection_types": ["fiber"]
    }
  ]
}
```

## Integration Guide for Customer Portal

### 1. Setup in your React + Vite Customer Portal

Create an API service file:

```javascript
// src/services/api.js
const BASE_URL = 'https://ddljuawonxdnesrnclsx.supabase.co/functions/v1';
const API_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImRkbGp1YXdvbnhkbmVzcm5jbHN4Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDkzOTk0NDksImV4cCI6MjA2NDk3NTQ0OX0.HcMHBQ0dD0rHz2s935PncmiJgaG8C1fJw39XdfGlzeg';

const apiRequest = async (endpoint, options = {}) => {
  const response = await fetch(`${BASE_URL}${endpoint}`, {
    headers: {
      'Content-Type': 'application/json',
      'apikey': API_KEY,
      ...options.headers,
    },
    ...options,
  });
  
  return response.json();
};

export const registerClient = (clientData) => {
  return apiRequest('/client-registration', {
    method: 'POST',
    body: JSON.stringify(clientData),
  });
};

export const loginClient = (credentials) => {
  return apiRequest('/client-auth', {
    method: 'POST',
    body: JSON.stringify(credentials),
  });
};

export const getServicePackages = (ispCompanyId) => {
  return apiRequest(`/service-packages?isp_company_id=${ispCompanyId}`);
};
```

### 2. Example Usage in Components

```javascript
// Registration Component
import { registerClient } from './services/api';

const handleRegistration = async (formData) => {
  try {
    const result = await registerClient({
      ...formData,
      isp_company_id: 'your-isp-company-id', // Get this from your ISP admin
    });
    
    if (result.success) {
      alert('Registration successful!');
    } else {
      alert('Registration failed: ' + result.error);
    }
  } catch (error) {
    console.error('Registration error:', error);
  }
};

// Login Component
import { loginClient } from './services/api';

const handleLogin = async (email, idNumber) => {
  try {
    const result = await loginClient({
      email,
      id_number: idNumber,
    });
    
    if (result.success) {
      // Store client data and redirect to dashboard
      localStorage.setItem('client', JSON.stringify(result.client));
      // Navigate to dashboard
    } else {
      alert('Login failed: ' + result.error);
    }
  } catch (error) {
    console.error('Login error:', error);
  }
};
```

## Testing the APIs

### 1. Test Client Registration
```bash
curl -X POST https://ddljuawonxdnesrnclsx.supabase.co/functions/v1/client-registration \
  -H "Content-Type: application/json" \
  -H "apikey: eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImRkbGp1YXdvbnhkbmVzcm5jbHN4Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDkzOTk0NDksImV4cCI6MjA2NDk3NTQ0OX0.HcMHBQ0dD0rHz2s935PncmiJgaG8C1fJw39XdfGlzeg" \
  -d '{
    "name": "Test Client",
    "email": "test@example.com",
    "phone": "+254700123456",
    "id_number": "12345678",
    "address": "Test Address",
    "county": "Nairobi",
    "sub_county": "Westlands",
    "client_type": "individual",
    "connection_type": "fiber",
    "isp_company_id": "your-isp-company-id"
  }'
```

### 2. Test Client Login
```bash
curl -X POST https://ddljuawonxdnesrnclsx.supabase.co/functions/v1/client-auth \
  -H "Content-Type: application/json" \
  -H "apikey: eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImRkbGp1YXdvbnhkbmVzcm5jbHN4Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDkzOTk0NDksImV4cCI6MjA2NDk3NTQ0OX0.HcMHBQ0dD0rHz2s935PncmiJgaG8C1fJw39XdfGlzeg" \
  -d '{
    "email": "test@example.com",
    "id_number": "12345678"
  }'
```

## Important Notes

1. **ISP Company ID**: You'll need to get the ISP company ID from your admin dashboard. Look in the ISP companies table or contact your system administrator.

2. **CORS**: The APIs are configured to accept requests from any origin for testing. In production, you should restrict this.

3. **Error Handling**: Always check the `success` field in responses and handle errors appropriately.

4. **Authentication**: The customer portal uses email + ID number authentication instead of traditional password-based auth for security.

5. **Status Flow**: 
   - New registrations start with `pending` status
   - Admin can approve and change to `active`
   - `suspended` accounts cannot login
   - `disconnected` accounts are inactive

## Phase 1 Completion Checklist

✅ Supabase Integration - Database and authentication set up
✅ Data Models - Complete database schema implemented  
✅ API Layer - REST endpoints created for client registration and authentication
✅ Documentation - Complete API documentation provided
✅ Testing Guide - cURL examples and integration guide included

Phase 1 is now complete! You can proceed with Phase 2 (UI Enhancement) after testing the customer portal integration.
