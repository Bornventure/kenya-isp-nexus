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
          brand: string | null
          client_id: string | null
          created_at: string | null
          id: string
          isp_company_id: string | null
          mac_address: string | null
          model: string | null
          notes: string | null
          purchase_date: string | null
          serial_number: string
          status: string | null
          type: string
          updated_at: string | null
          warranty_end_date: string | null
        }
        Insert: {
          brand?: string | null
          client_id?: string | null
          created_at?: string | null
          id?: string
          isp_company_id?: string | null
          mac_address?: string | null
          model?: string | null
          notes?: string | null
          purchase_date?: string | null
          serial_number: string
          status?: string | null
          type: string
          updated_at?: string | null
          warranty_end_date?: string | null
        }
        Update: {
          brand?: string | null
          client_id?: string | null
          created_at?: string | null
          id?: string
          isp_company_id?: string | null
          mac_address?: string | null
          model?: string | null
          notes?: string | null
          purchase_date?: string | null
          serial_number?: string
          status?: string | null
          type?: string
          updated_at?: string | null
          warranty_end_date?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "equipment_client_id_fkey"
            columns: ["client_id"]
            isOneToOne: false
            referencedRelation: "clients"
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
