import { createServerClient, parse, serialize } from '@supabase/ssr';
import type { Database } from '~/types/supabase';

// Development defaults for quick start
const SUPABASE_URL = process.env.SUPABASE_URL || 'http://localhost:54321';
const SUPABASE_KEY = process.env.SUPABASE_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZS1kZW1vIiwicm9sZSI6ImFub24iLCJleHAiOjE5ODM4MTI5OTZ9.CRXP1A7WOeoJeXxjNni43kdQwgnWNReilDMblYTn_I0';

// Ensure URL has correct protocol
const normalizedUrl = SUPABASE_URL.startsWith('http') 
  ? SUPABASE_URL 
  : `https://${SUPABASE_URL}`;

export function getSupabaseClient(request: Request) {
  const cookies = parse(request.headers.get('Cookie') || '');
  
  const headers = new Headers();
  
  const supabase = createServerClient(
    normalizedUrl,
    SUPABASE_KEY,
    {
      cookies: {
        get(key) {
          return cookies[key];
        },
        set(key, value, options) {
          headers.append('Set-Cookie', serialize(key, value, options));
        },
        remove(key, options) {
          headers.append('Set-Cookie', serialize(key, '', options));
        },
      },
    }
  );

  return { supabase, headers };
}

// For non-request contexts (e.g., background jobs)
export const supabase = createServerClient(
  normalizedUrl,
  SUPABASE_KEY,
  {
    cookies: {
      get() { return undefined; },
      set() { return; },
      remove() { return; },
    },
    auth: {
      persistSession: false,
      autoRefreshToken: true,
      detectSessionInUrl: true
    }
  }
);