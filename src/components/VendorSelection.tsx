import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ArrowLeft, MapPin, Star, Truck, Clock } from "lucide-react";
import vendorIcon from "@/assets/vendor-icon.jpg";

interface Vendor {
  id: string;
  name: string;
  location: string;
  rating: number;
  deliveryTime: string;
  category: string;
  specialties: string[];
}

interface VendorSelectionProps {
  language: 'hi' | 'en';
  onBack: () => void;
  onVendorSelect: (vendorId: string) => void;
}

export const VendorSelection = ({ language, onBack, onVendorSelect }: VendorSelectionProps) => {
  const [selectedVendor, setSelectedVendor] = useState<string | null>(null);

  const text = {
    hi: {
      title: "होलसेल वेंडर चुनें",
      subtitle: "अपने एरिया के बेस्ट वेंडर से खरीदें",
      selectVendor: "वेंडर चुनें",
      rating: "रेटिंग",
      deliveryTime: "डिलीवरी टाइम",
      specialties: "स्पेशैलिटी",
      continue: "आगे बढ़ें",
      vegetables: "सब्जियां",
      grains: "अनाज",
      spices: "मसाले",
      oil: "तेल"
    },
    en: {
      title: "Choose Wholesale Vendor",
      subtitle: "Buy from the best vendors in your area",
      selectVendor: "Select Vendor",
      rating: "Rating",
      deliveryTime: "Delivery",
      specialties: "Specialties",
      continue: "Continue",
      vegetables: "Vegetables",
      grains: "Grains", 
      spices: "Spices",
      oil: "Oil"
    }
  };

  const t = text[language];

  const mockVendors: Vendor[] = [
    {
      id: '1',
      name: 'मोहन सब्जी भंडार',
      location: 'चांदनी चौक',
      rating: 4.8,
      deliveryTime: '2-3 घंटे',
      category: 'vegetables',
      specialties: ['आलू', 'प्याज', 'टमाटर', 'हरी सब्जी']
    },
    {
      id: '2', 
      name: 'गुप्ता होलसेल मार्केट',
      location: 'करोल बाग',
      rating: 4.6,
      deliveryTime: '1-2 घंटे',
      category: 'grains',
      specialties: ['चावल', 'दाल', 'आटा', 'तेल']
    },
    {
      id: '3',
      name: 'शर्मा किराना स्टोर', 
      location: 'लाजपत नगर',
      rating: 4.7,
      deliveryTime: '3-4 घंटे',
      category: 'spices',
      specialties: ['मसाले', 'तेल', 'चावल', 'दाल']
    },
    {
      id: '4',
      name: 'राज वेजिटेबल मार्केट',
      location: 'गाजीपुर मंडी',
      rating: 4.9,
      deliveryTime: '2-3 घंटे', 
      category: 'vegetables',
      specialties: ['ताजी सब्जी', 'फल', 'आलू', 'प्याज']
    }
  ];

  const handleVendorSelect = (vendorId: string) => {
    setSelectedVendor(vendorId);
  };

  const handleContinue = () => {
    if (selectedVendor) {
      onVendorSelect(selectedVendor);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-fresh">
      {/* Header */}
      <div className="bg-white shadow-card p-4">
        <div className="flex items-center mb-4">
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
              {t.title}
            </h1>
            <p className="text-muted-foreground">
              {t.subtitle}
            </p>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="p-4 space-y-4">
        {/* Vendor List */}
        <div className="space-y-4">
          {mockVendors.map((vendor) => (
            <Card 
              key={vendor.id} 
              className={`p-4 shadow-card cursor-pointer transition-all ${
                selectedVendor === vendor.id 
                  ? 'ring-2 ring-primary bg-primary-soft/20' 
                  : 'hover:shadow-floating'
              }`}
              onClick={() => handleVendorSelect(vendor.id)}
            >
              <div className="flex items-start space-x-4">
                {/* Vendor Image */}
                <div className="w-16 h-16 rounded-lg overflow-hidden bg-muted flex-shrink-0">
                  <img 
                    src={vendorIcon} 
                    alt={vendor.name}
                    className="w-full h-full object-cover"
                  />
                </div>

                {/* Vendor Info */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <h3 className="font-bold text-lg text-foreground truncate">
                        {vendor.name}
                      </h3>
                      
                      <div className="flex items-center text-muted-foreground text-sm mb-2">
                        <MapPin className="w-4 h-4 mr-1 flex-shrink-0" />
                        <span className="truncate">{vendor.location}</span>
                      </div>
                    </div>

                    {selectedVendor === vendor.id && (
                      <Badge variant="default" className="ml-2">
                        Selected
                      </Badge>
                    )}
                  </div>

                  {/* Rating and Delivery Time */}
                  <div className="flex items-center space-x-4 mb-3">
                    <div className="flex items-center">
                      <Star className="w-4 h-4 text-warning mr-1" />
                      <span className="text-sm font-medium">{vendor.rating}</span>
                    </div>
                    
                    <div className="flex items-center">
                      <Clock className="w-4 h-4 text-muted-foreground mr-1" />
                      <span className="text-sm text-muted-foreground">{vendor.deliveryTime}</span>
                    </div>
                  </div>

                  {/* Specialties */}
                  <div className="flex flex-wrap gap-2">
                    {vendor.specialties.slice(0, 3).map((specialty, index) => (
                      <Badge key={index} variant="secondary" className="text-xs">
                        {specialty}
                      </Badge>
                    ))}
                    {vendor.specialties.length > 3 && (
                      <Badge variant="secondary" className="text-xs">
                        +{vendor.specialties.length - 3} more
                      </Badge>
                    )}
                  </div>
                </div>
              </div>
            </Card>
          ))}
        </div>

        {/* Continue Button */}
        <div className="sticky bottom-4 pt-4">
          <Button 
            variant="mobile"
            size="mobile"
            className="w-full"
            onClick={handleContinue}
            disabled={!selectedVendor}
          >
            <Truck className="w-5 h-5 mr-2" />
            {t.continue}
          </Button>
        </div>
      </div>
    </div>
  );
};