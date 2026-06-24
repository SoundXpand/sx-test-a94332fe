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
      activity_logs: {
        Row: {
          action: string
          created_at: string
          id: string
          metadata: Json
          user_id: string | null
        }
        Insert: {
          action: string
          created_at?: string
          id?: string
          metadata?: Json
          user_id?: string | null
        }
        Update: {
          action?: string
          created_at?: string
          id?: string
          metadata?: Json
          user_id?: string | null
        }
        Relationships: []
      }
      analytics_rows: {
        Row: {
          country: string | null
          created_at: string
          date: string
          id: string
          owner_id: string
          platform: string
          release_id: string | null
          revenue: number
          streams: number
          track_id: string | null
        }
        Insert: {
          country?: string | null
          created_at?: string
          date: string
          id?: string
          owner_id: string
          platform: string
          release_id?: string | null
          revenue?: number
          streams?: number
          track_id?: string | null
        }
        Update: {
          country?: string | null
          created_at?: string
          date?: string
          id?: string
          owner_id?: string
          platform?: string
          release_id?: string | null
          revenue?: number
          streams?: number
          track_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "analytics_rows_release_id_fkey"
            columns: ["release_id"]
            isOneToOne: false
            referencedRelation: "public_releases"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "analytics_rows_release_id_fkey"
            columns: ["release_id"]
            isOneToOne: false
            referencedRelation: "releases"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "analytics_rows_track_id_fkey"
            columns: ["track_id"]
            isOneToOne: false
            referencedRelation: "release_tracks"
            referencedColumns: ["id"]
          },
        ]
      }
      dsp_lookup_cache: {
        Row: {
          fetched_at: string
          id: string
          payload: Json
          platform: string
          query_hash: string
          user_id: string | null
        }
        Insert: {
          fetched_at?: string
          id?: string
          payload: Json
          platform: string
          query_hash: string
          user_id?: string | null
        }
        Update: {
          fetched_at?: string
          id?: string
          payload?: Json
          platform?: string
          query_hash?: string
          user_id?: string | null
        }
        Relationships: []
      }
      notify_waitlist: {
        Row: {
          created_at: string
          email: string
          id: string
          tool: string
          user_id: string | null
        }
        Insert: {
          created_at?: string
          email: string
          id?: string
          tool: string
          user_id?: string | null
        }
        Update: {
          created_at?: string
          email?: string
          id?: string
          tool?: string
          user_id?: string | null
        }
        Relationships: []
      }
      platform_settings: {
        Row: {
          key: string
          updated_at: string
          updated_by: string | null
          value: Json
        }
        Insert: {
          key: string
          updated_at?: string
          updated_by?: string | null
          value?: Json
        }
        Update: {
          key?: string
          updated_at?: string
          updated_by?: string | null
          value?: Json
        }
        Relationships: []
      }
      profiles: {
        Row: {
          approved_at: string | null
          approved_by: string | null
          artist_name: string
          country: string | null
          created_at: string
          email: string
          full_name: string
          mobile: string | null
          notification_prefs: Json
          rejection_reason: string | null
          status: Database["public"]["Enums"]["account_status"]
          updated_at: string
          user_id: string
          username: string
        }
        Insert: {
          approved_at?: string | null
          approved_by?: string | null
          artist_name?: string
          country?: string | null
          created_at?: string
          email: string
          full_name?: string
          mobile?: string | null
          notification_prefs?: Json
          rejection_reason?: string | null
          status?: Database["public"]["Enums"]["account_status"]
          updated_at?: string
          user_id: string
          username: string
        }
        Update: {
          approved_at?: string | null
          approved_by?: string | null
          artist_name?: string
          country?: string | null
          created_at?: string
          email?: string
          full_name?: string
          mobile?: string | null
          notification_prefs?: Json
          rejection_reason?: string | null
          status?: Database["public"]["Enums"]["account_status"]
          updated_at?: string
          user_id?: string
          username?: string
        }
        Relationships: []
      }
      release_drafts: {
        Row: {
          created_at: string
          current_step: number
          id: string
          owner_id: string
          payload: Json
          source_release_id: string | null
          title: string
          updated_at: string
        }
        Insert: {
          created_at?: string
          current_step?: number
          id?: string
          owner_id: string
          payload?: Json
          source_release_id?: string | null
          title?: string
          updated_at?: string
        }
        Update: {
          created_at?: string
          current_step?: number
          id?: string
          owner_id?: string
          payload?: Json
          source_release_id?: string | null
          title?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "release_drafts_source_release_id_fkey"
            columns: ["source_release_id"]
            isOneToOne: false
            referencedRelation: "public_releases"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "release_drafts_source_release_id_fkey"
            columns: ["source_release_id"]
            isOneToOne: false
            referencedRelation: "releases"
            referencedColumns: ["id"]
          },
        ]
      }
      release_links: {
        Row: {
          artwork_url: string | null
          created_at: string
          external_id: string | null
          id: string
          platform: string
          release_id: string
          url: string
        }
        Insert: {
          artwork_url?: string | null
          created_at?: string
          external_id?: string | null
          id?: string
          platform: string
          release_id: string
          url: string
        }
        Update: {
          artwork_url?: string | null
          created_at?: string
          external_id?: string | null
          id?: string
          platform?: string
          release_id?: string
          url?: string
        }
        Relationships: [
          {
            foreignKeyName: "release_links_release_id_fkey"
            columns: ["release_id"]
            isOneToOne: false
            referencedRelation: "public_releases"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "release_links_release_id_fkey"
            columns: ["release_id"]
            isOneToOne: false
            referencedRelation: "releases"
            referencedColumns: ["id"]
          },
        ]
      }
      release_tracks: {
        Row: {
          audio_path: string | null
          composer: string | null
          contributors: string | null
          copyright_owner: string | null
          created_at: string
          duration_seconds: number | null
          explicit: boolean
          featured_artist: string | null
          file_size_bytes: number | null
          id: string
          isrc: string | null
          language: string | null
          lyricist: string | null
          producer: string | null
          publishing_info: string | null
          release_id: string
          title: string
          track_number: number
          version: string | null
        }
        Insert: {
          audio_path?: string | null
          composer?: string | null
          contributors?: string | null
          copyright_owner?: string | null
          created_at?: string
          duration_seconds?: number | null
          explicit?: boolean
          featured_artist?: string | null
          file_size_bytes?: number | null
          id?: string
          isrc?: string | null
          language?: string | null
          lyricist?: string | null
          producer?: string | null
          publishing_info?: string | null
          release_id: string
          title: string
          track_number: number
          version?: string | null
        }
        Update: {
          audio_path?: string | null
          composer?: string | null
          contributors?: string | null
          copyright_owner?: string | null
          created_at?: string
          duration_seconds?: number | null
          explicit?: boolean
          featured_artist?: string | null
          file_size_bytes?: number | null
          id?: string
          isrc?: string | null
          language?: string | null
          lyricist?: string | null
          producer?: string | null
          publishing_info?: string | null
          release_id?: string
          title?: string
          track_number?: number
          version?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "release_tracks_release_id_fkey"
            columns: ["release_id"]
            isOneToOne: false
            referencedRelation: "public_releases"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "release_tracks_release_id_fkey"
            columns: ["release_id"]
            isOneToOne: false
            referencedRelation: "releases"
            referencedColumns: ["id"]
          },
        ]
      }
      releases: {
        Row: {
          artwork_path: string | null
          catalog_number: string | null
          copyright_year: number | null
          created_at: string
          id: string
          language: string | null
          original_release_date: string | null
          owner_id: string
          parental_advisory: boolean
          primary_genre: string | null
          published_url: string | null
          record_label: string | null
          rejection_reason: string | null
          release_date: string | null
          release_type: string
          secondary_genre: string | null
          slug: string | null
          status: string
          store_selection: Json
          taken_down_at: string | null
          title: string
          upc: string | null
          updated_at: string
          version: string | null
        }
        Insert: {
          artwork_path?: string | null
          catalog_number?: string | null
          copyright_year?: number | null
          created_at?: string
          id?: string
          language?: string | null
          original_release_date?: string | null
          owner_id: string
          parental_advisory?: boolean
          primary_genre?: string | null
          published_url?: string | null
          record_label?: string | null
          rejection_reason?: string | null
          release_date?: string | null
          release_type?: string
          secondary_genre?: string | null
          slug?: string | null
          status?: string
          store_selection?: Json
          taken_down_at?: string | null
          title: string
          upc?: string | null
          updated_at?: string
          version?: string | null
        }
        Update: {
          artwork_path?: string | null
          catalog_number?: string | null
          copyright_year?: number | null
          created_at?: string
          id?: string
          language?: string | null
          original_release_date?: string | null
          owner_id?: string
          parental_advisory?: boolean
          primary_genre?: string | null
          published_url?: string | null
          record_label?: string | null
          rejection_reason?: string | null
          release_date?: string | null
          release_type?: string
          secondary_genre?: string | null
          slug?: string | null
          status?: string
          store_selection?: Json
          taken_down_at?: string | null
          title?: string
          upc?: string | null
          updated_at?: string
          version?: string | null
        }
        Relationships: []
      }
      royalty_statements: {
        Row: {
          breakdown: Json
          created_at: string
          id: string
          owner_id: string
          period_end: string
          period_start: string
          total: number
        }
        Insert: {
          breakdown?: Json
          created_at?: string
          id?: string
          owner_id: string
          period_end: string
          period_start: string
          total?: number
        }
        Update: {
          breakdown?: Json
          created_at?: string
          id?: string
          owner_id?: string
          period_end?: string
          period_start?: string
          total?: number
        }
        Relationships: []
      }
      support_messages: {
        Row: {
          body: string
          created_at: string
          id: string
          ticket_id: string
          user_id: string
        }
        Insert: {
          body: string
          created_at?: string
          id?: string
          ticket_id: string
          user_id: string
        }
        Update: {
          body?: string
          created_at?: string
          id?: string
          ticket_id?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "support_messages_ticket_id_fkey"
            columns: ["ticket_id"]
            isOneToOne: false
            referencedRelation: "support_tickets"
            referencedColumns: ["id"]
          },
        ]
      }
      support_tickets: {
        Row: {
          created_at: string
          id: string
          priority: string
          status: string
          subject: string
          updated_at: string
          user_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          priority?: string
          status?: string
          subject: string
          updated_at?: string
          user_id: string
        }
        Update: {
          created_at?: string
          id?: string
          priority?: string
          status?: string
          subject?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      user_roles: {
        Row: {
          created_at: string | null
          id: string
          role: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Insert: {
          created_at?: string | null
          id?: string
          role: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Update: {
          created_at?: string | null
          id?: string
          role?: Database["public"]["Enums"]["app_role"]
          user_id?: string
        }
        Relationships: []
      }
    }
    Views: {
      public_releases: {
        Row: {
          artwork_path: string | null
          id: string | null
          primary_genre: string | null
          release_date: string | null
          release_type: string | null
          slug: string | null
          title: string | null
          version: string | null
        }
        Insert: {
          artwork_path?: string | null
          id?: string | null
          primary_genre?: string | null
          release_date?: string | null
          release_type?: string | null
          slug?: string | null
          title?: string | null
          version?: string | null
        }
        Update: {
          artwork_path?: string | null
          id?: string | null
          primary_genre?: string | null
          release_date?: string | null
          release_type?: string | null
          slug?: string | null
          title?: string | null
          version?: string | null
        }
        Relationships: []
      }
    }
    Functions: {
      has_role: {
        Args: {
          _role: Database["public"]["Enums"]["app_role"]
          _user_id: string
        }
        Returns: boolean
      }
    }
    Enums: {
      account_status: "pending_approval" | "approved" | "rejected" | "suspended"
      app_role:
        | "admin"
        | "moderator"
        | "user"
        | "artist"
        | "manager"
        | "viewer"
        | "administrator"
      asset_condition: "excellent" | "good" | "fair" | "poor" | "retired"
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
      account_status: ["pending_approval", "approved", "rejected", "suspended"],
      app_role: [
        "admin",
        "moderator",
        "user",
        "artist",
        "manager",
        "viewer",
        "administrator",
      ],
      asset_condition: ["excellent", "good", "fair", "poor", "retired"],
    },
  },
} as const
