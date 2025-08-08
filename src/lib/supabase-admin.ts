import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseServiceKey) {
  console.warn('⚠️ Supabase admin configuration missing. Server-side email operations will be disabled.');
}

// Admin client for server-side operations
export const supabaseAdmin = createClient(
  supabaseUrl || '',
  supabaseServiceKey || '',
  {
    auth: {
      autoRefreshToken: false,
      persistSession: false
    }
  }
);

// Helper function to check if Supabase admin is configured
export function isSupabaseAdminConfigured(): boolean {
  return !!(supabaseUrl && supabaseServiceKey);
}

// Email storage functions
export async function storeEmail(email: string, resumeFilename?: string) {
  if (!isSupabaseAdminConfigured()) {
    console.warn('Supabase not configured, skipping email storage');
    return { success: false, error: 'Database not configured' };
  }

  try {
    const { data, error } = await supabaseAdmin
      .from('emails')
      .upsert({
        email,
        resume_filename: resumeFilename,
        analysis_completed: false
      }, {
        onConflict: 'email'
      })
      .select();

    if (error) {
      console.error('Supabase email storage error:', error);
      return { success: false, error: error.message };
    }

    console.log('✅ Email stored successfully:', email);
    return { success: true, data };
  } catch (error) {
    console.error('Email storage error:', error);
    return { success: false, error: 'Failed to store email' };
  }
}

export async function markAnalysisComplete(email: string) {
  if (!isSupabaseAdminConfigured()) {
    return { success: false, error: 'Database not configured' };
  }

  try {
    const { error } = await supabaseAdmin
      .from('emails')
      .update({ analysis_completed: true })
      .eq('email', email);

    if (error) {
      console.error('Supabase update error:', error);
      return { success: false, error: error.message };
    }

    return { success: true };
  } catch (error) {
    console.error('Analysis completion update error:', error);
    return { success: false, error: 'Failed to update analysis status' };
  }
}