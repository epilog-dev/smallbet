// Generated from Supabase (project vvippletqmhhliwtjocy) via the MCP `generate_typescript_types`.
// Regenerate after every migration.
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
    PostgrestVersion: "14.5"
  }
  public: {
    Tables: {
      comments: {
        Row: {
          content: string | null
          created_at: string
          id: number
          post_id: number
        }
        Insert: {
          content?: string | null
          created_at?: string
          id?: number
          post_id: number
        }
        Update: {
          content?: string | null
          created_at?: string
          id?: number
          post_id?: number
        }
        Relationships: [
          {
            foreignKeyName: "comments_post_id_fkey"
            columns: ["post_id"]
            isOneToOne: false
            referencedRelation: "posts"
            referencedColumns: ["id"]
          },
        ]
      }
      generations: {
        Row: {
          created_at: string
          generator: string
          id: string
          input_tokens: number | null
          kind: string
          ms: number | null
          output_tokens: number | null
          owner_id: string
          project_id: string | null
        }
        Insert: {
          created_at?: string
          generator: string
          id?: string
          input_tokens?: number | null
          kind: string
          ms?: number | null
          output_tokens?: number | null
          owner_id: string
          project_id?: string | null
        }
        Update: {
          created_at?: string
          generator?: string
          id?: string
          input_tokens?: number | null
          kind?: string
          ms?: number | null
          output_tokens?: number | null
          owner_id?: string
          project_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "generations_project_id_fkey"
            columns: ["project_id"]
            isOneToOne: false
            referencedRelation: "projects"
            referencedColumns: ["id"]
          },
        ]
      }
      page_views: {
        Row: {
          created_at: string
          id: number
          project_id: string
          referrer: string | null
          utm: Json | null
          visitor_id: string
        }
        Insert: {
          created_at?: string
          id?: never
          project_id: string
          referrer?: string | null
          utm?: Json | null
          visitor_id: string
        }
        Update: {
          created_at?: string
          id?: never
          project_id?: string
          referrer?: string | null
          utm?: Json | null
          visitor_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "page_views_project_id_fkey"
            columns: ["project_id"]
            isOneToOne: false
            referencedRelation: "projects"
            referencedColumns: ["id"]
          },
        ]
      }
      posts: {
        Row: {
          content: string
          created_at: string
          id: number
          image_path: string
          title: string
        }
        Insert: {
          content: string
          created_at?: string
          id?: number
          image_path: string
          title: string
        }
        Update: {
          content?: string
          created_at?: string
          id?: number
          image_path?: string
          title?: string
        }
        Relationships: []
      }
      profiles: {
        Row: {
          created_at: string
          display_name: string | null
          id: string
        }
        Insert: {
          created_at?: string
          display_name?: string | null
          id: string
        }
        Update: {
          created_at?: string
          display_name?: string | null
          id?: string
        }
        Relationships: []
      }
      projects: {
        Row: {
          brief: Json | null
          created_at: string
          document: Json
          id: string
          idea: Json
          name: string
          owner_id: string
          published_at: string | null
          slug: string
          status: string
          updated_at: string
          version: number
        }
        Insert: {
          brief?: Json | null
          created_at?: string
          document: Json
          id?: string
          idea: Json
          name: string
          owner_id: string
          published_at?: string | null
          slug: string
          status?: string
          updated_at?: string
          version?: number
        }
        Update: {
          brief?: Json | null
          created_at?: string
          document?: Json
          id?: string
          idea?: Json
          name?: string
          owner_id?: string
          published_at?: string | null
          slug?: string
          status?: string
          updated_at?: string
          version?: number
        }
        Relationships: []
      }
      responses: {
        Row: {
          amount_cents: number | null
          created_at: string
          currency: string | null
          email: string | null
          id: string
          interval: string | null
          kind: string
          project_id: string
          reason: string | null
          referrer: string | null
          tier_id: string | null
          updated_at: string
          utm: Json | null
          visitor_id: string
        }
        Insert: {
          amount_cents?: number | null
          created_at?: string
          currency?: string | null
          email?: string | null
          id?: string
          interval?: string | null
          kind: string
          project_id: string
          reason?: string | null
          referrer?: string | null
          tier_id?: string | null
          updated_at?: string
          utm?: Json | null
          visitor_id: string
        }
        Update: {
          amount_cents?: number | null
          created_at?: string
          currency?: string | null
          email?: string | null
          id?: string
          interval?: string | null
          kind?: string
          project_id?: string
          reason?: string | null
          referrer?: string | null
          tier_id?: string | null
          updated_at?: string
          utm?: Json | null
          visitor_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "responses_project_id_fkey"
            columns: ["project_id"]
            isOneToOne: false
            referencedRelation: "projects"
            referencedColumns: ["id"]
          },
        ]
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      project_public_stats: {
        Args: { p_slug: string }
        Returns: {
          responses: number
          would_pay: number
        }[]
      }
      record_view: {
        Args: { p_slug: string; p_visitor: string; p_referrer?: string | null; p_utm?: Json | null }
        Returns: undefined
      }
      set_response_reason: {
        Args: { p_id: string; p_visitor: string; p_reason: string }
        Returns: undefined
      }
      submit_response: {
        Args: {
          p_slug: string
          p_visitor: string
          p_kind: string
          p_tier_id?: string | null
          p_amount_cents?: number | null
          p_currency?: string | null
          p_interval?: string | null
          p_email?: string | null
          p_referrer?: string | null
          p_utm?: Json | null
        }
        Returns: {
          id: string
          responses: number
          would_pay: number
        }[]
      }
    }
    Enums: {
      [_ in never]: never
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
  TableName extends (DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
        DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])
    : never) = never,
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
  TableName extends (DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never) = never,
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
  TableName extends (DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never) = never,
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
  EnumName extends (DefaultSchemaEnumNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"]
    : never) = never,
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
  CompositeTypeName extends (PublicCompositeTypeNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never) = never,
> = PublicCompositeTypeNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof DefaultSchema["CompositeTypes"]
    ? DefaultSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
    : never

export const Constants = {
  public: {
    Enums: {},
  },
} as const
