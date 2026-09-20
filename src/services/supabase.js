import { createClient } from '@supabase/supabase-js'

const supabaseUrl = (typeof import.meta !== 'undefined' && import.meta.env?.VITE_SUPABASE_URL) || (typeof process !== 'undefined' ? process.env?.VITE_SUPABASE_URL : '')
const supabaseAnonKey = (typeof import.meta !== 'undefined' && import.meta.env?.VITE_SUPABASE_ANON_KEY) || (typeof process !== 'undefined' ? process.env?.VITE_SUPABASE_ANON_KEY : '')

export const isSupabaseConfigured = () => {
  return (
    typeof supabaseUrl === 'string' &&
    supabaseUrl.trim() !== '' &&
    !supabaseUrl.includes('your_supabase') &&
    typeof supabaseAnonKey === 'string' &&
    supabaseAnonKey.trim() !== '' &&
    !supabaseAnonKey.includes('your_supabase')
  )
}

export const supabase = isSupabaseConfigured()
  ? createClient(supabaseUrl, supabaseAnonKey, {
      auth: {
        autoRefreshToken: true,
        persistSession: true,
        detectSessionInUrl: true,
      },
    })
  : null
