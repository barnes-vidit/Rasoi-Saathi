import { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import { User, Session } from '@supabase/supabase-js';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

interface AuthContextType {
  user: User | null;
  session: Session | null;
  userProfile: any | null;
  userType: 'vendor' | 'supplier' | null;
  loading: boolean;
  signInWithPhone: (phone: string) => Promise<{ error: any }>;
  verifyOtp: (phone: string, otp: string) => Promise<{ error: any }>;
  signOut: () => Promise<void>;
  createUserProfile: (data: any) => Promise<{ error: any }>;
  updateVendorZone: (zone: string) => Promise<{ error: any }>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [userProfile, setUserProfile] = useState<any | null>(null);
  const [userType, setUserType] = useState<'vendor' | 'supplier' | null>(null);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  useEffect(() => {
    // Check for persisted demo session
    const storedUser = localStorage.getItem('demo_user');
    const storedProfile = localStorage.getItem('demo_profile');

    if (storedUser) {
      const parsedUser = JSON.parse(storedUser);
      setUser(parsedUser);
      setSession({
        access_token: 'demo-token',
        refresh_token: 'demo-refresh-token',
        expires_in: 3600,
        token_type: 'bearer',
        user: parsedUser
      } as Session);

      if (storedProfile) {
        const parsedProfile = JSON.parse(storedProfile);
        setUserProfile(parsedProfile);
        // Infer type based on profile fields
        setUserType(parsedProfile.delivery_zones ? 'supplier' : 'vendor');
      }
    }
    setLoading(false);
  }, []);

  const signInWithPhone = async (phone: string) => {
    // Simulate API delay
    await new Promise(resolve => setTimeout(resolve, 800));
    return { error: null };
  };

  const verifyOtp = async (phone: string, otp: string) => {
    await new Promise(resolve => setTimeout(resolve, 800));

    // Create a stable deterministic ID for the demo user
    // Using a valid UUID format
    const demoId = '00000000-0000-0000-0000-000000000000';

    const demoUser = {
      id: demoId,
      email: 'demo@rasoisaathi.com',
      phone: phone.startsWith('+91') ? phone : `+91${phone}`,
      aud: 'authenticated',
      role: 'authenticated',
      created_at: new Date().toISOString(),
      app_metadata: { provider: 'phone' },
      user_metadata: {},
      identities: [],
      updated_at: new Date().toISOString(),
    } as User;

    const demoSession = {
      access_token: 'demo-token',
      refresh_token: 'demo-refresh-token',
      expires_in: 3600,
      token_type: 'bearer',
      user: demoUser
    } as Session;

    setSession(demoSession);
    setUser(demoUser);

    localStorage.setItem('demo_user', JSON.stringify(demoUser));

    toast({
      title: "Success",
      description: "Demo Login successful!",
    });

    return { error: null };
  };

  const createUserProfile = async (data: any) => {
    if (!user) return { error: { message: 'No user found' } };

    await new Promise(resolve => setTimeout(resolve, 800));

    try {
      const profileData = {
        user_id: user.id,
        name: data.name,
        phone: data.phone,
        ...data
      };

      // Try to save to Supabase "publicly" (requires RLS to be disabled/open)
      // If it fails, we fall back to local storage so the demo never breaks
      let dbError = null;

      try {
        if (data.type === 'vendor') {
          const { error } = await supabase
            .from('vendors')
            .upsert({
              user_id: user.id,
              name: data.name,
              phone: data.phone,
              zone: data.zone,
              language: data.language || 'hi'
            }, { onConflict: 'user_id' });
          dbError = error;
        } else {
          const { error } = await supabase
            .from('suppliers')
            .upsert({
              user_id: user.id,
              name: data.name,
              phone: data.phone,
              delivery_zones: data.delivery_zones || []
            }, { onConflict: 'user_id' });
          dbError = error;
        }
      } catch (err) {
        console.warn("Backend save failed, continuing with local state", err);
      }

      if (dbError) {
        console.warn("Backend save failed (likely RLS), continuing with local state", dbError);
        // Do not throw here, let the demo proceed
      }

      setUserProfile(profileData);
      setUserType(data.type);
      localStorage.setItem('demo_profile', JSON.stringify(profileData));

      toast({
        title: "Success",
        description: "Profile created (Demo Mode)",
      });

      return { error: null };
    } catch (error: any) {
      console.error(error);
      return { error };
    }
  };

  const updateVendorZone = async (zone: string) => {
    if (!userProfile) return { error: { message: 'No profile' } };

    const updatedProfile = { ...userProfile, zone };
    setUserProfile(updatedProfile);
    localStorage.setItem('demo_profile', JSON.stringify(updatedProfile));

    // Try to update DB best-effort
    try {
      if (user) {
        await supabase.from('vendors').update({ zone }).eq('user_id', user.id);
      }
    } catch (e) { /* ignore */ }

    return { error: null };
  };

  const signOut = async () => {
    setUser(null);
    setSession(null);
    setUserProfile(null);
    setUserType(null);
    localStorage.removeItem('demo_user');
    localStorage.removeItem('demo_profile');
    localStorage.removeItem('vendorZone');

    toast({
      title: "Signed out",
      description: "Demo session ended.",
    });
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        session,
        userProfile,
        userType,
        loading,
        signInWithPhone,
        verifyOtp,
        signOut,
        createUserProfile,
        updateVendorZone,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};