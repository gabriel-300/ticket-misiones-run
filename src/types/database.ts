// Auto-generado con: npx supabase gen types typescript --project-id <PROJECT_REF> > src/types/database.ts
// Este archivo se reemplazará cuando se conecte el proyecto Supabase en el Bloque 2.

export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export interface Database {
  public: {
    Tables: Record<string, never>
    Views: Record<string, never>
    Functions: Record<string, never>
    Enums: Record<string, never>
    CompositeTypes: Record<string, never>
  }
}
