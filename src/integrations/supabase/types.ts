export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  public: {
    Tables: {
      base_stations: {
        Row: {
          coverage_radius: number | null
          created_at: string | null
          equipment_details: Json | null
          id: string
          isp_company_id: string | null
          latitude: number
          location: string
          longitude: number
          name: string
          status: string | null
          updated_at: string | null
        }
        Insert: {
          coverage_radius?: number | null
          created_at?: string | null
          equipment_details?: Json | null
          id?: string
          isp_company_id?: string | null
          latitude: number
          location: string
          longitude: number
          name: string
          status?: string | null
          updated_at?: string | null
        }
        Update: {
          coverage_radius?: number | null
          created_at?: string | null
          equipment_details?: Json | null
          id?: string
          isp_company_id?: string | null
          latitude?: number
          location?: string
          longitude?: number
          name?: string
          status?: string | null
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "base_stations_isp_company_id_fkey"
            columns: ["isp_company_id"]
            isOneToOne: false
            referencedRelation: "isp_companies"
            referencedColumns: ["id"]
          },
        ]
      }
      client_equipment: {
        Row: {
          assigned_at: string | null
          assigned_by: string | null
          client_id: string
          created_at: string | null
          equipment_id: string
          id: string
          is_primary: boolean | null
          network_config: Json | null
        }
        Insert: {
          assigned_at?: string | null
          assigned_by?: string | null
          client_id: string
          created_at?: string | null
          equipment_id: string
          id?: string
          is_primary?: boolean | null
          network_config?: Json | null
        }
        Update: {
          assigned_at?: string | null
          assigned_by?: string | null
          client_id?: string
          created_at?: string | null
          equipment_id?: string
          id?: string
          is_primary?: boolean | null
          network_config?: Json | null
        }
        Relationships: [
          {
            foreignKeyName: "client_equipment_assigned_by_fkey"
            columns: ["assigned_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "client_equipment_client_id_fkey"
            columns: ["client_id"]
            isOneToOne: false
            referencedRelation: "clients"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "client_equipment_equipment_id_fkey"
            columns: ["equipment_id"]
            isOneToOne: false
            referencedRelation: "equipment"
            referencedColumns: ["id"]
          },
        ]
      }
      clients: {
        Row: {
          address: string
          balance: number | null
          client_type: Database["public"]["Enums"]["client_type"]
          connection_type: Database["public"]["Enums"]["connection_type"]
          county: string
          created_at: string | null
          email: string | null
          id: string
          id_number: string
          installation_date: string | null
          is_active: boolean
          isp_company_id: string | null
          kra_pin_number: string | null
          latitude: number | null
          longitude: number | null
          monthly_rate: number
          mpesa_number: string | null
          name: string
          phone: string
          service_package_id: string | null
          status: Database["public"]["Enums"]["client_status"] | null
          sub_county: string
          subscription_end_date: string | null
          subscription_start_date: string | null
          subscription_type: string | null
          updated_at: string | null
          wallet_balance: number | null
        }
        Insert: {
          address: string
          balance?: number | null
          client_type: Database["public"]["Enums"]["client_type"]
          connection_type: Database["public"]["Enums"]["connection_type"]
          county: string
          created_at?: string | null
          email?: string | null
          id?: string
          id_number: string
          installation_date?: string | null
          is_active?: boolean
          isp_company_id?: string | null
          kra_pin_number?: string | null
          latitude?: number | null
          longitude?: number | null
          monthly_rate: number
          mpesa_number?: string | null
          name: string
          phone: string
          service_package_id?: string | null
          status?: Database["public"]["Enums"]["client_status"] | null
          sub_county: string
          subscription_end_date?: string | null
          subscription_start_date?: string | null
          subscription_type?: string | null
          updated_at?: string | null
          wallet_balance?: number | null
        }
        Update: {
          address?: string
          balance?: number | null
          client_type?: Database["public"]["Enums"]["client_type"]
          connection_type?: Database["public"]["Enums"]["connection_type"]
          county?: string
          created_at?: string | null
          email?: string | null
          id?: string
          id_number?: string
          installation_date?: string | null
          is_active?: boolean
          isp_company_id?: string | null
          kra_pin_number?: string | null
          latitude?: number | null
          longitude?: number | null
          monthly_rate?: number
          mpesa_number?: string | null
          name?: string
          phone?: string
          service_package_id?: string | null
          status?: Database["public"]["Enums"]["client_status"] | null
          sub_county?: string
          subscription_end_date?: string | null
          subscription_start_date?: string | null
          subscription_type?: string | null
          updated_at?: string | null
          wallet_balance?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "clients_isp_company_id_fkey"
            columns: ["isp_company_id"]
            isOneToOne: false
            referencedRelation: "isp_companies"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "clients_service_package_id_fkey"
            columns: ["service_package_id"]
            isOneToOne: false
            referencedRelation: "service_packages"
            referencedColumns: ["id"]
          },
        ]
      }
      equipment: {
        Row: {
          approval_status: string | null
          approved_at: string | null
          approved_by: string | null
          auto_discovered: boolean | null
          base_station_id: string | null
          brand: string | null
          client_id: string | null
          created_at: string | null
          equipment_type_id: string | null
          id: string
          ip_address: unknown | null
          isp_company_id: string | null
          location_coordinates: unknown | null
          mac_address: string | null
          model: string | null
          notes: string | null
          port_number: number | null
          purchase_date: string | null
          serial_number: string
          snmp_community: string | null
          snmp_version: number | null
          status: string | null
          type: string
          updated_at: string | null
          vlan_id: number | null
          warranty_end_date: string | null
        }
        Insert: {
          approval_status?: string | null
          approved_at?: string | null
          approved_by?: string | null
          auto_discovered?: boolean | null
          base_station_id?: string | null
          brand?: string | null
          client_id?: string | null
          created_at?: string | null
          equipment_type_id?: string | null
          id?: string
          ip_address?: unknown | null
          isp_company_id?: string | null
          location_coordinates?: unknown | null
          mac_address?: string | null
          model?: string | null
          notes?: string | null
          port_number?: number | null
          purchase_date?: string | null
          serial_number: string
          snmp_community?: string | null
          snmp_version?: number | null
          status?: string | null
          type: string
          updated_at?: string | null
          vlan_id?: number | null
          warranty_end_date?: string | null
        }
        Update: {
          approval_status?: string | null
          approved_at?: string | null
          approved_by?: string | null
          auto_discovered?: boolean | null
          base_station_id?: string | null
          brand?: string | null
          client_id?: string | null
          created_at?: string | null
          equipment_type_id?: string | null
          id?: string
          ip_address?: unknown | null
          isp_company_id?: string | null
          location_coordinates?: unknown | null
          mac_address?: string | null
          model?: string | null
          notes?: string | null
          port_number?: number | null
          purchase_date?: string | null
          serial_number?: string
          snmp_community?: string | null
          snmp_version?: number | null
          status?: string | null
          type?: string
          updated_at?: string | null
          vlan_id?: number | null
          warranty_end_date?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "equipment_approved_by_fkey"
            columns: ["approved_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "equipment_base_station_id_fkey"
            columns: ["base_station_id"]
            isOneToOne: false
            referencedRelation: "base_stations"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "equipment_client_id_fkey"
            columns: ["client_id"]
            isOneToOne: false
            referencedRelation: "clients"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "equipment_equipment_type_id_fkey"
            columns: ["equipment_type_id"]
            isOneToOne: false
            referencedRelation: "equipment_types"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "equipment_isp_company_id_fkey"
            columns: ["isp_company_id"]
            isOneToOne: false
            referencedRelation: "isp_companies"
            referencedColumns: ["id"]
          },
        ]
      }
      equipment_types: {
        Row: {
          brand: string
          created_at: string | null
          default_config: Json | null
          device_type: string
          id: string
          model: string
          name: string
          snmp_settings: Json | null
          updated_at: string | null
        }
        Insert: {
          brand: string
          created_at?: string | null
          default_config?: Json | null
          device_type: string
          id?: string
          model: string
          name: string
          snmp_settings?: Json | null
          updated_at?: string | null
        }
        Update: {
          brand?: string
          created_at?: string | null
          default_config?: Json | null
          device_type?: string
          id?: string
          model?: string
          name?: string
          snmp_settings?: Json | null
          updated_at?: string | null
        }
        Relationships: []
      }
      inventory_history: {
        Row: {
          action: string
          created_at: string
          details: string | null
          id: string
          inventory_item_id: string
          isp_company_id: string | null
          performed_by: string | null
        }
        Insert: {
          action: string
          created_at?: string
          details?: string | null
          id?: string
          inventory_item_id: string
          isp_company_id?: string | null
          performed_by?: string | null
        }
        Update: {
          action?: string
          created_at?: string
          details?: string | null
          id?: string
          inventory_item_id?: string
          isp_company_id?: string | null
          performed_by?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "inventory_history_inventory_item_id_fkey"
            columns: ["inventory_item_id"]
            isOneToOne: false
            referencedRelation: "inventory_items"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "inventory_history_isp_company_id_fkey"
            columns: ["isp_company_id"]
            isOneToOne: false
            referencedRelation: "isp_companies"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "inventory_history_performed_by_fkey"
            columns: ["performed_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      inventory_items: {
        Row: {
          assigned_customer_id: string | null
          assigned_device_id: string | null
          assignment_date: string | null
          capacity: string | null
          category: string
          cost: number | null
          created_at: string
          id: string
          installation_date: string | null
          ip_address: unknown | null
          isp_company_id: string | null
          item_id: string
          item_sku: string | null
          last_maintenance_date: string | null
          length_meters: number | null
          location: string | null
          location_end_lat: number | null
          location_end_lng: number | null
          location_start_lat: number | null
          location_start_lng: number | null
          mac_address: string | null
          manufacturer: string | null
          model: string | null
          name: string | null
          notes: string | null
          purchase_date: string | null
          quantity_in_stock: number | null
          reorder_level: number | null
          serial_number: string | null
          status: string
          subnet_mask: string | null
          supplier: string | null
          type: string
          unit_cost: number | null
          updated_at: string
          warranty_expiry_date: string | null
        }
        Insert: {
          assigned_customer_id?: string | null
          assigned_device_id?: string | null
          assignment_date?: string | null
          capacity?: string | null
          category: string
          cost?: number | null
          created_at?: string
          id?: string
          installation_date?: string | null
          ip_address?: unknown | null
          isp_company_id?: string | null
          item_id: string
          item_sku?: string | null
          last_maintenance_date?: string | null
          length_meters?: number | null
          location?: string | null
          location_end_lat?: number | null
          location_end_lng?: number | null
          location_start_lat?: number | null
          location_start_lng?: number | null
          mac_address?: string | null
          manufacturer?: string | null
          model?: string | null
          name?: string | null
          notes?: string | null
          purchase_date?: string | null
          quantity_in_stock?: number | null
          reorder_level?: number | null
          serial_number?: string | null
          status?: string
          subnet_mask?: string | null
          supplier?: string | null
          type: string
          unit_cost?: number | null
          updated_at?: string
          warranty_expiry_date?: string | null
        }
        Update: {
          assigned_customer_id?: string | null
          assigned_device_id?: string | null
          assignment_date?: string | null
          capacity?: string | null
          category?: string
          cost?: number | null
          created_at?: string
          id?: string
          installation_date?: string | null
          ip_address?: unknown | null
          isp_company_id?: string | null
          item_id?: string
          item_sku?: string | null
          last_maintenance_date?: string | null
          length_meters?: number | null
          location?: string | null
          location_end_lat?: number | null
          location_end_lng?: number | null
          location_start_lat?: number | null
          location_start_lng?: number | null
          mac_address?: string | null
          manufacturer?: string | null
          model?: string | null
          name?: string | null
          notes?: string | null
          purchase_date?: string | null
          quantity_in_stock?: number | null
          reorder_level?: number | null
          serial_number?: string | null
          status?: string
          subnet_mask?: string | null
          supplier?: string | null
          type?: string
          unit_cost?: number | null
          updated_at?: string
          warranty_expiry_date?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "inventory_items_assigned_customer_id_fkey"
            columns: ["assigned_customer_id"]
            isOneToOne: false
            referencedRelation: "clients"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "inventory_items_isp_company_id_fkey"
            columns: ["isp_company_id"]
            isOneToOne: false
            referencedRelation: "isp_companies"
            referencedColumns: ["id"]
          },
        ]
      }
      invoices: {
        Row: {
          amount: number
          client_id: string | null
          created_at: string | null
          due_date: string
          id: string
          invoice_number: string
          isp_company_id: string | null
          notes: string | null
          service_period_end: string
          service_period_start: string
          status: string | null
          total_amount: number
          updated_at: string | null
          vat_amount: number
        }
        Insert: {
          amount: number
          client_id?: string | null
          created_at?: string | null
          due_date: string
          id?: string
          invoice_number: string
          isp_company_id?: string | null
          notes?: string | null
          service_period_end: string
          service_period_start: string
          status?: string | null
          total_amount: number
          updated_at?: string | null
          vat_amount: number
        }
        Update: {
          amount?: number
          client_id?: string | null
          created_at?: string | null
          due_date?: string
          id?: string
          invoice_number?: string
          isp_company_id?: string | null
          notes?: string | null
          service_period_end?: string
          service_period_start?: string
          status?: string | null
          total_amount?: number
          updated_at?: string | null
          vat_amount?: number
        }
        Relationships: [
          {
            foreignKeyName: "invoices_client_id_fkey"
            columns: ["client_id"]
            isOneToOne: false
            referencedRelation: "clients"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "invoices_isp_company_id_fkey"
            columns: ["isp_company_id"]
            isOneToOne: false
            referencedRelation: "isp_companies"
            referencedColumns: ["id"]
          },
        ]
      }
      isp_companies: {
        Row: {
          address: string | null
          ca_license_number: string | null
          client_limit: number | null
          county: string | null
          created_at: string | null
          email: string | null
          id: string
          is_active: boolean | null
          kra_pin: string | null
          license_key: string
          license_type: Database["public"]["Enums"]["license_type"]
          name: string
          phone: string | null
          sub_county: string | null
          subscription_end_date: string | null
          updated_at: string | null
        }
        Insert: {
          address?: string | null
          ca_license_number?: string | null
          client_limit?: number | null
          county?: string | null
          created_at?: string | null
          email?: string | null
          id?: string
          is_active?: boolean | null
          kra_pin?: string | null
          license_key: string
          license_type?: Database["public"]["Enums"]["license_type"]
          name: string
          phone?: string | null
          sub_county?: string | null
          subscription_end_date?: string | null
          updated_at?: string | null
        }
        Update: {
          address?: string | null
          ca_license_number?: string | null
          client_limit?: number | null
          county?: string | null
          created_at?: string | null
          email?: string | null
          id?: string
          is_active?: boolean | null
          kra_pin?: string | null
          license_key?: string
          license_type?: Database["public"]["Enums"]["license_type"]
          name?: string
          phone?: string | null
          sub_county?: string | null
          subscription_end_date?: string | null
          updated_at?: string | null
        }
        Relationships: []
      }
      mpesa_settings: {
        Row: {
          consumer_key: string | null
          consumer_secret: string | null
          created_at: string | null
          id: string
          is_active: boolean | null
          isp_company_id: string | null
          passkey: string | null
          paybill_number: string
          shortcode: string | null
          updated_at: string | null
        }
        Insert: {
          consumer_key?: string | null
          consumer_secret?: string | null
          created_at?: string | null
          id?: string
          is_active?: boolean | null
          isp_company_id?: string | null
          passkey?: string | null
          paybill_number: string
          shortcode?: string | null
          updated_at?: string | null
        }
        Update: {
          consumer_key?: string | null
          consumer_secret?: string | null
          created_at?: string | null
          id?: string
          is_active?: boolean | null
          isp_company_id?: string | null
          passkey?: string | null
          paybill_number?: string
          shortcode?: string | null
          updated_at?: string | null
        }
        Relationships: []
      }
      network_events: {
        Row: {
          client_id: string | null
          created_at: string | null
          equipment_id: string | null
          error_message: string | null
          event_data: Json | null
          event_type: string
          id: string
          isp_company_id: string | null
          success: boolean | null
          triggered_by: string | null
        }
        Insert: {
          client_id?: string | null
          created_at?: string | null
          equipment_id?: string | null
          error_message?: string | null
          event_data?: Json | null
          event_type: string
          id?: string
          isp_company_id?: string | null
          success?: boolean | null
          triggered_by?: string | null
        }
        Update: {
          client_id?: string | null
          created_at?: string | null
          equipment_id?: string | null
          error_message?: string | null
          event_data?: Json | null
          event_type?: string
          id?: string
          isp_company_id?: string | null
          success?: boolean | null
          triggered_by?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "network_events_client_id_fkey"
            columns: ["client_id"]
            isOneToOne: false
            referencedRelation: "clients"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "network_events_equipment_id_fkey"
            columns: ["equipment_id"]
            isOneToOne: false
            referencedRelation: "equipment"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "network_events_isp_company_id_fkey"
            columns: ["isp_company_id"]
            isOneToOne: false
            referencedRelation: "isp_companies"
            referencedColumns: ["id"]
          },
        ]
      }
      payments: {
        Row: {
          amount: number
          client_id: string | null
          created_at: string | null
          id: string
          invoice_id: string | null
          isp_company_id: string | null
          mpesa_receipt_number: string | null
          notes: string | null
          payment_date: string | null
          payment_method: Database["public"]["Enums"]["payment_method"]
          reference_number: string | null
        }
        Insert: {
          amount: number
          client_id?: string | null
          created_at?: string | null
          id?: string
          invoice_id?: string | null
          isp_company_id?: string | null
          mpesa_receipt_number?: string | null
          notes?: string | null
          payment_date?: string | null
          payment_method: Database["public"]["Enums"]["payment_method"]
          reference_number?: string | null
        }
        Update: {
          amount?: number
          client_id?: string | null
          created_at?: string | null
          id?: string
          invoice_id?: string | null
          isp_company_id?: string | null
          mpesa_receipt_number?: string | null
          notes?: string | null
          payment_date?: string | null
          payment_method?: Database["public"]["Enums"]["payment_method"]
          reference_number?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "payments_client_id_fkey"
            columns: ["client_id"]
            isOneToOne: false
            referencedRelation: "clients"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "payments_invoice_id_fkey"
            columns: ["invoice_id"]
            isOneToOne: false
            referencedRelation: "invoices"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "payments_isp_company_id_fkey"
            columns: ["isp_company_id"]
            isOneToOne: false
            referencedRelation: "isp_companies"
            referencedColumns: ["id"]
          },
        ]
      }
      profiles: {
        Row: {
          avatar_url: string | null
          created_at: string | null
          first_name: string | null
          id: string
          is_active: boolean | null
          isp_company_id: string | null
          last_name: string | null
          phone: string | null
          role: Database["public"]["Enums"]["user_role"]
          updated_at: string | null
        }
        Insert: {
          avatar_url?: string | null
          created_at?: string | null
          first_name?: string | null
          id: string
          is_active?: boolean | null
          isp_company_id?: string | null
          last_name?: string | null
          phone?: string | null
          role?: Database["public"]["Enums"]["user_role"]
          updated_at?: string | null
        }
        Update: {
          avatar_url?: string | null
          created_at?: string | null
          first_name?: string | null
          id?: string
          is_active?: boolean | null
          isp_company_id?: string | null
          last_name?: string | null
          phone?: string | null
          role?: Database["public"]["Enums"]["user_role"]
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "profiles_isp_company_id_fkey"
            columns: ["isp_company_id"]
            isOneToOne: false
            referencedRelation: "isp_companies"
            referencedColumns: ["id"]
          },
        ]
      }
      service_packages: {
        Row: {
          connection_types: Database["public"]["Enums"]["connection_type"][]
          created_at: string | null
          description: string | null
          id: string
          is_active: boolean | null
          isp_company_id: string | null
          monthly_rate: number
          name: string
          speed: string
          updated_at: string | null
        }
        Insert: {
          connection_types: Database["public"]["Enums"]["connection_type"][]
          created_at?: string | null
          description?: string | null
          id?: string
          is_active?: boolean | null
          isp_company_id?: string | null
          monthly_rate: number
          name: string
          speed: string
          updated_at?: string | null
        }
        Update: {
          connection_types?: Database["public"]["Enums"]["connection_type"][]
          created_at?: string | null
          description?: string | null
          id?: string
          is_active?: boolean | null
          isp_company_id?: string | null
          monthly_rate?: number
          name?: string
          speed?: string
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "service_packages_isp_company_id_fkey"
            columns: ["isp_company_id"]
            isOneToOne: false
            referencedRelation: "isp_companies"
            referencedColumns: ["id"]
          },
        ]
      }
      support_tickets: {
        Row: {
          assigned_to: string | null
          client_id: string | null
          created_at: string | null
          created_by: string | null
          description: string
          id: string
          isp_company_id: string | null
          priority: Database["public"]["Enums"]["ticket_priority"] | null
          resolution: string | null
          resolved_at: string | null
          status: Database["public"]["Enums"]["ticket_status"] | null
          title: string
          updated_at: string | null
        }
        Insert: {
          assigned_to?: string | null
          client_id?: string | null
          created_at?: string | null
          created_by?: string | null
          description: string
          id?: string
          isp_company_id?: string | null
          priority?: Database["public"]["Enums"]["ticket_priority"] | null
          resolution?: string | null
          resolved_at?: string | null
          status?: Database["public"]["Enums"]["ticket_status"] | null
          title: string
          updated_at?: string | null
        }
        Update: {
          assigned_to?: string | null
          client_id?: string | null
          created_at?: string | null
          created_by?: string | null
          description?: string
          id?: string
          isp_company_id?: string | null
          priority?: Database["public"]["Enums"]["ticket_priority"] | null
          resolution?: string | null
          resolved_at?: string | null
          status?: Database["public"]["Enums"]["ticket_status"] | null
          title?: string
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "support_tickets_assigned_to_fkey"
            columns: ["assigned_to"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "support_tickets_client_id_fkey"
            columns: ["client_id"]
            isOneToOne: false
            referencedRelation: "clients"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "support_tickets_created_by_fkey"
            columns: ["created_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "support_tickets_isp_company_id_fkey"
            columns: ["isp_company_id"]
            isOneToOne: false
            referencedRelation: "isp_companies"
            referencedColumns: ["id"]
          },
        ]
      }
      wallet_transactions: {
        Row: {
          amount: number
          client_id: string | null
          created_at: string | null
          description: string | null
          id: string
          isp_company_id: string | null
          mpesa_receipt_number: string | null
          reference_number: string | null
          transaction_type: string
        }
        Insert: {
          amount: number
          client_id?: string | null
          created_at?: string | null
          description?: string | null
          id?: string
          isp_company_id?: string | null
          mpesa_receipt_number?: string | null
          reference_number?: string | null
          transaction_type: string
        }
        Update: {
          amount?: number
          client_id?: string | null
          created_at?: string | null
          description?: string | null
          id?: string
          isp_company_id?: string | null
          mpesa_receipt_number?: string | null
          reference_number?: string | null
          transaction_type?: string
        }
        Relationships: [
          {
            foreignKeyName: "wallet_transactions_client_id_fkey"
            columns: ["client_id"]
            isOneToOne: false
            referencedRelation: "clients"
            referencedColumns: ["id"]
          },
        ]
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      check_renewal_reminders: {
        Args: Record<PropertyKey, never>
        Returns: undefined
      }
      check_wallet_based_renewals: {
        Args: Record<PropertyKey, never>
        Returns: undefined
      }
      get_current_user_company_id: {
        Args: Record<PropertyKey, never>
        Returns: string
      }
      get_current_user_role: {
        Args: Record<PropertyKey, never>
        Returns: string
      }
      handle_automatic_renewals: {
        Args: Record<PropertyKey, never>
        Returns: undefined
      }
      handle_service_expiry: {
        Args: Record<PropertyKey, never>
        Returns: undefined
      }
      is_admin: {
        Args: Record<PropertyKey, never>
        Returns: boolean
      }
      process_subscription_renewal: {
        Args: { p_client_id: string }
        Returns: Json
      }
    }
    Enums: {
      client_status: "active" | "suspended" | "disconnected" | "pending"
      client_type: "individual" | "business" | "corporate" | "government"
      connection_type: "fiber" | "wireless" | "satellite" | "dsl"
      license_type: "starter" | "professional" | "enterprise" | "unlimited"
      payment_method: "mpesa" | "bank" | "cash"
      ticket_priority: "low" | "medium" | "high" | "urgent"
      ticket_status: "open" | "in_progress" | "resolved" | "closed"
      user_role:
        | "super_admin"
        | "isp_admin"
        | "manager"
        | "technician"
        | "support"
        | "billing"
        | "readonly"
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}

type DefaultSchema = Database[Extract<keyof Database, "public">]

export type Tables<
  DefaultSchemaTableNameOrOptions extends
    | keyof (DefaultSchema["Tables"] & DefaultSchema["Views"])
    | { schema: keyof Database },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof (Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
        Database[DefaultSchemaTableNameOrOptions["schema"]]["Views"])
    : never = never,
> = DefaultSchemaTableNameOrOptions extends { schema: keyof Database }
  ? (Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
      Database[DefaultSchemaTableNameOrOptions["schema"]]["Views"])[TableName] extends {
      Row: infer R
    }
    ? R
    : never
  : DefaultSchemaTableNameOrOptions extends keyof (DefaultSchema["Tables"] &
        DefaultSchema["Views"])
    ? (DefaultSchema["Tables"] &
        DefaultSchema["Views"])[DefaultSchemaTableNameOrOptions] extends {
        Row: infer R
      }
      ? R
      : never
    : never

export type TablesInsert<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof Database },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends { schema: keyof Database }
  ? Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Insert: infer I
    }
    ? I
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Insert: infer I
      }
      ? I
      : never
    : never

