export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  __InternalSupabase: {
    PostgrestVersion: "14.5"
  }
  public: {
    Tables: {
      organizations: {
        Row: {
          id: string
          name: string
          slug: string
          description: string | null
          logo_url: string | null
          website_url: string | null
          contact_email: string
          phone: string | null
          owner_id: string | null
          commission_rate: number
          status: string
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          name: string
          slug: string
          description?: string | null
          logo_url?: string | null
          website_url?: string | null
          contact_email: string
          phone?: string | null
          owner_id?: string | null
          commission_rate?: number
          status?: string
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          name?: string
          slug?: string
          description?: string | null
          logo_url?: string | null
          website_url?: string | null
          contact_email?: string
          phone?: string | null
          owner_id?: string | null
          commission_rate?: number
          status?: string
          created_at?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "organizations_owner_id_fkey"
            columns: ["owner_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      ticket_types: {
        Row: {
          active: boolean
          age_max: number | null
          age_min: number | null
          capacity: number | null
          created_at: string
          distance_km: number | null
          event_id: string
          id: string
          name: string
          registered_count: number
          sort_order: number
          start_time: string | null
        }
        Insert: {
          active?: boolean
          age_max?: number | null
          age_min?: number | null
          capacity?: number | null
          created_at?: string
          distance_km?: number | null
          event_id: string
          id?: string
          name: string
          registered_count?: number
          sort_order?: number
          start_time?: string | null
        }
        Update: {
          active?: boolean
          age_max?: number | null
          age_min?: number | null
          capacity?: number | null
          created_at?: string
          distance_km?: number | null
          event_id?: string
          id?: string
          name?: string
          registered_count?: number
          sort_order?: number
          start_time?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "ticket_types_event_id_fkey"
            columns: ["event_id"]
            isOneToOne: false
            referencedRelation: "events"
            referencedColumns: ["id"]
          },
        ]
      }
      complementary_services: {
        Row: {
          active: boolean
          category: string
          contact_method: string
          contact_value: string | null
          created_at: string
          currency: string | null
          description: string | null
          display_order: number | null
          event_id: string | null
          id: string
          image_url: string | null
          organization_id: string | null
          partner_name: string
          price_from: number | null
          subcategory: string | null
          title: string
        }
        Insert: {
          active?: boolean
          category: string
          contact_method?: string
          contact_value?: string | null
          created_at?: string
          currency?: string | null
          description?: string | null
          display_order?: number | null
          event_id?: string | null
          id?: string
          image_url?: string | null
          organization_id?: string | null
          partner_name: string
          price_from?: number | null
          subcategory?: string | null
          title: string
        }
        Update: {
          active?: boolean
          category?: string
          contact_method?: string
          contact_value?: string | null
          created_at?: string
          currency?: string | null
          description?: string | null
          display_order?: number | null
          event_id?: string | null
          id?: string
          image_url?: string | null
          organization_id?: string | null
          partner_name?: string
          price_from?: number | null
          subcategory?: string | null
          title?: string
        }
        Relationships: [
          {
            foreignKeyName: "complementary_services_event_id_fkey"
            columns: ["event_id"]
            isOneToOne: false
            referencedRelation: "events"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "complementary_services_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
        ]
      }
      coupons: {
        Row: {
          active: boolean
          code: string
          created_at: string
          discount_type: string
          discount_value: number
          event_id: string | null
          expires_at: string | null
          id: string
          max_uses: number | null
          used_count: number
          valid_from: string
        }
        Insert: {
          active?: boolean
          code: string
          created_at?: string
          discount_type: string
          discount_value: number
          event_id?: string | null
          expires_at?: string | null
          id?: string
          max_uses?: number | null
          used_count?: number
          valid_from?: string
        }
        Update: {
          active?: boolean
          code?: string
          created_at?: string
          discount_type?: string
          discount_value?: number
          event_id?: string | null
          expires_at?: string | null
          id?: string
          max_uses?: number | null
          used_count?: number
          valid_from?: string
        }
        Relationships: [
          {
            foreignKeyName: "coupons_event_id_fkey"
            columns: ["event_id"]
            isOneToOne: false
            referencedRelation: "events"
            referencedColumns: ["id"]
          },
        ]
      }
      email_log: {
        Row: {
          created_at: string
          error: string | null
          id: string
          recipient_email: string
          recipient_user_id: string | null
          related_registration_id: string | null
          resend_id: string | null
          sent_at: string | null
          status: string
          subject: string
          template: string
        }
        Insert: {
          created_at?: string
          error?: string | null
          id?: string
          recipient_email: string
          recipient_user_id?: string | null
          related_registration_id?: string | null
          resend_id?: string | null
          sent_at?: string | null
          status?: string
          subject: string
          template: string
        }
        Update: {
          created_at?: string
          error?: string | null
          id?: string
          recipient_email?: string
          recipient_user_id?: string | null
          related_registration_id?: string | null
          resend_id?: string | null
          sent_at?: string | null
          status?: string
          subject?: string
          template?: string
        }
        Relationships: [
          {
            foreignKeyName: "email_log_related_registration_id_fkey"
            columns: ["related_registration_id"]
            isOneToOne: false
            referencedRelation: "registrations"
            referencedColumns: ["id"]
          },
        ]
      }
      events: {
        Row: {
          course_geojson_url: string | null
          course_map_url: string | null
          cover_image_url: string | null
          created_at: string
          created_by: string | null
          custom_fields: Json | null
          description: string | null
          ends_at: string | null
          gallery: Json | null
          hero_video_url: string | null
          id: string
          location: Json
          medical_certificate_min_distance_km: number | null
          name: string
          organization_id: string | null
          registration_closes_at: string
          registration_opens_at: string
          regulation_url: string | null
          requires_medical_certificate: boolean
          service_fee_percentage: number
          short_description: string | null
          slug: string
          starts_at: string
          status: string
          terms_url: string | null
          type: string
          updated_at: string
          waiver_text: string | null
        }
        Insert: {
          course_geojson_url?: string | null
          course_map_url?: string | null
          cover_image_url?: string | null
          created_at?: string
          created_by?: string | null
          custom_fields?: Json | null
          description?: string | null
          ends_at?: string | null
          gallery?: Json | null
          hero_video_url?: string | null
          id?: string
          location: Json
          medical_certificate_min_distance_km?: number | null
          name: string
          organization_id?: string | null
          registration_closes_at: string
          registration_opens_at: string
          regulation_url?: string | null
          requires_medical_certificate?: boolean
          service_fee_percentage?: number
          short_description?: string | null
          slug: string
          starts_at: string
          status?: string
          terms_url?: string | null
          type?: string
          updated_at?: string
          waiver_text?: string | null
        }
        Update: {
          course_geojson_url?: string | null
          course_map_url?: string | null
          cover_image_url?: string | null
          created_at?: string
          created_by?: string | null
          custom_fields?: Json | null
          description?: string | null
          ends_at?: string | null
          gallery?: Json | null
          hero_video_url?: string | null
          id?: string
          location?: Json
          medical_certificate_min_distance_km?: number | null
          name?: string
          organization_id?: string | null
          registration_closes_at?: string
          registration_opens_at?: string
          regulation_url?: string | null
          requires_medical_certificate?: boolean
          service_fee_percentage?: number
          short_description?: string | null
          slug?: string
          starts_at?: string
          status?: string
          terms_url?: string | null
          type?: string
          updated_at?: string
          waiver_text?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "events_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
        ]
      }
      orders: {
        Row: {
          buyer_id: string
          created_at: string
          currency: string
          failed_reason: string | null
          id: string
          items: Json
          paid_at: string | null
          payway_card_brand: string | null
          payway_card_last4: string | null
          payway_installments: number | null
          payway_payment_id: string | null
          payway_response: Json | null
          payway_site_transaction_id: string
          payway_status: string | null
          status: string
          total_amount: number
          updated_at: string
        }
        Insert: {
          buyer_id: string
          created_at?: string
          currency?: string
          failed_reason?: string | null
          id?: string
          items: Json
          paid_at?: string | null
          payway_card_brand?: string | null
          payway_card_last4?: string | null
          payway_installments?: number | null
          payway_payment_id?: string | null
          payway_response?: Json | null
          payway_site_transaction_id: string
          payway_status?: string | null
          status?: string
          total_amount: number
          updated_at?: string
        }
        Update: {
          buyer_id?: string
          created_at?: string
          currency?: string
          failed_reason?: string | null
          id?: string
          items?: Json
          paid_at?: string | null
          payway_card_brand?: string | null
          payway_card_last4?: string | null
          payway_installments?: number | null
          payway_payment_id?: string | null
          payway_response?: Json | null
          payway_site_transaction_id?: string
          payway_status?: string | null
          status?: string
          total_amount?: number
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "orders_buyer_id_fkey"
            columns: ["buyer_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      pricing_tiers: {
        Row: {
          active: boolean
          created_at: string
          ticket_type_id: string | null
          ends_at: string
          event_id: string
          id: string
          name: string
          price_ars: number
          sort_order: number
          starts_at: string
        }
        Insert: {
          active?: boolean
          created_at?: string
          ticket_type_id?: string | null
          ends_at: string
          event_id: string
          id?: string
          name: string
          price_ars: number
          sort_order?: number
          starts_at: string
        }
        Update: {
          active?: boolean
          created_at?: string
          ticket_type_id?: string | null
          ends_at?: string
          event_id?: string
          id?: string
          name?: string
          price_ars?: number
          sort_order?: number
          starts_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "pricing_tiers_ticket_type_id_fkey"
            columns: ["ticket_type_id"]
            isOneToOne: false
            referencedRelation: "ticket_types"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "pricing_tiers_event_id_fkey"
            columns: ["event_id"]
            isOneToOne: false
            referencedRelation: "events"
            referencedColumns: ["id"]
          },
        ]
      }
      profiles: {
        Row: {
          address: string | null
          apto_medico_issued_at: string | null
          apto_medico_rejection_reason: string | null
          apto_medico_status: string | null
          apto_medico_url: string | null
          apto_medico_validated_at: string | null
          apto_medico_validated_by: string | null
          avatar_url: string | null
          birth_date: string
          blood_type: string | null
          city: string | null
          created_at: string
          data_processing_consent_at: string | null
          dni: string
          dni_type: string
          emergency_contact: Json | null
          first_name: string
          gender: string
          health_insurance: Json | null
          id: string
          last_name: string
          marketing_consent: boolean | null
          medical_conditions: string | null
          nationality: string
          phone: string
          province: string | null
          role: string
          shirt_size: string | null
          shoe_size: string | null
          updated_at: string
        }
        Insert: {
          address?: string | null
          apto_medico_issued_at?: string | null
          apto_medico_rejection_reason?: string | null
          apto_medico_status?: string | null
          apto_medico_url?: string | null
          apto_medico_validated_at?: string | null
          apto_medico_validated_by?: string | null
          avatar_url?: string | null
          birth_date: string
          blood_type?: string | null
          city?: string | null
          created_at?: string
          data_processing_consent_at?: string | null
          dni: string
          dni_type?: string
          emergency_contact?: Json | null
          first_name: string
          gender: string
          health_insurance?: Json | null
          id: string
          last_name: string
          marketing_consent?: boolean | null
          medical_conditions?: string | null
          nationality?: string
          phone: string
          province?: string | null
          role?: string
          shirt_size?: string | null
          shoe_size?: string | null
          updated_at?: string
        }
        Update: {
          address?: string | null
          apto_medico_issued_at?: string | null
          apto_medico_rejection_reason?: string | null
          apto_medico_status?: string | null
          apto_medico_url?: string | null
          apto_medico_validated_at?: string | null
          apto_medico_validated_by?: string | null
          avatar_url?: string | null
          birth_date?: string
          blood_type?: string | null
          city?: string | null
          created_at?: string
          data_processing_consent_at?: string | null
          dni?: string
          dni_type?: string
          emergency_contact?: Json | null
          first_name?: string
          gender?: string
          health_insurance?: Json | null
          id?: string
          last_name?: string
          marketing_consent?: boolean | null
          medical_conditions?: string | null
          nationality?: string
          phone?: string
          province?: string | null
          role?: string
          shirt_size?: string | null
          shoe_size?: string | null
          updated_at?: string
        }
        Relationships: []
      }
      registrations: {
        Row: {
          acceptance_log: Json
          base_price: number
          bib_number: number | null
          category: string | null
          coupon_id: string | null
          created_at: string
          custom_field_values: Json | null
          discount_amount: number | null
          ticket_type_id: string
          estimated_time: string | null
          event_id: string
          id: string
          order_id: string | null
          pricing_tier_id: string | null
          buyer_id: string
          service_fee: number
          status: string
          team_name: string | null
          total_amount: number
          updated_at: string
        }
        Insert: {
          acceptance_log?: Json
          base_price: number
          bib_number?: number | null
          category?: string | null
          coupon_id?: string | null
          created_at?: string
          custom_field_values?: Json | null
          discount_amount?: number | null
          ticket_type_id: string
          estimated_time?: string | null
          event_id: string
          id?: string
          order_id?: string | null
          pricing_tier_id?: string | null
          buyer_id: string
          service_fee?: number
          status?: string
          team_name?: string | null
          total_amount: number
          updated_at?: string
        }
        Update: {
          acceptance_log?: Json
          base_price?: number
          bib_number?: number | null
          category?: string | null
          coupon_id?: string | null
          created_at?: string
          custom_field_values?: Json | null
          discount_amount?: number | null
          ticket_type_id?: string
          estimated_time?: string | null
          event_id?: string
          id?: string
          order_id?: string | null
          pricing_tier_id?: string | null
          buyer_id?: string
          service_fee?: number
          status?: string
          team_name?: string | null
          total_amount?: number
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "fk_registrations_order"
            columns: ["order_id"]
            isOneToOne: false
            referencedRelation: "orders"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "registrations_coupon_id_fkey"
            columns: ["coupon_id"]
            isOneToOne: false
            referencedRelation: "coupons"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "registrations_ticket_type_id_fkey"
            columns: ["ticket_type_id"]
            isOneToOne: false
            referencedRelation: "ticket_types"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "registrations_event_id_fkey"
            columns: ["event_id"]
            isOneToOne: false
            referencedRelation: "events"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "registrations_pricing_tier_id_fkey"
            columns: ["pricing_tier_id"]
            isOneToOne: false
            referencedRelation: "pricing_tiers"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "registrations_buyer_id_fkey"
            columns: ["buyer_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      service_interests: {
        Row: {
          contacted_at: string | null
          contacted_by: string | null
          created_at: string
          id: string
          notes: string | null
          registration_id: string
          buyer_id: string
          service_id: string
          status: string
        }
        Insert: {
          contacted_at?: string | null
          contacted_by?: string | null
          created_at?: string
          id?: string
          notes?: string | null
          registration_id: string
          buyer_id: string
          service_id: string
          status?: string
        }
        Update: {
          contacted_at?: string | null
          contacted_by?: string | null
          created_at?: string
          id?: string
          notes?: string | null
          registration_id?: string
          buyer_id?: string
          service_id?: string
          status?: string
        }
        Relationships: [
          {
            foreignKeyName: "service_interests_registration_id_fkey"
            columns: ["registration_id"]
            isOneToOne: false
            referencedRelation: "registrations"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "service_interests_buyer_id_fkey"
            columns: ["buyer_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "service_interests_service_id_fkey"
            columns: ["service_id"]
            isOneToOne: false
            referencedRelation: "complementary_services"
            referencedColumns: ["id"]
          },
        ]
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      is_admin:       { Args: { uid: string }; Returns: boolean }
      is_super_admin: { Args: { uid: string }; Returns: boolean }
      is_organizer:   { Args: { uid: string }; Returns: boolean }
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
