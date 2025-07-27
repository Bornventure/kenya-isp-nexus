
# ISP Management System - Deployment Guide

## Table of Contents
1. [Prerequisites](#prerequisites)
2. [Local Development Setup](#local-development-setup)
3. [Production Deployment](#production-deployment)
4. [Environment Configuration](#environment-configuration)
5. [Database Setup](#database-setup)
6. [External Service Integration](#external-service-integration)
7. [Monitoring & Maintenance](#monitoring--maintenance)
8. [Troubleshooting](#troubleshooting)

## Prerequisites

### System Requirements
- Node.js 18.x or higher
- npm 8.x or higher
- Git
- Modern web browser (Chrome, Firefox, Safari, Edge)

### External Services
- Supabase account and project
- M-PESA Developer Account (Safaricom)
- Family Bank API credentials
- SMS Gateway service (optional)

## Local Development Setup

### 1. Clone Repository
```bash
git clone https://github.com/your-org/isp-management-system.git
cd isp-management-system
```

### 2. Install Dependencies
```bash
npm install
```

### 3. Environment Setup
Create environment file:
```bash
cp .env.example .env.local
```

Configure environment variables (see [Environment Configuration](#environment-configuration)):
```env
# Supabase Configuration
VITE_SUPABASE_URL=https://your-project.supabase.co
VITE_SUPABASE_ANON_KEY=your-anon-key

# Development Settings
VITE_APP_ENV=development
VITE_API_BASE_URL=http://localhost:3000
```

### 4. Database Setup
Run Supabase migrations:
```bash
npx supabase login
npx supabase link --project-ref your-project-ref
npx supabase db reset
```

### 5. Start Development Server
```bash
npm run dev
```

The application will be available at `http://localhost:5173`

## Production Deployment

### Option 1: Vercel Deployment (Recommended)

#### Step 1: Install Vercel CLI
```bash
npm install -g vercel
```

#### Step 2: Login to Vercel
```bash
vercel login
```

#### Step 3: Configure Project
```bash
vercel
```

#### Step 4: Set Environment Variables
```bash
vercel env add VITE_SUPABASE_URL production
vercel env add VITE_SUPABASE_ANON_KEY production
# Add all other environment variables
```

#### Step 5: Deploy
```bash
vercel --prod
```

### Option 2: Netlify Deployment

#### Step 1: Build for Production
```bash
npm run build
```

#### Step 2: Deploy to Netlify
```bash
# Install Netlify CLI
npm install -g netlify-cli

# Login to Netlify
netlify login

# Deploy
netlify deploy --prod --dir=dist
```

### Option 3: Self-Hosted Deployment

#### Step 1: Build Application
```bash
npm run build
```

#### Step 2: Configure Web Server
**Nginx Configuration:**
```nginx
server {
    listen 80;
    server_name your-domain.com;
    root /var/www/isp-management/dist;
    index index.html;

    location / {
        try_files $uri $uri/ /index.html;
    }

    # API proxy for Supabase
    location /api/ {
        proxy_pass https://your-project.supabase.co/;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
    }
}
```

#### Step 3: SSL Configuration
```bash
sudo certbot --nginx -d your-domain.com
```

## Environment Configuration

### Development Environment
```env
# Supabase Configuration
VITE_SUPABASE_URL=https://your-project.supabase.co
VITE_SUPABASE_ANON_KEY=your-anon-key

# App Configuration
VITE_APP_NAME=ISP Management System
VITE_APP_ENV=development
VITE_API_BASE_URL=http://localhost:3000

# Debug Settings
VITE_DEBUG_MODE=true
VITE_LOG_LEVEL=debug
```

### Production Environment
```env
# Supabase Configuration
VITE_SUPABASE_URL=https://your-project.supabase.co
VITE_SUPABASE_ANON_KEY=your-anon-key

# App Configuration
VITE_APP_NAME=ISP Management System
VITE_APP_ENV=production
VITE_API_BASE_URL=https://your-domain.com

# Security Settings
VITE_DEBUG_MODE=false
VITE_LOG_LEVEL=error
```

### Edge Function Environment Variables
Configure these in Supabase Dashboard > Settings > Edge Functions:

```env
# M-PESA Configuration
MPESA_CONSUMER_KEY=your-consumer-key
MPESA_CONSUMER_SECRET=your-consumer-secret
MPESA_PASSKEY=your-passkey
MPESA_SHORTCODE=your-shortcode
MPESA_CALLBACK_URL=https://your-domain.com/api/mpesa/callback

# Family Bank Configuration
FAMILY_BANK_CLIENT_ID=your-client-id
FAMILY_BANK_CLIENT_SECRET=your-client-secret
FAMILY_BANK_BASE_URL=https://api.familybank.co.ke
FAMILY_BANK_CALLBACK_URL=https://your-domain.com/api/family-bank/callback

# SMS Gateway Configuration
SMS_API_KEY=your-sms-api-key
SMS_SENDER_ID=your-sender-id
SMS_BASE_URL=https://api.smsgateway.co.ke
```

## Database Setup

### 1. Create Supabase Project
1. Go to [Supabase Dashboard](https://app.supabase.com)
2. Create new project
3. Note down project URL and anon key

### 2. Run Database Migrations
```bash
# Link to Supabase project
npx supabase link --project-ref your-project-ref

# Run migrations
npx supabase db reset
```

### 3. Set up RLS Policies
The migrations will automatically create Row Level Security policies. Verify they're active:
```sql
-- Check RLS is enabled
SELECT schemaname, tablename, rowsecurity 
FROM pg_tables 
WHERE schemaname = 'public' AND rowsecurity = true;
```

### 4. Create Initial Data
Run the following SQL to create initial system data:
```sql
-- Create license types
INSERT INTO license_types (name, display_name, client_limit, price) VALUES
('starter', 'Starter', 100, 5000),
('professional', 'Professional', 500, 15000),
('enterprise', 'Enterprise', 2000, 50000);

-- Create equipment types
INSERT INTO equipment_types (name, device_type, brand, model) VALUES
('Router', 'router', 'Mikrotik', 'RB750Gr3'),
('Switch', 'switch', 'TP-Link', 'TL-SG108'),
('Access Point', 'access_point', 'Ubiquiti', 'UAP-AC-LR');
```

## External Service Integration

### M-PESA Integration Setup

#### 1. Register M-PESA Developer Account
1. Visit [Safaricom Developer Portal](https://developer.safaricom.co.ke)
2. Create account and verify
3. Create new app for STK Push API

#### 2. Configure M-PESA Settings
Update Edge Function environment variables:
```env
MPESA_CONSUMER_KEY=your-consumer-key
MPESA_CONSUMER_SECRET=your-consumer-secret
MPESA_PASSKEY=your-passkey
MPESA_SHORTCODE=your-shortcode
MPESA_CALLBACK_URL=https://your-domain.com/functions/v1/mpesa-callback
```

#### 3. Test M-PESA Integration
```bash
# Test STK Push
curl -X POST https://your-project.supabase.co/functions/v1/mpesa-stk-push \
  -H "Authorization: Bearer your-anon-key" \
  -d '{"phone":"254700000000","amount":100,"account_reference":"TEST001"}'
```

### Family Bank Integration Setup

#### 1. Obtain API Credentials
Contact Family Bank for API access and credentials.

#### 2. Configure Family Bank Settings
```env
FAMILY_BANK_CLIENT_ID=your-client-id
FAMILY_BANK_CLIENT_SECRET=your-client-secret
FAMILY_BANK_BASE_URL=https://api.familybank.co.ke
FAMILY_BANK_CALLBACK_URL=https://your-domain.com/functions/v1/family-bank-callback
```

#### 3. Test Family Bank Integration
```bash
# Test payment initiation
curl -X POST https://your-project.supabase.co/functions/v1/family-bank-stk-push \
  -H "Authorization: Bearer your-anon-key" \
  -d '{"phone":"254700000000","amount":100,"account_reference":"TEST001"}'
```

## Monitoring & Maintenance

### 1. Application Monitoring
- **Error Tracking**: Monitor Supabase logs for errors
- **Performance**: Use browser dev tools for performance analysis
- **Uptime**: Set up uptime monitoring service

### 2. Database Monitoring
```sql
-- Monitor active connections
SELECT count(*) FROM pg_stat_activity;

-- Check table sizes
SELECT schemaname, tablename, pg_size_pretty(pg_total_relation_size(schemaname||'.'||tablename)) as size
FROM pg_tables
WHERE schemaname = 'public'
ORDER BY pg_total_relation_size(schemaname||'.'||tablename) DESC;

-- Monitor slow queries
SELECT query, mean_time, calls, total_time
FROM pg_stat_statements
ORDER BY mean_time DESC
LIMIT 10;
```

### 3. Backup Strategy
```bash
# Database backup
pg_dump -h your-db-host -U your-username -d your-database > backup.sql

# Automated daily backups
0 2 * * * /usr/bin/pg_dump -h your-db-host -U your-username -d your-database | gzip > /backups/backup-$(date +\%Y\%m\%d).sql.gz
```

### 4. Security Updates
- Regularly update dependencies: `npm audit fix`
- Monitor Supabase updates and apply patches
- Review and update RLS policies as needed
- Rotate API keys and secrets regularly

## Troubleshooting

### Common Issues

#### Build Failures
```bash
# Clear cache and reinstall
rm -rf node_modules package-lock.json
npm install

# Check for TypeScript errors
npm run type-check
```

#### Database Connection Issues
```bash
# Test database connection
npx supabase db ping

# Check environment variables
echo $VITE_SUPABASE_URL
echo $VITE_SUPABASE_ANON_KEY
```

#### M-PESA Integration Issues
- Verify callback URL is accessible
- Check API credentials are correct
- Ensure phone number format is correct (254XXXXXXXXX)
- Verify account has sufficient testing funds

#### Performance Issues
- Enable database query optimization
- Implement caching for frequently accessed data
- Optimize images and assets
- Use CDN for static assets

### Debug Mode
Enable debug mode for detailed logging:
```env
VITE_DEBUG_MODE=true
VITE_LOG_LEVEL=debug
```

### Log Analysis
```bash
# View Supabase logs
npx supabase logs

# Filter specific function logs
npx supabase logs --filter="function_name=mpesa-callback"

# View real-time logs
npx supabase logs --follow
```

### Support Resources
- [Supabase Documentation](https://supabase.com/docs)
- [React Documentation](https://reactjs.org/docs)
- [TailwindCSS Documentation](https://tailwindcss.com/docs)
- [M-PESA API Documentation](https://developer.safaricom.co.ke/docs)

This deployment guide provides comprehensive instructions for setting up and maintaining the ISP Management System in both development and production environments.
