
# ISP Management System - Technical Architecture Documentation

## Table of Contents
1. [System Overview](#system-overview)
2. [Technology Stack](#technology-stack)
3. [Architecture Components](#architecture-components)
4. [Database Schema](#database-schema)
5. [API Architecture](#api-architecture)
6. [Security Implementation](#security-implementation)
7. [Data Flow](#data-flow)
8. [Deployment Architecture](#deployment-architecture)

## System Overview

The ISP Management System is a comprehensive web-based platform designed to manage Internet Service Provider operations. It provides role-based access to different departments and automates key business processes including client onboarding, billing, technical installations, and customer support.

### Key Features
- Multi-tenant architecture supporting multiple ISP companies
- Role-based access control (RBAC) with 8 distinct user roles
- Real-time client status management with network integration
- Automated billing and payment processing
- Technical installation workflow management
- Customer support ticket system
- Equipment and inventory management
- Analytics and reporting dashboard

## Technology Stack

### Frontend Framework
- **React 18.3.1** with TypeScript
- **Vite** for build tooling and development server
- **React Router DOM 6.26.2** for client-side routing
- **TanStack Query 5.56.2** for server state management

### UI Framework & Styling
- **TailwindCSS** for utility-first styling
- **Radix UI** component library for accessible components
- **Lucide React** for icons
- **Recharts** for data visualization

### Backend & Database
- **Supabase** as Backend-as-a-Service (BaaS)
- **PostgreSQL** as primary database
- **Row Level Security (RLS)** for data access control
- **Supabase Edge Functions** for serverless API endpoints

### Authentication & Security
- **Supabase Auth** with JWT tokens
- **Row Level Security (RLS)** policies
- **Multi-factor authentication** support
- **Role-based access control (RBAC)**

### External Integrations
- **M-PESA STK Push** for mobile payments
- **Family Bank API** for banking integrations
- **SNMP** for network equipment management
- **SMS Gateway** for notifications

## Architecture Components

### 1. Frontend Application
```
src/
├── components/          # Reusable UI components
│   ├── ui/             # Base UI components (Radix)
│   ├── dashboard/      # Dashboard-specific components
│   ├── clients/        # Client management components
│   ├── billing/        # Billing and payment components
│   └── support/        # Support ticket components
├── hooks/              # Custom React hooks
├── pages/              # Route-based page components
├── services/           # API service layers
├── types/              # TypeScript type definitions
└── contexts/           # React context providers
```

### 2. Backend Services (Supabase)
```
supabase/
├── functions/          # Edge Functions
│   ├── client-auth/    # Client authentication
│   ├── mpesa-callback/ # M-PESA payment callbacks
│   └── family-bank-*   # Family Bank integrations
├── migrations/         # Database schema migrations
└── config.toml        # Supabase configuration
```

### 3. Database Structure
The system uses PostgreSQL with the following core tables:
- `clients` - Customer information and status
- `isp_companies` - Multi-tenant company data
- `profiles` - User profiles and roles
- `service_packages` - Internet service offerings
- `invoices` - Billing and payment records
- `support_tickets` - Customer support tracking
- `equipment` - Network equipment management
- `payments` - Payment transaction records

## Database Schema

### Core Tables

#### clients
```sql
CREATE TABLE clients (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name VARCHAR NOT NULL,
    email VARCHAR,
    phone VARCHAR NOT NULL,
    address TEXT NOT NULL,
    county VARCHAR NOT NULL,
    sub_county VARCHAR NOT NULL,
    status client_status DEFAULT 'pending',
    client_type client_type NOT NULL,
    connection_type connection_type NOT NULL,
    monthly_rate NUMERIC NOT NULL,
    isp_company_id UUID REFERENCES isp_companies(id),
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);
```

#### isp_companies
```sql
CREATE TABLE isp_companies (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name VARCHAR NOT NULL,
    license_type license_type NOT NULL,
    client_limit INTEGER DEFAULT 100,
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMPTZ DEFAULT NOW()
);
```

#### profiles
```sql
CREATE TABLE profiles (
    id UUID PRIMARY KEY REFERENCES auth.users(id),
    first_name VARCHAR NOT NULL,
    last_name VARCHAR NOT NULL,
    email VARCHAR NOT NULL,
    role user_role NOT NULL,
    isp_company_id UUID REFERENCES isp_companies(id),
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMPTZ DEFAULT NOW()
);
```

### Custom Types
```sql
CREATE TYPE client_status AS ENUM (
    'pending', 'approved', 'active', 'suspended', 'disconnected'
);

CREATE TYPE user_role AS ENUM (
    'super_admin', 'isp_admin', 'billing_finance', 
    'customer_support', 'sales_account_manager',
    'network_operations', 'infrastructure_asset', 'hotspot_admin'
);

CREATE TYPE license_type AS ENUM (
    'starter', 'professional', 'enterprise'
);
```

## API Architecture

### RESTful Endpoints

#### Client Management
- `GET /api/clients` - Retrieve clients for ISP company
- `POST /api/clients` - Create new client
- `PUT /api/clients/:id` - Update client information
- `DELETE /api/clients/:id` - Delete client

#### Authentication
- `POST /api/auth/login` - User login
- `POST /api/auth/logout` - User logout
- `GET /api/auth/profile` - Get current user profile

#### Billing & Payments
- `POST /api/payments/mpesa-stk` - Initiate M-PESA STK Push
- `POST /api/payments/callback` - Handle payment callbacks
- `GET /api/invoices` - Retrieve invoices
- `POST /api/invoices` - Create new invoice

### Edge Functions

#### Client Registration
```typescript
// supabase/functions/client-registration/index.ts
export async function handler(req: Request) {
  const { name, email, phone, address, county, sub_county, client_type, connection_type, isp_company_id } = await req.json();
  
  // Validate and create client
  const client = await supabase
    .from('clients')
    .insert({
      name, email, phone, address, county, sub_county,
      client_type, connection_type, isp_company_id,
      status: 'pending'
    });
    
  return new Response(JSON.stringify(client));
}
```

#### M-PESA STK Push
```typescript
// supabase/functions/mpesa-stk-push/index.ts
export async function handler(req: Request) {
  const { phone, amount, account_reference } = await req.json();
  
  // Generate M-PESA access token
  const accessToken = await generateAccessToken();
  
  // Initiate STK push
  const stkResponse = await initiateSTKPush({
    phone, amount, account_reference, accessToken
  });
  
  return new Response(JSON.stringify(stkResponse));
}
```

## Security Implementation

### Authentication
- JWT-based authentication via Supabase Auth
- Secure session management with refresh tokens
- Multi-factor authentication support

### Authorization
- Role-based access control (RBAC) with 8 user roles
- Row Level Security (RLS) policies for data isolation
- Company-based data segregation

### Data Protection
- Encrypted data transmission (HTTPS/TLS)
- Sensitive data encryption at rest
- API key management for external services
- Input validation and sanitization

### RLS Policies Example
```sql
-- Clients table RLS policy
CREATE POLICY "Users can access their company clients"
ON clients FOR ALL
USING (isp_company_id = get_current_user_company_id());

-- Helper function
CREATE OR REPLACE FUNCTION get_current_user_company_id()
RETURNS UUID AS $$
BEGIN
  RETURN (
    SELECT isp_company_id 
    FROM profiles 
    WHERE id = auth.uid()
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
```

## Data Flow

### Client Onboarding Flow
1. **Registration** - Sales team registers new client
2. **Approval** - NOC team reviews and approves
3. **Equipment Assignment** - Equipment allocated to client
4. **Technical Installation** - Technician completes setup
5. **Service Activation** - Client moved to active status
6. **Billing Setup** - Recurring billing activated

### Payment Processing Flow
1. **Invoice Generation** - System generates monthly invoices
2. **Payment Initiation** - Client initiates payment via M-PESA
3. **Payment Processing** - External payment gateway processes
4. **Callback Handling** - System receives payment confirmation
5. **Account Update** - Client balance and status updated
6. **Notification** - Client receives payment confirmation

## Deployment Architecture

### Local Development
```bash
# Clone repository
git clone <repository-url>
cd isp-management-system

# Install dependencies
npm install

# Setup environment variables
cp .env.example .env.local

# Start development server
npm run dev
```

### Production Deployment
```bash
# Build for production
npm run build

# Deploy to hosting platform
npm run deploy
```

### Environment Variables
```env
# Supabase Configuration
VITE_SUPABASE_URL=https://your-project.supabase.co
VITE_SUPABASE_ANON_KEY=your-anon-key

# Payment Gateway Configuration
MPESA_CONSUMER_KEY=your-consumer-key
MPESA_CONSUMER_SECRET=your-consumer-secret
MPESA_PASSKEY=your-passkey

# Family Bank Configuration
FAMILY_BANK_CLIENT_ID=your-client-id
FAMILY_BANK_CLIENT_SECRET=your-client-secret
```

### Monitoring & Maintenance
- Real-time error tracking via Supabase logs
- Performance monitoring with built-in analytics
- Database backup and recovery procedures
- Regular security updates and patches

## System Dependencies

### Core Dependencies
- React 18.3.1 - Frontend framework
- TypeScript - Type safety
- Supabase 2.50.0 - Backend services
- TanStack Query 5.56.2 - State management
- TailwindCSS - Styling framework

### Development Dependencies
- Vite - Build tooling
- ESLint - Code linting
- Prettier - Code formatting
- TypeScript - Type checking

## Extending the System

### Adding New Modules
1. Create component directory in `src/components/`
2. Add route in `src/App.tsx`
3. Create necessary hooks in `src/hooks/`
4. Add database tables via Supabase migrations
5. Update RLS policies for data access

### Adding New User Roles
1. Update `user_role` enum in database
2. Add role-specific dashboard component
3. Update RLS policies for new role permissions
4. Add role-based navigation in sidebar

### Integrating External Services
1. Create service class in `src/services/`
2. Add environment variables for configuration
3. Create Edge Function for secure API calls
4. Add error handling and logging

This technical documentation provides a comprehensive overview of the ISP Management System architecture, enabling developers to understand, maintain, and extend the system effectively.
