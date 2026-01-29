import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.REACT_APP_SUPABASE_URL
const supabaseAnonKey = process.env.REACT_APP_SUPABASE_ANON_KEY

if (!supabaseUrl || !supabaseAnonKey) {
    console.warn('Supabase credentials missing. Ensure .env is configured.')
}

export const supabase = createClient(
    supabaseUrl || 'https://dqggwdkhhffvxpvclnzx.supabase.co',
    supabaseAnonKey || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImRxZ2d3ZGtoaGZmdnhwdmNsbnp4Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjkxOTMxMDMsImV4cCI6MjA4NDc2OTEwM30.eSHo5hjpd8Do3owWVVU_ur_aLXLZhX9G41btDQGhSH0'
)
