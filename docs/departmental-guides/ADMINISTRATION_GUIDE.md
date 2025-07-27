
# ISP Management System - Administration Guide

## Table of Contents
1. [Overview](#overview)
2. [User Management](#user-management)
3. [Company Settings](#company-settings)
4. [License Management](#license-management)
5. [System Configuration](#system-configuration)
6. [Reporting and Analytics](#reporting-and-analytics)
7. [Security Administration](#security-administration)
8. [Troubleshooting](#troubleshooting)

## Overview

The Administration module provides comprehensive tools for managing the ISP Management System. As an administrator, you have access to user management, system configuration, license management, and overall system oversight.

### Key Responsibilities
- User account management and role assignments
- Company settings and configuration
- License management and compliance
- System security and access control
- System-wide reporting and analytics
- Backup and maintenance oversight

## User Management

### Adding New Users

1. **Navigate to User Management**
   - Go to **Settings** → **User Management**
   - Click **Add New User** button

2. **Fill User Details**
   - **Personal Information**: First name, last name, email
   - **Role Assignment**: Select appropriate role from dropdown
   - **Company Assignment**: Assign to specific ISP company (for multi-tenant)
   - **Access Level**: Set permissions and restrictions

3. **User Roles Available**
   - **Super Admin**: Full system access
   - **ISP Admin**: Company-level administration
   - **Billing & Finance**: Financial operations
   - **Customer Support**: Client service and ticketing
   - **Sales & Account Manager**: Client acquisition and management
   - **Network Operations**: Technical operations and approvals
   - **Infrastructure & Asset**: Equipment and inventory management
   - **Hotspot Admin**: WiFi hotspot management

### User Account Management

#### Activating/Deactivating Users
- Navigate to user list
- Click on user's action menu (three dots)
- Select **Activate** or **Deactivate**
- Confirm the action

#### Resetting Passwords
- Go to user profile
- Click **Reset Password** button
- New credentials will be sent to user's email
- User must change password on first login

#### Updating User Roles
- Access user profile
- Click **Edit** button
- Update role from dropdown
- Save changes
- User will receive role change notification

### Bulk User Operations

#### Bulk User Import
1. Download CSV template from **User Management** page
2. Fill template with user data
3. Upload CSV file using **Bulk Import** button
4. Review import preview
5. Confirm import
6. Users will receive welcome emails with login credentials

#### Bulk Role Updates
- Select multiple users using checkboxes
- Click **Bulk Actions** → **Update Roles**
- Choose new role
- Confirm changes

## Company Settings

### Basic Company Configuration

#### Company Information
- **Company Name**: Legal business name
- **Contact Information**: Address, phone, email
- **Business Registration**: Certificate numbers and tax information
- **License Details**: ISP license type and expiration dates

#### Service Configuration
- **Service Packages**: Available internet plans
- **Coverage Areas**: Geographic service zones
- **Installation Fees**: Setup and connection charges
- **Payment Methods**: Accepted payment options

### Multi-Tenant Management

#### ISP Company Registration
1. Navigate to **Companies** → **Register New ISP**
2. Fill company registration form:
   - Legal business name
   - Contact information
   - License type (Starter/Professional/Enterprise)
   - Business registration documents
3. Set initial user limits based on license
4. Assign ISP Admin user
5. Configure company-specific settings

#### Company Status Management
- **Active**: Company can operate normally
- **Suspended**: Temporarily disabled
- **Expired**: License expired, read-only access
- **Cancelled**: Company account closed

## License Management

### License Types and Limits

#### Starter License
- Up to 100 clients
- Basic features enabled
- Email support
- Monthly billing: KES 5,000

#### Professional License
- Up to 500 clients
- Advanced features enabled
- Priority support
- Monthly billing: KES 15,000

#### Enterprise License
- Up to 2,000 clients
- All features enabled
- Dedicated support
- Monthly billing: KES 50,000

### License Activation Process

1. **Purchase License**
   - Select license type
   - Process payment
   - Receive activation key

2. **Activate License**
   - Go to **License Management**
   - Enter activation key
   - Confirm activation
   - System validates and activates

3. **License Renewal**
   - Monitor expiration dates
   - Renew before expiration
   - Update payment information
   - Confirm renewal

### License Monitoring

#### Usage Tracking
- Monitor client count vs. license limits
- Track feature usage
- Review support ticket volume
- Monitor system performance

#### Compliance Reporting
- Generate license compliance reports
- Track usage patterns
- Monitor overage situations
- Plan capacity upgrades

## System Configuration

### General Settings

#### System Preferences
- **Date Format**: DD/MM/YYYY or MM/DD/YYYY
- **Time Zone**: Set local time zone
- **Currency**: Local currency settings
- **Language**: System language preference

#### Notification Settings
- **Email Notifications**: Enable/disable email alerts
- **SMS Notifications**: Configure SMS gateway
- **Push Notifications**: In-app notification settings
- **Notification Templates**: Customize message templates

### Payment Gateway Configuration

#### M-PESA Integration
1. **Obtain M-PESA Credentials**
   - Register with Safaricom Developer Portal
   - Get Consumer Key and Secret
   - Obtain Passkey and Shortcode

2. **Configure M-PESA Settings**
   - Go to **Settings** → **Payment Methods**
   - Select **M-PESA Configuration**
   - Enter API credentials
   - Set callback URLs
   - Test integration

3. **M-PESA Features**
   - STK Push payments
   - Paybill integration
   - Payment status tracking
   - Automatic reconciliation

#### Family Bank Integration
1. **Setup Family Bank API**
   - Contact Family Bank for API access
   - Obtain client credentials
   - Configure callback URLs

2. **Configure Bank Settings**
   - Enter API credentials
   - Set transaction limits
   - Configure notification settings
   - Test connectivity

### SMS Gateway Configuration

#### Celcomafrica SMS Setup
1. **Configure SMS Settings**
   - Go to **Settings** → **SMS Configuration**
   - Enter API details:
     - URL: https://isms.celcomafrica.com/api/services/sendsms
     - API Key: 3230abd57d39aa89fc407618f3faaacc
     - Partner ID: 800
     - Shortcode: LAKELINK

2. **SMS Features**
   - Payment confirmations
   - Service reminders
   - Support notifications
   - Bulk messaging

#### Resend Email Configuration
1. **Setup Resend Account**
   - Create account at resend.com
   - Verify domain
   - Generate API key

2. **Configure Email Settings**
   - Enter Resend API key
   - Set sender email address
   - Configure email templates
   - Test email delivery

## Reporting and Analytics

### System Reports

#### User Activity Reports
- Login frequency and patterns
- Feature usage statistics
- User performance metrics
- Security audit logs

#### System Performance Reports
- Server response times
- Database performance
- API usage statistics
- Error rates and types

### Business Intelligence

#### Revenue Analytics
- Monthly revenue trends
- Payment method analysis
- Customer acquisition costs
- Churn rate analysis

#### Operational Metrics
- Support ticket volumes
- Resolution times
- Customer satisfaction scores
- Staff productivity metrics

### Custom Reports

#### Report Builder
1. **Create Custom Report**
   - Select data sources
   - Choose date ranges
   - Apply filters
   - Select visualization type

2. **Schedule Reports**
   - Set report frequency
   - Choose recipients
   - Configure delivery method
   - Set report format

## Security Administration

### Access Control

#### Role-Based Permissions
- Define role capabilities
- Set data access levels
- Configure feature restrictions
- Monitor permission usage

#### Security Policies
- Password requirements
- Session timeout settings
- Two-factor authentication
- API access controls

### Audit and Compliance

#### Security Monitoring
- Failed login attempts
- Unusual access patterns
- Data modification logs
- System vulnerability scans

#### Compliance Reporting
- Data protection compliance
- Access audit reports
- Security incident logs
- Regulatory compliance status

## Troubleshooting

### Common Issues

#### User Access Problems
**Issue**: Users cannot login
**Solutions**:
- Check user account status
- Verify role assignments
- Reset password if needed
- Check system maintenance status

#### License Issues
**Issue**: License limit exceeded
**Solutions**:
- Review current client count
- Upgrade license if needed
- Clean up inactive accounts
- Contact support for assistance

#### Integration Problems
**Issue**: Payment gateway not working
**Solutions**:
- Check API credentials
- Verify callback URLs
- Test network connectivity
- Review error logs

### System Maintenance

#### Regular Maintenance Tasks
- Database optimization
- Log file cleanup
- Security updates
- Performance monitoring

#### Backup and Recovery
- Daily automated backups
- Recovery procedures
- Disaster recovery plans
- Data integrity checks

### Support Resources

#### Internal Support
- System documentation
- Video tutorials
- Knowledge base
- Training materials

#### External Support
- Technical support tickets
- Phone support
- Email support
- Community forums

This administration guide provides comprehensive instructions for managing the ISP Management System effectively. Regular review and updates ensure optimal system performance and security.
