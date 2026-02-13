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
    PostgrestVersion: "14.1"
  }
  public: {
    Tables: {
      access_logs: {
        Row: {
          action_type: string
          id: string
          invitation_id: string | null
          scanned_by: string | null
          site_id: string
          timestamp: string
          user_id: string | null
          walk_in_visitor_id: string | null
        }
        Insert: {
          action_type: string
          id?: string
          invitation_id?: string | null
          scanned_by?: string | null
          site_id: string
          timestamp?: string
          user_id?: string | null
          walk_in_visitor_id?: string | null
        }
        Update: {
          action_type?: string
          id?: string
          invitation_id?: string | null
          scanned_by?: string | null
          site_id?: string
          timestamp?: string
          user_id?: string | null
          walk_in_visitor_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "access_logs_invitation_id_fkey"
            columns: ["invitation_id"]
            isOneToOne: false
            referencedRelation: "invitations"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "access_logs_site_id_fkey"
            columns: ["site_id"]
            isOneToOne: false
            referencedRelation: "sites"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "access_logs_walk_in_visitor_id_fkey"
            columns: ["walk_in_visitor_id"]
            isOneToOne: false
            referencedRelation: "walk_in_visitors"
            referencedColumns: ["id"]
          },
        ]
      }
      companies: {
        Row: {
          admin_id: string | null
          created_at: string
          id: string
          name: string
          site_id: string
          updated_at: string
        }
        Insert: {
          admin_id?: string | null
          created_at?: string
          id?: string
          name: string
          site_id: string
          updated_at?: string
        }
        Update: {
          admin_id?: string | null
          created_at?: string
          id?: string
          name?: string
          site_id?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "companies_site_id_fkey"
            columns: ["site_id"]
            isOneToOne: false
            referencedRelation: "sites"
            referencedColumns: ["id"]
          },
        ]
      }
      employees: {
        Row: {
          company_id: string
          created_at: string
          id: string
          qr_code: string
          unique_code: string
          user_id: string
        }
        Insert: {
          company_id: string
          created_at?: string
          id?: string
          qr_code: string
          unique_code: string
          user_id: string
        }
        Update: {
          company_id?: string
          created_at?: string
          id?: string
          qr_code?: string
          unique_code?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "employees_company_id_fkey"
            columns: ["company_id"]
            isOneToOne: false
            referencedRelation: "companies"
            referencedColumns: ["id"]
          },
        ]
      }
      global_settings: {
        Row: {
          accent_color: string | null
          default_language: string | null
          geofencing_enabled: boolean | null
          id: string
          logo_url_dark: string | null
          logo_url_light: string | null
          mfa_required: boolean | null
          org_name: string | null
          primary_color: string | null
          retention_months: number | null
          session_timeout_hours: number | null
          support_url: string | null
          timezone: string | null
          updated_at: string | null
          updated_by: string | null
        }
        Insert: {
          accent_color?: string | null
          default_language?: string | null
          geofencing_enabled?: boolean | null
          id?: string
          logo_url_dark?: string | null
          logo_url_light?: string | null
          mfa_required?: boolean | null
          org_name?: string | null
          primary_color?: string | null
          retention_months?: number | null
          session_timeout_hours?: number | null
          support_url?: string | null
          timezone?: string | null
          updated_at?: string | null
          updated_by?: string | null
        }
        Update: {
          accent_color?: string | null
          default_language?: string | null
          geofencing_enabled?: boolean | null
          id?: string
          logo_url_dark?: string | null
          logo_url_light?: string | null
          mfa_required?: boolean | null
          org_name?: string | null
          primary_color?: string | null
          retention_months?: number | null
          session_timeout_hours?: number | null
          support_url?: string | null
          timezone?: string | null
          updated_at?: string | null
          updated_by?: string | null
        }
        Relationships: []
      }
      guardians: {
        Row: {
          created_at: string
          id: string
          site_id: string
          user_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          site_id: string
          user_id: string
        }
        Update: {
          created_at?: string
          id?: string
          site_id?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "guardians_site_id_fkey"
            columns: ["site_id"]
            isOneToOne: false
            referencedRelation: "sites"
            referencedColumns: ["id"]
          },
        ]
      }
      invitations: {
        Row: {
          alpha_code: string
          created_at: string
          employee_id: string
          id: string
          qr_code: string
          status: string
          updated_at: string
          visit_date: string
          visit_time: string
          visitor_name: string
          visitor_phone: string
        }
        Insert: {
          alpha_code: string
          created_at?: string
          employee_id: string
          id?: string
          qr_code: string
          status?: string
          updated_at?: string
          visit_date: string
          visit_time: string
          visitor_name: string
          visitor_phone: string
        }
        Update: {
          alpha_code?: string
          created_at?: string
          employee_id?: string
          id?: string
          qr_code?: string
          status?: string
          updated_at?: string
          visit_date?: string
          visit_time?: string
          visitor_name?: string
          visitor_phone?: string
        }
        Relationships: [
          {
            foreignKeyName: "invitations_employee_id_fkey"
            columns: ["employee_id"]
            isOneToOne: false
            referencedRelation: "employees"
            referencedColumns: ["id"]
          },
        ]
      }
      profiles: {
        Row: {
          created_at: string
          email: string
          first_name: string
          id: string
          last_name: string
          phone: string | null
          updated_at: string
        }
        Insert: {
          created_at?: string
          email: string
          first_name: string
          id: string
          last_name: string
          phone?: string | null
          updated_at?: string
        }
        Update: {
          created_at?: string
          email?: string
          first_name?: string
          id?: string
          last_name?: string
          phone?: string | null
          updated_at?: string
        }
        Relationships: []
      }
      scheduled_reports: {
        Row: {
          created_at: string
          email: string
          format: string
          id: string
          is_active: boolean
          last_sent_at: string | null
          next_send_at: string
          report_type: string
          site_id: string | null
          updated_at: string
          user_id: string
        }
        Insert: {
          created_at?: string
          email: string
          format: string
          id?: string
          is_active?: boolean
          last_sent_at?: string | null
          next_send_at: string
          report_type: string
          site_id?: string | null
          updated_at?: string
          user_id: string
        }
        Update: {
          created_at?: string
          email?: string
          format?: string
          id?: string
          is_active?: boolean
          last_sent_at?: string | null
          next_send_at?: string
          report_type?: string
          site_id?: string | null
          updated_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "scheduled_reports_site_id_fkey"
            columns: ["site_id"]
            isOneToOne: false
            referencedRelation: "sites"
            referencedColumns: ["id"]
          },
        ]
      }
      sites: {
        Row: {
          address: string
          created_at: string
          id: string
          manager_id: string | null
          name: string
          updated_at: string
        }
        Insert: {
          address: string
          created_at?: string
          id?: string
          manager_id?: string | null
          name: string
          updated_at?: string
        }
        Update: {
          address?: string
          created_at?: string
          id?: string
          manager_id?: string | null
          name?: string
          updated_at?: string
        }
        Relationships: []
      }
      user_roles: {
        Row: {
          created_at: string
          id: string
          role: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          role: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Update: {
          created_at?: string
          id?: string
          role?: Database["public"]["Enums"]["app_role"]
          user_id?: string
        }
        Relationships: []
      }
      walk_in_visitors: {
        Row: {
          address: string | null
          birth_date: string | null
          created_at: string
          exit_at: string | null
          exit_validated: boolean | null
          first_name: string
          gender: string | null
          id: string
          id_card_expiry: string | null
          id_card_number: string
          last_name: string
          nationality: string | null
          photo_url: string | null
          receipt_code: string | null
          receipt_qr_code: string | null
          scanned_by: string | null
          site_id: string
        }
        Insert: {
          address?: string | null
          birth_date?: string | null
          created_at?: string
          exit_at?: string | null
          exit_validated?: boolean | null
          first_name: string
          gender?: string | null
          id?: string
          id_card_expiry?: string | null
          id_card_number: string
          last_name: string
          nationality?: string | null
          photo_url?: string | null
          receipt_code?: string | null
          receipt_qr_code?: string | null
          scanned_by?: string | null
          site_id: string
        }
        Update: {
          address?: string | null
          birth_date?: string | null
          created_at?: string
          exit_at?: string | null
          exit_validated?: boolean | null
          first_name?: string
          gender?: string | null
          id?: string
          id_card_expiry?: string | null
          id_card_number?: string
          last_name?: string
          nationality?: string | null
          photo_url?: string | null
          receipt_code?: string | null
          receipt_qr_code?: string | null
          scanned_by?: string | null
          site_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "walk_in_visitors_site_id_fkey"
            columns: ["site_id"]
            isOneToOne: false
            referencedRelation: "sites"
            referencedColumns: ["id"]
          },
        ]
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      generate_receipt_code: { Args: never; Returns: string }
      get_company_site_id_for_user: {
        Args: { _user_id: string }
        Returns: string
      }
      get_employee_company_id: { Args: { _user_id: string }; Returns: string }
      get_guardian_site_id: { Args: { _user_id: string }; Returns: string }
      get_manager_site_id: { Args: { _user_id: string }; Returns: string }
      get_user_site_id: { Args: { _user_id: string }; Returns: string }
      has_role: {
        Args: {
          _role: Database["public"]["Enums"]["app_role"]
          _user_id: string
        }
        Returns: boolean
      }
      is_super_admin: { Args: { _user_id: string }; Returns: boolean }
    }
    Enums: {
      app_role:
        | "super_admin"
        | "manager"
        | "guardian"
        | "company_admin"
        | "employee"
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
      app_role: [
        "super_admin",
        "manager",
        "guardian",
        "company_admin",
        "employee",
      ],
    },
  },
} as const
