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
      challenge_progress: {
        Row: {
          completed_indices: number[]
          id: string
          module_key: string
          updated_at: string
          user_id: string
        }
        Insert: {
          completed_indices?: number[]
          id?: string
          module_key: string
          updated_at?: string
          user_id: string
        }
        Update: {
          completed_indices?: number[]
          id?: string
          module_key?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      chat_messages: {
        Row: {
          content: string
          created_at: string
          id: string
          item_context: string | null
          role: string
          user_id: string
        }
        Insert: {
          content: string
          created_at?: string
          id?: string
          item_context?: string | null
          role: string
          user_id: string
        }
        Update: {
          content?: string
          created_at?: string
          id?: string
          item_context?: string | null
          role?: string
          user_id?: string
        }
        Relationships: []
      }
      inventory_items: {
        Row: {
          category: string
          created_at: string
          description: string | null
          ecosystem: string
          id: string
          image_url: string | null
          keywords: string | null
          location: string | null
          msrp: string | null
          notes: string | null
          product: string
          purchase_price: number | null
          purchase_year: number | null
          quantity: number | null
          rating: number | null
          serial_number: string | null
          sonic_role: string | null
          sound_category: string | null
          specs: Json | null
          synthesis: string | null
          type: string
          updated_at: string
          url: string | null
          use_cases: string | null
          vendor: string
          year_released: number | null
        }
        Insert: {
          category: string
          created_at?: string
          description?: string | null
          ecosystem: string
          id: string
          image_url?: string | null
          keywords?: string | null
          location?: string | null
          msrp?: string | null
          notes?: string | null
          product: string
          purchase_price?: number | null
          purchase_year?: number | null
          quantity?: number | null
          rating?: number | null
          serial_number?: string | null
          sonic_role?: string | null
          sound_category?: string | null
          specs?: Json | null
          synthesis?: string | null
          type: string
          updated_at?: string
          url?: string | null
          use_cases?: string | null
          vendor: string
          year_released?: number | null
        }
        Update: {
          category?: string
          created_at?: string
          description?: string | null
          ecosystem?: string
          id?: string
          image_url?: string | null
          keywords?: string | null
          location?: string | null
          msrp?: string | null
          notes?: string | null
          product?: string
          purchase_price?: number | null
          purchase_year?: number | null
          quantity?: number | null
          rating?: number | null
          serial_number?: string | null
          sonic_role?: string | null
          sound_category?: string | null
          specs?: Json | null
          synthesis?: string | null
          type?: string
          updated_at?: string
          url?: string | null
          use_cases?: string | null
          vendor?: string
          year_released?: number | null
        }
        Relationships: []
      }
      manual_texts: {
        Row: {
          content: string
          created_at: string
          id: string
          item_id: string
          sections: Json | null
          source_url: string | null
          updated_at: string
        }
        Insert: {
          content: string
          created_at?: string
          id?: string
          item_id: string
          sections?: Json | null
          source_url?: string | null
          updated_at?: string
        }
        Update: {
          content?: string
          created_at?: string
          id?: string
          item_id?: string
          sections?: Json | null
          source_url?: string | null
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "manual_texts_item_id_fkey"
            columns: ["item_id"]
            isOneToOne: true
            referencedRelation: "inventory_items"
            referencedColumns: ["id"]
          },
        ]
      }
      session_clips: {
        Row: {
          alias_of: string | null
          audio_url: string | null
          color: number
          created_at: string
          end_beats: number
          id: string
          is_midi: boolean
          is_muted: boolean
          midi_data: Json | null
          name: string
          start_beats: number
          track_id: string
          waveform_peaks: Json | null
        }
        Insert: {
          alias_of?: string | null
          audio_url?: string | null
          color?: number
          created_at?: string
          end_beats?: number
          id?: string
          is_midi?: boolean
          is_muted?: boolean
          midi_data?: Json | null
          name?: string
          start_beats?: number
          track_id: string
          waveform_peaks?: Json | null
        }
        Update: {
          alias_of?: string | null
          audio_url?: string | null
          color?: number
          created_at?: string
          end_beats?: number
          id?: string
          is_midi?: boolean
          is_muted?: boolean
          midi_data?: Json | null
          name?: string
          start_beats?: number
          track_id?: string
          waveform_peaks?: Json | null
        }
        Relationships: [
          {
            foreignKeyName: "session_clips_alias_of_fkey"
            columns: ["alias_of"]
            isOneToOne: false
            referencedRelation: "session_clips"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "session_clips_track_id_fkey"
            columns: ["track_id"]
            isOneToOne: false
            referencedRelation: "session_tracks"
            referencedColumns: ["id"]
          },
        ]
      }
      session_tracks: {
        Row: {
          automation_lanes: Json | null
          color: number
          created_at: string
          device_chain: Json | null
          id: string
          input_from: string | null
          is_muted: boolean
          is_soloed: boolean
          name: string
          pan: number
          sends: Json
          session_id: string
          sort_order: number
          type: string
          volume: number
        }
        Insert: {
          automation_lanes?: Json | null
          color?: number
          created_at?: string
          device_chain?: Json | null
          id?: string
          input_from?: string | null
          is_muted?: boolean
          is_soloed?: boolean
          name?: string
          pan?: number
          sends?: Json
          session_id: string
          sort_order?: number
          type?: string
          volume?: number
        }
        Update: {
          automation_lanes?: Json | null
          color?: number
          created_at?: string
          device_chain?: Json | null
          id?: string
          input_from?: string | null
          is_muted?: boolean
          is_soloed?: boolean
          name?: string
          pan?: number
          sends?: Json
          session_id?: string
          sort_order?: number
          type?: string
          volume?: number
        }
        Relationships: [
          {
            foreignKeyName: "session_tracks_session_id_fkey"
            columns: ["session_id"]
            isOneToOne: false
            referencedRelation: "sessions"
            referencedColumns: ["id"]
          },
        ]
      }
      sessions: {
        Row: {
          created_at: string
          id: string
          name: string
          tempo: number
          time_signature: string
          updated_at: string
          user_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          name?: string
          tempo?: number
          time_signature?: string
          updated_at?: string
          user_id: string
        }
        Update: {
          created_at?: string
          id?: string
          name?: string
          tempo?: number
          time_signature?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      user_theory_stats: {
        Row: {
          current_streak: number
          id: string
          last_practice_date: string | null
          longest_streak: number
          updated_at: string
          user_id: string
          xp: number
        }
        Insert: {
          current_streak?: number
          id?: string
          last_practice_date?: string | null
          longest_streak?: number
          updated_at?: string
          user_id: string
          xp?: number
        }
        Update: {
          current_streak?: number
          id?: string
          last_practice_date?: string | null
          longest_streak?: number
          updated_at?: string
          user_id?: string
          xp?: number
        }
        Relationships: []
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      [_ in never]: never
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
    Enums: {},
  },
} as const
