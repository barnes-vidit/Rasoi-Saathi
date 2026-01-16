import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Languages, ArrowRight } from "lucide-react";
import vendorIcon from "@/assets/vendor-icon.jpg";

interface LanguagePickerProps {
  onLanguageSelect: (language: 'hi' | 'en') => void;
}

export const LanguagePicker = ({ onLanguageSelect }: LanguagePickerProps) => {
  return (
    <div className="min-h-screen bg-gradient-fresh flex flex-col items-center justify-center p-4">
      {/* Logo and Brand */}
      <div className="text-center mb-8">
        <div className="w-24 h-24 mx-auto mb-4 rounded-full overflow-hidden shadow-floating">
          <img 
            src={vendorIcon} 
            alt="RasoiLink" 
            className="w-full h-full object-cover"
          />
        </div>
        <h1 className="text-3xl font-bold text-foreground mb-2">
          RasoiLink
        </h1>
        <p className="text-muted-foreground text-lg">
          मिलकर खरीदें, सस्ता पाएं
        </p>
        <p className="text-muted-foreground">
          Buy Together, Save More
        </p>
      </div>

      {/* Language Selection */}
      <Card className="w-full max-w-md p-6 shadow-card">
        <div className="flex items-center justify-center mb-6">
          <Languages className="w-8 h-8 text-primary mr-3" />
          <h2 className="text-xl font-semibold">Choose Language / भाषा चुनें</h2>
        </div>
        
        <div className="space-y-4">
          <Button 
            variant="mobile"
            size="mobile"
            className="w-full justify-between"
            onClick={() => onLanguageSelect('hi')}
          >
            <span className="text-xl">हिंदी</span>
            <ArrowRight className="w-6 h-6" />
          </Button>
          
          <Button 
            variant="outline"
            size="mobile"
            className="w-full justify-between"
            onClick={() => onLanguageSelect('en')}
          >
            <span className="text-xl">English</span>
            <ArrowRight className="w-6 h-6" />
          </Button>
        </div>
      </Card>

      <p className="text-center text-muted-foreground mt-6 text-sm">
        Street vendors के लिए बनाया गया • Made for Street Vendors
      </p>
    </div>
  );
};