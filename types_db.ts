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
      customers: {
        Row: {
          id: string
          stripe_customer_id: string | null
        }
        Insert: {
          id: string
          stripe_customer_id?: string | null
        }
        Update: {
          id?: string
          stripe_customer_id?: string | null
        }
        Relationships: []
      }
      media_items: {
        Row: {
          is_public: boolean
          caption: string | null
          category: string | null
          created_at: string | null
          file_name: string
          file_size: number | null
          file_type: string
          file_url: string
          hashtags: string[] | null
          id: string
          model_id: string | null
          notes: string | null
          posted_at: string | null
          scheduled_for: string | null
          status: string | null
          tag_creators: string[] | null
          thumbnail_url: string | null
          updated_at: string | null
          user_id: string
        }
        Insert: {
          caption?: string | null
          category?: string | null
          created_at?: string | null
          file_name: string
          file_size?: number | null
          file_type: string
          file_url: string
          hashtags?: string[] | null
          id?: string
          model_id?: string | null
          notes?: string | null
          posted_at?: string | null
          scheduled_for?: string | null
          status?: string | null
          tag_creators?: string[] | null
          thumbnail_url?: string | null
          updated_at?: string | null
          user_id: string
        }
        Update: {
          caption?: string | null
          category?: string | null
          created_at?: string | null
          file_name?: string
          file_size?: number | null
          file_type?: string
          file_url?: string
          hashtags?: string[] | null
          id?: string
          model_id?: string | null
          notes?: string | null
          posted_at?: string | null
          scheduled_for?: string | null
          status?: string | null
          tag_creators?: string[] | null
          thumbnail_url?: string | null
          updated_at?: string | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "media_items_model_id_fkey"
            columns: ["model_id"]
            isOneToOne: false
            referencedRelation: "models"
            referencedColumns: ["id"]
          },
        ]
      }
      models: {
        Row: {
          agency_id: string | null
          created_at: string | null
          display_picture_url: string | null
          email: string
          fan_count: number | null
          id: string
          is_verified: boolean | null
          language: string | null
          last_updated: string | null
          name: string
          onlyfans_link: string | null
          payout_percentage: number | null
          price: number | null
          status: string | null
          subscription_type: string | null
          telegram_link: string | null
          timezone: string | null
          updated_at: string | null
          user_id: string | null
          username: string | null
          verification_date: string | null
        }
        Insert: {
          agency_id?: string | null
          created_at?: string | null
          display_picture_url?: string | null
          email: string
          fan_count?: number | null
          id?: string
          is_verified?: boolean | null
          language?: string | null
          last_updated?: string | null
          name: string
          onlyfans_link?: string | null
          payout_percentage?: number | null
          price?: number | null
          status?: string | null
          subscription_type?: string | null
          telegram_link?: string | null
          timezone?: string | null
          updated_at?: string | null
          user_id?: string | null
          username?: string | null
          verification_date?: string | null
        }
        Update: {
          agency_id?: string | null
          created_at?: string | null
          display_picture_url?: string | null
          email?: string
          fan_count?: number | null
          id?: string
          is_verified?: boolean | null
          language?: string | null
          last_updated?: string | null
          name?: string
          onlyfans_link?: string | null
          payout_percentage?: number | null
          price?: number | null
          status?: string | null
          subscription_type?: string | null
          telegram_link?: string | null
          timezone?: string | null
          updated_at?: string | null
          user_id?: string | null
          username?: string | null
          verification_date?: string | null
        }
        Relationships: []
      }
      notifications: {
        Row: {
          action_url: string | null
          created_at: string | null
          id: string
          is_read: boolean | null
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
          created_at?: string | null
          id?: string
          is_read?: boolean | null
          message: string
          read_at?: string | null
          related_entity_id?: string | null
          related_entity_type?: string | null
          title: string
          type: string
          user_id: string
        }
        Update: {
          action_url?: string | null
          created_at?: string | null
          id?: string
          is_read?: boolean | null
          message?: string
          read_at?: string | null
          related_entity_id?: string | null
          related_entity_type?: string | null
          title?: string
          type?: string
          user_id?: string
        }
        Relationships: []
      }
      prices: {
        Row: {
          active: boolean | null
          currency: string | null
          description: string | null
          id: string
          interval: Database["public"]["Enums"]["pricing_plan_interval"] | null
          interval_count: number | null
          metadata: Json | null
          product_id: string | null
          trial_period_days: number | null
          type: Database["public"]["Enums"]["pricing_type"] | null
          unit_amount: number | null
        }
        Insert: {
          active?: boolean | null
          currency?: string | null
          description?: string | null
          id: string
          interval?: Database["public"]["Enums"]["pricing_plan_interval"] | null
          interval_count?: number | null
          metadata?: Json | null
          product_id?: string | null
          trial_period_days?: number | null
          type?: Database["public"]["Enums"]["pricing_type"] | null
          unit_amount?: number | null
        }
        Update: {
          active?: boolean | null
          currency?: string | null
          description?: string | null
          id?: string
          interval?: Database["public"]["Enums"]["pricing_plan_interval"] | null
          interval_count?: number | null
          metadata?: Json | null
          product_id?: string | null
          trial_period_days?: number | null
          type?: Database["public"]["Enums"]["pricing_type"] | null
          unit_amount?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "prices_product_id_fkey"
            columns: ["product_id"]
            isOneToOne: false
            referencedRelation: "products"
            referencedColumns: ["id"]
          },
        ]
      }
      products: {
        Row: {
          active: boolean | null
          description: string | null
          id: string
          image: string | null
          metadata: Json | null
          name: string | null
        }
        Insert: {
          active?: boolean | null
          description?: string | null
          id: string
          image?: string | null
          metadata?: Json | null
          name?: string | null
        }
        Update: {
          active?: boolean | null
          description?: string | null
          id?: string
          image?: string | null
          metadata?: Json | null
          name?: string | null
        }
        Relationships: []
      }
      promo_link_analytics: {
        Row: {
          clicks: number | null
          conversions: number | null
          created_at: string | null
          date: string
          id: string
          new_fans: number | null
          promo_link_id: string
          renewals: number | null
          revenue: number | null
        }
        Insert: {
          clicks?: number | null
          conversions?: number | null
          created_at?: string | null
          date: string
          id?: string
          new_fans?: number | null
          promo_link_id: string
          renewals?: number | null
          revenue?: number | null
        }
        Update: {
          clicks?: number | null
          conversions?: number | null
          created_at?: string | null
          date?: string
          id?: string
          new_fans?: number | null
          promo_link_id?: string
          renewals?: number | null
          revenue?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "promo_link_analytics_promo_link_id_fkey"
            columns: ["promo_link_id"]
            isOneToOne: false
            referencedRelation: "promo_links"
            referencedColumns: ["id"]
          },
        ]
      }
      promo_links: {
        Row: {
          created_at: string | null
          description: string | null
          fans_gained: number | null
          id: string
          model: string
          promo_name: string
          renewals: number | null
          revenue_from_renewals: number | null
          roi: number | null
          spend_to_sub_ratio: number | null
          status: string
          updated_at: string | null
          url: string
          user_id: string
        }
        Insert: {
          created_at?: string | null
          description?: string | null
          fans_gained?: number | null
          id?: string
          model: string
          promo_name: string
          renewals?: number | null
          revenue_from_renewals?: number | null
          roi?: number | null
          spend_to_sub_ratio?: number | null
          status?: string
          updated_at?: string | null
          url: string
          user_id: string
        }
        Update: {
          created_at?: string | null
          description?: string | null
          fans_gained?: number | null
          id?: string
          model?: string
          promo_name?: string
          renewals?: number | null
          revenue_from_renewals?: number | null
          roi?: number | null
          spend_to_sub_ratio?: number | null
          status?: string
          updated_at?: string | null
          url?: string
          user_id?: string
        }
        Relationships: []
      }
      scheduled_sfs: {
        Row: {
          content_slot: number | null
          created_at: string | null
          flagged_reason: string | null
          id: string
          media_id: string | null
          model_id: string | null
          notes: string | null
          partner_creator: string
          partner_fan_count: number | null
          posted_at: string | null
          promo_link: string | null
          scheduled_date: string
          scheduled_time: string
          status: string | null
          updated_at: string | null
          user_id: string
        }
        Insert: {
          content_slot?: number | null
          created_at?: string | null
          flagged_reason?: string | null
          id?: string
          media_id?: string | null
          model_id?: string | null
          notes?: string | null
          partner_creator: string
          partner_fan_count?: number | null
          posted_at?: string | null
          promo_link?: string | null
          scheduled_date: string
          scheduled_time: string
          status?: string | null
          updated_at?: string | null
          user_id: string
        }
        Update: {
          content_slot?: number | null
          created_at?: string | null
          flagged_reason?: string | null
          id?: string
          media_id?: string | null
          model_id?: string | null
          notes?: string | null
          partner_creator?: string
          partner_fan_count?: number | null
          posted_at?: string | null
          promo_link?: string | null
          scheduled_date?: string
          scheduled_time?: string
          status?: string | null
          updated_at?: string | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "scheduled_sfs_media_id_fkey"
            columns: ["media_id"]
            isOneToOne: false
            referencedRelation: "media_items"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "scheduled_sfs_model_id_fkey"
            columns: ["model_id"]
            isOneToOne: false
            referencedRelation: "models"
            referencedColumns: ["id"]
          },
        ]
      }
      sfs_requests: {
        Row: {
          compatibility_score: number | null
          content_slot: number | null
          created_at: string | null
          id: string
          match_reasons: Json | null
          model_id: string | null
          proposed_date: string | null
          proposed_time: string | null
          requester_fan_count: number | null
          requester_media_url: string | null
          requester_tags: string[] | null
          requester_username: string
          reviewed_at: string | null
          status: string | null
          updated_at: string | null
          user_id: string
        }
        Insert: {
          compatibility_score?: number | null
          content_slot?: number | null
          created_at?: string | null
          id?: string
          match_reasons?: Json | null
          model_id?: string | null
          proposed_date?: string | null
          proposed_time?: string | null
          requester_fan_count?: number | null
          requester_media_url?: string | null
          requester_tags?: string[] | null
          requester_username: string
          reviewed_at?: string | null
          status?: string | null
          updated_at?: string | null
          user_id: string
        }
        Update: {
          compatibility_score?: number | null
          content_slot?: number | null
          created_at?: string | null
          id?: string
          match_reasons?: Json | null
          model_id?: string | null
          proposed_date?: string | null
          proposed_time?: string | null
          requester_fan_count?: number | null
          requester_media_url?: string | null
          requester_tags?: string[] | null
          requester_username?: string
          reviewed_at?: string | null
          status?: string | null
          updated_at?: string | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "sfs_requests_model_id_fkey"
            columns: ["model_id"]
            isOneToOne: false
            referencedRelation: "models"
            referencedColumns: ["id"]
          },
        ]
      }
      sfs_settings: {
        Row: {
          auto_approve: boolean | null
          content_allowed: string[] | null
          created_at: string | null
          id: string
          max_sfs_per_day: number | null
          model_id: string | null
          pin_content: string | null
          posting_times: Json | null
          smart_match_enabled: boolean | null
          timezone: string | null
          updated_at: string | null
          user_id: string
        }
        Insert: {
          auto_approve?: boolean | null
          content_allowed?: string[] | null
          created_at?: string | null
          id?: string
          max_sfs_per_day?: number | null
          model_id?: string | null
          pin_content?: string | null
          posting_times?: Json | null
          smart_match_enabled?: boolean | null
          timezone?: string | null
          updated_at?: string | null
          user_id: string
        }
        Update: {
          auto_approve?: boolean | null
          content_allowed?: string[] | null
          created_at?: string | null
          id?: string
          max_sfs_per_day?: number | null
          model_id?: string | null
          pin_content?: string | null
          posting_times?: Json | null
          smart_match_enabled?: boolean | null
          timezone?: string | null
          updated_at?: string | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "sfs_settings_model_id_fkey"
            columns: ["model_id"]
            isOneToOne: false
            referencedRelation: "models"
            referencedColumns: ["id"]
          },
        ]
      }
      subscriptions: {
        Row: {
          cancel_at: string | null
          cancel_at_period_end: boolean | null
          canceled_at: string | null
          created: string
          current_period_end: string
          current_period_start: string
          ended_at: string | null
          id: string
          metadata: Json | null
          price_id: string | null
          quantity: number | null
          status: Database["public"]["Enums"]["subscription_status"] | null
          trial_end: string | null
          trial_start: string | null
          user_id: string
        }
        Insert: {
          cancel_at?: string | null
          cancel_at_period_end?: boolean | null
          canceled_at?: string | null
          created?: string
          current_period_end?: string
          current_period_start?: string
          ended_at?: string | null
          id: string
          metadata?: Json | null
          price_id?: string | null
          quantity?: number | null
          status?: Database["public"]["Enums"]["subscription_status"] | null
          trial_end?: string | null
          trial_start?: string | null
          user_id: string
        }
        Update: {
          cancel_at?: string | null
          cancel_at_period_end?: boolean | null
          canceled_at?: string | null
          created?: string
          current_period_end?: string
          current_period_start?: string
          ended_at?: string | null
          id?: string
          metadata?: Json | null
          price_id?: string | null
          quantity?: number | null
          status?: Database["public"]["Enums"]["subscription_status"] | null
          trial_end?: string | null
          trial_start?: string | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "subscriptions_price_id_fkey"
            columns: ["price_id"]
            isOneToOne: false
            referencedRelation: "prices"
            referencedColumns: ["id"]
          },
        ]
      }
      user_profiles: {
        Row: {
          created_at: string | null
          id: string
          number_of_creators: string | null
          onboarding_completed: boolean | null
          onlyfans_link: string | null
          platforms: string[] | null
          preferences: Json | null
          profile_data: Json | null
          updated_at: string | null
          user_type: string | null
        }
        Insert: {
          created_at?: string | null
          id: string
          number_of_creators?: string | null
          onboarding_completed?: boolean | null
          onlyfans_link?: string | null
          platforms?: string[] | null
          preferences?: Json | null
          profile_data?: Json | null
          updated_at?: string | null
          user_type?: string | null
        }
        Update: {
          created_at?: string | null
          id?: string
          number_of_creators?: string | null
          onboarding_completed?: boolean | null
          onlyfans_link?: string | null
          platforms?: string[] | null
          preferences?: Json | null
          profile_data?: Json | null
          updated_at?: string | null
          user_type?: string | null
        }
        Relationships: []
      }
      users: {
        Row: {
          avatar_url: string | null
          billing_address: Json | null
          email: string | null
          full_name: string | null
          id: string
          payment_method: Json | null
        }
        Insert: {
          avatar_url?: string | null
          billing_address?: Json | null
          email?: string | null
          full_name?: string | null
          id: string
          payment_method?: Json | null
        }
        Update: {
          avatar_url?: string | null
          billing_address?: Json | null
          email?: string | null
          full_name?: string | null
          id?: string
          payment_method?: Json | null
        }
        Relationships: []
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      archive_old_notifications: {
        Args: { days_old?: number }
        Returns: number
      }
      calculate_smart_match_score: {
        Args: { model_id_1: string; model_id_2: string }
        Returns: {
          compatibility_score: number
          match_reasons: Json
        }[]
      }
      check_and_notify_due_posts: {
        Args: Record<PropertyKey, never>
        Returns: number
      }
      get_agency_model_summary: {
        Args: { agency_user_id: string }
        Returns: {
          avg_roi: number
          last_sfs_date: string
          model_id: string
          model_name: string
          model_username: string
          status: string
          total_fans: number
          total_promo_links: number
          total_revenue: number
        }[]
      }
      get_model_performance: {
        Args: { end_date?: string; model_user_id: string; start_date?: string }
        Returns: {
          clicks: number
          conversions: number
          date: string
          fans_gained: number
          new_promo_links: number
          revenue: number
          sfs_completed: number
        }[]
      }
      get_model_statistics: {
        Args: { model_user_id: string }
        Returns: {
          active_promo_links: number
          average_roi: number
          total_fans_gained: number
          total_media_items: number
          total_promo_links: number
          total_revenue: number
          total_sfs_completed: number
          total_sfs_scheduled: number
        }[]
      }
      get_scheduled_posts_due_soon: {
        Args: { minutes_ahead?: number }
        Returns: {
          id: string
          media_url: string
          model_id: string
          partner_creator: string
          scheduled_datetime: string
          user_id: string
        }[]
      }
      get_unread_notification_count: {
        Args: { user_id_param: string }
        Returns: number
      }
    }
    Enums: {
      pricing_plan_interval: "day" | "week" | "month" | "year"
      pricing_type: "one_time" | "recurring"
      subscription_status:
        | "trialing"
        | "active"
        | "canceled"
        | "incomplete"
        | "incomplete_expired"
        | "past_due"
        | "unpaid"
        | "paused"
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
      pricing_plan_interval: ["day", "week", "month", "year"],
      pricing_type: ["one_time", "recurring"],
      subscription_status: [
        "trialing",
        "active",
        "canceled",
        "incomplete",
        "incomplete_expired",
        "past_due",
        "unpaid",
        "paused",
      ],
    },
  },
} as const
