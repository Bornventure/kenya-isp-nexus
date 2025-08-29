
# DataDefender System Setup Guide

## Prerequisites

### System Requirements
- **Node.js**: Version 18.0 or higher
- **npm/yarn**: Latest version
- **Git**: Version control system
- **Modern Browser**: Chrome, Firefox, Safari, Edge

### Development Environment
```bash
# Verify Node.js installation
node --version  # Should be 18.0+
npm --version   # Should be 8.0+

# Clone repository
git clone <repository-url>
cd datadefender-isp-system

# Install dependencies
npm install
```

## Supabase Configuration

### Project Setup
1. **Create Supabase Project**
   - Go to [supabase.com](https://supabase.com)
   - Create new project
   - Note project URL and anon key

2. **Environment Configuration**
   ```bash
   # Create .env.local file
   VITE_SUPABASE_URL=https://your-project.supabase.co
   VITE_SUPABASE_ANON_KEY=your-anon-key
   ```

3. **Database Migration**
   ```sql
   -- Run database schema setup
   -- Execute SQL files in order:
   -- 1. tables.sql
   -- 2. policies.sql  
   -- 3. functions.sql
   -- 4. triggers.sql
   ```

### Row Level Security Setup
```sql
-- Enable RLS on all tables
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE clients ENABLE ROW LEVEL SECURITY;
ALTER TABLE equipment ENABLE ROW LEVEL SECURITY;
-- ... continue for all tables

-- Create policies for multi-tenant access
CREATE POLICY "Users can view their company data" ON clients
  FOR SELECT USING (isp_company_id = get_current_user_company_id());
```

## Integration Configuration

### MikroTik Integration
```bash
# Add MikroTik secrets in Supabase
MIKROTIK_HOST=192.168.1.1
MIKROTIK_USER=admin
MIKROTIK_PASSWORD=password
MIKROTIK_PORT=8728
```

### Payment Gateway Setup

#### Family Bank Configuration
```bash
# Family Bank API Settings
FAMILY_BANK_CLIENT_ID=your-client-id
FAMILY_BANK_CLIENT_SECRET=your-client-secret
FAMILY_BANK_TOKEN_URL=https://api.familybank.co.ke/token
FAMILY_BANK_STK_URL=https://api.familybank.co.ke/stk
FAMILY_BANK_MERCHANT_CODE=your-merchant-code
```

#### AfricasTalking SMS Setup
```bash
# SMS Service Configuration
AFRICASTALKING_API_KEY=your-api-key
AFRICASTALKING_USERNAME=your-username
AFRICASTALKING_SENDER_ID=your-sender-id
```

### Email Service Configuration
```bash
# Resend Email Service
RESEND_API_KEY=your-resend-api-key
```

## Edge Functions Deployment

### Function Configuration
```bash
# Login to Supabase CLI
supabase login

# Initialize project
supabase init

# Deploy all edge functions
supabase functions deploy
```

### Individual Function Deployment
```bash
# Deploy specific functions
supabase functions deploy mikrotik-config
supabase functions deploy family-bank-stk
supabase functions deploy send-notifications
supabase functions deploy mpesa-callback
```

## Development Setup

### Local Development
```bash
# Start development server
npm run dev

# Start Supabase locally (optional)
supabase start

# Run type checking
npm run type-check

# Run linting
npm run lint
```

### Environment Variables
```bash
# .env.local configuration
VITE_SUPABASE_URL=https://ddljuawonxdnesrnclsx.supabase.co
VITE_SUPABASE_ANON_KEY=your-anon-key
VITE_REAL_NETWORK_MODE=development
```

## Production Deployment

### Build Optimization
```bash
# Production build
npm run build

# Preview production build
npm run preview

# Type checking in CI
npm run type-check
```

### Deployment Platforms

#### Vercel Deployment
```bash
# Install Vercel CLI
npm i -g vercel

# Deploy to Vercel
vercel --prod
```

#### Netlify Deployment
```bash
# Build command: npm run build
# Publish directory: dist
# Environment variables: Add in Netlify dashboard
```

## Database Management

### Initial Data Setup
```sql
-- Create initial ISP company
INSERT INTO isp_companies (name, email, phone) VALUES 
('Demo ISP', 'admin@demo-isp.com', '+254700000000');

-- Create super admin user
INSERT INTO profiles (id, first_name, last_name, role) VALUES
('uuid', 'Super', 'Admin', 'super_admin');

-- Create service packages
INSERT INTO service_packages (name, speed_mbps, monthly_rate, isp_company_id) VALUES
('Basic 5Mbps', 5, 1500, 'company-uuid'),
('Standard 10Mbps', 10, 2500, 'company-uuid'),
('Premium 20Mbps', 20, 4000, 'company-uuid');
```

### Backup Configuration
```sql
-- Create backup schedule
SELECT cron.schedule(
  'daily-backup',
  '0 2 * * *',
  'pg_dump datadefender_db'
);
```

## Monitoring & Analytics

### Performance Monitoring
```typescript
// Add to main.tsx
if (process.env.NODE_ENV === 'production') {
  // Initialize monitoring service
  console.log('Production monitoring enabled');
}
```

### Error Tracking
```typescript
// Global error handler
window.addEventListener('error', (event) => {
  console.error('Global error:', event.error);
  // Send to monitoring service
});
```

## Security Configuration

### Content Security Policy
```html
<!-- Add to index.html -->
<meta http-equiv="Content-Security-Policy" 
      content="default-src 'self'; 
               script-src 'self' 'unsafe-inline' 'unsafe-eval';
               style-src 'self' 'unsafe-inline';
               img-src 'self' data: https:;
               connect-src 'self' https://*.supabase.co;">
```

### API Rate Limiting
```sql
-- Create rate limiting function
CREATE OR REPLACE FUNCTION check_rate_limit(user_id UUID)
RETURNS BOOLEAN AS $$
-- Implementation for rate limiting
$$ LANGUAGE plpgsql;
```

## Testing Setup

### Unit Testing
```bash
# Install testing dependencies
npm install --save-dev vitest @testing-library/react

# Run tests
npm run test

# Coverage report
npm run test:coverage
```

### E2E Testing
```bash
# Install Playwright
npm install --save-dev @playwright/test

# Run E2E tests
npm run test:e2e
```

## Maintenance Procedures

### Regular Updates
```bash
# Update dependencies
npm update

# Security audit
npm audit

# Fix vulnerabilities
npm audit fix
```

### Database Maintenance
```sql
-- Vacuum and analyze
VACUUM ANALYZE;

-- Reindex tables
REINDEX DATABASE datadefender_db;

-- Update statistics
ANALYZE;
```

## Troubleshooting

### Common Issues

#### Build Errors
```bash
# Clear node modules and reinstall
rm -rf node_modules package-lock.json
npm install

# Clear build cache
rm -rf dist .vite
```

#### Database Connection Issues
```typescript
// Check Supabase connection
const { data, error } = await supabase
  .from('profiles')
  .select('count', { count: 'exact', head: true });

if (error) {
  console.error('Database connection failed:', error);
}
```

#### Function Deployment Issues
```bash
# Check function logs
supabase functions logs mikrotik-config

# Redeploy with verbose output
supabase functions deploy mikrotik-config --debug
```

### Performance Optimization

#### Database Optimization
```sql
-- Add indexes for common queries
CREATE INDEX idx_clients_company_status 
ON clients(isp_company_id, status);

CREATE INDEX idx_payments_company_date 
ON family_bank_payments(isp_company_id, created_at);
```

#### Frontend Optimization
```typescript
// Lazy load components
const Dashboard = lazy(() => import('./Dashboard'));
const Reports = lazy(() => import('./Reports'));

// Implement code splitting
const LazyComponent = React.lazy(() => 
  import('./HeavyComponent')
);
```

## Support & Maintenance

### Monitoring Checklist
- [ ] Database performance metrics
- [ ] API response times
- [ ] Error rates and logs
- [ ] User session analytics
- [ ] Payment processing success rates
- [ ] Integration service status

### Regular Maintenance Tasks
- [ ] Database backups verification
- [ ] Security updates installation
- [ ] Performance monitoring review
- [ ] User feedback analysis
- [ ] Integration testing
- [ ] Documentation updates

### Emergency Procedures
1. **System Outage Response**
   - Check service status dashboard
   - Verify database connectivity
   - Review error logs
   - Implement fallback procedures
   - Communicate with users

2. **Data Recovery**
   - Assess data loss scope
   - Restore from latest backup
   - Verify data integrity
   - Test system functionality
   - Document incident

For technical support, contact the development team or refer to the troubleshooting documentation.
