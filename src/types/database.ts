export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type UserRole = 'broker' | 'vendor'
export type VendorStatus = 'pending' | 'active' | 'inactive'
export type InvitationStatus = 'pending' | 'accepted' | 'expired'
export type DealStage =
  | 'new_submission'
  | 'under_review'
  | 'docs_needed'
  | 'submitted_to_lender'
  | 'approved'
  | 'docs_out'
  | 'funded'
  | 'declined'
  | 'on_hold'
export type DocumentStatus = 'pending' | 'reviewed' | 'accepted' | 'needs_revision'
export type EntityType = 'llc' | 'corporation' | 'sole_proprietorship' | 'partnership' | 'other'
export type FinancingType = 'equipment' | 'working_capital' | 'both'

export interface Database {
  public: {
    Tables: {
      profiles: {
        Row: {
          id: string
          email: string
          role: UserRole
          first_name: string | null
          last_name: string | null
          phone: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id: string
          email: string
          role: UserRole
          first_name?: string | null
          last_name?: string | null
          phone?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          email?: string
          role?: UserRole
          first_name?: string | null
          last_name?: string | null
          phone?: string | null
          created_at?: string
          updated_at?: string
        }
      }
      brokers: {
        Row: {
          id: string
          profile_id: string
          company_name: string
          company_address: string | null
          company_phone: string | null
          company_website: string | null
          logo_url: string | null
          subdomain: string | null
          is_verified: boolean
          onboarding_completed: boolean
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          profile_id: string
          company_name: string
          company_address?: string | null
          company_phone?: string | null
          company_website?: string | null
          logo_url?: string | null
          subdomain?: string | null
          is_verified?: boolean
          onboarding_completed?: boolean
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          profile_id?: string
          company_name?: string
          company_address?: string | null
          company_phone?: string | null
          company_website?: string | null
          logo_url?: string | null
          subdomain?: string | null
          is_verified?: boolean
          onboarding_completed?: boolean
          created_at?: string
          updated_at?: string
        }
      }
      vendors: {
        Row: {
          id: string
          profile_id: string
          broker_id: string
          company_name: string
          company_address: string | null
          company_phone: string | null
          status: VendorStatus
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          profile_id: string
          broker_id: string
          company_name: string
          company_address?: string | null
          company_phone?: string | null
          status?: VendorStatus
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          profile_id?: string
          broker_id?: string
          company_name?: string
          company_address?: string | null
          company_phone?: string | null
          status?: VendorStatus
          created_at?: string
          updated_at?: string
        }
      }
      vendor_invitations: {
        Row: {
          id: string
          broker_id: string
          email: string
          company_name: string | null
          token: string
          status: InvitationStatus
          expires_at: string
          created_at: string
        }
        Insert: {
          id?: string
          broker_id: string
          email: string
          company_name?: string | null
          token?: string
          status?: InvitationStatus
          expires_at?: string
          created_at?: string
        }
        Update: {
          id?: string
          broker_id?: string
          email?: string
          company_name?: string | null
          token?: string
          status?: InvitationStatus
          expires_at?: string
          created_at?: string
        }
      }
      kanban_stages: {
        Row: {
          id: string
          broker_id: string
          name: string
          description: string | null
          position: number
          is_visible_to_vendor: boolean
          is_default: boolean
          created_at: string
        }
        Insert: {
          id?: string
          broker_id: string
          name: string
          description?: string | null
          position: number
          is_visible_to_vendor?: boolean
          is_default?: boolean
          created_at?: string
        }
        Update: {
          id?: string
          broker_id?: string
          name?: string
          description?: string | null
          position?: number
          is_visible_to_vendor?: boolean
          is_default?: boolean
          created_at?: string
        }
      }
      deals: {
        Row: {
          id: string
          vendor_id: string
          broker_id: string
          stage_id: string
          // Business Information
          business_legal_name: string
          business_dba: string | null
          business_address: string
          business_phone: string
          business_email: string
          business_ein: string
          business_established_date: string | null
          entity_type: EntityType
          state_of_incorporation: string | null
          industry: string | null
          annual_revenue: number | null
          // Owner/Guarantor Information
          owner_full_name: string
          owner_title: string | null
          owner_ownership_percentage: number | null
          owner_address: string | null
          owner_dob: string | null
          owner_ssn_encrypted: string | null
          owner_phone: string | null
          // Financing Request
          amount_requested: number
          financing_type: FinancingType
          equipment_description: string | null
          equipment_vendor_name: string | null
          is_new_equipment: boolean | null
          preferred_term_months: number | null
          use_of_funds: string | null
          // Metadata
          created_at: string
          updated_at: string
          submitted_at: string | null
        }
        Insert: {
          id?: string
          vendor_id: string
          broker_id: string
          stage_id: string
          business_legal_name: string
          business_dba?: string | null
          business_address: string
          business_phone: string
          business_email: string
          business_ein: string
          business_established_date?: string | null
          entity_type: EntityType
          state_of_incorporation?: string | null
          industry?: string | null
          annual_revenue?: number | null
          owner_full_name: string
          owner_title?: string | null
          owner_ownership_percentage?: number | null
          owner_address?: string | null
          owner_dob?: string | null
          owner_ssn_encrypted?: string | null
          owner_phone?: string | null
          amount_requested: number
          financing_type: FinancingType
          equipment_description?: string | null
          equipment_vendor_name?: string | null
          is_new_equipment?: boolean | null
          preferred_term_months?: number | null
          use_of_funds?: string | null
          created_at?: string
          updated_at?: string
          submitted_at?: string | null
        }
        Update: {
          id?: string
          vendor_id?: string
          broker_id?: string
          stage_id?: string
          business_legal_name?: string
          business_dba?: string | null
          business_address?: string
          business_phone?: string
          business_email?: string
          business_ein?: string
          business_established_date?: string | null
          entity_type?: EntityType
          state_of_incorporation?: string | null
          industry?: string | null
          annual_revenue?: number | null
          owner_full_name?: string
          owner_title?: string | null
          owner_ownership_percentage?: number | null
          owner_address?: string | null
          owner_dob?: string | null
          owner_ssn_encrypted?: string | null
          owner_phone?: string | null
          amount_requested?: number
          financing_type?: FinancingType
          equipment_description?: string | null
          equipment_vendor_name?: string | null
          is_new_equipment?: boolean | null
          preferred_term_months?: number | null
          use_of_funds?: string | null
          created_at?: string
          updated_at?: string
          submitted_at?: string | null
        }
      }
      deal_documents: {
        Row: {
          id: string
          deal_id: string
          file_name: string
          file_path: string
          file_size: number
          file_type: string
          document_category: string
          status: DocumentStatus
          uploaded_by: string
          reviewed_by: string | null
          reviewed_at: string | null
          notes: string | null
          created_at: string
        }
        Insert: {
          id?: string
          deal_id: string
          file_name: string
          file_path: string
          file_size: number
          file_type: string
          document_category: string
          status?: DocumentStatus
          uploaded_by: string
          reviewed_by?: string | null
          reviewed_at?: string | null
          notes?: string | null
          created_at?: string
        }
        Update: {
          id?: string
          deal_id?: string
          file_name?: string
          file_path?: string
          file_size?: number
          file_type?: string
          document_category?: string
          status?: DocumentStatus
          uploaded_by?: string
          reviewed_by?: string | null
          reviewed_at?: string | null
          notes?: string | null
          created_at?: string
        }
      }
      deal_notes: {
        Row: {
          id: string
          deal_id: string
          author_id: string
          content: string
          is_internal: boolean
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          deal_id: string
          author_id: string
          content: string
          is_internal?: boolean
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          deal_id?: string
          author_id?: string
          content?: string
          is_internal?: boolean
          created_at?: string
          updated_at?: string
        }
      }
      messages: {
        Row: {
          id: string
          deal_id: string
          sender_id: string
          content: string
          is_read: boolean
          read_at: string | null
          created_at: string
        }
        Insert: {
          id?: string
          deal_id: string
          sender_id: string
          content: string
          is_read?: boolean
          read_at?: string | null
          created_at?: string
        }
        Update: {
          id?: string
          deal_id?: string
          sender_id?: string
          content?: string
          is_read?: boolean
          read_at?: string | null
          created_at?: string
        }
      }
      message_attachments: {
        Row: {
          id: string
          message_id: string
          file_name: string
          file_path: string
          file_size: number
          file_type: string
          created_at: string
        }
        Insert: {
          id?: string
          message_id: string
          file_name: string
          file_path: string
          file_size: number
          file_type: string
          created_at?: string
        }
        Update: {
          id?: string
          message_id?: string
          file_name?: string
          file_path?: string
          file_size?: number
          file_type?: string
          created_at?: string
        }
      }
      resources: {
        Row: {
          id: string
          broker_id: string
          title: string
          description: string | null
          content: string | null
          file_path: string | null
          category: string
          is_published: boolean
          published_at: string | null
          view_count: number
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          broker_id: string
          title: string
          description?: string | null
          content?: string | null
          file_path?: string | null
          category: string
          is_published?: boolean
          published_at?: string | null
          view_count?: number
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          broker_id?: string
          title?: string
          description?: string | null
          content?: string | null
          file_path?: string | null
          category?: string
          is_published?: boolean
          published_at?: string | null
          view_count?: number
          created_at?: string
          updated_at?: string
        }
      }
      resource_categories: {
        Row: {
          id: string
          broker_id: string
          name: string
          position: number
          created_at: string
        }
        Insert: {
          id?: string
          broker_id: string
          name: string
          position: number
          created_at?: string
        }
        Update: {
          id?: string
          broker_id?: string
          name?: string
          position?: number
          created_at?: string
        }
      }
      activity_log: {
        Row: {
          id: string
          user_id: string
          action: string
          entity_type: string
          entity_id: string
          metadata: Json | null
          created_at: string
        }
        Insert: {
          id?: string
          user_id: string
          action: string
          entity_type: string
          entity_id: string
          metadata?: Json | null
          created_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          action?: string
          entity_type?: string
          entity_id?: string
          metadata?: Json | null
          created_at?: string
        }
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      [_ in never]: never
    }
    Enums: {
      user_role: UserRole
      vendor_status: VendorStatus
      invitation_status: InvitationStatus
      deal_stage: DealStage
      document_status: DocumentStatus
      entity_type: EntityType
      financing_type: FinancingType
    }
  }
}

// Helper types for easier usage
export type Profile = Database['public']['Tables']['profiles']['Row']
export type Broker = Database['public']['Tables']['brokers']['Row']
export type Vendor = Database['public']['Tables']['vendors']['Row']
export type VendorInvitation = Database['public']['Tables']['vendor_invitations']['Row']
export type KanbanStage = Database['public']['Tables']['kanban_stages']['Row']
export type Deal = Database['public']['Tables']['deals']['Row']
export type DealDocument = Database['public']['Tables']['deal_documents']['Row']
export type DealNote = Database['public']['Tables']['deal_notes']['Row']
export type Message = Database['public']['Tables']['messages']['Row']
export type MessageAttachment = Database['public']['Tables']['message_attachments']['Row']
export type Resource = Database['public']['Tables']['resources']['Row']
export type ResourceCategory = Database['public']['Tables']['resource_categories']['Row']
export type ActivityLog = Database['public']['Tables']['activity_log']['Row']
