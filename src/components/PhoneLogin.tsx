import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { ArrowLeft, Phone, Shield, CheckCircle } from "lucide-react";

interface PhoneLoginProps {
  language: 'hi' | 'en';
  onBack: () => void;
  onSuccess: () => void;
  userType: 'vendor' | 'supplier';
  onUserTypeChange: (type: 'vendor' | 'supplier') => void;
}

export const PhoneLogin = ({ 
  language, 
  onBack, 
  onSuccess, 
  userType, 
  onUserTypeChange 
}: PhoneLoginProps) => {
  const [step, setStep] = useState<'phone' | 'otp'>('phone');
  const [phone, setPhone] = useState('');
  const [otp, setOtp] = useState('');

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
      userType: "आप कौन हैं?"
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
      userType: "Who are you?"
    }
  };

  const t = text[language];

  const handleSendOtp = () => {
    if (phone.length >= 10) {
      setStep('otp');
    }
  };

  const handleVerifyOtp = () => {
    if (otp.length === 6) {
      onSuccess();
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
            {step === 'phone' ? t.title : t.otpTitle}
          </h1>
          <p className="text-muted-foreground">
            {step === 'phone' ? t.subtitle : t.otpSubtitle}
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
              
              <div className="text-center">
                <Phone className="w-16 h-16 text-primary mx-auto mb-4 p-3 bg-primary-soft rounded-full" />
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
                disabled={phone.length < 10}
              >
                {t.sendOtp}
              </Button>

              <div className="flex items-center justify-center text-sm text-muted-foreground">
                <Shield className="w-4 h-4 mr-2" />
                {t.secure}
              </div>
            </div>
          ) : (
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
                  type="number"
                  placeholder="123456"
                  value={otp}
                  onChange={(e) => setOtp(e.target.value)}
                  className="h-14 text-lg text-center tracking-widest"
                  maxLength={6}
                />
              </div>

              <Button 
                variant="mobile"
                size="mobile"
                className="w-full"
                onClick={handleVerifyOtp}
                disabled={otp.length !== 6}
              >
                {t.verify}
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
          )}
        </Card>
      </div>
    </div>
  );
};