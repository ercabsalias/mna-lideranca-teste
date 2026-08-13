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
    PostgrestVersion: "14.15"
  }
  public: {
    Tables: {
      admin_regions: {
        Row: {
          created_at: string
          id: string
          region_id: string
          user_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          region_id: string
          user_id: string
        }
        Update: {
          created_at?: string
          id?: string
          region_id?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "admin_regions_region_id_fkey"
            columns: ["region_id"]
            isOneToOne: false
            referencedRelation: "regions"
            referencedColumns: ["id"]
          },
        ]
      }
      assessment_types: {
        Row: {
          created_at: string
          id: string
          name: string
          status: Database["public"]["Enums"]["record_status"]
          updated_at: string
          weight: number
        }
        Insert: {
          created_at?: string
          id?: string
          name: string
          status?: Database["public"]["Enums"]["record_status"]
          updated_at?: string
          weight?: number
        }
        Update: {
          created_at?: string
          id?: string
          name?: string
          status?: Database["public"]["Enums"]["record_status"]
          updated_at?: string
          weight?: number
        }
        Relationships: []
      }
      attendance: {
        Row: {
          created_at: string
          created_by: string | null
          discipline_id: string | null
          id: string
          is_demo: boolean
          note: string | null
          pre_leader_id: string
          session_date: string
          status: Database["public"]["Enums"]["attendance_status"]
          trainer_id: string | null
        }
        Insert: {
          created_at?: string
          created_by?: string | null
          discipline_id?: string | null
          id?: string
          is_demo?: boolean
          note?: string | null
          pre_leader_id: string
          session_date: string
          status?: Database["public"]["Enums"]["attendance_status"]
          trainer_id?: string | null
        }
        Update: {
          created_at?: string
          created_by?: string | null
          discipline_id?: string | null
          id?: string
          is_demo?: boolean
          note?: string | null
          pre_leader_id?: string
          session_date?: string
          status?: Database["public"]["Enums"]["attendance_status"]
          trainer_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "attendance_discipline_id_fkey"
            columns: ["discipline_id"]
            isOneToOne: false
            referencedRelation: "disciplines"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "attendance_pre_leader_id_fkey"
            columns: ["pre_leader_id"]
            isOneToOne: false
            referencedRelation: "pre_leaders"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "attendance_trainer_id_fkey"
            columns: ["trainer_id"]
            isOneToOne: false
            referencedRelation: "trainers"
            referencedColumns: ["id"]
          },
        ]
      }
      audit_logs: {
        Row: {
          action: string
          created_at: string
          entity: string
          entity_id: string | null
          id: string
          ip: string | null
          new_value: Json | null
          old_value: Json | null
          user_id: string | null
          username: string | null
        }
        Insert: {
          action: string
          created_at?: string
          entity: string
          entity_id?: string | null
          id?: string
          ip?: string | null
          new_value?: Json | null
          old_value?: Json | null
          user_id?: string | null
          username?: string | null
        }
        Update: {
          action?: string
          created_at?: string
          entity?: string
          entity_id?: string | null
          id?: string
          ip?: string | null
          new_value?: Json | null
          old_value?: Json | null
          user_id?: string | null
          username?: string | null
        }
        Relationships: []
      }
      churches: {
        Row: {
          created_at: string
          id: string
          is_demo: boolean
          name: string
          region_id: string
          status: Database["public"]["Enums"]["record_status"]
          updated_at: string
        }
        Insert: {
          created_at?: string
          id?: string
          is_demo?: boolean
          name: string
          region_id: string
          status?: Database["public"]["Enums"]["record_status"]
          updated_at?: string
        }
        Update: {
          created_at?: string
          id?: string
          is_demo?: boolean
          name?: string
          region_id?: string
          status?: Database["public"]["Enums"]["record_status"]
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "churches_region_id_fkey"
            columns: ["region_id"]
            isOneToOne: false
            referencedRelation: "regions"
            referencedColumns: ["id"]
          },
        ]
      }
      cohorts: {
        Row: {
          created_at: string
          end_date: string | null
          id: string
          investiture_date: string | null
          is_current: boolean
          name: string
          start_date: string | null
          updated_at: string
          year: number
        }
        Insert: {
          created_at?: string
          end_date?: string | null
          id?: string
          investiture_date?: string | null
          is_current?: boolean
          name: string
          start_date?: string | null
          updated_at?: string
          year: number
        }
        Update: {
          created_at?: string
          end_date?: string | null
          id?: string
          investiture_date?: string | null
          is_current?: boolean
          name?: string
          start_date?: string | null
          updated_at?: string
          year?: number
        }
        Relationships: []
      }
      disciplines: {
        Row: {
          created_at: string
          description: string | null
          id: string
          is_demo: boolean
          is_required: boolean
          min_grade: number
          name: string
          specialty_id: string | null
          status: Database["public"]["Enums"]["record_status"]
          trainer_id: string | null
          updated_at: string
          weight: number
        }
        Insert: {
          created_at?: string
          description?: string | null
          id?: string
          is_demo?: boolean
          is_required?: boolean
          min_grade?: number
          name: string
          specialty_id?: string | null
          status?: Database["public"]["Enums"]["record_status"]
          trainer_id?: string | null
          updated_at?: string
          weight?: number
        }
        Update: {
          created_at?: string
          description?: string | null
          id?: string
          is_demo?: boolean
          is_required?: boolean
          min_grade?: number
          name?: string
          specialty_id?: string | null
          status?: Database["public"]["Enums"]["record_status"]
          trainer_id?: string | null
          updated_at?: string
          weight?: number
        }
        Relationships: [
          {
            foreignKeyName: "disciplines_specialty_id_fkey"
            columns: ["specialty_id"]
            isOneToOne: false
            referencedRelation: "specialties"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "disciplines_trainer_id_fkey"
            columns: ["trainer_id"]
            isOneToOne: false
            referencedRelation: "trainers"
            referencedColumns: ["id"]
          },
        ]
      }
      grades: {
        Row: {
          assessment_type_id: string | null
          created_at: string
          created_by: string | null
          discipline_id: string | null
          id: string
          is_demo: boolean
          note: string | null
          pre_leader_id: string
          score: number
          stage_date: string
          stage_label: string
          trainer_id: string | null
          updated_at: string
        }
        Insert: {
          assessment_type_id?: string | null
          created_at?: string
          created_by?: string | null
          discipline_id?: string | null
          id?: string
          is_demo?: boolean
          note?: string | null
          pre_leader_id: string
          score: number
          stage_date?: string
          stage_label?: string
          trainer_id?: string | null
          updated_at?: string
        }
        Update: {
          assessment_type_id?: string | null
          created_at?: string
          created_by?: string | null
          discipline_id?: string | null
          id?: string
          is_demo?: boolean
          note?: string | null
          pre_leader_id?: string
          score?: number
          stage_date?: string
          stage_label?: string
          trainer_id?: string | null
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "grades_assessment_type_id_fkey"
            columns: ["assessment_type_id"]
            isOneToOne: false
            referencedRelation: "assessment_types"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "grades_discipline_id_fkey"
            columns: ["discipline_id"]
            isOneToOne: false
            referencedRelation: "disciplines"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "grades_pre_leader_id_fkey"
            columns: ["pre_leader_id"]
            isOneToOne: false
            referencedRelation: "pre_leaders"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "grades_trainer_id_fkey"
            columns: ["trainer_id"]
            isOneToOne: false
            referencedRelation: "trainers"
            referencedColumns: ["id"]
          },
        ]
      }
      observations: {
        Row: {
          content: string
          created_at: string
          created_by: string | null
          id: string
          is_demo: boolean
          observed_at: string
          pre_leader_id: string
          severity: number
        }
        Insert: {
          content: string
          created_at?: string
          created_by?: string | null
          id?: string
          is_demo?: boolean
          observed_at?: string
          pre_leader_id: string
          severity?: number
        }
        Update: {
          content?: string
          created_at?: string
          created_by?: string | null
          id?: string
          is_demo?: boolean
          observed_at?: string
          pre_leader_id?: string
          severity?: number
        }
        Relationships: [
          {
            foreignKeyName: "observations_pre_leader_id_fkey"
            columns: ["pre_leader_id"]
            isOneToOne: false
            referencedRelation: "pre_leaders"
            referencedColumns: ["id"]
          },
        ]
      }
      pre_leaders: {
        Row: {
          access_key: string | null
          baptism_date: string | null
          bi_number: string
          birth_date: string | null
          church_id: string
          club_name: string | null
          club_role: string | null
          cohort_id: string | null
          created_at: string
          created_by: string | null
          email: string | null
          enrolled_at: string
          full_name: string
          gender: string | null
          id: string
          initial_note: string | null
          is_demo: boolean
          phone: string | null
          photo_url: string | null
          region_id: string
          specialty_id: string | null
          status: Database["public"]["Enums"]["record_status"]
          updated_at: string
        }
        Insert: {
          access_key?: string | null
          baptism_date?: string | null
          bi_number: string
          birth_date?: string | null
          church_id: string
          club_name?: string | null
          club_role?: string | null
          cohort_id?: string | null
          created_at?: string
          created_by?: string | null
          email?: string | null
          enrolled_at?: string
          full_name: string
          gender?: string | null
          id?: string
          initial_note?: string | null
          is_demo?: boolean
          phone?: string | null
          photo_url?: string | null
          region_id: string
          specialty_id?: string | null
          status?: Database["public"]["Enums"]["record_status"]
          updated_at?: string
        }
        Update: {
          access_key?: string | null
          baptism_date?: string | null
          bi_number?: string
          birth_date?: string | null
          church_id?: string
          club_name?: string | null
          club_role?: string | null
          cohort_id?: string | null
          created_at?: string
          created_by?: string | null
          email?: string | null
          enrolled_at?: string
          full_name?: string
          gender?: string | null
          id?: string
          initial_note?: string | null
          is_demo?: boolean
          phone?: string | null
          photo_url?: string | null
          region_id?: string
          specialty_id?: string | null
          status?: Database["public"]["Enums"]["record_status"]
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "pre_leaders_church_id_fkey"
            columns: ["church_id"]
            isOneToOne: false
            referencedRelation: "churches"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "pre_leaders_cohort_id_fkey"
            columns: ["cohort_id"]
            isOneToOne: false
            referencedRelation: "cohorts"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "pre_leaders_region_id_fkey"
            columns: ["region_id"]
            isOneToOne: false
            referencedRelation: "regions"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "pre_leaders_specialty_id_fkey"
            columns: ["specialty_id"]
            isOneToOne: false
            referencedRelation: "specialties"
            referencedColumns: ["id"]
          },
        ]
      }
      profiles: {
        Row: {
          created_at: string
          email: string | null
          full_name: string
          id: string
          must_change_password: boolean
          phone: string | null
          photo_url: string | null
          status: Database["public"]["Enums"]["record_status"]
          updated_at: string
          username: string
        }
        Insert: {
          created_at?: string
          email?: string | null
          full_name?: string
          id: string
          must_change_password?: boolean
          phone?: string | null
          photo_url?: string | null
          status?: Database["public"]["Enums"]["record_status"]
          updated_at?: string
          username: string
        }
        Update: {
          created_at?: string
          email?: string | null
          full_name?: string
          id?: string
          must_change_password?: boolean
          phone?: string | null
          photo_url?: string | null
          status?: Database["public"]["Enums"]["record_status"]
          updated_at?: string
          username?: string
        }
        Relationships: []
      }
      regions: {
        Row: {
          created_at: string
          id: string
          is_demo: boolean
          key_prefix: string
          name: string
          status: Database["public"]["Enums"]["record_status"]
          updated_at: string
        }
        Insert: {
          created_at?: string
          id?: string
          is_demo?: boolean
          key_prefix: string
          name: string
          status?: Database["public"]["Enums"]["record_status"]
          updated_at?: string
        }
        Update: {
          created_at?: string
          id?: string
          is_demo?: boolean
          key_prefix?: string
          name?: string
          status?: Database["public"]["Enums"]["record_status"]
          updated_at?: string
        }
        Relationships: []
      }
      settings: {
        Row: {
          key: string
          updated_at: string
          value: Json
        }
        Insert: {
          key: string
          updated_at?: string
          value: Json
        }
        Update: {
          key?: string
          updated_at?: string
          value?: Json
        }
        Relationships: []
      }
      specialties: {
        Row: {
          color: string
          created_at: string
          description: string | null
          id: string
          name: string
          slug: string
          status: Database["public"]["Enums"]["record_status"]
          updated_at: string
        }
        Insert: {
          color: string
          created_at?: string
          description?: string | null
          id?: string
          name: string
          slug: string
          status?: Database["public"]["Enums"]["record_status"]
          updated_at?: string
        }
        Update: {
          color?: string
          created_at?: string
          description?: string | null
          id?: string
          name?: string
          slug?: string
          status?: Database["public"]["Enums"]["record_status"]
          updated_at?: string
        }
        Relationships: []
      }
      trainers: {
        Row: {
          church_id: string | null
          created_at: string
          email: string | null
          full_name: string
          id: string
          is_demo: boolean
          phone: string | null
          photo_url: string | null
          region_id: string | null
          specialty_id: string | null
          status: Database["public"]["Enums"]["record_status"]
          updated_at: string
        }
        Insert: {
          church_id?: string | null
          created_at?: string
          email?: string | null
          full_name: string
          id?: string
          is_demo?: boolean
          phone?: string | null
          photo_url?: string | null
          region_id?: string | null
          specialty_id?: string | null
          status?: Database["public"]["Enums"]["record_status"]
          updated_at?: string
        }
        Update: {
          church_id?: string | null
          created_at?: string
          email?: string | null
          full_name?: string
          id?: string
          is_demo?: boolean
          phone?: string | null
          photo_url?: string | null
          region_id?: string | null
          specialty_id?: string | null
          status?: Database["public"]["Enums"]["record_status"]
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "trainers_church_id_fkey"
            columns: ["church_id"]
            isOneToOne: false
            referencedRelation: "churches"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "trainers_region_id_fkey"
            columns: ["region_id"]
            isOneToOne: false
            referencedRelation: "regions"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "trainers_specialty_id_fkey"
            columns: ["specialty_id"]
            isOneToOne: false
            referencedRelation: "specialties"
            referencedColumns: ["id"]
          },
        ]
      }
      user_roles: {
        Row: {
          id: string
          role: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Insert: {
          id?: string
          role: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Update: {
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
      can_access_pre_leader: {
        Args: { _pre_leader_id: string; _user_id: string }
        Returns: boolean
      }
      can_access_region: {
        Args: { _region_id: string; _user_id: string }
        Returns: boolean
      }
      has_role: {
        Args: {
          _role: Database["public"]["Enums"]["app_role"]
          _user_id: string
        }
        Returns: boolean
      }
      is_staff: { Args: { _user_id: string }; Returns: boolean }
      is_super: { Args: { _user_id: string }; Returns: boolean }
      next_pre_leader_key: { Args: { _region_id: string }; Returns: string }
    }
    Enums: {
      app_role: "super_admin_1" | "super_admin_2" | "admin"
      attendance_status: "presente" | "falta" | "justificada"
      record_status: "ativo" | "inativo" | "arquivado"
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
      app_role: ["super_admin_1", "super_admin_2", "admin"],
      attendance_status: ["presente", "falta", "justificada"],
      record_status: ["ativo", "inativo", "arquivado"],
    },
  },
} as const
