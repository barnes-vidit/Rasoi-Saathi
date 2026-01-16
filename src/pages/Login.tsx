import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { ArrowLeft, Phone, Shield, CheckCircle } from "lucide-react";
import { useAuth } from "@/hooks/useAuth";
import { useToast } from "@/hooks/use-toast";
import { useNavigate } from "react-router-dom";
import { useOrder } from "@/context/OrderContext";
import { supabase } from "@/integrations/supabase/client";

export const PhoneLoginIntegrated = () => {
  const { toast } = useToast();
  const navigate = useNavigate();
  const { language } = useOrder();

  const [step, setStep] = useState<'phone' | 'otp' | 'profile'>('phone');
  const [phone, setPhone] = useState('');
  const [otp, setOtp] = useState('');
  const [userType, setUserType] = useState<'vendor' | 'supplier'>('vendor');
  const [profileData, setProfileData] = useState({
    name: '',
    zone: '',
    delivery_zones: [] as string[]
  });
  const [loading, setLoading] = useState(false);
  const [zones, setZones] = useState<string[]>([]);

  const { signInWithPhone, verifyOtp, createUserProfile } = useAuth();

  useEffect(() => {
    const fetchZones = async () => {
      try {
        const { data, error } = await supabase
          .from('zones' as any)
          .select('name')
          .order('name');

        if (error) {
          console.error('Error fetching zones:', error);
          // Fallback if table doesn't exist or DB issue
          setZones([
            'Lajpat Nagar', 'Karol Bagh', 'Chandni Chowk',
            'Connaught Place', 'Paharganj', 'Sarojini Nagar'
          ]);
        } else {
          setZones((data as any[]).map(z => z.name));
        }
      } catch (err) {
        console.error('Failed to fetch zones:', err);
        setZones([
          'Lajpat Nagar', 'Karol Bagh', 'Chandni Chowk',
          'Connaught Place', 'Paharganj', 'Sarojini Nagar'
        ]);
      }
    };

    fetchZones();
  }, []);

  const text = {
    hi: {
      title: "अपना नंबर डालें",
      subtitle: "आपको OTP भेजा जाएगा",
      phonePlaceholder: "मोबाइल नंबर",
      sendOtp: "OTP भेजें",
      otpTitle: "OTP डालें",
      otpSubtitle: "आपके नंबर पर भेजा गया OTP डालें",
      otpPlaceholder: "6 अंकों का OTP",
      verify: "वेरीफाई करें",
      resend: "दोबारा भेजें",
      secure: "आपका डेटा सुरक्षित है",
      vendor: "दुकानदार",
      supplier: "आपूर्तिकर्ता",
      userType: "आप कौन हैं?",
      profileTitle: "प्रोफाइल बनाएं",
      name: "नाम",
      zone: "क्षेत्र",
      createProfile: "प्रोफाइल बनाएं"
    },
    en: {
      title: "Enter Your Phone",
      subtitle: "We'll send you an OTP",
      phonePlaceholder: "Mobile Number",
      sendOtp: "Send OTP",
      otpTitle: "Enter OTP",
      otpSubtitle: "Enter the OTP sent to your number",
      otpPlaceholder: "6-digit OTP",
      verify: "Verify",
      resend: "Resend",
      secure: "Your data is secure",
      vendor: "Vendor",
      supplier: "Supplier",
      userType: "Who are you?",
      profileTitle: "Create Profile",
      name: "Name",
      zone: "Zone",
      createProfile: "Create Profile"
    }
  };

  const t = text[language];

  const handleSendOtp = async () => {
    // Validate phone number format
    const phoneRegex = /^(\+91|91)?[6-9][0-9]{9}$/;
    const cleanPhone = phone.replace(/\s+/g, '');
    if (!phoneRegex.test(cleanPhone)) {
      toast({
        title: "Invalid Phone Number",
        description: language === 'hi' ? "कृपया एक वैध भारतीय फोन नंबर दर्ज करें" : "Please enter a valid Indian phone number",
        variant: "destructive",
      });
      return;
    }

    setLoading(true);
    try {
      const { error } = await signInWithPhone(cleanPhone);
      if (!error) {
        setStep('otp');
        toast({
          title: language === 'hi' ? "OTP भेजा गया" : "OTP Sent",
          description: language === 'hi' ? "कृपया अपने फोन पर OTP की जाँच करें" : "Please check your phone for OTP",
        });
      } else {
        toast({
          title: language === 'hi' ? "त्रुटि" : "Error",
          description: language === 'hi' ? "OTP भेजने में विफल। कृपया पुनः प्रयास करें।" : "Failed to send OTP. Please try again.",
          variant: "destructive",
        });
      }
    } catch (err) {
      toast({
        title: language === 'hi' ? "नेटवर्क त्रुटि" : "Network Error",
        description: language === 'hi' ? "कृपया अपने कनेक्शन की जाँच करें" : "Please check your connection",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleVerifyOtp = async () => {
    if (!/^\d{6}$/.test(otp)) {
      toast({
        title: language === 'hi' ? "अमान्य OTP" : "Invalid OTP",
        description: language === 'hi' ? "कृपया 6 अंकों का सही OTP दर्ज करें" : "Please enter a valid 6-digit OTP",
        variant: "destructive",
      });
      return;
    }

    if (!loading) {
      setLoading(true);
      try {
        const { error } = await verifyOtp(phone, otp);
        if (!error) {
          setStep('profile');
          toast({
            title: language === 'hi' ? "सत्यापित" : "Verified",
            description: language === 'hi' ? "OTP सत्यापन सफल" : "OTP verification successful",
          });
        }
      } catch (err: any) {
        toast({
          title: language === 'hi' ? "त्रुटि" : "Error",
          description: err.message,
          variant: "destructive",
        });
      } finally {
        setLoading(false);
      }
    }
  };

  const handleCreateProfile = async () => {
    if (profileData.name && (userType === 'supplier' || profileData.zone)) {
      setLoading(true);
      try {
        const { error } = await createUserProfile({
          type: userType,
          phone,
          ...profileData,
          delivery_zones: userType === 'supplier' ? zones : []
        });

        if (error) {
          throw error;
        }

        toast({
          title: language === 'hi' ? "सफलता" : "Success",
          description: language === 'hi' ? "आपकी प्रोफ़ाइल बन गई है" : "Your profile has been created successfully",
        });

        await new Promise(resolve => setTimeout(resolve, 1000));

        // Navigate based on user type
        if (userType === 'supplier') {
          navigate('/supplier/dashboard');
        } else {
          navigate('/zone-select');
        }
      } catch (err: any) {
        toast({
          title: language === 'hi' ? "त्रुटि" : "Error",
          description: err.message,
          variant: "destructive",
        });
      } finally {
        setLoading(false);
      }
    }
  };

  return (
    <div className="min-h-screen bg-gradient-fresh flex flex-col p-4 relative">
      {loading && (
        <div className="absolute inset-0 bg-black bg-opacity-30 flex items-center justify-center z-50">
          <svg className="animate-spin h-10 w-10 text-primary" viewBox="0 0 24 24">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z" />
          </svg>
        </div>
      )}
      {/* Header */}
      <div className="flex items-center mb-8 mt-4">
        <Button
          variant="ghost"
          size="icon-lg"
          onClick={() => navigate('/')}
          className="mr-4"
        >
          <ArrowLeft className="w-6 h-6" />
        </Button>
        <div className="flex-1">
          <div className="text-lg font-bold text-primary mb-1">RasoiLink</div>
          <h1 className="text-2xl font-bold text-foreground">
            {step === 'phone' ? t.title : step === 'otp' ? t.otpTitle : t.profileTitle}
          </h1>
          <p className="text-muted-foreground">
            {step === 'phone' ? t.subtitle : step === 'otp' ? t.otpSubtitle : 'Complete your profile'}
          </p>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 flex items-center justify-center">
        <Card className="w-full max-w-md p-6 shadow-card">
          {step === 'phone' ? (
            <div className="space-y-6">
              {/* User Type Selection */}
              <div className="space-y-3">
                <Label className="text-base font-medium">{t.userType}</Label>
                <div className="grid grid-cols-2 gap-3">
                  <Button
                    variant={userType === 'vendor' ? 'default' : 'outline'}
                    size="mobile"
                    onClick={() => setUserType('vendor')}
                  >
                    {t.vendor}
                  </Button>
                  <Button
                    variant={userType === 'supplier' ? 'default' : 'outline'}
                    size="mobile"
                    onClick={() => setUserType('supplier')}
                  >
                    {t.supplier}
                  </Button>
                </div>
              </div>

              <div className="text-center mb-2">
                <Phone className="w-12 h-12 text-primary mx-auto p-2 bg-primary-soft rounded-full" />
              </div>

              <div className="space-y-2">
                <Label htmlFor="phone" className="text-lg font-medium">
                  {t.phonePlaceholder}
                </Label>
                <Input
                  id="phone"
                  type="tel"
                  placeholder="+91 98765 43210"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  className="h-14 text-lg text-center"
                  maxLength={10}
                />
              </div>

              <Button
                variant="mobile"
                className="w-full mt-4"
                onClick={handleSendOtp}
                disabled={loading || phone.length < 10}
              >
                {loading ? (
                  <span className="flex items-center justify-center"><span className="animate-spin mr-2">⏳</span>Sending...</span>
                ) : t.sendOtp}
              </Button>

              <div className="bg-secondary/20 p-3 rounded-lg text-sm text-center space-y-1">
                <p className="font-semibold text-primary">Demo Access</p>
                <p>Phone: 9999999999</p>
                <p>OTP: 123456</p>
              </div>

              <div className="flex items-center justify-center text-sm text-muted-foreground">
                <Shield className="w-4 h-4 mr-2" />
                {t.secure}
              </div>
            </div>
          ) : step === 'otp' ? (
            <div className="space-y-6">
              <div className="text-center">
                <CheckCircle className="w-16 h-16 text-success mx-auto mb-4 p-3 bg-success/10 rounded-full" />
                <p className="text-muted-foreground">
                  OTP sent to +91 {phone}
                </p>
              </div>

              <div className="space-y-2">
                <Label htmlFor="otp" className="text-lg font-medium">
                  {t.otpPlaceholder}
                </Label>
                <Input
                  id="otp"
                  type="text"
                  inputMode="numeric"
                  pattern="[0-9]*"
                  placeholder="123456"
                  value={otp}
                  onChange={(e) => {
                    const value = e.target.value.replace(/\D/g, '');
                    if (value.length <= 6) {
                      setOtp(value);
                    }
                  }}
                  className="h-14 text-lg text-center tracking-widest"
                  maxLength={6}
                />
              </div>

              <Button
                variant="mobile"
                className="w-full mt-4"
                onClick={handleVerifyOtp}
                disabled={loading || otp.length !== 6}
              >
                {loading ? (
                  <span className="flex items-center justify-center"><span className="animate-spin mr-2">⏳</span>Verifying...</span>
                ) : t.verify}
              </Button>

              <div className="text-center text-sm text-muted-foreground">
                Demo OTP: <b>123456</b>
              </div>

              <Button
                variant="ghost"
                size="mobile"
                className="w-full"
                onClick={() => setStep('phone')}
              >
                {t.resend}
              </Button>
            </div>
          ) : (
            <div className="space-y-6">
              <div className="space-y-2">
                <Label htmlFor="name" className="text-lg font-medium">
                  {t.name}
                </Label>
                <Input
                  id="name"
                  type="text"
                  placeholder="Enter your name"
                  value={profileData.name}
                  onChange={(e) => setProfileData(prev => ({ ...prev, name: e.target.value }))}
                  className="h-14 text-lg"
                />
              </div>

              {userType === 'vendor' && (
                <div className="space-y-2">
                  <Label className="text-lg font-medium">{t.zone}</Label>
                  <div className="grid grid-cols-2 gap-2">
                    {zones.map((zone) => (
                      <Button
                        key={zone}
                        variant={profileData.zone === zone ? 'default' : 'outline'}
                        size="sm"
                        onClick={() => setProfileData(prev => ({ ...prev, zone }))}
                      >
                        {zone}
                      </Button>
                    ))}
                  </div>
                </div>
              )}

              <Button
                variant="mobile"
                className="w-full mt-4"
                onClick={handleCreateProfile}
                disabled={loading || !profileData.name || (userType === 'vendor' && !profileData.zone)}
              >
                {loading ? (
                  <span className="flex items-center justify-center"><span className="animate-spin mr-2">⏳</span>Saving...</span>
                ) : t.createProfile}
              </Button>
            </div>
          )}
        </Card>
      </div>
    </div>
  );
};