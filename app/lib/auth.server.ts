import { json, redirect } from '@remix-run/node';
import type { Session } from '@supabase/supabase-js';
import { getSupabaseClient } from './supabase.server';
import { rateLimit } from './rate-limit.server';

const MAX_LOGIN_ATTEMPTS = 5;

export async function getSession(request: Request): Promise<Session | null> {
  const { supabase } = getSupabaseClient(request);

  const {
    data: { session },
  } = await supabase.auth.getSession();

  return session;
}

export async function requireAuth(request: Request) {
  const session = await getSession(request);
  if (!session) {
    try {
      throw redirect('/login', { headers: new Headers() });
    } catch (error) {
      console.error('Authentication error:', error);
      throw redirect('/login', { headers: new Headers() });
    }
  }
  return session;
}

export async function getUserProfile(userId: string) {
  const { supabase } = getSupabaseClient(new Request('http://localhost'));

  const { data: profile, error } = await supabase
    .from('profiles')
    .select('*')
    .eq('id', userId)
    .single();

  if (error) {
    console.error('Error fetching profile:', error);
  }

  return profile;
}

export async function handleAuthAction(request: Request, action: 'login' | 'signup') {
  const { supabase, headers } = getSupabaseClient(request);
  const formData = await request.formData();
  const email = formData.get('email') as string;
  const password = formData.get('password') as string;
  const fullName = formData.get('fullName') as string;

  // Input validation
  if (action === 'signup') {
    if (!fullName?.trim()) {
      return json(
        { error: 'Full name is required' },
        { status: 400, headers }
      );
    }
  }

  if (!email?.trim()) {
    return json(
      { error: 'Email is required' },
      { status: 400, headers }
    );
  }

  if (!password?.trim()) {
    return json(
      { error: 'Password is required' },
      { status: 400, headers }
    );
  }

  if (password.length < 6) {
    return json(
      { error: 'Password must be at least 6 characters long' },
      { status: 400, headers }
    );
  }

  // Rate limiting
  const ip = request.headers.get('x-forwarded-for') || 'unknown';
  const rateLimitResult = await rateLimit(ip, action);
  if (!rateLimitResult.success) {
    return json(
      { error: 'Too many attempts. Please try again later.' },
      { status: 429, headers }
    );
  }

  try {
    if (action === 'login') {
      const { data: { session }, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (error) {
        console.error('Login error:', error);
        return json(
          { error: 'Invalid email or password. Please try again.' },
          { status: 400, headers }
        );
      }

      // Log successful login
      await supabase.from('auth_logs').insert({
        user_id: session?.user.id,
        action: 'login',
        ip_address: ip,
        user_agent: request.headers.get('user-agent') || 'unknown'
      }).catch(error => {
        // Log but don't fail the request
        console.error('Failed to log login:', error);
      });

      return redirect('/dashboard', { headers });
    } else {
      const { data: { user }, error: signUpError } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: {
            full_name: fullName.trim(),
          },
        },
      });

      if (signUpError) {
        console.error('Signup error:', signUpError);
        if (signUpError.message.includes('already registered')) {
          return json(
            { error: 'This email is already registered. Please try logging in instead.' },
            { status: 400, headers }
          );
        }
        return json(
          { error: 'Failed to create account. Please try again.' },
          { status: 400, headers }
        );
      }

      if (!user) {
        return json(
          { error: 'Failed to create account. Please try again.' },
          { status: 400, headers }
        );
      }

      // Create profile
      const { error: profileError } = await supabase
        .from('profiles')
        .insert({
          id: user.id,
          email: user.email,
          full_name: fullName.trim()
        });

      if (profileError) {
        console.error('Profile creation error:', profileError);
        return json(
          { error: 'Account created but profile setup failed.' },
          { status: 500, headers }
        );
      }

      // Log successful signup
      await supabase.from('auth_logs').insert({
        user_id: user.id,
        action: 'signup',
        ip_address: ip,
        user_agent: request.headers.get('user-agent') || 'unknown'
      }).catch(error => {
        // Log but don't fail the request
        console.error('Failed to log signup:', error);
      });

      return redirect('/dashboard', { headers });
    }
  } catch (error) {
    console.error(`Unexpected error during ${action}:`, error);
    return json(
      { error: 'An unexpected error occurred. Please try again.' },
      { status: 500, headers }
    );
  }
}