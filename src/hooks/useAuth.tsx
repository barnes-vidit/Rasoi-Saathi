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
    // Set up auth state listener
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        setSession(session);
        setUser(session?.user ?? null);
        
        if (session?.user) {
          // Fetch user profile to determine type
          setTimeout(async () => {
            await fetchUserProfile(session.user.id);
          }, 0);
        } else {
          setUserProfile(null);
          setUserType(null);
        }
        setLoading(false);
      }
    );

    // Get initial session
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      setUser(session?.user ?? null);
      if (session?.user) {
        fetchUserProfile(session.user.id);
      }
      setLoading(false);
    });

    return () => subscription.unsubscribe();
  }, []);

  const fetchUserProfile = async (userId: string) => {
    try {
      // Check if user is a vendor
      const { data: vendorData } = await supabase
        .from('vendors')
        .select('*')
        .eq('user_id', userId)
        .single();

      if (vendorData) {
        setUserProfile(vendorData);
        setUserType('vendor');
        return;
      }

      // Check if user is a supplier
      const { data: supplierData } = await supabase
        .from('suppliers')
        .select('*')
        .eq('user_id', userId)
        .single();

      if (supplierData) {
        setUserProfile(supplierData);
        setUserType('supplier');
        return;
      }

      // No profile found
      setUserProfile(null);
      setUserType(null);
    } catch (error) {
      console.error('Error fetching user profile:', error);
    }
  };

  const signInWithPhone = async (phone: string) => {
    try {
      const { error } = await supabase.auth.signInWithOtp({
        phone: phone.startsWith('+91') ? phone : `+91${phone}`,
        options: {
          shouldCreateUser: true,
        }
      });

      if (error) {
        toast({
          title: "Error",
          description: error.message,
          variant: "destructive",
        });
      }

      return { error };
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
      return { error };
    }
  };

  const verifyOtp = async (phone: string, otp: string) => {
    try {
      const { error } = await supabase.auth.verifyOtp({
        phone: phone.startsWith('+91') ? phone : `+91${phone}`,
        token: otp,
        type: 'sms'
      });

      if (error) {
        toast({
          title: "Error",
          description: error.message,
          variant: "destructive",
        });
      } else {
        toast({
          title: "Success",
          description: "Login successful!",
        });
      }

      return { error };
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
      return { error };
    }
  };

  const createUserProfile = async (data: any) => {
    if (!user) return { error: { message: 'No user found' } };

    try {
      const profileData = {
        user_id: user.id,
        name: data.name,
        phone: data.phone,
        ...data
      };

      let error;
      if (data.type === 'vendor') {
        const { error: vendorError } = await supabase
          .from('vendors')
          .insert([{
            user_id: user.id,
            name: data.name,
            phone: data.phone,
            zone: data.zone,
            language: data.language || 'hi'
          }]);
        error = vendorError;
      } else {
        const { error: supplierError } = await supabase
          .from('suppliers')
          .insert([{
            user_id: user.id,
            name: data.name,
            phone: data.phone,
            delivery_zones: data.delivery_zones || []
          }]);
        error = supplierError;
      }

      if (!error) {
        await fetchUserProfile(user.id);
        toast({
          title: "Success",
          description: "Profile created successfully!",
        });
      } else {
        toast({
          title: "Error",
          description: error.message,
          variant: "destructive",
        });
      }

      return { error };
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
      return { error };
    }
  };

  const signOut = async () => {
    await supabase.auth.signOut();
    toast({
      title: "Signed out",
      description: "You have been signed out successfully.",
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