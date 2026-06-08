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
    PostgrestVersion: "13.0.5"
  }
  public: {
    Tables: {
      appointments: {
        Row: {
          appointment_date: string
          created_at: string
          doctor_id: string | null
          duration_minutes: number
          id: string
          institute_id: string | null
          notes: string | null
          patient_id: string
          reason: string | null
          status: Database["public"]["Enums"]["appointment_status"]
          updated_at: string
        }
        Insert: {
          appointment_date: string
          created_at?: string
          doctor_id?: string | null
          duration_minutes?: number
          id?: string
          institute_id?: string | null
          notes?: string | null
          patient_id: string
          reason?: string | null
          status?: Database["public"]["Enums"]["appointment_status"]
          updated_at?: string
        }
        Update: {
          appointment_date?: string
          created_at?: string
          doctor_id?: string | null
          duration_minutes?: number
          id?: string
          institute_id?: string | null
          notes?: string | null
          patient_id?: string
          reason?: string | null
          status?: Database["public"]["Enums"]["appointment_status"]
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "appointments_institute_id_fkey"
            columns: ["institute_id"]
            isOneToOne: false
            referencedRelation: "institutes"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "appointments_patient_id_fkey"
            columns: ["patient_id"]
            isOneToOne: false
            referencedRelation: "patients"
            referencedColumns: ["id"]
          },
        ]
      }
      chat_messages: {
        Row: {
          body: string
          created_at: string
          id: string
          institute_id: string | null
          read: boolean
          recipient_id: string
          sender_id: string
        }
        Insert: {
          body: string
          created_at?: string
          id?: string
          institute_id?: string | null
          read?: boolean
          recipient_id: string
          sender_id: string
        }
        Update: {
          body?: string
          created_at?: string
          id?: string
          institute_id?: string | null
          read?: boolean
          recipient_id?: string
          sender_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "chat_messages_institute_id_fkey"
            columns: ["institute_id"]
            isOneToOne: false
            referencedRelation: "institutes"
            referencedColumns: ["id"]
          },
        ]
      }
      donations: {
        Row: {
          blood_group: Database["public"]["Enums"]["blood_group"]
          created_at: string
          created_by: string | null
          donation_date: string
          donor_name: string
          email: string | null
          id: string
          institute_id: string | null
          notes: string | null
          phone: string
          status: Database["public"]["Enums"]["donation_status"]
          units: number
          updated_at: string
        }
        Insert: {
          blood_group: Database["public"]["Enums"]["blood_group"]
          created_at?: string
          created_by?: string | null
          donation_date: string
          donor_name: string
          email?: string | null
          id?: string
          institute_id?: string | null
          notes?: string | null
          phone: string
          status?: Database["public"]["Enums"]["donation_status"]
          units: number
          updated_at?: string
        }
        Update: {
          blood_group?: Database["public"]["Enums"]["blood_group"]
          created_at?: string
          created_by?: string | null
          donation_date?: string
          donor_name?: string
          email?: string | null
          id?: string
          institute_id?: string | null
          notes?: string | null
          phone?: string
          status?: Database["public"]["Enums"]["donation_status"]
          units?: number
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "donations_institute_id_fkey"
            columns: ["institute_id"]
            isOneToOne: false
            referencedRelation: "institutes"
            referencedColumns: ["id"]
          },
        ]
      }
      institutes: {
        Row: {
          address: string | null
          approved_by: string | null
          created_at: string
          created_by: string | null
          domain: string | null
          email: string | null
          id: string
          name: string
          phone: string | null
          registration_key: string
          status: Database["public"]["Enums"]["institute_status"]
          type: Database["public"]["Enums"]["institute_type"]
          updated_at: string
        }
        Insert: {
          address?: string | null
          approved_by?: string | null
          created_at?: string
          created_by?: string | null
          domain?: string | null
          email?: string | null
          id?: string
          name: string
          phone?: string | null
          registration_key: string
          status?: Database["public"]["Enums"]["institute_status"]
          type: Database["public"]["Enums"]["institute_type"]
          updated_at?: string
        }
        Update: {
          address?: string | null
          approved_by?: string | null
          created_at?: string
          created_by?: string | null
          domain?: string | null
          email?: string | null
          id?: string
          name?: string
          phone?: string | null
          registration_key?: string
          status?: Database["public"]["Enums"]["institute_status"]
          type?: Database["public"]["Enums"]["institute_type"]
          updated_at?: string
        }
        Relationships: []
      }
      medical_history: {
        Row: {
          condition: string
          created_at: string
          created_by: string | null
          diagnosed_date: string | null
          id: string
          institute_id: string | null
          notes: string | null
          patient_id: string
          updated_at: string
        }
        Insert: {
          condition: string
          created_at?: string
          created_by?: string | null
          diagnosed_date?: string | null
          id?: string
          institute_id?: string | null
          notes?: string | null
          patient_id: string
          updated_at?: string
        }
        Update: {
          condition?: string
          created_at?: string
          created_by?: string | null
          diagnosed_date?: string | null
          id?: string
          institute_id?: string | null
          notes?: string | null
          patient_id?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "medical_history_institute_id_fkey"
            columns: ["institute_id"]
            isOneToOne: false
            referencedRelation: "institutes"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "medical_history_patient_id_fkey"
            columns: ["patient_id"]
            isOneToOne: false
            referencedRelation: "patients"
            referencedColumns: ["id"]
          },
        ]
      }
      notifications: {
        Row: {
          body: string | null
          created_at: string
          created_by: string | null
          id: string
          institute_id: string | null
          kind: string
          link: string | null
          read: boolean
          title: string
          user_id: string
        }
        Insert: {
          body?: string | null
          created_at?: string
          created_by?: string | null
          id?: string
          institute_id?: string | null
          kind?: string
          link?: string | null
          read?: boolean
          title: string
          user_id: string
        }
        Update: {
          body?: string | null
          created_at?: string
          created_by?: string | null
          id?: string
          institute_id?: string | null
          kind?: string
          link?: string | null
          read?: boolean
          title?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "notifications_institute_id_fkey"
            columns: ["institute_id"]
            isOneToOne: false
            referencedRelation: "institutes"
            referencedColumns: ["id"]
          },
        ]
      }
      patients: {
        Row: {
          address: string | null
          blood_group: Database["public"]["Enums"]["blood_group"] | null
          created_at: string
          created_by: string | null
          date_of_birth: string
          email: string | null
          emergency_contact: string | null
          emergency_phone: string | null
          full_name: string
          gender: Database["public"]["Enums"]["gender"]
          id: string
          institute_id: string | null
          medical_notes: string | null
          patient_user_id: string | null
          phone: string | null
          updated_at: string
        }
        Insert: {
          address?: string | null
          blood_group?: Database["public"]["Enums"]["blood_group"] | null
          created_at?: string
          created_by?: string | null
          date_of_birth: string
          email?: string | null
          emergency_contact?: string | null
          emergency_phone?: string | null
          full_name: string
          gender: Database["public"]["Enums"]["gender"]
          id?: string
          institute_id?: string | null
          medical_notes?: string | null
          patient_user_id?: string | null
          phone?: string | null
          updated_at?: string
        }
        Update: {
          address?: string | null
          blood_group?: Database["public"]["Enums"]["blood_group"] | null
          created_at?: string
          created_by?: string | null
          date_of_birth?: string
          email?: string | null
          emergency_contact?: string | null
          emergency_phone?: string | null
          full_name?: string
          gender?: Database["public"]["Enums"]["gender"]
          id?: string
          institute_id?: string | null
          medical_notes?: string | null
          patient_user_id?: string | null
          phone?: string | null
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "patients_institute_id_fkey"
            columns: ["institute_id"]
            isOneToOne: false
            referencedRelation: "institutes"
            referencedColumns: ["id"]
          },
        ]
      }
      pharmacy_inventory: {
        Row: {
          created_at: string
          expiry_date: string | null
          id: string
          institute_id: string
          medication_name: string
          notes: string | null
          quantity: number
          reorder_level: number
          sku: string | null
          unit: string
          updated_at: string
          updated_by: string | null
        }
        Insert: {
          created_at?: string
          expiry_date?: string | null
          id?: string
          institute_id: string
          medication_name: string
          notes?: string | null
          quantity?: number
          reorder_level?: number
          sku?: string | null
          unit?: string
          updated_at?: string
          updated_by?: string | null
        }
        Update: {
          created_at?: string
          expiry_date?: string | null
          id?: string
          institute_id?: string
          medication_name?: string
          notes?: string | null
          quantity?: number
          reorder_level?: number
          sku?: string | null
          unit?: string
          updated_at?: string
          updated_by?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "pharmacy_inventory_institute_id_fkey"
            columns: ["institute_id"]
            isOneToOne: false
            referencedRelation: "institutes"
            referencedColumns: ["id"]
          },
        ]
      }
      prescriptions: {
        Row: {
          created_at: string
          dosage: string
          duration: string
          frequency: string
          id: string
          institute_id: string | null
          medication_available: boolean | null
          medication_name: string
          medication_substituted: boolean | null
          notes: string | null
          patient_id: string
          pharmacist_id: string | null
          pharmacist_notes: string | null
          pharmacist_updated_at: string | null
          prescribed_by: string | null
          status: Database["public"]["Enums"]["prescription_status"]
          substituted_medication: string | null
          updated_at: string
        }
        Insert: {
          created_at?: string
          dosage: string
          duration: string
          frequency: string
          id?: string
          institute_id?: string | null
          medication_available?: boolean | null
          medication_name: string
          medication_substituted?: boolean | null
          notes?: string | null
          patient_id: string
          pharmacist_id?: string | null
          pharmacist_notes?: string | null
          pharmacist_updated_at?: string | null
          prescribed_by?: string | null
          status?: Database["public"]["Enums"]["prescription_status"]
          substituted_medication?: string | null
          updated_at?: string
        }
        Update: {
          created_at?: string
          dosage?: string
          duration?: string
          frequency?: string
          id?: string
          institute_id?: string | null
          medication_available?: boolean | null
          medication_name?: string
          medication_substituted?: boolean | null
          notes?: string | null
          patient_id?: string
          pharmacist_id?: string | null
          pharmacist_notes?: string | null
          pharmacist_updated_at?: string | null
          prescribed_by?: string | null
          status?: Database["public"]["Enums"]["prescription_status"]
          substituted_medication?: string | null
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "prescriptions_institute_id_fkey"
            columns: ["institute_id"]
            isOneToOne: false
            referencedRelation: "institutes"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "prescriptions_patient_id_fkey"
            columns: ["patient_id"]
            isOneToOne: false
            referencedRelation: "patients"
            referencedColumns: ["id"]
          },
        ]
      }
      profiles: {
        Row: {
          avatar_url: string | null
          created_at: string
          email: string
          full_name: string
          id: string
          institute_id: string | null
          phone: string | null
          updated_at: string
        }
        Insert: {
          avatar_url?: string | null
          created_at?: string
          email: string
          full_name: string
          id: string
          institute_id?: string | null
          phone?: string | null
          updated_at?: string
        }
        Update: {
          avatar_url?: string | null
          created_at?: string
          email?: string
          full_name?: string
          id?: string
          institute_id?: string | null
          phone?: string | null
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "profiles_institute_id_fkey"
            columns: ["institute_id"]
            isOneToOne: false
            referencedRelation: "institutes"
            referencedColumns: ["id"]
          },
        ]
      }
      theatre_bookings: {
        Row: {
          created_at: string
          created_by: string | null
          ends_at: string
          id: string
          institute_id: string
          notes: string | null
          patient_id: string | null
          procedure: string
          room_id: string
          starts_at: string
          status: string
          surgeon_id: string | null
          updated_at: string
        }
        Insert: {
          created_at?: string
          created_by?: string | null
          ends_at: string
          id?: string
          institute_id: string
          notes?: string | null
          patient_id?: string | null
          procedure: string
          room_id: string
          starts_at: string
          status?: string
          surgeon_id?: string | null
          updated_at?: string
        }
        Update: {
          created_at?: string
          created_by?: string | null
          ends_at?: string
          id?: string
          institute_id?: string
          notes?: string | null
          patient_id?: string | null
          procedure?: string
          room_id?: string
          starts_at?: string
          status?: string
          surgeon_id?: string | null
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "theatre_bookings_institute_id_fkey"
            columns: ["institute_id"]
            isOneToOne: false
            referencedRelation: "institutes"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "theatre_bookings_patient_id_fkey"
            columns: ["patient_id"]
            isOneToOne: false
            referencedRelation: "patients"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "theatre_bookings_room_id_fkey"
            columns: ["room_id"]
            isOneToOne: false
            referencedRelation: "theatre_rooms"
            referencedColumns: ["id"]
          },
        ]
      }
      theatre_rooms: {
        Row: {
          active: boolean
          created_at: string
          description: string | null
          id: string
          institute_id: string
          name: string
          updated_at: string
        }
        Insert: {
          active?: boolean
          created_at?: string
          description?: string | null
          id?: string
          institute_id: string
          name: string
          updated_at?: string
        }
        Update: {
          active?: boolean
          created_at?: string
          description?: string | null
          id?: string
          institute_id?: string
          name?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "theatre_rooms_institute_id_fkey"
            columns: ["institute_id"]
            isOneToOne: false
            referencedRelation: "institutes"
            referencedColumns: ["id"]
          },
        ]
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
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      dispense_medication: {
        Args: { _inventory_id: string; _qty: number }
        Returns: {
          created_at: string
          expiry_date: string | null
          id: string
          institute_id: string
          medication_name: string
          notes: string | null
          quantity: number
          reorder_level: number
          sku: string | null
          unit: string
          updated_at: string
          updated_by: string | null
        }
        SetofOptions: {
          from: "*"
          to: "pharmacy_inventory"
          isOneToOne: true
          isSetofReturn: false
        }
      }
      get_user_institute_id: { Args: { _user_id: string }; Returns: string }
      has_role: {
        Args: {
          _role: Database["public"]["Enums"]["app_role"]
          _user_id: string
        }
        Returns: boolean
      }
    }
    Enums: {
      app_role:
        | "admin"
        | "doctor"
        | "nurse"
        | "pharmacist"
        | "super_admin"
        | "patient"
      appointment_status: "scheduled" | "completed" | "cancelled" | "no_show"
      blood_group: "A+" | "A-" | "B+" | "B-" | "AB+" | "AB-" | "O+" | "O-"
      donation_status: "pending" | "approved" | "completed" | "rejected"
      gender: "male" | "female" | "other"
      institute_status: "pending" | "approved" | "rejected"
      institute_type: "hospital" | "clinic" | "surgery" | "pharmacy"
      prescription_status: "active" | "completed" | "cancelled"
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
        "admin",
        "doctor",
        "nurse",
        "pharmacist",
        "super_admin",
        "patient",
      ],
      appointment_status: ["scheduled", "completed", "cancelled", "no_show"],
      blood_group: ["A+", "A-", "B+", "B-", "AB+", "AB-", "O+", "O-"],
      donation_status: ["pending", "approved", "completed", "rejected"],
      gender: ["male", "female", "other"],
      institute_status: ["pending", "approved", "rejected"],
      institute_type: ["hospital", "clinic", "surgery", "pharmacy"],
      prescription_status: ["active", "completed", "cancelled"],
    },
  },
} as const
