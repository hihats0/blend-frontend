import { createClient } from '@supabase/supabase-js'

export function createServerClient(){
  const supabaseUrl = process.env.SUPABASE_URL || process.env.NEXT_PUBLIC_SUPABASE_URL
  const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY
  if(!supabaseUrl || !supabaseServiceKey){
    throw new Error('Supabase server env vars missing')
  }
  return createClient(supabaseUrl, supabaseServiceKey, {
    auth: { persistSession: false }
  })
}
