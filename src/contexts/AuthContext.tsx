import React, { createContext, useContext, useEffect, useState, useRef } from 'react';
import { User, Session } from '@supabase/supabase-js';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

interface AuthContextType {
  user: User | null;
  session: Session | null;
  profile: any | null;
  loading: boolean;
  profileError: Error | null;
  login: (email: string, password: string) => Promise<boolean>;
  signup: (email: string, password: string, userData: any) => Promise<boolean>;
  logout: () => Promise<void>;
  updateProfile: (updates: any) => Promise<boolean>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [profile, setProfile] = useState<any | null>(null);
  const [loading, setLoading] = useState(true);
  const [profileError, setProfileError] = useState<Error | null>(null);
  const { toast } = useToast();
  const initializedRef = useRef(false);
  const profileFetchingRef = useRef(false);

  const fetchUserProfile = async (userId: string) => {
    // Prevent multiple simultaneous profile fetches
    if (profileFetchingRef.current) {
      console.log('Profile fetch already in progress, skipping...');
      return;
    }

    try {
      profileFetchingRef.current = true;
      setProfileError(null);
      console.log('Fetching profile for user:', userId);
      
      const { data, error } = await supabase
        .from('profiles')
        .select(`
          *,
          isp_companies (
            id,
            name,
            license_type,
            client_limit,
            is_active,
            deactivation_reason,
            deactivated_at
          )
        `)
        .eq('id', userId)
        .single();

      if (error) {
        console.error('Error fetching profile:', error);
        setProfileError(new Error(error.message));
        return;
      }

      console.log('Profile fetched successfully:', data);
      setProfile(data);
    } catch (error) {
      console.error('Error in fetchUserProfile:', error);
      setProfileError(error instanceof Error ? error : new Error('Unknown error'));
    } finally {
      profileFetchingRef.current = false;
    }
  };

  useEffect(() => {
    // Prevent double initialization
    if (initializedRef.current) return;
    initializedRef.current = true;

    let mounted = true;

    const initAuth = async () => {
      try {
        const { data: { subscription } } = supabase.auth.onAuthStateChange(
          (event, session) => {
            console.log('Auth state changed:', event, session?.user?.id);
            
            if (!mounted) return;
            
            // Handle different auth events appropriately
            if (event === 'INITIAL_SESSION') {
              setSession(session);
              setUser(session?.user ?? null);
              
              if (session?.user) {
                setTimeout(() => {
                  if (mounted) {
                    fetchUserProfile(session.user.id);
                  }
                }, 0);
              } else {
                setProfile(null);
                setProfileError(null);
              }
              
              if (mounted) {
                setLoading(false);
              }
            } else if (event === 'SIGNED_IN') {
              setSession(session);
              setUser(session?.user ?? null);
              
              if (session?.user) {
                setTimeout(() => {
                  if (mounted) {
                    fetchUserProfile(session.user.id);
                  }
                }, 0);
              }
            } else if (event === 'SIGNED_OUT') {
              setSession(null);
              setUser(null);
              setProfile(null);
              setProfileError(null);
            }
          }
        );

        const { data: { session: initialSession } } = await supabase.auth.getSession();
        console.log('Initial session:', initialSession?.user?.id);
        
        if (mounted) {
          setSession(initialSession);
          setUser(initialSession?.user ?? null);
          
          if (initialSession?.user) {
            await fetchUserProfile(initialSession.user.id);
          }
          
          setLoading(false);
        }

        return () => {
          subscription.unsubscribe();
        };
      } catch (error) {
        console.error('Error initializing auth:', error);
        if (mounted) {
          setLoading(false);
        }
      }
    };

    initAuth();

    return () => {
      mounted = false;
    };
  }, []);

  const login = async (email: string, password: string): Promise<boolean> => {
    try {
      setLoading(true);
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (error) {
        console.error('Login error:', error);
        toast({
          title: "Login Failed",
          description: error.message,
          variant: "destructive",
        });
        return false;
      }

      console.log('Login successful:', data.user?.id);
      toast({
        title: "Login Successful",
        description: "Welcome back!",
      });
      
      // The auth state change will handle the redirect via AppContent
      return true;
    } catch (error) {
      console.error('Login error:', error);
      toast({
        title: "Login Failed",
        description: "An unexpected error occurred",
        variant: "destructive",
      });
      return false;
    } finally {
      setLoading(false);
    }
  };

  const signup = async (email: string, password: string, userData: any): Promise<boolean> => {
    try {
      setLoading(true);
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: userData,
          emailRedirectTo: `${window.location.origin}/`,
        },
      });

      if (error) {
        console.error('Signup error:', error);
        toast({
          title: "Signup Failed",
          description: error.message,
          variant: "destructive",
        });
        return false;
      }

      console.log('Signup successful:', data.user?.id);
      toast({
        title: "Signup Successful",
        description: "Please check your email to verify your account",
      });
      return true;
    } catch (error) {
      console.error('Signup error:', error);
      toast({
        title: "Signup Failed",
        description: "An unexpected error occurred",
        variant: "destructive",
      });
      return false;
    } finally {
      setLoading(false);
    }
  };

  const logout = async (): Promise<void> => {
    try {
      const { error } = await supabase.auth.signOut();
      if (error) {
        console.error('Logout error:', error);
        toast({
          title: "Logout Failed",
          description: error.message,
          variant: "destructive",
        });
      } else {
        setUser(null);
        setSession(null);
        setProfile(null);
        setProfileError(null);
        toast({
          title: "Logged Out",
          description: "You have been logged out successfully",
        });
      }
    } catch (error) {
      console.error('Logout error:', error);
      toast({
        title: "Logout Failed",
        description: "An unexpected error occurred",
        variant: "destructive",
      });
    }
  };

  const updateProfile = async (updates: any): Promise<boolean> => {
    try {
      if (!user) return false;

      const { error } = await supabase
        .from('profiles')
        .update(updates)
        .eq('id', user.id);

      if (error) {
        console.error('Profile update error:', error);
        toast({
          title: "Update Failed",
          description: error.message,
          variant: "destructive",
        });
        return false;
      }

      // Refresh profile data
      await fetchUserProfile(user.id);
      toast({
        title: "Profile Updated",
        description: "Your profile has been updated successfully",
      });
      return true;
    } catch (error) {
      console.error('Profile update error:', error);
      toast({
        title: "Update Failed",
        description: "An unexpected error occurred",
        variant: "destructive",
      });
      return false;
    }
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        session,
        profile,
        loading,
        profileError,
        login,
        signup,
        logout,
        updateProfile,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
