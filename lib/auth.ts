import { supabase } from './supabase';

export const authService = {
  async signup(email: string, password: string) {
    if (!supabase) {
      throw new Error('Supabase not configured. Please set NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_ANON_KEY in .env.local');
    }
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        emailRedirectTo: `${process.env.NEXT_PUBLIC_APP_URL}/auth/callback`,
      },
    });

    if (error) throw new Error(error.message);
    return data;
  },

  async login(email: string, password: string) {
    if (!supabase) {
      throw new Error('Supabase not configured. Please set NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_ANON_KEY in .env.local');
    }
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (error) throw new Error(error.message);
    return data;
  },

  async logout() {
    if (!supabase) {
      throw new Error('Supabase not configured');
    }
    const { error } = await supabase.auth.signOut();
    if (error) throw new Error(error.message);
  },

  async getCurrentUser() {
    if (!supabase) {
      return null;
    }
    const { data, error } = await supabase.auth.getUser();
    if (error) return null;
    return data.user;
  },

  async getSession() {
    if (!supabase) {
      return null;
    }
    const { data, error } = await supabase.auth.getSession();
    if (error) return null;
    return data.session;
  },

  onAuthStateChange(callback: (authenticated: boolean, user: any) => void) {
    if (!supabase) {
      callback(false, null);
      return { data: { subscription: null } };
    }
    return supabase.auth.onAuthStateChange((event: any, session: any) => {
      callback(!!session, session?.user);
    });
  },
};
