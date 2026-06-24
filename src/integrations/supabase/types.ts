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
          artists: string | null
          censor_catalogue_number: string | null
          collection_share: number | null
          commercial_model: string | null
          conversion_rate: number | null
          country: string | null
          created_at: string
          date: string
          id: string
          isrc: string | null
          licensee_catalogue_number: string | null
          licensor_currency: string | null
          licensor_revenue: number | null
          outlet: string | null
          owner_id: string | null
          period_begins: string | null
          period_ends: string | null
          platform: string
          product: string | null
          quantity: number | null
          recording_title: string | null
          release_ean: string | null
          release_id: string | null
          release_title: string | null
          revenue: number
          right_type_group: string | null
          sale_type: string | null
          source: string | null
          source_currency: string | null
          streams: number
          track_id: string | null
          upload_id: string | null
          use_type: string | null
          username: string | null
        }
        Insert: {
          artists?: string | null
          censor_catalogue_number?: string | null
          collection_share?: number | null
          commercial_model?: string | null
          conversion_rate?: number | null
          country?: string | null
          created_at?: string
          date: string
          id?: string
          isrc?: string | null
          licensee_catalogue_number?: string | null
          licensor_currency?: string | null
          licensor_revenue?: number | null
          outlet?: string | null
          owner_id?: string | null
          period_begins?: string | null
          period_ends?: string | null
          platform: string
          product?: string | null
          quantity?: number | null
          recording_title?: string | null
          release_ean?: string | null
          release_id?: string | null
          release_title?: string | null
          revenue?: number
          right_type_group?: string | null
          sale_type?: string | null
          source?: string | null
          source_currency?: string | null
          streams?: number
          track_id?: string | null
          upload_id?: string | null
          use_type?: string | null
          username?: string | null
        }
        Update: {
          artists?: string | null
          censor_catalogue_number?: string | null
          collection_share?: number | null
          commercial_model?: string | null
          conversion_rate?: number | null
          country?: string | null
          created_at?: string
          date?: string
          id?: string
          isrc?: string | null
          licensee_catalogue_number?: string | null
          licensor_currency?: string | null
          licensor_revenue?: number | null
          outlet?: string | null
          owner_id?: string | null
          period_begins?: string | null
          period_ends?: string | null
          platform?: string
          product?: string | null
          quantity?: number | null
          recording_title?: string | null
          release_ean?: string | null
          release_id?: string | null
          release_title?: string | null
          revenue?: number
          right_type_group?: string | null
          sale_type?: string | null
          source?: string | null
          source_currency?: string | null
          streams?: number
          track_id?: string | null
          upload_id?: string | null
          use_type?: string | null
          username?: string | null
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
          {
            foreignKeyName: "analytics_rows_upload_id_fkey"
            columns: ["upload_id"]
            isOneToOne: false
            referencedRelation: "analytics_uploads"
            referencedColumns: ["id"]
          },
        ]
      }
      analytics_uploads: {
        Row: {
          created_at: string
          filename: string
          id: string
          notes: string | null
          period_label: string | null
          row_count: number
          status: string
          uploaded_by: string | null
        }
        Insert: {
          created_at?: string
          filename: string
          id?: string
          notes?: string | null
          period_label?: string | null
          row_count?: number
          status?: string
          uploaded_by?: string | null
        }
        Update: {
          created_at?: string
          filename?: string
          id?: string
          notes?: string | null
          period_label?: string | null
          row_count?: number
          status?: string
          uploaded_by?: string | null
        }
        Relationships: []
      }
      artists: {
        Row: {
          apple_music_url: string | null
          created_at: string
          id: string
          is_primary: boolean
          name: string
          owner_id: string
          spotify_url: string | null
          updated_at: string
          youtube_music_url: string | null
        }
        Insert: {
          apple_music_url?: string | null
          created_at?: string
          id?: string
          is_primary?: boolean
          name: string
          owner_id: string
          spotify_url?: string | null
          updated_at?: string
          youtube_music_url?: string | null
        }
        Update: {
          apple_music_url?: string | null
          created_at?: string
          id?: string
          is_primary?: boolean
          name?: string
          owner_id?: string
          spotify_url?: string | null
          updated_at?: string
          youtube_music_url?: string | null
        }
        Relationships: []
      }
      dsp_deliveries: {
        Row: {
          created_at: string
          error: string | null
          external_id: string | null
          external_url: string | null
          id: string
          last_event_at: string
          platform: string
          release_id: string
          status: string
          updated_at: string
        }
        Insert: {
          created_at?: string
          error?: string | null
          external_id?: string | null
          external_url?: string | null
          id?: string
          last_event_at?: string
          platform: string
          release_id: string
          status?: string
          updated_at?: string
        }
        Update: {
          created_at?: string
          error?: string | null
          external_id?: string | null
          external_url?: string | null
          id?: string
          last_event_at?: string
          platform?: string
          release_id?: string
          status?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "dsp_deliveries_release_id_fkey"
            columns: ["release_id"]
            isOneToOne: false
            referencedRelation: "public_releases"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "dsp_deliveries_release_id_fkey"
            columns: ["release_id"]
            isOneToOne: false
            referencedRelation: "releases"
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
      notifications: {
        Row: {
          body: string | null
          created_at: string
          id: string
          kind: string
          link: string | null
          read_at: string | null
          title: string
          user_id: string | null
        }
        Insert: {
          body?: string | null
          created_at?: string
          id?: string
          kind: string
          link?: string | null
          read_at?: string | null
          title: string
          user_id?: string | null
        }
        Update: {
          body?: string | null
          created_at?: string
          id?: string
          kind?: string
          link?: string | null
          read_at?: string | null
          title?: string
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
          avatar_url: string | null
          bio: string | null
          city: string | null
          country: string | null
          created_at: string
          current_distributor: string | null
          display_name: string | null
          email: string
          first_name: string | null
          full_name: string
          is_public: boolean
          label_name: string | null
          last_name: string | null
          main_genre: string | null
          mobile: string | null
          notification_prefs: Json
          payout_details: Json
          payout_method: string | null
          privacy_accepted_at: string | null
          private_link: string | null
          rejection_reason: string | null
          role_type: string | null
          social_apple: string | null
          social_facebook: string | null
          social_instagram: string | null
          social_soundcloud: string | null
          social_spotify: string | null
          social_tiktok: string | null
          social_vk: string | null
          social_website: string | null
          social_youtube: string | null
          spotify_monthly_listeners_bucket: string | null
          status: Database["public"]["Enums"]["account_status"]
          sub_labels: string[] | null
          tracks_released_bucket: string | null
          updated_at: string
          user_id: string
          username: string
        }
        Insert: {
          approved_at?: string | null
          approved_by?: string | null
          artist_name?: string
          avatar_url?: string | null
          bio?: string | null
          city?: string | null
          country?: string | null
          created_at?: string
          current_distributor?: string | null
          display_name?: string | null
          email: string
          first_name?: string | null
          full_name?: string
          is_public?: boolean
          label_name?: string | null
          last_name?: string | null
          main_genre?: string | null
          mobile?: string | null
          notification_prefs?: Json
          payout_details?: Json
          payout_method?: string | null
          privacy_accepted_at?: string | null
          private_link?: string | null
          rejection_reason?: string | null
          role_type?: string | null
          social_apple?: string | null
          social_facebook?: string | null
          social_instagram?: string | null
          social_soundcloud?: string | null
          social_spotify?: string | null
          social_tiktok?: string | null
          social_vk?: string | null
          social_website?: string | null
          social_youtube?: string | null
          spotify_monthly_listeners_bucket?: string | null
          status?: Database["public"]["Enums"]["account_status"]
          sub_labels?: string[] | null
          tracks_released_bucket?: string | null
          updated_at?: string
          user_id: string
          username: string
        }
        Update: {
          approved_at?: string | null
          approved_by?: string | null
          artist_name?: string
          avatar_url?: string | null
          bio?: string | null
          city?: string | null
          country?: string | null
          created_at?: string
          current_distributor?: string | null
          display_name?: string | null
          email?: string
          first_name?: string | null
          full_name?: string
          is_public?: boolean
          label_name?: string | null
          last_name?: string | null
          main_genre?: string | null
          mobile?: string | null
          notification_prefs?: Json
          payout_details?: Json
          payout_method?: string | null
          privacy_accepted_at?: string | null
          private_link?: string | null
          rejection_reason?: string | null
          role_type?: string | null
          social_apple?: string | null
          social_facebook?: string | null
          social_instagram?: string | null
          social_soundcloud?: string | null
          social_spotify?: string | null
          social_tiktok?: string | null
          social_vk?: string | null
          social_website?: string | null
          social_youtube?: string | null
          spotify_monthly_listeners_bucket?: string | null
          status?: Database["public"]["Enums"]["account_status"]
          sub_labels?: string[] | null
          tracks_released_bucket?: string | null
          updated_at?: string
          user_id?: string
          username?: string
        }
        Relationships: []
      }
      release_deliveries: {
        Row: {
          authorized_by: string | null
          created_at: string
          delivered_at: string
          dsp_status: Json
          excel_path: string | null
          id: string
          notes: string | null
          release_id: string
        }
        Insert: {
          authorized_by?: string | null
          created_at?: string
          delivered_at?: string
          dsp_status?: Json
          excel_path?: string | null
          id?: string
          notes?: string | null
          release_id: string
        }
        Update: {
          authorized_by?: string | null
          created_at?: string
          delivered_at?: string
          dsp_status?: Json
          excel_path?: string | null
          id?: string
          notes?: string | null
          release_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "release_deliveries_release_id_fkey"
            columns: ["release_id"]
            isOneToOne: false
            referencedRelation: "public_releases"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "release_deliveries_release_id_fkey"
            columns: ["release_id"]
            isOneToOne: false
            referencedRelation: "releases"
            referencedColumns: ["id"]
          },
        ]
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
      release_events: {
        Row: {
          actor_id: string | null
          created_at: string
          id: string
          note: string | null
          payload: Json
          release_id: string
          type: string
        }
        Insert: {
          actor_id?: string | null
          created_at?: string
          id?: string
          note?: string | null
          payload?: Json
          release_id: string
          type: string
        }
        Update: {
          actor_id?: string | null
          created_at?: string
          id?: string
          note?: string | null
          payload?: Json
          release_id?: string
          type?: string
        }
        Relationships: [
          {
            foreignKeyName: "release_events_release_id_fkey"
            columns: ["release_id"]
            isOneToOne: false
            referencedRelation: "public_releases"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "release_events_release_id_fkey"
            columns: ["release_id"]
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
          primary_genre: string | null
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
          primary_genre?: string | null
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
          primary_genre?: string | null
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
          artist_ids: string[]
          artwork_path: string | null
          c_name: string | null
          c_year: number | null
          catalog_number: string | null
          copyright_year: number | null
          created_at: string
          delivered_at: string | null
          delivery_note: string | null
          id: string
          language: string | null
          original_release_date: string | null
          owner_id: string
          p_name: string | null
          p_year: number | null
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
          sub_label: string | null
          taken_down_at: string | null
          title: string
          upc: string | null
          updated_at: string
          version: string | null
        }
        Insert: {
          artist_ids?: string[]
          artwork_path?: string | null
          c_name?: string | null
          c_year?: number | null
          catalog_number?: string | null
          copyright_year?: number | null
          created_at?: string
          delivered_at?: string | null
          delivery_note?: string | null
          id?: string
          language?: string | null
          original_release_date?: string | null
          owner_id: string
          p_name?: string | null
          p_year?: number | null
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
          sub_label?: string | null
          taken_down_at?: string | null
          title: string
          upc?: string | null
          updated_at?: string
          version?: string | null
        }
        Update: {
          artist_ids?: string[]
          artwork_path?: string | null
          c_name?: string | null
          c_year?: number | null
          catalog_number?: string | null
          copyright_year?: number | null
          created_at?: string
          delivered_at?: string | null
          delivery_note?: string | null
          id?: string
          language?: string | null
          original_release_date?: string | null
          owner_id?: string
          p_name?: string | null
          p_year?: number | null
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
          sub_label?: string | null
          taken_down_at?: string | null
          title?: string
          upc?: string | null
          updated_at?: string
          version?: string | null
        }
        Relationships: []
      }
      royalty_statement_files: {
        Row: {
          amount: number
          created_at: string
          currency: string
          id: string
          owner_id: string | null
          pdf_path: string | null
          period_label: string
          summary: string | null
          uploaded_by: string | null
          username: string
        }
        Insert: {
          amount?: number
          created_at?: string
          currency?: string
          id?: string
          owner_id?: string | null
          pdf_path?: string | null
          period_label: string
          summary?: string | null
          uploaded_by?: string | null
          username: string
        }
        Update: {
          amount?: number
          created_at?: string
          currency?: string
          id?: string
          owner_id?: string | null
          pdf_path?: string | null
          period_label?: string
          summary?: string | null
          uploaded_by?: string | null
          username?: string
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
      user_activity_log: {
        Row: {
          created_at: string
          id: string
          ip: string | null
          kind: string
          meta: Json
          summary: string | null
          user_agent: string | null
          user_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          ip?: string | null
          kind: string
          meta?: Json
          summary?: string | null
          user_agent?: string | null
          user_id: string
        }
        Update: {
          created_at?: string
          id?: string
          ip?: string | null
          kind?: string
          meta?: Json
          summary?: string | null
          user_agent?: string | null
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
      is_staff: { Args: { _user_id: string }; Returns: boolean }
      next_sx_username: { Args: never; Returns: string }
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
        | "sx_manager"
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
        "sx_manager",
      ],
      asset_condition: ["excellent", "good", "fair", "poor", "retired"],
    },
  },
} as const
