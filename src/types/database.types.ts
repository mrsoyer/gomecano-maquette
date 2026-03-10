/**
 * Database Types - Auto-generated from Supabase
 *
 * This file should be regenerated with:
 * npx supabase gen types typescript --project-id <PROJECT_ID> > src/types/database.types.ts
 *
 * For now, this is a placeholder with basic types used by composables.
 */

export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export interface Database {
  public: {
    Tables: {
      services: {
        Row: {
          id: string
          slug: string
          name: string
          description: string
          price_from: number
          duration: number
          category: string
          image_url: string | null
          badges: string[] | null
          is_instant_quote: boolean
          included: string[] | null
          recommended: boolean
          is_active: boolean
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          slug: string
          name: string
          description: string
          price_from: number
          duration: number
          category: string
          image_url?: string | null
          badges?: string[] | null
          is_instant_quote?: boolean
          included?: string[] | null
          recommended?: boolean
          is_active?: boolean
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          slug?: string
          name?: string
          description?: string
          price_from?: number
          duration?: number
          category?: string
          image_url?: string | null
          badges?: string[] | null
          is_instant_quote?: boolean
          included?: string[] | null
          recommended?: boolean
          is_active?: boolean
          created_at?: string
          updated_at?: string
        }
      }
      testimonials: {
        Row: {
          id: string
          user_id: string
          user_name: string
          user_avatar: string | null
          rating: number
          comment: string
          service_id: string
          service_name: string
          verified: boolean
          created_at: string
        }
        Insert: {
          id?: string
          user_id: string
          user_name: string
          user_avatar?: string | null
          rating: number
          comment: string
          service_id: string
          service_name: string
          verified?: boolean
          created_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          user_name?: string
          user_avatar?: string | null
          rating?: number
          comment?: string
          service_id?: string
          service_name?: string
          verified?: boolean
          created_at?: string
        }
      }
      home_stats: {
        Row: {
          id: string
          key: string
          value: string
          label: string
          icon: string | null
          display_order: number
          is_active: boolean
        }
        Insert: {
          id?: string
          key: string
          value: string
          label: string
          icon?: string | null
          display_order?: number
          is_active?: boolean
        }
        Update: {
          id?: string
          key?: string
          value?: string
          label?: string
          icon?: string | null
          display_order?: number
          is_active?: boolean
        }
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      home_get_services: {
        Args: Record<PropertyKey, never>
        Returns: Json
      }
      home_get_service: {
        Args: {
          p_slug: string
        }
        Returns: Json
      }
      home_get_featured_services: {
        Args: {
          p_limit?: number
        }
        Returns: Json
      }
      home_search_services: {
        Args: {
          p_query: string
        }
        Returns: Json
      }
      home_get_testimonials: {
        Args: {
          p_limit?: number
        }
        Returns: Json
      }
      home_get_stats: {
        Args: Record<PropertyKey, never>
        Returns: Json
      }
    }
    Enums: {
      [_ in never]: never
    }
  }
}
