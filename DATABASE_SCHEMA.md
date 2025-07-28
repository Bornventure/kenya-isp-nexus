# Database Schema (Comprehensive)

This document provides a comprehensive overview of the database schema for the ISP Management System, including all tables, columns, relationships, triggers, functions, and edge functions as defined in the Supabase migrations.

---

## Table of Contents
- [Hotspots Domain](#hotspots-domain)
- [Inventory Domain](#inventory-domain)
- [Wallet & Payments Domain](#wallet--payments-domain)
- [Messaging & Notifications](#messaging--notifications)
- [Support & Departments](#support--departments)
- [Network & Equipment](#network--equipment)
- [QoS & Monitoring](#qos--monitoring)
- [External Users](#external-users)
- [Edge Functions](#edge-functions)
- [Functions & Triggers](#functions--triggers)
- [Row Level Security (RLS) & Policies](#row-level-security-rls--policies)

---

## Hotspots Domain

### Table: `hotspots`
**Description:** Stores WiFi hotspot locations, configuration, and status for each ISP company.

| Column                | Type                | Constraints / Default                |
|-----------------------|---------------------|--------------------------------------|
| id                    | UUID                | PK, gen_random_uuid(), NOT NULL      |
| name                  | VARCHAR(255)        | NOT NULL                             |
| location              | TEXT                | NOT NULL                             |
| latitude              | NUMERIC             |                                      |
| longitude             | NUMERIC             |                                      |
| status                | VARCHAR(50)         | NOT NULL, DEFAULT 'active'           |
| hardware_details      | JSONB               |                                      |
| ip_address            | INET                |                                      |
| mac_address           | VARCHAR(17)         |                                      |
| ssid                  | VARCHAR(255)        | NOT NULL                             |
| password              | VARCHAR(255)        |                                      |
| bandwidth_limit       | INTEGER             | DEFAULT 10                           |
| max_concurrent_users  | INTEGER             | DEFAULT 50                           |
| coverage_radius       | INTEGER             | DEFAULT 100                          |
| installation_date     | DATE                |                                      |
| last_maintenance_date | DATE                |                                      |
| is_active             | BOOLEAN             | NOT NULL, DEFAULT true               |
| isp_company_id        | UUID                |                                      |
| created_at            | TIMESTAMP TZ        | NOT NULL, DEFAULT now()              |
| updated_at            | TIMESTAMP TZ        | NOT NULL, DEFAULT now()              |

**Indexes:** company, status, location

**RLS:** Company isolation

---

### Table: `hotspot_sessions`
**Description:** Tracks all user sessions on hotspots, including guests, clients, and voucher users.

| Column                | Type                | Constraints / Default                |
|-----------------------|---------------------|--------------------------------------|
| id                    | UUID                | PK, gen_random_uuid(), NOT NULL      |
| hotspot_id            | UUID                | FK → hotspots(id), NOT NULL          |
| client_id             | UUID                | FK → clients(id), nullable           |
| mac_address           | VARCHAR(17)         | NOT NULL                             |
| device_fingerprint    | TEXT                |                                      |
| session_type          | VARCHAR(20)         | NOT NULL, DEFAULT 'guest'            |
| start_time            | TIMESTAMP TZ        | NOT NULL, DEFAULT now()              |
| end_time              | TIMESTAMP TZ        |                                      |
| duration_minutes      | INTEGER             |                                      |
| data_used_mb          | NUMERIC             | DEFAULT 0                            |
| bandwidth_used_mbps   | NUMERIC             | DEFAULT 0                            |
| session_status        | VARCHAR(20)         | NOT NULL, DEFAULT 'active'           |
| ip_address            | INET                |                                      |
| user_agent            | TEXT                |                                      |
| payment_reference     | VARCHAR(255)        |                                      |
| voucher_code          | VARCHAR(50)         |                                      |
| isp_company_id        | UUID                |                                      |
| created_at            | TIMESTAMP TZ        | NOT NULL, DEFAULT now()              |

**Indexes:** hotspot, client, mac, active, time

**RLS:** Company isolation

---

### Table: `client_hotspot_access`
**Description:** Maps client devices to hotspots for automatic authentication and access control.

| Column                | Type                | Constraints / Default                |
|-----------------------|---------------------|--------------------------------------|
| id                    | UUID                | PK, gen_random_uuid(), NOT NULL      |
| client_id             | UUID                | FK → clients(id), NOT NULL           |
| hotspot_id            | UUID                | FK → hotspots(id), NOT NULL          |
| mac_address           | VARCHAR(17)         | NOT NULL                             |
| device_name           | VARCHAR(255)        |                                      |
| device_type           | VARCHAR(50)         |                                      |
| auto_connect          | BOOLEAN             | NOT NULL, DEFAULT true               |
| bandwidth_allocation  | INTEGER             | DEFAULT 5                            |
| access_level          | VARCHAR(20)         | NOT NULL, DEFAULT 'standard'         |
| first_connected_at    | TIMESTAMP TZ        | NOT NULL, DEFAULT now()              |
| last_connected_at     | TIMESTAMP TZ        |                                      |
| total_sessions        | INTEGER             | DEFAULT 0                            |
| total_data_used_mb    | NUMERIC             | DEFAULT 0                            |
| is_blocked            | BOOLEAN             | NOT NULL, DEFAULT false              |
| blocked_reason        | TEXT                |                                      |
| isp_company_id        | UUID                |                                      |
| created_at            | TIMESTAMP TZ        | NOT NULL, DEFAULT now()              |
| updated_at            | TIMESTAMP TZ        | NOT NULL, DEFAULT now()              |

**Constraints:** UNIQUE (client_id, hotspot_id, mac_address)

**Indexes:** client, hotspot, mac

**RLS:** Company isolation

---

### Table: `hotspot_vouchers`
**Description:** Stores voucher codes for guest access to hotspots, with usage and payment tracking.

| Column                | Type                | Constraints / Default                |
|-----------------------|---------------------|--------------------------------------|
| id                    | UUID                | PK, gen_random_uuid(), NOT NULL      |
| hotspot_id            | UUID                | FK → hotspots(id), NOT NULL          |
| voucher_code          | VARCHAR(20)         | NOT NULL, UNIQUE                     |
| voucher_type          | VARCHAR(20)         | NOT NULL, DEFAULT 'time_based'       |
| duration_minutes      | INTEGER             |                                      |
| data_limit_mb         | INTEGER             |                                      |
| price                 | NUMERIC             | NOT NULL, DEFAULT 0                  |
| currency              | VARCHAR(3)          | NOT NULL, DEFAULT 'KES'              |
| max_devices           | INTEGER             | DEFAULT 1                            |
| expiry_date           | TIMESTAMP TZ        |                                      |
| is_used               | BOOLEAN             | NOT NULL, DEFAULT false              |
| used_at               | TIMESTAMP TZ        |                                      |
| used_by_mac           | VARCHAR(17)         |                                      |
| payment_reference     | VARCHAR(255)        |                                      |
| mpesa_receipt_number  | VARCHAR(255)        |                                      |
| generated_by          | UUID                |                                      |
| isp_company_id        | UUID                |                                      |
| created_at            | TIMESTAMP TZ        | NOT NULL, DEFAULT now()              |

**Indexes:** voucher_code, hotspot, unused

**RLS:** Company isolation

---

### Table: `hotspot_analytics`
**Description:** Aggregates daily analytics for each hotspot (sessions, users, data, revenue, etc).

| Column                | Type                | Constraints / Default                |
|-----------------------|---------------------|--------------------------------------|
| id                    | UUID                | PK, gen_random_uuid(), NOT NULL      |
| hotspot_id            | UUID                | FK → hotspots(id), NOT NULL          |
| date                  | DATE                | NOT NULL                             |
| total_sessions        | INTEGER             | DEFAULT 0                            |
| unique_users          | INTEGER             | DEFAULT 0                            |
| total_data_used_gb    | NUMERIC             | DEFAULT 0                            |
| peak_concurrent_users | INTEGER             | DEFAULT 0                            |
| avg_session_duration_minutes | NUMERIC      | DEFAULT 0                            |
| revenue_generated     | NUMERIC             | DEFAULT 0                            |
| uptime_percentage     | NUMERIC             | DEFAULT 100                          |
| bandwidth_utilization_percentage | NUMERIC  | DEFAULT 0                            |
| guest_sessions        | INTEGER             | DEFAULT 0                            |
| client_sessions       | INTEGER             | DEFAULT 0                            |
| voucher_sessions      | INTEGER             | DEFAULT 0                            |
| isp_company_id        | UUID                |                                      |
| created_at            | TIMESTAMP TZ        | NOT NULL, DEFAULT now()              |

**Constraints:** UNIQUE (hotspot_id, date)

**Indexes:** hotspot+date, company+date

**RLS:** Company isolation

---

## Inventory Domain

### Table: `inventory_items`
**Description:** Stores all physical and logical assets (hardware, CPE, infrastructure, consumables, logical resources).

| Column                | Type                | Constraints / Default                |
|-----------------------|---------------------|--------------------------------------|
| id                    | UUID                | PK, gen_random_uuid(), NOT NULL      |
| item_id               | VARCHAR(50)         | UNIQUE, NOT NULL                     |
| category              | VARCHAR(50)         | NOT NULL, CHECK (see code)           |
| type                  | VARCHAR(100)        | NOT NULL                             |
| name                  | VARCHAR(255)        |                                      |
| manufacturer          | VARCHAR(100)        |                                      |
| model                 | VARCHAR(100)        |                                      |
| serial_number         | VARCHAR(100)        | UNIQUE                               |
| mac_address           | VARCHAR(17)         | UNIQUE                               |
| purchase_date         | DATE                |                                      |
| warranty_expiry_date  | DATE                |                                      |
| supplier              | VARCHAR(255)        |                                      |
| cost                  | DECIMAL(10,2)       |                                      |
| location              | VARCHAR(255)        |                                      |
| status                | VARCHAR(50)         | NOT NULL, DEFAULT 'In Stock'         |
| assigned_customer_id  | UUID                | FK → clients(id)                     |
| assigned_device_id    | UUID                |                                      |
| assignment_date       | TIMESTAMP TZ        |                                      |
| notes                 | TEXT                |                                      |
| location_start_lat    | DECIMAL(10,8)       |                                      |
| location_start_lng    | DECIMAL(11,8)       |                                      |
| location_end_lat      | DECIMAL(10,8)       |                                      |
| location_end_lng      | DECIMAL(11,8)       |                                      |
| length_meters         | INTEGER             |                                      |
| capacity              | VARCHAR(50)         |                                      |
| installation_date     | DATE                |                                      |
| last_maintenance_date | DATE                |                                      |
| ip_address            | INET                |                                      |
| subnet_mask           | VARCHAR(50)         |                                      |
| item_sku              | VARCHAR(100)        |                                      |
| quantity_in_stock     | INTEGER             |                                      |
| reorder_level         | INTEGER             |                                      |
| unit_cost             | DECIMAL(10,2)       |                                      |
| isp_company_id        | UUID                | FK → isp_companies(id)               |
| created_at            | TIMESTAMP TZ        | NOT NULL, DEFAULT now()              |
| updated_at            | TIMESTAMP TZ        | NOT NULL, DEFAULT now()              |

**Indexes:** category, status, assigned_customer, company

**RLS:** Company isolation

---

### Table: `inventory_history`
**Description:** Audit log of all changes and actions performed on inventory items.

| Column                | Type                | Constraints / Default                |
|-----------------------|---------------------|--------------------------------------|
| id                    | UUID                | PK, gen_random_uuid(), NOT NULL      |
| inventory_item_id     | UUID                | FK → inventory_items(id), NOT NULL   |
| action                | VARCHAR(100)        | NOT NULL                             |
| details               | TEXT                |                                      |
| performed_by          | UUID                | FK → profiles(id)                    |
| created_at            | TIMESTAMP TZ        | NOT NULL, DEFAULT now()              |
| isp_company_id        | UUID                | FK → isp_companies(id)               |

**Indexes:** inventory_item_id

**RLS:** Company isolation

---

## Wallet & Payments Domain

### Table: `wallet_transactions`
**Description:** Tracks all wallet credit, debit, payment, and refund activities for clients.

| Column                | Type                | Constraints / Default                |
|-----------------------|---------------------|--------------------------------------|
| id                    | UUID                | PK, gen_random_uuid(), NOT NULL      |
| client_id             | UUID                | FK → clients(id), ON DELETE CASCADE  |
| transaction_type      | VARCHAR(20)         | NOT NULL, CHECK (see code)           |
| amount                | NUMERIC             | NOT NULL                             |
| description           | TEXT                |                                      |
| reference_number      | VARCHAR(255)        |                                      |
| mpesa_receipt_number  | VARCHAR(255)        |                                      |
| created_at            | TIMESTAMP TZ        | DEFAULT now()                        |
| isp_company_id        | UUID                |                                      |

**RLS:** Company isolation

---

### Table: `mpesa_settings`
**Description:** Stores M-Pesa paybill and API configuration for each ISP company.

| Column                | Type                | Constraints / Default                |
|-----------------------|---------------------|--------------------------------------|
| id                    | UUID                | PK, gen_random_uuid(), NOT NULL      |
| isp_company_id        | UUID                | UNIQUE                               |
| paybill_number        | VARCHAR(20)         | NOT NULL                             |
| passkey               | TEXT                |                                      |
| consumer_key          | TEXT                |                                      |
| consumer_secret       | TEXT                |                                      |
| shortcode             | VARCHAR(20)         |                                      |
| is_active             | BOOLEAN             | DEFAULT true                         |
| created_at            | TIMESTAMP TZ        | DEFAULT now()                        |
| updated_at            | TIMESTAMP TZ        | DEFAULT now()                        |

**RLS:** Company isolation

---

## Messaging & Notifications

### Table: `internal_messages`
**Description:** Stores internal messages between users (profiles) within the ISP system.

| Column                | Type                | Constraints / Default                |
|-----------------------|---------------------|--------------------------------------|
| id                    | UUID                | PK, gen_random_uuid(), NOT NULL      |
| sender_id             | UUID                | FK → profiles(id), NOT NULL          |
| recipient_id          | UUID                | FK → profiles(id), NOT NULL          |
| subject               | TEXT                | NOT NULL                             |
| content               | TEXT                | NOT NULL                             |
| is_read               | BOOLEAN             | NOT NULL, DEFAULT false              |
| sent_at               | TIMESTAMP TZ        | NOT NULL, DEFAULT now()              |
| read_at               | TIMESTAMP TZ        |                                      |
| message_type          | VARCHAR(50)         | NOT NULL, DEFAULT 'email'            |
| attachments           | JSONB               | DEFAULT []                           |
| isp_company_id        | UUID                | FK → isp_companies(id)               |
| thread_id             | UUID                | DEFAULT gen_random_uuid()            |
| reply_to_id           | UUID                | FK → internal_messages(id)           |
| is_deleted            | BOOLEAN             | NOT NULL, DEFAULT false              |
| deleted_at            | TIMESTAMP TZ        |                                      |

**Indexes:** sender, recipient, thread

**RLS:** Sender/recipient only

---

### Table: `message_attachments`
**Description:** Stores file attachments for internal messages.

| Column                | Type                | Constraints / Default                |
|-----------------------|---------------------|--------------------------------------|
| id                    | UUID                | PK, gen_random_uuid(), NOT NULL      |
| message_id            | UUID                | FK → internal_messages(id), NOT NULL |
| file_name             | TEXT                | NOT NULL                             |
| file_size             | BIGINT              | NOT NULL                             |
| file_type             | TEXT                | NOT NULL                             |
| file_url              | TEXT                | NOT NULL                             |
| uploaded_at           | TIMESTAMP TZ        | NOT NULL, DEFAULT now()              |
| isp_company_id        | UUID                | FK → isp_companies(id)               |

**Indexes:** message_id

**RLS:** Sender/recipient only

---

### Table: `notifications`
**Description:** Stores system and user notifications for each profile.

| Column                | Type                | Constraints / Default                |
|-----------------------|---------------------|--------------------------------------|
| id                    | UUID                | PK, gen_random_uuid(), NOT NULL      |
| user_id               | UUID                | FK → profiles(id), NOT NULL          |
| title                 | TEXT                | NOT NULL                             |
| message               | TEXT                | NOT NULL                             |
| type                  | VARCHAR(50)         | NOT NULL, DEFAULT 'info'             |
| is_read               | BOOLEAN             | NOT NULL, DEFAULT false              |
| created_at            | TIMESTAMP TZ        | NOT NULL, DEFAULT now()              |
| read_at               | TIMESTAMP TZ        |                                      |
| related_entity_type   | VARCHAR(50)         |                                      |
| related_entity_id     | UUID                |                                      |
| action_url            | TEXT                |                                      |
| isp_company_id        | UUID                | FK → isp_companies(id)               |

**Indexes:** user+is_read

**RLS:** User only

---

## Support & Departments

### Table: `departments`
**Description:** Stores support and operational departments for each ISP company.

| Column                | Type                | Constraints / Default                |
|-----------------------|---------------------|--------------------------------------|
| id                    | UUID                | PK, gen_random_uuid(), NOT NULL      |
| name                  | VARCHAR(100)        | NOT NULL                             |
| description           | TEXT                |                                      |
| is_active             | BOOLEAN             | NOT NULL, DEFAULT true               |
| isp_company_id        | UUID                | FK → isp_companies(id)               |
| created_at            | TIMESTAMP TZ        | NOT NULL, DEFAULT now()              |
| updated_at            | TIMESTAMP TZ        | NOT NULL, DEFAULT now()              |

**RLS:** Company isolation

---

### Table: `ticket_assignments`
**Description:** Tracks assignment and routing history for support tickets.

| Column                | Type                | Constraints / Default                |
|-----------------------|---------------------|--------------------------------------|
| id                    | UUID                | PK, gen_random_uuid(), NOT NULL      |
| ticket_id             | UUID                | FK → support_tickets(id), NOT NULL   |
| assigned_from         | UUID                | FK → profiles(id)                    |
| assigned_to           | UUID                | FK → profiles(id)                    |
| department_id         | UUID                | FK → departments(id)                 |
| assignment_reason     | TEXT                |                                      |
| assigned_at           | TIMESTAMP TZ        | NOT NULL, DEFAULT now()              |
| completed_at          | TIMESTAMP TZ        |                                      |
| status                | VARCHAR(50)         | NOT NULL, DEFAULT 'active'           |
| notes                 | TEXT                |                                      |
| isp_company_id        | UUID                | FK → isp_companies(id)               |

**Indexes:** ticket_id, assigned_to

**RLS:** Company isolation

---

### Table: `ticket_comments`
**Description:** Stores comments and internal communication for support tickets.

| Column                | Type                | Constraints / Default                |
|-----------------------|---------------------|--------------------------------------|
| id                    | UUID                | PK, gen_random_uuid(), NOT NULL      |
| ticket_id             | UUID                | FK → support_tickets(id), NOT NULL   |
| author_id             | UUID                | FK → profiles(id), NOT NULL          |
| content               | TEXT                | NOT NULL                             |
| is_internal           | BOOLEAN             | NOT NULL, DEFAULT false              |
| is_resolution         | BOOLEAN             | NOT NULL, DEFAULT false              |
| created_at            | TIMESTAMP TZ        | NOT NULL, DEFAULT now()              |
| updated_at            | TIMESTAMP TZ        | NOT NULL, DEFAULT now()              |
| isp_company_id        | UUID                | FK → isp_companies(id)               |

**Indexes:** ticket_id

**RLS:** Company isolation

---

### Table: `notification_preferences`
**Description:** Stores user notification preferences (email, SMS, WhatsApp, etc).

| Column                | Type                | Constraints / Default                |
|-----------------------|---------------------|--------------------------------------|
| id                    | UUID                | PK, gen_random_uuid(), NOT NULL      |
| user_id               | UUID                | FK → profiles(id), NOT NULL          |
| email_notifications   | BOOLEAN             | NOT NULL, DEFAULT true               |
| sms_notifications     | BOOLEAN             | NOT NULL, DEFAULT false              |
| whatsapp_notifications| BOOLEAN             | NOT NULL, DEFAULT false              |
| notification_types    | JSONB               | NOT NULL, DEFAULT []                 |
| created_at            | TIMESTAMP TZ        | NOT NULL, DEFAULT now()              |
| updated_at            | TIMESTAMP TZ        | NOT NULL, DEFAULT now()              |

**RLS:** User only

---

## Network & Equipment

### Table: `equipment_types`
**Description:** Stores pre-defined equipment/device types for inventory and SNMP management.

| Column                | Type                | Constraints / Default                |
|-----------------------|---------------------|--------------------------------------|
| id                    | UUID                | PK, gen_random_uuid(), NOT NULL      |
| name                  | VARCHAR             | NOT NULL                             |
| brand                 | VARCHAR             | NOT NULL                             |
| model                 | VARCHAR             | NOT NULL                             |
| device_type           | VARCHAR             | NOT NULL, CHECK (see code)           |
| default_config        | JSONB               |                                      |
| snmp_settings         | JSONB               |                                      |
| created_at            | TIMESTAMP TZ        | DEFAULT now()                        |
| updated_at            | TIMESTAMP TZ        | DEFAULT now()                        |

**RLS:** Authenticated users

---

### Table: `client_equipment`
**Description:** Maps client accounts to assigned equipment/devices.

| Column                | Type                | Constraints / Default                |
|-----------------------|---------------------|--------------------------------------|
| id                    | UUID                | PK, gen_random_uuid(), NOT NULL      |
| client_id             | UUID                | FK → clients(id), NOT NULL           |
| equipment_id          | UUID                | FK → equipment(id), NOT NULL         |
| assigned_at           | TIMESTAMP TZ        | DEFAULT now()                        |
| assigned_by           | UUID                | FK → profiles(id)                    |
| is_primary            | BOOLEAN             | DEFAULT false                        |
| network_config        | JSONB               |                                      |
| created_at            | TIMESTAMP TZ        | DEFAULT now()                        |

**Indexes:** client_id, equipment_id

**RLS:** Company isolation

---

### Table: `network_events`
**Description:** Logs SNMP and network events for clients and equipment.

| Column                | Type                | Constraints / Default                |
|-----------------------|---------------------|--------------------------------------|
| id                    | UUID                | PK, gen_random_uuid(), NOT NULL      |
| client_id             | UUID                | FK → clients(id)                     |
| equipment_id          | UUID                | FK → equipment(id)                   |
| event_type            | VARCHAR             | NOT NULL, CHECK (see code)           |
| event_data            | JSONB               |                                      |
| triggered_by          | VARCHAR             | CHECK (see code)                     |
| success               | BOOLEAN             | DEFAULT true                         |
| error_message         | TEXT                |                                      |
| isp_company_id        | UUID                | FK → isp_companies(id)               |
| created_at            | TIMESTAMP TZ        | DEFAULT now()                        |

**Indexes:** client_id, created_at

**RLS:** Company isolation

---

## QoS & Monitoring

### Table: `qos_policies`
**Description:** Stores Quality of Service (QoS) policies for bandwidth and traffic management.

| Column                | Type                | Constraints / Default                |
|-----------------------|---------------------|--------------------------------------|
| id                    | UUID                | PK, gen_random_uuid(), NOT NULL      |
| name                  | VARCHAR             | NOT NULL                             |
| max_bandwidth_down    | INTEGER             | NOT NULL                             |
| max_bandwidth_up      | INTEGER             | NOT NULL                             |
| priority              | VARCHAR             | CHECK (see code), DEFAULT 'medium'   |
| burst_size            | INTEGER             |                                      |
| guaranteed_bandwidth  | INTEGER             |                                      |
| protocol              | VARCHAR             | CHECK (see code), DEFAULT 'both'     |
| is_active             | BOOLEAN             | DEFAULT true                         |
| isp_company_id        | UUID                | FK → isp_companies(id)               |
| created_at            | TIMESTAMP TZ        | DEFAULT now()                        |
| updated_at            | TIMESTAMP TZ        | DEFAULT now()                        |

**RLS:** Company isolation

---

### Table: `client_service_assignments`
**Description:** Tracks which service packages are assigned to which clients.

| Column                | Type                | Constraints / Default                |
|-----------------------|---------------------|--------------------------------------|
| id                    | UUID                | PK, gen_random_uuid(), NOT NULL      |
| client_id             | UUID                | FK → clients(id), NOT NULL           |
| service_package_id    | UUID                | FK → service_packages(id), NOT NULL  |
| assigned_at           | TIMESTAMP TZ        | DEFAULT now()                        |
| is_active             | BOOLEAN             | DEFAULT true                         |
| notes                 | TEXT                |                                      |
| isp_company_id        | UUID                | FK → isp_companies(id)               |
| created_at            | TIMESTAMP TZ        | DEFAULT now()                        |
| updated_at            | TIMESTAMP TZ        | DEFAULT now()                        |

**RLS:** Company isolation

---

### Table: `interface_statistics`
**Description:** Stores SNMP interface statistics for equipment monitoring.

| Column                | Type                | Constraints / Default                |
|-----------------------|---------------------|--------------------------------------|
| id                    | UUID                | PK, gen_random_uuid(), NOT NULL      |
| equipment_id          | UUID                | FK → equipment(id), NOT NULL         |
| interface_index       | INTEGER             | NOT NULL                             |
| interface_name        | VARCHAR             | NOT NULL                             |
| status                | VARCHAR             | CHECK (see code), DEFAULT 'down'     |
| utilization           | NUMERIC             | DEFAULT 0                            |
| errors                | INTEGER             | DEFAULT 0                            |
| speed                 | INTEGER             | DEFAULT 0                            |
| timestamp             | TIMESTAMP TZ        | DEFAULT now()                        |
| isp_company_id        | UUID                | FK → isp_companies(id)               |

**RLS:** Company isolation

---

### Table: `bandwidth_statistics`
**Description:** Stores bandwidth usage statistics for equipment.

| Column                | Type                | Constraints / Default                |
|-----------------------|---------------------|--------------------------------------|
| id                    | UUID                | PK, gen_random_uuid(), NOT NULL      |
| equipment_id          | UUID                | FK → equipment(id), NOT NULL         |
| in_octets             | BIGINT              | DEFAULT 0                            |
| out_octets            | BIGINT              | DEFAULT 0                            |
| in_packets            | BIGINT              | DEFAULT 0                            |
| out_packets           | BIGINT              | DEFAULT 0                            |
| timestamp             | TIMESTAMP TZ        | DEFAULT now()                        |
| isp_company_id        | UUID                | FK → isp_companies(id)               |

**RLS:** Company isolation

---

## External Users

### Table: `external_users`
**Description:** Stores external technicians and contractors for field operations.

| Column                | Type                | Constraints / Default                |
|-----------------------|---------------------|--------------------------------------|
| id                    | UUID                | PK, gen_random_uuid(), NOT NULL      |
| email                 | VARCHAR             | NOT NULL, UNIQUE                     |
| first_name            | VARCHAR             | NOT NULL                             |
| last_name             | VARCHAR             | NOT NULL                             |
| phone                 | VARCHAR             |                                      |
| role                  | VARCHAR             | NOT NULL, CHECK (see code)           |
| is_active             | BOOLEAN             | NOT NULL, DEFAULT true               |
| company_name          | VARCHAR             |                                      |
| specializations       | TEXT[]              | DEFAULT {}                           |
| hourly_rate           | NUMERIC             |                                      |
| created_at            | TIMESTAMP TZ        | NOT NULL, DEFAULT now()              |
| updated_at            | TIMESTAMP TZ        | NOT NULL, DEFAULT now()              |
| isp_company_id        | UUID                | FK → isp_companies(id)               |

**Indexes:** company, role, is_active

**RLS:** Company isolation

---

### Table: `notification_logs`
**Description:** Tracks notification delivery and status for support tickets.

| Column                | Type                | Constraints / Default                |
|-----------------------|---------------------|--------------------------------------|
| id                    | UUID                | PK, gen_random_uuid(), NOT NULL      |
| ticket_id             | UUID                | FK → support_tickets(id)             |
| type                  | VARCHAR             | NOT NULL                             |
| channels              | TEXT[]              | NOT NULL                             |
| recipients            | TEXT[]              | NOT NULL                             |
| status                | VARCHAR             | NOT NULL, DEFAULT 'pending'          |
| metadata              | JSONB               |                                      |
| created_at            | TIMESTAMP TZ        | NOT NULL, DEFAULT now()              |
| isp_company_id        | UUID                | FK → isp_companies(id)               |

**RLS:** Company isolation

---

## Edge Functions

| Function Directory                  | Description (inferred from name)                       |
|-------------------------------------|--------------------------------------------------------|
| authenticated-client-registration   | Registers a new client with authentication             |
| check-payment-status                | Checks the status of a payment                        |
| client-auth                         | Handles client authentication                         |
| client-dashboard-data               | Provides dashboard data for clients                   |
| client-registration                 | Registers a new client                                |
| create-user-account                 | Creates a new user account                            |
| delete-user-account                 | Deletes a user account                                |
| generate-receipt                    | Generates a payment receipt                           |
| get-invoice-details                 | Retrieves invoice details                             |
| get-payment-history                 | Retrieves payment history                             |
| mpesa-callback                      | Handles M-Pesa payment callbacks                      |
| mpesa-query-status                  | Queries the status of an M-Pesa transaction           |
| mpesa-register-callback             | Registers a callback URL for M-Pesa                   |
| mpesa-stk-push                      | Initiates an M-Pesa STK push payment                  |
| package-renewal                     | Handles service package renewals                      |
| process-payment                     | Processes a payment                                   |
| send-notifications                  | Sends notifications to users                          |
| send-ticket-notifications           | Sends notifications related to support tickets        |
| send-user-credentials               | Sends user credentials (e.g., after registration)     |
| submit-support-ticket                | Submits a new support ticket                         |
| ticket-workflow                     | Manages support ticket workflow                       |
| update-client-profile                | Updates a client's profile                            |
| wallet-credit                        | Credits a client's wallet                             |

---

## Functions & Triggers

- `generate_voucher_code()`: Generates unique voucher codes for hotspot vouchers.
- `end_expired_sessions()`: Automatically ends expired hotspot sessions.
- `generate_inventory_item_id()`: Auto-generates inventory item IDs based on category.
- `log_inventory_change()`: Logs inventory changes to `inventory_history`.
- `process_subscription_renewal(p_client_id UUID)`: Handles wallet-based subscription renewals for clients.
- `check_wallet_based_renewals()`: Sends renewal reminders and checks wallet balances.
- `handle_automatic_renewals()`: Renews subscriptions or suspends clients based on wallet balance.
- `notify_message_recipient()`: Notifies a user when they receive a new internal message.

**Triggers:**
- `trigger_generate_inventory_item_id`: Before insert on `inventory_items`, auto-generates item_id.
- `trigger_log_inventory_change`: After insert/update on `inventory_items`, logs changes.
- `trigger_notify_message_recipient`: After insert on `internal_messages`, notifies recipient.

---

## Row Level Security (RLS) & Policies
- RLS enabled on all main tables for company isolation.
- Policies restrict access to data by `isp_company_id` or user.
- Only users from the same company can view, insert, update, or delete their data.
- Some tables (e.g., `internal_messages`, `notifications`, `notification_preferences`) have user-specific RLS.

---

**Note:**
- Many tables reference `clients`, `isp_companies`, `profiles`, and `support_tickets` (not shown here, see migrations for full details).
- For a full list of all columns, constraints, and relationships, see the SQL migration files in `supabase/migrations/`. 