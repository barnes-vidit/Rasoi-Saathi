import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { ArrowLeft, Phone, Shield, CheckCircle } from "lucide-react";
import { useAuth } from "@/hooks/useAuth";

interface PhoneLoginIntegratedProps {
  language: 'hi' | 'en';
  onBack: () => void;
  onSuccess: () => void;
  userType: 'vendor' | 'supplier';
  onUserTypeChange: (type: 'vendor' | 'supplier') => void;
}

export const PhoneLoginIntegrated = ({ 
  language, 
  onBack, 
  onSuccess, 
  userType, 
  onUserTypeChange 
}: PhoneLoginIntegratedProps) => {
  const [step, setStep] = useState<'phone' | 'otp' | 'profile'>('phone');
  const [phone, setPhone] = useState('');
  const [otp, setOtp] = useState('');
  const [profileData, setProfileData] = useState({
    name: '',
    zone: '',
    delivery_zones: [] as string[]
  });
  const [loading, setLoading] = useState(false);

  const { signInWithPhone, verifyOtp, createUserProfile } = useAuth();

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

  const zones = [
    'Lajpat Nagar',
    'Karol Bagh',
    'Chandni Chowk',
    'Connaught Place',
    'Paharganj',
    'Sarojini Nagar'
  ];

  const handleSendOtp = async () => {
    if (phone.length >= 10) {
      setLoading(true);
      const { error } = await signInWithPhone(phone);
      setLoading(false);
      if (!error) {
        setStep('otp');
      }
    }
  };

  const handleVerifyOtp = async () => {
    if (otp.length === 6 && !loading) {
      setLoading(true);
      try {
        const { error } = await verifyOtp(phone, otp);
        if (!error) {
          setStep('profile');
        } else {
          console.error('OTP verification error:', error);
        }
      } catch (err) {
        console.error('OTP verification failed:', err);
      } finally {
        setLoading(false);
      }
    }
  };

  const handleCreateProfile = async () => {
    if (profileData.name && (userType === 'supplier' || profileData.zone)) {
      setLoading(true);
      const { error } = await createUserProfile({
        type: userType,
        phone,
        ...profileData,
        delivery_zones: userType === 'supplier' ? zones : []
      });
      setLoading(false);
      if (!error) {
        onSuccess();
      }
    }
  };

  return (
    <div className="min-h-screen bg-gradient-fresh flex flex-col p-4">
      {/* Header */}
      <div className="flex items-center mb-8 mt-4">
        <Button 
          variant="ghost" 
          size="icon-lg"
          onClick={onBack}
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
                    onClick={() => onUserTypeChange('vendor')}
                  >
                    {t.vendor}
                  </Button>
                  <Button
                    variant={userType === 'supplier' ? 'default' : 'outline'}
                    size="mobile"
                    onClick={() => onUserTypeChange('supplier')}
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
                size="mobile"
                className="w-full"
                onClick={handleSendOtp}
                disabled={phone.length < 10 || loading}
              >
                {loading ? "Sending..." : t.sendOtp}
              </Button>

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
                size="mobile"
                className="w-full"
                onClick={handleVerifyOtp}
                disabled={otp.length !== 6 || loading}
              >
                {loading ? "Verifying..." : t.verify}
              </Button>

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
                size="mobile"
                className="w-full"
                onClick={handleCreateProfile}
                disabled={!profileData.name || (userType === 'vendor' && !profileData.zone) || loading}
              >
                {loading ? "Creating..." : t.createProfile}
              </Button>
            </div>
          )}
        </Card>
      </div>
    </div>
  );
};