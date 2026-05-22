// 手写的 Database 类型；如果之后用 supabase CLI 生成，可以替换此文件。
export type Database = {
  public: {
    Tables: {
      profiles: {
        Row: {
          id: string
          nickname: string
          avatar_url: string | null
          district: string | null
          wechat: string | null
          whatsapp: string | null
          role: 'user' | 'admin' | 'banned'
          approved_listing_count: number
          created_at: string
          updated_at: string
        }
        Insert: {
          id: string
          nickname: string
          avatar_url?: string | null
          district?: string | null
          wechat?: string | null
          whatsapp?: string | null
          role?: 'user' | 'admin' | 'banned'
          approved_listing_count?: number
        }
        Update: Partial<Database['public']['Tables']['profiles']['Insert']>
      }
      listings: {
        Row: {
          id: string
          user_id: string
          title: string
          description: string
          price: number
          is_free: boolean
          category: string
          district: string
          condition: string
          pickup_available: boolean
          status: 'draft' | 'pending' | 'published' | 'rejected' | 'hidden' | 'sold'
          view_count: number
          report_count: number
          is_featured: boolean
          is_urgent: boolean
          featured_until: string | null
          rejected_reason: string | null
          rejected_at: string | null
          created_at: string
          updated_at: string
          published_at: string | null
          sold_at: string | null
        }
        Insert: {
          id?: string
          user_id: string
          title: string
          description: string
          price: number
          category: string
          district: string
          condition: string
          pickup_available?: boolean
          status?: Database['public']['Tables']['listings']['Row']['status']
          is_featured?: boolean
          is_urgent?: boolean
        }
        Update: Partial<Database['public']['Tables']['listings']['Insert']> & {
          status?: Database['public']['Tables']['listings']['Row']['status']
          view_count?: number
          rejected_reason?: string | null
          rejected_at?: string | null
          published_at?: string | null
          sold_at?: string | null
        }
      }
      listing_images: {
        Row: {
          id: string
          listing_id: string
          image_url: string
          sort_order: number
          created_at: string
        }
        Insert: { id?: string; listing_id: string; image_url: string; sort_order?: number }
        Update: Partial<Database['public']['Tables']['listing_images']['Insert']>
      }
      favorites: {
        Row: { user_id: string; listing_id: string; created_at: string }
        Insert: { user_id: string; listing_id: string }
        Update: never
      }
      reports: {
        Row: {
          id: string
          reporter_id: string | null
          listing_id: string
          reason: string
          description: string | null
          status: 'open' | 'resolved' | 'dismissed'
          created_at: string
          resolved_at: string | null
        }
        Insert: {
          id?: string
          reporter_id?: string | null
          listing_id: string
          reason: string
          description?: string | null
        }
        Update: Partial<Database['public']['Tables']['reports']['Insert']> & {
          status?: 'open' | 'resolved' | 'dismissed'
          resolved_at?: string | null
        }
      }
      moderation_logs: {
        Row: {
          id: string
          admin_id: string | null
          listing_id: string | null
          user_id: string | null
          action: string
          reason: string | null
          created_at: string
        }
        Insert: Omit<Database['public']['Tables']['moderation_logs']['Row'], 'id' | 'created_at'>
        Update: never
      }
      blocked_words: {
        Row: { id: string; word: string; category: string; created_at: string }
        Insert: { id?: string; word: string; category: string }
        Update: Partial<Database['public']['Tables']['blocked_words']['Insert']>
      }
      contact_reveals: {
        Row: { id: string; viewer_id: string; listing_id: string; revealed_at: string }
        Insert: { id?: string; viewer_id: string; listing_id: string }
        Update: never
      }
    }
    Views: Record<string, never>
    Functions: Record<string, never>
    Enums: Record<string, never>
  }
}

export type ListingRow = Database['public']['Tables']['listings']['Row']
export type ListingInsert = Database['public']['Tables']['listings']['Insert']
export type ProfileRow = Database['public']['Tables']['profiles']['Row']
export type ListingImage = Database['public']['Tables']['listing_images']['Row']
export type ReportRow = Database['public']['Tables']['reports']['Row']
