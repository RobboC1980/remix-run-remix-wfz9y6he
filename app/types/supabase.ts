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
      profiles: {
        Row: {
          id: string
          email: string
          full_name: string | null
          avatar_url: string | null
          role: string
          created_at: string
          updated_at: string
        }
        Insert: {
          id: string
          email: string
          full_name?: string | null
          avatar_url?: string | null
          role?: string
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          email?: string
          full_name?: string | null
          avatar_url?: string | null
          role?: string
          created_at?: string
          updated_at?: string
        }
      }
      projects: {
        Row: {
          id: string
          name: string
          description: string | null
          status: string
          created_by: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          name: string
          description?: string | null
          status?: string
          created_by?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          name?: string
          description?: string | null
          status?: string
          created_by?: string | null
          created_at?: string
          updated_at?: string
        }
      }
      project_members: {
        Row: {
          project_id: string
          user_id: string
          role: string
          created_at: string
        }
        Insert: {
          project_id: string
          user_id: string
          role?: string
          created_at?: string
        }
        Update: {
          project_id?: string
          user_id?: string
          role?: string
          created_at?: string
        }
      }
      epics: {
        Row: {
          id: string
          project_id: string
          title: string
          description: string | null
          status: string
          priority: string
          created_by: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          project_id: string
          title: string
          description?: string | null
          status?: string
          priority?: string
          created_by?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          project_id?: string
          title?: string
          description?: string | null
          status?: string
          priority?: string
          created_by?: string | null
          created_at?: string
          updated_at?: string
        }
      }
      user_stories: {
        Row: {
          id: string
          epic_id: string
          title: string
          description: string | null
          acceptance_criteria: string[] | null
          status: string
          priority: string
          story_points: number | null
          created_by: string | null
          assigned_to: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          epic_id: string
          title: string
          description?: string | null
          acceptance_criteria?: string[] | null
          status?: string
          priority?: string
          story_points?: number | null
          created_by?: string | null
          assigned_to?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          epic_id?: string
          title?: string
          description?: string | null
          acceptance_criteria?: string[] | null
          status?: string
          priority?: string
          story_points?: number | null
          created_by?: string | null
          assigned_to?: string | null
          created_at?: string
          updated_at?: string
        }
      }
      tasks: {
        Row: {
          id: string
          user_story_id: string
          title: string
          description: string | null
          status: string
          priority: string
          created_by: string | null
          assigned_to: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          user_story_id: string
          title: string
          description?: string | null
          status?: string
          priority?: string
          created_by?: string | null
          assigned_to?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          user_story_id?: string
          title?: string
          description?: string | null
          status?: string
          priority?: string
          created_by?: string | null
          assigned_to?: string | null
          created_at?: string
          updated_at?: string
        }
      }
      comments: {
        Row: {
          id: string
          content: string
          entity_type: string
          entity_id: string
          created_by: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          content: string
          entity_type: string
          entity_id: string
          created_by?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          content?: string
          entity_type?: string
          entity_id?: string
          created_by?: string | null
          created_at?: string
          updated_at?: string
        }
      }
      activity_log: {
        Row: {
          id: string
          entity_type: string
          entity_id: string
          action: string
          details: Json | null
          performed_by: string | null
          created_at: string
        }
        Insert: {
          id?: string
          entity_type: string
          entity_id: string
          action: string
          details?: Json | null
          performed_by?: string | null
          created_at?: string
        }
        Update: {
          id?: string
          entity_type?: string
          entity_id?: string
          action?: string
          details?: Json | null
          performed_by?: string | null
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
      [_ in never]: never
    }
  }
} 