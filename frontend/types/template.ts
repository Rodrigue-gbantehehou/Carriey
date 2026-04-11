// types/template.ts
export interface Template {
  id: string
  name: string
  slug: string
  category: string
  thumbnail_url?: string
  preview_url?: string
  is_premium: boolean
  is_active: boolean
  created_at: string
  updated_at?: string
}