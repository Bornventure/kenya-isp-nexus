export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  // Allows to automatically instantiate createClient with right options
  // instead of createClient<Database, { PostgrestVersion: 'XX' }>(URL, KEY)
  __InternalSupabase: {
    PostgrestVersion: "12.2.3 (519615d)"
  }
  public: {
    Tables: {
      audit_logs: {
        Row: {
          action: string
          changes: Json | null
          created_at: string
          error_message: string | null
          id: string
          ip_address: unknown | null
          isp_company_id: string | null
          resource: string
          resource_id: string | null
          success: boolean
          timestamp: string
          user_agent: string | null
          user_email: string | null
          user_id: string | null
        }
        Insert: {
          action: string
          changes?: Json | null
          created_at?: string
          error_message?: string | null
          id?: string
          ip_address?: unknown | null
          isp_company_id?: string | null
          resource: string
          resource_id?: string | null
          success?: boolean
          timestamp?: string
          user_agent?: string | null
          user_email?: string | null
          user_id?: string | null
        }
        Update: {
          action?: string
          changes?: Json | null
          created_at?: string
          error_message?: string | null
          id?: string
          ip_address?: unknown | null
          isp_company_id?: string | null
          resource?: string
          resource_id?: string | null
          success?: boolean
          timestamp?: string
          user_agent?: string | null
          user_email?: string | null
          user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "audit_logs_isp_company_id_fkey"
            columns: ["isp_company_id"]
            isOneToOne: false
            referencedRelation: "isp_companies"
            referencedColumns: ["id"]
          },
        ]
      }
      auto_notification_settings: {
        Row: {
          created_at: string | null
          delay_minutes: number | null
          id: string
          is_enabled: boolean | null
          isp_company_id: string | null
          retry_attempts: number | null
          retry_delay_minutes: number | null
          trigger_event: string
          updated_at: string | null
        }
        Insert: {
          created_at?: string | null
          delay_minutes?: number | null
          id?: string
          is_enabled?: boolean | null
          isp_company_id?: string | null
          retry_attempts?: number | null
          retry_delay_minutes?: number | null
          trigger_event: string
          updated_at?: string | null
        }
        Update: {
          created_at?: string | null
          delay_minutes?: number | null
          id?: string
          is_enabled?: boolean | null
          isp_company_id?: string | null
          retry_attempts?: number | null
          retry_delay_minutes?: number | null
          trigger_event?: string
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "auto_notification_settings_isp_company_id_fkey"
            columns: ["isp_company_id"]
            isOneToOne: false
            referencedRelation: "isp_companies"
            referencedColumns: ["id"]
          },
        ]
      }
      bandwidth_statistics: {
        Row: {
          client_id: string | null
          equipment_id: string
          id: string
          in_octets: number | null
          in_packets: number | null
          isp_company_id: string | null
          out_octets: number | null
          out_packets: number | null
          timestamp: string | null
        }
        Insert: {
          client_id?: string | null
          equipment_id: string
          id?: string
          in_octets?: number | null
          in_packets?: number | null
          isp_company_id?: string | null
          out_octets?: number | null
          out_packets?: number | null
          timestamp?: string | null
        }
        Update: {
          client_id?: string | null
          equipment_id?: string
          id?: string
          in_octets?: number | null
          in_packets?: number | null
          isp_company_id?: string | null
          out_octets?: number | null
          out_packets?: number | null
          timestamp?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "bandwidth_statistics_client_id_fkey"
            columns: ["client_id"]
            isOneToOne: false
            referencedRelation: "clients"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "bandwidth_statistics_equipment_id_fkey"
            columns: ["equipment_id"]
            isOneToOne: false
            referencedRelation: "equipment"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "bandwidth_statistics_isp_company_id_fkey"
            columns: ["isp_company_id"]
            isOneToOne: false
            referencedRelation: "isp_companies"
            referencedColumns: ["id"]
          },
        ]
      }
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
          inventory_item_id: string | null
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
          inventory_item_id?: string | null
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
          inventory_item_id?: string | null
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
          {
            foreignKeyName: "client_equipment_inventory_item_id_fkey"
            columns: ["inventory_item_id"]
            isOneToOne: false
            referencedRelation: "inventory_items"
            referencedColumns: ["id"]
          },
        ]
      }
      client_equipment_assignments: {
        Row: {
          assigned_at: string | null
          assigned_by: string
          client_id: string
          created_at: string | null
          equipment_id: string
          id: string
          installation_notes: string | null
          isp_company_id: string
          status: string | null
          updated_at: string | null
        }
        Insert: {
          assigned_at?: string | null
          assigned_by: string
          client_id: string
          created_at?: string | null
          equipment_id: string
          id?: string
          installation_notes?: string | null
          isp_company_id: string
          status?: string | null
          updated_at?: string | null
        }
        Update: {
          assigned_at?: string | null
          assigned_by?: string
          client_id?: string
          created_at?: string | null
          equipment_id?: string
          id?: string
          installation_notes?: string | null
          isp_company_id?: string
          status?: string | null
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "client_equipment_assignments_client_id_fkey"
            columns: ["client_id"]
            isOneToOne: false
            referencedRelation: "clients"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "client_equipment_assignments_equipment_id_fkey"
            columns: ["equipment_id"]
            isOneToOne: false
            referencedRelation: "equipment"
            referencedColumns: ["id"]
          },
        ]
      }
      client_hotspot_access: {
        Row: {
          access_level: string
          auto_connect: boolean
          bandwidth_allocation: number | null
          blocked_reason: string | null
          client_id: string
          created_at: string
          device_name: string | null
          device_type: string | null
          first_connected_at: string
          hotspot_id: string
          id: string
          is_blocked: boolean
          isp_company_id: string | null
          last_connected_at: string | null
          mac_address: string
          total_data_used_mb: number | null
          total_sessions: number | null
          updated_at: string
        }
        Insert: {
          access_level?: string
          auto_connect?: boolean
          bandwidth_allocation?: number | null
          blocked_reason?: string | null
          client_id: string
          created_at?: string
          device_name?: string | null
          device_type?: string | null
          first_connected_at?: string
          hotspot_id: string
          id?: string
          is_blocked?: boolean
          isp_company_id?: string | null
          last_connected_at?: string | null
          mac_address: string
          total_data_used_mb?: number | null
          total_sessions?: number | null
          updated_at?: string
        }
        Update: {
          access_level?: string
          auto_connect?: boolean
          bandwidth_allocation?: number | null
          blocked_reason?: string | null
          client_id?: string
          created_at?: string
          device_name?: string | null
          device_type?: string | null
          first_connected_at?: string
          hotspot_id?: string
          id?: string
          is_blocked?: boolean
          isp_company_id?: string | null
          last_connected_at?: string | null
          mac_address?: string
          total_data_used_mb?: number | null
          total_sessions?: number | null
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "fk_client_hotspot_access_client"
            columns: ["client_id"]
            isOneToOne: false
            referencedRelation: "clients"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "fk_client_hotspot_access_hotspot"
            columns: ["hotspot_id"]
            isOneToOne: false
            referencedRelation: "hotspots"
            referencedColumns: ["id"]
          },
        ]
      }
      client_service_assignments: {
        Row: {
          assigned_at: string | null
          client_id: string
          created_at: string | null
          id: string
          is_active: boolean | null
          isp_company_id: string | null
          notes: string | null
          service_package_id: string
          updated_at: string | null
        }
        Insert: {
          assigned_at?: string | null
          client_id: string
          created_at?: string | null
          id?: string
          is_active?: boolean | null
          isp_company_id?: string | null
          notes?: string | null
          service_package_id: string
          updated_at?: string | null
        }
        Update: {
          assigned_at?: string | null
          client_id?: string
          created_at?: string | null
          id?: string
          is_active?: boolean | null
          isp_company_id?: string | null
          notes?: string | null
          service_package_id?: string
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "client_service_assignments_client_id_fkey"
            columns: ["client_id"]
            isOneToOne: false
            referencedRelation: "clients"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "client_service_assignments_isp_company_id_fkey"
            columns: ["isp_company_id"]
            isOneToOne: false
            referencedRelation: "isp_companies"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "client_service_assignments_service_package_id_fkey"
            columns: ["service_package_id"]
            isOneToOne: false
            referencedRelation: "service_packages"
            referencedColumns: ["id"]
          },
        ]
      }
      client_workflow_status: {
        Row: {
          assigned_to: string | null
          client_id: string
          completed_at: string | null
          created_at: string | null
          current_stage: string
          id: string
          isp_company_id: string
          notes: string | null
          stage_data: Json | null
          updated_at: string | null
        }
        Insert: {
          assigned_to?: string | null
          client_id: string
          completed_at?: string | null
          created_at?: string | null
          current_stage: string
          id?: string
          isp_company_id: string
          notes?: string | null
          stage_data?: Json | null
          updated_at?: string | null
        }
        Update: {
          assigned_to?: string | null
          client_id?: string
          completed_at?: string | null
          created_at?: string | null
          current_stage?: string
          id?: string
          isp_company_id?: string
          notes?: string | null
          stage_data?: Json | null
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "client_workflow_status_client_id_fkey"
            columns: ["client_id"]
            isOneToOne: false
            referencedRelation: "clients"
            referencedColumns: ["id"]
          },
        ]
      }
      clients: {
        Row: {
          address: string
          approved_at: string | null
          approved_by: string | null
          balance: number | null
          client_type: Database["public"]["Enums"]["client_type"]
          connection_type: Database["public"]["Enums"]["connection_type"]
          county: string
          created_at: string | null
          email: string | null
          id: string
          id_number: string
          installation_completed_at: string | null
          installation_completed_by: string | null
          installation_date: string | null
          installation_status: string | null
          is_active: boolean
          isp_company_id: string | null
          kra_pin_number: string | null
          latitude: number | null
          longitude: number | null
          monthly_rate: number
          mpesa_number: string | null
          name: string
          phone: string
          rejected_at: string | null
          rejected_by: string | null
          rejection_reason: string | null
          service_activated_at: string | null
          service_package_id: string | null
          status: Database["public"]["Enums"]["client_status"] | null
          sub_county: string
          submitted_by: string | null
          subscription_end_date: string | null
          subscription_start_date: string | null
          subscription_type: string | null
          updated_at: string | null
          wallet_balance: number | null
        }
        Insert: {
          address: string
          approved_at?: string | null
          approved_by?: string | null
          balance?: number | null
          client_type: Database["public"]["Enums"]["client_type"]
          connection_type: Database["public"]["Enums"]["connection_type"]
          county: string
          created_at?: string | null
          email?: string | null
          id?: string
          id_number: string
          installation_completed_at?: string | null
          installation_completed_by?: string | null
          installation_date?: string | null
          installation_status?: string | null
          is_active?: boolean
          isp_company_id?: string | null
          kra_pin_number?: string | null
          latitude?: number | null
          longitude?: number | null
          monthly_rate: number
          mpesa_number?: string | null
          name: string
          phone: string
          rejected_at?: string | null
          rejected_by?: string | null
          rejection_reason?: string | null
          service_activated_at?: string | null
          service_package_id?: string | null
          status?: Database["public"]["Enums"]["client_status"] | null
          sub_county: string
          submitted_by?: string | null
          subscription_end_date?: string | null
          subscription_start_date?: string | null
          subscription_type?: string | null
          updated_at?: string | null
          wallet_balance?: number | null
        }
        Update: {
          address?: string
          approved_at?: string | null
          approved_by?: string | null
          balance?: number | null
          client_type?: Database["public"]["Enums"]["client_type"]
          connection_type?: Database["public"]["Enums"]["connection_type"]
          county?: string
          created_at?: string | null
          email?: string | null
          id?: string
          id_number?: string
          installation_completed_at?: string | null
          installation_completed_by?: string | null
          installation_date?: string | null
          installation_status?: string | null
          is_active?: boolean
          isp_company_id?: string | null
          kra_pin_number?: string | null
          latitude?: number | null
          longitude?: number | null
          monthly_rate?: number
          mpesa_number?: string | null
          name?: string
          phone?: string
          rejected_at?: string | null
          rejected_by?: string | null
          rejection_reason?: string | null
          service_activated_at?: string | null
          service_package_id?: string | null
          status?: Database["public"]["Enums"]["client_status"] | null
          sub_county?: string
          submitted_by?: string | null
          subscription_end_date?: string | null
          subscription_start_date?: string | null
          subscription_type?: string | null
          updated_at?: string | null
          wallet_balance?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "clients_approved_by_fkey"
            columns: ["approved_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "clients_installation_completed_by_fkey"
            columns: ["installation_completed_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
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
          {
            foreignKeyName: "clients_submitted_by_fkey"
            columns: ["submitted_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      company_registration_requests: {
        Row: {
          address: string | null
          business_description: string | null
          ca_license_number: string | null
          company_name: string
          contact_person_name: string
          county: string | null
          created_at: string
          email: string
          id: string
          kra_pin: string | null
          notes: string | null
          phone: string | null
          processed_at: string | null
          processed_by: string | null
          requested_license_type: string
          status: string
          sub_county: string | null
          updated_at: string
        }
        Insert: {
          address?: string | null
          business_description?: string | null
          ca_license_number?: string | null
          company_name: string
          contact_person_name: string
          county?: string | null
          created_at?: string
          email: string
          id?: string
          kra_pin?: string | null
          notes?: string | null
          phone?: string | null
          processed_at?: string | null
          processed_by?: string | null
          requested_license_type?: string
          status?: string
          sub_county?: string | null
          updated_at?: string
        }
        Update: {
          address?: string | null
          business_description?: string | null
          ca_license_number?: string | null
          company_name?: string
          contact_person_name?: string
          county?: string | null
          created_at?: string
          email?: string
          id?: string
          kra_pin?: string | null
          notes?: string | null
          phone?: string | null
          processed_at?: string | null
          processed_by?: string | null
          requested_license_type?: string
          status?: string
          sub_county?: string | null
          updated_at?: string
        }
        Relationships: []
      }
      data_usage: {
        Row: {
          bytes_in: number | null
          bytes_out: number | null
          client_id: string
          created_at: string
          data_allowance: number | null
          id: string
          isp_company_id: string | null
          last_updated: string
          period: string
          period_start: string
          total_bytes: number | null
        }
        Insert: {
          bytes_in?: number | null
          bytes_out?: number | null
          client_id: string
          created_at?: string
          data_allowance?: number | null
          id?: string
          isp_company_id?: string | null
          last_updated?: string
          period: string
          period_start: string
          total_bytes?: number | null
        }
        Update: {
          bytes_in?: number | null
          bytes_out?: number | null
          client_id?: string
          created_at?: string
          data_allowance?: number | null
          id?: string
          isp_company_id?: string | null
          last_updated?: string
          period?: string
          period_start?: string
          total_bytes?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "data_usage_client_id_fkey"
            columns: ["client_id"]
            isOneToOne: false
            referencedRelation: "clients"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "data_usage_isp_company_id_fkey"
            columns: ["isp_company_id"]
            isOneToOne: false
            referencedRelation: "isp_companies"
            referencedColumns: ["id"]
          },
        ]
      }
      departments: {
        Row: {
          created_at: string
          description: string | null
          id: string
          is_active: boolean
          isp_company_id: string | null
          name: string
          updated_at: string
        }
        Insert: {
          created_at?: string
          description?: string | null
          id?: string
          is_active?: boolean
          isp_company_id?: string | null
          name: string
          updated_at?: string
        }
        Update: {
          created_at?: string
          description?: string | null
          id?: string
          is_active?: boolean
          isp_company_id?: string | null
          name?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "departments_isp_company_id_fkey"
            columns: ["isp_company_id"]
            isOneToOne: false
            referencedRelation: "isp_companies"
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
          firmware_version: string | null
          id: string
          ip_address: unknown | null
          isp_company_id: string | null
          location: string | null
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
          firmware_version?: string | null
          id?: string
          ip_address?: unknown | null
          isp_company_id?: string | null
          location?: string | null
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
          firmware_version?: string | null
          id?: string
          ip_address?: unknown | null
          isp_company_id?: string | null
          location?: string | null
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
      equipment_assignments: {
        Row: {
          assigned_at: string | null
          assigned_by: string
          client_id: string
          equipment_id: string
          id: string
          installation_notes: string | null
          isp_company_id: string
        }
        Insert: {
          assigned_at?: string | null
          assigned_by: string
          client_id: string
          equipment_id: string
          id?: string
          installation_notes?: string | null
          isp_company_id: string
        }
        Update: {
          assigned_at?: string | null
          assigned_by?: string
          client_id?: string
          equipment_id?: string
          id?: string
          installation_notes?: string | null
          isp_company_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "equipment_assignments_assigned_by_fkey"
            columns: ["assigned_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "equipment_assignments_client_id_fkey"
            columns: ["client_id"]
            isOneToOne: false
            referencedRelation: "clients"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "equipment_assignments_equipment_id_fkey"
            columns: ["equipment_id"]
            isOneToOne: false
            referencedRelation: "equipment"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "equipment_assignments_isp_company_id_fkey"
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
      external_users: {
        Row: {
          company_name: string | null
          created_at: string
          email: string
          first_name: string
          hourly_rate: number | null
          id: string
          is_active: boolean
          isp_company_id: string | null
          last_name: string
          phone: string | null
          role: string
          specializations: string[] | null
          updated_at: string
        }
        Insert: {
          company_name?: string | null
          created_at?: string
          email: string
          first_name: string
          hourly_rate?: number | null
          id?: string
          is_active?: boolean
          isp_company_id?: string | null
          last_name: string
          phone?: string | null
          role: string
          specializations?: string[] | null
          updated_at?: string
        }
        Update: {
          company_name?: string | null
          created_at?: string
          email?: string
          first_name?: string
          hourly_rate?: number | null
          id?: string
          is_active?: boolean
          isp_company_id?: string | null
          last_name?: string
          phone?: string | null
          role?: string
          specializations?: string[] | null
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "external_users_isp_company_id_fkey"
            columns: ["isp_company_id"]
            isOneToOne: false
            referencedRelation: "isp_companies"
            referencedColumns: ["id"]
          },
        ]
      }
      family_bank_payments: {
        Row: {
          bill_ref_number: string | null
          business_shortcode: string | null
          callback_raw: Json | null
          client_id: string | null
          created_at: string | null
          first_name: string | null
          id: string
          invoice_number: string | null
          isp_company_id: string | null
          kyc_info: string | null
          last_name: string | null
          middle_name: string | null
          msisdn: string | null
          org_account_balance: number | null
          status: Database["public"]["Enums"]["payment_status"] | null
          third_party_trans_id: string | null
          trans_amount: number
          trans_id: string
          trans_time: string | null
          transaction_type: string | null
        }
        Insert: {
          bill_ref_number?: string | null
          business_shortcode?: string | null
          callback_raw?: Json | null
          client_id?: string | null
          created_at?: string | null
          first_name?: string | null
          id?: string
          invoice_number?: string | null
          isp_company_id?: string | null
          kyc_info?: string | null
          last_name?: string | null
          middle_name?: string | null
          msisdn?: string | null
          org_account_balance?: number | null
          status?: Database["public"]["Enums"]["payment_status"] | null
          third_party_trans_id?: string | null
          trans_amount: number
          trans_id: string
          trans_time?: string | null
          transaction_type?: string | null
        }
        Update: {
          bill_ref_number?: string | null
          business_shortcode?: string | null
          callback_raw?: Json | null
          client_id?: string | null
          created_at?: string | null
          first_name?: string | null
          id?: string
          invoice_number?: string | null
          isp_company_id?: string | null
          kyc_info?: string | null
          last_name?: string | null
          middle_name?: string | null
          msisdn?: string | null
          org_account_balance?: number | null
          status?: Database["public"]["Enums"]["payment_status"] | null
          third_party_trans_id?: string | null
          trans_amount?: number
          trans_id?: string
          trans_time?: string | null
          transaction_type?: string | null
        }
        Relationships: []
      }
      family_bank_stk_callbacks: {
        Row: {
          callback_raw: Json
          created_at: string | null
          id: string
          processed: boolean | null
        }
        Insert: {
          callback_raw: Json
          created_at?: string | null
          id?: string
          processed?: boolean | null
        }
        Update: {
          callback_raw?: Json
          created_at?: string | null
          id?: string
          processed?: boolean | null
        }
        Relationships: []
      }
      family_bank_stk_requests: {
        Row: {
          account_reference: string
          amount: number
          callback_raw: Json | null
          checkout_request_id: string | null
          client_id: string | null
          created_at: string | null
          customer_message: string | null
          id: string
          invoice_id: string | null
          isp_company_id: string | null
          merchant_request_id: string | null
          phone_number: string
          response_description: string | null
          status: Database["public"]["Enums"]["stk_status"] | null
          status_code: string | null
          third_party_trans_id: string
          transaction_desc: string | null
        }
        Insert: {
          account_reference: string
          amount: number
          callback_raw?: Json | null
          checkout_request_id?: string | null
          client_id?: string | null
          created_at?: string | null
          customer_message?: string | null
          id?: string
          invoice_id?: string | null
          isp_company_id?: string | null
          merchant_request_id?: string | null
          phone_number: string
          response_description?: string | null
          status?: Database["public"]["Enums"]["stk_status"] | null
          status_code?: string | null
          third_party_trans_id: string
          transaction_desc?: string | null
        }
        Update: {
          account_reference?: string
          amount?: number
          callback_raw?: Json | null
          checkout_request_id?: string | null
          client_id?: string | null
          created_at?: string | null
          customer_message?: string | null
          id?: string
          invoice_id?: string | null
          isp_company_id?: string | null
          merchant_request_id?: string | null
          phone_number?: string
          response_description?: string | null
          status?: Database["public"]["Enums"]["stk_status"] | null
          status_code?: string | null
          third_party_trans_id?: string
          transaction_desc?: string | null
        }
        Relationships: []
      }
      hotspot_analytics: {
        Row: {
          avg_session_duration_minutes: number | null
          bandwidth_utilization_percentage: number | null
          client_sessions: number | null
          created_at: string
          date: string
          guest_sessions: number | null
          hotspot_id: string
          id: string
          isp_company_id: string | null
          peak_concurrent_users: number | null
          revenue_generated: number | null
          total_data_used_gb: number | null
          total_sessions: number | null
          unique_users: number | null
          uptime_percentage: number | null
          voucher_sessions: number | null
        }
        Insert: {
          avg_session_duration_minutes?: number | null
          bandwidth_utilization_percentage?: number | null
          client_sessions?: number | null
          created_at?: string
          date: string
          guest_sessions?: number | null
          hotspot_id: string
          id?: string
          isp_company_id?: string | null
          peak_concurrent_users?: number | null
          revenue_generated?: number | null
          total_data_used_gb?: number | null
          total_sessions?: number | null
          unique_users?: number | null
          uptime_percentage?: number | null
          voucher_sessions?: number | null
        }
        Update: {
          avg_session_duration_minutes?: number | null
          bandwidth_utilization_percentage?: number | null
          client_sessions?: number | null
          created_at?: string
          date?: string
          guest_sessions?: number | null
          hotspot_id?: string
          id?: string
          isp_company_id?: string | null
          peak_concurrent_users?: number | null
          revenue_generated?: number | null
          total_data_used_gb?: number | null
          total_sessions?: number | null
          unique_users?: number | null
          uptime_percentage?: number | null
          voucher_sessions?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "fk_hotspot_analytics_hotspot"
            columns: ["hotspot_id"]
            isOneToOne: false
            referencedRelation: "hotspots"
            referencedColumns: ["id"]
          },
        ]
      }
      hotspot_sessions: {
        Row: {
          bandwidth_used_mbps: number | null
          client_id: string | null
          created_at: string
          data_used_mb: number | null
          device_fingerprint: string | null
          duration_minutes: number | null
          end_time: string | null
          hotspot_id: string
          id: string
          ip_address: unknown | null
          isp_company_id: string | null
          mac_address: string
          payment_reference: string | null
          session_status: string
          session_type: string
          start_time: string
          user_agent: string | null
          voucher_code: string | null
        }
        Insert: {
          bandwidth_used_mbps?: number | null
          client_id?: string | null
          created_at?: string
          data_used_mb?: number | null
          device_fingerprint?: string | null
          duration_minutes?: number | null
          end_time?: string | null
          hotspot_id: string
          id?: string
          ip_address?: unknown | null
          isp_company_id?: string | null
          mac_address: string
          payment_reference?: string | null
          session_status?: string
          session_type?: string
          start_time?: string
          user_agent?: string | null
          voucher_code?: string | null
        }
        Update: {
          bandwidth_used_mbps?: number | null
          client_id?: string | null
          created_at?: string
          data_used_mb?: number | null
          device_fingerprint?: string | null
          duration_minutes?: number | null
          end_time?: string | null
          hotspot_id?: string
          id?: string
          ip_address?: unknown | null
          isp_company_id?: string | null
          mac_address?: string
          payment_reference?: string | null
          session_status?: string
          session_type?: string
          start_time?: string
          user_agent?: string | null
          voucher_code?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "fk_hotspot_sessions_hotspot"
            columns: ["hotspot_id"]
            isOneToOne: false
            referencedRelation: "hotspots"
            referencedColumns: ["id"]
          },
        ]
      }
      hotspot_vouchers: {
        Row: {
          created_at: string
          currency: string
          data_limit_mb: number | null
          duration_minutes: number | null
          expiry_date: string | null
          generated_by: string | null
          hotspot_id: string
          id: string
          is_used: boolean
          isp_company_id: string | null
          max_devices: number | null
          mpesa_receipt_number: string | null
          payment_reference: string | null
          price: number
          used_at: string | null
          used_by_mac: string | null
          voucher_code: string
          voucher_type: string
        }
        Insert: {
          created_at?: string
          currency?: string
          data_limit_mb?: number | null
          duration_minutes?: number | null
          expiry_date?: string | null
          generated_by?: string | null
          hotspot_id: string
          id?: string
          is_used?: boolean
          isp_company_id?: string | null
          max_devices?: number | null
          mpesa_receipt_number?: string | null
          payment_reference?: string | null
          price?: number
          used_at?: string | null
          used_by_mac?: string | null
          voucher_code: string
          voucher_type?: string
        }
        Update: {
          created_at?: string
          currency?: string
          data_limit_mb?: number | null
          duration_minutes?: number | null
          expiry_date?: string | null
          generated_by?: string | null
          hotspot_id?: string
          id?: string
          is_used?: boolean
          isp_company_id?: string | null
          max_devices?: number | null
          mpesa_receipt_number?: string | null
          payment_reference?: string | null
          price?: number
          used_at?: string | null
          used_by_mac?: string | null
          voucher_code?: string
          voucher_type?: string
        }
        Relationships: [
          {
            foreignKeyName: "fk_hotspot_vouchers_hotspot"
            columns: ["hotspot_id"]
            isOneToOne: false
            referencedRelation: "hotspots"
            referencedColumns: ["id"]
          },
        ]
      }
      hotspots: {
        Row: {
          bandwidth_limit: number | null
          coverage_radius: number | null
          created_at: string
          hardware_details: Json | null
          id: string
          installation_date: string | null
          ip_address: unknown | null
          is_active: boolean
          isp_company_id: string | null
          last_maintenance_date: string | null
          latitude: number | null
          location: string
          longitude: number | null
          mac_address: string | null
          max_concurrent_users: number | null
          name: string
          password: string | null
          ssid: string
          status: string
          updated_at: string
        }
        Insert: {
          bandwidth_limit?: number | null
          coverage_radius?: number | null
          created_at?: string
          hardware_details?: Json | null
          id?: string
          installation_date?: string | null
          ip_address?: unknown | null
          is_active?: boolean
          isp_company_id?: string | null
          last_maintenance_date?: string | null
          latitude?: number | null
          location: string
          longitude?: number | null
          mac_address?: string | null
          max_concurrent_users?: number | null
          name: string
          password?: string | null
          ssid: string
          status?: string
          updated_at?: string
        }
        Update: {
          bandwidth_limit?: number | null
          coverage_radius?: number | null
          created_at?: string
          hardware_details?: Json | null
          id?: string
          installation_date?: string | null
          ip_address?: unknown | null
          is_active?: boolean
          isp_company_id?: string | null
          last_maintenance_date?: string | null
          latitude?: number | null
          location?: string
          longitude?: number | null
          mac_address?: string | null
          max_concurrent_users?: number | null
          name?: string
          password?: string | null
          ssid?: string
          status?: string
          updated_at?: string
        }
        Relationships: []
      }
      installation_invoices: {
        Row: {
          amount: number
          client_id: string
          created_at: string | null
          distributed_at: string | null
          distributed_by: string | null
          distribution_method: string | null
          equipment_details: Json | null
          id: string
          invoice_number: string
          isp_company_id: string
          notes: string | null
          paid_at: string | null
          payment_method: string | null
          payment_reference: string | null
          status: string | null
          total_amount: number
          tracking_number: string | null
          updated_at: string | null
          vat_amount: number
        }
        Insert: {
          amount?: number
          client_id: string
          created_at?: string | null
          distributed_at?: string | null
          distributed_by?: string | null
          distribution_method?: string | null
          equipment_details?: Json | null
          id?: string
          invoice_number: string
          isp_company_id: string
          notes?: string | null
          paid_at?: string | null
          payment_method?: string | null
          payment_reference?: string | null
          status?: string | null
          total_amount?: number
          tracking_number?: string | null
          updated_at?: string | null
          vat_amount?: number
        }
        Update: {
          amount?: number
          client_id?: string
          created_at?: string | null
          distributed_at?: string | null
          distributed_by?: string | null
          distribution_method?: string | null
          equipment_details?: Json | null
          id?: string
          invoice_number?: string
          isp_company_id?: string
          notes?: string | null
          paid_at?: string | null
          payment_method?: string | null
          payment_reference?: string | null
          status?: string | null
          total_amount?: number
          tracking_number?: string | null
          updated_at?: string | null
          vat_amount?: number
        }
        Relationships: [
          {
            foreignKeyName: "installation_invoices_client_id_fkey"
            columns: ["client_id"]
            isOneToOne: false
            referencedRelation: "clients"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "installation_invoices_isp_company_id_fkey"
            columns: ["isp_company_id"]
            isOneToOne: false
            referencedRelation: "isp_companies"
            referencedColumns: ["id"]
          },
        ]
      }
      interface_statistics: {
        Row: {
          equipment_id: string
          errors: number | null
          id: string
          interface_index: number
          interface_name: string
          isp_company_id: string | null
          speed: number | null
          status: string | null
          timestamp: string | null
          utilization: number | null
        }
        Insert: {
          equipment_id: string
          errors?: number | null
          id?: string
          interface_index: number
          interface_name: string
          isp_company_id?: string | null
          speed?: number | null
          status?: string | null
          timestamp?: string | null
          utilization?: number | null
        }
        Update: {
          equipment_id?: string
          errors?: number | null
          id?: string
          interface_index?: number
          interface_name?: string
          isp_company_id?: string | null
          speed?: number | null
          status?: string | null
          timestamp?: string | null
          utilization?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "interface_statistics_equipment_id_fkey"
            columns: ["equipment_id"]
            isOneToOne: false
            referencedRelation: "equipment"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "interface_statistics_isp_company_id_fkey"
            columns: ["isp_company_id"]
            isOneToOne: false
            referencedRelation: "isp_companies"
            referencedColumns: ["id"]
          },
        ]
      }
      internal_messages: {
        Row: {
          attachments: Json | null
          content: string
          deleted_at: string | null
          id: string
          is_deleted: boolean
          is_read: boolean
          isp_company_id: string | null
          message_type: string
          read_at: string | null
          recipient_id: string
          reply_to_id: string | null
          sender_id: string
          sent_at: string
          subject: string
          thread_id: string | null
        }
        Insert: {
          attachments?: Json | null
          content: string
          deleted_at?: string | null
          id?: string
          is_deleted?: boolean
          is_read?: boolean
          isp_company_id?: string | null
          message_type?: string
          read_at?: string | null
          recipient_id: string
          reply_to_id?: string | null
          sender_id: string
          sent_at?: string
          subject: string
          thread_id?: string | null
        }
        Update: {
          attachments?: Json | null
          content?: string
          deleted_at?: string | null
          id?: string
          is_deleted?: boolean
          is_read?: boolean
          isp_company_id?: string | null
          message_type?: string
          read_at?: string | null
          recipient_id?: string
          reply_to_id?: string | null
          sender_id?: string
          sent_at?: string
          subject?: string
          thread_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "internal_messages_isp_company_id_fkey"
            columns: ["isp_company_id"]
            isOneToOne: false
            referencedRelation: "isp_companies"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "internal_messages_recipient_id_fkey"
            columns: ["recipient_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "internal_messages_reply_to_id_fkey"
            columns: ["reply_to_id"]
            isOneToOne: false
            referencedRelation: "internal_messages"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "internal_messages_sender_id_fkey"
            columns: ["sender_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
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
          barcode: string | null
          capacity: string | null
          category: string
          cost: number | null
          created_at: string
          equipment_id: string | null
          id: string
          installation_date: string | null
          ip_address: unknown | null
          is_network_equipment: boolean | null
          isp_company_id: string | null
          item_id: string | null
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
          barcode?: string | null
          capacity?: string | null
          category: string
          cost?: number | null
          created_at?: string
          equipment_id?: string | null
          id?: string
          installation_date?: string | null
          ip_address?: unknown | null
          is_network_equipment?: boolean | null
          isp_company_id?: string | null
          item_id?: string | null
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
          barcode?: string | null
          capacity?: string | null
          category?: string
          cost?: number | null
          created_at?: string
          equipment_id?: string | null
          id?: string
          installation_date?: string | null
          ip_address?: unknown | null
          is_network_equipment?: boolean | null
          isp_company_id?: string | null
          item_id?: string | null
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
            foreignKeyName: "inventory_items_equipment_id_fkey"
            columns: ["equipment_id"]
            isOneToOne: false
            referencedRelation: "equipment"
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
          deactivated_at: string | null
          deactivation_reason: string | null
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
          deactivated_at?: string | null
          deactivation_reason?: string | null
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
          deactivated_at?: string | null
          deactivation_reason?: string | null
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
      license_types: {
        Row: {
          client_limit: number
          created_at: string
          description: string | null
          display_name: string
          features: Json | null
          id: string
          is_active: boolean
          name: string
          price: number
          sort_order: number | null
          updated_at: string
        }
        Insert: {
          client_limit: number
          created_at?: string
          description?: string | null
          display_name: string
          features?: Json | null
          id?: string
          is_active?: boolean
          name: string
          price: number
          sort_order?: number | null
          updated_at?: string
        }
        Update: {
          client_limit?: number
          created_at?: string
          description?: string | null
          display_name?: string
          features?: Json | null
          id?: string
          is_active?: boolean
          name?: string
          price?: number
          sort_order?: number | null
          updated_at?: string
        }
        Relationships: []
      }
      message_attachments: {
        Row: {
          file_name: string
          file_size: number
          file_type: string
          file_url: string
          id: string
          isp_company_id: string | null
          message_id: string
          uploaded_at: string
        }
        Insert: {
          file_name: string
          file_size: number
          file_type: string
          file_url: string
          id?: string
          isp_company_id?: string | null
          message_id: string
          uploaded_at?: string
        }
        Update: {
          file_name?: string
          file_size?: number
          file_type?: string
          file_url?: string
          id?: string
          isp_company_id?: string | null
          message_id?: string
          uploaded_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "message_attachments_isp_company_id_fkey"
            columns: ["isp_company_id"]
            isOneToOne: false
            referencedRelation: "isp_companies"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "message_attachments_message_id_fkey"
            columns: ["message_id"]
            isOneToOne: false
            referencedRelation: "internal_messages"
            referencedColumns: ["id"]
          },
        ]
      }
      mikrotik_routers: {
        Row: {
          admin_password: string
          admin_username: string
          client_network: string
          connection_status: string
          created_at: string
          dns_servers: string
          gateway: unknown
          id: string
          ip_address: unknown
          isp_company_id: string
          last_test_results: Json | null
          name: string
          pppoe_interface: string
          snmp_community: string
          snmp_version: number
          status: string
          updated_at: string
        }
        Insert: {
          admin_password: string
          admin_username: string
          client_network?: string
          connection_status?: string
          created_at?: string
          dns_servers?: string
          gateway: unknown
          id?: string
          ip_address: unknown
          isp_company_id: string
          last_test_results?: Json | null
          name: string
          pppoe_interface?: string
          snmp_community?: string
          snmp_version?: number
          status?: string
          updated_at?: string
        }
        Update: {
          admin_password?: string
          admin_username?: string
          client_network?: string
          connection_status?: string
          created_at?: string
          dns_servers?: string
          gateway?: unknown
          id?: string
          ip_address?: unknown
          isp_company_id?: string
          last_test_results?: Json | null
          name?: string
          pppoe_interface?: string
          snmp_community?: string
          snmp_version?: number
          status?: string
          updated_at?: string
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
      nas_clients: {
        Row: {
          community: string
          created_at: string
          description: string | null
          id: string
          is_active: boolean
          isp_company_id: string | null
          name: string
          nas_ip_address: string
          ports: number
          secret: string
          shortname: string
          type: string
          updated_at: string
        }
        Insert: {
          community?: string
          created_at?: string
          description?: string | null
          id?: string
          is_active?: boolean
          isp_company_id?: string | null
          name: string
          nas_ip_address: string
          ports?: number
          secret: string
          shortname: string
          type?: string
          updated_at?: string
        }
        Update: {
          community?: string
          created_at?: string
          description?: string | null
          id?: string
          is_active?: boolean
          isp_company_id?: string | null
          name?: string
          nas_ip_address?: string
          ports?: number
          secret?: string
          shortname?: string
          type?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "nas_clients_isp_company_id_fkey"
            columns: ["isp_company_id"]
            isOneToOne: false
            referencedRelation: "isp_companies"
            referencedColumns: ["id"]
          },
        ]
      }
      network_device_stats: {
        Row: {
          connected_clients: number | null
          cpu_usage: number | null
          created_at: string
          device_id: string
          id: string
          isp_company_id: string | null
          last_updated: string
          memory_usage: number | null
          status: string
          uptime: number | null
        }
        Insert: {
          connected_clients?: number | null
          cpu_usage?: number | null
          created_at?: string
          device_id: string
          id?: string
          isp_company_id?: string | null
          last_updated?: string
          memory_usage?: number | null
          status: string
          uptime?: number | null
        }
        Update: {
          connected_clients?: number | null
          cpu_usage?: number | null
          created_at?: string
          device_id?: string
          id?: string
          isp_company_id?: string | null
          last_updated?: string
          memory_usage?: number | null
          status?: string
          uptime?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "network_device_stats_device_id_fkey"
            columns: ["device_id"]
            isOneToOne: false
            referencedRelation: "equipment"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "network_device_stats_isp_company_id_fkey"
            columns: ["isp_company_id"]
            isOneToOne: false
            referencedRelation: "isp_companies"
            referencedColumns: ["id"]
          },
        ]
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
      notification_logs: {
        Row: {
          channels: string[]
          client_id: string | null
          created_at: string
          id: string
          isp_company_id: string | null
          metadata: Json | null
          recipients: string[]
          status: string
          ticket_id: string | null
          type: string
        }
        Insert: {
          channels: string[]
          client_id?: string | null
          created_at?: string
          id?: string
          isp_company_id?: string | null
          metadata?: Json | null
          recipients: string[]
          status?: string
          ticket_id?: string | null
          type: string
        }
        Update: {
          channels?: string[]
          client_id?: string | null
          created_at?: string
          id?: string
          isp_company_id?: string | null
          metadata?: Json | null
          recipients?: string[]
          status?: string
          ticket_id?: string | null
          type?: string
        }
        Relationships: [
          {
            foreignKeyName: "notification_logs_client_id_fkey"
            columns: ["client_id"]
            isOneToOne: false
            referencedRelation: "clients"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "notification_logs_isp_company_id_fkey"
            columns: ["isp_company_id"]
            isOneToOne: false
            referencedRelation: "isp_companies"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "notification_logs_ticket_id_fkey"
            columns: ["ticket_id"]
            isOneToOne: false
            referencedRelation: "support_tickets"
            referencedColumns: ["id"]
          },
        ]
      }
      notification_preferences: {
        Row: {
          created_at: string
          email_notifications: boolean
          id: string
          notification_types: Json
          sms_notifications: boolean
          updated_at: string
          user_id: string
          whatsapp_notifications: boolean
        }
        Insert: {
          created_at?: string
          email_notifications?: boolean
          id?: string
          notification_types?: Json
          sms_notifications?: boolean
          updated_at?: string
          user_id: string
          whatsapp_notifications?: boolean
        }
        Update: {
          created_at?: string
          email_notifications?: boolean
          id?: string
          notification_types?: Json
          sms_notifications?: boolean
          updated_at?: string
          user_id?: string
          whatsapp_notifications?: boolean
        }
        Relationships: [
          {
            foreignKeyName: "notification_preferences_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      notification_templates: {
        Row: {
          category: string
          channels: string[] | null
          created_at: string | null
          created_by: string | null
          email_template: string | null
          id: string
          is_active: boolean | null
          isp_company_id: string | null
          name: string
          sms_template: string | null
          subject: string | null
          trigger_event: string
          updated_at: string | null
          variables: Json | null
        }
        Insert: {
          category: string
          channels?: string[] | null
          created_at?: string | null
          created_by?: string | null
          email_template?: string | null
          id?: string
          is_active?: boolean | null
          isp_company_id?: string | null
          name: string
          sms_template?: string | null
          subject?: string | null
          trigger_event: string
          updated_at?: string | null
          variables?: Json | null
        }
        Update: {
          category?: string
          channels?: string[] | null
          created_at?: string | null
          created_by?: string | null
          email_template?: string | null
          id?: string
          is_active?: boolean | null
          isp_company_id?: string | null
          name?: string
          sms_template?: string | null
          subject?: string | null
          trigger_event?: string
          updated_at?: string | null
          variables?: Json | null
        }
        Relationships: [
          {
            foreignKeyName: "notification_templates_isp_company_id_fkey"
            columns: ["isp_company_id"]
            isOneToOne: false
            referencedRelation: "isp_companies"
            referencedColumns: ["id"]
          },
        ]
      }
      notifications: {
        Row: {
          action_url: string | null
          created_at: string
          id: string
          is_read: boolean
          isp_company_id: string | null
          message: string
          read_at: string | null
          related_entity_id: string | null
          related_entity_type: string | null
          title: string
          type: string
          user_id: string
        }
        Insert: {
          action_url?: string | null
          created_at?: string
          id?: string
          is_read?: boolean
          isp_company_id?: string | null
          message: string
          read_at?: string | null
          related_entity_id?: string | null
          related_entity_type?: string | null
          title: string
          type?: string
          user_id: string
        }
        Update: {
          action_url?: string | null
          created_at?: string
          id?: string
          is_read?: boolean
          isp_company_id?: string | null
          message?: string
          read_at?: string | null
          related_entity_id?: string | null
          related_entity_type?: string | null
          title?: string
          type?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "notifications_isp_company_id_fkey"
            columns: ["isp_company_id"]
            isOneToOne: false
            referencedRelation: "isp_companies"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "notifications_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      payment_method_settings: {
        Row: {
          created_at: string | null
          disabled_reason: string | null
          id: string
          is_enabled: boolean
          isp_company_id: string
          payment_method: string
          updated_at: string | null
        }
        Insert: {
          created_at?: string | null
          disabled_reason?: string | null
          id?: string
          is_enabled?: boolean
          isp_company_id: string
          payment_method: string
          updated_at?: string | null
        }
        Update: {
          created_at?: string | null
          disabled_reason?: string | null
          id?: string
          is_enabled?: boolean
          isp_company_id?: string
          payment_method?: string
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "payment_method_settings_isp_company_id_fkey"
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
      qos_policies: {
        Row: {
          burst_size: number | null
          created_at: string | null
          guaranteed_bandwidth: number | null
          id: string
          is_active: boolean | null
          isp_company_id: string | null
          max_bandwidth_down: number
          max_bandwidth_up: number
          name: string
          priority: string | null
          protocol: string | null
          updated_at: string | null
        }
        Insert: {
          burst_size?: number | null
          created_at?: string | null
          guaranteed_bandwidth?: number | null
          id?: string
          is_active?: boolean | null
          isp_company_id?: string | null
          max_bandwidth_down: number
          max_bandwidth_up: number
          name: string
          priority?: string | null
          protocol?: string | null
          updated_at?: string | null
        }
        Update: {
          burst_size?: number | null
          created_at?: string | null
          guaranteed_bandwidth?: number | null
          id?: string
          is_active?: boolean | null
          isp_company_id?: string | null
          max_bandwidth_down?: number
          max_bandwidth_up?: number
          name?: string
          priority?: string | null
          protocol?: string | null
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "qos_policies_isp_company_id_fkey"
            columns: ["isp_company_id"]
            isOneToOne: false
            referencedRelation: "isp_companies"
            referencedColumns: ["id"]
          },
        ]
      }
      radius_groups: {
        Row: {
          created_at: string
          description: string | null
          download_limit_mbps: number
          id: string
          idle_timeout_seconds: number | null
          is_active: boolean
          isp_company_id: string | null
          name: string
          session_timeout_seconds: number | null
          updated_at: string
          upload_limit_mbps: number
        }
        Insert: {
          created_at?: string
          description?: string | null
          download_limit_mbps?: number
          id?: string
          idle_timeout_seconds?: number | null
          is_active?: boolean
          isp_company_id?: string | null
          name: string
          session_timeout_seconds?: number | null
          updated_at?: string
          upload_limit_mbps?: number
        }
        Update: {
          created_at?: string
          description?: string | null
          download_limit_mbps?: number
          id?: string
          idle_timeout_seconds?: number | null
          is_active?: boolean
          isp_company_id?: string | null
          name?: string
          session_timeout_seconds?: number | null
          updated_at?: string
          upload_limit_mbps?: number
        }
        Relationships: [
          {
            foreignKeyName: "radius_groups_isp_company_id_fkey"
            columns: ["isp_company_id"]
            isOneToOne: false
            referencedRelation: "isp_companies"
            referencedColumns: ["id"]
          },
        ]
      }
      radius_nas_clients: {
        Row: {
          created_at: string
          description: string | null
          id: string
          is_active: boolean
          isp_company_id: string | null
          last_seen: string | null
          nas_ip: unknown
          nas_name: string
          nas_secret: string
          nas_type: string
          updated_at: string
        }
        Insert: {
          created_at?: string
          description?: string | null
          id?: string
          is_active?: boolean
          isp_company_id?: string | null
          last_seen?: string | null
          nas_ip: unknown
          nas_name: string
          nas_secret: string
          nas_type?: string
          updated_at?: string
        }
        Update: {
          created_at?: string
          description?: string | null
          id?: string
          is_active?: boolean
          isp_company_id?: string | null
          last_seen?: string | null
          nas_ip?: unknown
          nas_name?: string
          nas_secret?: string
          nas_type?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "radius_nas_clients_isp_company_id_fkey"
            columns: ["isp_company_id"]
            isOneToOne: false
            referencedRelation: "isp_companies"
            referencedColumns: ["id"]
          },
        ]
      }
      radius_servers: {
        Row: {
          accounting_port: number
          auth_port: number
          created_at: string
          id: string
          is_enabled: boolean
          is_primary: boolean
          isp_company_id: string | null
          name: string
          server_address: string
          shared_secret: string
          timeout_seconds: number
          updated_at: string
        }
        Insert: {
          accounting_port?: number
          auth_port?: number
          created_at?: string
          id?: string
          is_enabled?: boolean
          is_primary?: boolean
          isp_company_id?: string | null
          name: string
          server_address: string
          shared_secret: string
          timeout_seconds?: number
          updated_at?: string
        }
        Update: {
          accounting_port?: number
          auth_port?: number
          created_at?: string
          id?: string
          is_enabled?: boolean
          is_primary?: boolean
          isp_company_id?: string | null
          name?: string
          server_address?: string
          shared_secret?: string
          timeout_seconds?: number
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "radius_servers_isp_company_id_fkey"
            columns: ["isp_company_id"]
            isOneToOne: false
            referencedRelation: "isp_companies"
            referencedColumns: ["id"]
          },
        ]
      }
      radius_sessions: {
        Row: {
          bytes_in: number | null
          bytes_out: number | null
          created_at: string
          id: string
          isp_company_id: string | null
          nas_ip_address: unknown | null
          session_id: string | null
          start_time: string
          status: string
          username: string
        }
        Insert: {
          bytes_in?: number | null
          bytes_out?: number | null
          created_at?: string
          id?: string
          isp_company_id?: string | null
          nas_ip_address?: unknown | null
          session_id?: string | null
          start_time?: string
          status?: string
          username: string
        }
        Update: {
          bytes_in?: number | null
          bytes_out?: number | null
          created_at?: string
          id?: string
          isp_company_id?: string | null
          nas_ip_address?: unknown | null
          session_id?: string | null
          start_time?: string
          status?: string
          username?: string
        }
        Relationships: [
          {
            foreignKeyName: "radius_sessions_isp_company_id_fkey"
            columns: ["isp_company_id"]
            isOneToOne: false
            referencedRelation: "isp_companies"
            referencedColumns: ["id"]
          },
        ]
      }
      radius_users: {
        Row: {
          client_id: string
          created_at: string
          expiration: string | null
          group_name: string | null
          id: string
          is_active: boolean
          isp_company_id: string | null
          max_download: string | null
          max_upload: string | null
          password: string
          updated_at: string
          username: string
        }
        Insert: {
          client_id: string
          created_at?: string
          expiration?: string | null
          group_name?: string | null
          id?: string
          is_active?: boolean
          isp_company_id?: string | null
          max_download?: string | null
          max_upload?: string | null
          password: string
          updated_at?: string
          username: string
        }
        Update: {
          client_id?: string
          created_at?: string
          expiration?: string | null
          group_name?: string | null
          id?: string
          is_active?: boolean
          isp_company_id?: string | null
          max_download?: string | null
          max_upload?: string | null
          password?: string
          updated_at?: string
          username?: string
        }
        Relationships: [
          {
            foreignKeyName: "radius_users_client_id_fkey"
            columns: ["client_id"]
            isOneToOne: false
            referencedRelation: "clients"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "radius_users_isp_company_id_fkey"
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
          data_cap_gb: number | null
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
          data_cap_gb?: number | null
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
          data_cap_gb?: number | null
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
      sms_templates: {
        Row: {
          created_at: string | null
          created_by: string | null
          id: string
          is_active: boolean | null
          isp_company_id: string
          template_content: string
          template_key: string
          template_name: string
          updated_at: string | null
          variables: Json | null
        }
        Insert: {
          created_at?: string | null
          created_by?: string | null
          id?: string
          is_active?: boolean | null
          isp_company_id: string
          template_content: string
          template_key: string
          template_name: string
          updated_at?: string | null
          variables?: Json | null
        }
        Update: {
          created_at?: string | null
          created_by?: string | null
          id?: string
          is_active?: boolean | null
          isp_company_id?: string
          template_content?: string
          template_key?: string
          template_name?: string
          updated_at?: string | null
          variables?: Json | null
        }
        Relationships: []
      }
      super_admin_invoices: {
        Row: {
          amount: number
          company_name: string
          contact_email: string
          created_at: string
          created_by: string | null
          currency: string
          due_date: string
          id: string
          invoice_number: string
          notes: string | null
          payment_date: string | null
          payment_method: string | null
          payment_reference: string | null
          registration_request_id: string | null
          status: string
          total_amount: number
          updated_at: string
          vat_amount: number
        }
        Insert: {
          amount: number
          company_name: string
          contact_email: string
          created_at?: string
          created_by?: string | null
          currency?: string
          due_date: string
          id?: string
          invoice_number: string
          notes?: string | null
          payment_date?: string | null
          payment_method?: string | null
          payment_reference?: string | null
          registration_request_id?: string | null
          status?: string
          total_amount: number
          updated_at?: string
          vat_amount?: number
        }
        Update: {
          amount?: number
          company_name?: string
          contact_email?: string
          created_at?: string
          created_by?: string | null
          currency?: string
          due_date?: string
          id?: string
          invoice_number?: string
          notes?: string | null
          payment_date?: string | null
          payment_method?: string | null
          payment_reference?: string | null
          registration_request_id?: string | null
          status?: string
          total_amount?: number
          updated_at?: string
          vat_amount?: number
        }
        Relationships: [
          {
            foreignKeyName: "super_admin_invoices_registration_request_id_fkey"
            columns: ["registration_request_id"]
            isOneToOne: false
            referencedRelation: "company_registration_requests"
            referencedColumns: ["id"]
          },
        ]
      }
      super_admin_payments: {
        Row: {
          amount: number
          created_at: string
          created_by: string | null
          id: string
          invoice_id: string | null
          mpesa_receipt_number: string | null
          notes: string | null
          payment_date: string
          payment_method: string
          payment_reference: string | null
        }
        Insert: {
          amount: number
          created_at?: string
          created_by?: string | null
          id?: string
          invoice_id?: string | null
          mpesa_receipt_number?: string | null
          notes?: string | null
          payment_date?: string
          payment_method: string
          payment_reference?: string | null
        }
        Update: {
          amount?: number
          created_at?: string
          created_by?: string | null
          id?: string
          invoice_id?: string | null
          mpesa_receipt_number?: string | null
          notes?: string | null
          payment_date?: string
          payment_method?: string
          payment_reference?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "super_admin_payments_invoice_id_fkey"
            columns: ["invoice_id"]
            isOneToOne: false
            referencedRelation: "super_admin_invoices"
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
          department_id: string | null
          description: string
          escalation_level: number | null
          external_reference: string | null
          id: string
          isp_company_id: string | null
          location_info: Json | null
          priority: Database["public"]["Enums"]["ticket_priority"] | null
          requires_field_visit: boolean | null
          resolution: string | null
          resolved_at: string | null
          sla_due_date: string | null
          status: Database["public"]["Enums"]["ticket_status"] | null
          ticket_source: string | null
          ticket_type: Database["public"]["Enums"]["ticket_type"] | null
          title: string
          updated_at: string | null
        }
        Insert: {
          assigned_to?: string | null
          client_id?: string | null
          created_at?: string | null
          created_by?: string | null
          department_id?: string | null
          description: string
          escalation_level?: number | null
          external_reference?: string | null
          id?: string
          isp_company_id?: string | null
          location_info?: Json | null
          priority?: Database["public"]["Enums"]["ticket_priority"] | null
          requires_field_visit?: boolean | null
          resolution?: string | null
          resolved_at?: string | null
          sla_due_date?: string | null
          status?: Database["public"]["Enums"]["ticket_status"] | null
          ticket_source?: string | null
          ticket_type?: Database["public"]["Enums"]["ticket_type"] | null
          title: string
          updated_at?: string | null
        }
        Update: {
          assigned_to?: string | null
          client_id?: string | null
          created_at?: string | null
          created_by?: string | null
          department_id?: string | null
          description?: string
          escalation_level?: number | null
          external_reference?: string | null
          id?: string
          isp_company_id?: string | null
          location_info?: Json | null
          priority?: Database["public"]["Enums"]["ticket_priority"] | null
          requires_field_visit?: boolean | null
          resolution?: string | null
          resolved_at?: string | null
          sla_due_date?: string | null
          status?: Database["public"]["Enums"]["ticket_status"] | null
          ticket_source?: string | null
          ticket_type?: Database["public"]["Enums"]["ticket_type"] | null
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
            foreignKeyName: "support_tickets_department_id_fkey"
            columns: ["department_id"]
            isOneToOne: false
            referencedRelation: "departments"
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
      system_logs: {
        Row: {
          category: string
          created_at: string
          details: Json | null
          id: string
          isp_company_id: string | null
          level: string
          message: string
          source: string
          timestamp: string
        }
        Insert: {
          category: string
          created_at?: string
          details?: Json | null
          id?: string
          isp_company_id?: string | null
          level: string
          message: string
          source: string
          timestamp?: string
        }
        Update: {
          category?: string
          created_at?: string
          details?: Json | null
          id?: string
          isp_company_id?: string | null
          level?: string
          message?: string
          source?: string
          timestamp?: string
        }
        Relationships: [
          {
            foreignKeyName: "system_logs_isp_company_id_fkey"
            columns: ["isp_company_id"]
            isOneToOne: false
            referencedRelation: "isp_companies"
            referencedColumns: ["id"]
          },
        ]
      }
      system_settings: {
        Row: {
          backup_enabled: boolean | null
          backup_frequency: string | null
          company_name: string | null
          created_at: string | null
          currency: string | null
          date_format: string | null
          email_from_address: string | null
          id: string
          installation_fee: number | null
          isp_company_id: string
          maintenance_mode: boolean | null
          notifications_enabled: boolean | null
          smtp_host: string | null
          smtp_port: string | null
          smtp_username: string | null
          timezone: string | null
          updated_at: string | null
        }
        Insert: {
          backup_enabled?: boolean | null
          backup_frequency?: string | null
          company_name?: string | null
          created_at?: string | null
          currency?: string | null
          date_format?: string | null
          email_from_address?: string | null
          id?: string
          installation_fee?: number | null
          isp_company_id: string
          maintenance_mode?: boolean | null
          notifications_enabled?: boolean | null
          smtp_host?: string | null
          smtp_port?: string | null
          smtp_username?: string | null
          timezone?: string | null
          updated_at?: string | null
        }
        Update: {
          backup_enabled?: boolean | null
          backup_frequency?: string | null
          company_name?: string | null
          created_at?: string | null
          currency?: string | null
          date_format?: string | null
          email_from_address?: string | null
          id?: string
          installation_fee?: number | null
          isp_company_id?: string
          maintenance_mode?: boolean | null
          notifications_enabled?: boolean | null
          smtp_host?: string | null
          smtp_port?: string | null
          smtp_username?: string | null
          timezone?: string | null
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "system_settings_isp_company_id_fkey"
            columns: ["isp_company_id"]
            isOneToOne: true
            referencedRelation: "isp_companies"
            referencedColumns: ["id"]
          },
        ]
      }
      technical_installations: {
        Row: {
          assigned_technician: string | null
          client_id: string
          completed_at: string | null
          completed_by: string | null
          completion_notes: string | null
          created_at: string | null
          id: string
          installation_date: string | null
          isp_company_id: string
          status: string | null
          updated_at: string | null
        }
        Insert: {
          assigned_technician?: string | null
          client_id: string
          completed_at?: string | null
          completed_by?: string | null
          completion_notes?: string | null
          created_at?: string | null
          id?: string
          installation_date?: string | null
          isp_company_id: string
          status?: string | null
          updated_at?: string | null
        }
        Update: {
          assigned_technician?: string | null
          client_id?: string
          completed_at?: string | null
          completed_by?: string | null
          completion_notes?: string | null
          created_at?: string | null
          id?: string
          installation_date?: string | null
          isp_company_id?: string
          status?: string | null
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "technical_installations_assigned_technician_fkey"
            columns: ["assigned_technician"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "technical_installations_client_id_fkey"
            columns: ["client_id"]
            isOneToOne: false
            referencedRelation: "clients"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "technical_installations_completed_by_fkey"
            columns: ["completed_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "technical_installations_isp_company_id_fkey"
            columns: ["isp_company_id"]
            isOneToOne: false
            referencedRelation: "isp_companies"
            referencedColumns: ["id"]
          },
        ]
      }
      ticket_assignments: {
        Row: {
          assigned_at: string
          assigned_from: string | null
          assigned_to: string | null
          assignment_reason: string | null
          completed_at: string | null
          department_id: string | null
          id: string
          isp_company_id: string | null
          notes: string | null
          status: string
          ticket_id: string
        }
        Insert: {
          assigned_at?: string
          assigned_from?: string | null
          assigned_to?: string | null
          assignment_reason?: string | null
          completed_at?: string | null
          department_id?: string | null
          id?: string
          isp_company_id?: string | null
          notes?: string | null
          status?: string
          ticket_id: string
        }
        Update: {
          assigned_at?: string
          assigned_from?: string | null
          assigned_to?: string | null
          assignment_reason?: string | null
          completed_at?: string | null
          department_id?: string | null
          id?: string
          isp_company_id?: string | null
          notes?: string | null
          status?: string
          ticket_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "ticket_assignments_assigned_from_fkey"
            columns: ["assigned_from"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "ticket_assignments_assigned_to_fkey"
            columns: ["assigned_to"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "ticket_assignments_department_id_fkey"
            columns: ["department_id"]
            isOneToOne: false
            referencedRelation: "departments"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "ticket_assignments_isp_company_id_fkey"
            columns: ["isp_company_id"]
            isOneToOne: false
            referencedRelation: "isp_companies"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "ticket_assignments_ticket_id_fkey"
            columns: ["ticket_id"]
            isOneToOne: false
            referencedRelation: "support_tickets"
            referencedColumns: ["id"]
          },
        ]
      }
      ticket_comments: {
        Row: {
          author_id: string
          content: string
          created_at: string
          id: string
          is_internal: boolean
          is_resolution: boolean
          isp_company_id: string | null
          ticket_id: string
          updated_at: string
        }
        Insert: {
          author_id: string
          content: string
          created_at?: string
          id?: string
          is_internal?: boolean
          is_resolution?: boolean
          isp_company_id?: string | null
          ticket_id: string
          updated_at?: string
        }
        Update: {
          author_id?: string
          content?: string
          created_at?: string
          id?: string
          is_internal?: boolean
          is_resolution?: boolean
          isp_company_id?: string | null
          ticket_id?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "ticket_comments_author_id_fkey"
            columns: ["author_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "ticket_comments_isp_company_id_fkey"
            columns: ["isp_company_id"]
            isOneToOne: false
            referencedRelation: "isp_companies"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "ticket_comments_ticket_id_fkey"
            columns: ["ticket_id"]
            isOneToOne: false
            referencedRelation: "support_tickets"
            referencedColumns: ["id"]
          },
        ]
      }
      usage_alerts: {
        Row: {
          alert_type: string
          client_id: string
          created_at: string
          current_usage_bytes: number | null
          id: string
          is_resolved: boolean | null
          isp_company_id: string | null
          message: string | null
          threshold_percentage: number | null
        }
        Insert: {
          alert_type: string
          client_id: string
          created_at?: string
          current_usage_bytes?: number | null
          id?: string
          is_resolved?: boolean | null
          isp_company_id?: string | null
          message?: string | null
          threshold_percentage?: number | null
        }
        Update: {
          alert_type?: string
          client_id?: string
          created_at?: string
          current_usage_bytes?: number | null
          id?: string
          is_resolved?: boolean | null
          isp_company_id?: string | null
          message?: string | null
          threshold_percentage?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "usage_alerts_client_id_fkey"
            columns: ["client_id"]
            isOneToOne: false
            referencedRelation: "clients"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "usage_alerts_isp_company_id_fkey"
            columns: ["isp_company_id"]
            isOneToOne: false
            referencedRelation: "isp_companies"
            referencedColumns: ["id"]
          },
        ]
      }
      wallet_monitoring_rules: {
        Row: {
          client_id: string
          created_at: string | null
          id: string
          is_active: boolean | null
          isp_company_id: string
          last_triggered_at: string | null
          rule_type: string
          threshold_amount: number | null
          threshold_days: number | null
        }
        Insert: {
          client_id: string
          created_at?: string | null
          id?: string
          is_active?: boolean | null
          isp_company_id: string
          last_triggered_at?: string | null
          rule_type: string
          threshold_amount?: number | null
          threshold_days?: number | null
        }
        Update: {
          client_id?: string
          created_at?: string | null
          id?: string
          is_active?: boolean | null
          isp_company_id?: string
          last_triggered_at?: string | null
          rule_type?: string
          threshold_amount?: number | null
          threshold_days?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "wallet_monitoring_rules_client_id_fkey"
            columns: ["client_id"]
            isOneToOne: false
            referencedRelation: "clients"
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
      delete_company_cascade: {
        Args: { company_id_param: string }
        Returns: Json
      }
      end_expired_sessions: {
        Args: Record<PropertyKey, never>
        Returns: undefined
      }
      generate_installation_invoice_number: {
        Args: Record<PropertyKey, never>
        Returns: string
      }
      generate_invoice_number: {
        Args: Record<PropertyKey, never>
        Returns: string
      }
      generate_service_package_invoice: {
        Args: { client_id_param: string }
        Returns: string
      }
      generate_tracking_number: {
        Args: Record<PropertyKey, never>
        Returns: string
      }
      generate_voucher_code: {
        Args: Record<PropertyKey, never>
        Returns: string
      }
      get_current_user_company_id: {
        Args: Record<PropertyKey, never>
        Returns: string
      }
      get_current_user_role: {
        Args: Record<PropertyKey, never>
        Returns: string
      }
      get_system_settings: {
        Args: { company_id: string }
        Returns: {
          backup_enabled: boolean
          backup_frequency: string
          company_name: string
          currency: string
          date_format: string
          email_from_address: string
          maintenance_mode: boolean
          notifications_enabled: boolean
          smtp_host: string
          smtp_port: string
          smtp_username: string
          timezone: string
        }[]
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
      promote_inventory_to_equipment: {
        Args: { equipment_data: Json; inventory_item_id: string }
        Returns: string
      }
      trigger_auto_notification: {
        Args: { p_client_id: string; p_data?: Json; p_trigger_event: string }
        Returns: undefined
      }
      update_client_workflow_status: {
        Args: {
          p_assigned_to?: string
          p_client_id: string
          p_notes?: string
          p_stage: string
          p_stage_data?: Json
        }
        Returns: undefined
      }
      upsert_system_settings: {
        Args: { company_id: string; settings_data: Json }
        Returns: undefined
      }
    }
    Enums: {
      client_status:
        | "active"
        | "suspended"
        | "disconnected"
        | "pending"
        | "approved"
      client_type: "individual" | "business" | "corporate" | "government"
      connection_type: "fiber" | "wireless" | "satellite" | "dsl"
      license_type: "starter" | "professional" | "enterprise" | "unlimited"
      payment_method: "mpesa" | "bank" | "cash"
      payment_status: "received" | "verified" | "reversed"
      stk_status: "pending" | "success" | "failed" | "cancelled"
      ticket_priority: "low" | "medium" | "high" | "urgent"
      ticket_status: "open" | "in_progress" | "resolved" | "closed"
      ticket_type:
        | "technical"
        | "billing"
        | "general"
        | "installation"
        | "maintenance"
        | "complaint"
      user_role:
        | "super_admin"
        | "isp_admin"
        | "manager"
        | "technician"
        | "support"
        | "billing"
        | "readonly"
        | "customer_support"
        | "sales_manager"
        | "billing_admin"
        | "network_engineer"
        | "infrastructure_manager"
        | "hotspot_admin"
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}

type DatabaseWithoutInternals = Omit<Database, "__InternalSupabase">

type DefaultSchema = DatabaseWithoutInternals[Extract<keyof Database, "public">]

export type Tables<
  DefaultSchemaTableNameOrOptions extends
    | keyof (DefaultSchema["Tables"] & DefaultSchema["Views"])
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
        DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
      DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])[TableName] extends {
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
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
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
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
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
    | { schema: keyof DatabaseWithoutInternals },
  EnumName extends DefaultSchemaEnumNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"]
    : never = never,
> = DefaultSchemaEnumNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : DefaultSchemaEnumNameOrOptions extends keyof DefaultSchema["Enums"]
    ? DefaultSchema["Enums"][DefaultSchemaEnumNameOrOptions]
    : never

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
    | keyof DefaultSchema["CompositeTypes"]
    | { schema: keyof DatabaseWithoutInternals },
  CompositeTypeName extends PublicCompositeTypeNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never = never,
> = PublicCompositeTypeNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof DefaultSchema["CompositeTypes"]
    ? DefaultSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
    : never

export const Constants = {
  public: {
    Enums: {
      client_status: [
        "active",
        "suspended",
        "disconnected",
        "pending",
        "approved",
      ],
      client_type: ["individual", "business", "corporate", "government"],
      connection_type: ["fiber", "wireless", "satellite", "dsl"],
      license_type: ["starter", "professional", "enterprise", "unlimited"],
      payment_method: ["mpesa", "bank", "cash"],
      payment_status: ["received", "verified", "reversed"],
      stk_status: ["pending", "success", "failed", "cancelled"],
      ticket_priority: ["low", "medium", "high", "urgent"],
      ticket_status: ["open", "in_progress", "resolved", "closed"],
      ticket_type: [
        "technical",
        "billing",
        "general",
        "installation",
        "maintenance",
        "complaint",
      ],
      user_role: [
        "super_admin",
        "isp_admin",
        "manager",
        "technician",
        "support",
        "billing",
        "readonly",
        "customer_support",
        "sales_manager",
        "billing_admin",
        "network_engineer",
        "infrastructure_manager",
        "hotspot_admin",
      ],
    },
  },
} as const