export type TablesUpdate<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof Database },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends { schema: keyof Database }
  ? Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Update: infer U
    }
    ? U
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Update: infer U
      }
      ? U
      : never
    : never

export type Enums<
  DefaultSchemaEnumNameOrOptions extends
    | keyof DefaultSchema["Enums"]
    | { schema: keyof Database },
  EnumName extends DefaultSchemaEnumNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof Database[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"]
    : never = never,
> = DefaultSchemaEnumNameOrOptions extends { schema: keyof Database }
  ? Database[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : DefaultSchemaEnumNameOrOptions extends keyof DefaultSchema["Enums"]
    ? DefaultSchema["Enums"][DefaultSchemaEnumNameOrOptions]
    : never

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
    | keyof DefaultSchema["CompositeTypes"]
    | { schema: keyof Database },
  CompositeTypeName extends PublicCompositeTypeNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof Database[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never = never,
> = PublicCompositeTypeNameOrOptions extends { schema: keyof Database }
  ? Database[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof DefaultSchema["CompositeTypes"]
    ? DefaultSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
    : never

export const Constants = {
  public: {
    Enums: {
      client_status: ["active", "suspended", "disconnected", "pending"],
      client_type: ["individual", "business", "corporate", "government"],
      connection_type: ["fiber", "wireless", "satellite", "dsl"],
      license_type: ["starter", "professional", "enterprise", "unlimited"],
      payment_method: ["mpesa", "bank", "cash"],
      ticket_priority: ["low", "medium", "high", "urgent"],
      ticket_status: ["open", "in_progress", "resolved", "closed"],
      user_role: [
        "super_admin",
        "isp_admin",
        "manager",
        "technician",
        "support",
        "billing",
        "readonly",
      ],
    },
  },
} as const
